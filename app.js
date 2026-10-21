import { validateEnquiry } from "./validation.js";
const config = window.SPEAR_CONFIG || {};
const preview = window.SPEAR_PREVIEW === true;
const canSubmit = config.enquiriesEnabled === true && !preview;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
$$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
const root = document.documentElement;
const menu = $(".menu-toggle"), nav = $("#site-menu");
function setMenu(open) {
  if (!menu) return;
  menu.setAttribute("aria-expanded", String(open));
  root.classList.toggle("menu-open", open);
  $$("main, .site-footer").forEach(el => { el.inert = open; });
}
menu?.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
nav?.addEventListener("click", event => { if (event.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") { setMenu(false); menu.focus(); }
});
window.matchMedia("(min-width:900px)").addEventListener("change", event => { if (event.matches) setMenu(false); });
window.addEventListener("pageshow", event => { if (event.persisted) setMenu(false); });

const sentinel = $(".top-sentinel");
if (sentinel && "IntersectionObserver" in window) new IntersectionObserver(([entry]) => root.classList.toggle("is-scrolled", !entry.isIntersecting)).observe(sentinel);

// One-shot reveals. Nothing is hidden until this script has run, and only when motion is welcome.
const revealable = $$("[data-reveal],[data-draw]");
if (revealable.length && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const pending = new Set(), seen = el => { el.classList.add("is-in"); pending.delete(el); observer.unobserve(el); };
  for (const el of revealable) { if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add("is-in"); else pending.add(el); }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting || entry.boundingClientRect.top < 0) seen(entry.target);
    if (!pending.size) window.removeEventListener("scroll", onScroll);
  }, { rootMargin: "0px 0px -12% 0px" });
  let settle;
  // A fling can carry an element past the viewport between observer samples; reveal anything left behind once scrolling settles.
  function onScroll() { clearTimeout(settle); settle = setTimeout(() => { for (const el of [...pending]) if (el.getBoundingClientRect().bottom < 0) seen(el); if (!pending.size) window.removeEventListener("scroll", onScroll); }, 140); }
  if (pending.size) { root.classList.add("reveal-ready"); pending.forEach(el => observer.observe(el)); window.addEventListener("scroll", onScroll, { passive: true }); }
}

function addContact(selector, href, label) {
  $$(selector).forEach(el => {
    const link = document.createElement("a"); link.href = href; link.textContent = label;
    el.replaceChildren(link); el.hidden = false;
  });
}
const emailOK = typeof config.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email);
if (emailOK) addContact("[data-contact-email]", "mailto:" + config.email, config.email);
if (typeof config.phone === "string" && /^\+?[\d\s()-]{7,30}$/.test(config.phone)) addContact("[data-contact-phone]", "tel:" + config.phone.replace(/[^\d+]/g,""), config.phone);
if (typeof config.whatsapp === "string" && /^\+?\d{7,15}$/.test(config.whatsapp)) addContact("[data-contact-whatsapp]", "https://wa.me/" + config.whatsapp.replace(/\D/g,""), "WhatsApp");
$$("[data-contact-container]").forEach(el => { el.hidden = !el.querySelector("a"); });
if (config.legalName) $$("[data-legal-identity]").forEach(el => { el.textContent = "The operator is " + config.legalName + "."; });
if (config.address) $$("[data-address]").forEach(el => { el.hidden = false; el.textContent = config.address; });
if (emailOK) {
  addContact("[data-privacy-contact]", "mailto:" + config.email, "Contact: " + config.email);
  $$("[data-rights-contact]").forEach(el => {
    el.textContent = "To request access, correction or deletion of your enquiry, email ";
    const link = document.createElement("a"); link.href = "mailto:" + config.email; link.textContent = config.email;
    el.append(link, ". Include your enquiry reference if available.");
  });
}
$$("[data-enquiry-step]").forEach(el => { if (canSubmit) el.textContent = el.dataset.live; });
if (canSubmit) $$("[data-privacy-status]").forEach(el => { el.textContent = "Online enquiries are enabled. Details you submit are stored for Spear Line to review."; });
if (canSubmit && Number.isInteger(config.retentionDays)) $$("[data-retention]").forEach(el => { el.textContent = "Unconverted website enquiry records are retained for up to " + config.retentionDays + " days, unless an applicable record-keeping requirement requires a different period. Contact the operator about records associated with an agreed transaction."; });

