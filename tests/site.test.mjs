import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as content from "../content/site.mjs";

const pub = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const pages = ["index.html", "bar.html", "vehicles.html", "supplies.html", "logistics.html", "timber-logistics.html", "about.html", "enquire.html", "privacy.html", "404.html", "how-it-works.html", "faq.html", "contact.html", "businesses.html", "trade-supply.html", "lifestyle-property.html", "founders.html", "timber.html", "building-supplies.html", "fitness-wellness.html", "real-estate.html", "hospitality.html", "digital.html"];
const read = name => readFile(resolve(pub, name), "utf8");
const exists = async name => access(resolve(pub, name)).then(() => true, () => false);
const visibleText = html => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
const css = () => read("site.css");
const bootSource = () => readFile(resolve(pub, "..", "src", "boot.js"), "utf8");

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
      // The only outbound links are the font and icon credits the licence asks for; nothing external is loaded.
      if (/^https:\/\/www\.onlinewebfonts\.com(\/icon)?$/.test(ref)) { assert.ok(html.includes(`<a href="${ref}">`), page + " credit is a plain link"); continue; }
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

test("typography is MTN Brighter Sans Bold for display and bold runs and Sky Text for reading, self-hosted with metric-matched fallbacks and credited", async () => {
  const styles = await css();
  assert.doesNotMatch(styles, /googleapis|gstatic|@import/i);
  const families = new Set([...styles.matchAll(/font-family:"([^"]+)"/g)].map(m => m[1]));
  assert.deepEqual([...families].sort(), ["Display Fallback", "Spear Display", "Spear Text", "Text Fallback"]);
  assert.match(styles, /font-family:"Spear Display";src:url\(assets\/fonts\/mtn-brighter-sans-bold\.woff2\)[^}]*font-weight:100 900/);
  assert.match(styles, /font-family:"Spear Text";src:url\(assets\/fonts\/sky-text-regular\.woff2\)[^}]*font-weight:100 500/);
  assert.match(styles, /font-family:"Spear Text";src:url\(assets\/fonts\/mtn-brighter-sans-bold\.woff2\)[^}]*font-weight:600 900/, "bold text uses the real bold face");
  assert.match(styles, /font-family:"Text Fallback";src:local\("Arial"\);font-weight:100 500;size-adjust:92\.7%/);
  assert.match(styles, /font-synthesis:none/);
  assert.ok(await exists("assets/fonts/License-OnlineWebFonts.txt"));
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /rel="preload" href="assets\/fonts\/mtn-brighter-sans-bold\.woff2" as="font"/, page);
    assert.match(html, /rel="preload" href="assets\/fonts\/sky-text-regular\.woff2" as="font"/, page);
    assert.ok(html.includes('Fonts made from <a href="https://www.onlinewebfonts.com">Web Fonts</a> is licensed by CC BY 4.0'), page + " font credit");
    assert.ok(html.includes('Icons made from <a href="https://www.onlinewebfonts.com/icon">svg icons</a> is licensed by CC BY 4.0'), page + " icon credit");
  }
});

test("content is never hidden unless a script owns the exit", async () => {
  const styles = (await css()).replace(/\/\*[\s\S]*?\*\//g, "");
  const guard = /html\.(motion-ok|is-preloading|pl-run|pl-exit|menu-open|is-scrolling)|\.pl-|\.preloader|^\s*\[hidden\]|\.skip|\.honey|input|\.site-nav|\.nl::after|\.w::after|\.marquee ul\+ul|\.cursor|\[data-tilt\]::after|\.process-frame|\.bar-card::after|\.is-editing|\.form-message:empty|\.faq-list details\.is-filtered/;
  for (const rule of styles.split(/(?<=\})/).map(r => r.trim()).filter(Boolean)) {
    const [selector, body = ""] = rule.split("{");
    if (!/opacity:0[;}]|visibility:hidden|display:none/.test(body)) continue;
    if (/^\s*(from|to|\d+%)/.test(selector) || /@keyframes/.test(selector)) continue;
    if (/display:none/.test(body) && !/opacity:0|visibility:hidden/.test(body) && /\.nav-list a::before|\.(dock|menu-toggle|nav-note|intro-media|process-media|rail-hint|hero-scroll|card-text|waybill-kind)|::-webkit|\.marquee ul\+ul|\.bar-card::after|\.btn-primary|\[hidden\]|\.form-message|is-filtered|\.cursor/.test(selector)) continue;
    assert.ok(guard.test(selector), "unguarded hidden state: " + selector.trim().slice(0, 90));
  }
  const boot = await bootSource();
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
  const boot = await bootSource();
  assert.match(boot, /sessionStorage\.getItem\(KEY\)/); assert.match(boot, /if \(reduced \|\| seen \|\| document\.visibilityState === "hidden"\) return;/);
  assert.match(boot, /parts\[i\]\.inert = on/, "focus cannot reach the hidden page while the doors are closed");
});

