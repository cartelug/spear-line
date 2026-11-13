import { validateEnquiry } from "./validation.js?v=697a4cde4b";
const config = window.SPEAR_CONFIG || {};
const preview = window.SPEAR_PREVIEW === true;
const canSubmit = config.enquiriesEnabled === true && !preview;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.documentElement;
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const calm = () => motionPreference.matches || root.classList.contains("motion-reduced");
$$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

/* Menu: full-screen on smaller screens, with focus kept inside and Escape to close. */
const menu = $(".menu-toggle"), nav = $("#site-menu");
function setMenu(open) {
  if (!menu) return;
  menu.setAttribute("aria-expanded", String(open));
  root.classList.toggle("menu-open", open);
  $$("main, .site-footer, .dock").forEach(el => { el.inert = open; });
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
window.matchMedia("(min-width:1100px)").addEventListener("change", event => { if (event.matches) setMenu(false); });
window.addEventListener("pageshow", event => { if (event.persisted) setMenu(false); });

/* Editing a field hides the phone dock so it never covers the keyboard. */
const editingField = el => el?.matches?.('textarea,select,input:not([type="radio"]):not([type="checkbox"]):not([type="submit"])');
document.addEventListener("focusin", event => root.classList.toggle("is-editing", Boolean(editingField(event.target))));
document.addEventListener("focusout", () => requestAnimationFrame(() => root.classList.toggle("is-editing", Boolean(editingField(document.activeElement)))));

/* Header: glass once scrolled, tucked away while scrolling down, back on the way up. Reading progress on top. */
const header = $(".site-header"), progress = $(".progress span"), cssProgress = CSS.supports?.("animation-timeline: scroll()");
let lastY = window.scrollY, ticking = false;
function onScroll() {
  ticking = false;
  const y = window.scrollY, range = cssProgress && root.classList.contains("motion-ok") ? 0 : root.scrollHeight - window.innerHeight;
  header?.classList.toggle("is-scrolled", y > 24);
  if (y > 480 && y > lastY + 4 && !root.classList.contains("menu-open")) header?.classList.add("is-hidden");
  else if (y < lastY - 4 || y < 480) header?.classList.remove("is-hidden");
  lastY = y;
  // Browsers with scroll-driven animations fill the progress bar in CSS; this only runs for the others or under Reduce motion.
  if (progress && !(cssProgress && root.classList.contains("motion-ok"))) progress.style.transform = "scaleX(" + (range > 0 ? Math.min(1, Math.max(0, y / range)) : 0).toFixed(4) + ")";
}
let scrollIdle = 0;
window.addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  // Marks an active scroll so ambient loops pause; cleared shortly after the last scroll event.
  if (!scrollIdle) root.classList.add("is-scrolling");
  clearTimeout(scrollIdle); scrollIdle = setTimeout(() => { scrollIdle = 0; root.classList.remove("is-scrolling"); }, 160);
}, { passive: true });
document.addEventListener("focusin", event => { if (header?.contains(event.target)) header.classList.remove("is-hidden"); });
onScroll();

