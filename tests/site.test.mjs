import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const pub = resolve(dirname(fileURLToPath(import.meta.url)),"..","public");
const pages = ["index.html", "bar.html","vehicles.html","supplies.html","logistics.html","timber-logistics.html","about.html","enquire.html","privacy.html","404.html","how-it-works.html","faq.html","contact.html"];
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
    for (const [,host] of html.matchAll(/(?:href|src|srcset)="https?:\/\/([^/"]+)/g)) assert.fail(page + " loads " + host);
    for(const [,set] of html.matchAll(/srcset="([^"]+)"/g)) for(const item of set.split(",")){const ref=item.trim().split(/\s+/)[0];if(!ref.startsWith("https:"))assert.ok(await exists(ref),page+" responsive image → "+ref);}
  }
  const css = await read("styles.css")+await read("experience.css")+await read("motion.css")+await read("pro.css");
  for (const [,font] of css.matchAll(/url\((assets\/fonts\/[^)]+)\)/g)) assert.ok(await exists(font),font);
});
test("typography is exactly Bricolage Grotesque, Instrument Sans and the Fraunces accent, self-hosted",async () => {
  const css = await read("styles.css")+await read("experience.css")+await read("motion.css")+await read("pro.css");
  assert.doesNotMatch(css,/googleapis|gstatic|@import|Source Sans|"Inter"|Playfair|Archivo|Lexend/i);
  const families = new Set([...css.matchAll(/font-family:"([^"]+)"/g)].map(m => m[1]));
  assert.deepEqual([...families].sort(),["Bricolage Fallback","Bricolage Grotesque","Fraunces","Fraunces Fallback","Instrument Fallback","Instrument Sans"]);
  assert.match(css,/font-weight:200 800/); assert.match(css,/font-weight:400 700/); assert.match(css,/font-weight:100 900/);
});
test("content is never hidden unless a script has registered its own exit",async () => {
  const css = await read("styles.css")+await read("experience.css")+await read("motion.css")+await read("pro.css");
  const rules = css.replace(/\/\*[\s\S]*?\*\//g,"").split(/(?<=\})/).map(rule => rule.trim()).filter(Boolean);
  for (const rule of rules) {
    const [selector,body = ""] = rule.split("{");
    if (!/opacity:0[;}]|visibility:hidden/.test(body) && !/transform:scale[XY]\(0\)/.test(body)) continue;
    if (/^\s*(from|to|\d+%)\s*$/.test(selector)) continue;
    assert.ok(/html\.(reveal-ready|intro|fx-ready)|\.intro-overlay|\.honey|\.choice-options input|^\s*\[hidden\]|\.menu-|\.site-nav|\.skip|\.thread|\.reading-progress|\.tab-list button::after|\.site-nav li>a::after|@media/.test(selector) || /\.intro-line|\.intro-stack/.test(selector),"unguarded hidden state: " + selector.slice(0,80));
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
test("the Bar is reachable throughout the site and clearly remains coming soon",async()=>{
  for(const page of pages) assert.match(await read(page),/href="bar\.html"/,page);
  const bar=await read("bar.html");
  assert.match(bar,/<h1>Spear Line/); assert.match(bar,/<em>Bar\.<\/em>/); assert.match(bar,/Coming soon/);
  assert.doesNotMatch(bar,/<form\b|Join now|Reserve|Book a table|Membership/i);
  assert.doesNotMatch(bar,/\bopen(s|ing)? (daily|from|at|on)\b|happy hour|\$\s?\d|\d{1,2}\s?(am|pm)\b/i,"no invented hours or prices");
  assert.equal((bar.match(/To be announced/g)||[]).length,3);
  for(const page of pages) assert.doesNotMatch(await read(page),/\bClub\b/,page+" still says Club");
});

test("every icon reference resolves to a symbol in the sprite",async()=>{
  const sprite=await read("assets/icons.svg"), symbols=new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(m=>m[1]));
  assert.ok(symbols.size>=15,"icon set size");
  for(const page of pages) for(const [,id] of (await read(page)).matchAll(/assets\/icons\.svg#([a-z0-9-]+)/g)) assert.ok(symbols.has(id),page+" → #"+id);
});
test("favicons, app icons, manifest and share image are present and linked",async()=>{
  for(const file of ["favicon.ico","site.webmanifest","assets/favicon.svg","assets/favicon-32.png","assets/apple-touch-icon.png","assets/icon-192.png","assets/icon-512.png","assets/og-image.jpg","assets/spear-mark.svg"]) assert.ok(await exists(file),file);
  const manifest=JSON.parse(await read("site.webmanifest"));
  for(const icon of manifest.icons) assert.ok(await exists(icon.src),icon.src);
  for(const page of pages){const html=await read(page);for(const ref of ['assets/favicon.svg','assets/apple-touch-icon.png','site.webmanifest'])assert.ok(html.includes(ref),page+" → "+ref);}
});
test("new pages are linked from the navigation and footer, with no invented contact details",async()=>{
  for(const page of pages) for(const target of ["how-it-works.html","faq.html","contact.html"]) assert.ok((await read(page)).includes('href="'+target+'"'),page+" → "+target);
  const contact=await read("contact.html");
  assert.doesNotMatch(contact,/mailto:|tel:|wa\.me|\+\d{6,}|@[a-z0-9-]+\.[a-z]{2,}/i);
  for(const hook of ["data-contact-email","data-contact-phone","data-contact-whatsapp","data-address","data-contact-empty"]) assert.ok(contact.includes(hook),hook);
});
test("pages stay out of search results until a launch origin is supplied",async()=>{
  for(const page of pages) assert.match(await read(page),/<meta name="robots" content="noindex,nofollow">/,page);
  assert.match(await read("robots.txt"),/Disallow: \//);
  assert.equal(await exists("sitemap.xml"),false);
});
test("the motion layer respects the reduce preference and avoids unbounded work",async()=>{
  const fx=await read("fx.js"), css=await read("pro.css");
  assert.match(fx,/reduced\(\)/); assert.match(fx,/spear:motion-preference/); assert.match(fx,/pointerType==='touch'/);
  assert.match(css,/html\.motion-reduced \.ticker-track\{animation:none\}/); assert.match(css,/prefers-reduced-motion:reduce/);
});

test("pages load one bundled stylesheet that matches its sources",async()=>{
  for(const page of pages){const html=await read(page);assert.match(html,/href="site\.css\?v=[\d.]+"/,page);assert.doesNotMatch(html,/href="(styles|experience|motion|pro)\.css/,page);}
  const bundle=await read("site.css");
  for(const marker of [".service-panel",".bar-hero",".ticker-track",".timeline-line"]) assert.ok(bundle.includes(marker),marker);
});
