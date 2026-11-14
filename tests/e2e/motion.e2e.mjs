// Motion scene tests: they observe results (classes, layout, content visibility), not tween internals.
// Run with: npm run test:e2e  (a static server is started on a free port).
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
let server, base, dataDir, browser;

async function freePort() {
  const probe = net.createServer(); probe.listen(0, "127.0.0.1"); await once(probe, "listening");
  const port = probe.address().port; await new Promise(done => probe.close(done)); return port;
}
test.before(async () => {
  const port = await freePort(); base = "http://127.0.0.1:" + port;
  dataDir = await mkdtemp(resolve(tmpdir(), "spear-line-motion-"));
  server = spawn(process.execPath, ["server.mjs"], { cwd: root, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), PUBLIC_ORIGIN: base, DATA_DIR: dataDir, ENQUIRIES_ENABLED: "false", NODE_ENV: "test" }, stdio: ["ignore", "pipe", "pipe"] });
  await new Promise((done, fail) => { const timer = setTimeout(() => fail(new Error("Server did not start")), 10000); server.stdout.on("data", chunk => { if (String(chunk).includes("listening")) { clearTimeout(timer); done(); } }); server.once("exit", code => fail(new Error("Server exited " + code))); });
  browser = await chromium.launch({ executablePath: process.env.E2E_CHROME || undefined, args: ["--no-sandbox"] });
});
test.after(async () => { await browser?.close(); if (server?.exitCode === null) { server.kill("SIGTERM"); await once(server, "exit"); } await rm(dataDir, { recursive: true, force: true }); });

async function open(path, { width = 1440, height = 900, reduced = false, saved = false, block = [] } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? "reduce" : "no-preference" });
  await context.addInitScript(() => { try { sessionStorage.setItem("spear-line-intro", "1"); } catch { /* optional */ } });
  if (saved) await context.addInitScript(() => localStorage.setItem("spear-line-motion", "reduce"));
  for (const pattern of block) await context.route(pattern, route => route.abort());
  const page = await context.newPage(); const problems = [];
  page.on("pageerror", error => problems.push("page error: " + error.message));
  await page.goto(base + path, { waitUntil: "networkidle" });
  return { context, page, problems };
}
const scenesOn = page => page.waitForFunction(() => document.documentElement.classList.contains("scenes-on"), null, { timeout: 10000 });
const state = page => page.evaluate(() => ({
  staged: document.querySelector(".svc-layout")?.classList.contains("is-staged"),
  stages: document.querySelectorAll(".svc-stage").length,
  active: document.querySelector(".svc-stage-item.is-active")?.dataset.stage,
  current: document.querySelector(".svc-card.is-current h3")?.textContent,
  spacers: document.querySelectorAll(".pin-spacer").length,
  owned: document.querySelectorAll(".gs-owned").length,
  on: document.documentElement.classList.contains("scenes-on"),
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
}));
const toServices = (page, offset) => page.evaluate(offset => scrollTo(0, document.querySelector("#services").getBoundingClientRect().top + scrollY + offset), offset);

test("wide, tall screens stage the three service chapters; the stage follows the reading band", { timeout: 60000 }, async () => {
  const { context, page, problems } = await open("/index.html");
  await scenesOn(page);
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll("[data-scene-state]")].map(el => (el.dataset.scene || "hero") + ":" + el.dataset.sceneState)), ["hero:active", "services:active", "process:active", "digital:ready"]);
  for (const [offset, chapter] of [[80, "vehicle"], [520, "supplies"], [900, "logistics"]]) {
    await toServices(page, offset); await page.waitForTimeout(450);
    const now = await state(page);
    assert.equal(now.staged, true); assert.equal(now.active, chapter, "stage image at offset " + offset); assert.ok(now.current, "a chapter is marked current");
    assert.equal(now.overflow, 0, "no horizontal overflow");
  }
  // Every chapter keeps its own title, copy and link in normal flow.
  assert.equal(await page.locator(".svc-card:visible .svc-go").count(), 3);
  assert.deepEqual(problems, []); await context.close();
});

test("focus on a chapter link syncs the decorative stage; the stage is never part of the accessibility tree", { timeout: 60000 }, async () => {
  const { context, page } = await open("/index.html"); await scenesOn(page);
  await toServices(page, 80); await page.waitForTimeout(300);
  await page.locator(".svc-card").nth(2).focus(); await page.waitForTimeout(400);
  assert.equal((await state(page)).active, "logistics");
  assert.equal(await page.locator(".svc-stage").getAttribute("aria-hidden"), "true");
  await context.close();
});

