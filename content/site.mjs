// Spear Line website content.
//
// This is the only file you need to edit to change words, swap images or add real material.
// After editing, run:  npm run build
//
// Rules this content follows (and tests enforce):
// - Say only what Spear Line can stand behind. No invented stock, prices, testimonials or figures.
// - The optional collections at the bottom (inventory, stats, testimonials, partners, team) stay empty
//   until you have verified material. Each one appears on the site automatically once it has entries.
// - Contact details are not written here. They come from site-config.js (static hosting) or the
//   server environment variables (see docs/DEPLOY.md), so they are never hard-coded twice.
//
// Images: every image key refers to public/assets/visuals/<key>.webp plus a 768 px version
// (<key>-768.webp). See CONTENT.md for sizes and how to add your own photographs.

export const brand = {
  name: 'Spear Line',
  tagline: 'One line. More possibilities.',
  summary: 'Vehicle sales, foodstuffs and beverages, and logistics.',
  description: 'Vehicle sales, foodstuffs and beverages, and logistics. Spear Line connects what you need with what comes next.',
  imageNote: 'AI-generated imagery illustrates our service areas.'
};

// Alt text lives with the image so every use stays consistent.
export const images = {
  'hero-road': { file: '01-hero-road', alt: 'A white SUV and a freight truck travelling through green hills at sunrise', ratio: [1536, 864] },
  'vehicles-suv': { file: '02-vehicles-suv', alt: 'A pearl-white SUV parked at a modern building in evening light', ratio: [1536, 1024] },
  'vehicles-pickup': { file: '03-vehicles-pickup', alt: 'A graphite double-cab pickup on a road beside highland farmland', ratio: [1536, 1024] },
  'logistics-truck': { file: '04-logistics-truck', alt: 'An ivory freight truck at a distribution yard in golden light', ratio: [1536, 1024] },
  'foodstuffs': { file: '05-foodstuffs', alt: 'Sacks of grain and crates of fresh produce in a distribution setting', ratio: [1536, 1024] },
  'beverages': { file: '06-beverages', alt: 'Sealed, unbranded beverage bottles in crates', ratio: [1536, 1024] },
  'warehouse': { file: '07-warehouse', alt: 'An organised warehouse with palletised food staples', ratio: [1536, 1024] },
  'dispatch-team': { file: '08-dispatch-team', alt: 'Two coordinators reviewing a clipboard at a loading bay', ratio: [1536, 1024] },
  'highland-road': { file: '09-highland-road', alt: 'A winding highland road with a delivery truck at sunrise', ratio: [1536, 864] },
  'last-mile-van': { file: '10-last-mile-van', alt: 'A white delivery van beside a pallet of cartons', ratio: [1536, 1024] },
  'container-port': { file: '11-container-port', alt: 'A container terminal with a cargo ship at sunset', ratio: [1536, 1024] },
  'sourcing-detail': { file: '12-sourcing-detail', alt: 'A notebook, a sample bag and vehicle keys on a desk', ratio: [1536, 1024] }
};

