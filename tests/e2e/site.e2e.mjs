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
const pages = ["index", "vehicles", "supplies", "logistics", "how-it-works", "faq", "contact", "about", "bar", "enquire", "privacy", "404", "businesses", "trade-supply", "lifestyle-property", "founders", "timber", "building-supplies", "fitness-wellness", "real-estate", "hospitality", "digital"];

async function freePort() {
  const probe = net.createServer(); probe.listen(0, "127.0.0.1"); await once(probe, "listening");
  const port = probe.address().port; await new Promise(done => probe.close(done)); return port;
}
let server, base, dataDir, browser;
test.before(async () => {
  const port = await freePort(); base = "http://127.0.0.1:" + port;
  dataDir = await mkdtemp(resolve(tmpdir(), "spear-line-e2e-"));
  server = spawn(process.execPath, ["server.mjs"], { cwd: root, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), PUBLIC_ORIGIN: base, DATA_DIR: dataDir, ENQUIRIES_ENABLED: "false", NODE_ENV: "test", NOTIFY_WEBHOOK_URL: "" }, stdio: ["ignore", "pipe", "pipe"] });
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
  assert.ok(await phone.page.$("#site-menu a[href='how-it-works.html']"));
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

  const home = await open("/index.html"); const before = await home.page.evaluate(() => getComputedStyle(document.querySelector(".marquee-track")).animationName);
  assert.equal(before, "marquee");
  await home.page.evaluate(() => scrollTo(0, document.querySelector("[data-route]").getBoundingClientRect().top + scrollY - innerHeight * 0.75)); await home.page.waitForTimeout(800);
  const a = await home.page.getAttribute("[data-route-spear]", "transform"); await home.page.evaluate(() => scrollBy(0, 380)); await home.page.waitForTimeout(600);
  assert.notEqual(a, await home.page.getAttribute("[data-route-spear]", "transform"), "the spear moves along the route"); await home.context.close();

  for (const mode of [{ saved: true }, { reduced: true }]) {
    const calm = await open("/index.html", mode);
    assert.equal(await calm.page.evaluate(() => getComputedStyle(document.querySelector(".marquee-track")).animationName), "none");
    await calm.page.evaluate(() => scrollTo(0, document.querySelector("[data-route]").getBoundingClientRect().top + scrollY - 200)); await calm.page.waitForTimeout(600);
    assert.equal(parseFloat(await calm.page.evaluate(() => document.querySelector("[data-route-path]").style.strokeDashoffset)), 0, "route is fully drawn");
    assert.deepEqual(calm.problems, []); await calm.context.close();
  }
});

test("the logo preloader plays once per tab, unlocks the page, and is skipped under Reduce motion", { timeout: 60000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await context.newPage();
  await page.goto(base + "/index.html");
  assert.ok(await page.evaluate(() => document.documentElement.classList.contains("is-preloading")), "preloader runs on the first view");
  assert.ok(await page.evaluate(() => document.querySelector("main").inert), "page is inert behind the doors");
  await page.waitForFunction(() => !document.documentElement.classList.contains("is-preloading"), null, { timeout: 6000 });
  assert.equal(await page.evaluate(() => document.querySelector("main").inert), false, "page is interactive afterwards");
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".preloader")).display), "none");
  await page.goto(base + "/faq.html");
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains("is-preloading")), false, "not replayed in the same tab");
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
