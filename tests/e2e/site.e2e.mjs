// Browser tests. Run with: npm run test:e2e (needs `npx playwright install chromium`, or E2E_CHROME=/path/to/chrome).
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const axeSource = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const pages = ["divisions", "digital", "founder", "index", "vehicles", "supplies", "logistics", "how-it-works", "faq", "contact", "about", "bar", "enquire", "privacy", "404"];

async function freePort() {
  const probe = net.createServer(); probe.listen(0, "127.0.0.1"); await once(probe, "listening");
  const port = probe.address().port; await new Promise(done => probe.close(done)); return port;
}
let server, base, dataDir, browser;
test.before(async () => {
  const port = await freePort(); base = "http://127.0.0.1:" + port;
  dataDir = await mkdtemp(resolve(tmpdir(), "spear-line-e2e-"));
  server = spawn(process.execPath, ["server.mjs"], { cwd: root, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), PUBLIC_ORIGIN: base, DATA_DIR: dataDir, ENQUIRIES_ENABLED: "false", NODE_ENV: "test", PUBLIC_CONTACT_EMAIL: "enquiries@spearline.africa", PUBLIC_CONTACT_PHONE: "+256 708 735 878", PUBLIC_CONTACT_PHONE_SECONDARY: "+211 920 998 562", NOTIFY_WEBHOOK_URL: "" }, stdio: ["ignore", "pipe", "pipe"] });
  await new Promise((done, fail) => { const timer = setTimeout(() => fail(new Error("Server did not start")), 10000); server.stdout.on("data", chunk => { if (String(chunk).includes("listening")) { clearTimeout(timer); done(); } }); server.once("exit", code => fail(new Error("Server exited " + code))); });
  browser = await chromium.launch({ executablePath: process.env.E2E_CHROME || undefined, args: ["--no-sandbox"] });
});
test.after(async () => { await browser?.close(); if (server?.exitCode === null) { server.kill("SIGTERM"); await once(server, "exit"); } await rm(dataDir, { recursive: true, force: true }); });

const skipIntro = context => context.addInitScript(() => { try { sessionStorage.setItem("spear-line-intro", "1"); } catch { /* storage optional */ } });
async function open(path, { width = 1363, height = 800, reduced = false, saved = false, touch = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? "reduce" : "no-preference", isMobile: touch, hasTouch: touch });
  await skipIntro(context);
  if (saved) await context.addInitScript(() => localStorage.setItem("spear-line-motion", "reduce"));
  const page = await context.newPage(); const problems = [];
  page.on("pageerror", error => problems.push("page error: " + error.message));
  page.on("console", message => { if (message.type() === "error") problems.push("console: " + message.text()); });
  page.on("response", response => { if (response.status() >= 400) problems.push(response.status() + " " + response.url()); });
  await page.goto(base + path, { waitUntil: "networkidle" });
  return { page, context, problems };
}

test("every page loads cleanly with no horizontal overflow at four widths", { timeout: 240000 }, async () => {
  for (const width of [320, 390, 768, 1363]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: width < 600, hasTouch: width < 600 });
    await skipIntro(context);
    for (const name of pages) {
      const page = await context.newPage(); const problems = [];
      page.on("pageerror", error => problems.push(error.message)); page.on("response", r => { if (r.status() >= 400 && !name.startsWith("404")) problems.push(r.status() + " " + r.url()); });
      await page.goto(base + "/" + name + ".html", { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, name + " at " + width + " overflows by " + overflow);
      assert.deepEqual(problems.filter(p => !/\b404\b/.test(p) || name !== "404"), [], name + " at " + width);
      await page.close();
    }
    await context.close();
  }
});