export const services = [
  {
    id: 'vehicle', slug: 'vehicles', name: 'Vehicles', label: 'Vehicle sales & trading', icon: 'i-vehicle',
    image: 'vehicles-suv', backdrop: 'vehicles-suv',
    card: 'From everyday journeys to the demands of business. Tell us the vehicle you have in mind, your budget and where you need it.',
    tags: ['SUVs & 4×4s', 'Pickups', 'Business vehicles'],
    hero: { title: 'A vehicle for your next chapter.', lede: 'Your daily route, your business and your budget all shape the right choice. Bring us your requirements and start a focused vehicle conversation.' },
    items: [
      { title: 'SUVs & 4×4s', text: 'Space, capability and comfort. Share your preferred model, year range and the journeys you want it for.', image: 'vehicles-suv', type: 'SUV or 4x4' },
      { title: 'Pickups', text: 'For work and everyday use. Tell us your cab preference, intended use and the capacity you need.', image: 'vehicles-pickup', type: 'Pickup' },
      { title: 'Business vehicles', text: 'Your vehicle should suit the job. Start with passenger or cargo needs, destination and budget.', image: 'last-mile-van', type: 'Business vehicle' }
    ],
    include: ['The vehicle model or type you have in mind', 'Your budget and currency (optional)', 'Where the vehicle needs to go'],
    briefTitle: 'Make the first conversation count.',
    brief: 'Include your preferred vehicle or type, budget and currency, destination, and any essential specifications.',
    cta: 'Start a vehicle enquiry'
  },
  {
    id: 'supplies', slug: 'supplies', name: 'Supplies', label: 'Foodstuffs & beverages', icon: 'i-supplies',
    image: 'foodstuffs', backdrop: 'foodstuffs',
    card: 'Foodstuffs and beverages, shaped around your requirements. Start with your product list, quantities and delivery destination.',
    tags: ['Foodstuffs', 'Beverages', 'Business supply'],
    hero: { title: 'The essentials, handled with purpose.', lede: 'From foodstuffs to beverages, a useful supply conversation begins with the products, quantities and destination. Tell us what your business needs.' },
    items: [
      { title: 'Foodstuffs', text: 'Share your product list, preferred grades or specifications, packaging and quantities.', image: 'foodstuffs' },
      { title: 'Beverages', text: 'Tell us the beverage types, pack sizes, preferred brands and quantities for your order.', image: 'beverages' },
      { title: 'Business requirements', text: 'For a one-off order or a recurring requirement, specify the delivery location and your preferred schedule.', image: 'warehouse' }
    ],
    include: ['Products and specifications', 'Quantities and packaging', 'Delivery destination', 'Preferred timing'],
    briefTitle: 'Your product list is the best place to start.',
    brief: 'Include product names, specifications, quantities, packaging, delivery destination and the date you need them.',
    cta: 'Start a supply enquiry'
  },
  {
    id: 'logistics', slug: 'logistics', name: 'Logistics', label: 'Transport & coordination', icon: 'i-logistics',
    image: 'logistics-truck', backdrop: 'highland-road',
    card: 'A clear brief makes a better journey. Share the cargo, pickup point, destination and timing to discuss the right transport arrangements.',
    tags: ['Cargo movement', 'Delivery planning', 'Route coordination'],
    hero: { title: 'Every load, a clear way forward.', lede: 'Cargo, location, access and timing all shape a transport requirement. Start with the full picture so the route and arrangements can be discussed.' },
    items: [
      { title: 'Cargo movement', text: 'What are you moving? Tell us the cargo type, estimated weight or volume, packaging and any handling requirements.', image: 'logistics-truck' },
      { title: 'Delivery planning', text: 'Where does it need to go? Share pickup and delivery locations, access details and your preferred timing.', image: 'last-mile-van' },
      { title: 'Trade coordination', text: 'For a journey involving several stages, include the origin, destination and any documentation or handover requirements to discuss.', image: 'container-port' }
    ],
    include: ['Pickup location', 'Delivery destination', 'Cargo and estimated load', 'Preferred timing'],
    briefTitle: 'A better brief makes a clearer journey.',
    brief: 'Include cargo details, estimated load, pickup and delivery locations, and your preferred collection or delivery window.',
    cta: 'Start a logistics enquiry'
  }
];

