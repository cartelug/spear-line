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

export const services = [
  {
    id: 'vehicle', slug: 'vehicles', name: 'Vehicles', label: 'Vehicle sales & trading', icon: 'i-vehicle', status: 'preparing', group: 'trade',
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
    id: 'supplies', slug: 'supplies', name: 'Supplies', label: 'Foodstuffs & beverages', icon: 'i-supplies', status: 'preparing', group: 'trade',
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
    id: 'logistics', slug: 'logistics', name: 'Logistics', label: 'Transport & coordination', icon: 'i-logistics', status: 'preparing', group: 'movement',
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
    kicker: 'Vehicles, timber, supplies and logistics',
    title: ['Your next move.', 'Our line of work.'],
    lede: 'Vehicle sales, timber haulage, business supplies and logistics, brought together in one practical conversation.',
    primary: 'Start an enquiry',
    secondary: 'Explore services'
  },
  marquee: ['Vehicle sales & trading', 'Timber haulage', 'Foodstuffs & beverages', 'Transport & coordination', 'One line. More possibilities.'],
  intro: {
    statement: ['The right vehicle.', 'The supplies you need.', 'A clear way to get there.'],
    text: 'Spear Line brings vehicle sales, timber haulage, foodstuffs and beverages, and logistics into one practical conversation, with more businesses planned. Wherever your requirement starts, we start by listening.'
  },
  servicesTitle: 'Built around what you need.',
  servicesText: 'Three business areas that start from the same simple enquiry. Choose the one that moves you forward, or start with all three in one enquiry.',
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
  closing: { title: 'Let’s move something forward.', text: 'A vehicle to find. Supplies to source. Cargo to move.' }
};

export const process = [
  { icon: 'i-brief', title: 'Tell us what you need', text: 'Choose vehicles, supplies or logistics. Share the essentials: the requirement, destination, timing and the best way to reach you.', image: 'desk-contact' },
  { icon: 'i-route', title: 'Work through the details', text: 'Product specifications, quantities, vehicle preferences or cargo details help define the scope.', image: 'market-produce' },
  { icon: 'i-clock', title: 'Discuss availability and arrangements', text: 'Availability and arrangements are discussed for your enquiry, using the contact details you provided.', image: 'dispatch-team' },
  { icon: 'i-check', title: 'Agree the next move', text: 'Confirm the scope, pricing and arrangements in writing before making a commitment.', image: 'keys-handover' }
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
    { q: 'Are the images real photographs?', a: 'No. The imagery on this website is AI-generated. It illustrates our service areas and, on the founders page, the founder, where it is captioned as an illustration. It does not document real staff, stock, facilities, vehicles or completed work.' },
    { q: 'Do you list stock or prices here?', a: 'Not yet. When verified vehicle listings are published they will appear on the vehicles page. Until then, share what you need and the details are confirmed for your enquiry.' },
    { q: 'What do the status labels mean?', a: 'Preparing to launch means Spear Line is getting ready and welcomes enquiries; availability, specifications, price and arrangements are confirmed for each one. Planned means the business is an idea being worked toward. Nothing planned is open, listed or bookable, and you can register interest. A business is labelled Active only when it is running and the evidence is on record.' },
    { q: 'Is Spear Line Timber a timber supplier?', a: 'No. Spear Line Timber is about moving timber: haulage and transport coordination. No timber is listed for sale on this website.' },
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
  emptyText: 'No public email, phone or address has been published yet. Start an enquiry to put your requirement in front of Spear Line.',
  nextTitle: 'What happens after you send it.',
  next: [
    { icon: 'i-brief', title: 'You send the details', text: 'Choose a business and share the essentials. The more precise the brief, the better the first conversation.' },
    { icon: 'i-search', title: 'Your enquiry is reviewed', text: 'Availability, specifications and arrangements are checked for your request.' },
    { icon: 'i-shield', title: 'You hear what happens next', text: 'Scope, price and arrangements are confirmed in writing before any commitment.' }
  ]
};

// ---------------------------------------------------------------------------------------------
// Businesses, status and the pages that go with them.
//
// Every business has a status, using the owner's vocabulary. 'active' is allowed only with an `evidence` note
// (for example "Owner confirmed, 12 November 2026"); a test fails otherwise. Planned businesses offer
// "Register interest", carry noindex in launch mode and stay out of the sitemap until they move up.
// The three live services above are the existing pages; the entries below add the new ones. Both share one template.
// ---------------------------------------------------------------------------------------------