test("axe finds no accessibility violations, with and without reduced motion", { timeout: 300000 }, async () => {
  for (const reduced of [true, false]) {
    for (const [width, touch] of [[1363, false], [390, true]]) {
      const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: touch, hasTouch: touch, reducedMotion: reduced ? "reduce" : "no-preference" });
      await skipIntro(context);
      for (const name of pages) {
        const page = await context.newPage();
        await page.goto(base + "/" + name + ".html", { waitUntil: "networkidle" }); await page.waitForTimeout(reduced ? 400 : 3200);
        await page.evaluate(axeSource);
        const result = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }));
        assert.deepEqual(result.violations.map(v => v.id + ": " + v.nodes.slice(0, 2).map(n => n.target.join(" ")).join(", ")), [], name + " (" + width + "px, reduced=" + reduced + ")");
        await page.close();
      }
      await context.close();
    }
  }
});

test("the homepage consignment note opens the enquiry with service and destination filled in", { timeout: 60000 }, async () => {
  for (const [service, field] of [["logistics", "destination"], ["supplies", "supplyDestination"], ["vehicle", "location"]]) {
    const { page, context } = await open("/index.html");
    await page.check(".waybill input[value=" + service + "]"); await page.fill("#waybill-to", "Mbarara");
    await Promise.all([page.waitForURL(/enquire\.html/), page.click(".waybill button")]);
    assert.equal(await page.evaluate(() => document.querySelector("input[name=service]:checked").value), service);
    assert.equal(await page.inputValue("[name=" + field + "]"), "Mbarara");
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1363, height: 800 }, javaScriptEnabled: false }); const page = await context.newPage();
  await page.goto(base + "/index.html"); await page.check(".waybill input[value=supplies]", { force: true });
  await Promise.all([page.waitForURL(/enquire\.html/), page.click(".waybill button")]);
  assert.match(page.url(), /service=supplies/); await context.close();
  const keyboard = await open("/index.html"); await keyboard.page.focus(".waybill input[value=vehicle]"); await keyboard.page.keyboard.press("ArrowRight");
  assert.ok(await keyboard.page.evaluate(() => document.querySelector(".waybill input[value=supplies]").checked)); await keyboard.context.close();
});

test("an enquiry can be prepared as a draft while online submission is off", { timeout: 60000 }, async () => {
  const { page, context } = await open("/enquire.html?service=logistics");
  await page.fill("[name=name]", "Test Buyer"); await page.fill("[name=contact]", "buyer@example.com");
  await page.fill("[name=pickup]", "Jinja"); await page.fill("[name=destination]", "Kampala"); await page.fill("[name=load]", "10 tonnes"); await page.fill("[name=timing]", "November");
  await page.check("[name=consent]");
  await page.click("#submit-enquiry");
  await page.waitForSelector("#form-message .download-link", { timeout: 5000 });
  assert.match(await page.textContent("#form-message"), /Nothing has been sent to Spear Line/);
  assert.match(await page.getAttribute("#form-message .download-link", "download"), /^spear-line-logistics-enquiry\.txt$/);
  await context.close();
});

test("menu, tabs, FAQ and timeline behave, and Reduce motion is honoured", { timeout: 120000 }, async () => {
  const phone = await open("/index.html", { width: 390, height: 844, touch: true });
  await phone.page.click(".menu-toggle"); await phone.page.waitForTimeout(700);
  assert.equal(await phone.page.getAttribute(".menu-toggle", "aria-expanded"), "true");
  assert.ok(await phone.page.$("#site-menu a[href='divisions.html']"));
  await phone.page.keyboard.press("Escape"); await phone.page.waitForTimeout(500);
  assert.equal(await phone.page.getAttribute(".menu-toggle", "aria-expanded"), "false"); await phone.context.close();

  const faq = await open("/faq.html");
  await faq.page.click(".faq-list details:nth-child(2) summary"); await faq.page.waitForTimeout(600);
  assert.ok(await faq.page.evaluate(() => { const d = [...document.querySelectorAll(".faq-group:first-child details")]; return d[1].open && !d[0].open; }));
  await faq.page.evaluate(() => document.getElementById("faq-2").scrollIntoView()); await faq.page.waitForTimeout(800);
  assert.equal(await faq.page.evaluate(() => document.querySelector("[data-faq-index] a[aria-current=true]")?.hash), "#faq-2"); await faq.context.close();

  const how = await open("/how-it-works.html"); const counts = [];
  for (const y of [0, 900, 1500]) { await how.page.evaluate(top => scrollTo(0, top), y); await how.page.waitForTimeout(500); counts.push(await how.page.evaluate(() => document.querySelectorAll(".timeline-step.is-on").length)); }
  assert.ok(counts[0] < counts[2], "timeline lights steps as you scroll: " + counts); await how.context.close();

  const home = await open("/index.html");
  assert.equal(await home.page.locator(".div-card").count(), 6, "six visible company divisions");
  assert.ok(await home.page.locator('a[href="digital.html"]').count(), "digital offering is reachable");
  assert.ok(await home.page.locator('a[href="founder.html"]').count(), "founder profile is reachable");
  assert.deepEqual(home.problems, []);
  await home.context.close();

  for (const mode of [{ saved: true }, { reduced: true }]) {
    const calm = await open("/index.html", mode);
    assert.ok(await calm.page.isVisible(".div-grid"), "all divisions stay visible with reduced motion");
    assert.deepEqual(calm.problems, []); await calm.context.close();
  }
});

