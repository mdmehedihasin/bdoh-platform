/* ================================================================
   BDOH — main.js  v3.0
   Kinetic background · Navbar · Exam environment · All renders
================================================================ */
'use strict';

/* ════════════════════════════════════════════════════════════════
   1. KINETIC BACKGROUND — swirling data streams, cyber-nodes,
      orbital arcs. NO grid. Runs on #kineticCanvas (full screen).
════════════════════════════════════════════════════════════════ */
(function initKinetic(){
  const canvas = document.getElementById('kineticCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, raf, reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  /* ── colour helpers ── */
  function teal(a){ return `rgba(0,180,204,${a})` }
  function green(a){ return `rgba(76,175,80,${a})` }
  function gold(a){ return `rgba(255,215,0,${a})` }
  function cyan(a){ return `rgba(0,220,240,${a})` }

  /* ── PARTICLES (glowing nodes) ── */
  const COLS = [teal,green,gold,cyan];
  class Node {
    constructor(){ this.spawn() }
    spawn(){
      this.x  = Math.random()*W;
      this.y  = Math.random()*H;
      this.r  = 1 + Math.random()*2.5;
      this.vx = (Math.random()-.5)*.28;
      this.vy = (Math.random()-.5)*.28;
      this.col = COLS[Math.floor(Math.random()*COLS.length)];
      this.a  = 0; this.ta = .12+Math.random()*.5;
      this.da = .004+Math.random()*.007; this.grow=true;
    }
    step(){
      this.x+=this.vx; this.y+=this.vy;
      if(this.grow){ this.a+=this.da; if(this.a>=this.ta)this.grow=false }
      else { this.a-=this.da*.5; if(this.a<=0)this.spawn() }
      if(this.x<-10||this.x>W+10||this.y<-10||this.y>H+10)this.spawn();
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fillStyle=this.col(this.a);
      ctx.fill();
    }
  }
  const N = Math.min(80, Math.floor(W*H/14000));
  const nodes = Array.from({length:N}, ()=>new Node());

  /* ── DATA STREAM ARCS ── */
  class Arc {
    constructor(){
      this.reset();
    }
    reset(){
      this.ox = Math.random()*W;
      this.oy = Math.random()*H;
      this.ex = Math.random()*W;
      this.ey = Math.random()*H;
      const mx = (this.ox+this.ex)/2;
      const my = (this.oy+this.ey)/2;
      const bend = (Math.random()-.5)*400;
      const dx = this.ex-this.ox;
      const dy = this.ey-this.oy;
      const len = Math.sqrt(dx*dx+dy*dy)||1;
      this.cx = mx - (dy/len)*bend;
      this.cy = my + (dx/len)*bend;
      this.t  = 0;
      this.speed = .003 + Math.random()*.004;
      this.col = COLS[Math.floor(Math.random()*COLS.length)];
      this.width = .4+Math.random()*1;
      this.trail = [];
      this.maxTrail = 18;
    }
    step(){
      this.t+=this.speed;
      const t=this.t, t1=1-t;
      const px = t1*t1*this.ox + 2*t1*t*this.cx + t*t*this.ex;
      const py = t1*t1*this.oy + 2*t1*t*this.cy + t*t*this.ey;
      this.trail.push({x:px,y:py});
      if(this.trail.length>this.maxTrail) this.trail.shift();
      if(this.t>=1) this.reset();
    }
    draw(){
      if(this.trail.length<2) return;
      for(let i=1;i<this.trail.length;i++){
        const ratio = i/this.trail.length;
        ctx.beginPath();
        ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
        ctx.lineTo(this.trail[i].x,   this.trail[i].y);
        ctx.strokeStyle=this.col(ratio*.45);
        ctx.lineWidth=this.width*ratio;
        ctx.lineCap='round';
        ctx.stroke();
        /* head glow */
        if(i===this.trail.length-1){
          ctx.beginPath();
          ctx.arc(this.trail[i].x, this.trail[i].y, this.width*2.5, 0, Math.PI*2);
          ctx.fillStyle=this.col(.7);
          ctx.fill();
        }
      }
    }
  }
  const arcCount = Math.min(30, Math.floor(W/50));
  const arcs = Array.from({length:arcCount}, ()=>{
    const a=new Arc(); a.t=Math.random(); return a;
  });

  /* ── ORBITAL RINGS (screen-level large) ── */
  class ScreenRing {
    constructor(cx,cy,rx,ry,tilt,spd,col){
      this.cx=cx; this.cy=cy; this.rx=rx; this.ry=ry;
      this.tilt=tilt; this.spd=spd; this.col=col;
      this.angle=Math.random()*Math.PI*2;
    }
    step(){ this.angle+=this.spd }
    draw(){
      ctx.save();
      ctx.translate(this.cx,this.cy);
      ctx.rotate(this.tilt);
      /* ring path */
      ctx.beginPath();
      ctx.ellipse(0,0,this.rx,this.ry,0,0,Math.PI*2);
      ctx.strokeStyle=this.col(.1);
      ctx.lineWidth=.8;
      ctx.stroke();
      /* dot on ring */
      const dx=Math.cos(this.angle)*this.rx;
      const dy=Math.sin(this.angle)*this.ry;
      ctx.beginPath();
      ctx.arc(dx,dy,4,0,Math.PI*2);
      ctx.fillStyle=this.col(.9);
      ctx.fill();
      /* dot glow */
      const grd=ctx.createRadialGradient(dx,dy,0,dx,dy,14);
      grd.addColorStop(0,this.col(.5));
      grd.addColorStop(1,'transparent');
      ctx.beginPath();
      ctx.arc(dx,dy,14,0,Math.PI*2);
      ctx.fillStyle=grd;
      ctx.fill();
      ctx.restore();
    }
  }
  const rings = [
    new ScreenRing(W*.5,H*.5, W*.38,H*.18, -.3, .006,teal),
    new ScreenRing(W*.5,H*.5, W*.32,H*.22,  .4, -.004,green),
    new ScreenRing(W*.5,H*.5, W*.44,H*.14,  .8, .0035,gold),
    new ScreenRing(W*.3,H*.4, W*.22,H*.12, -.5, .005,cyan),
    new ScreenRing(W*.7,H*.6, W*.20,H*.10,  .6, -.006,green),
  ];

  /* ── PULSING CYBER NODES (fixed positions, breathe) ── */
  const cyberNodes = Array.from({length:14}, ()=>({
    x: Math.random()*W,
    y: Math.random()*H,
    r: 1,
    phase: Math.random()*Math.PI*2,
    col: COLS[Math.floor(Math.random()*COLS.length)]
  }));

  /* ── CONNECTION LINES between nearby nodes ── */
  function drawLines(){
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const dx=nodes[i].x-nodes[j].x;
        const dy=nodes[i].y-nodes[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){
          const a=(1-d/120)*.08;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x,nodes[i].y);
          ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.strokeStyle=`rgba(0,180,204,${a})`;
          ctx.lineWidth=.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ── MAIN LOOP ── */
  let t=0;
  function loop(){
    ctx.clearRect(0,0,W,H);
    t+=.008;

    /* rings */
    rings.forEach(r=>{r.step();r.draw()});

    /* arcs */
    arcs.forEach(a=>{a.step();a.draw()});

    /* connection lines */
    drawLines();

    /* nodes */
    nodes.forEach(n=>{n.step();n.draw()});

    /* cyber nodes (pulsing) */
    cyberNodes.forEach(cn=>{
      const pulse=.5+.5*Math.sin(t*1.8+cn.phase);
      const grd=ctx.createRadialGradient(cn.x,cn.y,0,cn.x,cn.y,cn.r*4*(1+pulse*.5));
      grd.addColorStop(0,cn.col(.7*pulse+.2));
      grd.addColorStop(1,'transparent');
      ctx.beginPath();
      ctx.arc(cn.x,cn.y,cn.r*4*(1+pulse*.5),0,Math.PI*2);
      ctx.fillStyle=grd;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cn.x,cn.y,cn.r*(1+pulse*.3),0,Math.PI*2);
      ctx.fillStyle=cn.col(.8+pulse*.2);
      ctx.fill();
    });

    raf=requestAnimationFrame(loop);
  }

  if(reduced){
    /* single static frame */
    nodes.forEach(n=>{n.a=n.ta;n.draw()});
  } else {
    loop();
  }
})();

/* ════════════════════════════════════════════════════════════════
   2. ORBIT CANVAS in torch scene (hero visual)
════════════════════════════════════════════════════════════════ */
(function initOrbit(){
  const canvas=document.getElementById('orbitCanvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  let W,H,angle=0;
  function resize(){
    const rect=canvas.parentElement.getBoundingClientRect();
    W=canvas.width=rect.width||500;
    H=canvas.height=rect.height||640;
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});

  const CX=()=>W/2, CY=()=>H*.5;
  const orbits=[
    {rx:.38,ry:.14,tilt:-.3,spd:.008,col:'rgba(0,180,204,',dotR:5},
    {rx:.32,ry:.18,tilt:.5, spd:-.006,col:'rgba(76,175,80,',dotR:4},
    {rx:.44,ry:.12,tilt:.9, spd:.005,col:'rgba(255,215,0,',dotR:4},
    {rx:.28,ry:.20,tilt:-.7,spd:-.009,col:'rgba(0,220,240,',dotR:3},
  ];

  function loop(){
    ctx.clearRect(0,0,W,H);
    const cx=CX(),cy=CY();
    angle+=.012;

    orbits.forEach((o,i)=>{
      const rx=W*o.rx, ry=H*o.ry;
      const a=angle*(i%2===0?1:-1)*(.8+i*.15);
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(o.tilt);
      /* ring */
      ctx.beginPath();
      ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
      ctx.strokeStyle=o.col+'0.18)';
      ctx.lineWidth=1.2;
      ctx.stroke();
      /* dot */
      const dx=Math.cos(a)*rx, dy=Math.sin(a)*ry;
      /* glow */
      const grd=ctx.createRadialGradient(dx,dy,0,dx,dy,o.dotR*5);
      grd.addColorStop(0,o.col+'0.7)');
      grd.addColorStop(1,'transparent');
      ctx.beginPath();ctx.arc(dx,dy,o.dotR*5,0,Math.PI*2);
      ctx.fillStyle=grd;ctx.fill();
      /* dot core */
      ctx.beginPath();ctx.arc(dx,dy,o.dotR,0,Math.PI*2);
      ctx.fillStyle=o.col+'1)';ctx.fill();
      /* trail */
      for(let k=1;k<=10;k++){
        const ta=a-k*.08;
        const tx=Math.cos(ta)*rx, ty=Math.sin(ta)*ry;
        ctx.beginPath();ctx.arc(tx,ty,o.dotR*(1-k/12),0,Math.PI*2);
        ctx.fillStyle=o.col+((.5-k/22)*.6)+')';
        ctx.fill();
      }
      ctx.restore();
    });
    requestAnimationFrame(loop);
  }
  if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches) loop();
})();

