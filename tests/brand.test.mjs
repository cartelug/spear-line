import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const pub=new URL('../public/',import.meta.url);
const read=path=>readFile(new URL(path,pub));
test('every page shares an absolute, versioned preview image without requiring launch',async()=>{
  for(const page of (await readdir(pub)).filter(name=>name.endsWith('.html'))) {
    const html=(await read(page)).toString();
    const image=html.match(/<meta property="og:image" content="([^"]+)"/);
    assert.ok(image,page+' has a social image in the initial HTML');
    const url=new URL(image[1]);assert.equal(url.protocol,'https:');
    assert.match(url.pathname,/\/assets\/og-image\.png$/);assert.match(url.search,/v=[a-f0-9]{10}/);
    assert.ok(html.includes(`<meta name="twitter:image" content="${image[1]}">`),page+' Twitter image');
    assert.match(html,/<meta property="og:image:width" content="1200">/);
    assert.match(html,/<meta property="og:image:height" content="630">/);
    assert.match(html,/<link rel="icon" href="assets\/favicon\.svg\?v=[a-f0-9]+"/);
  }
});
test('small icons, mobile exports and share cards have their advertised dimensions',async()=>{
  for(const [name,w,h] of [['favicon-16.png',16,16],['favicon-32.png',32,32],['favicon-48.png',48,48],['apple-touch-icon.png',180,180],['icon-192.png',192,192],['icon-512.png',512,512],['icon-maskable-512.png',512,512],['og-image.png',1200,630],['og-image-square.png',1200,1200]]) {
    const png=await read('assets/'+name);assert.equal(png.readUInt32BE(16),w,name);assert.equal(png.readUInt32BE(20),h,name);
  }
  const ico=await read('favicon.ico');assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),3);
  const sizes=Array.from({length:3},(_,i)=>ico.readUInt8(6+16*i)).sort((a,b)=>a-b);assert.deepEqual(sizes,[16,32,48]);
  const manifest=JSON.parse((await read('site.webmanifest')).toString());
  assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
  assert.ok(manifest.icons.some(icon=>icon.purpose==='maskable'&&icon.sizes==='512x512'));
  for(const icon of manifest.icons) await read(icon.src.split('?')[0]);
});