export const statuses = {
  active: { label: 'Active', note: '' },
  preparing: { label: 'Preparing to launch', note: 'We are preparing this business. Enquiries are welcome, and availability, specifications, price and arrangements are confirmed for each one.' },
  planned: { label: 'Planned', note: 'This is a planned business. Nothing is open, listed or bookable yet. Register your interest and it will be taken into account when this business is ready.' }
};

export const divisions = [
  {
    id: 'timber', slug: 'timber', name: 'Spear Line Timber', short: 'Timber', label: 'Timber haulage & coordination', icon: 'i-timber', status: 'preparing', group: 'movement',
    enquiry: 'logistics', enquiryType: 'Timber',
    image: 'logistics-truck', backdrop: 'highland-road', moment: 'loading-bay', closing: 'highland-road',
    card: 'Timber, moved with care. Tell us the cargo, where it is collected and where it needs to go, and the right transport arrangements can be discussed.',
    tags: ['Haulage', 'Route coordination', 'Documented handover'],
    hero: { title: 'Timber, moved with care.', lede: 'A timber consignment needs a clear brief: what is moving, where from, where to and when. Share it and start a focused transport conversation.' },
    items: [
      { title: 'Haulage', text: 'Tell us the type of timber, the estimated volume or weight, the packaging and how it will be loaded.', image: 'logistics-truck' },
      { title: 'Route coordination', text: 'Share the collection point, the destination and any border crossings or access details to discuss.', image: 'highland-road' },
      { title: 'Handover and paperwork', text: 'Agree the handover, and the documents that apply to your consignment, before anything moves.', image: 'sourcing-detail' }
    ],
    include: ['What is being moved, and the type of timber', 'Estimated volume or weight, and packaging', 'Where it is collected and where it needs to go', 'When it is ready and when it is needed'],
    briefTitle: 'A clear consignment note starts it.',
    brief: 'Include the cargo, the estimated volume or weight, the collection point, the destination, your timing and the documents that apply to your consignment.',
    cta: 'Start a timber enquiry',
    boundary: 'This service is for moving timber. No timber is listed for sale on this website.'
  },
  {
    id: 'building', slug: 'building-supplies', name: 'Building supplies', label: 'Building materials & equipment', icon: 'i-build', status: 'planned', group: 'trade',
    enquiry: 'construction',
    image: 'loading-bay', backdrop: 'loading-bay', moment: 'dispatch-team', closing: 'logistics-truck',
    card: 'A planned business for builders, contractors and homeowners: materials, tools and equipment sourced to your specification and delivered to site.',
    tags: ['Materials', 'Tools & equipment', 'Delivery to site'],
    hero: { title: 'Build with what the job needs.', lede: 'Spear Line is planning to supply building materials, tools and equipment. Tell us what your project needs and register your interest.' },
    items: [
      { title: 'Materials', text: 'Roofing, steel, cement, blocks, tiles and finishes are the kinds of products being planned. Share the list your project needs.', image: 'warehouse', alt: 'Palletised sacks stacked in an organised warehouse' },
      { title: 'Tools and equipment', text: 'Hand tools, power tools and building equipment. Tell us what you use and in what quantity.', image: 'sourcing-detail' },
      { title: 'Delivery to site', text: 'Materials are only useful where the work is. Share the site location and the date you need them there.', image: 'logistics-truck' }
    ],
    include: ['What you need, and in what quantities', 'Where it needs to be delivered', 'When you need it', 'Any brand or specification that matters'],
    briefTitle: 'Your materials list is the best place to start.',
    brief: 'Tell us what your project needs, how much, where it is going and when. Registering interest does not request a quote; it tells us this business matters to you.',
    cta: 'Register interest',
    boundary: 'No products, stock or prices are listed. Supply arrangements are being worked out.'
  },
  {
    id: 'fitness', slug: 'fitness-wellness', name: 'Fitness & wellness', label: 'Fitness, health & wellness', icon: 'i-fitness', status: 'planned', group: 'lifestyle',
    enquiry: 'fitness',
    image: 'topo-route', backdrop: 'topo-route', moment: 'highland-road', closing: 'highland-road',
    card: 'A planned business for everyday fitness and general wellbeing: a place to train, group sessions and healthy-lifestyle programmes.',
    tags: ['Training', 'Group sessions', 'Wellbeing'],
    hero: { title: 'A stronger routine, planned.', lede: 'Spear Line is planning fitness and wellness services. Register your interest and tell us what you would look for.' },
    items: [
      { title: 'A place to train', text: 'Tell us what matters most to you in a place to train, from the space to the hours that suit your day.', image: 'topo-route' },
      { title: 'Group sessions', text: 'Classes and supervised sessions at different levels. Tell us what you would join.', image: 'highland-road' },
      { title: 'Everyday wellbeing', text: 'General, non-clinical wellness programmes for individuals and for teams at work.', image: 'aerial-road' }
    ],
    include: ['What you would like to do: train, take classes or work with a coach', 'Where you would want it to be', 'When you would use it'],
    briefTitle: 'Tell us what would make you join.',
    brief: 'Share what you would want from a fitness and wellness business and where you are. It helps decide what comes first.',
    cta: 'Register interest',
    boundary: 'Fitness and wellness here means exercise and general wellbeing. It is not a medical or clinical service.'
  },
  {
    id: 'property', slug: 'real-estate', name: 'Real estate', label: 'Real estate services', icon: 'i-property', status: 'planned', group: 'lifestyle',
    enquiry: 'property',
    image: 'aerial-road', backdrop: 'aerial-road', moment: 'desk-contact', closing: 'aerial-road',
    card: 'A planned business for people who want to buy, sell, rent or let property, or who need a property looked after.',
    tags: ['Buying & selling', 'Renting & letting', 'Property care'],
    hero: { title: 'Property, handled with care.', lede: 'Spear Line is planning real estate services. Tell us what you are looking for and register your interest.' },
    items: [
      { title: 'Buying and selling', text: 'Looking for a property, or thinking of selling one? Tell us the type, the area and what matters most.', image: 'aerial-road' },
      { title: 'Renting and letting', text: 'Whether you need a place to rent or have one to let, share the details and what you are hoping for.', image: 'desk-contact' },
      { title: 'Property care', text: 'Ongoing care for a property, from tenants to maintenance, is part of what is being planned.', image: 'dispatch-team' }
    ],
    include: ['Whether you want to buy, sell, rent, let or have a property managed', 'The area and type of property', 'When you would like to begin'],
    briefTitle: 'Describe the property you have in mind.',
    brief: 'Share what you are looking for, where, and when. Registering interest does not start a transaction.',
    cta: 'Register interest',
    boundary: 'No properties are listed on this website, and nothing here says Spear Line owns, sells or lets any property.'
  },
  {
    id: 'hospitality', slug: 'hospitality', name: 'Leisure & hospitality', label: 'Leisure, entertainment & hospitality', icon: 'i-glass', status: 'planned', group: 'lifestyle',
    enquiry: 'hospitality',
    image: 'bar-lounge', backdrop: 'bar-lounge', moment: 'bar-glass', closing: 'bar-lounge',
    card: 'A planned business for places to relax and meet, starting with Spear Line Bar. Details will appear here as they are decided.',
    tags: ['Spear Line Bar', 'Lounges', 'Stays & events'],
    hero: { title: 'Somewhere to slow down.', lede: 'Spear Line is planning places to relax, meet and stay. Register your interest and tell us what you would like to see.' },
    items: [
      { title: 'Spear Line Bar', text: 'The first idea taking shape: a place to pull up a seat. Its details will be announced on its own page.', image: 'bar-lounge', href: 'bar.html', linkText: 'See the Bar page' },
      { title: 'Lounges and social spaces', text: 'Spaces to relax and meet. Tell us what you would want from one.', image: 'bar-glass' },
      { title: 'Stays and events', text: 'Guest accommodation and private events are part of the wider plan, and nothing is open or bookable yet.', image: 'aerial-road' }
    ],
    include: ['What you would like to see: a venue, a stay or a space for events', 'Where you would want it to be', 'When you might use it'],
    briefTitle: 'Tell us what you would come for.',
    brief: 'Share what you would like from a Spear Line venue and where you are. It helps shape what comes first.',
    cta: 'Register interest',
    boundary: 'No venue, room or event is advertised here, and nothing can be booked yet.'
  },
  {
    id: 'digital', slug: 'digital', name: 'Digital services', label: 'Websites, brand & social media', icon: 'i-digital', status: 'planned', group: 'digital',
    enquiry: 'digital',
    image: 'desk-contact', backdrop: 'desk-contact', moment: 'sourcing-detail', closing: 'desk-contact',
    card: 'A planned service for businesses that want to be found online: websites, a consistent brand and social media growth.',
    tags: ['Websites', 'Brand identity', 'Social media'],
    hero: { title: 'Be easy to find, online.', lede: 'Spear Line is planning digital services for businesses: a clear website, a consistent brand and help with social media. Tell us what you need.' },
    items: [
      { title: 'Websites and landing pages', text: 'A clear, fast website built around what your customers need to find. Tell us what you want it to do.', image: 'desk-contact' },
      { title: 'Brand identity', text: 'A consistent name, mark and look for print, vehicles, paperwork and social media.', image: 'sourcing-detail' },
      { title: 'Social media growth', text: 'Managing paid advertising and organic growth on the platforms your customers use, starting with Facebook and Instagram.', image: 'dispatch-team' }
    ],
    include: ['What you want to achieve: more enquiries, bookings, sales or awareness', 'Which platforms or website pages matter to you', 'When you would like to begin'],
    briefTitle: 'Start with what you want to achieve.',
    brief: 'Share your goal, the platforms or pages that matter, and when you would like to begin. A written scope is agreed before any work starts.',
    cta: 'Register interest',
    boundary: 'Results depend on your offer, your audience and your budget, so no outcome is promised. Advertising budgets are separate from service fees and are paid to the advertising platform.'
  }
];

