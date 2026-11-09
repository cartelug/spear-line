import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as content from "../content/site.mjs";

const pub = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const pages = ["divisions.html", "digital.html", "founder.html", "index.html", "bar.html", "vehicles.html", "supplies.html", "logistics.html", "timber-logistics.html", "about.html", "enquire.html", "privacy.html", "404.html", "how-it-works.html", "faq.html", "contact.html"];
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
  const guard = /html\.(rv-on|is-preloading|pl-exit|menu-open|is-scrolling)|\.rv-arm|\.hero\+\.seam|^\.lf,\.hero-panel::before$|\.pl-|\.preloader|^\s*\[hidden\]|\.skip|\.honey|input|\.site-nav|\.nl::after|\.w::after|\.marquee ul\+ul|\.cursor|\[data-tilt\]::after|\.process-frame|\.bar-card::after|\.is-editing|\.form-message:empty|\.faq-list details\.is-filtered/;
  for (const rule of styles.split(/(?<=\})/).map(r => r.trim()).filter(Boolean)) {
    const [selector, body = ""] = rule.split("{");
    if (!/opacity:0[;}]|visibility:hidden|display:none/.test(body)) continue;
    if (/^\s*(from|to|\d+%)/.test(selector) || /@keyframes/.test(selector)) continue;
    if (/display:none/.test(body) && !/opacity:0|visibility:hidden/.test(body) && /\.nav-list a::before|\.(dock|menu-toggle|nav-note|menu-call|rail-hint|card-text|waybill-kind)|::-webkit|\.marquee ul\+ul|\.bar-card::after|\.btn-primary|\[hidden\]|\.form-message|is-filtered|\.cursor/.test(selector)) continue;
    assert.ok(guard.test(selector), "unguarded hidden state: " + selector.trim().slice(0, 90));
  }
  const boot = await bootSource(), motion = await read("motion.js");
  // Nothing is hidden on account of a script that may never run: reveal states exist only on elements that
  // motion.js has armed (rv-arm), after IntersectionObserver is proven, and only below the first screen.
  assert.doesNotMatch(boot, /motion-late/, "no start-up lift is needed because nothing is hidden at start-up");
  assert.match(styles, /html\.rv-on \[data-reveal\]\.rv-arm:not\(\.is-in\)\{opacity:0/);
  assert.doesNotMatch(styles, /html\.motion-ok \[data-reveal\]/, "reveals are not hidden by the motion flag alone");
  assert.match(motion, /"IntersectionObserver" in window/); assert.match(motion, /classList\.add\("rv-arm"\)/); assert.match(motion, /getBoundingClientRect\(\)\.top > innerHeight/, "only elements below the first screen are armed");
  assert.match(motion, /root\.classList\.add\("rv-on"\)/); assert.match(motion, /setTimeout\(sweep, 4000\)/, "a safety net lifts anything still hidden on screen");
  assert.match(boot, /setTimeout\(finish, LIFT\)/, "the preloader has a fail-safe");
  assert.ok(boot.indexOf("setTimeout(finish, LIFT)") < boot.indexOf("function init()"), "the fail-safe is registered before anything that could throw");
  assert.match(styles, /pl-failsafe 1ms linear 2\.4s forwards/, "a CSS timer hides the preloader even if scripts stop");
  assert.match(motion, /root\.classList\.add\("motion-live"\)/);
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
    if (last && last !== "abyss") assert.match(html, new RegExp('<footer class="site-footer tone-abyss from-' + last + '"'), page + " footer blend");
  }
  const styles = await css();
  for (const tone of ["abyss", "navy", "ocean", "umber", "paper", "sand", "mist"]) {
    assert.match(styles, new RegExp("\\.from-" + tone + "\\{--from-c:color-mix\\(in oklab,var\\(--tone-c\\),var\\(--" + tone + "\\)\\)\\}"));
    assert.match(styles, new RegExp("\\.to-" + tone + "\\{--to-c:color-mix\\(in oklab,var\\(--tone-c\\),var\\(--" + tone + "\\)\\)\\}"));
  }
});

