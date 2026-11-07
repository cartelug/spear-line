# Spear Line V12 — Professional Art Direction, Design System & Quality Blueprint

**Status:** direction and delivery contract. This document upgrades the visual-design plan; it does not mean all components, assets, photography, interactions or tests are already built.

**Design outcome:** Spear Line should look like a credible, high-value South Sudan corporate group with disciplined editorial direction, modern regional relevance and real commercial usefulness. The reference sites provide useful patterns—**not** content, source code, protected photos or logos to reproduce.

## 1. Competitive references, interpreted into original design

| Studied reference | Useful principle | Spear Line design translation |
|---|---|---|
| Simba Corporation | Multi-sector corporate confidence and clear portfolio hierarchy | Six-division gallery; visual hierarchy from company → sectors → concrete requirements |
| Madal General Company | Product/service discovery and trade-oriented CTA flow | Strong vehicle, supplies and logistics entry points; enquiry in context; real-status labels |
| AXIS GROUP | Digital-business capabilities and consulting language | Specific Digital Solutions landing page; six delivery categories; written scope proposal CTA |

Avoid generic agency aesthetics: repeated gradient spheres, glowing purple dashboards, stock office teams, rainbow icons, fabricated milestone counters, fake brand partnerships, meaningless scrolling logos and excessive glassmorphism. Reject any effect copied recognisably from one competitor: recreate the underlying usability goal through Spear Line's own spacing, illustration, type, photography and interactions.

## 2. Recommended identity — “Spear Line / The Connected Enterprise”

**Emotional palette:** grounded, capable, purposeful, optimistic. The name suggests connection, direction and progress; use lines and coordinates lightly as a quiet graphic signature, never as a military aesthetic or as a cliché spear everywhere.

**Visual attributes:** cinematic, tactile, editorial, minimal, dimensional, credible, accessible. Think documentary corporate photography meets a considered annual-report grid.

**Creative tension:** heritage-inspired earth/ink foundation + crisp contemporary systems. Keep warmth in photography and accents, but use structural precision in navigation, badges, forms and labels.

**Signature motif:** a single slender “line of direction,” entering sections as a small rule or subtle geometric connection between chapter index and heading. No animated 3D spear rotating around the page.

## 3. Core color system and semantic use

Carry forward V11 base:
- Soil / near-black: #15110C — atmospheric dark sections and strong contrasts.
- Umber: #211A13 — hero frame, editorial transitions and branded imagery.
- Sand: #E9DFCE — warm backgrounds for readable corporate information.
- Bone: #F5F0E7 — copy-rich pages, forms and founder profile.
- Accent gold: #F2B65A — accent rule, main interaction priority and selected focus treatments.

Introduce **only if approved/verified by brand owner**:
- Deep olive concept: #20271F for digital editorial sections and understated alternate dark surfaces.
- Soft khaki border: #C8BEAD for divisions and neutral dividers.
- Warm muted text: #5D564B for secondary information on light surfaces.
- Warm light text: #F7F3EB for body copy on dark surfaces.

**Contrast rules:** meet WCAG AA for meaningful content at all picture overlays; low-contrast super-light grey is not a luxury style. Status chips need a solid/backed surface when imagery is busy. Gold is an accent, not a universal body-text color.

**Semantic mapping:**
- background-dark, background-paper, background-muted;
- text-dark, text-light, text-secondary;
- action-primary, action-on-dark, action-hover, action-focus;
- border-subtle, border-strong, status-neutral;
- media-overlay-dark, media-overlay-light;
- success, warning, error, information where genuine status requires them.

Do not use unique arbitrary service colors on every tile. Sector differentiation comes primarily from photography, composition and content, then a restrained micro-accent if the corporate identity warrants it.

## 4. Typography: a recognisable editorial signature

**Display:** current Brighter Sans Bold where authorised; variable range if a new licensed build genuinely supports it. Large, tight headlines with generous adjacent whitespace. Preserve correct word forms; avoid all-caps long headlines.

