import { D } from './store.js';

/* ═══════════════════════════════════════ */
/* CHART RENDERING                        */
/* ═══════════════════════════════════════ */
export function renderChart(){
  const canvas=document.getElementById('chart-canvas');
  const empty=document.getElementById('chart-empty');
  if(!D.records.length||D.records.length<1){canvas.style.display='none';empty.style.display='block';return;}
  canvas.style.display='block';empty.style.display='none';
  const ctx=canvas.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  const rect=canvas.getBoundingClientRect();
  canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;
  ctx.scale(dpr,dpr);
  const W=rect.width,H=rect.height;
  ctx.clearRect(0,0,W,H);

  const sorted=[...D.records].sort((a,b)=>a.date.localeCompare(b.date));
  const last=sorted.slice(-14); // last 14 days
  const maxP=Math.max(...last.map(r=>r.pomos),1);
  const barW=Math.max(12,Math.min(30,(W-60)/last.length-4));
  const padL=30,padB=30,padT=10;
  const chartH=H-padB-padT;
  const chartW=W-padL-10;

  // Colors from CSS custom properties
  const style=getComputedStyle(document.body);
  const accentColor=style.getPropertyValue('--accent').trim()||'#D94F30';
  const textColor=style.getPropertyValue('--text3').trim()||'#806040';
  const gridColor=style.getPropertyValue('--border').trim()||'#4a2a15';

  // Grid lines
  ctx.strokeStyle=gridColor;ctx.lineWidth=0.5;ctx.setLineDash([3,3]);
  for(let i=0;i<=4;i++){
    const y=padT+chartH*(1-i/4);
    ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-10,y);ctx.stroke();
    ctx.fillStyle=textColor;ctx.font='10px sans-serif';ctx.textAlign='right';
    ctx.fillText(Math.round(maxP*i/4),padL-4,y+3);
  }
  ctx.setLineDash([]);

  // Bars
  const totalBarArea=chartW;
  const gap=(totalBarArea-barW*last.length)/(last.length+1);
  last.forEach((r,i)=>{
    const x=padL+gap+(barW+gap)*i;
    const barH=Math.max(2,(r.pomos/maxP)*chartH);
    const y=padT+chartH-barH;

    // Gradient-filled rounded bars
    const grad=ctx.createLinearGradient(x,y,x,y+barH);
    grad.addColorStop(0,accentColor);grad.addColorStop(1,accentColor+'88');
    ctx.fillStyle=grad;
    ctx.beginPath();
    const rad=Math.min(4,barW/3);
    ctx.moveTo(x+rad,y);ctx.lineTo(x+barW-rad,y);ctx.quadraticCurveTo(x+barW,y,x+barW,y+rad);
    ctx.lineTo(x+barW,y+barH);ctx.lineTo(x,y+barH);ctx.lineTo(x,y+rad);ctx.quadraticCurveTo(x,y,x+rad,y);
    ctx.fill();

    // Value on top
    ctx.fillStyle=accentColor;ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.fillText(r.pomos,x+barW/2,y-3);

    // Date label on x-axis
    ctx.fillStyle=textColor;ctx.font='9px sans-serif';
    const d=new Date(r.date+'T12:00:00');
    ctx.fillText((d.getMonth()+1)+'/'+d.getDate(),x+barW/2,H-8);
  });
}
