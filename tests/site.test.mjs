import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as content from "../content/site.mjs";

const pub = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const pages = ["index.html", "bar.html", "vehicles.html", "supplies.html", "logistics.html", "timber-logistics.html", "about.html", "enquire.html", "privacy.html", "404.html", "how-it-works.html", "faq.html", "contact.html"];
const read = name => readFile(resolve(pub, name), "utf8");
const exists = async name => access(resolve(pub, name)).then(() => true, () => false);
const visibleText = html => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
const css = () => read("site.css");

test("every page has one h1, unique ids, described and sized images, and no inline styles", async () => {
  for (const page of pages) {
    const html = await read(page);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, page + " h1");
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, page + " duplicate ids");
    for (const tag of html.match(/<img\s[^>]*>/g) || []) {
      assert.match(tag, /\salt="/, page + " img alt: " + tag.slice(0, 70));
      assert.match(tag, /\swidth="\d+"[^>]*\sheight="\d+"/, page + " img size: " + tag.slice(0, 70));
    }
    assert.doesNotMatch(html, /\sstyle="/, page + " inline style");
    assert.doesNotMatch(html, /<br\s*\/?>/, page + " manual line break");
    assert.match(html, /<html lang="en"/, page + " language");
  }
});

test("local links, scripts, styles, images, fonts and fragments resolve, with no third-party hosts", async () => {
  for (const page of pages) {
    const html = await read(page), ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    for (const [, ref] of html.matchAll(/(?:href|src)="([^"#?][^"]*)"/g)) {
      if (/^(mailto:|tel:)/.test(ref)) continue;
      assert.doesNotMatch(ref, /^https?:/, page + " loads an external resource: " + ref);
      const [file, fragment] = ref.split("#"), target = file.split("?")[0];
      assert.ok(await exists(target), page + " → " + ref);
      if (fragment && target.endsWith(".html")) { const other = await read(target); assert.ok(other.includes('id="' + decodeURIComponent(fragment) + '"'), page + " → " + ref); }
    }
    for (const [, frag] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(frag), page + " → #" + frag);
    for (const [, set] of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) for (const item of set.split(",")) assert.ok(await exists(item.trim().split(/\s+/)[0]), page + " responsive image → " + item);
  }
  const styles = await css();
  for (const [, asset] of styles.matchAll(/url\((assets\/[^)]+)\)/g)) assert.ok(await exists(asset), "stylesheet asset " + asset);
});

test("typography is Hubot Sans for display and Mona Sans for text, self-hosted with metric-matched fallbacks", async () => {
  const styles = await css();
  assert.doesNotMatch(styles, /googleapis|gstatic|@import/i);
  const families = new Set([...styles.matchAll(/font-family:"([^"]+)"/g)].map(m => m[1]));
  assert.deepEqual([...families].sort(), ["Hubot Fallback", "Hubot Sans", "Mona Fallback", "Mona Sans"]);
  assert.match(styles, /font-family:"Hubot Sans";src:url\(assets\/fonts\/hubot-sans-latin-variable\.woff2\)[^}]*font-weight:200 900;font-stretch:75% 125%/);
  assert.match(styles, /font-family:"Hubot Fallback";src:local\("Arial"\);size-adjust:120\.6%/);
  assert.match(styles, /font-family:"Mona Fallback";src:local\("Arial"\);size-adjust:103\.5%/);
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /rel="preload" href="assets\/fonts\/hubot-sans-latin-variable\.woff2" as="font"/, page);
    assert.match(html, /rel="preload" href="assets\/fonts\/mona-sans-latin-wght\.woff2" as="font"/, page);
  }
});

