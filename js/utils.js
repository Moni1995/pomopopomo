export function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5);}
export function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
export function fmtDate(d){return new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});}
export function totalActual(t){return(t.actual1||0)+(t.actual2||0)+(t.actual3||0);}
export function liveDate(){return new Date().toISOString().split('T')[0];}