test("short and phone-sized screens keep the stacked layout and never pin", { timeout: 60000 }, async () => {
  for (const [width, height] of [[1440, 600], [390, 844], [844, 390], [1024, 768]]) {
    const { context, page } = await open("/index.html", { width, height }); await scenesOn(page);
    const now = await state(page);
    assert.equal(now.staged, false, width + "x" + height + " must not stage"); assert.equal(now.spacers, 0); assert.equal(now.overflow, 0, width + "x" + height + " overflow");
    assert.ok(await page.locator(".svc-card .svc-media img").first().isVisible(), "each chapter keeps its own photograph when stacked");
    await context.close();
  }
});

test("resizing across the breakpoint rebuilds scenes without duplicates or spacers", { timeout: 90000 }, async () => {
  const { context, page } = await open("/index.html"); await scenesOn(page);
  await toServices(page, 520); await page.waitForTimeout(400);
  for (let i = 0; i < 3; i++) {
    await page.setViewportSize({ width: 900, height: 900 }); await page.waitForTimeout(450);
    assert.equal((await state(page)).staged, false);
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(450);
  }
  const now = await state(page);
  assert.equal(now.staged, true); assert.equal(now.stages, 1); assert.equal(now.spacers, 0); assert.ok(now.current);
  assert.equal(await page.locator(".svc-card").count(), 3);
  await context.close();
});

test("turning reduced motion on and off mid-scroll releases and restores scenes at once and keeps form state", { timeout: 90000 }, async () => {
  const { context, page } = await open("/index.html"); await scenesOn(page);
  await page.fill(".waybill input[type=text], .waybill input:not([type=radio])", "Kampala");
  await toServices(page, 520); await page.waitForTimeout(400);
  const y = await page.evaluate(() => scrollY);
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.waitForTimeout(400);
  let now = await state(page);
  assert.equal(now.on, false); assert.equal(now.staged, false); assert.equal(now.owned, 0, "no scene keeps an owned property");
  assert.equal(await page.evaluate(() => document.querySelectorAll(".rv-arm:not(.is-in)").length), 0, "nothing stays hidden");
  assert.equal(await page.evaluate(() => document.querySelector(".waybill input:not([type=radio])").value), "Kampala", "form state survives");
  assert.ok(Math.abs((await page.evaluate(() => scrollY)) - y) < 700, "the reader keeps their place");
  await page.emulateMedia({ reducedMotion: "no-preference" }); await scenesOn(page);
  now = await state(page);
  assert.equal(now.stages, 1); assert.equal(now.spacers, 0);
  await context.close();
});

test("system reduced motion: complete static page, the optional runtime is never requested", { timeout: 60000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await context.addInitScript(() => { try { sessionStorage.setItem("spear-line-intro", "1"); } catch { /* optional */ } });
  const page = await context.newPage(); const asked = [];
  page.on("request", request => { if (/vendor\/gsap|scenes\.js/.test(request.url())) asked.push(request.url()); });
  await page.goto(base + "/index.html", { waitUntil: "networkidle" }); await page.waitForTimeout(1500);
  assert.deepEqual(asked, []);
  const now = await state(page);
  assert.equal(now.staged, false); assert.equal(now.on, false);
  assert.equal(await page.evaluate(() => document.querySelectorAll(".rv-arm:not(.is-in)").length), 0);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".hero-copy")).opacity), "1", "hero copy is never faded");
  await context.close();
});

test("a blocked animation runtime leaves the whole page usable and fully visible", { timeout: 60000 }, async () => {
  const { context, page, problems } = await open("/index.html", { block: ["**/vendor/gsap/**"] });
  await page.waitForTimeout(2500);
  const now = await state(page);
  assert.equal(now.on, false); assert.equal(now.staged, false); assert.equal(now.owned, 0);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains("is-preloading")), false, "no loader is left behind");
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => [...document.querySelectorAll(".rv-arm")].filter(el => !el.classList.contains("is-in") && el.getBoundingClientRect().top < innerHeight).length), 0, "everything on screen is revealed");
  assert.equal(await page.evaluate(() => [...document.querySelectorAll(".svc-card h3")].every(h => h.getBoundingClientRect().height > 0)), true);
  assert.deepEqual(problems.filter(p => !/vendor|ERR_FAILED|Failed to load|scenes/.test(p)), []);
  await context.close();
});