test("content is never hidden unless a script owns the exit", async () => {
  const styles = (await css()).replace(/\/\*[\s\S]*?\*\//g, "");
  const guard = /html\.(motion-ok|is-preloading|pl-run|pl-exit|menu-open)|\.pl-|\.preloader|^\s*\[hidden\]|\.skip|\.honey|input|\.site-nav|\.nl::after|\.w::after|\.marquee ul\+ul|\.cursor|\[data-tilt\]::after|\.process-frame|\.bar-card::after|\.is-editing|\.form-message:empty|\.faq-list details\.is-filtered/;
  for (const rule of styles.split(/(?<=\})/).map(r => r.trim()).filter(Boolean)) {
    const [selector, body = ""] = rule.split("{");
    if (!/opacity:0[;}]|visibility:hidden|display:none/.test(body)) continue;
    if (/^\s*(from|to|\d+%)/.test(selector) || /@keyframes/.test(selector)) continue;
    if (/display:none/.test(body) && !/opacity:0|visibility:hidden/.test(body) && /\.nav-list a::before|\.(dock|menu-toggle|nav-note|intro-media|process-media|rail-hint|hero-scroll|card-text|waybill-kind)|::-webkit|\.marquee ul\+ul|\.bar-card::after|\.btn-primary|\[hidden\]|\.form-message|is-filtered|\.cursor/.test(selector)) continue;
    assert.ok(guard.test(selector), "unguarded hidden state: " + selector.trim().slice(0, 90));
  }
  const boot = await read("boot.js");
  assert.match(boot, /if \(!root\.classList\.contains\("motion-live"\)\) \{ root\.classList\.remove\("motion-ok"\); root\.classList\.add\("motion-late"\); \}/, "reveal states are lifted if motion never starts");
  assert.match(await read("motion.js"), /if \(root\.classList\.contains\("motion-late"\)\) revealables\.forEach\(el => el\.classList\.add\("is-in"\)\)/, "a late motion module never hides content again");
  assert.match(boot, /setTimeout\(finish, MAX \+ 400\)/, "the preloader has a fail-safe");
  assert.match(await read("motion.js"), /root\.classList\.add\("motion-live"\)/);
});

test("neighbouring sections blend at their seam and the footer picks up the last tone", async () => {
  for (const page of pages) {
    const html = await read(page);
    const tones = [...html.matchAll(/<section class="section tone-(\w+)((?: [\w-]+)*)"/g)].map(m => ({ tone: m[1], cls: m[2] }));
    assert.ok(tones.length >= 2 || page === "404.html", page + " has sections");
    tones.forEach((section, i) => {
      const next = tones[i + 1];
      if (next && next.tone !== section.tone) {
        assert.match(section.cls, new RegExp("\\bto-" + next.tone + "\\b"), page + " section " + i + " blends into " + next.tone);
        assert.match(next.cls, new RegExp("\\bfrom-" + section.tone + "\\b"), page + " section " + (i + 1) + " blends from " + section.tone);
      }
    });
    const last = tones.at(-1)?.tone;
    if (last && last !== "soil") assert.match(html, new RegExp('<footer class="site-footer tone-soil from-' + last + '"'), page + " footer blend");
  }
  const styles = await css();
  for (const tone of ["soil", "umber", "earth", "olive", "dusk", "sand", "bone"]) {
    assert.match(styles, new RegExp("\\.from-" + tone + "\\{--from-c:color-mix\\(in oklab,var\\(--tone-c\\),var\\(--" + tone + "\\)\\)\\}"));
    assert.match(styles, new RegExp("\\.to-" + tone + "\\{--to-c:color-mix\\(in oklab,var\\(--tone-c\\),var\\(--" + tone + "\\)\\)\\}"));
  }
});