/* Researched import listings: filter and sort locally; exporter links remain the price source. */
const carCatalogue = $("[data-car-catalogue]");
if (carCatalogue) {
  const controls = $("[data-car-controls]", carCatalogue), grid = $("[data-car-grid]", carCatalogue);
  const search = $("[data-car-search]", controls), make = $("[data-car-make]", controls);
  const budget = $("[data-car-budget]", controls), year = $("[data-car-year]", controls), sort = $("[data-car-sort]", controls);
  const category = $("[data-car-category-filter]", controls);
  const count = $("[data-car-count]", controls), empty = $("[data-car-empty]", carCatalogue), more = $("[data-car-more]", carCatalogue);
  const normalise = text => text.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");
  const cars = $$("[data-car]", grid).map(el => ({ el, category: el.dataset.carCategory, make: el.dataset.carMakeValue, price: Number(el.dataset.carPrice), year: Number(el.dataset.carModelYear), mileage: Number(el.dataset.carMileage), search: normalise(el.dataset.carKeywords) }));
  const pageSize = 24;
  let limit = pageSize, matches = [];
  function renderCars() {
    const terms = search.value.trim().split(/\s+/).map(normalise).filter(Boolean);
    const maximum = budget.value === "" ? Infinity : Math.max(0, Number(budget.value));
    matches = cars.filter(car => (!category.value || car.category === category.value) && (!make.value || car.make === make.value) && car.price <= maximum && car.year >= Number(year.value) && terms.every(term => car.search.includes(term)));
    const compare = {
      "price-asc": (a, b) => a.price - b.price || b.year - a.year,
      "price-desc": (a, b) => b.price - a.price || b.year - a.year,
      "year-desc": (a, b) => b.year - a.year || a.price - b.price,
      "mileage-asc": (a, b) => a.mileage - b.mileage || a.price - b.price,
    }[sort.value];
    matches.sort(compare);
    cars.forEach(car => { car.el.hidden = true; });
    grid.append(...matches.map(car => car.el));
    matches.slice(0, limit).forEach(car => { car.el.hidden = false; });
    count.textContent = matches.length ? `Showing ${Math.min(limit, matches.length)} of ${matches.length} cars` : "No matching cars";
    empty.hidden = matches.length !== 0;
    more.hidden = limit >= matches.length;
    more.textContent = `Show ${Math.min(pageSize, Math.max(0, matches.length - limit))} more cars`;
  }
  function filterCars() { limit = pageSize; renderCars(); }
  controls.addEventListener("submit", event => event.preventDefault());
  controls.addEventListener("input", event => { if (event.target.matches("input")) filterCars(); });
  controls.addEventListener("change", event => { if (event.target.matches("select")) filterCars(); });
  controls.addEventListener("reset", () => { setTimeout(filterCars, 0); });
  more.addEventListener("click", () => {
    const firstNew = limit;
    limit += pageSize; renderCars();
    matches[firstNew]?.el.querySelector("h3")?.focus();
  });
  renderCars();
  controls.hidden = false;
}

/* Reference-photo viewer. Original source pixels remain separate from generated brand scenes. */
const lightbox = $('[data-car-lightbox]');
if (lightbox) {
 let photos=[], index=0, opener;
 const photo=$('[data-gallery-image]',lightbox), count=$('[data-gallery-count]',lightbox), title=$('#car-dialog-title',lightbox), thumbs=$('[data-gallery-thumbs]',lightbox);
 function showPhoto(n) {
  index=(n+photos.length)%photos.length;
  photo.src=photos[index]; photo.alt=title.textContent+', reference photograph '+(index+1);
  count.textContent='Photograph '+(index+1)+' of '+photos.length;
  $$('[data-thumb]',thumbs).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-car-open]'); if(!button)return;
  photos=JSON.parse(button.dataset.gallery); if(!photos.length)return;
  opener=button;title.textContent=button.dataset.galleryTitle;thumbs.replaceChildren();
  photos.forEach((src,i)=>{const b=document.createElement('button');b.type='button';b.dataset.thumb='';b.setAttribute('aria-label','View photograph '+(i+1));const im=document.createElement('img');im.src=src;im.alt='';im.loading='lazy';b.append(im);b.addEventListener('click',()=>showPhoto(i));thumbs.append(b);});
  showPhoto(0);lightbox.showModal();
 });
 $('[data-gallery-close]',lightbox).addEventListener('click',()=>lightbox.close());
 $('[data-gallery-prev]',lightbox).addEventListener('click',()=>showPhoto(index-1));
 $('[data-gallery-next]',lightbox).addEventListener('click',()=>showPhoto(index+1));
 lightbox.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(index-1);}if(event.key==='ArrowRight'){event.preventDefault();showPhoto(index+1);}});
 lightbox.addEventListener('close',()=>opener?.focus());
 let startX=0;
 photo.draggable=false;photo.addEventListener('pointerdown',event=>{startX=event.clientX;photo.setPointerCapture?.(event.pointerId);});
 photo.addEventListener('pointerup',event=>{if(Math.abs(event.clientX-startX)>50)showPhoto(index+(event.clientX<startX?1:-1));});
}
/* Cross-page project brief: choices only, with an explicit local download. */
const briefButtons=$$('[data-brief-add]');
if(briefButtons.length){
 let chosen=[];try{const saved=JSON.parse(localStorage.getItem('spear-brief')||'[]');if(Array.isArray(saved))chosen=saved.filter(x=>typeof x==='string');}catch{}
 function updateBrief(){
  briefButtons.forEach(b=>{const active=chosen.includes(b.dataset.briefAdd);b.setAttribute('aria-pressed',String(active));b.textContent=active?'Added to brief':'Add to my brief';});
  $$('[data-brief-list]').forEach(list=>{list.replaceChildren();chosen.forEach(value=>{const li=document.createElement('li');li.textContent=value;list.append(li);});});
  try{localStorage.setItem('spear-brief',JSON.stringify(chosen));}catch{}
 }
 $$('[data-brief-builder]').forEach(el=>{el.hidden=false;});briefButtons.forEach(el=>{el.hidden=false;});
 briefButtons.forEach(b=>b.addEventListener('click',()=>{const value=b.dataset.briefAdd;chosen=chosen.includes(value)?chosen.filter(x=>x!==value):[...chosen,value];updateBrief();}));
 $$('[data-brief-download]').forEach(b=>b.addEventListener('click',()=>{
  const status=$('[data-brief-status]');if(!chosen.length){status.textContent='Select at least one option to build your brief.';return;}
  const text='Spear Line project brief\n\n'+chosen.map(x=>'- '+x).join('\n')+'\n\nDestination / area: \nQuantities / specifications: \nBudget and currency: \nPreferred timing: \nQuestions to confirm: \n\nThis file is a planning checklist. Nothing has been submitted or booked.';
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='spear-line-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Your brief is downloaded. Add your details and discuss it with Spear Line.';
 }));updateBrief();
}

