/**
 * Vaporwave Card — retro cars cruising through sunset landscape.
 * Clean centered title with rich animated scene.
 */
import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

function seeded(i:number,s:number):number{const h=Math.sin(s+i*127.1)*43758.5453;return h-Math.floor(h)}

interface VP { skyTop:string;skyMid:string;skyBottom:string;sun:string;sunStripe:string;mountain:string;grid:string;road:string;car:string;headlight:string;text:string;glow:string;palm:string;subtitle:string }
const P:Record<string,VP>={
  sunset:{skyTop:'#1a0030',skyMid:'#660066',skyBottom:'#ff6600',sun:'#ff4488',sunStripe:'#1a0030',mountain:'#330044',grid:'#ff44aa',road:'#220033',car:'#00ffff',headlight:'#ffff00',text:'#ffffff',glow:'#ff66aa',palm:'#1a0025',subtitle:'#ff88cc'},
  midnight:{skyTop:'#000020',skyMid:'#000055',skyBottom:'#0022aa',sun:'#0066ff',sunStripe:'#000020',mountain:'#000033',grid:'#0044ff',road:'#000015',car:'#00ffff',headlight:'#ffffff',text:'#ccddff',glow:'#0088ff',palm:'#000018',subtitle:'#4488cc'},
  miami:{skyTop:'#ff0066',skyMid:'#ff6600',skyBottom:'#ffcc00',sun:'#ffff00',sunStripe:'#ff0066',mountain:'#cc0044',grid:'#ff0088',road:'#aa0044',car:'#00ffcc',headlight:'#ffffff',text:'#ffffff',glow:'#ff4488',palm:'#880033',subtitle:'#ffaacc'},
};

function sun(cx:number,cy:number,r:number,p:VP):string{
  const slices=Array.from({length:8},(_,i)=>{const y=cy-r+(i+1)*(r*2)/9;return`<rect x="${cx-r}" y="${y|0}" width="${r*2}" height="${(2+i*0.8).toFixed(1)}" fill="${p.sunStripe}"/>`}).join('');
  return`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.sun}"/><clipPath id="sc"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#sc)">${slices}</g>`;
}
function mountains(w:number,hy:number,p:VP):string{
  const pts=[`0,${hy}`,...Array.from({length:21},(_,i)=>`${((i/20)*w)|0},${(hy-15-seeded(i,7)*55)|0}`),`${w},${hy}`];
  return`<polygon points="${pts.join(' ')}" fill="${p.mountain}"/>`;
}
function vgrid(w:number,h:number,hy:number,p:VP):string{
  const l:string[]=[];
  for(let i=0;i<18;i++){const t=i/18,y=hy+t*t*(h-hy);l.push(`<line x1="0" y1="${y|0}" x2="${w}" y2="${y|0}" stroke="${p.grid}" stroke-width="${(0.5+t*1.5).toFixed(1)}" opacity="${Math.max(0.05,0.6-t*0.4).toFixed(2)}"/>`)}
  for(let i=-12;i<=12;i++)l.push(`<line x1="${w/2}" y1="${hy}" x2="${(w/2+i*(w/12))|0}" y2="${h}" stroke="${p.grid}" stroke-width="0.8" opacity="${Math.max(0.05,0.4-Math.abs(i)*0.025).toFixed(2)}"/>`);
  for(let i=0;i<3;i++){const d=(2+i*0.5).toFixed(1),dl=(i*0.7).toFixed(1);l.push(`<line x1="0" x2="${w}" stroke="${p.grid}" stroke-width="1.5" opacity="0"><animate attributeName="y1" from="${hy+5}" to="${h}" dur="${d}s" begin="${dl}s" repeatCount="indefinite"/><animate attributeName="y2" from="${hy+5}" to="${h}" dur="${d}s" begin="${dl}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.6;0" dur="${d}s" begin="${dl}s" repeatCount="indefinite"/><animate attributeName="stroke-width" from="0.5" to="3" dur="${d}s" begin="${dl}s" repeatCount="indefinite"/></line>`)}
  return l.join('\n    ');
}
function cars(w:number,sy:number,n:number,p:VP):string{
  return Array.from({length:n},(_,i)=>{
    const dir=i%2===0?1:-1,ly=sy+8+(i%2)*16,dur=(5+seeded(i,111)*6).toFixed(1),dl=(seeded(i,222)*5).toFixed(1);
    const sx=dir>0?-60:w+60,ex=dir>0?w+60:-60,cc=i%3===0?p.car:'#ff4444';
    return`<g opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.03;0.97;1" dur="${dur}s" begin="${dl}s" repeatCount="indefinite"/>
      <rect rx="2" width="40" height="10" fill="${cc}"><animate attributeName="x" from="${sx}" to="${ex}" dur="${dur}s" begin="${dl}s" repeatCount="indefinite"/><animate attributeName="y" from="${ly}" to="${ly}" dur="0.1s" fill="freeze"/></rect>
      <rect rx="2" width="18" height="7" fill="${cc}" opacity="0.8"><animate attributeName="x" from="${sx+(dir>0?8:14)}" to="${ex+(dir>0?8:14)}" dur="${dur}s" begin="${dl}s" repeatCount="indefinite"/><animate attributeName="y" from="${ly-7}" to="${ly-7}" dur="0.1s" fill="freeze"/></rect>
      <circle r="3" fill="${p.headlight}" opacity="0.7" filter="url(#cg)"><animate attributeName="cx" from="${dir>0?sx+40:sx}" to="${dir>0?ex+40:ex}" dur="${dur}s" begin="${dl}s" repeatCount="indefinite"/><animate attributeName="cy" from="${ly+5}" to="${ly+5}" dur="0.1s" fill="freeze"/></circle>
      <circle r="2" fill="#ff0033" opacity="0.9"><animate attributeName="cx" from="${dir>0?sx:sx+40}" to="${dir>0?ex:ex+40}" dur="${dur}s" begin="${dl}s" repeatCount="indefinite"/><animate attributeName="cy" from="${ly+5}" to="${ly+5}" dur="0.1s" fill="freeze"/></circle></g>`;
  }).join('');
}
function palm(x:number,by:number,h:number,p:VP):string{
  let t=`<line x1="${x}" y1="${by}" x2="${x+3}" y2="${by-h}" stroke="${p.palm}" stroke-width="4"/>`;
  for(let i=0;i<5;i++){const a=-60+i*30,r=a*Math.PI/180,fx=x+3+Math.cos(r)*35,fy=by-h+Math.sin(r)*20-5;t+=`<path d="M ${x+3},${by-h} Q ${((x+3+fx)/2)|0},${(by-h-15)|0} ${fx|0},${fy|0}" fill="none" stroke="${p.palm}" stroke-width="3"/>`}
  return t;
}