test("the preloader assembles the real logo from glyphs that exist, and plays once per tab without Reduce motion", async () => {
  const logo = await read("assets/logo.svg");
  const glyphs = new Set([...logo.matchAll(/<g id="(g-[\w-]+)"/g)].map(m => m[1]));
  assert.equal(glyphs.size, 11, "eleven traced glyphs");
  for (const page of pages) {
    const html = await read(page);
    const used = [...html.matchAll(/class="pl-g pl-(?:top|bottom)" href="assets\/logo\.svg#(g-[\w-]+)"/g)].map(m => m[1]);
    assert.equal(used.length, 11, page + " preloader glyphs");
    for (const id of used) assert.ok(glyphs.has(id), page + " → " + id);
    assert.match(html, /<div class="preloader" aria-hidden="true">/, page);
    assert.match(html, /<use href="assets\/logo\.svg#logo"\/>/, page + " header logo is the vector mark");
  }
  const boot = await read("boot.js");
  assert.match(boot, /sessionStorage\.getItem\(KEY\)/); assert.match(boot, /if \(reduced \|\| seen \|\| document\.visibilityState === "hidden"\) return;/);
  assert.match(boot, /parts\[i\]\.inert = on/, "focus cannot reach the hidden page while the doors are closed");
});

test("services, FAQ and Bar copy come from the content layer", async () => {
  const index = await read("index.html");
  for (const service of content.services) {
    assert.ok(index.includes(`href="${service.slug}.html"`), "home links " + service.slug);
    const page = await read(service.slug + ".html");
    assert.ok(page.includes(service.hero.title.replace(/&/g, "&amp;").replace(/’/g, "’")), service.slug + " hero title");
    for (const item of service.items) assert.ok(page.includes(item.title.replace(/&/g, "&amp;")), service.slug + " item " + item.title);
  }
  const faq = await read("faq.html");
  const questions = content.faq.flatMap(group => group.items);
  assert.equal((faq.match(/<details/g) || []).length, questions.length);
  const bar = await read("bar.html");
  assert.equal((bar.match(/To be announced/g) || []).length, content.bar.share.length);
});

test("optional real-content blocks stay invisible until they have entries", async () => {
  const all = (await Promise.all(pages.map(read))).join("\n");
  const checks = [["inventory", /class="card listing/], ["stats", /class="stats"/], ["testimonials", /class="quotes"/], ["partners", /marquee-partners/], ["team", /class="team"/]];
  for (const [name, pattern] of checks) {
    if (content[name].length === 0) assert.doesNotMatch(all, pattern, name + " renders nothing while empty");
    else assert.match(all, pattern, name + " renders when it has entries");
  }
  if (content.inventory.length === 0) assert.match(await read("vehicles.html"), /Looking for something specific\?/, "vehicles page invites an enquiry instead of listing stock");
});

test("no invented claims, and illustrative imagery is labelled on every page", async () => {
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /AI-generated imagery illustrates our service areas/, page);
    assert.doesNotMatch(visibleText(html), /in stock|available now|fleet of|guaranteed|testimonial|years of experience|\bUSD \d|\$\s?\d|award-winning|trusted by/i, page);
  }
  assert.match(await read("enquire.html"), /Online submission is not currently open/);
  assert.match(await read("app.js"), /Nothing has been sent to Spear Line/);
  assert.equal(await read("timber-logistics.html"), await read("logistics.html"));
});

test("the Bar is reachable everywhere and clearly remains coming soon", async () => {
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /href="bar\.html"/, page);
    assert.doesNotMatch(visibleText(html), /\bClub\b/, page + " still says Club");
  }
  const bar = visibleText(await read("bar.html"));
  assert.match(bar, /Spear Line Bar\./); assert.match(bar, /Coming soon/);
  assert.doesNotMatch(bar, /Join now|Reserve|Book a table|Membership|happy hour|\bopen(s|ing)? (daily|from|at)\b|\d{1,2}\s?(am|pm)\b/i);
});