/* ════════════════════════════════════════════════════════════════
   3. NAVBAR
════════════════════════════════════════════════════════════════ */
(function initNav(){
  const nav=document.getElementById('mainNav');
  const links=document.querySelectorAll('.nl');
  const IDS=['home','about','practice','contests','president','community','social','news'];

  const onScroll=()=>{
    nav.classList.toggle('scrolled',window.scrollY>64);
    let cur='home';
    IDS.forEach(id=>{
      const el=document.getElementById(id);
      if(el&&el.getBoundingClientRect().top<=88) cur=id;
    });
    links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
})();

/* ════════════════════════════════════════════════════════════════
   4. MOBILE MENU
════════════════════════════════════════════════════════════════ */
(function initMob(){
  const hb=document.getElementById('hbBtn');
  const mob=document.getElementById('mobMenu');
  const close=document.getElementById('mobClose');
  if(!hb||!mob) return;
  function open(){mob.classList.add('open');hb.classList.add('open');hb.setAttribute('aria-expanded','true');document.body.style.overflow='hidden'}
  function shut(){mob.classList.remove('open');hb.classList.remove('open');hb.setAttribute('aria-expanded','false');document.body.style.overflow=''}
  hb.addEventListener('click',open);
  close.addEventListener('click',shut);
  document.querySelectorAll('.mob-link').forEach(a=>a.addEventListener('click',shut));
})();

/* ════════════════════════════════════════════════════════════════
   5. THEME TOGGLE
════════════════════════════════════════════════════════════════ */
(function initTheme(){
  const btn=document.getElementById('themeBtn');
  const icon=document.getElementById('themeIcon');
  if(!btn) return;
  const stored=localStorage.getItem('bdoh-theme')||'dark';
  apply(stored);
  btn.addEventListener('click',()=>{
    const cur=document.documentElement.getAttribute('data-theme');
    apply(cur==='dark'?'light':'dark');
  });
  function apply(t){
    document.documentElement.setAttribute('data-theme',t);
    localStorage.setItem('bdoh-theme',t);
    /* swap sun/moon SVG */
    if(icon){
      if(t==='dark'){
        icon.innerHTML='<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
      } else {
        icon.innerHTML='<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
      }
    }
  }
})();

/* ════════════════════════════════════════════════════════════════
   6. SCROLL REVEAL
════════════════════════════════════════════════════════════════ */
(function initReveal(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)} });
  },{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();

/* ════════════════════════════════════════════════════════════════
   7. ANIMATED COUNTERS
════════════════════════════════════════════════════════════════ */
(function initCounters(){
  const items={
    'cn-members': {n:2400,s:'+'},
    'cn-problems':{n:1635,s:'+'},
    'cn-contests':{n:48,  s:''},
    'cn-medals':  {n:23,  s:''}
  };
  const strip=document.querySelector('.stats-strip');
  if(!strip) return;
  let fired=false;
  new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting||fired) return;
    fired=true;
    Object.entries(items).forEach(([id,{n,s}])=>{
      const el=document.getElementById(id);
      if(!el) return;
      let cur=0;const step=Math.ceil(n/60);
      const t=setInterval(()=>{
        cur=Math.min(cur+step,n);
        el.textContent=cur.toLocaleString()+s;
        if(cur>=n)clearInterval(t);
      },22);
    });
  },{threshold:.3}).observe(strip);
})();