const form = $("#enquiry-form");
if (form) {
  const mode = $("#form-mode"), message = $("#form-message"), submit = $("#submit-enquiry"), label = $("[data-submit-label]");
  const query = new URLSearchParams(preview ? (window.SPEAR_PREVIEW_QUERY || "") : location.search).get("service");
  const selected = query === "timber" ? "timber" : "vehicle";
  form.elements.service.value = selected;
  let downloadURL = null, busy = false;
  function clearErrors() {
    $$(".field-error",form).forEach(el => { el.textContent = ""; });
    $$("[aria-invalid]",form).forEach(el => el.removeAttribute("aria-invalid"));
  }
  function updateService() {
    const service = form.elements.service.value;
    $$("[data-service-fields]",form).forEach(el => {
      const active = el.dataset.serviceFields === service;
      el.hidden = !active; el.disabled = !active;
    });
    clearErrors(); message.replaceChildren(); message.className = "form-message";
  }
  $$('input[name="service"]',form).forEach(el => el.addEventListener("change",updateService));
  updateService();
  mode.textContent = canSubmit ? "Send your requirements to Spear Line. We’ll show a reference after the request has been received." : (preview ? "Preview mode: prepare a downloadable enquiry. Nothing is sent to Spear Line." : "Online submission is not open yet. You can prepare and download your requirements here.");
  label.textContent = canSubmit ? "Send enquiry" : "Prepare enquiry";
  submit.disabled = false;
  function show(text,kind="") {
    message.className = "form-message " + kind; message.textContent = text; message.focus();
  }
  function renderErrors(errors) {
    clearErrors();
    for (const [key,error] of Object.entries(errors)) {
      const input = form.elements.namedItem(key), output = document.getElementById(key + "-error");
      if (output) output.textContent = error;
      if (input?.setAttribute) input.setAttribute("aria-invalid","true");
    }
    show("Please check the highlighted fields. Your entries have been kept.","error");
    const first = $("[aria-invalid=true]",form); first?.focus();
  }
  form.addEventListener("submit",async event => {
    event.preventDefault();
    if (busy) return;
    clearErrors(); message.replaceChildren();
    const raw = Object.fromEntries(new FormData(form).entries());
    raw.consent = form.elements.consent.checked;
    const result = validateEnquiry(raw);
    if (!result.ok) { renderErrors(result.errors); return; }
    if (!canSubmit) {
      const names = {service:"Service",name:"Name",contact:"Contact",model:"Vehicle",budget:"Budget",location:"Vehicle destination",pickup:"Pickup",destination:"Timber destination",load:"Estimated load",timing:"Preferred timing",notes:"Additional details"};
      const text = "SPEAR LINE — ENQUIRY DRAFT\nNot submitted. Prepared on " + new Date().toISOString().slice(0,10) + "\n\n" + Object.entries(result.value).filter(([key,value]) => names[key] && value).map(([key,value]) => names[key] + ": " + value).join("\n");
      if (downloadURL) URL.revokeObjectURL(downloadURL);
      downloadURL = URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));
      show("Your enquiry is ready to download. Nothing has been sent to Spear Line.");
      const link = document.createElement("a"); link.className = "download-link"; link.href = downloadURL;
      link.download = "spear-line-" + result.value.service + "-enquiry.txt"; link.textContent = "Download your enquiry";
      message.append(document.createElement("br"),link);
      return;
    }
    busy = true; submit.disabled = true; label.textContent = "Sending…";
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(),20000);
    try {
      const response = await fetch("/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...result.value,website:raw.website || ""}),signal:controller.signal});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.errors) { renderErrors(data.errors); return; }
        throw new Error(data.message || "Your request could not be submitted. Please try again.");
      }
      if (typeof data.reference !== "string" || !data.reference) throw new Error("Receipt could not be confirmed. Please keep your details and contact Spear Line before retrying.");
      show("Your enquiry has been received. Reference: " + data.reference + ". Please keep this reference. Sending an enquiry does not confirm a booking or purchase.","success");
      form.reset(); form.elements.service.value = result.value.service;
      $$("[data-service-fields]",form).forEach(el => { const active = el.dataset.serviceFields === result.value.service; el.hidden = !active; el.disabled = !active; });
    } catch (error) {
      show(error.name === "AbortError" ? "Receipt could not be confirmed in time. Your details are still here. Contact Spear Line before retrying to avoid a duplicate." : error.message,"error");
    } finally { clearTimeout(timeout); busy = false; submit.disabled = false; label.textContent = "Send enquiry"; }
  });
  window.addEventListener("beforeunload",() => { if (downloadURL) URL.revokeObjectURL(downloadURL); });
}