test("the logo preloader plays on arrival and on each page change with that page's name, unlocks the page, and is skipped under Reduce motion", { timeout: 60000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await context.newPage();
  await page.goto(base + "/index.html");
  assert.ok(await page.evaluate(() => document.documentElement.classList.contains("is-preloading")), "preloader runs on the first view");
  assert.ok(await page.evaluate(() => document.querySelector("main").inert), "page is inert behind the doors");
  await page.waitForFunction(() => !document.documentElement.classList.contains("is-preloading"), null, { timeout: 6000 });
  assert.equal(await page.evaluate(() => document.querySelector("main").inert), false, "page is interactive afterwards");
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".preloader")).display), "none");
  assert.equal(await page.evaluate(() => document.querySelector(".pl-caption").textContent), "Trade. Supply. Logistics.", "home chip");
  await page.evaluate(() => { location.href = "faq.html"; });
  await page.waitForURL("**/faq.html", { waitUntil: "commit" });
  await page.waitForSelector("html.is-preloading.pl-quick", { state: "attached", timeout: 3000 });
  assert.equal(await page.evaluate(() => document.querySelector(".pl-caption").textContent), "Questions answered", "the page change shows the new page's chip");
  await page.waitForFunction(() => !document.documentElement.classList.contains("is-preloading"), null, { timeout: 6000 });
  assert.equal(await page.evaluate(() => document.querySelector("main").inert), false, "page is interactive after a page change");
  await context.close();
  const calm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); const quiet = await calm.newPage();
  await quiet.goto(base + "/index.html");
  assert.equal(await quiet.evaluate(() => document.documentElement.classList.contains("is-preloading")), false, "skipped under Reduce motion");
  await calm.close();
});

test("the FAQ search filters questions and says so when nothing matches", { timeout: 30000 }, async () => {
  const { page, context } = await open("/faq.html");
  await page.fill("#faq-filter", "privacy");
  const shown = await page.evaluate(() => [...document.querySelectorAll(".faq-list details")].filter(d => !d.classList.contains("is-filtered")).length);
  assert.ok(shown > 0 && shown < 9, "some questions match: " + shown);
  await page.fill("#faq-filter", "zzzz");
  assert.equal(await page.isVisible("[data-faq-empty]"), true);
  await page.fill("#faq-filter", "");
  assert.equal(await page.evaluate(() => document.querySelectorAll(".faq-list details.is-filtered").length), 0);
  await context.close();
});


/* ---------- V15: preloader, motion, responsive, keyboard and contact behaviour ---------- */
const NUMBERS = { phone: "+256 708 735 878", secondary: "+211 920 998 562" };
async function holdTime(page) {
  return page.evaluate(() => new Promise(resolve => {
    const t0 = performance.now(), root = document.documentElement;
    const tick = () => (root.classList.contains("is-preloading") ? requestAnimationFrame(tick) : resolve(performance.now() - t0));
    tick();
  }));
}