/* ════════════════════════════════════════════════════════════════
   8. RENDER FUNCTIONS
════════════════════════════════════════════════════════════════ */

/* ── Panelists ── */
function renderPanelists(){
  const presBox=document.getElementById('presBox');
  const teamBox=document.getElementById('teamBox');
  if(!presBox||!teamBox) return;

  const pres=BDOH.panelists.find(p=>p.isPresident);
  const members=BDOH.panelists.filter(p=>!p.isPresident);

  if(pres){
    presBox.innerHTML=`
      <div class="pres-wrap">
        <div class="pres-photo-wrap reveal">
          <div class="pres-ring">
            <div class="pres-inner">
              ${pres.photo
                ?`<img src="${pres.photo}" alt="${pres.name}" loading="lazy"/>`
                :`<div class="pres-initials">${pres.initials}</div>`}
            </div>
          </div>
          <div class="pres-badge" aria-hidden="true">🔥</div>
        </div>
        <div class="reveal rd1">
          <div class="pres-corner-tag">President's Corner</div>
          <div class="pres-name">${pres.name}</div>
          <div class="pres-role">${pres.role} &nbsp;·&nbsp; Bangladesh Olympiadians Hub</div>
          <blockquote class="pres-quote">"${pres.quote}"</blockquote>
          <div class="pres-achievements">
            ${pres.achievements.map(a=>`
              <div class="ach-item"><span class="ach-dot"></span><span>${a}</span></div>
            `).join('')}
          </div>
        </div>
      </div>`;
  }

  teamBox.innerHTML=members.map((m,i)=>`
    <div class="member reveal rd${i%4+1}">
      <div class="member-ring">
        <div class="member-photo">
          ${m.photo
            ?`<img src="${m.photo}" alt="${m.name}" loading="lazy"/>`
            :`<div class="member-initials">${m.initials}</div>`}
        </div>
      </div>
      <div class="member-name">${m.name}</div>
      <div class="member-role">${m.role}</div>
      <div class="member-bio" style="text-align: left; margin-top: 16px; display: flex; flex-direction: column; gap: 10px;">
  ${m.achievements.map(a => `
    <div style="display: flex; align-items: flex-start; gap: 10px;">
      <span class="ach-dot" style="margin-top: 5px;"></span>
      <span style="line-height: 1.5;">${a.replace(/^[•*-]\s*/, '')}</span>
    </div>
  `).join('')}
</div>
    </div>`).join('');

  reObserve();
}