test("a late runtime does not hide content or replay the hero", { timeout: 60000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => { try { sessionStorage.setItem("spear-line-intro", "1"); } catch { /* optional */ } });
  await context.route("**/vendor/gsap/**", async route => { await new Promise(done => setTimeout(done, 2500)); await route.continue(); });
  const page = await context.newPage();
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  await toServices(page, 300); await page.waitForTimeout(500);
  const before = await page.evaluate(() => ({ y: scrollY, hidden: [...document.querySelectorAll(".rv-arm")].filter(el => !el.classList.contains("is-in") && el.getBoundingClientRect().top < innerHeight && el.getBoundingClientRect().bottom > 0).length }));
  assert.equal(before.hidden, 0);
  await scenesOn(page); await page.waitForTimeout(400);
  const after = await state(page); const y = await page.evaluate(() => scrollY);
  assert.ok(Math.abs(y - before.y) < 4, "no scroll jump when the runtime arrives");
  assert.equal(after.staged, true); assert.ok(after.current, "the correct chapter is chosen from geometry, not the first");
  await context.close();
});

test("keyboard focus into an unrevealed section settles it first", { timeout: 60000 }, async () => {
  const { context, page } = await open("/index.html", { block: ["**/vendor/gsap/**"] });
  const armed = await page.evaluate(() => document.querySelectorAll(".rv-arm:not(.is-in)").length);
  assert.ok(armed > 0, "there are armed sections below the first screen");
  await page.locator(".div-card").first().focus(); await page.waitForTimeout(1100);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".div-card")).opacity), "1");
  assert.equal(await page.evaluate(() => document.querySelector(".div-card").classList.contains("is-in")), true);
  await context.close();
});

test("rapid catalogue input ends with the right results and no stale hidden cards", { timeout: 90000 }, async () => {
  const { context, page } = await open("/vehicles.html");
  const total = await page.locator("[data-car]").count();
  for (const query of ["toy", "toyota la", "toyota land cruiser", "", "nissan", "toyota"]) await page.fill("[data-car-search]", query);
  await page.selectOption("[data-car-sort]", "price-desc"); await page.selectOption("[data-car-sort]", "year-desc");
  await page.fill("[data-car-search]", "toyota"); await page.waitForTimeout(400);
  const check = await page.evaluate(() => {
    const visible = [...document.querySelectorAll("[data-car]")].filter(el => !el.hidden);
    const match = /of (\d+)/.exec(document.querySelector("[data-car-count]").textContent);
    return { visible: visible.length, claimed: match ? Number(match[1]) : null, wrong: visible.filter(el => !/toyota/i.test(el.dataset.carKeywords || el.textContent)).length, focus: document.activeElement?.matches("[data-car-search]") };
  });
  assert.ok(check.visible > 0 && check.visible <= 24); assert.equal(check.wrong, 0); assert.ok(check.claimed >= check.visible); assert.equal(check.focus, true, "focus stays with the control");
  assert.ok(total > 24);
  await page.click("[data-car-controls] [type=reset]"); await page.waitForTimeout(300);
  assert.equal(await page.locator("[data-car]:visible").count(), 24);
  await context.close();
});

test("the photograph viewer shows the newest selection even when an older image resolves last", { timeout: 90000 }, async () => {
  const { context, page } = await open("/vehicles.html");
  await page.locator("[data-car-open]:visible").first().click();
  const sources = await page.evaluate(() => JSON.parse(document.querySelector("[data-car-open]:not([hidden])").dataset.gallery));
  assert.ok(sources.length >= 3, "needs three photographs");
  // Delay photograph 2 so it resolves after photograph 3 has been requested.
  const slow = sources[1].split("/").slice(-2).join("/");
  await page.route("**/" + slow, async route => { await new Promise(done => setTimeout(done, 1200)); await route.continue(); });
  await page.click("[data-gallery-next]"); await page.click("[data-gallery-next]");
  await page.waitForFunction(want => document.querySelector("[data-gallery-image]").getAttribute("src").endsWith(want), sources[2].split("/").slice(-2).join("/"));
  await page.waitForTimeout(1600);
  assert.ok((await page.locator("[data-gallery-image]").getAttribute("src")).endsWith(sources[2].split("/").slice(-2).join("/")), "photograph 3 stays");
  assert.match(await page.locator("[data-gallery-count]").textContent(), /Photograph 3 of/);
  await context.close();
});