/* Gallery rail: buttons, keyboard, drag to scroll and a position readout. */
const rail = $("#image-rail"), previous = $("[data-rail-prev]"), next = $("[data-rail-next]");
if (rail && previous && next) {
  previous.setAttribute("aria-controls", rail.id); next.setAttribute("aria-controls", rail.id);
  const status = $("[data-rail-status]"), meter = $("[data-rail-progress]"), items = $$(".rail-item", rail);
  const step = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || 0);
  let lastIndex = -1;
  function railState() {
    previous.disabled = rail.scrollLeft < 5; next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 5;
    const index = Math.min(items.length - 1, Math.max(0, Math.round(rail.scrollLeft / step())));
    if (index !== lastIndex) {
      if (status) status.textContent = String(index + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0");
      if (meter) meter.style.transform = "scaleX(" + ((index + 1) / items.length) + ")";
      lastIndex = index;
    }
  }
  const move = direction => rail.scrollBy({ left: direction * step(), behavior: calm() ? "instant" : "smooth" });
  previous.addEventListener("click", () => move(-1)); next.addEventListener("click", () => move(1));
  rail.addEventListener("scroll", railState, { passive: true });
  window.addEventListener("resize", railState, { passive: true });
  rail.addEventListener("keydown", event => { if (event.target === rail && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } });
  let drag = null, justDragged = false;
  rail.addEventListener("dragstart", event => event.preventDefault());
  rail.addEventListener("click", event => { if (justDragged) { event.preventDefault(); event.stopPropagation(); } }, true);
  rail.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag = { x: event.clientX, left: rail.scrollLeft, moved: false };
  });
  window.addEventListener("pointermove", event => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 4 && !drag.moved) { drag.moved = true; rail.classList.add("is-dragging"); }
    if (drag.moved) rail.scrollLeft = drag.left - dx;
  });
  const endDrag = () => {
    if (!drag) return;
    const moved = drag.moved; drag = null; rail.classList.remove("is-dragging");
    if (moved) { justDragged = true; setTimeout(() => { justDragged = false; }, 60); move(0); }
  };
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  railState();
}

/* Accordions: one answer open at a time within a group. */
for (const group of $$("[data-accordion]")) {
  const items = $$("details", group);
  items.forEach(item => item.addEventListener("toggle", () => { if (item.open) items.filter(other => other !== item).forEach(other => { other.open = false; }); }));
}

