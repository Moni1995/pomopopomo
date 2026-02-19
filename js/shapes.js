import { esc } from './utils.js';

export function triSVG(f){return f?'<svg width="16" height="14"><polygon points="8,0 16,14 0,14" fill="var(--purple)"/></svg>':'<svg width="16" height="14"><polygon points="8,1 15,13 1,13" fill="none" stroke="var(--purple)" stroke-width="1.5"/></svg>';}

export function renderShapesRow(id,src,lv,count,filled){
  if(count<=0)return '';
  const lb={1:['□','est-label-1'],2:['○','est-label-2'],3:['△','est-label-3']}[lv];
  let shapes='';
  for(let i=0;i<count;i++){
    const f=i<filled;
    if(lv===1)shapes+=`<div class="sq shape ${f?'filled':''}" data-action="fill-shape" data-id="${id}" data-src="${src}" data-level="1" data-index="${i}"></div>`;
    else if(lv===2)shapes+=`<div class="ci shape ${f?'filled':''}" data-action="fill-shape" data-id="${id}" data-src="${src}" data-level="2" data-index="${i}"></div>`;
    else shapes+=`<div class="tri shape" data-action="fill-shape" data-id="${id}" data-src="${src}" data-level="3" data-index="${i}">${triSVG(f)}</div>`;
  }
  return `<div class="est-row"><span class="est-label ${lb[1]}">${lb[0]}</span><div class="est-shapes">${shapes}</div><div class="est-adj"><button class="est-adj-btn" data-action="adj-est" data-id="${id}" data-src="${src}" data-level="${lv}" data-delta="-1">−</button><button class="est-adj-btn" data-action="adj-est" data-id="${id}" data-src="${src}" data-level="${lv}" data-delta="1">+</button></div></div>`;
}

export function renderAllShapes(t,src){
  let h='';
  if((t.estimate||0)>0){h+=renderShapesRow(t.id,src,1,t.estimate,t.actual1||0);}
  else{h+=`<button class="est-adj-btn est-adj-btn-wide" data-action="adj-est" data-id="${t.id}" data-src="${src}" data-level="1" data-delta="1">+ □ Est.</button>`;}
  if((t.est2||0)>0||(t.actual2||0)>0)h+=renderShapesRow(t.id,src,2,t.est2||0,t.actual2||0);
  if((t.est3||0)>0||(t.actual3||0)>0)h+=renderShapesRow(t.id,src,3,t.est3||0,t.actual3||0);
  if((t.estimate||0)>0&&(t.est2||0)===0&&(t.actual2||0)===0)h+=`<button class="est-adj-btn est-adj-btn-wide" data-action="adj-est" data-id="${t.id}" data-src="${src}" data-level="2" data-delta="1">+ ○ 2nd est.</button>`;
  if((t.est2||0)>0&&(t.est3||0)===0&&(t.actual3||0)===0)h+=`<button class="est-adj-btn est-adj-btn-wide" style="margin-left:4px;" data-action="adj-est" data-id="${t.id}" data-src="${src}" data-level="3" data-delta="1">+ △ 3rd est.</button>`;
  return h;
}

export function renderIntMarks(t){if(!t.internalInt&&!t.externalInt)return '';let h='<div class="interrupt-marks">';for(let i=0;i<t.internalInt;i++)h+='<span class="mark-internal">ʼ</span>';for(let i=0;i<t.externalInt;i++)h+='<span class="mark-external">–</span>';return h+'</div>';}

export function renderReview(t,src){
  const has=t.review&&t.review.trim();
  return `<div class="review-section">
    <button class="review-toggle" data-action="toggle-review" data-id="${t.id}">📝 ${has?'Review':'Add review'} <span style="font-size:9px;margin-left:2px;">${has?'▼':'▶'}</span></button>
    ${has?`<div class="review-saved">${esc(t.review)}</div>`:''}
    <div class="review-area" id="review-${t.id}">
      <textarea id="review-text-${t.id}" placeholder="Write notes…">${esc(t.review||'')}</textarea>
      <div class="review-btns">
        <button class="btn btn-primary btn-sm" data-action="save-review" data-id="${t.id}" data-src="${src}">Save</button>
        <button class="btn btn-ghost btn-sm" data-action="toggle-review" data-id="${t.id}">Cancel</button>
      </div>
    </div>
  </div>`;
}