**Reading:** current Sky Text where authorised, 16–19 px body on most contexts; line-height ~1.58–1.72 and max prose width 62–70ch. Enterprise credibility depends more on reading ease than aggressive display scale.

**Heading system:**
- H1: expressive and short, 1–3 intentional lines desktop, up to 4–5 on narrow phones if necessary.
- H2: editorial 2–3 lines; one clear idea per section.
- H3: division/capability title; natural wrap, no ellipsis for legal/business name.
- Eyebrow: spaced small-uppercase system only for category metadata, not paragraph copy.
- Numbers: optional large 01–06 indexes in cards and process, but never the only way to understand content.

**Pairing rules:** maximum two font families; 2–3 text weights; unified type ladder and rhythm. Use font-feature-settings only when needed. Recheck bold fallback and international characters in final font licence and asset bundle. Fonts must not be extracted or shared externally.

## 5. Layout grammar and page design tokens

- Master 12-column concept at desktop, 8-column on intermediate, single reading stack on phone; max primary content ~1360 px.
- Horizontal breathing room 20 px minimum on phones, scale to ~96 px gutters at wide desktop.
- Section intro has index/eyebrow, expressive title, concise purpose and optional action.
- Feature block arrangement alternates 7/5, 5/7, 6/6 and full-bleed without random layout changes.
- Image captions are factual and short; avoid aesthetic filler.
- Use fine separators (1 px) rather than multiple thick gold borders. One pronounced band every ~2–3 sections is enough.
- Card hierarchy: image → context/status → title → two-line useful service promise → action.
- Never use more than two primary buttons of equal visual strength in one section.

**Layout primitives to implement:** SiteShell, PageHero, SectionIntro, SplitEditorial, SectorCard, CapabilityRow, FounderPortrait, QuoteBand, ProcessStep, CTAStack, TrustPanel, ContactPath, ServiceIndex and GrandFooter. Each needs dark/light/compact variants instead of separate one-off markup.

## 6. Homepage creative direction — detailed compositions

**01. Hero / “One company. More ways forward.”**
- Photo: believable vehicle/trade/road image that communicates regional enterprise; purposeful left/right negative space, strong color grade and readable foreground.
- Desktop: wide cinematic crop, headline left, visible service enquiry on right; two clear actions; navigation transparent only if contrast is strong.
- Mobile: separate portrait crop with face/vehicle safe zone; narrative first; waybill after hero if it competes with headline.
- Motion: one controlled typographic sequence and subtle image settle. Hero must feel like a business, not a cinematic trailer blocking navigation.

**02. “Business is bigger than one industry.”**
- A near-monumental typographic spread on bone with small chapter index at left.
- One concise paragraph explains actual vehicle/trade/logistics starting points and aspirational portfolio; add two restrained text links.
- A single line motif connects heading and the next section; avoid illustrations with no purpose.

**03. Six divisions / the flagship component**
- First tile 2× width on desktop; other five are individual portraits, using distinct but coherent cropping.
- Use high-quality real pictures where available; if generated, explicitly illustrative. No claim of real property, workshop, warehouse, dealership, staff or venue.
- Each card shows number, category, status (Enquiry-led / Developing / Concept), headline, real description and clear action.
- The hover treatment is refined; the mobile resting state reveals every essential detail.

**04. “Trade made personal.”**
- Three strong commercial pathways: Vehicle requirements / Food and beverage supplies / Cargo and logistics.
- Editorial cards tall enough for imagery but with succinct lead copy. Never turn cards into catalogue “buy now” flows without verified stock.
- Offer specification checklists and direct enquiries. Real product evidence must take priority over concept photography as soon as supplied.

**05. Digital Solutions**
- Deep-olive controlled color shift for one page chapter; conceptual graphic of modern workflow/design tools, not invented clients/results.
- Six capabilities presented as practical business outcomes, not generic “innovation/solutions” buzzwords.
- THE 97 World association plainly marked *proposed* until approved in writing.
- CTA asks what the client wants built; online form remains draft-only until receiving backend exists.