// The Spear Line Timber section, shown on the home page, the Logistics page and the Timber page.
export const timber = {
  kicker: 'Spear Line Timber',
  title: 'Timber, moved with care.',
  fullTitle: 'From the yard to the destination.',
  text: 'Haulage and transport coordination for timber consignments. Routes, timing and arrangements are discussed for each one.',
  stops: [
    { icon: 'i-search', title: 'Check the load', text: 'The cargo, the grades and the quantities are set out before anything is loaded.', image: 'sourcing-detail' },
    { icon: 'i-supplies', title: 'Load it right', text: 'How the load is secured and handled is agreed before it moves.', image: 'loading-bay' },
    { icon: 'i-route', title: 'Plan the route', text: 'The route, the timing and any border steps are planned in advance.', image: 'highland-road' },
    { icon: 'i-check', title: 'Hand it over', text: 'Delivery and the documents that apply are handed over and recorded.', image: 'dispatch-team' }
  ],
  noteTitle: 'Describe the consignment',
  ask: ['What is being moved, and the type of timber', 'Estimated volume or weight, and packaging', 'Where it is collected and where it needs to go', 'When it is ready and when it is needed', 'The documents that apply to your consignment'],
  note: 'This service is for moving timber. No timber is listed for sale on this website.'
};

// Hub pages that group the businesses.
export const hubs = {
  businesses: {
    hero: { title: 'Six businesses. One line.', lede: 'Spear Line is building a family of businesses around trade, movement and everyday life. Each one shows its true status.' },
    groups: [
      { id: 'trade', title: 'Trade and supply', text: 'Vehicles, building materials, foodstuffs and beverages.' },
      { id: 'lifestyle', title: 'Lifestyle and property', text: 'Fitness and wellness, real estate, and leisure and hospitality.' },
      { id: 'movement', title: 'Movement', text: 'Logistics and Spear Line Timber carry what the other businesses sell, and what you need moved.' },
      { id: 'digital', title: 'Digital', text: 'Websites, brand and social media for other businesses.' }
    ],
    sharedTitle: 'What every business shares.',
    shared: [
      { icon: 'i-supplies', title: 'Sourcing', text: 'Finding the right supplier or product for your specification.' },
      { icon: 'i-logistics', title: 'Transport', text: 'Moving what you buy, with the route and timing agreed.' },
      { icon: 'i-brief', title: 'Clear paperwork', text: 'Scope, price and arrangements confirmed in writing.' },
      { icon: 'i-chat', title: 'One conversation', text: 'Every business starts from the same simple enquiry.' }
    ]
  },
  trade: {
    id: 'trade-supply', crumb: 'Trade and supply', kicker: 'Trade and supply', image: 'warehouse', members: ['vehicle', 'building', 'supplies'],
    hero: { title: 'Trade and supply.', lede: 'Vehicles, building materials, foodstuffs and beverages: three businesses that start from the same simple question. What do you need?' },
    listTitle: 'Three ways to start.', listText: 'Choose the business that fits what you need.',
    description: 'Vehicles, building materials, foodstuffs and beverages from Spear Line, each shown with its status.'
  },
  lifestyle: {
    id: 'lifestyle-property', crumb: 'Lifestyle and property', kicker: 'Lifestyle and property', image: 'aerial-road', members: ['fitness', 'property', 'hospitality'],
    hero: { title: 'Lifestyle and property.', lede: 'Fitness and wellness, real estate, and leisure and hospitality: three planned businesses. Register your interest in any of them.' },
    listTitle: 'Three planned businesses.', listText: 'Register your interest in the ones that matter to you.',
    description: 'Fitness and wellness, real estate, and leisure and hospitality from Spear Line. All are planned; register interest.'
  }
};

