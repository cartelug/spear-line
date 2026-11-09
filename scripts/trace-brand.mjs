// Turn the approved alpha silhouette into portable, flat SVG production artwork.
// ImageMagick reads the supplied pixels; contours stay within 0.6 source pixels.
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'brand/source-wordmark.png');
let W = 2172, H = 724;
let alpha = execFileSync('magick', [source, '-alpha', 'extract', '-threshold', '50%', '-depth', '8', 'gray:-'], { maxBuffer: W * H * 2 });
const filled = (x,y) => x >= 0 && y >= 0 && x < W && y < H && alpha[y*W+x] > 127;

function contours(x0,y0,w,h) {
  const edges = new Map();
  const key = (x,y) => y*(w+1)+x;
  function add(x,y,a,b) { const k=key(x,y); if (!edges.has(k)) edges.set(k,[]); edges.get(k).push(key(a,b)); }
  const on = (x,y) => x>=0&&y>=0&&x<w&&y<h&&filled(x+x0,y+y0);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(on(x,y)) {
    if(!on(x,y-1)) add(x,y,x+1,y);
    if(!on(x+1,y)) add(x+1,y,x+1,y+1);
    if(!on(x,y+1)) add(x+1,y+1,x,y+1);
    if(!on(x-1,y)) add(x,y+1,x,y);
  }
  const point = k => [k%(w+1),Math.floor(k/(w+1))];
  const loops=[];
  while(edges.size) {
    const start=edges.keys().next().value; let k=start; const path=[];
    do {
      path.push(point(k)); const next=edges.get(k); if(!next) throw new Error('Open alpha contour');
      const n=next.pop(); if(!next.length) edges.delete(k); k=n;
    } while(k!==start);
    const area=path.reduce((sum,p,i)=>{const q=path[(i+1)%path.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2;
    if(Math.abs(area)>=12) loops.push(path);
  }
  return loops;
}
function simplify(p,epsilon=.6) {
  if(p.length<=2)return p;
  const a=p[0],b=p.at(-1),dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;
  let best=0,index=0;
  for(let i=1;i<p.length-1;i++) { const t=den?Math.max(0,Math.min(1,((p[i][0]-a[0])*dx+(p[i][1]-a[1])*dy)/den)):0;
    const d=(p[i][0]-a[0]-t*dx)**2+(p[i][1]-a[1]-t*dy)**2;if(d>best){best=d;index=i;} }
  if(best<=epsilon*epsilon)return [a,b];
  return [...simplify(p.slice(0,index+1),epsilon).slice(0,-1),...simplify(p.slice(index),epsilon)];
}
function shape(x,y,w,h) {
  return contours(x,y,w,h).map(loop=>{const half=Math.floor(loop.length/2);const p=[...simplify(loop.slice(0,half+1)).slice(0,-1),...simplify([...loop.slice(half),loop[0]]).slice(0,-1)];return 'M'+p.map(v=>v.join(' ')).join('L')+'Z';}).join('');
}
const wordmark=shape(0,0,W,H);
for(const [name,color] of [['gold','#B8862B'],['black','#111111'],['white','#FFFFFF']]) {
  await writeFile(resolve(root,`public/assets/logo-wordmark-${name}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Spear Line"><path fill="${color}" fill-rule="evenodd" d="${wordmark}"/></svg>\n`);
}
W=1254;H=1254;
alpha=execFileSync('magick',[resolve(root,'brand/source-seal.png'),'-alpha','extract','-threshold','50%','-depth','8','gray:-'],{maxBuffer:W*H*2});
const seal=shape(0,0,W,H);
for(const [name,color] of [['gold','#B8862B'],['black','#111111'],['white','#FFFFFF']]) {
  await writeFile(resolve(root,`public/assets/logo-seal-${name}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Spear Line circular logo"><path fill="${color}" fill-rule="evenodd" d="${seal}"/></svg>\n`);
}
if (process.argv.includes('--favicon')) {
  const hunterSource=resolve(root,'brand/source-hunter.png');
  const dimensions=execFileSync('magick',[hunterSource,'-format','%w %h','info:']).toString().trim().split(' ').map(Number);
  [W,H]=dimensions;
  alpha=execFileSync('magick',[hunterSource,'-colorspace','Gray','-threshold','50%','-depth','8','gray:-'],{maxBuffer:W*H*2});
  // Bound the solid white foreground, removing only the black presentation canvas.
  let left=W,top=H,right=0,bottom=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(filled(x,y)){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  const w=right-left+1,h=bottom-top+1,hunter=shape(left,top,w,h);
  await writeFile(resolve(root,'brand/hunter-detail.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Spear Line hunter and spear monogram"><path fill="#FFFFFF" fill-rule="evenodd" d="${hunter}"/></svg>\n`);
}
console.log('Traced approved wordmark and circular seal'+(process.argv.includes('--favicon')?' with the selected hunter favicon.':'.'));