test("the approved horizontal wordmark appears intact and the preloader plays once per tab", async () => {
  assert.ok(await exists("assets/logo-wordmark-gold.png"));
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /<div class="preloader" aria-hidden="true">/, page);
    assert.match(html, /<img class="pl-logo" src="assets\/logo-wordmark-gold\.png" alt="" width="2172" height="724"/, page + " intro wordmark");
    assert.match(html, /<img class="brand-logo" src="assets\/logo-wordmark-gold\.png" alt="" width="2172" height="724"/, page + " header wordmark");
    assert.match(html, /<img class="footer-logo" src="assets\/logo-wordmark-gold\.png"/, page + " footer wordmark");
    assert.doesNotMatch(html, /assets\/logo\.svg/, page + " obsolete stacked logo");
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
    for (const ref of ["assets/favicon-32.png", "assets/apple-touch-icon.png", "site.webmanifest"]) assert.ok(html.includes(ref), page + " → " + ref);
  }
  for (const file of ["favicon.ico", "assets/favicon-32.png", "assets/icon-192.png", "assets/icon-512.png", "assets/og-image.png", "assets/grain.png"]) assert.ok(await exists(file), file);
  const manifest = JSON.parse(await read("site.webmanifest"));
  for (const icon of manifest.icons) assert.ok(await exists(icon.src), icon.src);
});

test("navigation reaches every page, and contact details are never hard-coded", async () => {
  for (const page of pages) {
    const html = await read(page);
    for (const target of ["divisions.html", "digital.html", "founder.html", "vehicles.html", "supplies.html", "logistics.html", "how-it-works.html", "faq.html", "contact.html", "about.html", "enquire.html", "privacy.html"]) assert.ok(html.includes('href="' + target + '"'), page + " → " + target);
    assert.match(html, /aria-controls="site-menu"/, page + " menu toggle");
  }
  const contact = await read("contact.html");
  assert.doesNotMatch(contact, /mailto:|tel:|wa\.me|\+\d{6,}|@[a-z0-9-]+\.[a-z]{2,}/i);
  for (const hook of ["data-contact-email", "data-contact-phone", "data-contact-phone-secondary", "data-contact-whatsapp", "data-address", "data-contact-empty"]) assert.ok(contact.includes(hook), hook);
});

test("both confirmed contact lines are configured, while the planned mailbox remains unpublished", async () => {
  const config = await read("site-config.js");
  assert.match(config, /phone:"\+256 708 735 878"/);
  assert.match(config, /phoneSecondary:"\+211 920 998 562"/);
  assert.match(config, /email:""/);
  assert.match(await read("contact.html"), /Joh Ayom \/ South Sudan/);
});

