// Production artwork from approved SVG masters. Requires npm ci and ImageMagick.
// Native paths retain the original hunter, antelope, lettering and circular seal.
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { brand } from '../content/site.mjs';

const root=resolve(import.meta.dirname,'..'), asset=name=>resolve(root,'public/assets',name);
const run=args=>new Promise((done,fail)=>{const child=spawn('magick',args,{stdio:'inherit'});child.on('error',fail);child.on('exit',code=>code===0?done():fail(new Error(`ImageMagick exited ${code}`)));});
for(const color of ['gold','black','white']) {
  for(const type of ['wordmark','seal']) await sharp(asset(`logo-${type}-${color}.svg`)).png().toFile(asset(`logo-${type}-${color}.png`));
  for(const width of [320,640]) await sharp(asset(`logo-wordmark-${color}.svg`)).resize(width).webp({lossless:true}).toFile(asset(`logo-wordmark-${color}-${width}.webp`));
}
const detail=await readFile(resolve(root,'brand/hunter-detail.svg'),'utf8');
const icon=(mode='favicon')=>{
  const width=mode==='maskable'?310:mode==='mobile'?384:440, left=(512-width)/2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" fill="#000000"/>${detail.replace('<svg ',`<svg x="${left}" y="${left}" width="${width}" height="${width}" `)}</svg>\n`;
};
const symbol=icon();
await writeFile(asset('favicon.svg'),symbol);
await writeFile(asset('logo-hunter-white.svg'),detail);
await sharp(Buffer.from(detail)).resize(2048,2048,{fit:'inside'}).png().toFile(asset('logo-hunter-white.png'));
await sharp(Buffer.from(symbol)).resize(1024).png().toFile(asset('favicon-master.png'));
for(const size of [16,32,48,96]) await sharp(Buffer.from(symbol)).resize(size).png().toFile(asset(`favicon-${size}.png`));
for(const [name,size] of [['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]) {
  // Opaque background and extra margins protect the hunter under operating-system masks.
  await sharp(Buffer.from(icon('mobile'))).resize(size).png().toFile(asset(name));
}
await sharp(Buffer.from(icon('maskable'))).png().toFile(asset('icon-maskable-512.png'));
await run([asset('favicon-16.png'),asset('favicon-32.png'),asset('favicon-48.png'),resolve(root,'public/favicon.ico')]);
const iconVersion=createHash('sha256').update(symbol).digest('hex').slice(0,10);
await writeFile(resolve(root,'public/site.webmanifest'),JSON.stringify({id:'./',name:'Spear Line Global Limited',short_name:'Spear Line',description:brand.description,start_url:'./',scope:'./',display:'standalone',background_color:'#000000',theme_color:'#000000',icons:[{src:`assets/icon-192.png?v=${iconVersion}`,sizes:'192x192',type:'image/png',purpose:'any'},{src:`assets/icon-512.png?v=${iconVersion}`,sizes:'512x512',type:'image/png',purpose:'any'},{src:`assets/icon-maskable-512.png?v=${iconVersion}`,sizes:'512x512',type:'image/png',purpose:'maskable'}]},null,2)+'\n');

// Font outlines keep the exact supplied Brighter Sans and Sky appearance in every renderer.
// Regenerate brand/share-type.json with scripts/brand-type.py after copy or font changes.
const type=JSON.parse(await readFile(resolve(root,'brand/share-type.json'),'utf8'));
if(type.tagline.text!==brand.tagline) throw new Error('Run python3 scripts/brand-type.py after changing the share-card tagline.');
const wordmark=(await readFile(asset('logo-wordmark-gold.svg'),'utf8')).match(/<path[^>]+\/>/)[0];
const text=(key,y,color,scale=1)=>`<g fill="${color}" transform="translate(${600-type[key].width*scale/2} ${y}) scale(${scale})">${type[key].paths}</g>`;
for(const square of [false,true]) {
  const h=square?1200:630, width=square?1000:920, x=(1200-width)/2, y=square?290:78;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${h}" viewBox="0 0 1200 ${h}"><defs><radialGradient id="glow" cx=".5" cy="0" r=".8"><stop stop-color="#332a1c"/><stop offset="1" stop-color="#111111"/></radialGradient><linearGradient id="line"><stop stop-color="#b8862b" stop-opacity="0"/><stop offset=".5" stop-color="#b8862b" stop-opacity=".5"/><stop offset="1" stop-color="#b8862b" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="${h}" fill="#111111"/><rect width="1200" height="${h}" fill="url(#glow)"/><circle cx="600" cy="${square?-30:-110}" r="${square?650:465}" fill="none" stroke="#B8862B" stroke-opacity=".15"/>${text('company',square?260:74,'#d7c3a2',square?1.25:1)}<g transform="translate(${x} ${y}) scale(${width/2172})">${wordmark}</g>${text('tagline',square?720:430,'#ffffff',square?1.14:1)}<path d="M574 ${square?764:466}h52" stroke="#B8862B" stroke-width="3"/>${text('services',square?824:518,'#ded8cd',square?1.2:1)}<path d="M80 ${h-30}h1040" stroke="url(#line)"/></svg>`;
  const name=square?'og-image-square':'og-image';
  await writeFile(asset(name+'.svg'),svg+'\n');
  await sharp(Buffer.from(svg)).png().toFile(asset(name+'.png'));
}
console.log('Rendered logo family, 16–512 px icons, maskable mobile icon, and wide/square share cards.');
