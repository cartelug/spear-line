import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const pub = resolve(dirname(fileURLToPath(import.meta.url)),"..","public");
const pages = ["index.html", "club.html","vehicles.html","supplies.html","logistics.html","timber-logistics.html","about.html","enquire.html","privacy.html","404.html"];
const read = name => readFile(resolve(pub,name),"utf8");
const exists = async name => access(resolve(pub,name)).then(() => true,() => false);
test("every page has one h1, unique ids, described images and no inline styles",async () => {
  for (const page of pages) {
    const html = await read(page);
    assert.equal((html.match(/<h1[\s>]/g) || []).length,1,page + " h1");
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size,ids.length,page + " duplicate ids");
    for (const tag of html.match(/<img\s[^>]*>/g) || []) assert.match(tag,/\salt="/,page + " img alt: " + tag.slice(0,60));
    for (const tag of html.match(/<img\s[^>]*>/g) || []) assert.match(tag,/\swidth="\d+"[^>]*\sheight="\d+"/,page + " img size: " + tag.slice(0,60));
    assert.doesNotMatch(html,/\sstyle="/,page + " inline style");
    assert.doesNotMatch(html,/<br\s*\/?>/,page + " manual line break");
  }
});
test("local links, scripts, styles, fonts and fragments resolve",async () => {
  for (const page of pages) {
    const html = await read(page), ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    for (const [,ref] of html.matchAll(/(?:href|src)="([^"#?][^"]*)"/g)) {
      if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
      const [file,fragment]=ref.split("#"), target=file.split("?")[0];
      assert.ok(await exists(target),page + " → " + ref);
      if(fragment){const targetHTML=await read(target);assert.ok([...targetHTML.matchAll(/\sid="([^"]+)"/g)].some(m=>m[1]===decodeURIComponent(fragment)),page+" → "+ref);}
    }
    for (const [,frag] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(frag),page + " → #" + frag);
    for (const [,host] of html.matchAll(/(?:href|src|srcset)="https?:\/\/([^/"]+)/g)) assert.equal(host,"images.unsplash.com",page + " loads " + host);
    for(const [,set] of html.matchAll(/srcset="([^"]+)"/g)) for(const item of set.split(",")){const ref=item.trim().split(/\s+/)[0];if(!ref.startsWith("https:"))assert.ok(await exists(ref),page+" responsive image → "+ref);}
  }
  const css = await read("styles.css")+await read("experience.css")+await read("motion.css");
  for (const [,font] of css.matchAll(/url\((assets\/fonts\/[^)]+)\)/g)) assert.ok(await exists(font),font);
});
test("typography is exactly Archivo and Lexend, self-hosted, with no third family",async () => {
  const css = await read("styles.css")+await read("experience.css")+await read("motion.css");
  assert.doesNotMatch(css,/googleapis|gstatic|@import|Source Sans|"Inter"|Georgia|Playfair/i);
  const families = new Set([...css.matchAll(/font-family:"([^"]+)"/g)].map(m => m[1]));
  assert.deepEqual([...families].sort(),["Archivo","Archivo Fallback","Lexend","Lexend Fallback"]);
  assert.match(css,/font-weight:500 800/); assert.match(css,/font-weight:400 600/);
});
test("content is never hidden unless a script has registered its own exit",async () => {
  const css = await read("styles.css")+await read("experience.css")+await read("motion.css");
  const rules = css.replace(/\/\*[\s\S]*?\*\//g,"").split(/(?<=\})/).map(rule => rule.trim()).filter(Boolean);
  for (const rule of rules) {
    const [selector,body = ""] = rule.split("{");
    if (!/opacity:0[;}]|visibility:hidden/.test(body) && !/transform:scale[XY]\(0\)/.test(body)) continue;
    if (/^\s*(from|to|\d+%)\s*$/.test(selector)) continue;
    assert.ok(/html\.(reveal-ready|intro)|\.intro-overlay|\.honey|\.choice-options input|^\s*\[hidden\]|\.menu-|\.site-nav|\.skip|\.thread|\.reading-progress|\.tab-list button::after|\.site-nav li>a::after|@media/.test(selector) || /\.intro-line|\.intro-stack/.test(selector),"unguarded hidden state: " + selector.slice(0,80));
  }
  assert.match(await read("boot.js"),/setTimeout\(exit,\s*2000\)/);
});
test("current services and illustrative imagery are clear without invented claims",async () => {
  for (const page of pages) {
    const html=await read(page);
    for (const destination of ["vehicles.html","supplies.html","logistics.html"]) assert.ok(html.includes('href="'+destination+'"'),page+" → "+destination);
    assert.match(html,/AI-generated imagery illustrates our service areas/);
  }
  assert.match(await read("enquire.html"),/Online submission is not currently open/);
  assert.match(await read("app.js"),/Nothing has been sent to Spear Line/);
  assert.equal(await read("timber-logistics.html"),await read("logistics.html"));
  for (const page of pages) assert.doesNotMatch(await read(page),/in stock|available now|fleet of|guaranteed delivery|testimonial|\bUSD \d{2,3},\d{3}\b(?!–)/i,page);
});
test("the Club is reachable throughout the site and clearly remains coming soon",async()=>{
  for(const page of pages) assert.match(await read(page),/href="club\.html"/,page);
  const club=await read("club.html");
  assert.match(club,/<h1>Spear Line/); assert.match(club,/Coming soon/);
  assert.doesNotMatch(club,/<form\b|Join now|Buy membership|Membership fee/i);
});