test("services, FAQ and Bar copy come from the content layer", async () => {
  const index = await read("index.html");
  for (const service of content.services) {
    assert.ok(index.includes(`href="${service.slug}.html"`), "home links " + service.slug);
    const page = await read(service.slug + ".html");
    assert.ok(visibleText(page).replace(/\s+/g, " ").includes(service.hero.title.replace(/&/g, "&amp;")), service.slug + " hero title");
    for (const item of service.items) assert.ok(page.includes(item.title.replace(/&/g, "&amp;")), service.slug + " item " + item.title);
  }
  for (const division of content.divisions) {
    assert.ok(index.includes(`href="${division.slug}.html"`), "home links " + division.slug);
    const page = await read(division.slug + ".html");
    assert.ok(visibleText(page).replace(/\s+/g, " ").includes(division.hero.title.replace(/&/g, "&amp;")), division.slug + " hero title");
    for (const item of division.items) assert.ok(page.includes(item.title.replace(/&/g, "&amp;")), division.slug + " item " + item.title);
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
  assert.equal(await read("timber-logistics.html"), await read("timber.html"), "the old timber address still works and mirrors the Timber page");
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

test("pages inline their first-screen styles and boot script, then load one bundled stylesheet without blocking", async () => {
  const { parseCss, styleRules } = await import("../scripts/css-rules.mjs");
  const keys = new Set(styleRules(parseCss((await css()).replace(/\/\*[\s\S]*?\*\//g, ""))).map(rule => rule.key));
  const critical = JSON.parse(await readFile(resolve(pub, "..", "src", "styles", "critical.json"), "utf8"));
  const boot = await bootSource();
  for (const page of pages) {
    const html = await read(page), head = html.slice(0, html.indexOf("</head>"));
    assert.equal((head.match(/<style>/g) || []).length, 1, page + " inline critical styles");
    assert.match(head, /<\/style><link rel="stylesheet" href="site\.css\?v=[\w]+" media="print" data-defer><noscript><link rel="stylesheet" href="site\.css\?v=[\w]+"><\/noscript>/, page + " deferred stylesheet with a no-script fallback");
    assert.ok(head.includes("window.spearCss"), page + " inline boot script");
    assert.doesNotMatch(head, /src="boot\.js/, page);
    assert.ok(head.indexOf("data-defer") < head.indexOf("window.spearCss"), page + " boot runs after the deferred link exists");
    // The critical list must describe the current stylesheet: regenerate it with npm run critical after style changes.
    const list = critical[page === "timber-logistics.html" ? "timber.html" : page];
    assert.ok(list && list.length > 100, page + " has critical rules");
    const stale = list.filter(key => !keys.has(key));
    assert.ok(stale.length <= list.length * 0.02, page + " critical.json is stale: " + stale.slice(0, 3).join(" / "));
  }
  assert.match(boot, /link\.media = "all"/);
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

test("every business has a known status, and Active needs evidence on record", async () => {
  const all = [...content.services, ...content.divisions];
  assert.equal(new Set(all.map(b => b.id)).size, all.length, "business ids are unique");
  assert.equal(new Set(all.map(b => b.slug)).size, all.length, "business slugs are unique");
  for (const business of all) {
    assert.ok(content.statuses[business.status], business.id + " has a status");
    if (business.status === "active") assert.ok(String(business.evidence || "").trim(), business.id + " is active without evidence");
  }
});

test("planned businesses offer Register interest, show their status and stay noindex; the rest show Preparing to launch", async () => {
  for (const business of [...content.services, ...content.divisions]) {
    const page = await read(business.slug + ".html"), text = visibleText(page).replace(/\s+/g, " ");
    assert.ok(text.includes(content.statuses[business.status].label), business.id + " shows its status");
    if (business.status === "planned") {
      assert.ok(text.includes("Register interest"), business.id + " offers Register interest");
      assert.doesNotMatch(text, /Request a quote|Start a \w+ enquiry/, business.id + " does not promise a quote");
      assert.ok(text.includes(content.statuses.planned.note), business.id + " explains that nothing is open yet");
    }
  }
  const hub = visibleText(await read("businesses.html")).replace(/&amp;/g, "&");
  for (const group of content.hubs.businesses.groups) assert.ok(hub.includes(group.title), group.title);
  for (const business of [...content.services, ...content.divisions]) assert.ok(hub.includes(business.name), "hub lists " + business.name);
});

test("planned pages are excluded from the sitemap and from indexing when the site launches", async () => {
  // Build in a throwaway copy so the real public/ folder is never touched.
  const { execFile } = await import("node:child_process"), { promisify } = await import("node:util"), run = promisify(execFile);
  const { mkdtemp, cp, mkdir, symlink, rm } = await import("node:fs/promises"), { tmpdir } = await import("node:os");
  const root = resolve(pub, ".."), tmp = await mkdtemp(resolve(tmpdir(), "spear-launch-"));
  try {
    for (const dir of ["scripts", "content", "src"]) await cp(resolve(root, dir), resolve(tmp, dir), { recursive: true });
    await mkdir(resolve(tmp, "public"));
    for (const file of ["site.css", "app.js", "motion.js", "validation.js", "site-config.js"]) await cp(resolve(pub, file), resolve(tmp, "public", file));
    await symlink(resolve(pub, "assets"), resolve(tmp, "public", "assets"));
    await run(process.execPath, ["scripts/build.mjs"], { cwd: tmp, env: { ...process.env, SITE_ORIGIN: "https://example.test", SITE_LAUNCH: "1" } });
    const launched = name => readFile(resolve(tmp, "public", name), "utf8"), sitemap = await launched("sitemap.xml");
    for (const division of content.divisions) {
      const page = await launched(division.slug + ".html"), listed = sitemap.includes(`https://example.test/${division.slug}.html`);
      if (division.status === "planned") { assert.equal(listed, false, division.id + " is not in the sitemap"); assert.match(page, /<meta name="robots" content="noindex,nofollow">/, division.id + " stays noindex"); }
      else { assert.equal(listed, true, division.id + " is in the sitemap"); assert.match(page, /<meta name="robots" content="index,follow">/, division.id + " is indexable"); }
    }
    assert.match(await launched("index.html"), /<meta name="robots" content="index,follow">/);
    assert.match(await launched("businesses.html"), /<meta name="robots" content="index,follow">/);
    const approved = content.founders.every(f => f.approvedOn);
    assert.equal(sitemap.includes("/founders.html"), approved, "the founders page is listed only once approved");
    assert.equal(/"@type":"Person"/.test(await launched("founders.html")), approved, "Person data only once approved");
  } finally { await rm(tmp, { recursive: true, force: true }); }
});

test("Spear Line Timber appears on the home, Logistics and Timber pages and only offers haulage", async () => {
  for (const page of ["index.html", "logistics.html", "timber.html"]) {
    const html = await read(page), text = visibleText(html).replace(/\s+/g, " ");
    assert.match(html, /class="[^"]*timber-section/, page + " has the Timber section");
    assert.ok(text.includes(content.timber.title), page + " title");
    assert.ok(text.includes(content.timber.note), page + " says no timber is for sale");
    for (const stop of content.timber.stops) assert.ok(text.includes(stop.title), page + " stop " + stop.title);
    assert.match(html, /name="service" value="logistics"/); assert.match(html, /name="type" value="Timber"/);
  }
  assert.equal((await read("timber.html")).match(/id="timber-line"/g).length, 1);
  for (const page of pages) assert.doesNotMatch(visibleText(await read(page)), /timber (for sale|stock)|buy timber|sawmill|certified timber|legally sourced/i, page + " makes no timber supply claim");
});

test("the founders page labels every illustration and shows a plain empty state without real inputs", async () => {
  const html = await read("founders.html"), text = visibleText(html).replace(/\s+/g, " ");
  for (const founder of content.founders) {
    assert.ok(founder.name && founder.role, "founder has a name and role");
    assert.ok(text.includes(founder.name), founder.name + " is on the page");
    if (!founder.message.length && !founder.bio.length) assert.ok(text.includes(content.foundersPage.emptyTitle), "no invented biography while the message is empty");
    if (founder.approvedOn) assert.match(founder.approvedOn, /\d{4}/, "approval date");
  }
  const figures = html.match(/<figure class="[^"]*illus[^"]*">[\s\S]*?<\/figure>/g) || [];
  for (const figure of figures) { assert.match(figure, /<figcaption>AI-generated illustration<\/figcaption>/, "illustration caption"); assert.match(figure, /alt="AI-generated illustration of /, "illustration alt text"); }
  if (figures.length === 0) assert.ok(text.includes("Portrait to come"), "an honest placeholder while pictures are missing");
  assert.match(await read("about.html"), /href="founders\.html"/, "About links to the founders page");
  assert.match(text, /AI-generated imagery illustrates our service areas/);
});

test("every enquiry route opens a form that exists, and every service has its own fields", async () => {
  const enquire = await read("enquire.html");
  const values = [...enquire.matchAll(/name="service" value="([a-z]+)"/g)].map(m => m[1]);
  for (const service of ["vehicle", "supplies", "logistics", "construction", "property", "fitness", "hospitality", "digital"]) {
    assert.ok(values.includes(service), service + " can be chosen");
    assert.ok(enquire.includes(`data-service-fields="${service}"`), service + " has a fieldset");
  }
  for (const page of pages) for (const [, service] of (await read(page)).matchAll(/enquire\.html\?service=([a-z]+)/g)) assert.ok(values.includes(service), page + " links to service " + service);
  assert.match(enquire, /This business is planned\. Registering interest does not request a quote\./);
});