test("the preloader never holds the page past 1.8 s (1.2 s on phones), and unlocks even if images and fonts fail", { timeout: 90000 }, async () => {
  for (const [name, viewport, mobile, limit] of [["desktop", { width: 1440, height: 900 }, false, 1900], ["phone", { width: 390, height: 844 }, true, 1300]]) {
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile }); const page = await context.newPage();
    await page.route(/\.(avif|webp|woff2)(\?|$)/, route => route.abort());
    await page.goto(base + "/index.html", { waitUntil: "commit" });
    await page.waitForSelector("html.is-preloading", { state: "attached", timeout: 3000 });
    const held = await holdTime(page);
    assert.ok(held < limit, name + " preloader held the page for " + Math.round(held) + " ms with images and fonts blocked");
    assert.equal(await page.evaluate(() => document.querySelector("main").inert), false, name + " page is interactive");
    await context.close();
  }
});

test("the preloader plays on reloads and links within the site, and is skipped for Save-Data, 2g, and back and forward", { timeout: 90000 }, async () => {
  const ran = async (setup, go = page => page.goto(base + "/index.html")) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } }); if (setup) await context.addInitScript(setup);
    const page = await context.newPage(); await go(page);
    const played = await page.evaluate(() => document.documentElement.classList.contains("is-preloading") || document.documentElement.classList.contains("pl-exit"));
    await context.close(); return played;
  };
  assert.equal(await ran(), true, "plays on a fresh visit");
  assert.equal(await ran(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } })), false, "Save-Data");
  assert.equal(await ran(() => Object.defineProperty(navigator, "connection", { value: { effectiveType: "2g" } })), false, "2g connection");
  assert.equal(await ran(null, async page => { await page.goto(base + "/index.html"); await page.waitForFunction(() => !document.documentElement.classList.contains("is-preloading")); await page.reload(); }), true, "reload");
  assert.equal(await ran(null, async page => { await page.goto(base + "/faq.html"); await page.evaluate(() => sessionStorage.clear()); await page.goto(base + "/index.html"); await page.goBack(); await page.goForward(); }), false, "back and forward");
  assert.equal(await ran(null, async page => { await page.goto(base + "/faq.html"); await page.evaluate(() => sessionStorage.clear()); await page.waitForFunction(() => !document.documentElement.classList.contains("is-preloading")); await page.click("a[href='index.html']"); await page.waitForURL("**/index.html", { waitUntil: "commit" }); }), true, "link followed within the site");
});

test("Reduce motion shows a complete static design: nothing hidden, nothing animating, the route drawn", { timeout: 90000 }, async () => {
  for (const mode of [{ reduced: true }, { saved: true }]) {
    const { page, context } = await open("/index.html", mode);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(300);
    const state = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll("[data-reveal],[data-split],[data-route]")].filter(el => getComputedStyle(el).opacity === "0").length,
      armed: document.querySelectorAll(".rv-arm:not(.is-in)").length,
      running: document.getAnimations().filter(a => a.playState === "running" && !(a.effect?.target?.closest?.(".progress"))).length,
      drawn: getComputedStyle(document.querySelector(".rt-draw")).strokeDashoffset
    }));
    assert.equal(state.hidden, 0, "no revealable element is hidden"); assert.equal(state.armed, 0, "nothing waits to be revealed");
    assert.equal(state.running, 0, "no animation is running"); assert.match(state.drawn, /^0(px)?$/, "the hero route is fully drawn");
    await context.close();
  }
});

test("without JavaScript, or without IntersectionObserver, no content is hidden", { timeout: 60000 }, async () => {
  const bare = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false }); const noScript = await bare.newPage();
  await noScript.goto(base + "/index.html");
  assert.equal(await noScript.evaluate(() => [...document.querySelectorAll("[data-reveal],[data-split]")].filter(el => getComputedStyle(el).opacity === "0").length), 0, "visible with scripts off");
  await bare.close();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } }); await skipIntro(context);
  await context.addInitScript(() => { delete window.IntersectionObserver; });
  const page = await context.newPage(); await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  assert.equal(await page.evaluate(() => document.querySelectorAll(".rv-arm").length + (document.documentElement.classList.contains("rv-on") ? 1 : 0)), 0, "nothing is armed without IntersectionObserver");
  await context.close();
});

