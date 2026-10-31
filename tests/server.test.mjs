import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import http from "node:http";
import { mkdtemp, readdir, readFile, rm, cp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)),"..");
async function freePort() {
  const socket = net.createServer(); socket.listen(0,"127.0.0.1"); await once(socket,"listening");
  const port = socket.address().port; await new Promise((resolve,reject) => socket.close(error => error ? reject(error) : resolve())); return port;
}
async function boot(t,enabled,extraEnv={},cwd=root) {
  const dir = await mkdtemp(resolve(tmpdir(),"spear-line-test-"));
  const port = await freePort(), origin = "http://127.0.0.1:" + port;
  const child = spawn(process.execPath,["server.mjs"],{cwd,env:{...process.env,HOST:"127.0.0.1",PORT:String(port),PUBLIC_ORIGIN:origin,ENQUIRIES_ENABLED:String(enabled),BUSINESS_LEGAL_NAME:"Test Operator",PUBLIC_CONTACT_EMAIL:"test@example.com",PUBLIC_CONTACT_PHONE:"",PUBLIC_WHATSAPP:"",PUBLIC_ADDRESS:"",RETENTION_DAYS:"30",DATA_DIR:dir,NODE_ENV:"test",NOTIFY_WEBHOOK_URL:"",...extraEnv},stdio:["ignore","pipe","pipe"]});
  const exited = new Promise(resolve => child.once("exit",resolve));
  t.after(async () => { if (child.exitCode === null) child.kill("SIGTERM"); await exited; await rm(dir,{recursive:true,force:true}); });
  await new Promise((resolve,reject) => {
    let output = ""; const timeout = setTimeout(() => reject(new Error("Server startup timed out")),10000);
    child.stdout.on("data",data => { output += data.toString(); if (output.includes("Spear Line listening")) { clearTimeout(timeout); resolve(); } });
    child.once("error",error => { clearTimeout(timeout); reject(error); });
    child.once("exit",code => { clearTimeout(timeout); reject(new Error("Server exited: " + code)); });
  });
  return {dir,origin};
}
const vehicle = {service:"vehicle",name:"Test Buyer",contact:"buyer@example.com",model:"Pickup",location:"Kampala",consent:true};
const timber = {service:"timber",name:"Test Customer",contact:"+256700000000",pickup:"Origin town",destination:"Kampala",load:"25 tonnes",timing:"November",consent:true};
test("server serves the site and stores valid requests privately",{timeout:20000},async t => {
  const {origin,dir} = await boot(t,true);
  const post = (body,options={}) => fetch(origin + "/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json",Origin:origin,...options.headers},body:typeof body === "string" ? body : JSON.stringify(body)});
  for (const page of ["/","/bar.html","/vehicles.html","/supplies.html","/logistics.html","/timber-logistics.html","/about.html","/businesses.html","/timber.html","/founders.html","/digital.html","/real-estate.html","/enquire.html","/privacy.html","/how-it-works.html","/faq.html","/contact.html","/favicon.ico","/site.webmanifest","/assets/spear-line-logo.png"]) assert.equal((await fetch(origin+page)).status,200,page);
  const response = await post(vehicle); assert.equal(response.status,201);
  const {reference} = await response.json(); assert.match(reference,/^[a-f0-9-]{36}$/);
  const record = JSON.parse(await readFile(resolve(dir,reference+".json"),"utf8")); assert.equal(record.model,"Pickup"); assert.equal(record.reference,reference);
  assert.equal((await post(timber)).status,201);
  assert.equal((await post({service:"supplies",name:"Test Buyer",contact:"buyer@example.com",products:"Rice",quantity:"100 bags",supplyDestination:"Kampala",supplyTiming:"November",consent:true})).status,201);
  const interest = await post({service:"digital",name:"Test Visitor",contact:"visitor@example.com",digitalNeed:"A company website",consent:true}); assert.equal(interest.status,201);
  const stored = JSON.parse(await readFile(resolve(dir,(await interest.json()).reference+".json"),"utf8")); assert.equal(stored.mode,"interest"); assert.equal(stored.digitalNeed,"A company website");
  assert.equal((await post({service:"digital",name:"Test Visitor",contact:"visitor@example.com",digitalNeed:"",consent:true})).status,422);
  assert.equal((await post({...vehicle,model:""})).status,422);
  assert.equal((await post({...vehicle,consent:false})).status,422);
  assert.equal((await post({...vehicle,website:"spam"})).status,400);
  assert.equal((await post(vehicle,{headers:{Origin:"https://other.example"}})).status,403);
  assert.equal((await post(vehicle,{headers:{"Content-Type":"text/plain"}})).status,415);
  assert.equal((await post("{")).status,400);
  assert.equal((await fetch(origin+"/api/enquiries")).status,405);
  for (const path of ["/data/"+reference+".json","/.env","/server.mjs","/missing-page"]) assert.equal((await fetch(origin+path)).status,404,path);
  assert.equal((await readdir(dir)).length,4);
});
test("preparation mode cannot accept enquiries",{timeout:20000},async t => {
  const {origin,dir} = await boot(t,false);
  const response = await fetch(origin+"/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:JSON.stringify(vehicle)});
  assert.equal(response.status,503); assert.equal((await readdir(dir)).length,0);
  assert.match(await (await fetch(origin+"/site-config.js")).text(),/"enquiriesEnabled":false/);
});
test("fonts, scripts and a strict self-hosted CSP that allows only the page's own inline blocks are served",{timeout:20000},async t => {
  const {origin} = await boot(t,false);
  for (const [path,type] of [["/assets/fonts/mtn-brighter-sans-bold.woff2","font/woff2"],["/assets/fonts/sky-text-regular.woff2","font/woff2"],["/assets/fonts/License-OnlineWebFonts.txt","text/plain"],["/assets/logo.svg","image/svg\\+xml"],["/assets/icons.svg","image/svg\\+xml"],["/assets/favicon.svg","image/svg\\+xml"],["/assets/og-image.jpg","image/jpeg"],["/assets/grain.png","image/png"],["/assets/backdrops/01-hero-road.webp","image/webp"],["/site.webmanifest","application/manifest\\+json"],["/motion.js","text/javascript"],["/site.css","text/css"]]) {
    const response = await fetch(origin + path); assert.equal(response.status,200,path); assert.match(response.headers.get("content-type"),new RegExp(type),path);
  }
  const home = await fetch(origin + "/"), csp = home.headers.get("content-security-policy"), html = await home.text();
  assert.doesNotMatch(csp,/unsafe-inline|unsafe-eval|googleapis|gstatic|data:/); assert.match(csp,/font-src 'self'(;|$)/); assert.match(csp,/img-src 'self';/); assert.doesNotMatch(csp,/unsplash/);
  // Every inline script and style on the page is allowed by its exact hash, and nothing else is.
  const { createHash } = await import("node:crypto"), hash = text => "'sha256-" + createHash("sha256").update(text).digest("base64") + "'";
  const scripts = [...html.matchAll(/<script(?: type="speculationrules")?>([\s\S]*?)<\/script>/g)].map(m => hash(m[1])), styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => hash(m[1]));
  assert.ok(scripts.length === 2 && styles.length === 1, "boot script, speculation rules and critical styles");
  assert.equal(csp.match(/script-src ([^;]*)/)[1], ["'self'", ...scripts].join(" "));
  assert.equal(csp.match(/style-src ([^;]*)/)[1], ["'self'", ...styles].join(" "));
  assert.doesNotMatch(html, /\son[a-z]+="/);
  const missing = await fetch(origin + "/no-such-page"); assert.equal(missing.status,404); assert.match(missing.headers.get("content-security-policy"),/style-src 'self' 'sha256-/);
});
test("generated responsive images are served with the correct type and private files stay inaccessible",{timeout:20000},async t=>{
  const {origin}=await boot(t,false);
  for(const path of ["/assets/visuals/01-hero-road.webp","/assets/visuals/01-hero-road-768.webp","/assets/visuals/05-foodstuffs.webp","/assets/visuals/13-mobile-hero-768.webp","/assets/visuals/01-hero-road-1080.avif"]){
    const response=await fetch(origin+path);assert.equal(response.status,200);assert.equal(response.headers.get("content-type"),path.endsWith(".avif")?"image/avif":"image/webp");
  }
  for(const path of ["/assets/visuals/missing.webp","/visual-prompts.json","/scripts/build.mjs","/content/site.mjs"]) assert.equal((await fetch(origin+path)).status,404);
});

test("text assets are compressed for clients that accept it, and images are not",{timeout:20000},async t=>{
  const {origin} = await boot(t,false);
  const br = await fetch(origin + "/site.css",{headers:{"Accept-Encoding":"br"}});
  assert.equal(br.headers.get("content-encoding"),"br"); assert.equal(br.headers.get("vary"),"Accept-Encoding");
  assert.ok((await br.text()).includes(".hero-veil"),"decoded stylesheet content");
  const gz = await fetch(origin + "/index.html",{headers:{"Accept-Encoding":"gzip"}});
  assert.equal(gz.headers.get("content-encoding"),"gzip"); assert.match(await gz.text(),/<h1/);
  const plain = await fetch(origin + "/site.css",{headers:{"Accept-Encoding":"identity"}});
  assert.equal(plain.headers.get("content-encoding"),null);
  const image = await fetch(origin + "/assets/visuals/01-hero-road.webp",{headers:{"Accept-Encoding":"br, gzip"}});
  assert.equal(image.headers.get("content-encoding"),null);
});

test("health endpoint answers without exposing anything",{timeout:20000},async t=>{
  const {origin}=await boot(t,false);
  const response=await fetch(origin+"/healthz");
  assert.equal(response.status,200); assert.deepEqual(await response.json(),{status:"ok"});
  assert.equal(response.headers.get("cache-control"),"no-store");
  assert.equal((await fetch(origin+"/healthz",{method:"POST"})).status,405);
});
test("a stored enquiry is also posted to the notification webhook, and a failing webhook never blocks the visitor",{timeout:30000},async t=>{
  const received=[]; const mode={status:200};
  const hook=http.createServer((req,res)=>{let body="";req.on("data",d=>body+=d);req.on("end",()=>{received.push({method:req.method,type:req.headers["content-type"],body:JSON.parse(body)});res.writeHead(mode.status);res.end();});});
  await new Promise(resolve=>hook.listen(0,"127.0.0.1",resolve)); t.after(()=>new Promise(resolve=>hook.close(resolve)));
  const {origin}=await boot(t,true,{NOTIFY_WEBHOOK_URL:"http://127.0.0.1:"+hook.address().port+"/enquiries"});
  const post=body=>fetch(origin+"/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:JSON.stringify(body)});
  const first=await post(vehicle); assert.equal(first.status,201); const {reference}=await first.json();
  for(let i=0;i<50&&!received.length;i++) await new Promise(resolve=>setTimeout(resolve,50));
  assert.equal(received.length,1); assert.equal(received[0].method,"POST"); assert.match(received[0].type,/application\/json/);
  assert.equal(received[0].body.enquiry.reference,reference); assert.equal(received[0].body.enquiry.model,"Pickup");
  assert.match(received[0].body.text,/New vehicle enquiry from Test Buyer/);
  mode.status=500;
  assert.equal((await post(timber)).status,201,"visitor still gets a receipt when the webhook rejects");
  const dead=await boot(t,true,{NOTIFY_WEBHOOK_URL:"http://127.0.0.1:9/unreachable"});
  assert.equal((await fetch(dead.origin+"/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json",Origin:dead.origin},body:JSON.stringify(vehicle)})).status,201,"visitor still gets a receipt when the webhook is unreachable");
});
test("production refuses a plain-HTTP notification address",{timeout:20000},async()=>{
  const child=spawn(process.execPath,["server.mjs"],{cwd:root,env:{...process.env,PORT:"39871",NODE_ENV:"production",NOTIFY_WEBHOOK_URL:"http://hooks.example.test/x",DATA_DIR:await mkdtemp(resolve(tmpdir(),"spear-line-hook-"))},stdio:["ignore","pipe","pipe"]});
  let err=""; child.stderr.on("data",d=>err+=d); const [code]=await once(child,"exit");
  assert.notEqual(code,0); assert.match(err,/NOTIFY_WEBHOOK_URL must use HTTPS in production/);
});
test("the files the Dockerfile copies are enough to run the site, answer health checks and purge old enquiries",{timeout:40000},async t=>{
  const dockerfile=await readFile(resolve(root,"Dockerfile"),"utf8");
  const stage=await mkdtemp(resolve(tmpdir(),"spear-line-image-")); t.after(()=>rm(stage,{recursive:true,force:true}));
  const copies=[...dockerfile.matchAll(/^COPY\s+(.+?)\s+(\S+)$/gm)];
  assert.ok(copies.length>=3,"Dockerfile copies the app");
  for(const [,sources,target] of copies){
    for(const source of sources.split(/\s+/)){
      const destination=target.endsWith("/")?resolve(stage,target,source.split("/").pop()):resolve(stage,target);
      await mkdir(dirname(destination),{recursive:true}); await cp(resolve(root,source),destination,{recursive:true});
    }
  }
  const {origin,dir}=await boot(t,true,{NODE_ENV:"production",PUBLIC_ORIGIN:"https://example.test"},stage).catch(error=>{throw error;});
  assert.equal((await fetch(origin+"/healthz")).status,200);
  assert.equal((await fetch(origin+"/")).status,200);
  const old={reference:"00000000-0000-4000-8000-000000000000",receivedAt:"2020-01-01T00:00:00.000Z",service:"vehicle"};
  await writeFile(resolve(dir,old.reference+".json"),JSON.stringify(old)+"\n");
  const purge=spawn(process.execPath,["scripts/purge-enquiries.mjs","--apply"],{cwd:stage,env:{...process.env,RETENTION_DAYS:"30",DATA_DIR:dir},stdio:["ignore","pipe","pipe"]});
  let out=""; purge.stdout.on("data",d=>out+=d); await once(purge,"exit"); assert.match(out,/Deleted 1 expired/);
  assert.ok(!(await readdir(dir)).includes(old.reference+".json"));
});
