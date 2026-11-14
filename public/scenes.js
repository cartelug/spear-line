// Spear Line scenes: the optional, coordinated scroll scenes (GSAP + ScrollTrigger). motion.js loads this module
// after the page is usable and only on pages that have a scene. Everything here is decoration over a complete
// static layout: if the runtime is blocked, late, or the visitor reduces motion, nothing below runs and nothing
// is hidden. Each scene owns the properties named in its comment and gives them back when it is released.
//
// Scene          Hook                        Owns (and releases)
// hero           .hero--home                 .hero-photo img translate, .hero-seam scale, class gs-owned
// services       [data-scene=services]       class is-staged, .is-active / .is-current, --stage-i
// process        [data-scene=process]        --rp, .is-current on steps, class gs-owned
// digital        [data-scene=digital]        --dl, .ico transform, class dg-arm
const GSAP_VERSION = "3.15.1";

const here = new URL(import.meta.url);
let scriptsReady = null;

const inject = src => new Promise((resolve, reject) => {
  const script = document.createElement("script");
  script.src = src; script.async = true;
  script.onload = () => resolve();
  script.onerror = () => { script.remove(); reject(new Error("Could not load " + src)); };
  document.head.append(script);
});

/* One guarded loader. A second call never injects a second copy; a failure clears itself so a later call may retry. */
export function loadGsap(timeout = 8000) {
  if (window.gsap && window.ScrollTrigger) return Promise.resolve({ gsap: window.gsap, ScrollTrigger: window.ScrollTrigger });
  if (!scriptsReady) {
    const version = here.searchParams.get("v");
    const url = name => { const address = new URL(`vendor/gsap/${GSAP_VERSION}/${name}`, here); if (version) address.searchParams.set("v", version); return address.href; };
    scriptsReady = inject(url("gsap.min.js")).then(() => inject(url("ScrollTrigger.min.js"))).then(() => {
      if (!window.gsap || !window.ScrollTrigger) throw new Error("GSAP did not initialise");
      return { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger };
    });
    scriptsReady.catch(() => { scriptsReady = null; });
  }
  let timer;
  return Promise.race([scriptsReady, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("GSAP load timed out")), timeout); })]).finally(() => clearTimeout(timer));
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function createScenes({ root = document.documentElement, reduced = () => false } = {}) {
  const $ = (selector, base = document) => base.querySelector(selector);
  const $$ = (selector, base = document) => [...base.querySelectorAll(selector)];
  let runtime = null, matchMedia = null, disposed = false, refreshTimer = 0;
  const log = [];
  const mark = (id, state) => { const el = id === "hero" ? $(".hero--home") : $(`[data-scene=${id}]`); if (el) el.dataset.sceneState = state; log.push(id + ":" + state); };

  /* ---- Hero: the photograph drifts a few pixels inside its frame as the hero leaves; a short route segment
          continues toward the service choice. The headline and actions never move or fade. ---- */
  function hero({ gsap }, wide) {
    const section = $(".hero--home"), photo = section && $(".hero-photo img", section), seam = section && $(".hero-seam", section);
    if (!photo) return null;
    const travel = wide ? 28 : 8;
    section.classList.add("gs-owned"); section.style.setProperty("--hero-d", travel + "px");
    // Progress p runs 0..1 from the top of the page until the hero's bottom edge reaches the top of the screen.
    // Photo: 0 to 0.6. Seam segment: 0.45 to 0.85. Absolute progress, so reverse scrolling and restores are exact.
    const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    timeline.to(photo, { y: travel, duration: 0.6 }, 0);
    if (seam) timeline.fromTo(seam, { scaleY: 0 }, { scaleY: 1, duration: 0.4 }, 0.45);
    timeline.set({}, {}, 1);
    mark("hero", "active");
    return () => { section.classList.remove("gs-owned"); section.style.removeProperty("--hero-d"); mark("hero", "static"); };
  }

  /* ---- Services: on tall, wide screens a photograph window sits beside three ordinary chapters. The chapter
          nearest the reading band decides the image. Without room, the chapters stay stacked with their photos. ---- */
  function services({ ScrollTrigger }) {
    const layout = $("[data-scene=services]");
    if (!layout) return null;
    const stage = $(".svc-stage", layout), items = $$(".svc-stage-item", layout), cards = $$(".svc-card", layout);
    if (!stage || items.length !== cards.length || cards.length < 2) return null;
    const header = $(".site-header")?.offsetHeight || 72;
    // The stage needs 320px of height and the chapters 320px of width, or the stacked layout stays.
    if (Math.min(560, innerHeight - header - 64) < 320) return null;
    layout.classList.add("is-staged");
    if ($(".svc-grid", layout).getBoundingClientRect().width < 320) { layout.classList.remove("is-staged"); return null; }

    const headings = cards.map(card => $("h3", card));
    const band = () => header + (innerHeight - header) * 0.45;
    const centre = index => { const box = headings[index].getBoundingClientRect(); return box.top + box.height / 2; };
    let current = -1, token = 0;

    const nearest = () => { const line = band(); let best = 0, gap = Infinity; headings.forEach((_, i) => { const d = Math.abs(centre(i) - line); if (d < gap) { gap = d; best = i; } }); return { best, gap, line }; };
    const ready = image => new Promise((resolve, reject) => {
      if (image.complete) return image.naturalWidth ? resolve() : reject(new Error("broken"));
      image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", () => reject(new Error("broken")), { once: true });
    });
    function show(index) {
      if (index === current) return;
      current = index; const mine = ++token;
      cards.forEach((card, i) => card.classList.toggle("is-current", i === index));
      layout.style.setProperty("--stage-i", index);
      // Swap the photograph only when it has decoded and this chapter is still the current one. A failed or
      // late image leaves the previous photograph in place and the chapter text still current.
      ready($("img", items[index])).then(() => {
        if (mine !== token || disposed) return;
        items.forEach((item, i) => item.classList.toggle("is-active", i === index));
      }).catch(() => {});
    }
    function update(initial) {
      const { best, gap, line } = nearest();
      if (current < 0 || initial) return show(best);
      // Hysteresis: a different chapter must be clearly nearer than the current one before the stage changes.
      if (best !== current && gap + 36 < Math.abs(centre(current) - line)) show(best);
    }
    const trigger = ScrollTrigger.create({ trigger: layout, start: "top bottom", end: "bottom top", onUpdate: () => update(false), onRefresh: () => update(true) });
    const onFocus = event => { const index = cards.findIndex(card => card.contains(event.target)); if (index >= 0) show(index); };
    layout.addEventListener("focusin", onFocus);
    update(true);
    mark("services", "active");
    return () => {
      token++; disposed || trigger.kill(); layout.removeEventListener("focusin", onFocus);
      layout.classList.remove("is-staged"); layout.style.removeProperty("--stage-i");
      cards.forEach(card => card.classList.remove("is-current"));
      items.forEach((item, i) => item.classList.toggle("is-active", i === 0));
      mark("services", "static");
    };
  }

  /* ---- Process: the route fills from the first node to the last as the reading band passes; the last node
          passed is emphasised. All four explanations stay visible and unchanged. ---- */
  function process({ ScrollTrigger }) {
    const list = $("[data-scene=process]");
    const steps = list ? $$(".route-step", list) : [];
    if (steps.length < 2) return null;
    list.classList.add("gs-owned");
    const nodes = steps.map(step => $(".route-num", step) || step);
    const middle = el => { const box = el.getBoundingClientRect(); return box.top + box.height / 2; };
    const draw = () => {
      const line = innerHeight * 0.62, first = middle(nodes[0]), last = middle(nodes[nodes.length - 1]);
      const p = last - first > 1 ? clamp((line - first) / (last - first)) : 1;
      list.style.setProperty("--rp", p.toFixed(3));
      let reached = -1; nodes.forEach((node, i) => { if (middle(node) <= line) reached = i; });
      steps.forEach((step, i) => step.classList.toggle("is-current", i === reached));
    };
    const trigger = ScrollTrigger.create({ trigger: list, start: "top bottom", end: "bottom top", onUpdate: draw, onRefresh: draw });
    draw();
    mark("process", "active");
    return () => { trigger.kill(); list.classList.remove("gs-owned"); list.style.removeProperty("--rp"); steps.forEach(step => step.classList.remove("is-current")); mark("process", "static"); };
  }

  /* ---- Digital: a short line reaches the four capability icons in two groups, once, then stays still. ---- */
  function digital({ gsap, ScrollTrigger }) {
    const list = $("[data-scene=digital]");
    if (!list || list.getBoundingClientRect().top < innerHeight * 0.9) return null; // already in view or passed: stay still
    const icons = $$(".ico", list);
    list.classList.add("dg-arm");
    const timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
    timeline.fromTo(list, { "--dl": 0 }, { "--dl": 1, duration: 0.5 }, 0);
    timeline.fromTo(icons.slice(0, 2), { scale: 0.6, opacity: 0.25 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.06 }, 0.15);
    timeline.fromTo(icons.slice(2), { scale: 0.6, opacity: 0.25 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.06 }, 0.3);
    const trigger = ScrollTrigger.create({ trigger: list, start: "top 88%", once: true, onEnter: () => timeline.play() });
    // Focus inside the list finishes the sequence immediately.
    const finish = () => timeline.progress(1);
    list.addEventListener("focusin", finish);
    mark("digital", "ready");
    return () => { trigger.kill(); list.removeEventListener("focusin", finish); timeline.kill(); gsap.set(icons, { clearProps: "transform,opacity" }); list.classList.remove("dg-arm"); list.style.removeProperty("--dl"); mark("digital", "static"); };
  }

  /* ---- Lifecycle ---- */
  function release() {
    if (matchMedia) { matchMedia.revert(); matchMedia = null; }
    root.classList.remove("scenes-on");
  }
  function apply() {
    release();
    if (disposed || !runtime || reduced()) return;
    const { gsap } = runtime;
    matchMedia = gsap.matchMedia();
    // One coherent set of conditions: the tall, wide composition versus everything else (including short
    // landscape and zoomed layouts, which stack and never pin). Pointer type does not decide layout.
    matchMedia.add({ wide: "(min-width: 1100px) and (min-height: 720px)", compact: "(max-width: 1099.98px), (max-height: 719.98px)" }, context => {
      const cleanups = [hero(runtime, !!context.conditions.wide), process(runtime), digital(runtime), context.conditions.wide ? services(runtime) : null].filter(Boolean);
      return () => cleanups.forEach(clean => clean());
    });
    root.classList.add("scenes-on");
  }
  // Layout can change without a resize: fonts settle, a photograph decodes, a list is filtered or expanded.
  // Callers say why; changes coalesce into one refresh.
  function refresh(reason = "layout") {
    if (disposed || !runtime || refreshTimer) return;
    refreshTimer = setTimeout(() => { refreshTimer = 0; if (!disposed) runtime.ScrollTrigger.refresh(); log.push("refresh:" + reason); }, 120);
  }
  const onLayout = event => refresh(event.detail?.reason || "layout");
  const onShow = event => { if (event.persisted) refresh("restore"); };

  return {
    async start() {
      runtime = await loadGsap();
      if (disposed) return;
      runtime.gsap.registerPlugin(runtime.ScrollTrigger);
      document.addEventListener("spear:layout", onLayout);
      addEventListener("pageshow", onShow);
      document.fonts?.ready.then(() => refresh("fonts"));
      apply();
    },
    setPreference() { if (runtime && !disposed) apply(); },
    refresh,
    get log() { return log.slice(); },
    destroy() {
      disposed = true; clearTimeout(refreshTimer);
      document.removeEventListener("spear:layout", onLayout); removeEventListener("pageshow", onShow);
      release();
    }
  };
}
