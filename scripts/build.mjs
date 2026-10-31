import { readFile, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { env } from 'node:process';
import * as content from '../content/site.mjs';
import { parseCss, criticalCss } from './css-rules.mjs';

// Builds every page in public/ from content/site.mjs. Run: npm run build
const { brand, images, services, home, process: steps, about, faq, onlineAnswer, bar, contactPage, inventory, stats, testimonials, partners, team, statuses, divisions, timber, hubs, digitalOffers, founders, foundersPage } = content;

// Release switches. Without SITE_ORIGIN and SITE_LAUNCH=1 the site stays hidden from search engines.
// The release version is a hash of everything shipped under a ?v= address, so caches can never mix releases
// and a release with unchanged assets keeps its cached copies.
const SHIPPED = ['public/site.css', 'public/app.js', 'public/motion.js', 'public/validation.js', 'public/assets/fonts/mtn-brighter-sans-bold.woff2', 'public/assets/fonts/sky-text-regular.woff2', 'public/assets/icons.svg', 'public/assets/logo.svg', 'src/sw.js'];
const VERSION = createHash('sha256').update((await Promise.all(SHIPPED.map(file => readFile(new URL('../' + file, import.meta.url))))).map(data => data.toString('latin1').replace(/\?v=[\w.]+/g, '')).join('\0')).digest('hex').slice(0, 10);
const ORIGIN = (env.SITE_ORIGIN || '').replace(/\/+$/, '');
const LAUNCH = env.SITE_LAUNCH === '1' && /^https:\/\//.test(ORIGIN);

// Critical path: the boot script and each page's first-screen rules (src/styles/critical.json, from npm run critical)
// are inlined; the full stylesheet (bundled first by scripts/bundle-css.mjs) then loads without blocking the first paint.
const BOOT = (await readFile(new URL('../src/boot.js', import.meta.url), 'utf8')).split('\n').filter(line => !/^\s*\/\//.test(line)).map(line => line.trim()).join('\n');
const CSS_TREE = parseCss((await readFile(new URL('../public/site.css', import.meta.url), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, ''));
const CRITICAL = JSON.parse(await readFile(new URL('../src/styles/critical.json', import.meta.url), 'utf8').catch(() => '{}'));
// Pointing at an internal link prerenders that page, so the click lands on a page that is already drawn.
// Chromium skips this under Save-Data and low battery; app.js prefetches on hover in other browsers.
const SPECULATION = JSON.stringify({ prerender: [{ source: 'document', where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[download], [rel~="nofollow"]' } }] }, eagerness: 'moderate' }] });
function styles(file) {
  const keys = CRITICAL[file];
  if (!keys) return '<link rel="stylesheet" href="site.css">';
  return `<style>${criticalCss(CSS_TREE, keys)}</style><link rel="stylesheet" href="site.css" media="print" data-defer><noscript><link rel="stylesheet" href="site.css"></noscript>`;
}

const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const svc = Object.fromEntries(services.map(s => [s.id, s]));
// Every business with a page of its own: the three live services plus the new divisions, all rendered by one template.
const ALL = [...services, ...divisions];
const byId = Object.fromEntries(ALL.map(s => [s.id, s]));
// Status rules: every business has a known status, and Active needs evidence on record.
for (const s of ALL) {
  if (!statuses[s.status]) throw new Error(s.id + ' needs a status: ' + Object.keys(statuses).join(', '));
  if (s.status === 'active' && !String(s.evidence || '').trim()) throw new Error(s.id + ' is marked active but has no evidence note.');
}
// Founder images are optional until the masters are added (see CONTENT.md). scripts/images.py writes this manifest.
const FOUNDER_IMAGES = JSON.parse(await readFile(new URL('../content/founder-images.json', import.meta.url), 'utf8').catch(() => '{}'));
const haveFounder = stem => Boolean(FOUNDER_IMAGES[stem]);
const firstFounder = stems => (stems || []).find(haveFounder);
// Pages that stay out of search results and the sitemap even in launch mode (planned businesses and unapproved pages).
const UNLISTED = new Set();

/* ---------- Primitives ---------- */
const ICON_BOX = { 'i-spear': 64 };
const icon = (id, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 ${ICON_BOX[id] || 48} ${ICON_BOX[id] || 48}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${id}"/></svg>`;
// Every photograph is served as AVIF with a WebP fallback at four widths; see scripts/images.py.
const WIDTHS = [480, 768, 1080, 1536];
const set = (file, ext, widths = WIDTHS, top = 1536) => widths.map(w => `assets/visuals/${file}${w === top && ext === 'webp' ? '' : '-' + w}.${ext} ${w}w`).join(', ');
function img(key, { sizes = '(min-width: 1100px) 50vw, 100vw', eager = false, cls = '', alt } = {}) {
  const image = images[key];
  if (!image) throw new Error('Unknown image key: ' + key);
  const [w, h] = image.ratio;
  return `<picture><source type="image/avif" srcset="${set(image.file, 'avif')}" sizes="${sizes}"><img${cls ? ` class="${cls}"` : ''} src="assets/visuals/${image.file}-768.webp" srcset="${set(image.file, 'webp')}" sizes="${sizes}" alt="${esc(alt ?? image.alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"'}></picture>`;
}
// The first eager picture on a page is its largest paint; preload its AVIF candidates so the request starts with the HTML.
function lcpPreload(html) {
  const picture = html.match(/<picture>(?:(?!<\/picture>).)*?fetchpriority="high"(?:(?!<\/picture>).)*?<\/picture>/)?.[0];
  if (!picture) return '';
  const phoneOnly = picture.includes('media="(max-width: 599px)"');
  return [...picture.matchAll(/<source type="image\/avif"([^>]*)>/g)].map(([, attrs]) => {
    const media = attrs.match(/media="([^"]+)"/)?.[1] ?? (phoneOnly ? '(min-width: 600px)' : undefined), srcset = attrs.match(/srcset="([^"]+)"/)[1], sizes = attrs.match(/sizes="([^"]+)"/)[1];
    return `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset}" imagesizes="${sizes}"${media ? ` media="${media}"` : ''} fetchpriority="high">`;
  }).join('');
}
const backdrop = key => key ? `<div class="backdrop backdrop-${images[key].file}" aria-hidden="true"></div>` : '';
function btn(label, href, { variant = 'primary', iconId = 'i-arrow', cls = '' } = {}) {
  return `<a class="btn btn-${variant}${cls ? ' ' + cls : ''}" href="${href}"><span class="btn-label">${esc(label)}</span><span class="btn-icon" aria-hidden="true">${icon(iconId)}</span></a>`;
}
const link = (label, href, cls = '') => `<a class="link${cls ? ' ' + cls : ''}" href="${href}"><span>${esc(label)}</span>${icon('i-arrow', 'link-icon')}</a>`;
const kicker = (text, iconId = 'i-spear') => `<p class="kicker">${icon(iconId)}<span>${esc(text)}</span></p>`;
const lines = list => list.map(line => `<span class="line">${esc(line)}</span>`).join('');
// First-screen headings are split into words at build time, so their entrance runs in CSS from the first paint
// without waiting for any script. Each word reserves its final width (data-w) so the animation never shifts layout.
const words = text => String(text).split(/\s+/).filter(Boolean).map(word => `<span class="w" data-w="${esc(word)}"><span class="wi">${esc(word)}</span></span>`).join(' ');
const head = (title, text = '', cls = '') => `<div class="section-head${cls ? ' ' + cls : ''}" data-reveal><h2 data-split>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}</div>`;

/* ---------- Sections with blended edges ---------- */
// Each page is a list of sections with a tone. Neighbouring tones are blended at the seam.
function sections(list, footerTone = 'soil') {
  return list.map((section, i) => {
    const prev = list[i - 1]?.tone, next = list[i + 1]?.tone ?? footerTone;
    const classes = ['section', 'tone-' + section.tone, prev && prev !== section.tone ? 'from-' + prev : '', next !== section.tone ? 'to-' + next : '', section.cls || ''].filter(Boolean).join(' ');
    return `<section class="${classes}"${section.id ? ` id="${section.id}"` : ''}${section.label ? ` aria-labelledby="${section.label}"` : ''}>${backdrop(section.backdrop)}${section.topo ? `<div class="topo" aria-hidden="true">${img('topo-route', { sizes: '100vw', alt: '' })}</div>` : ''}${section.glow ? '<div class="glow" aria-hidden="true"><span></span><span></span></div>' : ''}${section.inner}</section>`;
  }).join('\n');
}

/* ---------- Shared chrome ---------- */
const NAV = [['businesses', 'businesses.html', 'Businesses'], ['logistics', 'logistics.html', 'Logistics'], ['timber', 'timber.html', 'Timber'], ['process', 'how-it-works.html', 'How it works'], ['founders', 'founders.html', 'Founders'], ['about', 'about.html', 'About']];
const logo = (cls = 'brand-logo') => `<svg class="${cls}" viewBox="0 0 950 604" aria-hidden="true" focusable="false"><use href="assets/logo.svg#logo"/></svg>`;

function preloader() {
  const top = ['s', 'p', 'e1', 'a', 'r', 'r-eye'], bottom = ['l', 'i-dot', 'i', 'n', 'e2'];
  return `<div class="preloader" aria-hidden="true"><div class="pl-door pl-door-left"></div><div class="pl-door pl-door-right"></div><div class="pl-stage"><svg class="pl-logo" viewBox="0 0 950 604" focusable="false">${top.map(g => `<use class="pl-g pl-top" href="assets/logo.svg#g-${g}"/>`).join('')}${bottom.map(g => `<use class="pl-g pl-bottom" href="assets/logo.svg#g-${g}"/>`).join('')}</svg><div class="pl-line"><span class="pl-track"></span><span class="pl-fill"></span><span class="pl-spear">${icon('i-spear')}</span></div><p class="pl-caption"><span>Vehicles</span><span>Supplies</span><span>Logistics</span></p></div></div>`;
}
function header(page) {
  const navLinks = NAV.map(([id, href, label]) => `<li><a href="${href}"${page === id ? ' aria-current="page"' : ''}><span class="nl" data-text="${label}">${label}</span>${id === 'bar' ? '<span class="soon">Soon</span>' : ''}</a></li>`).join('');
  return `<a class="skip" href="#main">Skip to content</a><div class="progress" aria-hidden="true"><span></span></div><header class="site-header"><div class="wrap header-inner"><a class="brand" href="index.html" aria-label="Spear Line home">${logo()}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu"><span class="menu-label">Menu</span><span class="menu-bars" aria-hidden="true"><i></i><i></i></span></button><nav class="site-nav" id="site-menu" aria-label="Main navigation"><ul class="nav-list">${navLinks}</ul><div class="nav-extra">${btn('Start an enquiry', 'enquire.html', { cls: 'nav-cta' })}<p class="nav-note">${esc(brand.tagline)}</p></div></nav></div></header>`;
}
const BUSINESS_PAGES = new Set([...ALL.map(s => s.id).filter(id => id !== 'timber'), 'trade-supply', 'lifestyle-property', 'bar']);
function dock(page) {
  const items = [['home', 'index.html', 'Home', 'i-home'], ['businesses', 'businesses.html', 'Businesses', 'i-grid'], ['timber', 'timber.html', 'Timber', 'i-timber'], ['enquire', 'enquire.html', 'Enquire', 'i-brief']];
  return `<nav class="dock" aria-label="Quick navigation">${items.map(([id, href, label, iconId]) => `<a href="${href}"${(page === id || (id === 'businesses' && BUSINESS_PAGES.has(page))) ? ' aria-current="page"' : ''}${id === 'enquire' ? ' class="dock-cta"' : ''}>${icon(iconId)}<span>${label}</span></a>`).join('')}</nav>`;
}
function footer(lastTone, cta) {
  return `<footer class="site-footer tone-soil${lastTone && lastTone !== 'soil' ? ' from-' + lastTone : ''}"><div class="wrap">${cta ? `<div class="footer-cta" data-reveal><h2 data-split>${esc(home.closing.title)}</h2>${btn('Start an enquiry', 'enquire.html')}</div>` : ''}<div class="footer-grid"><div class="footer-brand"><a class="brand" href="index.html" aria-label="Spear Line home">${logo('footer-logo')}</a><p>${esc(brand.summary)}</p><p class="footer-tagline">${esc(brand.tagline)}</p></div><div><h2>Businesses</h2><ul>${ALL.map(s => `<li><a href="${s.slug}.html">${esc(s.label)}</a></li>`).join('')}<li><a href="bar.html">Spear Line Bar <span class="soon">Soon</span></a></li></ul></div><div><h2>Company</h2><ul><li><a href="about.html">About</a></li><li><a href="founders.html">Founders</a></li><li><a href="businesses.html">Our businesses</a></li><li><a href="how-it-works.html">How it works</a></li><li><a href="faq.html">Questions answered</a></li><li><a href="contact.html">Contact</a></li></ul></div><div><h2>Get in touch</h2><ul><li><a href="enquire.html">Start an enquiry</a></li><li hidden data-contact-email></li><li hidden data-contact-phone></li><li hidden data-contact-whatsapp></li></ul></div></div><div class="footer-bottom"><span>© <span data-year>2026</span> ${esc(brand.name)}</span><span>${esc(brand.imageNote)}</span><button type="button" class="motion-toggle" hidden data-motion-toggle aria-pressed="false">Reduce motion</button><a href="privacy.html">Privacy &amp; enquiries</a><a class="to-top" href="#top">Back to top${icon('i-arrow', 'up')}</a></div><div class="footer-credits"><div>Fonts made from <a href="https://www.onlinewebfonts.com">Web Fonts</a> is licensed by CC BY 4.0</div><div>Icons made from <a href="https://www.onlinewebfonts.com/icon">svg icons</a> is licensed by CC BY 4.0</div></div></div><div class="footer-wordmark" aria-hidden="true">${logo('wordmark')}</div></footer>`;
}

/* ---------- Document ---------- */
const FILES = { businesses: 'businesses.html', 'trade-supply': 'trade-supply.html', 'lifestyle-property': 'lifestyle-property.html', founders: 'founders.html', home: 'index.html', bar: 'bar.html', about: 'about.html', enquire: 'enquire.html', privacy: 'privacy.html', '404': '404.html', vehicle: 'vehicles.html', supplies: 'supplies.html', logistics: 'logistics.html', process: 'how-it-works.html', faq: 'faq.html', contact: 'contact.html' };
for (const s of ALL) FILES[s.id] = s.slug + '.html';
function headTags(page, title, description, ld, preload, unlisted) {
  const file = FILES[page] || 'index.html', url = ORIGIN + '/' + (file === 'index.html' ? '' : file);
  const social = LAUNCH ? `<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:image" content="${ORIGIN}/assets/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(images['hero-road'].alt)}, with the words Your next move. Our line of work.">` : '';
  const graph = LAUNCH ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', name: brand.name, url: ORIGIN + '/', logo: ORIGIN + '/assets/icon-512.png', slogan: brand.tagline }, ...(ld || [])] }).replace(/</g, '\\u003c')}</script>` : '';
  return `<meta name="description" content="${esc(description)}"><meta name="theme-color" content="#15110C"><meta property="og:type" content="website"><meta property="og:site_name" content="${esc(brand.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta name="twitter:card" content="summary_large_image">${social}<meta name="robots" content="${LAUNCH && page !== '404' && !unlisted ? 'index,follow' : 'noindex,nofollow'}"><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="icon" href="assets/favicon-32.png" sizes="32x32" type="image/png"><link rel="alternate icon" href="favicon.ico" sizes="48x48"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png"><link rel="manifest" href="site.webmanifest"><link rel="preload" href="assets/fonts/mtn-brighter-sans-bold.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="assets/fonts/sky-text-regular.woff2" as="font" type="font/woff2" crossorigin>${preload || ''}${styles(file)}<script>${BOOT}</script><script type="speculationrules">${SPECULATION}</script><script src="site-config.js" defer></script><script type="module" src="app.js"></script>${graph}`;
}
function layout(page, title, description, list, { ld, preload, footerTone, footerCta = false, unlisted = false } = {}) {
  if (unlisted) UNLISTED.add(FILES[page]);
  const tones = list.map(s => s.tone), main = sections(list, footerTone || 'soil');
  preload = lcpPreload(main) + (preload || '');
  return `<!doctype html>
<html lang="en" id="top"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(title)} | ${esc(brand.name)}</title>${headTags(page, title, description, ld, preload, unlisted)}</head>
<body class="page-${page}">${preloader()}${header(page)}<main id="main">${main}</main>${footer(tones.at(-1), footerCta)}${dock(page)}<p class="net-status" role="status" aria-live="polite" hidden></p><div class="cursor" aria-hidden="true"><span></span></div></body></html>\n`;
}

/* ---------- Components ---------- */
function waybill(id = 'waybill') {
  return `<form class="waybill glass" action="enquire.html" method="get" aria-labelledby="${id}-title"><div class="waybill-head"><h2 id="${id}-title">Start an enquiry</h2><span class="waybill-kind">Takes a minute</span></div><fieldset class="waybill-row"><legend>I need</legend><div class="waybill-choices">${services.map((s, i) => `<label><input type="radio" name="service" value="${s.id}"${i === 0 ? ' checked' : ''}><span>${icon(s.icon)}${esc(s.name)}</span></label>`).join('')}</div></fieldset><div class="waybill-row"><label for="${id}-to">Going to</label><input id="${id}-to" name="destination" type="text" maxlength="120" autocomplete="address-level2" placeholder="Town or city"></div><button class="btn btn-primary" type="submit"><span class="btn-label">Continue</span><span class="btn-icon" aria-hidden="true">${icon('i-arrow')}</span></button><span class="waybill-stamp" aria-hidden="true">Next move</span></form>`;
}
function pageHero({ image, mobile, crumb, kickerText, kickerIcon, title, lede, after = '', actions = '', cls = '' }) {
  return `<div class="hero-media" aria-hidden="true"><div class="pan pan-b" data-parallax="0.12">${img(image, { eager: true, sizes: '100vw', alt: '' })}</div></div><div class="hero-veil" aria-hidden="true"></div><div class="wrap page-hero-inner${cls ? ' ' + cls : ''}"><nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon('i-chevron')}<span aria-current="page">${esc(crumb)}</span></nav>${kicker(kickerText, kickerIcon)}<h1 class="page-title title-intro">${words(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}${after}${actions ? `<div class="actions">${actions}</div>` : ''}</div><div class="hero-scroll" aria-hidden="true"><span></span></div>`;
}
const marquee = (items, reverse = false, cls = '') => `<div class="marquee${reverse ? ' marquee-reverse' : ''}${cls ? ' ' + cls : ''}" data-marquee><div class="marquee-track">${[0, 1].map(copy => `<ul${copy ? ' aria-hidden="true"' : ''}>${items.map(item => `<li>${esc(item)}${icon('i-spear')}</li>`).join('')}</ul>`).join('')}</div></div>`;
function serviceCard(s, cls = '', sizes = '(min-width: 1100px) 30vw, (min-width: 600px) 50vw, 100vw') {
  return `<a class="card card-service${cls ? ' ' + cls : ''}" href="${s.slug}.html" data-tilt data-reveal="up"><div class="card-media">${img(s.image, { sizes, alt: '' })}</div><div class="card-shade" aria-hidden="true"></div>${s.status ? statusChip(s) : ''}<div class="card-body"><span class="card-icon">${icon(s.icon)}</span><p class="card-label">${esc(s.label)}</p><h3>${esc(s.name)}</h3><p class="card-text">${esc(s.card)}</p><ul class="chips">${s.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul><span class="card-go"><span>Explore ${esc(s.name.toLowerCase())}</span>${icon('i-arrow')}</span></div></a>`;
}
const statsBlock = () => stats.length ? `<ul class="stats" data-reveal="up">${stats.map(s => `<li class="stat glass"><span class="stat-value" data-count="${Number(s.value) || 0}">${Number(s.value) || 0}</span>${s.suffix ? `<span class="stat-suffix">${esc(s.suffix)}</span>` : ''}<span class="stat-label">${esc(s.label)}</span></li>`).join('')}</ul>` : '';
const testimonialBlock = () => testimonials.length ? `<div class="quotes" data-reveal="up">${testimonials.map(t => `<figure class="quote glass">${icon('i-quote', 'quote-mark')}<blockquote><p>${esc(t.quote)}</p></blockquote><figcaption><strong>${esc(t.name)}</strong>${t.role ? `<span>${esc(t.role)}</span>` : ''}</figcaption></figure>`).join('')}</div>` : '';
const partnerBlock = () => partners.length ? marquee(partners.map(p => p.name), false, 'marquee-partners') : '';
function routeBlock() {
  const path = 'M40 170 C 210 170, 260 56, 500 60 S 800 170, 960 60';
  return `<div class="route-stage" data-route><svg class="route-svg" viewBox="0 0 1000 220" aria-hidden="true" focusable="false"><path class="route-base" d="${path}"/><path class="route-draw" d="${path}" data-route-path/><g data-route-nodes></g><g class="route-spear" data-route-spear><use href="assets/icons.svg#i-spear" x="-24" y="-24" width="48" height="48"/></g></svg><ol class="route-stops">${services.map(s => `<li class="route-stop" data-route-stop><a class="glass" href="${s.slug}.html"><span class="route-icon">${icon(s.icon)}</span><strong>${esc(s.name)}</strong><span>${esc(s.label)}</span></a></li>`).join('')}</ol></div>`;
}
function processBlock() {
  return `<div class="process" data-process><div class="process-media" aria-hidden="true">${steps.map((s, i) => `<div class="process-frame${i === 0 ? ' is-active' : ''}" data-process-frame><div class="pan pan-a">${img(s.image, { sizes: '(min-width: 1100px) 80vw, 100vw', alt: '' })}</div></div>`).join('')}<div class="process-count"><span data-process-count>01</span> / ${String(steps.length).padStart(2, '0')}</div></div><ol class="process-steps">${steps.map((s, i) => `<li class="process-step timeline-step${i === 0 ? ' is-on' : ''}" data-process-step data-timeline-step><span class="step-num">${String(i + 1).padStart(2, '0')}</span><span class="step-icon">${icon(s.icon)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol></div>`;
}
function barCard() {
  return `<div class="bar-card" aria-hidden="true"><div class="bar-card-top">${logo('bar-card-logo')}<span>The next chapter</span></div><div class="bar-card-title"><span>Spear Line</span><strong>Bar</strong></div><svg class="bar-glass" viewBox="0 0 100 130" focusable="false"><defs><clipPath id="bar-glass-clip"><path d="M15 26h70l-7.5 90q-.6 7-7.5 7H30q-6.9 0-7.5-7z"/></clipPath><linearGradient id="bar-liquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD08A" stop-opacity=".85"/><stop offset="1" stop-color="#C07A1E" stop-opacity=".95"/></linearGradient></defs><g clip-path="url(#bar-glass-clip)"><g class="bar-glass-liquid"><rect x="10" y="58" width="80" height="70" fill="url(#bar-liquid)"/><path d="M10 58q10-5 20 0t20 0 20 0 20 0" fill="none" stroke="#FFE3B5" stroke-opacity=".75" stroke-width="1.6"/></g><g class="bar-glass-ice" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"><rect x="30" y="68" width="22" height="22" rx="4" transform="rotate(-9 41 79)"/><rect x="54" y="82" width="20" height="20" rx="4" transform="rotate(12 64 92)"/></g></g><path d="M15 26h70l-7.5 90q-.6 7-7.5 7H30q-6.9 0-7.5-7z" fill="rgba(255,255,255,.05)" stroke="#F2B65A" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 36l4.5 70" stroke="#fff" stroke-opacity=".3" stroke-width="2" stroke-linecap="round"/><g class="bar-glass-pick"><path d="M70 10 52 100" stroke="#F2B65A" stroke-width="2.8" stroke-linecap="round"/><path d="M74 0 78 17 65 15z" fill="#F2B65A"/></g></svg><div class="bar-card-bottom"><span>${esc(brand.tagline)}</span><span>Coming soon</span></div></div>`;
}
const coming = text => `<p class="coming"><span class="pulse" aria-hidden="true"></span>${esc(text)}</p>`;
function closing(image = 'aerial-road') {
  const mega = `<div class="mega" aria-hidden="true"><span>${esc(brand.tagline)}</span><span>${esc(brand.tagline)}</span></div>`;
  return { tone: 'umber', cls: 'closing', inner: `${mega}<div class="closing-media" aria-hidden="true"><div class="pan pan-a" data-parallax="0.1">${img(image, { sizes: '100vw', alt: '' })}</div></div><div class="closing-veil" aria-hidden="true"></div><div class="wrap closing-inner" data-reveal="up">${kicker('Your next move starts here')}<h2 class="display" data-split>${esc(home.closing.title)}</h2><p class="lede">${esc(home.closing.text)}</p><div class="actions">${btn('Start an enquiry', 'enquire.html')}${btn('How it works', 'how-it-works.html', { variant: 'glass', iconId: 'i-route' })}</div></div>` };
}

/* ---------- Businesses, status, timber and founders ---------- */
const statusChip = (s, cls = '') => `<span class="status status-${s.status}${cls ? ' ' + cls : ''}"><span class="status-dot" aria-hidden="true"></span>${esc(statuses[s.status].label)}</span>`;
const enquiryHref = s => `enquire.html?service=${s.enquiry || s.id}${s.enquiryType ? '&type=' + encodeURIComponent(s.enquiryType) : ''}`;
function bizCard(s) {
  return `<a class="card card-biz glass" href="${s.slug}.html" data-reveal="up"><span class="card-icon">${icon(s.icon)}</span>${statusChip(s)}<h3>${esc(s.name)}</h3><p>${esc(s.card)}</p><span class="card-go"><span>${s.status === 'planned' ? 'See what is planned' : 'Explore'}</span>${icon('i-arrow')}</span></a>`;
}
const bizGrid = list => `<div class="biz-grid">${list.map(bizCard).join('')}</div>`;
const legend = () => { const used = [...new Set(ALL.map(s => s.status))]; return `<ul class="legend" data-reveal="up">${used.map(k => `<li>${statusChip({ status: k })}<span>${esc(statuses[k].note)}</span></li>`).join('')}</ul>`; };

// Growth rings of a log, drawn once as a quiet texture behind the Timber section.
function ringsSvg() {
  const rings = Array.from({ length: 16 }, (_, i) => { const n = i + 1; return `<ellipse cx="${(300 + Math.sin(n * 1.7) * 5).toFixed(1)}" cy="${(300 + Math.cos(n * 2.3) * 5).toFixed(1)}" rx="${(24 + n * 16.5 + Math.sin(n * 0.9) * 3).toFixed(1)}" ry="${(21 + n * 15.2 + Math.cos(n * 1.3) * 3).toFixed(1)}"/>`; }).join('');
  return `<svg class="timber-rings" viewBox="0 0 600 600" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.3">${rings}</g><path d="M300 300 574 244" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;
}
function timberSection({ full = false } = {}) {
  const t = timber, id = 'timber-line', s = byId.timber;
  const stops = `<ol class="consign">${t.stops.map((stop, i) => `<li class="consign-stop card glass" data-reveal="up"><div class="consign-media" aria-hidden="true">${img(stop.image, { sizes: '(min-width: 1100px) 24vw, (min-width: 600px) 45vw, 90vw', alt: '' })}<span class="consign-num">${String(i + 1).padStart(2, '0')}</span></div><div class="consign-body"><span class="card-icon">${icon(stop.icon)}</span><h3>${esc(stop.title)}</h3><p>${esc(stop.text)}</p></div></li>`).join('')}</ol>`;
  const note = `<form class="waybill glass cargo-note" action="enquire.html" method="get" aria-labelledby="${id}-note-title" data-reveal="up"><input type="hidden" name="service" value="logistics"><input type="hidden" name="type" value="Timber"><div class="waybill-head"><h3 id="${id}-note-title">${esc(t.noteTitle)}</h3><span class="waybill-kind">Takes a minute</span></div><div class="waybill-row"><label for="${id}-to">Going to</label><input id="${id}-to" name="destination" type="text" maxlength="120" autocomplete="address-level2" placeholder="Town or city"></div><button class="btn btn-primary" type="submit"><span class="btn-label">Start a timber enquiry</span><span class="btn-icon" aria-hidden="true">${icon('i-arrow')}</span></button><span class="waybill-stamp" aria-hidden="true">Timber</span></form>`;
  return { tone: 'olive', id, cls: 'timber-section', label: id + '-title', glow: true, inner: `${ringsSvg()}<div class="wrap timber-grid"><div class="timber-copy" data-reveal="up">${kicker(t.kicker, 'i-timber')}<h2 id="${id}-title" data-split>${esc(full ? t.fullTitle : t.title)}</h2><p class="lede">${esc(t.text)}</p>${statusChip(s)}<p class="timber-ask-title">What to include</p><ul class="check-list">${t.ask.map(item => `<li>${icon('i-check')}<span>${esc(item)}</span></li>`).join('')}</ul><p class="fine">${esc(t.note)}</p>${full ? '' : link('About Spear Line Timber', 'timber.html')}</div>${note}</div><div class="wrap">${stops}</div>` };
}

// Founder pictures are generated illustrations, so each one carries a visible caption.
function founderPicture(stem, { alt, sizes = '(min-width: 1100px) 40vw, 100vw', eager = false, cls = '' }) {
  const m = FOUNDER_IMAGES[stem], file = 'f-' + stem;
  const set = ext => m.widths.map(w => `assets/visuals/${file}-${w}.${ext} ${w}w`).join(', ');
  const mid = m.widths.includes(768) ? 768 : m.widths.at(-1);
  return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img${cls ? ` class="${cls}"` : ''} src="assets/visuals/${file}-${mid}.webp" srcset="${set('webp')}" sizes="${sizes}" alt="${esc(alt)}" width="${m.w}" height="${m.h}" ${eager ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"'}></picture>`;
}
function founderPortrait(f, { eager = false, stems = [...(f.hero || []), ...(f.portrait || [])], sizes } = {}) {
  const stem = firstFounder(stems);
  if (!stem) return `<div class="portrait portrait-empty glass" role="img" aria-label="Portrait of ${esc(f.name)} to come">${icon('i-spear')}<span>Portrait to come</span></div>`;
  return `<figure class="portrait illus${stem.includes('cutout') ? ' is-cutout' : ''}">${founderPicture(stem, { alt: `AI-generated illustration of ${f.name}, ${f.role}`, eager, sizes })}<figcaption>${esc(foundersPage.caption)}</figcaption></figure>`;
}

/* ---------- Home ---------- */
function heroPicture() {
  // Phones get a portrait photograph; the img and its landscape sources serve everything wider.
  const portrait = ext => [480, 768, 1024].map(w => `assets/visuals/13-mobile-hero-${w}.${ext} ${w}w`).join(', ');
  const phone = `<source type="image/avif" media="(max-width: 599px)" srcset="${portrait('avif')}" sizes="100vw" width="1024" height="1536"><source type="image/webp" media="(max-width: 599px)" srcset="${portrait('webp')}" sizes="100vw" width="1024" height="1536">`;
  return img('hero-road', { eager: true, sizes: '100vw', alt: images['hero-road'].alt }).replace('<picture>', '<picture>' + phone);
}
const homePage = [
  { tone: 'umber', cls: 'hero', label: 'hero-title', inner: `<div class="hero-media"><div class="pan pan-a" data-parallax="0.15">${heroPicture()}</div></div><div class="hero-veil" aria-hidden="true"></div><div class="wrap hero-grid"><div class="hero-copy">${kicker(home.hero.kicker)}<h1 id="hero-title" class="display hero-title title-intro">${home.hero.title.map(line => `<span class="line">${words(line)}</span>`).join('')}</h1><p class="lede">${esc(home.hero.lede)}</p><div class="actions">${btn(home.hero.primary, 'enquire.html')}${btn(home.hero.secondary, '#services', { variant: 'glass', iconId: 'i-grid' })}</div></div>${waybill()}</div><div class="wrap hero-foot"><a class="scroll-cue" href="#intro"><span class="scroll-line" aria-hidden="true"></span><span>Scroll to explore</span></a><ul class="hero-services">${[...services, byId.timber].map(s => `<li><a href="${s.slug}.html">${icon(s.icon)}${esc(s.short || s.name)}</a></li>`).join('')}</ul></div>` },
  { tone: 'bone', id: 'intro', cls: 'intro', inner: `${marquee(home.marquee, false, 'marquee-tape')}<div class="wrap intro-grid"><div class="intro-media" aria-hidden="true"><div class="float float-a" data-parallax="-0.08">${img('beverages', { sizes: '22vw', alt: '' })}</div><div class="float float-b" data-parallax="0.1">${img('vehicles-pickup', { sizes: '22vw', alt: '' })}</div></div><div class="intro-copy"><h2 class="statement" data-read>${lines(home.intro.statement)}</h2><div class="intro-detail" data-reveal="up"><p>${esc(home.intro.text)}</p>${link('Get to know us', 'about.html')}</div></div></div>${statsBlock() ? `<div class="wrap">${statsBlock()}</div>` : ''}` },
  { tone: 'earth', id: 'services', cls: 'services', label: 'services-title', backdrop: 'warehouse', glow: true, inner: `<div class="wrap"><div class="section-head split-head" data-reveal><h2 id="services-title" data-split>${esc(home.servicesTitle)}</h2><p>${esc(home.servicesText)}</p></div><div class="bento">${serviceCard(svc.vehicle, 'bento-tall', '(min-width: 1100px) 50vw, (min-width: 600px) 60vw, 100vw')}${serviceCard(svc.supplies)}${serviceCard(svc.logistics)}<div class="card card-cta glass" data-reveal="up"><span class="card-icon">${icon('i-chat')}</span><h3>Not sure where to start?</h3><p>One enquiry can cover a vehicle, a supply order and the transport between them.</p>${btn('Start an enquiry', 'enquire.html')}</div><a class="card card-link glass" href="how-it-works.html" data-reveal="up"><span class="card-icon">${icon('i-route')}</span><h3>How it works</h3><p>Four steps from your first message to a confirmed next move.</p><span class="card-go"><span>See the steps</span>${icon('i-arrow')}</span></a></div></div>` },
  timberSection(),
  { tone: 'dusk', cls: 'route', label: 'route-title', topo: true, glow: true, inner: `<div class="wrap">${head(home.route.title, home.route.text).replace('<h2 data-split>', '<h2 id="route-title" data-split>')}${routeBlock()}</div>` },
  { tone: 'sand', cls: 'approach', inner: `<div class="wrap approach-grid"><div class="approach-media" data-reveal="clip"><div class="approach-main pan pan-b">${img('loading-bay', { sizes: '(min-width: 1100px) 90vw, 100vw', alt: images['loading-bay'].alt })}</div><div class="approach-inset glass" data-parallax="-0.12">${img('dispatch-team', { sizes: '(min-width: 1100px) 20vw, 50vw', alt: images['dispatch-team'].alt })}</div></div><div class="approach-copy"><h2 data-split>${esc(home.approach.title)}</h2><p class="lede" data-reveal="up">${esc(home.approach.lede)}</p>${home.approach.text.map(t => `<p data-reveal="up">${esc(t)}</p>`).join('')}<ul class="pillars" data-stagger>${home.pillars.map(p => `<li class="pillar card glass" data-tilt>${icon(p.icon, 'pillar-icon')}<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('')}</ul></div></div>` },
  { tone: 'bone', cls: 'businesses-section', label: 'businesses-title', inner: `<div class="wrap">${head('Six businesses. One line.', 'More than vehicles, timber and supplies. Each business shows its true status.').replace('<h2 data-split>', '<h2 id="businesses-title" data-split>')}${bizGrid(['vehicle', 'building', 'supplies', 'fitness', 'property', 'hospitality'].map(id => byId[id]))}<div class="actions section-actions" data-reveal="up">${btn('See every business', 'businesses.html', { variant: 'glass', iconId: 'i-grid' })}${link('Meet the founder', 'founders.html')}</div></div>` },
  { tone: 'bone', cls: 'gallery-section', label: 'gallery-title', inner: `<div class="wrap gallery-head" data-reveal><h2 id="gallery-title" data-split>A closer look.</h2><div class="rail-controls"><button type="button" class="round" data-rail-prev aria-label="Previous images">${icon('i-chevron', 'flip')}</button><button type="button" class="round" data-rail-next aria-label="Next images">${icon('i-chevron')}</button></div></div><div class="rail" id="image-rail" tabindex="0" aria-label="Service imagery gallery. Scroll horizontally to explore.">${home.gallery.map(g => `<a class="rail-item" href="${g.href}"><div class="rail-media">${img(g.image, { sizes: '(min-width: 1100px) 34vw, 80vw' })}</div><p class="rail-label">${esc(g.label)}</p><h3>${esc(g.title)}</h3></a>`).join('')}</div><div class="wrap rail-foot"><span class="rail-status" data-rail-status aria-live="polite">01 / ${String(home.gallery.length).padStart(2, '0')}</span><span class="rail-progress" aria-hidden="true"><span data-rail-progress></span></span><span class="rail-hint">Drag or swipe</span></div>${testimonialBlock() ? `<div class="wrap">${testimonialBlock()}</div>` : ''}${partnerBlock()}` },
  { tone: 'olive', cls: 'process-section', label: 'process-title', backdrop: 'sourcing-detail', inner: `<div class="wrap">${head('Big plans. Simple beginnings.', 'An enquiry is the start of a conversation, not a booking or a purchase.').replace('<h2 data-split>', '<h2 id="process-title" data-split>')}${processBlock()}</div>` },
  { tone: 'soil', id: 'bar', cls: 'bar-teaser', label: 'bar-heading', backdrop: 'bar-lounge', glow: true, inner: `<div class="wrap bar-teaser-grid"><div class="bar-copy" data-reveal="up">${coming('Coming soon')}<h2 id="bar-heading" data-split>A new chapter. Pull up a seat.</h2><p>Something new is taking shape. Discover the next chapter of Spear Line.</p>${link('Discover the Bar', 'bar.html')}</div><div class="bar-stage" data-reveal="scale">${barCard()}</div></div>` },
  closing()
];

/* ---------- Service and business pages ---------- */
function servicePage(s) {
  const planned = s.status === 'planned', isTimber = s.id === 'timber';
  const others = (ALL.filter(o => o.id !== s.id && o.group === s.group).concat(ALL.filter(o => o.id !== s.id && o.group !== s.group))).slice(0, 2);
  const listings = s.id === 'vehicle' && inventory.length ? `<div class="listings" data-stagger>${inventory.map(v => `<article class="card listing glass" data-tilt><div class="listing-media">${img(v.image || 'vehicles-suv', { sizes: '(min-width: 1100px) 30vw, 100vw', alt: v.title })}</div><div class="listing-body">${v.status ? `<span class="listing-status">${esc(v.status)}</span>` : ''}<h3>${esc(v.title)}</h3><p class="listing-meta">${[v.year, ...(v.details || [])].filter(Boolean).map(esc).join(', ')}</p>${v.price ? `<p class="listing-price">${esc(v.price)}</p>` : ''}${link('Ask about this vehicle', 'enquire.html?service=vehicle&type=' + encodeURIComponent(v.title))}</div></article>`).join('')}</div>` : '';
  const features = { tone: 'bone', cls: 'features', inner: `<div class="wrap">${s.items.map((item, i) => `<article class="feature${i % 2 ? ' feature-flip' : ''}"><div class="feature-media" data-reveal="clip"><div class="pan ${i % 2 ? 'pan-b' : 'pan-a'}" data-parallax="0.08">${img(item.image, { sizes: '(min-width: 1100px) 50vw, 100vw', alt: item.alt })}</div></div><div class="feature-copy" data-reveal="up"><span class="feature-index">${icon(s.icon)}</span><h2 data-split>${esc(item.title)}</h2><p>${esc(item.text)}</p>${link(item.linkText || (planned ? 'Register interest' : 'Discuss your requirement'), item.href || (enquiryHref(s) + (item.type && !s.enquiryType ? '&type=' + encodeURIComponent(item.type) : '')))}</div></article>`).join('')}</div>` };
  const list = [
    { tone: 'umber', cls: 'page-hero', inner: pageHero({ image: s.image, crumb: s.name, kickerText: s.label, kickerIcon: s.icon, title: s.hero.title, lede: s.hero.lede, after: `<p class="status-line">${statusChip(s)}<span>${esc(statuses[s.status].note)}</span></p>`, actions: btn(s.cta, enquiryHref(s)) + btn('How it works', 'how-it-works.html', { variant: 'glass', iconId: 'i-route' }) }) },
    ...(isTimber ? [timberSection({ full: true })] : []),
    features,
    ...(s.id === 'logistics' ? [timberSection()] : []),
    ...(s.id === 'vehicle' ? [{ tone: 'sand', cls: 'listings-section', label: 'listings-title', inner: `<div class="wrap">${inventory.length ? head('Available vehicles', 'Ask about any listing and we will confirm the details for your enquiry.').replace('<h2 data-split>', '<h2 id="listings-title" data-split>') + listings : `<div class="empty-card glass" data-reveal="up"><span class="card-icon">${icon('i-vehicle')}</span><div><h2 id="listings-title">Looking for something specific?</h2><p>Vehicle listings will appear here once they are published. Until then, tell us the model, budget and destination and start the conversation.</p></div>${btn(s.cta, 'enquire.html?service=vehicle')}</div>`}</div>` }] : []),
    ...(s.id === 'digital' ? [{ tone: 'sand', cls: 'offers-section', label: 'offers-title', inner: `<div class="wrap">${head(digitalOffers.title, digitalOffers.text).replace('<h2 data-split>', '<h2 id="offers-title" data-split>')}<div class="bring-grid" data-stagger>${digitalOffers.cards.map(c => `<article class="card bring-card glass" data-tilt><span class="card-icon">${icon(c.icon)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><ul class="check-list">${c.points.map(item => `<li>${icon('i-check')}<span>${esc(item)}</span></li>`).join('')}</ul></article>`).join('')}</div></div>` }] : []),
    { tone: 'earth', cls: 'brief-section', label: 'brief-title', backdrop: s.backdrop, glow: true, inner: `<div class="wrap brief-grid"><div class="brief-card glass" data-reveal="up" data-tilt><h2 id="brief-title" data-split>${esc(s.briefTitle)}</h2><p>${esc(s.brief)}</p><ul class="check-list">${s.include.map(item => `<li>${icon('i-check')}<span>${esc(item)}</span></li>`).join('')}</ul>${btn(s.cta, enquiryHref(s))}${s.boundary ? `<p class="fine">${esc(s.boundary)}</p>` : ''}</div><div class="brief-note" data-reveal="up"><div class="brief-photo pan pan-b">${img(s.moment, { sizes: '(min-width: 1100px) 40vw, 100vw' })}</div><p class="note-big">${planned ? esc(statuses.planned.note) : 'Availability, specifications, price and arrangements are confirmed for your individual enquiry.'}</p>${link('Read the questions people ask', 'faq.html')}</div></div>` },
    { tone: 'sand', cls: 'cross', label: 'cross-title', inner: `<div class="wrap">${head('One line, many businesses.', 'Many requirements touch more than one. Start with any of them.').replace('<h2 data-split>', '<h2 id="cross-title" data-split>')}<div class="cross-grid">${others.map(o => serviceCard(o, '', '(min-width: 1100px) 50vw, 100vw')).join('')}</div></div>` },
    closing(s.closing)
  ];
  return layout(s.id, s.label, s.card, list, { unlisted: planned });
}

/* ---------- Hub pages ---------- */
const sharedBlock = () => ({ tone: 'earth', cls: 'principles-section', label: 'shared-title', backdrop: 'dispatch-team', glow: true, inner: `<div class="wrap">${head(hubs.businesses.sharedTitle).replace('<h2 data-split>', '<h2 id="shared-title" data-split>')}<ul class="principles principles-four" data-stagger>${hubs.businesses.shared.map(p => `<li class="card principle glass" data-tilt><span class="card-icon">${icon(p.icon)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('')}</ul></div>` });
const businessesPage = [
  { tone: 'umber', cls: 'page-hero', inner: pageHero({ image: 'hero-road', crumb: 'Our businesses', kickerText: 'The whole line', kickerIcon: 'i-grid', title: hubs.businesses.hero.title, lede: hubs.businesses.hero.lede, actions: btn('Start an enquiry', 'enquire.html') + btn('How it works', 'how-it-works.html', { variant: 'glass', iconId: 'i-route' }) }) },
  { tone: 'bone', cls: 'hub-section', inner: `<div class="wrap">${legend()}${hubs.businesses.groups.map(g => `<div class="biz-group"><div class="biz-group-head" data-reveal="up"><h2>${esc(g.title)}</h2><p>${esc(g.text)}</p></div>${bizGrid(ALL.filter(s => s.group === g.id))}</div>`).join('')}</div>` },
  sharedBlock(),
  closing()
];
function hubPage(h) {
  return [
    { tone: 'umber', cls: 'page-hero', inner: pageHero({ image: h.image, crumb: h.crumb, kickerText: h.kicker, kickerIcon: 'i-grid', title: h.hero.title, lede: h.hero.lede, actions: btn('Start an enquiry', 'enquire.html') + btn('All businesses', 'businesses.html', { variant: 'glass', iconId: 'i-grid' }) }) },
    { tone: 'bone', cls: 'hub-section', inner: `<div class="wrap">${head(h.listTitle, h.listText)}${legend()}${bizGrid(h.members.map(id => byId[id]))}</div>` },
    closing()
  ];
}

/* ---------- How it works ---------- */
const bring = services.map(s => ({ s, list: s.include }));
const processPage = [
  { tone: 'umber', cls: 'page-hero', inner: pageHero({ image: 'sourcing-detail', crumb: 'How it works', kickerText: 'A clear way forward', kickerIcon: 'i-route', title: 'From a brief to your next move.', lede: 'Four steps, what to bring for each service, and what an enquiry is and is not.', actions: btn('Start an enquiry', 'enquire.html') }) },
  { tone: 'bone', cls: 'timeline-section', label: 'steps-title', inner: `<div class="wrap">${head('Simple beginnings. Clear next steps.', 'An enquiry is the start of a conversation, not a booking or a purchase.').replace('<h2 data-split>', '<h2 id="steps-title" data-split>')}<ol class="timeline" data-timeline><span class="timeline-line" aria-hidden="true"><span data-timeline-fill></span></span>${steps.map((s, i) => `<li class="timeline-step" data-timeline-step><span class="timeline-node" aria-hidden="true">${icon(s.icon)}</span><div class="timeline-card glass"><span class="step-num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join('')}</ol></div>` },
  { tone: 'olive', cls: 'bring-section', label: 'bring-title', backdrop: 'warehouse', glow: true, inner: `<div class="wrap">${head('What to bring.', 'The more precise the brief, the better the first conversation. You can always add details later.').replace('<h2 data-split>', '<h2 id="bring-title" data-split>')}<div class="bring-grid" data-stagger>${bring.map(({ s, list }) => `<article class="card bring-card glass" data-tilt><span class="card-icon">${icon(s.icon)}</span><p class="card-label">${esc(s.name)}</p><h3>${esc(s.label)}</h3><ul class="check-list">${list.map(item => `<li>${icon('i-check')}<span>${esc(item)}</span></li>`).join('')}</ul>${link(s.cta, 'enquire.html?service=' + s.id)}</article>`).join('')}</div><p class="fine" data-reveal>Always include your name and a phone number or email address. Please leave out identity documents, card details and bank details.</p></div>` },
  closing()
];

/* ---------- FAQ ---------- */
const answer = a => a === null ? `<span data-faq-closed>${esc(onlineAnswer.closed)}</span><span data-faq-open hidden>${esc(onlineAnswer.open)}</span>` : esc(a);
const faqPage = [
  { tone: 'umber', cls: 'page-hero', inner: pageHero({ image: 'warehouse', crumb: 'Questions', kickerText: 'Good to know', kickerIcon: 'i-chat', title: 'Questions, answered plainly.', lede: 'Enquiries, privacy, imagery and how Spear Line works.' }) },
  { tone: 'bone', cls: 'faq-section', inner: `<div class="wrap faq-layout"><aside class="faq-side" aria-label="Find a question"><div class="faq-search"><label for="faq-filter">Search questions</label><div class="search-field">${icon('i-search')}<input id="faq-filter" type="search" placeholder="Type a word, like price" autocomplete="off" data-faq-filter></div><p class="faq-empty" data-faq-empty hidden>No questions match that word. Try another, or start an enquiry.</p></div><nav class="faq-index" aria-label="Question topics" data-faq-index><ul>${faq.map((g, i) => `<li><a href="#faq-${i}">${esc(g.group)}</a></li>`).join('')}</ul></nav></aside><div class="faq-groups">${faq.map((g, i) => `<section class="faq-group" id="faq-${i}" aria-labelledby="faq-${i}-title"><h2 id="faq-${i}-title" data-reveal>${esc(g.group)}</h2><div class="faq-list" data-accordion>${g.items.map((item, j) => `<details${i === 0 && j === 0 ? ' open' : ''}><summary><span>${esc(item.q)}</span><span class="plus" aria-hidden="true"></span></summary><div class="answer"><p>${answer(item.a)}</p></div></details>`).join('')}</div></section>`).join('')}</div></div>` },
  closing()
];
const faqLd = faq.flatMap(g => g.items).filter(i => i.a !== null).map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } }));

/* ---------- Contact ---------- */
const channels = [['i-mail', 'Email', 'data-contact-email'], ['i-phone', 'Phone', 'data-contact-phone'], ['i-whatsapp', 'WhatsApp', 'data-contact-whatsapp'], ['i-pin', 'Address', 'data-address']];
const contactPageList = [
  { tone: 'umber', cls: 'page-hero', inner: pageHero({ image: 'desk-contact', crumb: 'Contact', kickerText: 'Let’s talk', kickerIcon: 'i-chat', title: contactPage.hero.title, lede: contactPage.hero.lede }) },
  { tone: 'bone', cls: 'contact-section', inner: `<div class="wrap contact-grid"><div class="contact-copy" data-reveal="up"><h2 data-split>Send the details that matter.</h2><p class="lede">${esc(contactPage.hero.lede)}</p><p data-legal-identity></p><ul class="contact-cards">${channels.map(([iconId, label, attr]) => `<li class="card contact-card glass" data-contact-card hidden><span class="card-icon">${icon(iconId)}</span><div><h3>${label}</h3><p ${attr} hidden></p></div></li>`).join('')}</ul><div class="empty-card glass" data-contact-empty><span class="card-icon">${icon('i-chat')}</span><div><h3>${esc(contactPage.emptyTitle)}</h3><p>${esc(contactPage.emptyText)}</p></div></div></div><div class="contact-form" data-reveal="up">${waybill('contact-note')}</div></div>` },
  { tone: 'sand', cls: 'next-section', label: 'next-title', inner: `<div class="wrap">${head(contactPage.nextTitle).replace('<h2 data-split>', '<h2 id="next-title" data-split>')}<ol class="principles next-steps" data-stagger>${contactPage.next.map((n, i) => `<li class="card principle glass"><span class="card-icon">${icon(n.icon)}</span><span class="step-num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></li>`).join('')}</ol><div class="actions section-actions" data-reveal="up">${link('Questions first? Read the questions people ask', 'faq.html')}</div></div>` },
  closing('loading-bay')
];

/* ---------- About ---------- */
const aboutPage = [
  { tone: 'umber', cls: 'page-hero', inner: pageHero({ image: 'team-yard', crumb: 'About', kickerText: 'This is Spear Line', kickerIcon: 'i-spear', title: about.hero.title, lede: about.hero.lede }) },
  { tone: 'bone', cls: 'about-who', inner: `<div class="wrap split"><h2 data-split>${esc(about.who.title)}</h2><div data-reveal="up">${about.who.text.map(t => `<p class="lede-sm">${esc(t)}</p>`).join('')}</div></div>${statsBlock() ? `<div class="wrap">${statsBlock()}</div>` : ''}` },
  { tone: 'bone', cls: 'founder-strip-section', inner: `<div class="wrap">${founders.map(f => `<a class="founder-strip card glass" href="founders.html" data-reveal="up"><div class="founder-strip-media">${founderPortrait(f, { stems: [...(f.portrait || []), ...(f.hero || [])], sizes: '(min-width: 900px) 20vw, 40vw' })}</div><div class="founder-strip-copy"><p class="card-label">The founder</p><h2>${esc(f.name)}</h2><p>${esc(f.role)}. Meet the person behind the line.</p><span class="card-go"><span>Meet the founder</span>${icon('i-arrow')}</span></div></a>`).join('')}</div>` },
  { tone: 'bone', cls: 'band', inner: `<div class="wrap"><div class="band-media" data-reveal="clip"><div class="pan pan-a" data-parallax="0.1">${img('warehouse', { sizes: '100vw' })}</div></div></div>` },
  { tone: 'earth', cls: 'principles-section', label: 'principles-title', backdrop: 'dispatch-team', glow: true, inner: `<div class="wrap">${head('Clarity at every step.').replace('<h2 data-split>', '<h2 id="principles-title" data-split>')}<ul class="principles" data-stagger>${about.principles.map(p => `<li class="card principle glass" data-tilt><span class="card-icon">${icon(p.icon)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('')}</ul></div>` },
  ...(team.length ? [{ tone: 'sand', cls: 'team-section', label: 'team-title', inner: `<div class="wrap">${head('The people behind the line.').replace('<h2 data-split>', '<h2 id="team-title" data-split>')}<ul class="team" data-stagger>${team.map(m => `<li class="card member glass"><div class="member-media">${img(m.image || 'dispatch-team', { sizes: '25vw', alt: m.name })}</div><h3>${esc(m.name)}</h3><p>${esc(m.role)}</p></li>`).join('')}</ul></div>` }] : []),
  closing('highland-road')
];

/* ---------- Founders ---------- */
const founder = founders[0];
const founderScenes = founder.scenes.filter(sc => haveFounder(sc.stem));
const foundersPageList = [
  { tone: 'umber', cls: 'founder-hero', glow: true, inner: `<div class="wrap founder-hero-inner"><div class="founder-copy"><nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon('i-chevron')}<span aria-current="page">Founders</span></nav>${kicker('The founder', 'i-spear')}<h1 class="page-title title-intro">${words(foundersPage.hero.title)}</h1><p class="lede">${esc(foundersPage.hero.lede)}</p><p class="founder-name"><strong>${esc(founder.name)}</strong><span>${esc(founder.role)}</span></p><div class="actions">${btn('Start an enquiry', 'enquire.html')}${btn('Our businesses', 'businesses.html', { variant: 'glass', iconId: 'i-grid' })}</div></div><div class="founder-portrait-wrap">${founderPortrait(founder, { eager: true, sizes: '(min-width: 900px) 34vw, 90vw' })}</div></div>` },
  { tone: 'bone', cls: 'founder-message', label: 'message-title', inner: `<div class="wrap split"><h2 id="message-title" data-split>${esc(foundersPage.messageTitle)}</h2><div data-reveal="up">${founder.message.length || founder.bio.length ? [...founder.bio, ...founder.message].map(t => `<p class="lede-sm">${esc(t)}</p>`).join('') : `<div class="empty-card glass"><span class="card-icon">${icon('i-quote')}</span><div><h3>${esc(foundersPage.emptyTitle)}</h3><p>${esc(foundersPage.emptyText)}</p></div></div>`}</div></div>` },
  ...(founderScenes.length ? [{ tone: 'earth', cls: 'scenes-section', label: 'scenes-title', backdrop: 'dispatch-team', glow: true, inner: `<div class="wrap">${head(foundersPage.scenesTitle, foundersPage.scenesText).replace('<h2 data-split>', '<h2 id="scenes-title" data-split>')}<ul class="scenes">${founderScenes.map(sc => `<li class="scene card glass" data-reveal="up"><figure class="illus">${founderPicture(sc.stem, { alt: `AI-generated illustration of ${founder.name}: ${sc.title.toLowerCase()}`, sizes: '(min-width: 1100px) 24vw, (min-width: 600px) 45vw, 90vw' })}<figcaption>${esc(foundersPage.caption)}</figcaption></figure><div class="scene-body"><p class="card-label">${esc(sc.area)}</p><h3>${esc(sc.title)}</h3>${link('See ' + sc.area.toLowerCase(), sc.href)}</div></li>`).join('')}</ul></div>` }] : []),
  { tone: 'olive', cls: 'principles-section', label: 'principles-title', backdrop: 'loading-bay', glow: true, inner: `<div class="wrap">${head(foundersPage.principlesTitle).replace('<h2 data-split>', '<h2 id="principles-title" data-split>')}<ul class="principles" data-stagger>${about.principles.map(p => `<li class="card principle glass" data-tilt><span class="card-icon">${icon(p.icon)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('')}</ul></div>` },
  { tone: 'sand', cls: 'businesses-section', label: 'businesses-title', inner: `<div class="wrap">${head(foundersPage.businessesTitle).replace('<h2 data-split>', '<h2 id="businesses-title" data-split>')}${bizGrid(['vehicle', 'timber', 'supplies', 'building', 'property', 'hospitality'].map(id => byId[id]))}</div>` },
  closing('team-yard')
];
const foundersLd = founder.approvedOn ? [{ '@type': 'Person', name: founder.name, jobTitle: 'Founder', worksFor: { '@type': 'Organization', name: brand.name } }] : undefined;

/* ---------- Bar ---------- */
const barPage = [
  { tone: 'soil', cls: 'bar-hero', glow: true, inner: `<div class="hero-media" aria-hidden="true"><div class="pan pan-a" data-parallax="0.1">${img('bar-lounge', { eager: true, sizes: '100vw', alt: '' })}</div></div><div class="hero-veil" aria-hidden="true"></div><div class="bar-lamp" aria-hidden="true"></div><div class="wrap bar-hero-grid"><div class="bar-hero-copy"><nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon('i-chevron')}<span aria-current="page">The Bar</span></nav>${coming('Coming soon')}<h1 class="display title-intro">${words(bar.hero.title)}</h1><p class="bar-tagline">${esc(bar.hero.tagline)}</p><p class="lede">${esc(bar.hero.text)}</p></div><div class="bar-stage">${barCard()}<p class="bar-caption">A glimpse of what’s next.</p></div></div><div class="wrap bar-note glass" data-reveal="up">${icon('i-spear', 'bar-note-mark')}<p>${esc(bar.note)}</p>${link('Explore Spear Line', 'index.html#services')}</div>` },
  { tone: 'dusk', cls: 'bar-share', label: 'bar-share-title', backdrop: 'bar-glass', glow: true, inner: `<div class="wrap">${head('Three things to look out for.', 'Nothing has been decided in public yet. When it has, this page is where it will appear first.').replace('<h2 data-split>', '<h2 id="bar-share-title" data-split>')}<ul class="bar-share-grid" data-stagger>${bar.share.map(s => `<li class="card bar-share-card glass" data-tilt><span class="card-icon">${icon(s.icon)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><span class="bar-share-status">${esc(s.status)}</span></li>`).join('')}</ul></div>` }
];

/* ---------- Enquiry ---------- */
const field = (id, label, placeholder, { optional = false, full = false, max = 200, auto = '' } = {}) => `<div class="field${full ? ' full' : ''}"><label for="${id}">${label}${optional ? ' <span>(optional)</span>' : ''}</label><input id="${id}" name="${id}" ${auto ? 'autocomplete="' + auto + '"' : ''} ${optional ? '' : 'required'} maxlength="${max}" placeholder="${placeholder}" aria-describedby="${id}-error"><span class="field-error" id="${id}-error"></span></div>`;
const INTEREST_FORM = {
  construction: { title: 'What you are looking for', need: ['What you need', 'Materials, tools or equipment, and quantities'], area: ['Delivery or site location', 'City and country', false], when: ['Preferred timing', 'When you would need it'] },
  property: { title: 'The property you have in mind', need: ['What you are looking for', 'Buy, sell, rent, let or manage, and the type of property'], area: ['Area', 'Town or district', false], when: ['Preferred timing', 'When you would like to begin'] },
  fitness: { title: 'What you would look for', need: ['What you would like to do', 'Train, take classes or work with a coach'], area: ['Where', 'Town or city', true] },
  hospitality: { title: 'What you would like to see', need: ['What you would like to see', 'A venue, a stay or a space for events'], area: ['Where', 'Town or city', true], when: ['Preferred timing', 'When you might use it'] },
  digital: { title: 'What you want to achieve', need: ['What you want to achieve', 'A website, a brand or social media, and the goal'], when: ['Preferred timing', 'When you would like to begin'] }
};
const interestSet = (service, cfg) => `<fieldset class="form-block" data-service-fields="${service}" hidden disabled><legend><span class="step-num">03</span>${esc(cfg.title)}</legend><p class="hint interest-note">This business is planned. Registering interest does not request a quote.</p><div class="fields">${field(service + 'Need', cfg.need[0], cfg.need[1], { full: true, max: 400 })}${cfg.area ? field(service + 'Area', cfg.area[0], cfg.area[1], { optional: cfg.area[2], max: 200 }) : ''}${cfg.when ? field(service + 'When', cfg.when[0], cfg.when[1], { optional: true, max: 120 }) : ''}</div></fieldset>`;
const choiceServices = [...services, ...divisions.filter(d => d.enquiry !== 'logistics')];
const enquiryPage = [
  { tone: 'umber', cls: 'enquiry-hero', glow: true, backdrop: 'desk-contact', inner: `<div class="wrap enquiry-hero-inner"><nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon('i-chevron')}<span aria-current="page">Enquire</span></nav><h1 class="page-title title-intro">${words('What’s your next move?')}</h1><p class="lede">Choose a service. Give us the essentials. It takes about two minutes.</p></div>` },
  { tone: 'bone', cls: 'enquiry-section', inner: `<div class="wrap enquiry-grid"><form class="form-card" id="enquiry-form" novalidate><noscript><p>Please enable JavaScript to prepare your enquiry.</p></noscript><fieldset class="form-block service-choice"><legend><span class="step-num">01</span>Choose your service</legend><div class="choice-options">${choiceServices.map((s, i) => `<label><input type="radio" name="service" value="${s.enquiry || s.id}"${i === 0 ? ' checked' : ''}><span class="choice">${img(s.image, { sizes: '(min-width: 1100px) 260px, 50vw', alt: '' })}<span class="choice-body">${icon(s.icon)}<strong>${esc(s.name)}</strong><small>${esc(s.label)}</small></span></span></label>`).join('')}</div></fieldset><p class="form-state" id="form-mode" role="status">Preparing the enquiry form…</p><fieldset class="form-block"><legend><span class="step-num">02</span>Your contact details</legend><div class="fields">${field('name', 'Your name', 'Full name', { max: 100, auto: 'name' })}${field('contact', 'Email or phone', 'Include your country code', { max: 160, auto: 'email' })}</div></fieldset><fieldset class="form-block" data-service-fields="vehicle"><legend><span class="step-num">03</span>Your vehicle requirements</legend><div class="fields">${field('model', 'Vehicle model or type', 'For example, SUV, pickup or a specific model', { full: true, max: 160 })}${field('budget', 'Budget and currency', 'Your preferred range', { optional: true, max: 100 })}${field('location', 'Vehicle destination', 'City and country')}</div></fieldset><fieldset class="form-block" data-service-fields="supplies" hidden disabled><legend><span class="step-num">03</span>Your supply requirements</legend><div class="fields">${field('products', 'Products and specifications', 'Product names, grades or preferred brands', { full: true, max: 500 })}${field('quantity', 'Quantities and packaging', 'For example, cartons, bags or units', { max: 200 })}${field('supplyDestination', 'Delivery destination', 'City and country')}${field('supplyTiming', 'Preferred timing', 'One-off date or recurring schedule', { full: true, max: 120 })}</div></fieldset><fieldset class="form-block" data-service-fields="logistics" hidden disabled><legend><span class="step-num">03</span>Your logistics requirements</legend><div class="fields">${field('pickup', 'Pickup location', 'Town, region and country')}${field('destination', 'Delivery destination', 'City, country and delivery site')}${field('load', 'Cargo and estimated load', 'Cargo type, weight or volume', { max: 120 })}${field('timing', 'Preferred timing', 'Ready date or delivery window', { max: 120 })}</div></fieldset>${Object.entries(INTEREST_FORM).map(([service, cfg]) => interestSet(service, cfg)).join('')}<fieldset class="form-block"><legend><span class="step-num">04</span>Anything else?</legend><div class="field"><label for="notes">Additional details <span>(optional)</span></label><textarea id="notes" name="notes" maxlength="2000" rows="4" placeholder="Anything else we should understand about your requirement?" aria-describedby="notes-hint notes-error"></textarea><span class="hint" id="notes-hint">Please leave out identity documents and payment details.</span><span class="field-error" id="notes-error"></span></div></fieldset><div class="honey" aria-hidden="true"><label for="website">Leave this empty</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div><label class="consent" for="consent"><input id="consent" name="consent" type="checkbox" required aria-describedby="consent-error"><span class="tick" aria-hidden="true">${icon('i-check')}</span><span>I agree that Spear Line may use these details to respond to my enquiry. <a href="privacy.html">Privacy information</a></span></label><div class="field-error" id="consent-error"></div><div class="form-actions"><button class="btn btn-primary" id="submit-enquiry" type="submit" disabled><span class="btn-label" data-submit-label>Prepare enquiry</span><span class="btn-icon" aria-hidden="true">${icon('i-arrow')}</span></button><span class="hint">An enquiry is not a booking or purchase.</span></div><div id="form-message" class="form-message" role="status" aria-live="polite" tabindex="-1"></div></form><div class="enquiry-aside" role="group" aria-label="Before you send"><div class="aside-card glass"><div class="aside-media"><div class="pan pan-a">${img('sourcing-detail', { sizes: '(min-width: 1100px) 30vw, 100vw', alt: '' })}</div></div><h2>A clear brief. A better conversation.</h2><p>Include the destination, the details that matter and the date you have in mind. Availability and arrangements are discussed for each enquiry.</p><div class="aside-note">${icon('i-spear')}<p data-enquiry-step data-live="Send your requirements and keep the reference you receive.">Prepare a downloadable enquiry draft. Online submission is not currently open.</p></div><div class="aside-contacts" data-contact-container hidden><h3>Contact Spear Line</h3><p data-contact-email hidden></p><p data-contact-phone hidden></p><p data-contact-whatsapp hidden></p></div></div></div></div>` }
];

/* ---------- Privacy ---------- */
const privacyItems = [
  ['Preparing an enquiry', '<p data-privacy-status>Online submission is not currently enabled. When you prepare a draft, the details stay in your browser and in the file you choose to download. Preparing a draft does not send it to Spear Line.</p>'],
  ['When online enquiries are enabled', '<p>The form collects your name, contact information, chosen service, requirement details and consent. These details are used to review and respond to your request. Sending an enquiry does not confirm availability, a booking, an order or a purchase.</p>'],
  ['Information to leave out', '<p>Do not include identity documents, card details, bank details or other sensitive information in an enquiry.</p>'],
  ['Storage and retention', '<p data-retention>When online submission is enabled, the operator’s published retention settings apply to submitted enquiries. Drafts you download remain under your control.</p>'],
  ['Your information rights', '<p data-rights-contact>Use the published business contact details to ask about access, correction or deletion of a submitted enquiry. Include the enquiry reference when available.</p><p data-privacy-contact></p><p data-legal-identity></p><p data-address hidden></p>'],
  ['Website features', '<p>This site uses a session-storage flag so its opening animation plays once per browser tab. If you choose Reduce motion, that preference is saved in your browser on this device. It does not set advertising or analytics cookies. Website images are served locally and AI-generated imagery illustrates the service areas.</p>']
];
const privacyPage = [
  { tone: 'umber', cls: 'enquiry-hero', glow: true, backdrop: 'warehouse', inner: `<div class="wrap enquiry-hero-inner"><nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon('i-chevron')}<span aria-current="page">Privacy</span></nav><h1 class="page-title title-intro">${words('Privacy & enquiries.')}</h1><p class="lede">How this website handles the information you provide.</p></div>` },
  { tone: 'bone', cls: 'text-section', inner: `<div class="wrap text-layout"><nav class="toc" aria-label="On this page"><p>On this page</p><ul>${privacyItems.map(([t], i) => `<li><a href="#p-${i}">${t}</a></li>`).join('')}</ul></nav><div class="prose">${privacyItems.map(([t, body], i) => `<section id="p-${i}" aria-labelledby="p-${i}-title"><h2 id="p-${i}-title">${t}</h2>${body}</section>`).join('')}${link('Return to your enquiry', 'enquire.html')}</div></div>` }
];

/* ---------- 404 ---------- */
const notFoundPage = [
  { tone: 'umber', cls: 'lost', inner: `<div class="hero-media" aria-hidden="true"><div class="pan pan-a">${img('topo-route', { eager: true, sizes: '100vw', alt: '' })}</div></div><div class="hero-veil" aria-hidden="true"></div><div class="wrap lost-inner"><div class="lost-route" aria-hidden="true"><svg viewBox="0 0 600 120" focusable="false"><path class="lost-path" d="M10 90 C 120 90, 160 20, 300 30 S 470 100, 590 30"/></svg><span class="lost-spear">${icon('i-spear')}</span></div><h1 class="display title-intro">${words('This page isn’t on the route.')}</h1><p class="lede">The address may have changed. These will get you moving again.</p><div class="actions">${btn('Back to Spear Line', 'index.html')}${btn('Start an enquiry', 'enquire.html', { variant: 'glass', iconId: 'i-brief' })}</div><ul class="lost-links">${services.map(s => `<li><a href="${s.slug}.html">${icon(s.icon)}${esc(s.name)}</a></li>`).join('')}</ul></div>` }
];

/* ---------- Output ---------- */
const output = {
  'index.html': layout('home', 'Vehicles, supplies and logistics', brand.description, homePage),
  'how-it-works.html': layout('process', 'How it works', 'From a brief to your next move: what to bring, what happens next, and what an enquiry is.', processPage),
  'faq.html': layout('faq', 'Questions answered', 'Plain answers about enquiries, privacy, imagery and how Spear Line works.', faqPage, { ld: [{ '@type': 'FAQPage', mainEntity: faqLd }] }),
  'contact.html': layout('contact', 'Contact', 'How to reach Spear Line and the quickest way to start a vehicle, supply or logistics enquiry.', contactPageList),
  'about.html': layout('about', 'About us', 'Get to know Spear Line and our approach to vehicles, business supplies and logistics.', aboutPage),
  'bar.html': layout('bar', 'Spear Line Bar, coming soon', 'Spear Line Bar is coming soon. Discover the next chapter of Spear Line.', barPage, { footerCta: true }),
  'enquire.html': layout('enquire', 'Start an enquiry', 'Prepare your vehicle, supply or logistics enquiry with Spear Line.', enquiryPage),
  'privacy.html': layout('privacy', 'Privacy & enquiries', 'How Spear Line handles website enquiry information.', privacyPage, { footerCta: true }),
  '404.html': layout('404', 'Page not found', 'Find your way back to Spear Line.', notFoundPage)
};
for (const s of ALL) output[s.slug + '.html'] = servicePage(s);
output['businesses.html'] = layout('businesses', 'Our businesses', 'The businesses of Spear Line, from vehicles and timber haulage to property and hospitality, each with its true status.', businessesPage);
output['trade-supply.html'] = layout('trade-supply', hubs.trade.crumb, hubs.trade.description, hubPage(hubs.trade));
output['lifestyle-property.html'] = layout('lifestyle-property', hubs.lifestyle.crumb, hubs.lifestyle.description, hubPage(hubs.lifestyle));
output['founders.html'] = layout('founders', 'Meet the founder', 'Meet Joh Ayom, founder of Spear Line.', foundersPageList, { ld: foundersLd, unlisted: !founder.approvedOn });
// Keep the former public address useful for existing links and bookmarks.
output['timber-logistics.html'] = output['timber.html'];

for (const [name, html] of Object.entries(output)) {
  const versioned = html.replace(/(href|src)="(site\.css|boot\.js|site-config\.js|app\.js)"/g, (m, attr, file) => `${attr}="${file}?v=${VERSION}"`);
  await writeFile(new URL('../public/' + name, import.meta.url), versioned);
}
// Module imports inside app.js carry the same version, so a release never mixes cached and new scripts.
const appUrl = new URL('../public/app.js', import.meta.url);
const appSource = await readFile(appUrl, 'utf8'), stamped = appSource.replace(/\?v=[\w.]+/g, '?v=' + VERSION);
if (stamped !== appSource) await writeFile(appUrl, stamped);
// Service worker: precaches the shell (styles, scripts, fonts, icons and the home page) for this release.
const precache = ['index.html', `site.css?v=${VERSION}`, `app.js?v=${VERSION}`, `motion.js?v=${VERSION}`, `validation.js?v=${VERSION}`, 'assets/fonts/mtn-brighter-sans-bold.woff2', 'assets/fonts/sky-text-regular.woff2', 'assets/icons.svg', 'assets/logo.svg', 'assets/favicon.svg'];
const worker = (await readFile(new URL('../src/sw.js', import.meta.url), 'utf8')).replace('__VERSION__', VERSION).replace('__PRECACHE__', JSON.stringify(precache));
await writeFile(new URL('../public/sw.js', import.meta.url), worker);
const publicPages = Object.keys(output).filter(name => !['404.html', 'timber-logistics.html'].includes(name) && !UNLISTED.has(name)).sort();
if (LAUNCH) {
  await writeFile(new URL('../public/robots.txt', import.meta.url), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  const day = new Date().toISOString().slice(0, 10);
  await writeFile(new URL('../public/sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map(name => `  <url><loc>${ORIGIN}/${name === 'index.html' ? '' : name}</loc><lastmod>${day}</lastmod></url>`).join('\n')}\n</urlset>\n`);
} else {
  await writeFile(new URL('../public/robots.txt', import.meta.url), 'User-agent: *\nDisallow: /\n');
  await rm(new URL('../public/sitemap.xml', import.meta.url), { force: true });
}
console.log('Built ' + Object.keys(output).length + ' pages' + (LAUNCH ? ' for launch at ' + ORIGIN : ' (hidden from search; set SITE_ORIGIN and SITE_LAUNCH=1 to publish)') + '.');
