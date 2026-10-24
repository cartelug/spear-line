(function () {
  var root = document.documentElement;
  root.classList.add("js");
  document.addEventListener("change",function(event){
    if(event.target.matches('input[name="service"]')&&event.target.form)event.target.form.dataset.serviceTouched="true";
  },true);
  try { if (localStorage.getItem("spear-line-motion") === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.classList.add("motion-reduced"); } catch (e) { /* Motion preferences are optional. */ }
  if (!root.hasAttribute("data-intro")) return;
  var KEY = "spear-line-intro", done = false, sequence = false, ready = document.readyState !== "loading";
  function eligible() {
    if (root.classList.contains("motion-reduced")) return false;
    if (window.matchMedia("(max-width:599px)").matches) return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    if (nav && nav.type !== "navigate") return false;
    if (document.referrer) { try { if (new URL(document.referrer).origin === location.origin) return false; } catch (e) { return false; } }
    try { if (sessionStorage.getItem(KEY)) return false; sessionStorage.setItem(KEY, "1"); } catch (e) { /* storage is optional */ }
    return true;
  }
  function cleanup() { root.classList.remove("intro", "intro-out"); }
  function land() {
    var line = document.querySelector(".intro-line"), rule = document.querySelector("[data-hero-rule]");
    if (!line || !rule || !line.animate) return;
    var a = line.getBoundingClientRect(), b = rule.getBoundingClientRect();
    if (!a.width || b.bottom < 0 || b.top > window.innerHeight) return;
    line.animate([{ transform: "none" }, { transform: "translate(" + (b.left - a.left) + "px," + (b.top - a.top) + "px) scaleX(" + b.width / a.width + ")" }], { duration: 420, easing: "cubic-bezier(.65,0,.2,1)", fill: "forwards" });
  }
  function exit() {
    if (done) return;
    done = true;
    try { land(); } catch (e) { /* landing is decoration */ }
    root.classList.add("intro-out");
    setTimeout(cleanup, 800);
  }
  function check() { if (sequence && ready) exit(); }
  try {
    if (!eligible()) return;
    setTimeout(exit, 2000);
    setTimeout(function () { sequence = true; check(); }, 980);
    if (!ready) document.addEventListener("DOMContentLoaded", function () { ready = true; check(); });
    window.addEventListener("pageshow", function (event) { if (event.persisted) { done = true; cleanup(); } });
    root.classList.add("intro");
  } catch (e) { cleanup(); }
})();
