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
  summary: 'Trading, vehicles, supply, logistics and an expanding portfolio of business opportunities.',
  description: 'Spear Line connects trading, automotive, supply and logistics needs with a broader vision for enterprise and opportunity.',
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
  'sourcing-detail': { file: '12-sourcing-detail', alt: 'A notebook, a sample bag and vehicle keys on a desk', ratio: [1536, 1024] },
  'keys-handover': { file: '14-keys-handover', alt: 'A car key being passed from one hand to another in front of a white SUV at golden hour', ratio: [1536, 1024] },
  'bar-lounge': { file: '15-bar-lounge', alt: 'An empty bar counter at dusk with two amber drinks over ice under warm pendant lamps', ratio: [1536, 1024] },
  'aerial-road': { file: '16-aerial-road', alt: 'An aerial view of a red-earth road winding through green terraced highlands at sunrise, with a truck and an SUV on it', ratio: [1536, 1024] },
  'loading-bay': { file: '17-loading-bay', alt: 'Two workers seen from behind guiding a pallet toward a truck at a warehouse loading bay at dawn', ratio: [1536, 1024] },
  'market-produce': { file: '18-market-produce', alt: 'Wooden crates of green bananas, tomatoes, onions and maize beside sacks of grain in warm evening light', ratio: [1536, 1024] },
  'topo-route': { file: '19-topo-route', alt: 'Fine golden contour lines on a dark ground with a glowing teal route line and three nodes', ratio: [1536, 1024] },
  'desk-contact': { file: '20-desk-contact', alt: 'A desk lamp, an open notebook and pen, a phone and a cup of coffee by a window at dusk', ratio: [1536, 1024] },
  'team-yard': { file: '21-team-yard', alt: 'Three people seen from behind walking past a row of trucks and SUVs in a yard at golden hour', ratio: [1536, 1024] },
  'wheel-detail': { file: '22-wheel-detail', alt: 'A dusty SUV wheel on a red-earth road with green hills behind it', ratio: [1536, 1024] },
  'bar-glass': { file: '23-bar-glass', alt: 'A crystal tumbler with an amber drink, a large ice cube and an orange peel', ratio: [1536, 1024] }
};

// V12 company map: opportunities are not presented as verified operational facilities.
export const divisions = [
  { number: '01', name: 'Building Materials & Equipment', category: 'Construction & sourcing', status: 'Developing', image: 'warehouse', href: 'contact.html', text: 'Explore requirements for building materials, tools and equipment through a considered sourcing conversation.' },
  { number: '02', name: 'Motors & Automotive', category: 'Vehicles & mobility', status: 'Enquiry-led', image: 'vehicles-suv', href: 'vehicles.html', text: 'Vehicle trading and sourcing conversations shaped around your preferred model, destination and budget.' },
  { number: '03', name: 'Food & Beverages', category: 'Business supply', status: 'Enquiry-led', image: 'foodstuffs', href: 'supplies.html', text: 'Discuss product lists, quantities, preferred packaging and delivery requirements.' },
  { number: '04', name: 'Fitness, Health & Wellness', category: 'Nonclinical concepts', status: 'Concept', image: 'sourcing-detail', href: 'contact.html', text: 'An emerging area of the Spear Line vision, focused on fitness and everyday wellbeing opportunities.' },
  { number: '05', name: 'Real Estate Services', category: 'Property opportunities', status: 'Concept', image: 'aerial-road', href: 'contact.html', text: 'An area of development for property-related services, subject to confirmation of the operating model.' },
  { number: '06', name: 'Leisure, Entertainment & Hospitality', category: 'Places & experiences', status: 'Developing', image: 'bar-lounge', href: 'bar.html', text: 'Explore the ideas taking shape around hospitality, leisure and the upcoming Spear Line Bar.' }
];

export const digitalCapabilities = [
  { number: '01', title: 'Websites & online presence', text: 'Responsive business websites, landing pages, company profiles and search foundations.' },
  { number: '02', title: 'Brand identity & creative', text: 'Visual identities, business documents, presentations and campaign design.' },
  { number: '03', title: 'Booking & business systems', text: 'Scoping for bookings, ticketing, QR check-in, dashboards and customer portals.' },
  { number: '04', title: 'Content & video production', text: 'Campaign ideas, motion design, promotional edits and social media content.' },
  { number: '05', title: 'Marketing & advertising', text: 'Professional social profiles, advertising creative and measurable campaign planning.' },
  { number: '06', title: 'Automation & infrastructure', text: 'Enquiry workflows, reporting, business email, domains, hosting and support by agreement.' }
];

