// Spear Line motion engine. Progressive: content is complete without it, and Reduce motion (system or site
// control) stops everything decorative. Animations use transform, opacity and the variable width axis only.
const STORAGE_KEY = "spear-line-motion";
const SVG = "http://www.w3.org/2000/svg";

export function createMotion({ root = document.documentElement, preference = matchMedia("(prefers-reduced-motion: reduce)") } = {}) {
  const $ = (selector, base = document) => base.querySelector(selector);
  const $$ = (selector, base = document) => [...base.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const fine = matchMedia("(hover:hover) and (pointer:fine)");
  const wide = matchMedia("(min-width:900px)");
  let saved = false;
  try { saved = localStorage.getItem(STORAGE_KEY) === "reduce"; } catch { /* Preferences are optional. */ }
  const reduced = () => preference.matches || saved;
  const scrollTasks = [];
  let frame = 0;

  /* Preference control */
  function applyPreference() {
    root.classList.toggle("motion-reduced", reduced());
    root.classList.toggle("motion-ok", !reduced());
    root.classList.toggle("cursor-on", !reduced() && fine.matches);
    $$("[data-motion-toggle]").forEach(button => {
      button.hidden = false; button.setAttribute("aria-pressed", String(reduced()));
      // When the device asks for reduced motion, the site follows it and the control says so.
      button.disabled = preference.matches;
      button.textContent = preference.matches ? "Motion reduced by your device" : reduced() ? "Motion reduced" : "Reduce motion";
    });
    if (reduced()) $$("[data-reveal],[data-split]").forEach(el => el.classList.add("is-in"));
    schedule();
  }
  $$("[data-motion-toggle]").forEach(button => button.addEventListener("click", () => {
    saved = !reduced();
    try { if (saved) localStorage.setItem(STORAGE_KEY, "reduce"); else localStorage.removeItem(STORAGE_KEY); } catch { /* No storage needed. */ }
    applyPreference();
  }));
  preference.addEventListener("change", applyPreference);
  window.addEventListener("storage", event => { if (event.key === STORAGE_KEY) { saved = event.newValue === "reduce"; applyPreference(); } });

  /* Split headings into masked words. Text stays in the heading, so screen readers read it normally. */
  function split(el, wordClass = "w", innerClass = "wi") {
    if (el.dataset.splitDone) return [];
    el.dataset.splitDone = "true";
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: node => node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    const words = [];
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(part)); continue; }
        const outer = document.createElement("span"); outer.className = wordClass;
        if (innerClass) outer.dataset.w = part;
        if (innerClass) { const inner = document.createElement("span"); inner.className = innerClass; inner.textContent = part; outer.append(inner); }
        else outer.textContent = part;
        fragment.append(outer); words.push(outer);
      }
      node.replaceWith(fragment);
    }
    words.forEach((word, i) => word.style.setProperty("--i", i));
    return words;
  }
  $$("[data-split]").forEach(el => split(el));
  const readWords = $$("[data-read]").flatMap(el => split(el, "rw", null));

  /* Stagger children of grids and lists. */
  $$("[data-stagger]").forEach(group => [...group.children].forEach((child, i) => {
    if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "up");
    child.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
  }));

  /* Reveal on scroll */
  const revealables = $$("[data-reveal],[data-split]");
  // If this module arrived after boot.js lifted the reveal states, show everything rather than hiding it again.
  if (root.classList.contains("motion-late")) revealables.forEach(el => el.classList.add("is-in"));
  const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-in"); revealObserver.unobserve(entry.target); }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;
  function startReveals() {
    for (const el of revealables) { if (revealObserver) revealObserver.observe(el); else el.classList.add("is-in"); }
  }

  /* Pause panning, marquees and glows when they are offscreen or the tab is hidden. */
  const pausable = $$(".pan,.marquee,.glow,.backdrop,.topo,.bar-lamp,.hero-veil,.mega");
  if ("IntersectionObserver" in window) {
    const pauseObserver = new IntersectionObserver(entries => { for (const entry of entries) entry.target.classList.toggle("is-paused", !entry.isIntersecting); }, { rootMargin: "120px" });
    pausable.forEach(el => pauseObserver.observe(el));
  }
  document.addEventListener("visibilitychange", () => root.classList.toggle("is-hidden-tab", document.hidden));

  /* Parallax (larger screens only). Browsers with scroll-driven animations run it in CSS, off the main thread. */
  const parallax = CSS.supports?.("animation-timeline: view()") ? [] : $$("[data-parallax]");
  if (parallax.length) scrollTasks.push(() => {
    const active = !reduced() && wide.matches, updates = [];
    for (const el of parallax) {
      if (!active) { updates.push([el, ""]); continue; }
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > innerHeight + 200) continue;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      updates.push([el, ((box.top + box.height / 2 - innerHeight / 2) * -speed).toFixed(1) + "px"]);
    }
    return () => updates.forEach(([el, value]) => { if (value) el.style.setProperty("--py", value); else el.style.removeProperty("--py"); });
  });

  /* Reading reveal: words of the intro statement light up as it crosses the screen. */
  const statement = $("[data-read]");
  if (statement && readWords.length) scrollTasks.push(() => {
    const box = reduced() ? null : statement.getBoundingClientRect();
    const lit = box ? Math.round(clamp((innerHeight * 0.9 - box.top) / (innerHeight * 0.55 + box.height * 0.35)) * readWords.length) : readWords.length;
    return () => readWords.forEach((word, i) => word.classList.toggle("is-lit", i < lit));
  });

  /* Route: the spear travels the path as the section scrolls past and lights each stop. */
  const route = $("[data-route]");
  if (route) {
    const path = $("[data-route-path]", route), spear = $("[data-route-spear]", route), nodes = $("[data-route-nodes]", route), stops = $$("[data-route-stop]", route);
    if (path?.getTotalLength && spear && nodes) {
      const length = path.getTotalLength(), marks = [0.02, 0.5, 0.98];
      const circles = marks.map(fraction => {
        const point = path.getPointAtLength(length * fraction);
        const group = document.createElementNS(SVG, "g"); group.setAttribute("class", "route-node");
        const circle = document.createElementNS(SVG, "circle");
        circle.setAttribute("cx", point.x.toFixed(1)); circle.setAttribute("cy", point.y.toFixed(1)); circle.setAttribute("r", "9");
        group.append(circle); nodes.append(group); return group;
      });
      path.style.strokeDasharray = String(length);
      const draw = progress => {
        path.style.strokeDashoffset = String(length * (1 - progress));
        const at = length * progress, ahead = path.getPointAtLength(Math.min(length, at + 2)), here = path.getPointAtLength(at), behind = path.getPointAtLength(Math.max(0, at - 2));
        const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
        spear.setAttribute("transform", "translate(" + here.x.toFixed(1) + " " + here.y.toFixed(1) + ") rotate(" + (angle + 45).toFixed(1) + ")");
        marks.forEach((fraction, i) => { const on = progress >= fraction - 0.012; circles[i].classList.toggle("is-on", on); stops[i]?.classList.toggle("is-on", on); });
      };
      scrollTasks.push(() => {
        const box = reduced() ? null : route.getBoundingClientRect();
        const progress = box ? clamp((innerHeight * 0.9 - box.top) / (box.height + innerHeight * 0.3) * 1.2) : 1;
        return () => draw(progress);
      });
    }
  }

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

  /* Process (home): the sticky photograph and counter follow the step being read. */
  const processBlock = $("[data-process]");
  if (processBlock) {
    const frames = $$("[data-process-frame]", processBlock), items = $$("[data-process-step]", processBlock), count = $("[data-process-count]", processBlock);
    scrollTasks.push(() => {
      let active = 0;
      items.forEach((step, i) => { if (step.getBoundingClientRect().top < innerHeight * 0.55) active = i; });
      const all = reduced() || !wide.matches;
      return () => {
        items.forEach((step, i) => step.classList.toggle("is-on", all || i === active));
        frames.forEach((frame, i) => frame.classList.toggle("is-active", i === active));
        if (count) count.textContent = String(active + 1).padStart(2, "0");
      };
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

  /* Bar card pours once; counters count once. */
  if ("IntersectionObserver" in window) {
    const once = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target; once.unobserve(el);
        if (el.classList.contains("bar-card")) el.classList.add("is-poured");
        if (el.dataset.count !== undefined) {
          const target = Number(el.dataset.count) || 0;
          if (reduced()) { el.textContent = String(target); continue; }
          const start = performance.now(), duration = 1600;
          const tick = now => { const t = clamp((now - start) / duration), eased = 1 - Math.pow(1 - t, 4); el.textContent = String(Math.round(target * eased)); if (t < 1) requestAnimationFrame(tick); };
          requestAnimationFrame(tick);
        }
      }
    }, { threshold: 0.5 });
    $$(".bar-card,[data-count]").forEach(el => once.observe(el));
  } else $$(".bar-card").forEach(el => el.classList.add("is-poured"));

  /* Pointer: tilt and spotlight on cards, magnetic buttons and a cursor ring. Fine pointers only. */
  const cursor = $(".cursor"), cursorRing = cursor?.firstElementChild;
  let cx = -100, cy = -100, rx = -100, ry = -100, cursorFrame = 0;
  function cursorLoop() {
    rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2;
    if (cursorRing) cursorRing.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
    cursorFrame = Math.abs(cx - rx) + Math.abs(cy - ry) > 0.3 ? requestAnimationFrame(cursorLoop) : 0;
  }
  document.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse" || reduced()) return;
    cx = event.clientX; cy = event.clientY;
    if (!cursorFrame && root.classList.contains("cursor-on")) cursorFrame = requestAnimationFrame(cursorLoop);
    const tilt = event.target.closest?.("[data-tilt]");
    if (tilt) {
      const box = tilt.getBoundingClientRect(), x = (event.clientX - box.left) / box.width, y = (event.clientY - box.top) / box.height;
      tilt.classList.add("is-tilting");
      tilt.style.setProperty("--rx", ((0.5 - y) * 6).toFixed(2) + "deg"); tilt.style.setProperty("--ry", ((x - 0.5) * 8).toFixed(2) + "deg");
      tilt.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); tilt.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    }
    const magnet = event.target.closest?.(".btn,.round");
    if (magnet) {
      const box = magnet.getBoundingClientRect();
      magnet.style.setProperty("--tx", clamp((event.clientX - box.left - box.width / 2) * 0.16, -8, 8).toFixed(1) + "px");
      magnet.style.setProperty("--ty", clamp((event.clientY - box.top - box.height / 2) * 0.24, -6, 6).toFixed(1) + "px");
    }
    cursor?.classList.toggle("is-hover", Boolean(event.target.closest?.("a,button,label,summary,[data-tilt],input,textarea")));
  }, { passive: true });
  document.addEventListener("pointerout", event => {
    const from = event.target.closest?.("[data-tilt],.btn,.round");
    if (!from || from.contains(event.relatedTarget)) return;
    from.classList.remove("is-tilting");
    ["--rx", "--ry", "--tx", "--ty"].forEach(name => from.style.removeProperty(name));
  }, { passive: true });

  /* Hero depth: on fine pointers the photograph and the waybill drift a few pixels against the pointer. */
  const heroEl = $(".hero");
  let hx = 0, hy = 0, tx = 0, ty = 0, depthFrame = 0;
  function depthLoop() {
    hx += (tx - hx) * 0.08; hy += (ty - hy) * 0.08;
    heroEl.style.setProperty("--hx", hx.toFixed(3)); heroEl.style.setProperty("--hy", hy.toFixed(3));
    depthFrame = Math.abs(tx - hx) + Math.abs(ty - hy) > 0.002 ? requestAnimationFrame(depthLoop) : 0;
  }
  if (heroEl) {
    heroEl.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse" || reduced() || !fine.matches) return;
      const box = heroEl.getBoundingClientRect();
      tx = ((event.clientX - box.left) / box.width - 0.5) * 2; ty = ((event.clientY - box.top) / box.height - 0.5) * 2;
      if (!depthFrame) depthFrame = requestAnimationFrame(depthLoop);
    }, { passive: true });
    heroEl.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!depthFrame) depthFrame = requestAnimationFrame(depthLoop); });
  }

  /* One scroll loop for everything scroll-linked: every task measures first, then all of them write,
     so a frame never alternates layout reads and style writes. */
  function schedule() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; scrollTasks.map(task => task()).forEach(write => write?.()); });
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);

  applyPreference();
  root.classList.add("motion-live");
  // Wait for the preloader so the first headline animates in view rather than behind the doors.
  if (root.classList.contains("is-preloading")) document.addEventListener("spear:preloaded", startReveals, { once: true });
  else startReveals();
  // Ambient light and dust begin once the page has loaded and the browser is idle, never during start-up.
  const startAmbient = () => root.classList.add("is-ambient");
  const whenIdle = () => ("requestIdleCallback" in window ? requestIdleCallback(startAmbient, { timeout: 2500 }) : setTimeout(startAmbient, 1200));
  if (document.readyState === "complete") setTimeout(whenIdle, 400); else window.addEventListener("load", () => setTimeout(whenIdle, 400), { once: true });
  return { get disabled() { return reduced(); } };
}