**06. Joh Ayom / founders**
- Monogram-only visual until approved authentic portrait arrives, styled as an elegant editorial identity composition.
- On asset approval: real photographed portrait with clean 4:5 crop, balanced side typography and a short true founder statement.
- Optional timeline only with verified dates; no fabricated résumé, charitable actions, foreign office visits or partners.
- Use stable structure for additional verified leadership, no ghost “team of experts” carousel.

**07. Working principles**
- Four numbered stages: brief, practical conversation, important details, written confirmation.
- Clean ledger-like lines and editorial index, no gratuitous icons.
- Follow with proof, work process or real case studies only when actual evidence arrives.

**08. Bar teaser and future opportunities**
- Clearly tagged “Coming soon.” Warm lounge concept illustration only, not a fake opening announcement.
- Minimal copy, one link to status page; no booking CTA.

**09. Closing CTA and grand footer**
- Strong closing thought, visible quote link and accurate contact status.
- Footer architecture links to six divisions and current trading services, founder, legal, contact, Bar status and privacy.
- Oversized wordmark serves as signature but does not create mobile overflow.

## 7. Detailed individual page art direction

**Divisions:** powerful portfolio introduction; six photo-led cards; below, a simple plain-language explanation of how sourcing/logistics connects services. A category's maturity status should be close to its name. No fake subsidiary logos.

**Digital:** sharp and systematic, less atmospheric. Spacious alternating editorial rows or capability grid with 01–06 numbering, service outcomes, examples of possible project types and proposal process. No false logos from other customers or guaranteed platform verification.

**Founder:** high trust, intimate, restrained. Full real photo, name, approved bio, origin story and factual milestones. On mobile give the portrait full attention. Short, personal words matter more than animated counters. Require signed consent.

**About:** corporate purpose, six-division map, working principles, real-world operations only as verified. No unsubstantiated “Africa's largest” claims.

**Vehicles:** practical and visually rich, with meaningful type/price-spec enquiries; verified images and inventory, or a respectful empty state if none.

**Supplies:** clean product categories, quantity, packaging and destination—commercially direct, not a fake ecommerce shop.

**Logistics:** documentary freight imagery, clear pickup/load/destination route. Animated route illustration cannot imply real network coverage not substantiated.

**How It Works:** straightforward 4-step visual timeline with image support. Motion must never prevent a user from reading every step.

**Enquire and Contact:** highest usability priority. Clear labels, generous whitespace, accurate draft state, no fake WhatsApp/email placeholders or unverified contact details.

**FAQ/Privacy:** sober readable content, sticky index on desktop only if it does not obscure important legal/accessible information. Search and accordions remain keyboard-first.

**Bar:** atmospheric but truthful development teaser; no venue address, menu, rates or opening date without source.

## 8. Component-level quality contract

| Component | Visual standard | Functional requirement |
|---|---|---|
| Header | precise logo/letter spacing, clean transparent-to-solid transition | visible focus, menu and native navigation |
| Hero | strongest photo, decisive H1, obvious CTA, enough negative space | LCP reserved, no action hidden |
| Sector card | distinct photo, disciplined overlay, clear status and destination | card keyboardable, no fake operational claim |
| Digital capability | concise outcome and supporting examples | readable content with or without motion |
| Founder visual | real permission-approved photo or honest monogram | descriptive alt; no synthetic identity |
| Editorial split | purposeful 7/5 or 6/6 balance | correct mobile source order |
| Form | quiet input outlines and well-spaced fields | validation, semantics, truthful submission state |
| Action | strong one-click target with subtle motion | min target, robust focus, proper disabled state |
| Footer | clear hierarchy and signature wordmark | every page reachable; no overflow |
| Error/empty state | legible, reassuring, clean | gives real recovery next step |

## 9. Photography and image-generation production workflow