/* FAQ search filters questions as you type. */
const filter = $("[data-faq-filter]");
if (filter) {
  const empty = $("[data-faq-empty]");
  filter.addEventListener("input", () => {
    const term = filter.value.trim().toLowerCase();
    let visible = 0;
    for (const group of $$(".faq-group")) {
      let groupVisible = 0;
      for (const item of $$("details", group)) {
        // Search only what is shown: drop the alternative answer that configuration keeps hidden.
        const visible = item.cloneNode(true); visible.querySelectorAll("[hidden]").forEach(el => el.remove());
        const match = !term || visible.textContent.toLowerCase().includes(term);
        item.classList.toggle("is-filtered", !match);
        if (match) groupVisible++;
        if (match && term && !item.open && groupVisible === 1) item.open = true;
      }
      group.hidden = groupVisible === 0; visible += groupVisible;
    }
    if (empty) empty.hidden = visible > 0;
  });
}

/* Links: browsers without speculation rules fetch an internal page as soon as a visitor points at or touches it. */
if (!HTMLScriptElement.supports?.("speculationrules")) {
  const warmed = new Set();
  const warm = event => {
    const link = event.target.closest?.("a[href]");
    if (!link || link.origin !== location.origin || link.pathname === location.pathname || !/(\.html|\/)$/.test(link.pathname) || navigator.connection?.saveData) return;
    const url = link.href.split("#")[0];
    if (warmed.has(url)) return;
    warmed.add(url);
    const hint = document.createElement("link"); hint.rel = "prefetch"; hint.href = url; document.head.append(hint);
  };
  document.addEventListener("pointerover", warm, { passive: true });
  document.addEventListener("touchstart", warm, { passive: true });
  document.addEventListener("focusin", warm);
}

/* Connection status: says so when the visitor goes offline (saved pages keep working) and when they are back. */
const netStatus = $(".net-status");
let netTimer = 0;
function announceNetwork() {
  if (!netStatus) return;
  clearTimeout(netTimer);
  netStatus.textContent = navigator.onLine ? "Back online." : "You are offline. Pages you have visited still open.";
  netStatus.hidden = false; netStatus.classList.toggle("is-offline", !navigator.onLine);
  if (navigator.onLine) netTimer = setTimeout(() => { netStatus.hidden = true; }, 3000);
}
window.addEventListener("offline", announceNetwork);
window.addEventListener("online", announceNetwork);
if (!navigator.onLine) announceNetwork();

/* Offline support and instant repeat visits on the published HTTPS site (add ?sw to try it locally). */
if ("serviceWorker" in navigator && (location.protocol === "https:" || new URLSearchParams(location.search).has("sw"))) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

/* Motion layer: loaded separately so a failure never affects navigation or the enquiry form. */
// It measures the layout, so it starts once the full stylesheet applies (window.spearCss, from the inline boot script).
Promise.all([import("./motion.js?v=697a4cde4b"), window.spearCss]).then(([{ createMotion }]) => createMotion({ root, preference: motionPreference })).catch(() => {
  root.classList.remove("motion-ok");
  $$("[data-motion-toggle]").forEach(button => { button.hidden = true; });
});

/* Published contact details come from configuration, never from the page source. */
function addContact(selector, href, label) {
  $$(selector).forEach(el => {
    const link = document.createElement("a"); link.href = href; link.textContent = label;
    el.replaceChildren(link); el.hidden = false;
  });
}
const emailOK = typeof config.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email);
if (emailOK) addContact("[data-contact-email]", "mailto:" + config.email, config.email);
if (typeof config.phone === "string" && /^\+?[\d\s()-]{7,30}$/.test(config.phone)) addContact("[data-contact-phone]", "tel:" + config.phone.replace(/[^\d+]/g, ""), config.phone);
if (typeof config.phoneSecondary === "string" && /^\+?[\d\s()-]{7,30}$/.test(config.phoneSecondary)) addContact("[data-contact-phone-secondary]", "tel:" + config.phoneSecondary.replace(/[^\d+]/g, ""), config.phoneSecondary);
if (typeof config.whatsapp === "string" && /^\+?\d{7,15}$/.test(config.whatsapp)) addContact("[data-contact-whatsapp]", "https://wa.me/" + config.whatsapp.replace(/\D/g, ""), "WhatsApp");
$$("[data-contact-container]").forEach(el => { el.hidden = !el.querySelector("a"); });
if (config.address) $$("[data-address]").forEach(el => { el.hidden = false; el.textContent = config.address; });
const contactCards = $$("[data-contact-card]");
contactCards.forEach(card => { card.hidden = !card.querySelector("[data-contact-email]:not([hidden]),[data-contact-phone]:not([hidden]),[data-contact-phone-secondary]:not([hidden]),[data-contact-whatsapp]:not([hidden]),[data-address]:not([hidden])"); });
$$("[data-contact-empty]").forEach(el => { el.hidden = contactCards.some(card => !card.hidden); });