export const home = {
  hero: {
    kicker: 'Vehicles, supplies and logistics',
    title: ['Your next move.', 'Our line of work.'],
    lede: 'Vehicle sales, business supplies and logistics, brought together in one practical conversation.',
    primary: 'Start an enquiry',
    secondary: 'Explore services'
  },
  marquee: ['Vehicle sales & trading', 'Foodstuffs & beverages', 'Transport & coordination', 'One line. More possibilities.'],
  intro: {
    statement: ['The right vehicle.', 'The supplies you need.', 'A clear way to get there.'],
    text: 'Spear Line brings vehicle sales, foodstuffs and beverages, and logistics into one practical conversation. Wherever your requirement starts, we start by listening.'
  },
  servicesTitle: 'Built around what you need.',
  servicesText: 'Three connected business areas. Choose the one that moves you forward, or start with all three in one enquiry.',
  route: {
    title: 'Three stops. One line.',
    text: 'Wherever your requirement starts, it joins the same line: a clear brief, the right details, a confirmed next move.'
  },
  approach: {
    title: 'More than the next transaction.',
    lede: 'It’s understanding the job behind it.',
    text: ['The right vehicle has a purpose. Every supply order has a destination. Every delivery has details that matter.', 'We bring those details into focus, so the conversation starts in the right place and the next step is clear.']
  },
  pillars: [
    { icon: 'i-brief', title: 'Start with your brief', text: 'Share the requirement, destination, timing and the best way to reach you.' },
    { icon: 'i-chat', title: 'One practical conversation', text: 'Vehicles, supplies and logistics begin from the same simple enquiry.' },
    { icon: 'i-pin', title: 'Details that matter', text: 'Specifications, quantities, cargo and destination help define the scope.' },
    { icon: 'i-shield', title: 'Confirmed in writing', text: 'Scope, pricing and arrangements are confirmed in writing before you commit.' }
  ],
  gallery: [
    { image: 'vehicles-pickup', label: 'Vehicles', title: 'Built for your kind of work.', href: 'vehicles.html' },
    { image: 'beverages', label: 'Supplies', title: 'Keep the essentials flowing.', href: 'supplies.html' },
    { image: 'last-mile-van', label: 'Logistics', title: 'Every destination matters.', href: 'logistics.html' },
    { image: 'container-port', label: 'Logistics', title: 'Think beyond the pickup.', href: 'logistics.html' },
    { image: 'sourcing-detail', label: 'Your enquiry', title: 'Your brief brings it together.', href: 'enquire.html' }
  ],
  closing: { title: 'Let’s move something forward.', text: 'A vehicle to find. Supplies to source. Cargo to move.' }
};

export const process = [
  { icon: 'i-brief', title: 'Tell us what you need', text: 'Choose vehicles, supplies or logistics. Share the essentials: the requirement, destination, timing and the best way to reach you.', image: 'sourcing-detail' },
  { icon: 'i-route', title: 'Work through the details', text: 'Product specifications, quantities, vehicle preferences or cargo details help define the scope.', image: 'warehouse' },
  { icon: 'i-clock', title: 'Discuss availability and arrangements', text: 'Availability and arrangements are discussed for your enquiry, using the contact details you provided.', image: 'dispatch-team' },
  { icon: 'i-check', title: 'Agree the next move', text: 'Confirm the scope, pricing and arrangements in writing before making a commitment.', image: 'highland-road' }
];

export const about = {
  hero: { title: 'One line. More possibilities.', lede: 'Spear Line brings together vehicle sales and trading, the supply of foodstuffs and beverages, and logistics.' },
  who: {
    title: 'A practical connection to what comes next.',
    text: ['We start with a simple question: what do you need? The answer guides the conversation, from vehicle preferences to product specifications and transport requirements.', 'Our approach is clear: understand the requirement, work through the details, and agree the next step.']
  },
  principles: [
    { icon: 'i-chat', title: 'Listen first.', text: 'The requirement comes before the recommendation. Your priorities, destination and timing set the direction.' },
    { icon: 'i-brief', title: 'Make the details matter.', text: 'Specifications, quantities and arrangements deserve a proper conversation before the next step.' },
    { icon: 'i-shield', title: 'Keep it clear.', text: 'Scope, pricing and commitments should be understood and confirmed in writing.' }
  ]
};