export const vaporwaveCard: CardRenderer = {
  name: 'vaporwave',
  async render(cc: CardConfig): Promise<CardResult> {
    const w=cc.width??900,h=cc.height??320;
    const cfg={name:(cc.config['name'] as string)??'V A P O R',subtitle:cc.config['subtitle'] as string|undefined,carCount:(cc.config['carCount'] as number)??5,palette:((cc.config['palette'] as string)??'sunset')};
    const p=P[cfg.palette]??P['sunset']!;
    const hy=Math.round(h*0.48),scy=hy-10,sr=55;

    const svg=`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(cfg.name)}">
  <style>@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important}}</style>
  <defs>
    <linearGradient id="vs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p.skyTop}"/><stop offset="50%" stop-color="${p.skyMid}"/><stop offset="100%" stop-color="${p.skyBottom}"/></linearGradient>
    <filter id="cg"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    <filter id="sg"><feGaussianBlur stdDeviation="8" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    <filter id="tg"><feGaussianBlur stdDeviation="2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    <clipPath id="bh"><rect x="0" y="${hy}" width="${w}" height="${h-hy}"/></clipPath>
  </defs>
  <rect width="${w}" height="${h}" rx="14" fill="url(#vs)"/>
  <g filter="url(#sg)">${sun(w/2,scy,sr,p)}</g>
  ${mountains(w,hy,p)}
  <g>${palm(60,hy,80,p)}${palm(120,hy,65,p)}${palm(w-80,hy,75,p)}${palm(w-140,hy,55,p)}</g>
  <g clip-path="url(#bh)"><rect x="0" y="${hy}" width="${w}" height="${h-hy}" fill="${p.road}"/>${vgrid(w,h,hy,p)}</g>
  <g clip-path="url(#bh)">${cars(w,hy,cfg.carCount,p)}</g>
  <text x="${w/2}" y="${hy-85}" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="42" font-weight="300" fill="${p.text}" filter="url(#tg)" letter-spacing="12">${escapeXml(cfg.name)}</text>
  ${cfg.subtitle?`<text x="${w/2}" y="${hy-55}" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="16" fill="${p.subtitle}" letter-spacing="6">${escapeXml(cfg.subtitle)}</text>`:''}
  <rect width="${w}" height="${h}" rx="14" fill="none" stroke="${p.glow}" stroke-width="1" opacity="0.1"/>
</svg>`;
    return{svg,filename:'vaporwave.svg',width:w,height:h};
  },
};