/* ── Contests ── */
function renderContests(){
  const box=document.getElementById('contestBox');
  if(!box) return;
  const DT={live:{d:'09',m:'APR'},open:{d:'15',m:'APR'},soon:{d:'30',m:'APR'},past:{d:'12',m:'MAR'}};
  const BADGE={
    live:`<span class="badge b-live" role="status">Live now</span>`,
    open:`<span class="badge b-open">Registration open</span>`,
    soon:`<span class="badge b-soon">Opens soon</span>`,
    past:`<span class="badge b-past">View results</span>`
  };
  box.innerHTML=BDOH.contests.map((c,i)=>{
    const dt=DT[c.status]||{d:'??',m:'???'};
    return `<div class="con-card reveal rd${i%3+1}" role="listitem" tabindex="0"
               aria-label="${c.title}">
      <div class="con-left">
        <div class="con-date" ${c.status==='live'?'style="background:rgba(239,68,68,.15)"':''}>
          <div class="con-day" ${c.status==='live'?'style="color:#f87171;-webkit-text-fill-color:#f87171"':''}>${dt.d}</div>
          <div class="con-mon">${dt.m}</div>
        </div>
        <div class="con-info">
          <h4>${c.title}</h4>
          <p>${c.duration} min &nbsp;·&nbsp; ${c.problems} problems &nbsp;·&nbsp; ${c.level}</p>
          <div class="con-tags">${c.tags.map(t=>`<span class="con-tag">${t}</span>`).join('')}</div>
        </div>
      </div>
      ${BADGE[c.status]}
    </div>`;
  }).join('');
  reObserve();
}

