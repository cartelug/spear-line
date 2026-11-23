// Spear Line Finance: the loan cost checker and the loan application (finance page and loan-application page).
// Nothing is sent to a server. The application is written out as an email or WhatsApp message for the visitor to send.
// Nothing the visitor types is stored by this script (no cookies, no local storage).
// Contact details come from site-config.js (window.SPEAR_CONFIG), like the rest of the site.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const setText = (el, text) => { if (el) el.textContent = text; };
const num = n => Math.round(n).toLocaleString("en-US");
const config = window.SPEAR_CONFIG || {};
const digits = v => String(v || "").replace(/[^\d+]/g, "");
const emailOk = typeof config.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(config.email);
const phoneOk = v => typeof v === "string" && /^\+?[\d\s()-]{7,30}$/.test(v);
const waNumber = typeof config.whatsapp === "string" && /^\+?\d{7,15}$/.test(config.whatsapp) ? config.whatsapp.replace(/\D/g, "") : "";
const waHref = text => `https://wa.me/${waNumber}${text ? "?text=" + encodeURIComponent(text) : ""}`;

/* ---------- Contact buttons and rows, filled from the site configuration ---------- */
const channels = {
  call: phoneOk(config.phone) ? { href: "tel:" + digits(config.phone), label: "Call " + config.phone } : null,
  call2: phoneOk(config.phoneSecondary) ? { href: "tel:" + digits(config.phoneSecondary), label: "Call " + config.phoneSecondary } : null,
  mail: emailOk ? { href: "mailto:" + config.email, label: config.email } : null,
  wa: waNumber ? { href: waHref("Hello Spear Line, I would like to ask about finance."), label: "WhatsApp us", external: true } : null
};
for (const a of $$("a[data-fin]")) {
  const key = a.dataset.fin.replace("-text", ""), ch = channels[key];
  if (!ch) continue;
  a.href = ch.href;
  if (ch.external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  if (a.classList.contains("btn")) setText($(".btn-label", a), key === "mail" ? "Email us" : ch.label); else setText(a, key === "mail" ? config.email : ch.label.replace("Call ", ""));
  a.hidden = false;
}
for (const row of $$("[data-fin-row]")) row.hidden = !channels[row.dataset.finRow];

/* ---------- Cost checker ---------- */
const cost = $("[data-cost]");
if (cost) {
  const amountIn = $("#cost-amount"), termIn = $("#cost-term"), rateIn = $("#cost-rate");
  const paint = () => {
    const amount = Number(amountIn.value.replace(/\D/g, "")), term = Math.round(Number(termIn.value)), rate = Number(String(rateIn.value).replace(",", "."));
    const ok = amount > 0 && term >= 1 && term <= 60 && rateIn.value.trim() !== "" && Number.isFinite(rate) && rate >= 0 && rate <= 100;
    if (!ok) { setText($("[data-cost-monthly]", cost), rateIn.value.trim() ? "Check the figures" : "Enter the rate"); setText($("[data-cost-interest]", cost), "Not yet"); setText($("[data-cost-total]", cost), "Not yet"); return; }
    const monthly = amount * rate / 100, interest = monthly * term;
    setText($("[data-cost-monthly]", cost), num(monthly));
    setText($("[data-cost-interest]", cost), num(interest));
    setText($("[data-cost-total]", cost), num(amount + interest));
  };
  amountIn.addEventListener("input", () => { const d = amountIn.value.replace(/\D/g, "").slice(0, 12); amountIn.value = d ? (+d).toLocaleString("en-US") : ""; paint(); });
  termIn.addEventListener("input", paint); rateIn.addEventListener("input", paint); paint();
}

/* ---------- Loan application ---------- */
const form = $("[data-loan]");
if (form) {
  const f = name => form.elements[name];
  const steps = $$("[data-step]", form), progress = $$(".loan-progress li", form), status = $("[data-loan-status]", form);
  const prev = $("[data-prev]", form), next = $("[data-next]", form), submit = $("[data-submit]", form);
  const ledger = Object.fromEntries($$("[data-l]").map(el => [el.dataset.l, el]));
  const done = $("[data-loan-done]"), count = $("[data-count]", form), purpose = f("purpose"), amountIn = f("amount");
  const PRODUCTS = Object.fromEntries($$("input[name=product]", form).map(i => [i.value, $("strong", i.parentElement).textContent]));
  const MAX_STEP = steps.length;
  let step = 1, reference = "";

  const state = () => ({
    product: f("product").value || "", currency: f("currency").value, amount: Number(String(amountIn.value).replace(/\D/g, "")) || 0, term: f("term").value,
    applicant: f("applicant").value || "individual", organisation: f("organisation").value.trim(), name: f("name").value.trim(), phone: f("phone").value.trim(),
    email: f("email").value.trim(), location: f("location").value.trim(), employer: f("employer").value.trim(), years: f("years").value.trim(),
    purpose: purpose.value.trim(), target: f("target").value, docs: $$("input[name=docs]:checked", form).map(i => i.value)
  });
  const PHONE_RE = /^\+?\d{9,15}$/, EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const amountText = s => `${s.currency} ${num(s.amount)}`;

  // Start from the address (?product=) so the product cards carry over.
  const q = new URLSearchParams(location.search), pre = q.get("product");
  if (PRODUCTS[pre]) $(`input[name=product][value="${pre}"]`, form).checked = true;

  const paintLedger = () => { const s = state(); setText(ledger.product, PRODUCTS[s.product] || "Not chosen"); setText(ledger.amount, s.amount ? amountText(s) : "Not set"); setText(ledger.term, s.term); };
  const paintApplicant = () => {
    const company = f("applicant").value === "company";
    for (const el of $$("[data-only]", form)) el.hidden = !company;
    setText($("label[for=name]", form), company ? "Contact person" : "Full name");
    setText($("label[for=employer]", form), company ? "Line of business" : "Employer or business");
  };
  amountIn.addEventListener("input", () => { const d = amountIn.value.replace(/\D/g, "").slice(0, 12); amountIn.value = d ? (+d).toLocaleString("en-US") : ""; paintLedger(); });
  purpose.addEventListener("input", () => setText(count, `${purpose.value.length} / ${purpose.maxLength}`));
  form.addEventListener("change", e => { if (e.target.name === "applicant") paintApplicant(); if (e.target.name === "product") setError(e.target, ""); paintLedger(); });
  form.addEventListener("input", e => { if (e.target.getAttribute("aria-invalid") === "true") validateField(e.target.name); });

  // ---- validation
  function setError(input, message) {
    const err = document.getElementById((input.name || input.id) + "-error");
    if (err) err.textContent = message || "";
    for (const t of input.name === "product" ? $$("input[name=product]", form) : [input]) t.setAttribute("aria-invalid", message ? "true" : "false");
  }
  const RULES = {
    product: s => (s.product ? "" : "Choose what you would like to apply for."),
    amount: s => (s.amount >= 1 ? "" : "Enter the amount you would like to borrow."),
    organisation: s => (s.applicant === "company" && !s.organisation ? "Enter the company or organisation name." : ""),
    name: s => (s.name.length < 2 ? (s.applicant === "company" ? "Enter the name of the contact person." : "Enter your full name.") : ""),
    phone: s => (!s.phone ? "Enter a phone number." : PHONE_RE.test(s.phone.replace(/[\s\-().]/g, "")) ? "" : "Enter a phone number with the country code, for example +256 700 000 000."),
    email: s => (!s.email ? "Enter an email address." : EMAIL_RE.test(s.email) ? "" : "Enter an email address like name@example.com."),
    location: s => (s.location.length < 2 ? "Enter your town or district and country." : ""),
    employer: s => (s.employer ? "" : s.applicant === "company" ? "Enter the line of business." : "Enter your employer or business."),
    years: s => (s.years && !/^\d{1,2}$/.test(s.years) ? "Enter whole years, or leave this blank." : ""),
    purpose: s => (s.purpose.length < 10 ? "Describe what the money is for, in a sentence or two." : ""),
    accurate: () => (f("accurate").checked ? "" : "Please confirm the information is accurate."),
    understand: () => (f("understand").checked ? "" : "Please confirm you understand an application does not guarantee a loan."),
    consent: () => (f("consent").checked ? "" : "Please agree that Spear Line may use these details to assess your application.")
  };
  const FIELDS = { 1: ["product"], 2: ["amount"], 3: ["organisation", "name", "phone", "email", "location", "employer", "years"], 4: ["purpose"], 5: ["accurate", "understand", "consent"] };
  const target = name => (name === "product" ? $("input[name=product]", form) : f(name));
  function validateField(name) { const rule = RULES[name]; if (!rule) return ""; const message = rule(state()); setError(target(name), message); return message; }
  function validateStep(n) {
    const bad = FIELDS[n].filter(validateField);
    status.textContent = bad.length ? (bad.length === 1 ? "One answer needs attention before you continue." : `${bad.length} answers need attention before you continue.`) : "";
    if (bad.length) { const first = target(bad[0]); first.focus(); first.scrollIntoView?.({ block: "center", behavior: "smooth" }); }
    return !bad.length;
  }

  // ---- steps
  function go(n, { focus = true } = {}) {
    step = clamp(n, 1, MAX_STEP);
    steps.forEach((el, i) => { el.hidden = i + 1 !== step; });
    progress.forEach((li, i) => { li.classList.toggle("is-done", i + 1 < step); li.classList.toggle("is-current", i + 1 === step); if (i + 1 === step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
    prev.hidden = step === 1; next.hidden = step === MAX_STEP; submit.hidden = step !== MAX_STEP;
    if (step === MAX_STEP) renderReview();
    status.textContent = "";
    if (focus) { $("legend", steps[step - 1])?.focus({ preventScroll: true }); form.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  }
  next.addEventListener("click", () => { if (validateStep(step)) go(step + 1); });
  prev.addEventListener("click", () => go(step - 1));
  form.addEventListener("keydown", e => { if (e.key === "Enter" && step < MAX_STEP && e.target.matches("input:not([type=checkbox]):not([type=radio])")) { e.preventDefault(); next.click(); } });

  // ---- review and message text
  const rowsFor = s => {
    const company = s.applicant === "company";
    return [
      [1, "Applying for", PRODUCTS[s.product] || ""], [2, "Amount requested", amountText(s)], [2, "Preferred term", s.term],
      [3, "Applying as", company ? "A company or organisation" : "An individual"], ...(company ? [[3, "Organisation", s.organisation]] : []),
      [3, company ? "Contact person" : "Name", s.name], [3, "Phone", s.phone], [3, "Email", s.email], [3, "Location", s.location],
      [3, company ? "Line of business" : "Employer or business", s.employer], ...(s.years ? [[3, "Years in this work", s.years]] : []),
      [4, "Purpose", s.purpose], ...(s.target ? [[4, "Date funds needed", s.target]] : []),
      [4, "Documents I can provide", s.docs.length ? s.docs.join("; ") : "None ticked yet"]
    ];
  };
  function renderReview() {
    const dl = $("[data-review]", form); dl.textContent = "";
    for (const [stepNo, label, value] of rowsFor(state())) {
      const row = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd"), btn = document.createElement("button");
      dt.textContent = label; dd.textContent = value || "Not given"; btn.type = "button"; btn.textContent = "Edit";
      const sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = " " + label.toLowerCase(); btn.append(sr);
      btn.addEventListener("click", () => go(stepNo));
      row.append(dt, dd, btn); dl.append(row);
    }
  }
  const makeReference = () => {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kampala", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replaceAll("-", "");
    const alphabet = "ACDEFGHJKMNPQRTUVWXY3479", bytes = crypto.getRandomValues(new Uint8Array(4));
    return `SLF-${day}-${[...bytes].map(b => alphabet[b % alphabet.length]).join("")}`;
  };
  const messageText = s => [`Loan application ${reference}`, "", ...rowsFor(s).map(([, label, value]) => `${label}: ${value}`), "", "I understand that an application does not guarantee a loan, and that final terms and charges are confirmed in writing before I accept.", "Prepared on the Spear Line website."].join("\n");

  // ---- finish: a ready-to-send application, never a silent submission
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (step !== MAX_STEP) { next.click(); return; }
    for (const n of [1, 2, 3, 4]) { if (FIELDS[n].some(name => RULES[name](state()))) { go(n); validateStep(n); return; } }
    if (!validateStep(5)) return;
    reference = makeReference();
    const s = state(), text = messageText(s), subject = `Loan application ${reference}: ${PRODUCTS[s.product]}`;
    const el = (tag, cls, content) => { const node = document.createElement(tag); if (cls) node.className = cls; if (content !== undefined) node.textContent = content; return node; };
    const link = (cls, label, href, external) => { const a = el("a", cls); a.href = href; a.append(el("span", "btn-label", label)); if (external) { a.target = "_blank"; a.rel = "noopener noreferrer"; } return a; };
    done.textContent = "";
    const title = el("h2", "", "Your application is ready to send"); title.id = "done-title";
    const lede = el("p", "lede", "Nothing has been sent yet. Choose how to send it. Your email app or WhatsApp opens with the whole application written out, and you press send there.");
    const ticket = el("article", "ticket"); ticket.setAttribute("aria-label", "Application summary");
    const dl = el("dl");
    for (const [, label, value] of rowsFor(s)) { const row = el("div"); row.append(el("dt", "", label), el("dd", "", value || "Not given")); dl.append(row); }
    const terms = el("div"); terms.append(el("dt", "", "Interest and charges"), el("dd", "", "Set out in writing after assessment")); dl.append(terms);
    ticket.append(el("p", "card-label", "Application reference"), el("p", "ticket-ref", reference), dl);
    const actions = el("div", "send-actions");
    if (channels.mail) actions.append(link("btn btn-primary", "Send by email", `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`));
    if (waNumber) actions.append(link("btn btn-glass", "Send on WhatsApp", waHref(text), true));
    if (channels.call) actions.append(link("btn btn-glass", channels.call.label, channels.call.href));
    const copy = el("button", "btn btn-glass"); copy.type = "button"; copy.append(el("span", "btn-label", "Copy the text"));
    copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText(text); copy.firstChild.textContent = "Copied"; } catch { copy.firstChild.textContent = "Select the summary to copy"; } });
    const print = el("button", "btn btn-glass"); print.type = "button"; print.append(el("span", "btn-label", "Print")); print.addEventListener("click", () => window.print());
    actions.append(copy, print);
    const where = [channels.mail ? `Email goes to ${config.email}.` : "", waNumber ? `WhatsApp goes to +${waNumber.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4")}.` : ""].filter(Boolean).join(" ");
    const help = el("p", "send-help", `${where} If a button does nothing, copy the text and send it yourself. Enquiry hours are Monday to Saturday, 9 am to 6 pm EAT.`);
    const again = el("button", "link"); again.type = "button"; again.append(el("span", "", "Start a new application"));
    again.addEventListener("click", () => { form.reset(); paintApplicant(); setText(count, "0 / 400"); paintLedger(); done.hidden = true; form.hidden = false; go(1); });
    done.append(title, lede, ticket, actions, help, again);
    form.hidden = true; done.hidden = false; done.focus({ preventScroll: true }); done.scrollIntoView({ block: "start" });
  });

  paintApplicant(); paintLedger(); go(1, { focus: false });
}