test("reveals arm only below the first screen and lift as they scroll into view", { timeout: 60000 }, async () => {
  const { page, context } = await open("/index.html");
  const first = await page.evaluate(() => ({ armedAboveFold: [...document.querySelectorAll(".rv-arm")].filter(el => el.getBoundingClientRect().top < innerHeight * 0.9).length, armed: document.querySelectorAll(".rv-arm").length }));
  assert.equal(first.armedAboveFold, 0, "the first screen is never armed"); assert.ok(first.armed > 3, "below-the-fold content is armed: " + first.armed);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(1800);
  assert.equal(await page.evaluate(() => [...document.querySelectorAll(".rv-arm")].filter(el => !el.classList.contains("is-in") && el.getBoundingClientRect().top < innerHeight && el.getBoundingClientRect().bottom > 0).length), 0, "everything on screen has been revealed");
  await context.close();
});

test("both phone lines are exact call links and the business mailbox is published", { timeout: 60000 }, async () => {
  for (const path of ["/contact.html", "/index.html", "/divisions.html"]) {
    const { page, context } = await open(path);
    const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href^='tel:']")].map(a => a.getAttribute("href")));
    for (const wanted of ["tel:+256708735878", "tel:+211920998562"]) assert.ok(hrefs.includes(wanted), path + " links to " + wanted);
    assert.ok(await page.locator("a[href='mailto:enquiries@spearline.africa']").count() >= 1, path + " links to the business mailbox");
    await context.close();
  }
  const { page, context } = await open("/contact.html");
  assert.match(await page.textContent(".call-cards"), /Uganda enquiries[\s\S]*\+256 708 735 878[\s\S]*Joh Ayom \/ South Sudan[\s\S]*\+211 920 998 562/);
  await context.close();
});

test("the phone menu opens as a sheet with both call lines, traps focus, and returns it on close", { timeout: 60000 }, async () => {
  const { page, context } = await open("/contact.html", { width: 390, height: 844, touch: true });
  await page.click(".menu-toggle"); await page.waitForTimeout(500);
  assert.equal(await page.getAttribute(".menu-toggle", "aria-expanded"), "true");
  assert.equal(await page.evaluate(() => document.querySelector("main").inert), true, "page behind the menu is inert");
  const calls = await page.locator("#site-menu .call-list a[href^='tel:']").count(); assert.equal(calls, 2, "both call lines are in the menu");
  const rows = await page.evaluate(() => [...document.querySelectorAll("#site-menu .nav-list a")].map(a => a.getBoundingClientRect().height));
  assert.ok(rows.every(h => h >= 56), "menu rows are at least 56px tall: " + rows.join(","));
  // Focus stays inside: tabbing past the last control wraps to the toggle.
  for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
  assert.ok(await page.evaluate(() => !!document.activeElement.closest(".site-header")), "focus is trapped in the menu");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, true, "the open menu does not overflow");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  assert.equal(await page.getAttribute(".menu-toggle", "aria-expanded"), "false");
  assert.equal(await page.evaluate(() => document.activeElement.className.includes("menu-toggle")), true, "focus returns to the toggle");
  await context.close();
});

test("keyboard focus is always visible on links, buttons and form controls", { timeout: 90000 }, async () => {
  for (const path of ["/index.html", "/contact.html", "/divisions.html"]) {
    const { page, context } = await open(path);
    let seen = 0;
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      const ring = await page.evaluate(() => { const el = document.activeElement; if (!el || el === document.body) return null; const cs = getComputedStyle(el), rect = el.getBoundingClientRect(); return { outline: parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== "none", shadow: cs.boxShadow !== "none", visible: rect.width > 0 && rect.height > 0, label: el.tagName + "." + el.className }; });
      if (!ring || !ring.visible) continue;
      seen++; assert.ok(ring.outline || ring.shadow, path + " focus ring missing on " + ring.label);
    }
    assert.ok(seen >= 10, path + " keyboard reached " + seen + " controls");
    await context.close();
  }
});