/* ── Problems ── */
function renderProblems(filter='All'){
  const box=document.getElementById('probBox');
  if(!box) return;
  const list=filter==='All'?BDOH.problems:BDOH.problems.filter(p=>p.subject===filter);
  const DM={Easy:'d-easy',Medium:'d-med',Hard:'d-hard'};
  box.innerHTML=list.map((p,i)=>`
    <div class="prob-card reveal rd${i%3+1}" role="listitem"
         onclick="openExam('${p.id}')" tabindex="0"
         onkeydown="if(event.key==='Enter')openExam('${p.id}')"
         aria-label="Open problem: ${p.title}">
      <div class="prob-top">
        <span class="d-badge ${DM[p.difficulty]}">${p.difficulty}</span>
        <span class="p-subj">${p.subject}</span>
      </div>
      <div class="p-title">${p.title}</div>
      <div class="p-stmt">${p.statement.slice(0,110)}…</div>
      <div class="p-foot">
        <span class="p-meta">⏱ ${p.timeMin} min &nbsp;·&nbsp; ${p.solves.toLocaleString()} solves</span>
        <button class="p-start-btn" aria-label="Start problem: ${p.title}">
          Start
          <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor"><path d="M4 2l5 4-5 4V2z"/></svg>
        </button>
      </div>
    </div>`).join('');
  reObserve();
}

/* ── WhatsApp ── */
function renderWA(){
  const box=document.getElementById('waBox');
  if(!box) return;
  box.innerHTML=BDOH.whatsapp.map((g,i)=>`
    <a href="${g.link}" target="_blank" rel="noopener noreferrer"
       class="wa-card reveal rd${i%3+1}" role="listitem"
       aria-label="Join ${g.name} on WhatsApp">
      <div class="wa-icon-wrap" aria-hidden="true">${g.emoji}</div>
      <div class="wa-name">${g.name}</div>
      <div class="wa-members">${g.members} members</div>
      <div class="wa-cta">
        Join on WhatsApp
        <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor"><path d="M4 2l5 4-5 4V2z"/></svg>
      </div>
    </a>`).join('');
  reObserve();
}

/* ── filter problems by subject ── */
window.filterTo=function(subject){
  document.querySelectorAll('.f-btn').forEach(b=>b.classList.remove('active'));
  const btn=document.querySelector(`.f-btn[data-f="${subject}"]`);
  if(btn)btn.classList.add('active');
  renderProblems(subject);
  document.getElementById('practice')?.scrollIntoView({behavior:'smooth',block:'start'});
};

/* filter buttons */
document.querySelectorAll('.f-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.f-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderProblems(btn.dataset.f);
  });
});

function reObserve(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}});
  },{threshold:.08});
  document.querySelectorAll('.reveal:not(.on)').forEach(el=>io.observe(el));
}

/* ════════════════════════════════════════════════════════════════
   9. EXAM ENVIRONMENT
════════════════════════════════════════════════════════════════ */
let _examId=null, _timerInterval=null, _answered=false;
let _problemList=null, _problemIdx=0;

