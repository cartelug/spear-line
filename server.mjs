import http from "node:http";
import { readFile, mkdir, appendFile, realpath, stat } from "node:fs/promises";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, createHash } from "node:crypto";
import { gzipSync, brotliCompressSync, constants as zlibConstants } from "node:zlib";
import { validateEnquiry } from "./public/validation.js";
import { publicFiles } from "./scripts/site-manifest.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const publicRoot = await realpath(resolve(root,"public"));
const enabled = process.env.ENQUIRIES_ENABLED === "true";
const origin = process.env.PUBLIC_ORIGIN || "http://localhost:3000";
function cliOption(name,fallback) { const index=process.argv.indexOf(name); return index>=0 && process.argv[index+1] ? process.argv[index+1] : fallback; }
const port = Number(cliOption("--port",process.env.PORT || 3000));
const host = cliOption("--host",process.env.HOST || "127.0.0.1");
const retentionDays = Number(process.env.RETENTION_DAYS || 0);
const config = {
  enquiriesEnabled: enabled,
  legalName: process.env.BUSINESS_LEGAL_NAME?.trim() || "",
  email: process.env.PUBLIC_CONTACT_EMAIL?.trim() || "",
  phone: process.env.PUBLIC_CONTACT_PHONE?.trim() || "",
  whatsapp: process.env.PUBLIC_WHATSAPP?.trim() || "",
  address: process.env.PUBLIC_ADDRESS?.trim() || "",
  retentionDays
};
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be between 1 and 65535.");
// Optional owner notification: each stored enquiry is also POSTed as JSON to this address (a chat or automation webhook).
const notifyUrl = process.env.NOTIFY_WEBHOOK_URL?.trim() || "";
if (notifyUrl) {
  let parsed; try { parsed = new URL(notifyUrl); } catch { throw new Error("NOTIFY_WEBHOOK_URL must be a valid URL."); }
  if (!["https:","http:"].includes(parsed.protocol)) throw new Error("NOTIFY_WEBHOOK_URL must use http or https.");
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("NOTIFY_WEBHOOK_URL must use HTTPS in production.");
}
const parsedOrigin = new URL(origin);
if (!["http:","https:"].includes(parsedOrigin.protocol) || parsedOrigin.origin !== origin) throw new Error("PUBLIC_ORIGIN must be an origin without a trailing slash or path.");
if (enabled && (!config.legalName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email) || !Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650)) throw new Error("Enabling enquiries requires BUSINESS_LEGAL_NAME, PUBLIC_CONTACT_EMAIL and RETENTION_DAYS (1–3650).");
if (enabled && process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "https:") throw new Error("Production enquiries require an HTTPS PUBLIC_ORIGIN.");
const dataRoot = resolve(root,process.env.DATA_DIR || "data");
await mkdir(dataRoot,{recursive:true,mode:0o700});
const actualDataRoot = await realpath(dataRoot);
if (actualDataRoot === publicRoot || actualDataRoot.startsWith(publicRoot + sep)) throw new Error("DATA_DIR must be outside public/.");
const allowedFiles = new Set(await publicFiles(publicRoot));
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2",".txt":"text/plain; charset=utf-8",".svg":"image/svg+xml",".ico":"image/x-icon",".xml":"application/xml; charset=utf-8",".webmanifest":"application/manifest+json; charset=utf-8",".jpg":"image/jpeg",".avif":"image/avif"};
const compressible = new Set([".html",".css",".js",".svg",".xml",".txt",".webmanifest"]);
const compressedCache = new Map();
function pickEncoding(header = "") {
  const accepted = String(header).toLowerCase();
  if (/\bbr\b/.test(accepted)) return "br";
  if (/\bgzip\b/.test(accepted)) return "gzip";
  return "";
}
function compressed(key,body,encoding) {
  if (!compressedCache.has(key)) {
    compressedCache.set(key,encoding === "br" ? brotliCompressSync(body,{params:{[zlibConstants.BROTLI_PARAM_QUALITY]:11,[zlibConstants.BROTLI_PARAM_SIZE_HINT]:body.length}}) : gzipSync(body,{level:9}));
    if (compressedCache.size > 300) compressedCache.delete(compressedCache.keys().next().value);
  }
  return compressedCache.get(key);
}
const rate = new Map();
const cleanup = setInterval(() => { for (const [key,value] of rate) if (Date.now() > value.expires) rate.delete(key); },60000);
cleanup.unref();
function headers(res) {
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options","SAMEORIGIN");
  res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  res.setHeader("Content-Security-Policy",policy());
}
// Pages inline their boot script, first-screen styles and speculation rules. The policy allows exactly those blocks
// by hash, so no other inline code can run. Hashes are computed from each page as it is served.
function policy(scripts = "",styles = "") {
  return "default-src 'self'; script-src 'self'" + scripts + "; style-src 'self'" + styles + "; font-src 'self'; img-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'";
}
const pagePolicies = new Map();
function pagePolicy(key,html) {
  if (pagePolicies.has(key)) return pagePolicies.get(key);
  const hash = text => " 'sha256-" + createHash("sha256").update(text).digest("base64") + "'";
  let scripts = "", styles = "";
  for (const [,attributes,body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) if (!/\bsrc=/.test(attributes) && !/application\/ld\+json/.test(attributes)) scripts += hash(body);
  for (const [,body] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) styles += hash(body);
  const value = policy(scripts,styles);
  pagePolicies.set(key,value);
  return value;
}
function json(res,status,body) {
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});
  res.end(JSON.stringify(body));
}
async function readBody(req) {
  let length = 0; const chunks = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 16384) { const error = new Error("Request too large."); error.status = 413; throw error; }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { const error = new Error("Invalid JSON."); error.status = 400; throw error; }
}
const labels = {vehicle:"vehicle",supplies:"supplies",logistics:"logistics",construction:"building supplies (interest)",property:"property (interest)",fitness:"fitness and wellness (interest)",hospitality:"hospitality (interest)",digital:"digital services (interest)"};
async function notify(record) {
  if (!notifyUrl) return;
  const text = "New " + (labels[record.service] || "website") + " enquiry from " + record.name + " (" + record.contact + "). Reference " + record.reference + ".";
  try {
    const response = await fetch(notifyUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,enquiry:record}),signal:AbortSignal.timeout(5000)});
    if (!response.ok) console.warn("Enquiry notification was rejected:",response.status,record.reference);
  } catch (error) {
    console.warn("Enquiry notification failed:",error.name,record.reference);
  }
}
async function submit(req,res) {
  if (!enabled) return json(res,503,{message:"Online enquiries are not enabled. Please prepare your enquiry and use the published contact details."});
  if (req.headers.origin !== origin) return json(res,403,{message:"Please submit your enquiry from the Spear Line website."});
  if (!/^application\/json(?:;|$)/i.test(req.headers["content-type"] || "")) return json(res,415,{message:"This endpoint accepts JSON."});
  const ip = req.socket.remoteAddress || "unknown";
  let entry = rate.get(ip);
  if (!entry || Date.now() > entry.expires) {
    if (rate.size >= 10000) return json(res,503,{message:"Please try again shortly."});
    entry = {count:0,expires:Date.now() + 600000}; rate.set(ip,entry);
  }
  entry.count++;
  if (entry.count > 10) { res.setHeader("Retry-After",String(Math.ceil((entry.expires - Date.now())/1000))); return json(res,429,{message:"Too many attempts. Please wait a few minutes before trying again."}); }
  const body = await readBody(req);
  if (body?.website) return json(res,400,{message:"Please leave the website field empty."});
  const checked = validateEnquiry(body);
  if (!checked.ok) return json(res,422,{message:"Please check your enquiry.",errors:checked.errors});
  const reference = randomUUID();
  const record = {reference,receivedAt:new Date().toISOString(),...checked.value};
  // One private file per enquiry avoids append/purge races and supports targeted deletion.
  await appendFile(resolve(actualDataRoot,reference + ".json"),JSON.stringify(record) + "\n",{encoding:"utf8",flag:"wx",mode:0o600,flush:true});
  console.info("Enquiry stored:",reference);
  void notify(record);
  return json(res,201,{reference});
}
// Versioned scripts and styles never change at the same address; fonts and photographs rarely do; pages are revalidated.
function cacheControl(file,url) {
  if (file.endsWith(".html") || file === "sw.js" || file === "site.webmanifest") return "no-cache";
  if (url.searchParams.has("v")) return "public, max-age=31536000, immutable";
  if (file.startsWith("assets/fonts/")) return "public, max-age=2592000";
  if (file.startsWith("assets/")) return "public, max-age=604800, stale-while-revalidate=86400";
  return "public, max-age=3600";
}
const server = http.createServer(async (req,res) => {
  headers(res);
  try {
    const url = new URL(req.url,"http://localhost");
    if (url.pathname === "/api/enquiries") {
      if (req.method !== "POST") { res.setHeader("Allow","POST"); return json(res,405,{message:"Method not allowed."}); }
      return await submit(req,res);
    }
    if (!["GET","HEAD"].includes(req.method)) { res.setHeader("Allow","GET, HEAD"); return json(res,405,{message:"Method not allowed."}); }
    if (url.pathname === "/healthz") {
      res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});
      return res.end(req.method === "HEAD" ? "" : JSON.stringify({status:"ok"}));
    }
    if (url.pathname === "/site-config.js") {
      res.writeHead(200,{"Content-Type":"text/javascript; charset=utf-8","Cache-Control":"no-store"});
      return res.end(req.method === "HEAD" ? "" : "window.SPEAR_CONFIG=Object.freeze(" + JSON.stringify(config).replace(/</g,"\\u003c") + ");");
    }
    let requested;
    try { requested = decodeURIComponent(url.pathname).replace(/^\/+/,"") || "index.html"; }
    catch { return json(res,400,{message:"Invalid path."}); }
    if (requested.includes("\0") || requested.includes("\\") || !allowedFiles.has(requested)) {
      const page = await readFile(resolve(publicRoot,"404.html"));
      res.writeHead(404,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Content-Security-Policy":pagePolicy("404|" + page.length,page.toString("utf8"))});
      return res.end(req.method === "HEAD" ? "" : page);
    }
    const path = await realpath(resolve(publicRoot,requested));
    if (!path.startsWith(publicRoot + sep)) return json(res,403,{message:"Forbidden."});
    const metadata = await stat(path);
    if (!metadata.isFile()) return json(res,404,{message:"Not found."});
    const headers = {"Content-Type":mime[extname(path)] || "application/octet-stream","Cache-Control":cacheControl(requested,url),"Vary":"Accept-Encoding","ETag":'W/"' + metadata.size.toString(36) + "-" + Math.round(metadata.mtimeMs).toString(36) + '"'};
    let body = await readFile(path);
    // Set before any 304, because a revalidation response replaces the stored headers, including this policy.
    if (extname(path) === ".html") res.setHeader("Content-Security-Policy",pagePolicy(path + "|" + metadata.mtimeMs,body.toString("utf8")));
    if (req.headers["if-none-match"] === headers.ETag) { res.writeHead(304,{"Cache-Control":headers["Cache-Control"],"ETag":headers.ETag,"Vary":"Accept-Encoding"}); return res.end(); }
    const encoding = compressible.has(extname(path)) && body.length > 512 ? pickEncoding(req.headers["accept-encoding"]) : "";
    if (encoding) { body = compressed(path + "|" + metadata.mtimeMs + "|" + encoding,body,encoding); headers["Content-Encoding"] = encoding; }
    headers["Content-Length"] = body.length;
    res.writeHead(200,headers);
    res.end(req.method === "HEAD" ? "" : body);
  } catch (error) {
    console.error("Request failed:",error.status || 500);
    if (!res.headersSent) json(res,error.status || 500,{message:error.status ? error.message : "Your request could not be completed. Please try again."});
    else res.end();
  }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(port,host,() => console.info("Spear Line listening on http://" + host + ":" + port + " (enquiries " + (enabled ? "enabled" : "disabled") + ")."));
function shutdown() { server.close(() => process.exit(0)); setTimeout(() => process.exit(1),10000).unref(); }
process.on("SIGTERM",shutdown); process.on("SIGINT",shutdown);
