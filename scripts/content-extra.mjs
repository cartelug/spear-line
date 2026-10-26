// Homepage additions and the How it works, FAQ and Contact pages.
// Copy here only restates what the rest of the site already says; no invented claims, prices or contact details.
export function buildExtra({ img, button, textLink, arrow, ic, services, closing }) {
  const spear = (cls = '') => `<svg class="ico spear-glyph${cls ? ' ' + cls : ''}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><use href="assets/icons.svg#i-spear"/></svg>`;

  const tickerItems = ['Vehicle sales & trading', 'Foodstuffs & beverages', 'Transport & coordination', 'Your next move', 'One line. More possibilities.'];
  const tickerList = hidden => `<ul class="ticker-list"${hidden ? ' aria-hidden="true"' : ''}>${tickerItems.map(t => `<li>${t}${spear()}</li>`).join('')}</ul>`;
  const ticker = `<section class="ticker" aria-label="Spear Line at a glance" data-ticker><div class="ticker-track" data-ticker-track>${tickerList(false)}${tickerList(true)}</div></section>`;

  const pillarData = [
    ['i-brief', 'Start with your brief', 'Share the requirement, destination, timing and the best way to reach you.'],
    ['i-chat', 'One practical conversation', 'Vehicles, supplies and logistics begin from the same simple enquiry.'],
    ['i-pin', 'Details that matter', 'Specifications, quantities, cargo and destination help define the scope.'],
    ['i-shield', 'Confirmed in writing', 'Scope, pricing and arrangements are confirmed in writing before you commit.']
  ];
  const pillars = `<section class="pillars section" aria-labelledby="pillars-title"><div class="container"><div class="section-head" data-reveal><div><p class="eyebrow">How we work</p><h2 id="pillars-title">Simple on the surface.<span class="line">Careful in the <em>detail.</em></span></h2></div><p>Four habits shape every conversation, whichever service you start with.</p></div><ul class="pillar-grid">${pillarData.map(([icon, title, text], i) => `<li class="pillar">${ic(icon, 'pillar-icon')}<h3>${title}</h3><p>${text}</p></li>`).join('')}</ul></div></section>`;

  const routePath = 'M40 170 C 210 170, 260 56, 500 60 S 800 170, 960 60';
  const route = `<section class="route section ink" data-route aria-labelledby="route-title"><div class="container"><div class="section-head" data-reveal><div><p class="eyebrow">The line</p><h2 id="route-title">Three stops.<span class="line">One <em>line.</em></span></h2></div><p>Wherever your requirement starts, it joins the same line: a clear brief, the right details, a confirmed next move.</p></div><div class="route-stage"><svg class="route-svg" viewBox="0 0 1000 220" aria-hidden="true" focusable="false"><path class="route-base" d="${routePath}"/><path class="route-draw" d="${routePath}" data-route-path/><g data-route-nodes></g><g class="route-spear" data-route-spear><use href="assets/icons.svg#i-spear" x="-22" y="-22" width="44" height="44"/></g></svg><ol class="route-stops">${services.map(s => `<li class="route-stop" data-route-stop><a href="${s.url}"><span class="route-stop-icon">${ic(s.icon)}</span><strong>${s.name}</strong><span class="route-stop-text">${s.short}</span>${arrow}</a></li>`).join('')}</ol></div></div></section>`;

  /* ---- How it works ---- */
  const steps = [
    ['i-brief', 'Tell us what you need', 'Choose vehicles, supplies or logistics. Share the essentials: the requirement, destination, timing and the best way to reach you.'],
    ['i-route', 'Work through the details', 'Product specifications, quantities, vehicle preferences or cargo details help define the scope.'],
    ['i-clock', 'Discuss availability and arrangements', 'Availability and arrangements are discussed for your enquiry, using the contact details you provided.'],
    ['i-check', 'Agree the next move', 'Confirm the scope, pricing and arrangements in writing before making a commitment.']
  ];
  const bring = [
    { s: services[0], list: ['The vehicle model or type you have in mind', 'Your budget and currency (optional)', 'Where the vehicle needs to go'] },
    { s: services[1], list: ['Products and specifications', 'Quantities and packaging', 'Delivery destination', 'Preferred timing'] },
    { s: services[2], list: ['Pickup location', 'Delivery destination', 'Cargo and estimated load', 'Preferred timing'] }
  ];
  const processPage = `<section class="subhero photo-section"><div class="photo-bg" data-parallax>${img('12-sourcing-detail', 'Notebook, vehicle keys and a sample bag arranged on a desk', '', true, '100vw')}</div><div class="container subhero-content"><a class="breadcrumb" href="index.html">Home / How it works</a><p class="eyebrow">A clear way forward</p><h1>From a brief<span class="line">to your next <em>move.</em></span></h1>${button('Prepare your brief', 'enquire.html', 'light')}</div></section>
<section class="section timeline-section" aria-labelledby="steps-title"><div class="container"><div class="section-head" data-reveal><div><p class="eyebrow">Four steps</p><h2 id="steps-title">Simple beginnings.<span class="line">Clear <em>next steps.</em></span></h2></div><p>An enquiry is the start of a conversation, not a booking or a purchase.</p></div><ol class="timeline" data-timeline><span class="timeline-line" aria-hidden="true"><span data-timeline-fill></span></span>${steps.map(([icon, title, text], i) => `<li class="timeline-step" data-timeline-step><span class="timeline-node" aria-hidden="true">${ic(icon)}</span><div class="timeline-copy"><span class="step-no">0${i + 1}</span><h3>${title}</h3><p>${text}</p></div></li>`).join('')}</ol></div></section>
<section class="section forest bring-section" aria-labelledby="bring-title"><div class="container"><div class="section-head" data-reveal><div><p class="eyebrow">Before you begin</p><h2 id="bring-title">What to <em>bring.</em></h2></div><p>The more precise the brief, the better the first conversation. You can always add details later.</p></div><div class="bring-grid">${bring.map(({ s, list }) => `<article class="bring-card">${ic(s.icon, 'bring-icon')}<p class="eyebrow">${s.num} / ${s.name}</p><h3>${s.short}</h3><ul class="check-list">${list.map(item => `<li>${ic('i-check')}<span>${item}</span></li>`).join('')}</ul>${textLink('Start a ' + (s.id === 'vehicle' ? 'vehicle' : s.id === 'supplies' ? 'supply' : 'logistics') + ' brief', 'enquire.html?service=' + s.id)}</article>`).join('')}</div><p class="bring-note" data-reveal>Always include your name and a phone number or email address. Please leave out identity documents, card details and bank details.</p></div></section>
${closing()}`;

  /* ---- FAQ ---- */
  const faq = [
    ['Getting started', [
      ['What does Spear Line do?', 'Spear Line brings together vehicle sales and trading, foodstuffs and beverages, and logistics. Each starts with the same conversation: what do you need, where is it going and when?'],
      ['What should I include in an enquiry?', 'Your name and how to reach you, then the details for your service. Vehicles: the model or type, a budget if you wish, and the destination. Supplies: products, quantities, delivery destination and timing. Logistics: pickup, destination, cargo and timing.'],
      ['Is an enquiry a booking or a purchase?', 'No. An enquiry starts a conversation. Availability, specifications, price and arrangements are confirmed for each enquiry, and in writing, before you make any commitment.']
    ]],
    ['Enquiries and privacy', [
      ['Can I send an enquiry online?', null],
      ['What should I leave out of an enquiry?', 'Identity documents, card details, bank details and other sensitive information. You can add anything further once you are in conversation.'],
      ['How is my information used?', 'To review and respond to your request. The privacy page explains what is collected, how long it is kept when online enquiries are enabled, and how to ask about your information.']
    ]],
    ['About this website', [
      ['Are the images real photographs?', 'No. The imagery on this website is AI-generated and illustrates our service areas. It does not show Spear Line staff, stock, facilities or vehicles, and is not a claim of completed work.'],
      ['Do you list stock or prices here?', 'No. This website does not publish stock or price lists. Share what you need and the details are confirmed for your enquiry.'],
      ['What is Spear Line Bar?', 'The next chapter of Spear Line. It is coming soon, and the location, opening details and menu will be announced on its page. Nothing is open or bookable yet.']
    ]]
  ];
  const liveAnswer = '<span data-faq-closed>Online submission is not currently open. You can prepare your enquiry on the website, which creates a downloadable draft. Nothing is sent to Spear Line until online submission opens. Check the contact page for direct channels.</span><span data-faq-open hidden>Yes. Choose a service on the enquiry page, complete the short form and send it. You will receive a reference once it is received.</span>';
  const faqText = a => a === null ? liveAnswer : a;
  const faqPage = `<section class="subhero photo-section"><div class="photo-bg" data-parallax>${img('07-warehouse', 'An organised distribution warehouse with palletised food staples', '', true, '100vw')}</div><div class="container subhero-content"><a class="breadcrumb" href="index.html">Home / Questions</a><p class="eyebrow">Good to know</p><h1>Questions,<span class="line">answered <em>plainly.</em></span></h1>${button('Prepare your brief', 'enquire.html', 'light')}</div></section>
<section class="section faq-section"><div class="container faq-layout"><nav class="faq-index" aria-label="Question topics" data-faq-index><p class="eyebrow">Topics</p><ul>${faq.map(([group], i) => `<li><a href="#faq-${i}">${group}</a></li>`).join('')}</ul></nav><div class="faq-groups">${faq.map(([group, items], i) => `<section class="faq-group" id="faq-${i}" aria-labelledby="faq-${i}-title"><h2 id="faq-${i}-title" data-reveal>${group}</h2><div class="faq-list" data-accordion>${items.map(([q, a], j) => `<details${i === 0 && j === 0 ? ' open' : ''}><summary><span>${q}</span><span class="plus" aria-hidden="true"></span></summary><div class="step-content"><p>${faqText(a)}</p></div></details>`).join('')}</div></section>`).join('')}</div></div></section>
${closing()}`;
  const faqLd = faq.flatMap(([, items]) => items).filter(([, a]) => a !== null).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }));

  /* ---- Contact ---- */
  const channels = [
    ['i-mail', 'Email', 'data-contact-email'],
    ['i-phone', 'Phone', 'data-contact-phone'],
    ['i-whatsapp', 'WhatsApp', 'data-contact-whatsapp'],
    ['i-pin', 'Address', 'data-address']
  ];
  const contactPage = `<section class="subhero photo-section"><div class="photo-bg" data-parallax>${img('08-dispatch-team', 'Two coordinators working through a brief at a loading bay', '', true, '100vw')}</div><div class="container subhero-content"><a class="breadcrumb" href="index.html">Home / Contact</a><p class="eyebrow">Let’s talk</p><h1>The next move<span class="line">starts with a <em>message.</em></span></h1>${button('Prepare your brief', 'enquire.html', 'light')}</div></section>
<section class="section contact-section"><div class="container contact-layout"><div data-reveal><p class="eyebrow">The quickest way to begin</p><h2>Send the details<span class="line">that matter.</span></h2><p class="lede">A short brief gets you a better first conversation than a general message.</p><p data-legal-identity></p>${button('Prepare your enquiry', 'enquire.html')}</div><div><ul class="contact-cards">${channels.map(([icon, label, attr]) => `<li class="contact-card" data-contact-card hidden><span class="contact-icon">${ic(icon)}</span><div><h3>${label}</h3><p ${attr} hidden></p></div></li>`).join('')}</ul><div class="contact-empty" data-contact-empty>${ic('i-chat', 'contact-empty-icon')}<div><h3>Direct contact details are coming.</h3><p>No public email, phone or address has been published yet. The enquiry page is the way to put your requirement in front of Spear Line.</p></div></div></div></div></section>
${closing()}`;

  return { ticker, pillars, route, processPage, faqPage, faqLd, contactPage };
}