window.openExam=function(id){
  const p=BDOH.problems.find(x=>x.id===id);
  if(!p) return;
  _examId=id;
  _answered=false;
  _problemList=[...BDOH.problems]; /* use full list for nav */
  _problemIdx=_problemList.findIndex(x=>x.id===id);

  loadExamProblem(p);
  document.getElementById('examOverlay').classList.add('open');
  document.body.style.overflow='hidden';
  startTimer(p.timeMin*60);
  setTimeout(()=>document.getElementById('examInput')?.focus(),400);
};

function loadExamProblem(p){
  const DM={Easy:'d-easy',Medium:'d-med',Hard:'d-hard'};
  document.getElementById('examSubj').textContent=p.subject.toUpperCase();
  document.getElementById('examTitle').textContent=p.title;
  document.getElementById('examStmt').textContent=p.statement;
  document.getElementById('examPts').textContent=`${p.points} pts`;
  const diff=document.getElementById('examDiff');
  diff.textContent=p.difficulty;
  diff.className='exam-diff-badge '+DM[p.difficulty];
  document.getElementById('examMeta').textContent=`⏱ ${p.timeMin} min suggested · ${p.solves.toLocaleString()} solves`;
  document.getElementById('hintBtn').textContent='Show Hint';
  document.getElementById('hintBox').textContent=p.hint;
  document.getElementById('hintBox').classList.remove('open');
  const input=document.getElementById('examInput');
  input.value='';input.disabled=false;
  document.getElementById('submitBtn').disabled=false;
  document.getElementById('examFeedback').className='exam-feedback';
  document.getElementById('examFeedback').textContent='';
  document.getElementById('solutionLocked').style.display='';
  document.getElementById('solutionContent').style.display='none';
  document.getElementById('examProgress').textContent=`${_problemIdx+1} / ${_problemList.length}`;
  _answered=false;
}

function startTimer(secs){
  clearInterval(_timerInterval);
  let s=secs;
  const disp=document.getElementById('timerDisplay');
  const wrap=document.getElementById('examTimer');
  function tick(){
    const m=Math.floor(s/60), sec=s%60;
    disp.textContent=`${m}:${sec.toString().padStart(2,'0')}`;
    wrap.classList.toggle('urgent',s<=60);
    if(s<=0){clearInterval(_timerInterval);timeUp();}
    s--;
  }
  tick();
  _timerInterval=setInterval(tick,1000);
}

function timeUp(){
  const fb=document.getElementById('examFeedback');
  fb.textContent='Time is up! The solution is now visible below.';
  fb.className='exam-feedback fb-no';
  revealSolution();
}

window.closeExam=function(){
  clearInterval(_timerInterval);
  document.getElementById('examOverlay').classList.remove('open');
  document.body.style.overflow='';
  _examId=null;
};

window.toggleHint=function(){
  const box=document.getElementById('hintBox');
  const btn=document.getElementById('hintBtn');
  box.classList.toggle('open');
  btn.textContent=box.classList.contains('open')?'Hide Hint':'Show Hint';
};

window.submitAnswer=function(){
  if(_answered) return;
  const p=BDOH.problems.find(x=>x.id===_examId);
  if(!p) return;
  const raw=document.getElementById('examInput').value.trim();
  const fb=document.getElementById('examFeedback');
  fb.className='exam-feedback';fb.textContent='';
  if(!raw){fb.textContent='Please enter your answer first.';fb.className='exam-feedback fb-no';return;}
  const val=parseFloat(raw);
  const exp=parseFloat(p.answer);
  const ok = p.tolerance===0
    ?(raw===p.answer||(!isNaN(val)&&val===exp))
    :(!isNaN(val)&&Math.abs(val-exp)<=p.tolerance);

  _answered=true;
  clearInterval(_timerInterval);
  document.getElementById('submitBtn').disabled=true;
  document.getElementById('examInput').disabled=true;

  setTimeout(()=>{
    if(ok){
      fb.textContent='Correct! Your answer matches the expected value. Excellent work.';
      fb.className='exam-feedback fb-ok';
    } else {
      fb.textContent=`Not quite right — check your working and review the solution. Expected: ${p.answer}`;
      fb.className='exam-feedback fb-no';
    }
    revealSolution();
  },120);
};