test("view transitions enhance navigation without breaking links, back or forward", { timeout: 60000 }, async () => {
  const { page, context } = await open("/index.html");
  await Promise.all([page.waitForURL(/divisions\.html/), page.click(".site-nav a[href='divisions.html']")]);
  assert.match(await page.title(), /Business divisions/); assert.ok(await page.evaluate(() => document.querySelector("h1").textContent.includes("wider view")));
  await page.goBack(); assert.match(page.url(), /index\.html|\/$/); await page.goForward(); assert.match(page.url(), /divisions\.html/);
  assert.ok(await page.evaluate(() => document.activeElement === document.body || document.activeElement === document.documentElement || !!document.activeElement), "focus is sane after navigating");
  await context.close();
  const plain = await browser.newContext({ viewport: { width: 1280, height: 800 } }); await skipIntro(plain);
  await plain.addInitScript(() => { window.addEventListener("pagereveal", e => e.stopImmediatePropagation(), true); });
  const tab = await plain.newPage(); await tab.goto(base + "/index.html");
  await Promise.all([tab.waitForURL(/vehicles\.html/), tab.click(".site-nav a[href='vehicles.html']")]);
  assert.match(tab.url(), /vehicles\.html/, "links work when no transition runs"); await plain.close();
});

test("ten widths, three landscape phones, 200% zoom and large text: no overflow on the key pages", { timeout: 600000 }, async () => {
  const keyPages = ["index", "divisions", "digital", "founder", "contact"];
  const modes = [320, 360, 390, 430, 600, 768, 1024, 1280, 1440, 1920].map(w => ({ w, h: w < 600 ? 800 : 900 })).concat([{ w: 667, h: 375 }, { w: 844, h: 390 }, { w: 932, h: 430 }, { w: 640, h: 450 }]);
  for (const { w, h } of modes) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 1100 }); await skipIntro(context);
    for (const name of keyPages) {
      const page = await context.newPage(); await page.goto(base + "/" + name + ".html", { waitUntil: "networkidle" });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(over <= 1, name + " at " + w + "x" + h + " overflows by " + over);
      await page.close();
    }
    await context.close();
  }
  const large = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true }); await skipIntro(large);
  for (const name of keyPages) {
    const page = await large.newPage(); await page.goto(base + "/" + name + ".html", { waitUntil: "networkidle" }); await page.evaluate(() => document.documentElement.style.setProperty("font-size", "200%", "important"));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, name + " with large text overflows");
    await page.close();
  }
  await large.close();
});

test("tap targets on phones are at least 44px, and the dock never covers footer links", { timeout: 120000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await skipIntro(context);
  for (const name of ["index", "divisions", "digital", "founder", "contact", "enquire"]) {
    const page = await context.newPage(); await page.goto(base + "/" + name + ".html", { waitUntil: "networkidle" });
    const small = await page.evaluate(() => [...document.querySelectorAll("a[href],button,summary,select,textarea,input:not([type=hidden]):not(.honey)")].filter(el => { let r = el.getBoundingClientRect(); const cs = getComputedStyle(el); if (!r.width || !r.height || cs.visibility === "hidden" || el.closest("[hidden],[inert],.preloader,.skip,.honey") || el.matches(".skip")) return false; if (el.matches("input[type=checkbox],input[type=radio]") && el.closest("label")) r = el.closest("label").getBoundingClientRect(); if (cs.display === "inline" && el.closest("p,.fine,.answer,.prose,.consent,.footer-credits,.footer-bottom")) return false; return r.height < 43.5 || (r.width < 43.5 && !el.closest("label")); }).map(el => el.tagName + "." + el.className + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height)));
    assert.deepEqual(small, [], name + " has small tap targets");
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(250);
    const covered = await page.evaluate(() => [...document.querySelectorAll(".footer-bottom a,.to-top")].filter(el => { const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, Math.min(r.top + r.height / 2, innerHeight - 1)); return top && !el.contains(top) && !!top.closest(".dock"); }).length);
    assert.equal(covered, 0, name + ": the dock covers footer links");
    await page.close();
  }
  await context.close();
});
