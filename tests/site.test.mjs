import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const pub = resolve(dirname(fileURLToPath(import.meta.url)),"..","public");
const pages = ["index.html","vehicles.html","timber-logistics.html","about.html","enquire.html","privacy.html","404.html"];
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
      assert.ok(await exists(ref.split("?")[0]),page + " → " + ref);
    }
    for (const [,frag] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(frag),page + " → #" + frag);
    for (const [,host] of html.matchAll(/(?:href|src|srcset)="https?:\/\/([^/"]+)/g)) assert.equal(host,"images.unsplash.com",page + " loads " + host);
  }
  const css = await read("styles.css");
  for (const [,font] of css.matchAll(/url\((assets\/fonts\/[^)]+)\)/g)) assert.ok(await exists(font),font);
});
test("typography is exactly Archivo and Lexend, self-hosted, with no third family",async () => {
  const css = await read("styles.css");
  assert.doesNotMatch(css,/googleapis|gstatic|@import|Source Sans|"Inter"|Georgia|Playfair/i);
  const families = new Set([...css.matchAll(/font-family:"([^"]+)"/g)].map(m => m[1]));
  assert.deepEqual([...families].sort(),["Archivo","Archivo Fallback","Lexend","Lexend Fallback"]);
  assert.match(css,/font-weight:500 800/); assert.match(css,/font-weight:400 600/);
});
test("content is never hidden unless a script has registered its own exit",async () => {
  const css = await read("styles.css");
  const rules = css.replace(/\/\*[\s\S]*?\*\//g,"").split(/(?<=\})/).map(rule => rule.trim()).filter(Boolean);
  for (const rule of rules) {
    const [selector,body = ""] = rule.split("{");
    if (!/opacity:0[;}]|visibility:hidden/.test(body) && !/transform:scale[XY]\(0\)/.test(body)) continue;
    if (/^\s*(from|to|\d+%)\s*$/.test(selector)) continue;
    assert.ok(/html\.(reveal-ready|intro)|\.intro-overlay|\.honey|\.choice-options input|^\s*\[hidden\]|\.menu-|\.site-nav|\.skip|\.thread|@media/.test(selector) || /\.intro-line|\.intro-stack/.test(selector),"unguarded hidden state: " + selector.slice(0,80));
  }
  assert.match(await read("boot.js"),/setTimeout\(exit,\s*2000\)/);
});
test("future plans are labelled and enquiry copy does not claim a static send",async () => {
  for (const page of ["index.html","about.html"]) assert.match(await read(page),/Future (direction|plan)[^<]*(Not yet available|plan)/,page);
  for (const page of ["index.html","vehicles.html"]) assert.match(await read(page),/nothing is submitted to Spear Line until it is/,page);
  const about = await read("about.html");
  for (const text of ["Kampala","Dubai","South Sudan","warehousing","Agriculture"]) assert.ok(about.includes(text),text);
  for (const page of pages) assert.doesNotMatch(await read(page),/in stock|available now|fleet of|guaranteed delivery|testimonial|\bUSD \d{2,3},\d{3}\b(?!–)/i,page);
});