export const services = [
  {
    id: 'vehicle', slug: 'vehicles', name: 'Vehicles', label: 'Vehicle sales & trading', icon: 'i-vehicle',
    image: 'vehicles-suv', backdrop: 'vehicles-suv', moment: 'keys-handover', closing: 'wheel-detail',
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
    image: 'foodstuffs', backdrop: 'foodstuffs', moment: 'market-produce', closing: 'beverages',
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
    image: 'logistics-truck', backdrop: 'highland-road', moment: 'loading-bay', closing: 'container-port',
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
    kicker: 'South Sudan · Trading, enterprise & opportunity',
    title: ['One company.', 'More ways forward.'],
    lede: 'Vehicles, sourcing, business supplies and logistics today. A wider portfolio of ideas and opportunities for tomorrow.',
    primary: 'Start a conversation',
    secondary: 'Explore our divisions'
  },
  marquee: ['Vehicle sales & trading', 'Foodstuffs & beverages', 'Transport & coordination', 'One line. More possibilities.'],
  intro: {
    statement: ['The right vehicle.', 'The supplies you need.', 'A clear way to get there.'],
    text: 'Spear Line brings vehicle sales, foodstuffs and beverages, and logistics into one practical conversation. Wherever your requirement starts, we start by listening.'
  },
  servicesTitle: 'Where the work begins.',
  servicesText: 'Start with the practical needs: a vehicle, goods for your business or a load to move. Every request starts with a clear brief.',
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
    { image: 'keys-handover', label: 'Vehicles', title: 'Ready for the handover.', href: 'vehicles.html' },
    { image: 'market-produce', label: 'Supplies', title: 'Staples, shaped to your list.', href: 'supplies.html' },
    { image: 'beverages', label: 'Supplies', title: 'Keep the essentials flowing.', href: 'supplies.html' },
    { image: 'loading-bay', label: 'Logistics', title: 'From the bay to the road.', href: 'logistics.html' },
    { image: 'last-mile-van', label: 'Logistics', title: 'Every destination matters.', href: 'logistics.html' },
    { image: 'wheel-detail', label: 'Vehicles', title: 'Made for the road ahead.', href: 'vehicles.html' },
    { image: 'container-port', label: 'Logistics', title: 'Think beyond the pickup.', href: 'logistics.html' },
    { image: 'sourcing-detail', label: 'Your enquiry', title: 'Your brief brings it together.', href: 'enquire.html' }
  ],
  closing: { title: 'Let’s move something forward.', text: 'A vehicle, a business requirement, an opportunity worth discussing.' }
};

export const process = [
  { icon: 'i-brief', title: 'Tell us what you need', text: 'Choose vehicles, supplies or logistics. Share the essentials: the requirement, destination, timing and the best way to reach you.', image: 'desk-contact' },
  { icon: 'i-route', title: 'Work through the details', text: 'Product specifications, quantities, vehicle preferences or cargo details help define the scope.', image: 'market-produce' },
  { icon: 'i-clock', title: 'Discuss availability and arrangements', text: 'Availability and arrangements are discussed for your enquiry, using the contact details you provided.', image: 'dispatch-team' },
  { icon: 'i-check', title: 'Agree the next move', text: 'Confirm the scope, pricing and arrangements in writing before making a commitment.', image: 'keys-handover' }
];

export const about = {
  hero: { title: 'One company. More ways forward.', lede: 'Spear Line connects vehicle trading, sourcing, supply and logistics with a developing six-division business vision.' },
  who: {
    title: 'Business begins with a better understanding.',
    text: ['Spear Line starts with practical requirements for vehicles, goods and transport, then makes space for opportunities in materials, wellness, real estate and hospitality.', 'Each division has its own maturity and scope. Our approach remains the same: understand the need, clarify the details and agree the next step before making commitments.']
  },
  principles: [
    { icon: 'i-chat', title: 'Listen first.', text: 'The requirement comes before the recommendation. Your priorities, destination and timing set the direction.' },
    { icon: 'i-brief', title: 'Make the details matter.', text: 'Specifications, quantities and arrangements deserve a proper conversation before the next step.' },
    { icon: 'i-shield', title: 'Keep it clear.', text: 'Scope, pricing and commitments should be understood and confirmed in writing.' }
  ]
};

export const faq = [
  { group: 'Getting started', items: [
    { q: 'What does Spear Line do?', a: 'Spear Line is developing a six-division portfolio across materials and equipment, motors and automotive, food and beverages, fitness and wellness, real estate, and leisure and hospitality. Vehicle trading, supplies and transport coordination remain practical areas for enquiries. Planned activities are labelled as such.' },
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
