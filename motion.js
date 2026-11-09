// Spear Line motion engine. Progressive: the page is complete without it, and Reduce motion (system or site
// control) stops everything decorative. Reveals hide content only after this script has proved it can show it
// again: it arms elements below the first screen once IntersectionObserver is known to work, and lifts them as
// they scroll into view. Animations use transform and opacity only; nothing animates layout.
const STORAGE_KEY = "spear-line-motion";

export function createMotion({ root = document.documentElement, preference = matchMedia("(prefers-reduced-motion: reduce)") } = {}) {
  const $ = (selector, base = document) => base.querySelector(selector);
  const $$ = (selector, base = document) => [...base.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  let saved = false;
  try { saved = localStorage.getItem(STORAGE_KEY) === "reduce"; } catch { /* Preferences are optional. */ }
  const reduced = () => preference.matches || saved;
  const scrollTasks = [];
  let frame = 0;

  /* Split headings into masked words. Text stays in the heading, so screen readers read it normally. */
  function split(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = "true";
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: node => node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    let i = 0;
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(part)); continue; }
        const outer = document.createElement("span"); outer.className = "w"; outer.dataset.w = part; outer.style.setProperty("--i", i++);
        const inner = document.createElement("span"); inner.className = "wi"; inner.textContent = part;
        outer.append(inner); fragment.append(outer);
      }
      node.replaceWith(fragment);
    }
  }
  $$("[data-split]").forEach(split);

  /* Stagger the children of grids and lists. */
  $$("[data-stagger]").forEach(group => [...group.children].forEach((child, i) => {
    if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "up");
    child.style.setProperty("--d", (Math.min(i, 5) * 0.06).toFixed(2) + "s");
  }));

  /* Reveal on scroll */
  const targets = $$("[data-reveal],[data-split],[data-route]");
  let observer = null;
  function lift(el) { el.classList.add("is-in"); observer?.unobserve(el); }
  function arm() {
    if (reduced() || !("IntersectionObserver" in window)) return;
    try {
      observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) lift(entry.target); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      const below = targets.filter(el => el.getBoundingClientRect().top > innerHeight * 0.92);
      below.forEach(el => { el.classList.add("rv-arm"); observer.observe(el); });
      root.classList.add("rv-on");
      // Safety net: anything still hidden once the page has settled and is on screen is shown.
      const sweep = () => below.forEach(el => { const box = el.getBoundingClientRect(); if (!el.classList.contains("is-in") && box.top < innerHeight && box.bottom > 0) lift(el); });
      setTimeout(sweep, 4000); addEventListener("pageshow", sweep);
    } catch { targets.forEach(el => el.classList.remove("rv-arm")); root.classList.remove("rv-on"); }
  }

  /* Preference control */
  function applyPreference() {
    root.classList.toggle("motion-reduced", reduced());
    root.classList.toggle("motion-ok", !reduced());
    $$("[data-motion-toggle]").forEach(button => {
      button.hidden = false; button.setAttribute("aria-pressed", String(reduced()));
      // When the device asks for reduced motion, the site follows it and the control says so.
      button.disabled = preference.matches;
      button.textContent = preference.matches ? "Motion reduced by your device" : reduced() ? "Motion reduced" : "Reduce motion";
    });
    if (reduced()) { root.classList.remove("rv-on"); targets.forEach(el => el.classList.add("is-in")); }
    schedule();
  }
  $$("[data-motion-toggle]").forEach(button => button.addEventListener("click", () => {
    saved = !reduced();
    try { if (saved) localStorage.setItem(STORAGE_KEY, "reduce"); else localStorage.removeItem(STORAGE_KEY); } catch { /* No storage needed. */ }
    applyPreference();
  }));
  preference.addEventListener("change", applyPreference);
  addEventListener("storage", event => { if (event.key === STORAGE_KEY) { saved = event.newValue === "reduce"; applyPreference(); } });

  /* Pause panning and glows when offscreen or when the tab is hidden. */
  if ("IntersectionObserver" in window) {
    const pauseObserver = new IntersectionObserver(entries => { for (const entry of entries) entry.target.classList.toggle("is-paused", !entry.isIntersecting); }, { rootMargin: "120px" });
    $$(".pan,.glow,.bar-lamp,.hero-panel").forEach(el => pauseObserver.observe(el));
  }
  document.addEventListener("visibilitychange", () => root.classList.toggle("is-hidden-tab", document.hidden));

  /* Timeline (how it works): the line fills and steps light as they pass the reading line. */
  const timeline = $("[data-timeline]");
  if (timeline) {
    const fill = $("[data-timeline-fill]", timeline), items = $$("[data-timeline-step]", timeline);
    scrollTasks.push(() => {
      const calm = reduced(), box = timeline.getBoundingClientRect(), line = innerHeight * 0.62;
      const p = calm ? 1 : clamp((line - box.top) / box.height), on = items.map(step => calm || step.getBoundingClientRect().top < line);
      return () => { fill?.style.setProperty("--p", p.toFixed(3)); items.forEach((step, i) => step.classList.toggle("is-on", on[i])); };
    });
  }

  /* FAQ topic index follows the group in view. */
  const index = $("[data-faq-index]");
  if (index && "IntersectionObserver" in window) {
    const links = new Map($$("a", index).map(link => [link.hash.slice(1), link]));
    const seen = new Map();
    const spy = new IntersectionObserver(entries => {
      for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting ? entry.boundingClientRect.top : null);
      const current = [...seen].filter(([, top]) => top !== null).sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))[0];
      for (const [id, link] of links) { if (current?.[0] === id) link.setAttribute("aria-current", "true"); else link.removeAttribute("aria-current"); }
    }, { rootMargin: "-20% 0px -55% 0px" });
    for (const id of links.keys()) { const el = document.getElementById(id); if (el) spy.observe(el); }
  }

  /* One scroll loop for everything scroll-linked: every task measures first, then all of them write,
     so a frame never alternates layout reads and style writes. */
  function schedule() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; scrollTasks.map(task => task()).forEach(write => write?.()); });
  }
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  addEventListener("pageshow", schedule);

  applyPreference();
  root.classList.add("motion-live");
  arm();
  return { get disabled() { return reduced(); } };
}