Follow existing **V12-IMAGE-PRODUCTION.md** 26-asset inventory and add these gates:
1. Audit actual Drive/photo asset, verified owner, usage rights, dimensions, orientation, resolution, location and whether it documents a real Spear Line operation.
2. Build contact sheet with identifiers, intended page, desktop/mobile crop previews and focal-point safe zones.
3. Grade real images consistently (warm neutral highlights, grounded dark shadows, accurate skin and vehicle color), without creating false evidence.
4. Produce concept imagery only for unsupported illustrative gaps; label accurately and separate it from verified inventory/office/people photos.
5. Design two responsive crops for every flagship full-bleed visual and one alternate for sections with text overlays.
6. Export AVIF/WebP derivatives in existing scripts/images.py pipeline; include sizes/srcset/width/height and visual fallback.
7. Re-test readability and image credibility in low brightness, high contrast and 320 px width.
8. Approve each founder/leadership image and biography with the subject before publishing.
9. Do not extract/redistribute web-competitor images or licensed font files.
10. Keep a content register: asset ID → source → licence → approved use → page/section → alt text → focal point → approval status.

## 10. Motion and responsiveness combined

Professional design must remain coherent through *state transitions*. Test four visual states of every component: desktop resting, fine-pointer hovered/focused, phone resting, reduced-motion and high-zoom. If a card becomes unintelligible when hover is disabled, its core design is wrong.

Motion specification: see **V12-MOTION-SYSTEM.md** for timing and behavior. Responsive specification: see **V12-RESPONSIVE-ARCHITECTURE.md** for exact reflow and device acceptance. This file controls the visual language, not animation logic or breakpoint implementation.

## 11. Design deliverables and review gates

### Phase A — brand and composition sign-off
- 1 desktop homepage visual direction and 1 mobile composition at 390 px.
- A compact type/color/spacing system with real text rather than placeholder lorem ipsum.
- Clear reference translation: explain what is similar in *usability* and what is original in *expression*.
- Founder/photo/partner approval status marked.

### Phase B — key page design
- Full homepage and divisional landing compositions at 1440, 1024, 768, 390 and 320.
- Digital page and Founder page with accurate content fallbacks and all key states.
- Existing Vehicles/Supplies/Logistics/Enquiry/Contact pages restyled coherently.
- Components documented with padding, max-width, image crop, type scale, accessible state and CTA behavior.

### Phase C — production build
- Implement in source files, not generated public pages.
- Create real image derivatives and crop contracts.
- Align animation state across HTML/CSS/JS without duplicating observer work.
- Preserve legal copy, verified business facts, six division statuses and noindex/draft-enquiry release switches.

### Phase D — quality assurance
- Visual comparisons at 320, 390, 768, 1024, 1440 and 1920 CSS px; responsive edge cases up to 2560.
- Accessibility: axe + keyboard + screen reader, text resize, contrast and reduced motion.
- Technical: npm build/check/unit/Playwright; no JS errors, broken links or missing assets.
- Performance: measured mobile Lighthouse >=90 target, LCP <=2.5 s, INP <=200 ms, CLS <=.1 where measured; record test conditions.
- Trust: authentic staff and product images, correct founder name **Joh Ayom**, no invented claims/partners/venues, live inquiry verified before promising it works.

### Phase E — launch approval
- Confirm domain ownership and real addresses/contact paths.
- Owner approves all public biographies, logos, service states, digital delivery role and commercial scope.
- Replace all approved temporary visuals; verify form delivery, privacy, analytics and indexing switch.
- Deploy to production only after review; do not merge a design-spec update on its own as a launch.

## 12. Prioritized finishing backlog

**P0 blockers:** founder approval and photo; live domain/contact facts; actual business status of six divisions; digital relationship; navigation accessibility and form truth; mobile overflow/focus; imagery and font rights.

**P1 signature design:** photograph-driven hero, superior six-card art direction, clear trade pathways, rich but restrained digital chapter, authentic founder composition, footer.

**P2 refinement:** distinctive line motif, optional page-level SVG/crop transitions, icon details, hovers, perfect small-screen typographic breaks, SEO/social share visuals when domain approved.

**P3 optional extras:** portfolio case studies, real inventory/search, verified partner logos, interactive regional route map only with published operating coverage, motion-driven editorial storytelling after performance passes.

**Final quality bar:** Spear Line looks considered, regional, ownable and credible; every section leads to a meaningful action; the smallest phone is no less capable than desktop; and the visual presentation never outruns the facts.