test("pages stay out of search results until a launch origin is supplied", async () => {
  for (const page of pages) assert.match(await read(page), /<meta name="robots" content="noindex,nofollow">/, page);
  assert.match(await read("robots.txt"), /Disallow: \//);
  assert.equal(await exists("sitemap.xml"), false);
});

test("motion respects Reduce motion, pauses what is offscreen and while scrolling, and uses the tokens", async () => {
  const motion = await read("motion.js"), styles = await css();
  assert.match(motion, /reduced\(\)/); assert.match(motion, /spear-line-motion/); assert.match(motion, /is-paused/);
  assert.match(styles, /html\.motion-reduced \*,html\.motion-reduced \*::before,html\.motion-reduced \*::after\{animation:none!important/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /html\.motion-ok \.is-paused img,html\.motion-ok \.is-paused,html\.motion-ok \.is-paused::before\{animation-play-state:paused\}/);
  assert.match(styles, /html\.is-scrolling \.pan img,html\.is-scrolling \.glow span/, "ambient loops pause while scrolling");
  // Motion tokens: durations, easings, distances and stagger are defined once and used by the motion layer.
  for (const token of ["--dur-1", "--dur-2", "--dur-3", "--dur-4", "--dur-5", "--ease-out", "--ease-io", "--dist-2", "--dist-3", "--stagger"]) assert.ok(styles.includes(token + ":"), token + " is defined");
  // Nothing in a keyframe animates layout: transform, opacity, clip-path, stroke offset and offset-distance only.
  const keyframes = [...styles.matchAll(/@keyframes [\w-]+\{([\s\S]*?\})\}/g)].map(m => m[1]).join(" ");
  assert.doesNotMatch(keyframes, /(?:^|[{;\s])(?:width|height|top|left|right|bottom|margin|padding)\s*:/, "no keyframe animates layout");
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
    const list = critical[page === "timber-logistics.html" ? "logistics.html" : page];
    assert.ok(list && list.length > 100, page + " has critical rules");
    const stale = list.filter(key => !keys.has(key));
    assert.ok(stale.length <= list.length * 0.02, page + " critical.json is stale: " + stale.slice(0, 3).join(" / "));
  }
  assert.match(boot, /link\.media = "all"/);
  const styles = await css();
  for (const marker of [".hero-panel", ".svc-grid", ".route-steps", ".div-card", ".waybill", ".preloader", ".bar-card", ".form-card"]) assert.ok(styles.includes(marker), marker);
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


test("V12 six-division model, digital offer and Joh Ayom profile remain grounded", async () => {
  const homePage = await read("index.html");
  const divisionPage = await read("divisions.html");
  const digitalPage = await read("digital.html");
  const founderPage = await read("founder.html");
  assert.equal(content.divisions.length, 6, "six business divisions");
  for (const division of content.divisions) {
    assert.ok(homePage.includes(division.name.replace(/&/g, "&amp;")), division.name + " on home");
    assert.ok(divisionPage.includes(division.name.replace(/&/g, "&amp;")), division.name + " on divisions");
    assert.ok(["Developing", "Enquiry-led", "Concept"].includes(division.status), division.name + " status");
  }
  assert.equal(content.digitalCapabilities.length, 9);
  for (const capability of content.digitalCapabilities) assert.ok(digitalPage.includes(capability.title.replace(/&/g, "&amp;")), capability.title);
  assert.match(digitalPage, /THE 97 World/);
  assert.match(digitalPage, /subject to confirmation/);
  assert.match(founderPage, /Joh Ayom/);
  assert.doesNotMatch(founderPage, /Joe Ayom/);
  assert.match(founderPage, /Our idea is simple: anyone with a vehicle to find/);
  assert.match(founderPage, /Joh Ayom, AI-generated image/);
  assert.doesNotMatch(homePage, /Spear Line in South Sudan/);
});

test("icons share one stroke system: 48 px grid, 2 px round strokes, and every referenced symbol exists", async () => {
  const sprite = await read("assets/icons.svg");
  const symbols = [...sprite.matchAll(/<symbol id="([\w-]+)" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g)].map(m => ({ id: m[1], box: m[2], body: m[3] }));
  assert.ok(symbols.length >= 35, "sprite has " + symbols.length + " symbols");
  const exceptions = new Set(["i-spear", "i-mark", "i-quote", "i-arrow", "i-chevron", "i-search"]); // the solid spear and quote, the 24 px mark, and three UI glyphs drawn 2.2 to 2.6 px for optical size at small sizes
  for (const s of symbols.filter(s => !exceptions.has(s.id))) {
    assert.equal(s.box, "0 0 48 48", s.id + " uses the 48 px grid");
    assert.match(s.body, /stroke-width="2"/, s.id + " uses a 2 px stroke"); if (/<path/.test(s.body)) assert.match(s.body, /stroke-linecap="round"/, s.id); assert.match(s.body, /stroke-linejoin="round"/, s.id);
    assert.doesNotMatch(s.body, /fill="(?!none)[^"]+"/, s.id + " is a line icon, not filled");
  }
  for (const id of ["i-materials", "i-wellness", "i-property", "i-web", "i-brand", "i-booking", "i-video", "i-megaphone", "i-automation", "i-commerce", "i-analytics", "i-ai"]) assert.ok(symbols.some(s => s.id === id), id + " exists");
  // Every division and every digital capability has a symbol, and none is a handshake or a partnership mark.
  for (const item of [...content.divisions, ...content.digitalCapabilities]) assert.ok(symbols.some(s => s.id === item.icon), (item.name || item.title) + " has icon " + item.icon);
  assert.doesNotMatch(sprite, /handshake|partner/i);
  for (const id of ["i-arrow", "i-chevron", "i-search"]) { const body = symbols.find(s => s.id === id).body; const w = Number(body.match(/stroke-width="([\d.]+)"/)[1]); assert.ok(w >= 2 && w <= 2.6, id + " stroke " + w); }
});

test("the Line Field hero background is original, small and identical on every build", async () => {
  const svg = await read("assets/line-field.svg");
  assert.ok(svg.length < 14000, "contours are " + svg.length + " bytes");
  assert.ok((svg.match(/<path/g) || []).length >= 10, "contour lines are present");
  assert.doesNotMatch(svg.replace(/xmlns="[^"]+"/, ""), /href=|<image|<script|https?:/, "no external references");
  const { spawnSync } = await import("node:child_process"), before = svg;
  const run = spawnSync(process.execPath, ["scripts/line-field.mjs"], { cwd: resolve(pub, ".."), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr); assert.equal(await read("assets/line-field.svg"), before, "regenerating gives the same file");
  const home = await read("index.html"); assert.match(home, /class="lf" aria-hidden="true"/); assert.match(home, /class="rt" viewBox="0 0 800 600"/);
});

test("the wordmark is only recoloured and scaled proportionally, never redrawn, cropped or stretched", async () => {
  const styles = (await css()).replace(/\/\*[\s\S]*?\*\//g, "");
  for (const rule of styles.split(/(?<=\})/).filter(r => /(^|[\s,.])(brand-logo|footer-logo|pl-logo|wordmark|bar-card-logo)\b/.test(r.split("{")[0]))) {
    const body = rule.split("{")[1] || "";
    assert.doesNotMatch(body, /(^|;)height:\d/, "logo height is never fixed independently of its width: " + rule.slice(0, 80));
    assert.doesNotMatch(body, /object-fit:(cover|fill)|clip-path|transform:[^;]*scale[XY]|-webkit-text-stroke/, "logo is not cropped, stretched or outlined: " + rule.slice(0, 80));
    if (/filter:/.test(body)) assert.match(body, /filter:brightness\(0\)( invert\(1\))?(;|\})/, "only the black and white conversions are applied: " + rule.slice(0, 80));
  }
  const png = await readFile(resolve(pub, "assets", "logo-wordmark-gold.png")); assert.equal(png.readUInt32BE(16), 2172); assert.equal(png.readUInt32BE(20), 724);
});

test("heroes carry the route, every page uses the Line Field, and the photograph is labelled illustrative", async () => {
  for (const page of ["divisions.html", "digital.html", "contact.html", "vehicles.html", "about.html"]) {
    const html = await read(page);
    assert.match(html, /<div class="lf" aria-hidden="true">/, page + " uses the Line Field");
    assert.match(html, /<figcaption>Illustrative image<\/figcaption>/, page + " labels the hero photograph");
  }
  // Photographs of Joh Ayom are AI-generated from his own photos: every one is captioned as such, and the page says so.
  for (const page of ["founder.html", "index.html"]) {
    const html = await read(page), shots = [...html.matchAll(/<figure[^>]*>((?:(?!<\/figure>)[\s\S])*?assets\/joh\/[\s\S]*?)<\/figure>/g)].map(m => m[1]);
    assert.ok(shots.length >= 1, page + " shows Joh");
    for (const shot of shots) assert.match(shot, /<figcaption>(Joh Ayom, AI-generated image|Logistics|Supplies|Materials|Vehicles|Planning|Between Uganda and South Sudan)<\/figcaption>/, page + " captions each photo");
  }
  const founder = await read("founder.html");
  assert.match(founder, /Joh Ayom, AI-generated image/); assert.match(founder, /AI-generated images of Joh Ayom, created from his own photographs/);
});