/* Phone dock: the Call button opens both phone lines above the dock. It appears only when a number is configured. */
const callButton = $(".dock-call"), callSheet = $("#dock-calls");
if (callButton && callSheet?.querySelector("a")) {
  callButton.hidden = false;
  const setCalls = open => { callButton.setAttribute("aria-expanded", String(open)); callSheet.hidden = !open; };
  callButton.addEventListener("click", () => setCalls(callSheet.hidden));
  document.addEventListener("click", event => { if (!callSheet.hidden && !event.target.closest(".dock-call, #dock-calls")) setCalls(false); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !callSheet.hidden) { setCalls(false); callButton.focus(); } });
}
if (config.legalName) $$("[data-legal-identity]").forEach(el => { el.textContent = "The operator is " + config.legalName + "."; });
if (emailOK) {
  addContact("[data-privacy-contact]", "mailto:" + config.email, "Contact: " + config.email);
  $$("[data-rights-contact]").forEach(el => {
    el.textContent = "To request access, correction or deletion of your enquiry, email ";
    const link = document.createElement("a"); link.href = "mailto:" + config.email; link.textContent = config.email;
    el.append(link, ". Include your enquiry reference if available.");
  });
}
$$("[data-enquiry-step]").forEach(el => { if (canSubmit) el.textContent = el.dataset.live; });
if (canSubmit) { $$("[data-faq-closed]").forEach(el => { el.hidden = true; }); $$("[data-faq-open]").forEach(el => { el.hidden = false; }); }
if (canSubmit) $$("[data-privacy-status]").forEach(el => { el.textContent = "Online enquiries are enabled. Details you submit are stored for Spear Line to review."; });
if (canSubmit && Number.isInteger(config.retentionDays)) $$("[data-retention]").forEach(el => { el.textContent = "Unconverted website enquiry records are retained for up to " + config.retentionDays + " days, unless an applicable record-keeping requirement requires a different period. Contact the operator about records associated with an agreed transaction."; });

