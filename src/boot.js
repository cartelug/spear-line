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

  var reduced = false;
  try { reduced = localStorage.getItem("spear-line-motion") === "reduce"; } catch (e) { /* Preferences are optional. */ }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) reduced = true;
  if (reduced) root.classList.add("motion-reduced");
  else {
    // Reveal states apply from the first paint; if the motion module never confirms, they are lifted.
    root.classList.add("motion-ok");
    setTimeout(function () { if (!root.classList.contains("motion-live")) { root.classList.remove("motion-ok"); root.classList.add("motion-late"); } }, 4000);
  }

  // The preloader greets a visitor arriving from outside: once per browser tab, on a fresh navigation,
  // never under Reduce motion, Save-Data, reloads, back/forward or links followed within the site.
  var KEY = "spear-line-intro", seen = false;
  try { seen = !!sessionStorage.getItem(KEY); sessionStorage.setItem(KEY, "1"); } catch (e) { seen = true; }
  var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (nav && nav.type !== "navigate") seen = true;
  if (document.referrer) { try { if (new URL(document.referrer).origin === location.origin) seen = true; } catch (e) { seen = true; } }
  if (navigator.connection && navigator.connection.saveData) seen = true;
  if (reduced || seen || document.visibilityState === "hidden") return;

  // pl-ran stays for the whole visit: first-screen headings then open in place instead of rising from hidden.
  root.classList.add("is-preloading", "pl-run", "pl-ran");
  var phone = window.matchMedia("(max-width: 599px)").matches;
  var started = performance.now(), MIN = phone ? 700 : 1000, MAX = phone ? 2000 : 2400, target = 0.08, shown = 0, done = false, frame = 0;
  var fill, spear, lineWidth = 0;

  function render() {
    shown += (target - shown) * 0.14;
    if (target >= 1 && 1 - shown < 0.004) shown = 1;
    if (fill) fill.style.transform = "scaleX(" + shown.toFixed(4) + ")";
    if (spear) spear.style.transform = "translateX(" + (shown * lineWidth).toFixed(1) + "px) rotate(45deg)";
    var elapsed = performance.now() - started;
    if ((shown === 1 && elapsed > MIN) || elapsed > MAX) return finish();
    frame = requestAnimationFrame(render);
  }
  function raise(value) { target = Math.max(target, value); }

  function finish() {
    if (done) return; done = true; cancelAnimationFrame(frame);
    var logo = document.querySelector(".pl-logo"), brand = document.querySelector(".site-header .brand-logo");
    if (logo && brand) {
      var from = logo.getBoundingClientRect(), to = brand.getBoundingClientRect();
      if (from.width && to.width) {
        var scale = to.width / from.width;
        logo.style.transform = "translate(" + (to.left - from.left) + "px," + (to.top - from.top) + "px) scale(" + scale + ")";
      }
    }
    root.classList.add("pl-exit");
    setTimeout(function () {
      setInert(false);
      root.classList.remove("is-preloading", "pl-run", "pl-exit");
      document.dispatchEvent(new CustomEvent("spear:preloaded"));
    }, 720);
  }
  // Fail safe: whatever happens, the page is revealed.
  setTimeout(finish, MAX + 400);

  // While the doors are closed, keyboard focus cannot wander into the hidden page.
  function setInert(on) {
    var parts = document.querySelectorAll("main, .site-header, .site-footer, .dock, .skip");
    for (var i = 0; i < parts.length; i++) parts[i].inert = on;
  }
  function ready() {
    if (!done) setInert(true);
    fill = document.querySelector(".pl-fill"); spear = document.querySelector(".pl-spear");
    var line = document.querySelector(".pl-line"); lineWidth = line ? line.getBoundingClientRect().width : 0;
    raise(0.3);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { raise(0.62); });
    var hero = document.querySelector(".hero-media img, .page-hero img, .lost img");
    if (!hero || hero.complete) raise(hero ? 1 : 0.9);
    else { hero.addEventListener("load", function () { raise(1); }); hero.addEventListener("error", function () { raise(1); }); }
    window.addEventListener("load", function () { raise(1); });
    frame = requestAnimationFrame(render);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
