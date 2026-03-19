/**
 * Tron Card — light cycle racers on a neon grid. Clean centered title.
 */
import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

function seeded(i: number, s: number): number { const h = Math.sin(s+i*127.1)*43758.5453; return h-Math.floor(h); }

interface TronPalette { trail: string; glow: string; grid: string; bg: string; text: string; horizon: string; subtitle: string; }
const PALETTES: Record<string, TronPalette> = {
  classic: { trail:'#00d4ff', glow:'#00aaff', grid:'#003366', bg:'#000810', text:'#ffffff', horizon:'#001830', subtitle:'#0088cc' },
  orange: { trail:'#ff6600', glow:'#ff4400', grid:'#331100', bg:'#080400', text:'#ffffff', horizon:'#1a0a00', subtitle:'#cc5500' },
  white: { trail:'#ffffff', glow:'#aaccff', grid:'#1a1a2e', bg:'#0a0a14', text:'#ffffff', horizon:'#12121e', subtitle:'#8899bb' },
};

function makeGrid(w: number, h: number, hy: number, c: TronPalette): string {
  const l: string[] = [];
  for (let i=0;i<15;i++){const t=i/15,y=hy+t*t*(h-hy);l.push(`<line x1="0" y1="${y|0}" x2="${w}" y2="${y|0}" stroke="${c.grid}" stroke-width="0.8" opacity="${(0.5-t*0.35).toFixed(2)}"/>`)}
  for (let i=-10;i<=10;i++)l.push(`<line x1="${w/2}" y1="${hy}" x2="${(w/2+i*(w/10))|0}" y2="${h}" stroke="${c.grid}" stroke-width="0.8" opacity="${Math.max(0.05,0.35-Math.abs(i)*0.025).toFixed(2)}"/>`);
  return l.join('\n    ');
}

interface Cycle { path: string; length: number; dur: number; delay: number; color: string; glow: string; }

function makeCycles(w: number, h: number, hy: number, count: number, c: TronPalette): Cycle[] {
  const colors = [c.trail,'#ff0044','#ffcc00','#00ff88','#ff00ff','#00ffaa'];
  const glows = [c.glow,'#cc0033','#cc9900','#00cc66','#cc00cc','#00cc88'];
  return Array.from({length:count},(_,i)=>{
    const r=seeded(i,42),r2=seeded(i,99),r3=seeded(i,77);
    const segs: string[] = []; let len=0, cx=r*w, cy=hy+20+r2*(h-hy-40);
    segs.push(`M ${cx|0},${cy|0}`);
    for(let t=0;t<3+Math.floor(r3*4);t++){
      const tr=seeded(i*100+t,50);
      let nx:number,ny:number;
      if(t%2===0){nx=cx+(tr>0.5?1:-1)*(80+tr*200);ny=cy}else{nx=cx;ny=cy+(tr>0.5?1:-1)*(30+tr*80)}
      nx=Math.max(20,Math.min(w-20,nx));ny=Math.max(hy+5,Math.min(h-15,ny));
      len+=Math.sqrt((nx-cx)**2+(ny-cy)**2);segs.push(`L ${nx|0},${ny|0}`);cx=nx;cy=ny;
    }
    return{path:segs.join(' '),length:Math.ceil(len),dur:3+r*4,delay:r2*3,color:colors[i%colors.length]!,glow:glows[i%glows.length]!};
  });
}

function renderCycle(c: Cycle, i: number): string {
  return `
    <path d="${c.path}" fill="none" stroke="${c.glow}" stroke-width="6" stroke-linecap="round" opacity="0.3" filter="url(#cg)" stroke-dasharray="${c.length}" stroke-dashoffset="${c.length}">
      <animate attributeName="stroke-dashoffset" from="${c.length}" to="0" dur="${c.dur}s" begin="${c.delay}s" fill="freeze" repeatCount="indefinite"/></path>
    <path d="${c.path}" fill="none" stroke="${c.color}" stroke-width="2" stroke-linecap="round" stroke-dasharray="${c.length}" stroke-dashoffset="${c.length}">
      <animate attributeName="stroke-dashoffset" from="${c.length}" to="0" dur="${c.dur}s" begin="${c.delay}s" fill="freeze" repeatCount="indefinite"/></path>
    <circle r="3" fill="${c.color}" filter="url(#cg)"><animateMotion dur="${c.dur}s" begin="${c.delay}s" repeatCount="indefinite" fill="freeze"><mpath href="#cp${i}"/></animateMotion></circle>
    <path id="cp${i}" d="${c.path}" fill="none" stroke="none"/>`;
}

export const tronCard: CardRenderer = {
  name: 'tron',
  async render(cc: CardConfig): Promise<CardResult> {
    const w=cc.width??900,h=cc.height??300;
    const cfg={name:(cc.config['name'] as string)??'TRON',subtitle:cc.config['subtitle'] as string|undefined,cycleCount:(cc.config['cycleCount'] as number)??6,palette:((cc.config['palette'] as string)??'classic')};
    const c=PALETTES[cfg.palette]??PALETTES['classic']!;
    const hy=Math.round(h*0.45);
    const cycles=makeCycles(w,h,hy,cfg.cycleCount,c);

    const svg=`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(cfg.name)}">
  <style>@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important}}</style>
  <defs>
    <linearGradient id="ts" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c.bg}"/><stop offset="60%" stop-color="${c.horizon}"/><stop offset="100%" stop-color="${c.bg}"/></linearGradient>
    <filter id="cg"><feGaussianBlur stdDeviation="4" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    <filter id="tg"><feGaussianBlur stdDeviation="2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    <radialGradient id="hg" cx="50%" cy="0%" r="80%"><stop offset="0%" stop-color="${c.trail}" stop-opacity="0.08"/><stop offset="100%" stop-color="${c.trail}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="12" fill="url(#ts)"/>
  <rect x="0" y="${hy-40}" width="${w}" height="80" fill="url(#hg)"/>
  <line x1="0" y1="${hy}" x2="${w}" y2="${hy}" stroke="${c.trail}" stroke-width="1" opacity="0.4"/>
  <g>${makeGrid(w,h,hy,c)}</g>
  <g>${cycles.map((cy,i)=>renderCycle(cy,i)).join('')}</g>
  <text x="${w/2}" y="${hy-50}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="44" font-weight="700" fill="${c.text}" filter="url(#tg)" letter-spacing="8">${escapeXml(cfg.name)}</text>
  ${cfg.subtitle?`<text x="${w/2}" y="${hy-18}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="14" fill="${c.subtitle}" letter-spacing="4">${escapeXml(cfg.subtitle)}</text>`:''}
  <rect width="${w}" height="${h}" rx="12" fill="none" stroke="${c.trail}" stroke-width="1" opacity="0.15"/>
</svg>`;
    return{svg,filename:'tron.svg',width:w,height:h};
  },
};