// Digital services page: the three things it covers, shown as cards under the template sections.
export const digitalOffers = {
  title: 'Three ways to help you be found.',
  text: 'Each is quoted for your business and agreed in writing before work starts.',
  cards: [
    { icon: 'i-digital', title: 'Website', text: 'Pages that explain what you do and make it easy to get in touch.', points: ['A clear structure for your services', 'Fast on phones', 'An enquiry route that reaches you'] },
    { icon: 'i-mark', title: 'Brand', text: 'One consistent look across everything your customers see.', points: ['Name and mark in the right formats', 'Colours and type chosen with you', 'Ready for print, vehicles and social media'] },
    { icon: 'i-chat', title: 'Social media', text: 'Help with the platforms where your customers already are.', points: ['Paid advertising set up and managed', 'Organic growth through steady posting', 'Reporting you can follow'] }
  ]
};

// ---------------------------------------------------------------------------------------------
// The founder. Only facts the owner has confirmed are written here.
// `message` and `bio` stay empty until the founder supplies them in his own words; the page shows a
// plain empty state until then. Set `approvedOn` (for example '12 November 2026') once he has approved
// the page and the use of his likeness in the generated images; structured data is added only then.
//
// Images: put the masters in source-images/founders/ and run  python3 scripts/images.py
// Each stem below is the file name without .png. Anything missing is simply left out of the page.
// All of these are AI-generated illustrations and are captioned as such wherever they appear.
// ---------------------------------------------------------------------------------------------
export const founders = [
  {
    id: 'joe-ayom', name: 'Joe Ayom', role: 'Founder of Spear Line',
    hero: ['joe-ayom-founder-cutout', 'joe-ayom-founder-hero', '10-joe-ayom-founder-environmental-hero'],
    portrait: ['joe-ayom-founder-portrait', '01-joe-ayom-founder-warm-front-portrait'],
    message: [],
    bio: [],
    approvedOn: '',
    scenes: [
      { stem: '02-joe-ayom-vehicle-detail-inspection', title: 'Looking closely at a vehicle', area: 'Vehicles', href: 'vehicles.html' },
      { stem: '03-joe-ayom-client-vehicle-handover', title: 'Handing over the keys', area: 'Vehicles', href: 'vehicles.html' },
      { stem: '05-joe-ayom-food-supply-conversation', title: 'A supply conversation', area: 'Supplies', href: 'supplies.html' },
      { stem: '06-joe-ayom-beverage-dispatch-walkthrough', title: 'Walking through a dispatch', area: 'Supplies', href: 'supplies.html' },
      { stem: '04-joe-ayom-shipment-paperwork', title: 'Checking shipment paperwork', area: 'Logistics', href: 'logistics.html' },
      { stem: '09-joe-ayom-logistics-delivery-coordination', title: 'Coordinating a delivery', area: 'Logistics', href: 'logistics.html' },
      { stem: '07-joe-ayom-timber-quality-review', title: 'Reviewing timber quality', area: 'Timber', href: 'timber.html' },
      { stem: '08-joe-ayom-client-meeting-natural-smile', title: 'Listening to a client', area: 'Enquiries', href: 'enquire.html' }
    ]
  }
];

export const foundersPage = {
  hero: { title: 'Meet the founder.', lede: 'Spear Line was founded by Joe Ayom.' },
  messageTitle: 'In his own words.',
  emptyTitle: 'A message from the founder will appear here.',
  emptyText: 'It will be written by Joe and published once he has approved it.',
  scenesTitle: 'How the work looks.',
  scenesText: 'Illustrations of the kind of conversation each business starts with. They are AI-generated pictures, not records of real events.',
  principlesTitle: 'What guides the work.',
  businessesTitle: 'The businesses behind the line.',
  caption: 'AI-generated illustration'
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
