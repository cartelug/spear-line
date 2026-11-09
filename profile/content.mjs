// Company profile copy. Shared facts (divisions, services, capabilities, sourcing topics, process) come from
// content/site.mjs so the profile and the website never disagree. Profile-only text lives here.
// STATUS: built from the confirmed website copy. The supplied profile PDF has not been received yet; when it
// arrives, reconcile every line below against it and record differences in profile/DISCREPANCIES.md.
export const profile = {
  legalName: 'Spear Line Global Limited',
  founder: 'Joh Ayom',
  // Must match the supplied profile PDF word for word. Currently the website's wording: NOT YET VERIFIED.
  founderQuote: 'Our idea is simple: anyone with a vehicle to find, a load to move or supplies to plan should be able to start with one clear conversation.',
  founderQuoteVerified: false,
  founderMessage: [
    'We listen first, put the details in writing and keep the next step clear.',
    'Spear Line’s six-division direction grows one well-defined service at a time.'
  ],
  phones: [
    { label: 'Uganda enquiries', number: '+256 708 735 878' },
    { label: 'Joh Ayom / South Sudan', number: '+211 920 998 562' }
  ],
  emailNote: 'Business email on spearline.africa is planned and will be published once the mailbox is active.',
  imageNote: 'Images of Joh Ayom are AI-generated from his own photographs. They illustrate the work and are not records of specific places, stock, facilities or projects.'
};
