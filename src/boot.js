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
      if (!event.viewTransition) return;
      // The preloader is this arrival's transition; a second one would slide page parts across its panel.
      if (root.classList.contains("is-preloading")) { event.viewTransition.skipTransition(); return; }
      if (!activation) return;
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

  // The preloader greets every arrival with that page's own icon and name: when the site is opened, when a page is
  // refreshed, and (shorter) when a link is followed within the site. Never under Reduce motion, Save-Data or a slow
  // connection, on back/forward, or in a background tab. Tests switch it off through sessionStorage.
  var KEY = "spear-line-intro", off = false, quick = false;
  try { off = !!sessionStorage.getItem(KEY); } catch (e) { /* Storage is optional; the preloader does not depend on it. */ }
  var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0], type = nav ? nav.type : "navigate";
  if (type === "back_forward") off = true;
  // A link followed within the site gets the short sequence; opening the site or refreshing a page gets the full one.
  if (type === "navigate" && document.referrer) { try { quick = new URL(document.referrer).origin === location.origin; } catch (e) { /* An unreadable referrer counts as outside. */ } }
  var connection = navigator.connection;
  if (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ""))) off = true;
  if (reduced || off) return;
  // A page prerendered from a hovered or touched link plays its preloader when the visitor actually arrives.
  var restart = !!document.prerendering;
  if (restart) document.addEventListener("prerenderingchange", start, { once: true }); else start();

  function start() {
  if (document.visibilityState === "hidden") return;
  root.classList.add("is-preloading");
  if (quick) root.classList.add("pl-quick");
  var phone = window.matchMedia("(max-width: 599px)").matches;
  // The route sequence takes MIN. The panel lifts once it has played and the hero photograph and fonts are ready,
  // and in any case by LIFT, so the whole preloader (lift included) never runs longer than 1.8 s (1.2 s on phones),
  // and about 1 s when moving between pages.
  var MIN = quick ? (phone ? 520 : 600) : (phone ? 800 : 1050), LIFT = quick ? (phone ? 680 : 800) : (phone ? 940 : 1350), EXIT = quick || phone ? 260 : 450, done = false, minPassed = false, ready = false;

  function setInert(on) {
    var parts = document.querySelectorAll("main, .site-header, .site-footer, .dock, .skip");
    for (var i = 0; i < parts.length; i++) parts[i].inert = on;
  }
  function finish() {
    if (done) return; done = true;
    root.classList.add("pl-exit");
    setTimeout(function () {
      setInert(false);
      root.classList.remove("is-preloading", "pl-exit", "pl-quick");
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
    // The route's clock started when the page was drawn in the background; rewind it for the arrival.
    var route = document.querySelector(".pl-route");
    if (restart && route && route.setCurrentTime) { try { route.setCurrentTime(0); } catch (e) { /* The line is then already drawn. */ } }
    var hero = document.querySelector(".hero-photo img, .hero-media img, .lost img");
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var photo = new Promise(function (resolve) {
      if (!hero || hero.complete) return resolve();
      hero.addEventListener("load", resolve); hero.addEventListener("error", resolve);
    });
    Promise.all([fonts, photo]).then(function () { ready = true; if (minPassed) finish(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  }
})();