test("icons, favicons, manifest and share image are present and linked", async () => {
  const sprite = await read("assets/icons.svg"), symbols = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(m => m[1]));
  for (const page of pages) {
    const html = await read(page);
    for (const [, id] of html.matchAll(/assets\/icons\.svg#([a-z0-9-]+)/g)) assert.ok(symbols.has(id), page + " → #" + id);
    for (const ref of ["assets/favicon.svg", "assets/apple-touch-icon.png", "site.webmanifest"]) assert.ok(html.includes(ref), page + " → " + ref);
  }
  for (const file of ["favicon.ico", "assets/favicon-32.png", "assets/icon-192.png", "assets/icon-512.png", "assets/og-image.jpg", "assets/grain.png"]) assert.ok(await exists(file), file);
  const manifest = JSON.parse(await read("site.webmanifest"));
  for (const icon of manifest.icons) assert.ok(await exists(icon.src), icon.src);
});

test("navigation reaches every page, and contact details are never hard-coded", async () => {
  for (const page of pages) {
    const html = await read(page);
    for (const target of ["vehicles.html", "supplies.html", "logistics.html", "how-it-works.html", "faq.html", "contact.html", "about.html", "enquire.html", "privacy.html"]) assert.ok(html.includes('href="' + target + '"'), page + " → " + target);
    assert.match(html, /aria-controls="site-menu"/, page + " menu toggle");
  }
  const contact = await read("contact.html");
  assert.doesNotMatch(contact, /mailto:|tel:|wa\.me|\+\d{6,}|@[a-z0-9-]+\.[a-z]{2,}/i);
  for (const hook of ["data-contact-email", "data-contact-phone", "data-contact-whatsapp", "data-address", "data-contact-empty"]) assert.ok(contact.includes(hook), hook);
});

test("pages stay out of search results until a launch origin is supplied", async () => {
  for (const page of pages) assert.match(await read(page), /<meta name="robots" content="noindex,nofollow">/, page);
  assert.match(await read("robots.txt"), /Disallow: \//);
  assert.equal(await exists("sitemap.xml"), false);
});

test("motion respects Reduce motion and pauses what is offscreen", async () => {
  const motion = await read("motion.js"), styles = await css();
  assert.match(motion, /reduced\(\)/); assert.match(motion, /spear-line-motion/); assert.match(motion, /is-paused/);
  assert.match(motion, /fine = matchMedia\("\(hover:hover\) and \(pointer:fine\)"\)/, "pointer effects only for fine pointers");
  assert.match(styles, /html\.motion-reduced \*,html\.motion-reduced \*::before,html\.motion-reduced \*::after\{animation:none!important/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /html\.motion-ok \.is-paused img,html\.motion-ok \.is-paused\{animation-play-state:paused\}/);
});

test("pages load one bundled stylesheet built from src/styles", async () => {
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /href="site\.css\?v=[\d.]+"/, page);
    assert.equal((html.match(/rel="stylesheet"/g) || []).length, 1, page + " one stylesheet");
  }
  const styles = await css();
  for (const marker of [".hero-veil", ".bento", ".route-stage", ".process-media", ".waybill", ".preloader", ".bar-card", ".form-card"]) assert.ok(styles.includes(marker), marker);
});

test("the design avoids template tells: accent words, eyebrow labels, dot-joined strings, arrow glyphs and tracked caps", async () => {
  for (const page of pages) {
    const html = await read(page);
    assert.doesNotMatch(html, /<em>/, page + " accent word");
    assert.doesNotMatch(html, /class="eyebrow/, page + " eyebrow label");
    assert.doesNotMatch(visibleText(html), /\s·\s|↗|→|←/, page + " separator or arrow glyph");
  }
  assert.doesNotMatch(await css(), /text-transform:uppercase/, "no uppercase labels");
});

test("the homepage enquiry note starts an enquiry with the chosen service and destination", async () => {
  const html = await read("index.html");
  assert.match(html, /<form class="waybill glass" action="enquire\.html" method="get"/);
  for (const service of ["vehicle", "supplies", "logistics"]) assert.match(html, new RegExp('name="service" value="' + service + '"'));
  assert.match(html, /name="destination"[^>]*maxlength="120"/);
  const app = await read("app.js");
  assert.match(app, /get\("destination"\)/); assert.match(app, /supplyDestination/);
});