/* Enquiry form */
const form = $("#enquiry-form");
if (form) {
  try { const choices=JSON.parse(localStorage.getItem('spear-brief')||'[]');if(Array.isArray(choices)&&choices.length&&form.elements.notes&&!form.elements.notes.value)form.elements.notes.value='Project brief: '+choices.filter(x=>typeof x==='string').join('; '); } catch {}
  const mode = $("#form-mode"), message = $("#form-message"), submit = $("#submit-enquiry"), label = $("[data-submit-label]");
  const params = new URLSearchParams(preview ? (window.SPEAR_PREVIEW_QUERY || "") : location.search);
  const query = params.get("service");
  const currentChoice = form.elements.service.value || "vehicle";
  const selected = form.dataset.serviceTouched === "true" ? currentChoice : query === "timber" ? "logistics" : ["vehicle", "supplies", "logistics"].includes(query) ? query : currentChoice;
  form.elements.service.value = selected;
  const type = new URLSearchParams(location.search).get("type");
  if (selected === "vehicle" && type) form.elements.model.value = type.slice(0, 160);
  // The homepage enquiry note passes where the requirement is going; it fills whichever destination field the chosen service uses.
  const destination = (new URLSearchParams(location.search).get("destination") || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 200);
  const destinationField = { vehicle: "location", supplies: "supplyDestination", logistics: "destination" };
  function fillDestination(service) {
    const field = form.elements[destinationField[service]];
    if (destination && field && !field.value) field.value = destination;
  }
  fillDestination(selected);
  let downloadURL = null, busy = false;
  function clearErrors() {
    $$(".field-error", form).forEach(el => { el.textContent = ""; });
    $$("[aria-invalid]", form).forEach(el => el.removeAttribute("aria-invalid"));
  }
  function updateService() {
    const service = form.elements.service.value;
    $$("[data-service-fields]", form).forEach(el => {
      const active = el.dataset.serviceFields === service;
      el.hidden = !active; el.disabled = !active;
    });
    fillDestination(service);
    clearErrors(); message.replaceChildren(); message.className = "form-message";
  }
  $$('input[name="service"]', form).forEach(el => el.addEventListener("change", updateService));
  updateService();
  mode.textContent = canSubmit ? "Send your requirements to Spear Line. We’ll show a reference after the request has been received." : (preview ? "Preview mode: prepare a downloadable enquiry. Nothing is sent to Spear Line." : "Online submission is not open yet. You can prepare and download your requirements here.");
  label.textContent = canSubmit ? "Send enquiry" : "Prepare enquiry";
  submit.disabled = false;
  function show(text, kind = "") {
    message.className = "form-message " + kind; message.textContent = text; message.focus();
  }
  function renderErrors(errors) {
    clearErrors();
    for (const [key, error] of Object.entries(errors)) {
      const input = form.elements.namedItem(key), output = document.getElementById(key + "-error");
      if (output) output.textContent = error;
      if (input?.setAttribute) input.setAttribute("aria-invalid", "true");
    }
    show("Please check the highlighted fields. Your entries have been kept.", "error");
    const first = $("[aria-invalid=true]", form); first?.focus();
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    clearErrors(); message.replaceChildren();
    const raw = Object.fromEntries(new FormData(form).entries());
    raw.consent = form.elements.consent.checked;
    const result = validateEnquiry(raw);
    if (!result.ok) { renderErrors(result.errors); return; }
    if (!canSubmit) {
      const names = { service: "Service", name: "Name", contact: "Contact", model: "Vehicle", budget: "Budget", location: "Vehicle destination", products: "Products & specifications", quantity: "Quantities & packaging", supplyDestination: "Delivery destination", supplyTiming: "Preferred timing", pickup: "Pickup", destination: "Delivery destination", load: "Cargo & estimated load", timing: "Preferred timing", notes: "Additional details" };
      const text = "SPEAR LINE — ENQUIRY DRAFT\nNot submitted. Prepared on " + new Date().toISOString().slice(0, 10) + "\n\n" + Object.entries(result.value).filter(([key, value]) => names[key] && value).map(([key, value]) => names[key] + ": " + value).join("\n");
      if (downloadURL) URL.revokeObjectURL(downloadURL);
      downloadURL = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
      show("Your enquiry is ready to download. Nothing has been sent to Spear Line.");
      const link = document.createElement("a"); link.className = "download-link"; link.href = downloadURL;
      link.download = "spear-line-" + result.value.service + "-enquiry.txt"; link.textContent = "Download your enquiry";
      const downloadRow = document.createElement("p"); downloadRow.append(link); message.append(downloadRow);
      return;
    }
    busy = true; submit.disabled = true; label.textContent = "Sending…";
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...result.value, website: raw.website || "" }), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.errors) { renderErrors(data.errors); return; }
        throw new Error(data.message || "Your request could not be submitted. Please try again.");
      }
      if (typeof data.reference !== "string" || !data.reference) throw new Error("Receipt could not be confirmed. Please keep your details and contact Spear Line before retrying.");
      show("Your enquiry has been received. Reference: " + data.reference + ". Please keep this reference. Sending an enquiry does not confirm a booking or purchase.", "success");
      form.reset(); form.elements.service.value = result.value.service;
      $$("[data-service-fields]", form).forEach(el => { const active = el.dataset.serviceFields === result.value.service; el.hidden = !active; el.disabled = !active; });
    } catch (error) {
      show(error.name === "AbortError" ? "Receipt could not be confirmed in time. Your details are still here. Contact Spear Line before retrying to avoid a duplicate." : error.message, "error");
    } finally { clearTimeout(timeout); busy = false; submit.disabled = false; label.textContent = "Send enquiry"; }
  });
  window.addEventListener("beforeunload", () => { if (downloadURL) URL.revokeObjectURL(downloadURL); });
}
