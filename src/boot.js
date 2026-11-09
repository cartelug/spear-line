// Inlined into every page's <head> by the build, so it runs before the first paint without a request:
// marks JavaScript, applies the saved motion preference, loads the full stylesheet and runs the preloader.
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // The first screen is styled by rules inlined in <head>; the full stylesheet arrives without blocking that paint.
  // window.spearCss resolves once it applies, so scripts that measure the layout can wait for it.
  var deferred = document.querySelectorAll("link[data-defer]"), pending = deferred.length, settle;
  window.spearCss = new Promise(function (resolve) { settle = resolve; });
  function applied() { if (--pending <= 0) { root.classList.add("css-ready"); settle(); } }
  if (!pending) { pending = 1; applied(); }
  for (var d = 0; d < deferred.length; d++) (function (link) {
    var done = false;
    function apply() { if (done) return; done = true; link.media = "all"; applied(); }
    if (link.sheet) apply();
    else { link.addEventListener("load", apply); link.addEventListener("error", apply); }
  })(deferred[d]);
  document.addEventListener("change", function (event) {
    if (event.target.matches('input[name="service"]') && event.target.form) event.target.form.dataset.serviceTouched = "true";
  }, true);

  // A page prerendered from a hovered link holds its heading entrance until the visitor actually arrives.
  if (document.prerendering) {
    root.classList.add("is-prerendering");
    document.addEventListener("prerenderingchange", function () { root.classList.remove("is-prerendering"); }, { once: true });
  }

  // Cross-document view transitions: tell the browser which way the visitor is travelling, so back and forward
  // move in opposite directions. Browsers without view transitions never fire this and navigate normally.
  window.addEventListener("pagereveal", function (event) {
    try {
      var activation = window.navigation && navigation.activation;
      if (!event.viewTransition || !activation) return;
      var back = activation.navigationType === "traverse" && activation.from && activation.entry.index < activation.from.index;
      event.viewTransition.types.add(back ? "back" : "forward");
    } catch (e) { /* The transition still runs without a direction. */ }
  });

  var reduced = false;
  try { reduced = localStorage.getItem("spear-line-motion") === "reduce"; } catch (e) { /* Preferences are optional. */ }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) reduced = true;
  // motion-ok only says that decorative motion is allowed. Nothing is hidden because of it: reveal states
  // are armed later, by motion.js, and only on elements below the first screen.
  root.classList.add(reduced ? "motion-reduced" : "motion-ok");

  // The preloader greets a visitor arriving from outside: once per browser tab, on a fresh navigation,
  // never under Reduce motion, Save-Data or a slow connection, reloads, back/forward or links followed within the site.
  var KEY = "spear-line-intro", seen = false;
  try { seen = !!sessionStorage.getItem(KEY); sessionStorage.setItem(KEY, "1"); } catch (e) { seen = true; }
  var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (nav && nav.type !== "navigate") seen = true;
  if (document.referrer) { try { if (new URL(document.referrer).origin === location.origin) seen = true; } catch (e) { seen = true; } }
  var connection = navigator.connection;
  if (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ""))) seen = true;
  if (reduced || seen || document.visibilityState === "hidden") return;

  root.classList.add("is-preloading");
  var phone = window.matchMedia("(max-width: 599px)").matches;
  // The route sequence takes MIN. The panel lifts once it has played and the hero photograph and fonts are ready,
  // and in any case by LIFT, so the whole preloader (lift included) never runs longer than 1.8 s (1.2 s on phones).
  var MIN = phone ? 800 : 1050, LIFT = phone ? 940 : 1350, EXIT = phone ? 260 : 450, done = false, minPassed = false, ready = false;

  function setInert(on) {
    var parts = document.querySelectorAll("main, .site-header, .site-footer, .dock, .skip");
    for (var i = 0; i < parts.length; i++) parts[i].inert = on;
  }
  function finish() {
    if (done) return; done = true;
    root.classList.add("pl-exit");
    setTimeout(function () {
      setInert(false);
      root.classList.remove("is-preloading", "pl-exit");
      document.dispatchEvent(new CustomEvent("spear:preloaded"));
    }, EXIT + 20);
  }
  // Fail-safe, registered before anything that could throw: whatever happens to scripts, images or fonts,
  // the page is revealed and focus unlocks. (A CSS animation on .preloader hides it too, should scripts stop.)
  setTimeout(finish, LIFT);
  setTimeout(function () { minPassed = true; if (ready) finish(); }, MIN);

  function init() {
    // While the panel covers the page, keyboard focus cannot wander into the hidden content.
    if (!done) setInert(true);
    var hero = document.querySelector(".hero-photo img, .hero-media img, .lost img");
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var photo = new Promise(function (resolve) {
      if (!hero || hero.complete) return resolve();
      hero.addEventListener("load", resolve); hero.addEventListener("error", resolve);
    });
    Promise.all([fonts, photo]).then(function () { ready = true; if (minPassed) finish(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