function revealSolution(){
  const p=BDOH.problems.find(x=>x.id===_examId);
  if(!p) return;
  document.getElementById('solutionLocked').style.display='none';
  const sc=document.getElementById('solutionContent');
  sc.innerHTML=`
    <p style="font-weight:700;color:var(--txt);margin-bottom:10px">Full Solution</p>
    <p style="white-space:pre-wrap;word-break:break-word;overflow-wrap:break-word;line-height:1.7">${p.solution}</p>
    <p style="margin-top:12px;font-family:var(--fH);font-size:12px;color:var(--txt-d)">
      Expected answer: <strong style="color:var(--green)">${p.answer}</strong>${p.tolerance>0?' (tolerance ±'+p.tolerance+')':''}
    </p>`;
  sc.style.cssText='display:block;width:100%;box-sizing:border-box;overflow-wrap:break-word;word-break:break-word;overflow:hidden;';
}

window.prevProblem=function(){
  if(_problemIdx>0){
    _problemIdx--;
    _examId=_problemList[_problemIdx].id;
    loadExamProblem(_problemList[_problemIdx]);
    clearInterval(_timerInterval);
    startTimer(_problemList[_problemIdx].timeMin*60);
  }
};
window.nextProblem=function(){
  if(_problemIdx<_problemList.length-1){
    _problemIdx++;
    _examId=_problemList[_problemIdx].id;
    loadExamProblem(_problemList[_problemIdx]);
    clearInterval(_timerInterval);
    startTimer(_problemList[_problemIdx].timeMin*60);
  }
};

/* keyboard shortcuts in exam */
document.addEventListener('keydown',e=>{
  const open=document.getElementById('examOverlay').classList.contains('open');
  if(!open) return;
  if(e.key==='Escape') window.closeExam();
  if(e.key==='Enter'&&!e.shiftKey) window.submitAnswer();
  if(e.key==='ArrowRight'&&e.altKey) window.nextProblem();
  if(e.key==='ArrowLeft'&&e.altKey)  window.prevProblem();
});

