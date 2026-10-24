import { validateEnquiry } from "./validation.js?v=5.2";
const config = window.SPEAR_CONFIG || {};
const preview = window.SPEAR_PREVIEW === true;
const canSubmit = config.enquiriesEnabled === true && !preview;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
$$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
const root = document.documentElement;
let motion=null;
const menu = $(".menu-toggle"), nav = $("#site-menu");
function setMenu(open) {
  if (!menu) return;
  const wasOpen=menu.getAttribute("aria-expanded")==="true";
  menu.setAttribute("aria-expanded", String(open));
  if(open||wasOpen)motion?.menu(open,nav);
  root.classList.toggle("menu-open", open);
  $$("main, .site-footer, .mobile-dock").forEach(el => { el.inert = open; });
  if (open) nav?.querySelector("a")?.focus();
}
menu?.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
nav?.addEventListener("click", event => { if (event.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") { setMenu(false); menu.focus(); }
  if (event.key === "Tab" && menu?.getAttribute("aria-expanded") === "true") {
    const items = [menu, ...$$("a,button", nav)];
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
  }
});
window.matchMedia("(min-width:900px)").addEventListener("change", event => { if (event.matches) setMenu(false); });
window.addEventListener("pageshow", event => { if (event.persisted) setMenu(false); });

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const editingField = el => el?.matches?.('textarea,select,input:not([type="radio"]):not([type="checkbox"]):not([type="submit"])');
document.addEventListener("focusin",event => root.classList.toggle("is-editing",Boolean(editingField(event.target))));
document.addEventListener("focusout",() => requestAnimationFrame(() => root.classList.toggle("is-editing",Boolean(editingField(document.activeElement)))));
const progress = $(".reading-progress span"), header = $(".site-header");
const movingImages = $$("[data-parallax]");
let scrollFrame = 0;
function renderScroll() {
  scrollFrame = 0;
  const y = window.scrollY, range = root.scrollHeight - window.innerHeight;
  header?.classList.toggle("is-scrolled", y > 28);
  if (progress) progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, y / range)) : 0})`;
  for (const el of movingImages) {
    if (motionPreference.matches || root.classList.contains("motion-reduced") || window.innerWidth < 900) { el.style.removeProperty("transform"); continue; }
    const box = el.parentElement.getBoundingClientRect();
    if (box.bottom > -100 && box.top < window.innerHeight + 100) {
      const offset = Math.max(-24, Math.min(24, box.top * -.055));
      el.style.transform = `translateY(${offset}px)`;
    }
  }
}
function requestScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll); }
window.addEventListener("scroll", requestScroll, {passive:true});
window.addEventListener("resize", requestScroll, {passive:true});
document.addEventListener("spear:motion-preference",requestScroll);
motionPreference.addEventListener("change", () => {
  if (motionPreference.matches) { root.classList.remove("reveal-ready"); $$("[data-reveal]").forEach(el => el.classList.add("is-in")); }
  requestScroll();
});
renderScroll();

// A fully readable set of service sections becomes a keyboard-accessible tab view.
const serviceTabs = $("[data-service-tabs]");
if (serviceTabs) {
  const tabs = $$("[data-tab]", serviceTabs), panels = $$("[data-panel]", serviceTabs);
  $(".tab-list",serviceTabs).setAttribute("role","tablist");
  $(".service-panels",serviceTabs).classList.add("is-enhanced");
  function activateTab(index, focus=false) {
    tabs.forEach((tab,i) => { tab.setAttribute("aria-selected",String(i===index)); tab.tabIndex = i===index ? 0 : -1; });
    panels.forEach((panel,i) => {
      panel.hidden = i !== index;
      panel.classList.toggle("is-entering",i===index);
    });
    if (focus) tabs[index].focus();
    motion?.panel(panels[index]);
    requestScroll();
  }
  tabs.forEach((tab,index) => {
    tab.setAttribute("role","tab"); tab.setAttribute("aria-controls",panels[index].id);
    panels[index].setAttribute("role","tabpanel"); panels[index].tabIndex = 0;
    tab.addEventListener("click",() => activateTab(index));
    tab.addEventListener("keydown",event => {
      let target;
      if(event.key==="ArrowRight") target=(index+1)%tabs.length;
      if(event.key==="ArrowLeft") target=(index-1+tabs.length)%tabs.length;
      if(event.key==="Home") target=0;
      if(event.key==="End") target=tabs.length-1;
      if(target!==undefined){event.preventDefault();activateTab(target,true);}
    });
  });
  activateTab(0);
}

const rail = $("#image-rail"), previous = $("[data-rail-prev]"), next = $("[data-rail-next]");
if (rail && previous && next) {
  previous.setAttribute("aria-controls",rail.id); next.setAttribute("aria-controls",rail.id);
  const status=$("[data-rail-status]"), meter=$("[data-rail-progress]");
  let lastIndex=-1;
  function railState() {
    previous.disabled = rail.scrollLeft < 5; next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 5;
    const items=$$(".gallery-item",rail);
    const step=items[0].getBoundingClientRect().width+parseFloat(getComputedStyle(rail).gap);
    const index=Math.min(items.length-1,Math.max(0,Math.round(rail.scrollLeft/step)));
    if(index!==lastIndex){
      if(status) status.textContent=String(index+1).padStart(2,"0")+" / "+String(items.length).padStart(2,"0");
      if(meter) meter.style.transform=`scaleX(${(index+1)/items.length})`;
      motion?.gallery(status);
      lastIndex=index;
    }
  }
  function moveRail(direction) {
    const first = $(".gallery-item",rail);
    const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).gap);
    rail.scrollBy({left:direction*step,behavior:motionPreference.matches||root.classList.contains("motion-reduced")?"instant":"smooth"});
  }
  previous.addEventListener("click",() => moveRail(-1)); next.addEventListener("click",() => moveRail(1));
  rail.addEventListener("scroll",railState,{passive:true});
  window.addEventListener("resize",railState,{passive:true});
  rail.addEventListener("keydown",event => { if(event.target===rail && ["ArrowLeft","ArrowRight"].includes(event.key)){event.preventDefault();moveRail(event.key==="ArrowLeft"?-1:1);} });
  railState();
}
for (const group of $$("[data-accordion]")) {
  const steps = $$("details",group);
  steps.forEach(step => {
    step.addEventListener("toggle",()=>{if(step.open&&(!motion||motion.disabled))steps.filter(other=>other!==step).forEach(other=>{other.open=false;});});
    step.querySelector("summary").addEventListener("click",event=>{
      if(!motion||motion.disabled)return;
      event.preventDefault();const open=!motion.accordionOpen(step);
      if(open)steps.filter(other=>other!==step&&motion.accordionOpen(other)).forEach(other=>motion.accordion(other,false));
      motion.accordion(step,open);
    });
  });
}

// The shared motion layer owns scroll, text and component entrance timelines.
import("./motion.js?v=6.3").then(({createMotion})=>{motion=createMotion({root,preference:motionPreference});}).catch(()=>{
  root.classList.remove("motion-ready");root.dataset.motionState="unavailable";
  $$("[data-motion-toggle]").forEach(button=>{button.hidden=true;});
});

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
  const currentChoice=form.elements.service.value||"vehicle";
  const selected = form.dataset.serviceTouched==="true" ? currentChoice : query === "timber" ? "logistics" : ["vehicle","supplies","logistics"].includes(query) ? query : currentChoice;
  form.elements.service.value = selected;
  const type = new URLSearchParams(location.search).get("type");
  if (selected === "vehicle" && type) form.elements.model.value = type.slice(0,160);
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
    message.className = "form-message " + kind; message.textContent = text; message.focus(); motion?.message(message);
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
      const names = {service:"Service",name:"Name",contact:"Contact",model:"Vehicle",budget:"Budget",location:"Vehicle destination",products:"Products & specifications",quantity:"Quantities & packaging",supplyDestination:"Delivery destination",supplyTiming:"Preferred timing",pickup:"Pickup",destination:"Delivery destination",load:"Cargo & estimated load",timing:"Preferred timing",notes:"Additional details"};
      const text = "SPEAR LINE — ENQUIRY DRAFT\nNot submitted. Prepared on " + new Date().toISOString().slice(0,10) + "\n\n" + Object.entries(result.value).filter(([key,value]) => names[key] && value).map(([key,value]) => names[key] + ": " + value).join("\n");
      if (downloadURL) URL.revokeObjectURL(downloadURL);
      downloadURL = URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));
      show("Your enquiry is ready to download. Nothing has been sent to Spear Line.");
      const link = document.createElement("a"); link.className = "download-link"; link.href = downloadURL;
      link.download = "spear-line-" + result.value.service + "-enquiry.txt"; link.textContent = "Download your enquiry";
      const downloadRow=document.createElement("p"); downloadRow.append(link); message.append(downloadRow);
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
