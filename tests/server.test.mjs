import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)),"..");
async function freePort() {
  const socket = net.createServer(); socket.listen(0,"127.0.0.1"); await once(socket,"listening");
  const port = socket.address().port; await new Promise((resolve,reject) => socket.close(error => error ? reject(error) : resolve())); return port;
}
async function boot(t,enabled) {
  const dir = await mkdtemp(resolve(tmpdir(),"spear-line-test-"));
  const port = await freePort(), origin = "http://127.0.0.1:" + port;
  const child = spawn(process.execPath,["server.mjs"],{cwd:root,env:{...process.env,HOST:"127.0.0.1",PORT:String(port),PUBLIC_ORIGIN:origin,ENQUIRIES_ENABLED:String(enabled),BUSINESS_LEGAL_NAME:"Test Operator",PUBLIC_CONTACT_EMAIL:"test@example.com",PUBLIC_CONTACT_PHONE:"",PUBLIC_WHATSAPP:"",PUBLIC_ADDRESS:"",RETENTION_DAYS:"30",DATA_DIR:dir,NODE_ENV:"test"},stdio:["ignore","pipe","pipe"]});
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
  for (const page of ["/","/bar.html","/vehicles.html","/supplies.html","/logistics.html","/timber-logistics.html","/about.html","/enquire.html","/privacy.html","/how-it-works.html","/faq.html","/contact.html","/favicon.ico","/site.webmanifest","/assets/spear-line-logo.png"]) assert.equal((await fetch(origin+page)).status,200,page);
  const response = await post(vehicle); assert.equal(response.status,201);
  const {reference} = await response.json(); assert.match(reference,/^[a-f0-9-]{36}$/);
  const record = JSON.parse(await readFile(resolve(dir,reference+".json"),"utf8")); assert.equal(record.model,"Pickup"); assert.equal(record.reference,reference);
  assert.equal((await post(timber)).status,201);
  assert.equal((await post({service:"supplies",name:"Test Buyer",contact:"buyer@example.com",products:"Rice",quantity:"100 bags",supplyDestination:"Kampala",supplyTiming:"November",consent:true})).status,201);
  assert.equal((await post({...vehicle,model:""})).status,422);
  assert.equal((await post({...vehicle,consent:false})).status,422);
  assert.equal((await post({...vehicle,website:"spam"})).status,400);
  assert.equal((await post(vehicle,{headers:{Origin:"https://other.example"}})).status,403);
  assert.equal((await post(vehicle,{headers:{"Content-Type":"text/plain"}})).status,415);
  assert.equal((await post("{")).status,400);
  assert.equal((await fetch(origin+"/api/enquiries")).status,405);
  for (const path of ["/data/"+reference+".json","/.env","/server.mjs","/missing-page"]) assert.equal((await fetch(origin+path)).status,404,path);
  assert.equal((await readdir(dir)).length,3);
});
test("preparation mode cannot accept enquiries",{timeout:20000},async t => {
  const {origin,dir} = await boot(t,false);
  const response = await fetch(origin+"/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:JSON.stringify(vehicle)});
  assert.equal(response.status,503); assert.equal((await readdir(dir)).length,0);
  assert.match(await (await fetch(origin+"/site-config.js")).text(),/"enquiriesEnabled":false/);
});
test("fonts, boot script and a strict self-hosted CSP are served",{timeout:20000},async t => {
  const {origin} = await boot(t,false);
  for (const [path,type] of [["/assets/fonts/bricolage-grotesque-latin-opsz-normal.woff2","font/woff2"],["/assets/fonts/instrument-sans-latin-wght-normal.woff2","font/woff2"],["/assets/fonts/fraunces-latin-wght-italic.woff2","font/woff2"],["/assets/icons.svg","image/svg\\+xml"],["/assets/favicon.svg","image/svg\\+xml"],["/assets/og-image.jpg","image/jpeg"],["/site.webmanifest","application/manifest\\+json"],["/fx.js","text/javascript"],["/pro.css","text/css"],["/assets/fonts/OFL.txt","text/plain"],["/boot.js","text/javascript"],["/motion.js","text/javascript"],["/motion.css","text/css"],["/experience.css","text/css"]]) {
    const response = await fetch(origin + path); assert.equal(response.status,200,path); assert.match(response.headers.get("content-type"),new RegExp(type),path);
  }
  const csp = (await fetch(origin + "/")).headers.get("content-security-policy");
  assert.doesNotMatch(csp,/unsafe-inline|googleapis|gstatic|data:/); assert.match(csp,/font-src 'self'(;|$)/); assert.match(csp,/img-src 'self';/); assert.doesNotMatch(csp,/unsplash/);
});
test("generated responsive images are served with the correct type and private files stay inaccessible",{timeout:20000},async t=>{
  const {origin}=await boot(t,false);
  for(const path of ["/assets/visuals/01-hero-road.webp","/assets/visuals/01-hero-road-768.webp","/assets/visuals/05-foodstuffs.webp","/assets/visuals/13-mobile-hero.webp"]){
    const response=await fetch(origin+path);assert.equal(response.status,200);assert.equal(response.headers.get("content-type"),"image/webp");
  }
  for(const path of ["/assets/visuals/missing.webp","/visual-prompts.json","/scripts/render-pages.mjs"]) assert.equal((await fetch(origin+path)).status,404);
});