/* ════════════════════════════════════════════════════════════════
   10. INIT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  renderPanelists();
  renderContests();
  renderProblems();
  renderWA();
});

/* ════════════════════════════════════════════════════════════════
   11. MOBILE MENU — professional slide-in drawer (mobile only)
════════════════════════════════════════════════════════════════ */
(function initMobileMenu(){
  /* Inject styles for the mobile drawer */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Hamburger / three-dot button ── */
    #hbBtn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      border-radius: 8px;
      transition: background 0.2s;
      z-index: 1100;
      position: relative;
    }
    #hbBtn:hover { background: rgba(0,180,204,0.1); }
    #hbBtn .hb-bar {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--teal, #00b4cc);
      border-radius: 2px;
      transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
      transform-origin: center;
    }
    #hbBtn .hb-lines {
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: center;
    }
    /* Animate to X when open */
    #hbBtn.open .hb-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    #hbBtn.open .hb-bar:nth-child(2) { opacity: 0; width: 0; }
    #hbBtn.open .hb-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    @media (max-width: 767px) {
      #hbBtn { display: flex !important; }
    }

    /* ── Full-screen overlay backdrop ── */
    #mobMenu {
      position: fixed;
      inset: 0;
      z-index: 1050;
      display: flex;
      pointer-events: none;
    }
    #mobMenu.open { pointer-events: all; }

    /* Dimmed backdrop */
    #mobMenu::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(3px);
      opacity: 0;
      transition: opacity 0.35s ease;
    }
    #mobMenu.open::before { opacity: 1; }

    /* Slide-in drawer panel */
    .mob-drawer {
      position: absolute;
      top: 0;
      right: 0;
      width: min(300px, 80vw);
      height: 100%;
      background: var(--surface, #0d1117);
      border-left: 1px solid rgba(0,180,204,0.18);
      box-shadow: -8px 0 40px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      padding: 0;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
      overflow-y: auto;
    }
    #mobMenu.open .mob-drawer { transform: translateX(0); }

    /* Drawer header */
    .mob-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 18px;
      border-bottom: 1px solid rgba(0,180,204,0.12);
    }
    .mob-drawer-logo {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.06em;
      background: linear-gradient(90deg, var(--teal,#00b4cc), var(--green,#4caf50));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    #mobClose {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid rgba(0,180,204,0.2);
      border-radius: 8px;
      background: transparent;
      cursor: pointer;
      color: var(--txt-d, #8b9dc3);
      font-size: 18px;
      transition: all 0.2s;
      line-height: 1;
    }
    #mobClose:hover {
      border-color: var(--teal, #00b4cc);
      color: var(--teal, #00b4cc);
      background: rgba(0,180,204,0.08);
    }

    /* Nav links list */
    .mob-nav-list {
      display: flex;
      flex-direction: column;
      padding: 16px 0;
      gap: 2px;
    }
    .mob-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 24px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--txt-d, #8b9dc3);
      text-decoration: none;
      border-radius: 0;
      transition: all 0.2s;
      position: relative;
    }
    .mob-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%) scaleY(0);
      width: 3px;
      height: 60%;
      background: var(--teal, #00b4cc);
      border-radius: 0 3px 3px 0;
      transition: transform 0.2s ease;
    }
    .mob-link:hover {
      color: var(--txt, #e8f4f8);
      background: rgba(0,180,204,0.07);
      padding-left: 30px;
    }
    .mob-link:hover::before { transform: translateY(-50%) scaleY(1); }

    .mob-link .mob-link-icon {
      font-size: 17px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    /* Divider */
    .mob-divider {
      height: 1px;
      background: rgba(0,180,204,0.1);
      margin: 8px 24px;
    }

    /* Footer tag inside drawer */
    .mob-drawer-footer {
      margin-top: auto;
      padding: 20px 24px;
      border-top: 1px solid rgba(0,180,204,0.1);
      font-size: 11px;
      color: var(--txt-d, #8b9dc3);
      opacity: 0.7;
      letter-spacing: 0.04em;
    }
  `;
  document.head.appendChild(style);

  /* Build the drawer HTML if mobMenu exists but is empty / missing proper structure */
  const mob = document.getElementById('mobMenu');
  if (!mob) return;

  /* Only inject drawer if there isn't one already */
  if (!mob.querySelector('.mob-drawer')) {
    mob.innerHTML = `
      <div class="mob-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div class="mob-drawer-header">
          <span class="mob-drawer-logo">BDOH</span>
          <button id="mobClose" aria-label="Close menu">&#x2715;</button>
        </div>
        <nav class="mob-nav-list">
          <a href="#home"       class="mob-link"><span class="mob-link-icon">🏠</span>Home</a>
          <a href="#about"      class="mob-link"><span class="mob-link-icon">ℹ️</span>About</a>
          <a href="#practice"   class="mob-link"><span class="mob-link-icon">📐</span>Practice</a>
          <a href="#contests"   class="mob-link"><span class="mob-link-icon">🏆</span>Contests</a>
          <a href="#president"  class="mob-link"><span class="mob-link-icon">👤</span>President</a>
          <div class="mob-divider"></div>
          <a href="#community"  class="mob-link"><span class="mob-link-icon">🤝</span>Community</a>
          <a href="#social"     class="mob-link"><span class="mob-link-icon">💬</span>Social</a>
          <a href="#news"       class="mob-link"><span class="mob-link-icon">📰</span>News</a>
        </nav>
        <div class="mob-drawer-footer">Bangladesh Olympiadians Hub</div>
      </div>`;
  }

  /* Ensure hamburger button has proper bar markup */
  const hb = document.getElementById('hbBtn');
  if (hb && !hb.querySelector('.hb-lines')) {
    hb.innerHTML = `<span class="hb-lines"><span class="hb-bar"></span><span class="hb-bar"></span><span class="hb-bar"></span></span>`;
    hb.setAttribute('aria-label', 'Open menu');
    hb.setAttribute('aria-expanded', 'false');
  }

  function openMenu(){
    mob.classList.add('open');
    if(hb){ hb.classList.add('open'); hb.setAttribute('aria-expanded','true'); }
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    mob.classList.remove('open');
    if(hb){ hb.classList.remove('open'); hb.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
  }

  if(hb) hb.addEventListener('click', openMenu);

  /* Re-bind close button (may have been recreated) */
  mob.addEventListener('click', e => {
    if(e.target.id === 'mobClose' || e.target.closest('#mobClose')) closeMenu();
  });

  /* Close on backdrop click (outside drawer) */
  mob.addEventListener('click', e => {
    if(!e.target.closest('.mob-drawer')) closeMenu();
  });

  /* Close on link click */
  mob.querySelectorAll('.mob-link').forEach(a => a.addEventListener('click', closeMenu));

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && mob.classList.contains('open')) closeMenu();
  });
})();