export const faq = [
  { group: 'Getting started', items: [
    { q: 'What does Spear Line do?', a: 'Spear Line brings together vehicle sales and trading, foodstuffs and beverages, and logistics. Each starts with the same conversation: what do you need, where is it going and when?' },
    { q: 'What should I include in an enquiry?', a: 'Your name and how to reach you, then the details for your service. Vehicles: the model or type, a budget if you wish, and the destination. Supplies: products, quantities, delivery destination and timing. Logistics: pickup, destination, cargo and timing.' },
    { q: 'Is an enquiry a booking or a purchase?', a: 'No. An enquiry starts a conversation. Availability, specifications, price and arrangements are confirmed for each enquiry, and in writing, before you make any commitment.' }
  ] },
  { group: 'Enquiries and privacy', items: [
    { q: 'Can I send an enquiry online?', a: null },
    { q: 'What should I leave out of an enquiry?', a: 'Identity documents, card details, bank details and other sensitive information. You can add anything further once you are in conversation.' },
    { q: 'How is my information used?', a: 'To review and respond to your request. The privacy page explains what is collected, how long it is kept when online enquiries are enabled, and how to ask about your information.' }
  ] },
  { group: 'About this website', items: [
    { q: 'Are the images real photographs?', a: 'No. The imagery on this website is AI-generated and illustrates our service areas. It does not show Spear Line staff, stock, facilities or vehicles, and is not a claim of completed work.' },
    { q: 'Do you list stock or prices here?', a: 'Not yet. When verified vehicle listings are published they will appear on the vehicles page. Until then, share what you need and the details are confirmed for your enquiry.' },
    { q: 'What is Spear Line Bar?', a: 'The next chapter of Spear Line. It is coming soon, and the location, opening details and menu will be announced on its page. Nothing is open or bookable yet.' }
  ] }
];
// Shown for the "Can I send an enquiry online?" answer, switched automatically by site configuration.
export const onlineAnswer = {
  closed: 'Online submission is not currently open. You can prepare your enquiry on the website, which creates a downloadable draft. Nothing is sent to Spear Line until online submission opens. Check the contact page for direct channels.',
  open: 'Yes. Choose a service on the enquiry page, complete the short form and send it. You will receive a reference once it is received.'
};

export const bar = {
  hero: { title: 'Spear Line Bar.', tagline: 'A new chapter. Pull up a seat.', text: 'Something new is taking shape. We’re getting ready to introduce Spear Line Bar.' },
  note: 'Bar details and opening updates will be announced here.',
  // Replace each 'To be announced' with real details when they are decided.
  share: [
    { icon: 'i-pin', title: 'Where', text: 'The location', status: 'To be announced' },
    { icon: 'i-clock', title: 'When', text: 'Opening details', status: 'To be announced' },
    { icon: 'i-glass', title: 'What’s pouring', text: 'The menu', status: 'To be announced' }
  ]
};

export const contactPage = {
  hero: { title: 'The next move starts with a message.', lede: 'A short enquiry gets you a better first conversation than a general message.' },
  emptyTitle: 'Direct contact details will appear here.',
  emptyText: 'No public email, phone or address has been published yet. Start an enquiry to put your requirement in front of Spear Line.'
};

// ---------------------------------------------------------------------------------------------
// Optional real-content collections. Leave empty until you have verified material.
// Each block appears on the site automatically when it has entries. See CONTENT.md for examples.
// ---------------------------------------------------------------------------------------------

// Vehicle listings shown on the vehicles page.
// { title: 'Toyota Land Cruiser 300', year: 2023, details: ['Diesel', 'Automatic'], price: 'On request', status: 'Available', image: 'vehicles-suv' }
export const inventory = [];

// Short facts with numbers, shown on the home and about pages. Only publish figures you can verify.
// { value: 12, suffix: '+', label: 'Years in vehicle trading' }
export const stats = [];

// Customer quotes, shown on the home page. Publish only with the customer's permission.
// { quote: '…', name: 'Name', role: 'Role, Company' }
export const testimonials = [];

// Supplier or partner names, shown as a moving strip. Use names only with permission.
// { name: 'Partner name' }
export const partners = [];

// People, shown on the about page.
// { name: 'Name', role: 'Role', image: 'dispatch-team' }
export const team = [];
