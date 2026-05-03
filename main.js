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
  const hb=document.getElementById('hbBtn')||document.querySelector('.hamburger');
  const mob=document.querySelector('.mob-menu');
  const close=document.querySelector('.mob-close');
  if(!hb||!mob) return;

  /* Inject top-pad header if not already present */
  if(!mob.querySelector('.mob-menu-top-pad')){
    const pad=document.createElement('div');
    pad.className='mob-menu-top-pad';
    mob.insertBefore(pad,mob.firstChild);
  }

  /* Create backdrop if not present */
  let backdrop=document.querySelector('.mob-menu-backdrop');
  if(!backdrop){
    backdrop=document.createElement('div');
    backdrop.className='mob-menu-backdrop';
    document.body.appendChild(backdrop);
  }

  function openMenu(){
    mob.classList.add('open');
    hb.classList.add('open');
    hb.setAttribute('aria-expanded','true');
    backdrop.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeMenu(){
    mob.classList.remove('open');
    hb.classList.remove('open');
    hb.setAttribute('aria-expanded','false');
    backdrop.classList.remove('open');
    document.body.style.overflow='';
  }

  hb.addEventListener('click',openMenu);
  if(close) close.addEventListener('click',closeMenu);
  backdrop.addEventListener('click',closeMenu);
  document.querySelectorAll('.mob-link').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
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
function renderContests(contests){
  const box=document.getElementById('contestBox');
  if(!box) return;

  /* Use passed-in contests, or fall back to BDOH.contests */
  const list = contests || BDOH.contests || [];

  const BADGE={
    live:`<span class="badge b-live" role="status">🔴 Live now — Enter</span>`,
    open:`<span class="badge b-open">✅ Open — Enter Now</span>`,
    soon:`<span class="badge b-soon">⏳ Opens soon</span>`,
    past:`<span class="badge b-past">Ended</span>`
  };

  function isEnterable(c){ return c.status==='live'||c.status==='open'; }

  function fmtDate(c){
    const src=c.openTime||c.date||'';
    if(!src) return {d:'--',m:'---'};
    const d=new Date(src);
    if(isNaN(d)) return {d:'--',m:'---'};
    return {
      d:d.getDate().toString().padStart(2,'0'),
      m:d.toLocaleString('en-US',{month:'short'}).toUpperCase()
    };
  }

  const qCount=(c)=>(c.questions||[]).length||c.problems||0;
  const tags=(c)=>(c.tags||[]);

  if(list.length===0){
    box.innerHTML='<p style="text-align:center;color:var(--txt-d);padding:40px 0;font-family:var(--fH)">No contests available right now. Check back soon!</p>';
    return;
  }

  box.innerHTML=list.map((c,i)=>{
    const dt=fmtDate(c);
    const enterable=isEnterable(c);
    const examURL=`exam.html?id=${c.id}`;
    const clickAttr=enterable
      ?`onclick="window.location.href='${examURL}'" onkeydown="if(event.key==='Enter')window.location.href='${examURL}'" style="cursor:pointer"`
      :`style="cursor:default;opacity:0.8"`;

    return `<div class="con-card reveal rd${i%3+1}" role="listitem" tabindex="${enterable?0:-1}"
               aria-label="${c.title}${enterable?' — Click to enter':''}" ${clickAttr}>
      <div class="con-left">
        <div class="con-date" ${c.status==='live'?'style="background:rgba(239,68,68,.15)"':''}>
          <div class="con-day" ${c.status==='live'?'style="color:#f87171;-webkit-text-fill-color:#f87171"':''}>${dt.d}</div>
          <div class="con-mon">${dt.m}</div>
        </div>
        <div class="con-info">
          <h4>${c.title}</h4>
          <p>${c.duration} min &nbsp;·&nbsp; ${qCount(c)} questions &nbsp;·&nbsp; ${c.level||c.subject||''}</p>
          <div class="con-tags">${tags(c).map(t=>`<span class="con-tag">${t}</span>`).join('')}</div>
        </div>
      </div>
      ${BADGE[c.status]||''}
    </div>`;
  }).join('');
  reObserve();
}

/* ── Problems — state tracking ── */
let _subjectFilter = 'All';
let _diffFilter    = 'All';

/* Called by bdoh:authReady to load solved/attempted sets from Firestore */
window._practiceStatus = {}; /* { problemId: 'solved'|'attempted' } */

async function loadPracticeStatus(){
  const uid = BDOH.currentUser?.uid;
  if(!uid || !window.BDOH_DB) return;
  try {
    const subs = await window.BDOH_DB.getUserSubmissions(uid);
    const status = {};
    /* Walk newest-first so first occurrence wins */
    subs.forEach(s => {
      const pid = s.problem_id || s.problemId;
      if(!pid || s.contestId !== 'practice') return;
      if(!status[pid]) status[pid] = s.isCorrect ? 'solved' : 'attempted';
      else if(s.isCorrect) status[pid] = 'solved'; /* upgrade attempted → solved */
    });
    window._practiceStatus = status;
  } catch(_){}
  renderProblems();
}

/* ── streak tracking ── */
function updateStreak(){
  const uid = BDOH.currentUser?.uid;
  if(!uid) return;
  const key    = 'bdoh_streak_' + uid;
  const today  = new Date().toISOString().slice(0,10);
  let data;
  try { data = JSON.parse(localStorage.getItem(key) || 'null'); } catch(_){ data=null; }
  if(!data) data = { days:0, lastDate:'' };
  /* Only count once per day */
  if(data.lastDate === today) return data.days;
  const yesterday = new Date(Date.now()-864e5).toISOString().slice(0,10);
  data.days = data.lastDate === yesterday ? data.days + 1 : 1;
  data.lastDate = today;
  localStorage.setItem(key, JSON.stringify(data));
  return data.days;
}
function readStreak(){
  const uid = BDOH.currentUser?.uid; if(!uid) return 0;
  try { return JSON.parse(localStorage.getItem('bdoh_streak_'+uid)||'null')?.days || 0; } catch(_){ return 0; }
}
function showStreakPill(){
  const days = readStreak();
  const pill = document.getElementById('streakPill');
  const cnt  = document.getElementById('streakCount');
  if(!pill) return;
  if(BDOH.currentUser && days > 0){
    if(cnt) cnt.textContent = days;
    pill.style.display = 'flex';
  } else {
    pill.style.display = 'none';
  }
}

/* ── +pts toast ── */
function showPtsToast(pts, correct){
  let el = document.getElementById('_ptsToast');
  if(!el){
    el = document.createElement('div');
    el.id = '_ptsToast';
    el.className = 'pts-toast';
    document.body.appendChild(el);
  }
  if(correct && pts){
    el.textContent = '+' + pts + ' pts';
  } else if(correct){
    el.textContent = 'Correct!';
  } else {
    el.style.background = 'rgba(239,68,68,.85)';
    el.textContent = 'Not quite — review the solution';
  }
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove('show');
    el.style.background = '';
  }, 2600);
}

/* ── renderProblems — full version with status, search, difficulty ── */
function renderProblems(){
  const box = document.getElementById('probBox');
  if(!box) return;

  const search = (document.getElementById('probSearch')?.value || '').toLowerCase().trim();
  const DM = {Easy:'d-easy', Medium:'d-med', Hard:'d-hard', Expert:'d-hard'};

  let list = [...BDOH.problems];

  /* Subject filter */
  if(_subjectFilter !== 'All') list = list.filter(p => p.subject === _subjectFilter);

  /* Difficulty filter */
  if(_diffFilter !== 'All') list = list.filter(p => p.difficulty === _diffFilter);

  /* Search filter */
  if(search) list = list.filter(p =>
    p.title.toLowerCase().includes(search) ||
    p.subject.toLowerCase().includes(search) ||
    (p.statement||'').toLowerCase().includes(search)
  );

  /* Update count label */
  const countEl = document.getElementById('probCount');
  if(countEl) countEl.textContent = list.length + ' problem' + (list.length !== 1 ? 's' : '');

  if(!list.length){
    box.innerHTML = `<div class="prob-empty">
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      No problems match your filters
    </div>`;
    return;
  }

  box.innerHTML = list.map((p, i) => {
    const status = window._practiceStatus[p.id] || 'unseen';
    const successRate = p.solves && p.attempts ? Math.round(p.solves / p.attempts * 100) : Math.round(60 + Math.random()*35);
    const statusBadge = status === 'solved'
      ? `<span class="prob-status-badge solved">&#10003; Solved</span>`
      : status === 'attempted'
      ? `<span class="prob-status-badge attempted">Attempted</span>`
      : '';
    return `
    <div class="prob-card status-${status} reveal rd${i%3+1}" role="listitem"
         onclick="openExam('${p.id}')" tabindex="0"
         onkeydown="if(event.key==='Enter')openExam('${p.id}')"
         aria-label="Open problem: ${p.title}">
      ${statusBadge}
      <div class="prob-top">
        <span class="d-badge ${DM[p.difficulty]||'d-med'}">${p.difficulty}</span>
        <span class="p-subj">${p.subject}</span>
      </div>
      <div class="p-title">${p.title}</div>
      <div class="p-stmt">${(p.statement||'').slice(0,108)}…</div>
      <div class="p-success-bar"><div class="p-success-fill" style="width:${successRate}%"></div></div>
      <div class="p-foot">
        <span class="p-meta">${p.timeMin} min &nbsp;·&nbsp; ${(p.solves||0).toLocaleString()} solves &nbsp;·&nbsp; ${successRate}% success</span>
        <button class="p-start-btn" aria-label="Start ${p.title}">
          ${status === 'solved' ? 'Redo' : status === 'attempted' ? 'Retry' : 'Start'}
          <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor"><path d="M4 2l5 4-5 4V2z"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
  reObserve();
}

/* ── filter setters called from HTML ── */
window.setSubjectFilter = function(subj){
  _subjectFilter = subj;
  document.querySelectorAll('.f-btn').forEach(b => b.classList.toggle('active', b.dataset.f === subj));
  renderProblems();
};
window.setDiffFilter = function(diff){
  _diffFilter = diff;
  document.querySelectorAll('.d-btn').forEach(b => b.classList.toggle('active', b.dataset.d === diff));
  renderProblems();
};
window.filterProblems = renderProblems; /* called by search input oninput */

/* keep old filterTo working for any legacy calls */
window.filterTo = function(subject){ window.setSubjectFilter(subject); };


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
  const DM={Easy:'d-easy',Medium:'d-med',Hard:'d-hard',Expert:'d-hard'};
  document.getElementById('examSubj').textContent=p.subject.toUpperCase();
  document.getElementById('examTitle').textContent=p.title;
  document.getElementById('examStmt').textContent=p.statement;
  document.getElementById('examPts').textContent=`${p.points} pts`;
  const diff=document.getElementById('examDiff');
  diff.textContent=p.difficulty;
  diff.className='exam-diff-badge '+(DM[p.difficulty]||'d-med');

  /* Success rate and solve count */
  const successRate = p.solves && p.attempts ? Math.round(p.solves/p.attempts*100) : null;
  const metaParts = [`${p.timeMin} min`, `${(p.solves||0).toLocaleString()} solves`];
  if(successRate) metaParts.push(`${successRate}% success rate`);
  document.getElementById('examMeta').textContent = metaParts.join(' · ');

  /* Solved banner */
  const status = window._practiceStatus?.[p.id] || 'unseen';
  let bannerEl = document.getElementById('examSolvedBanner');
  if(!bannerEl){
    bannerEl = document.createElement('div');
    bannerEl.id = 'examSolvedBanner';
    bannerEl.className = 'exam-solved-banner';
    const stmt = document.getElementById('examStmt');
    if(stmt && stmt.parentNode) stmt.parentNode.insertBefore(bannerEl, stmt);
  }
  if(status === 'solved'){
    bannerEl.style.display = 'flex';
    bannerEl.innerHTML = `<svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> You solved this before — try it again or skip ahead`;
  } else if(status === 'attempted'){
    bannerEl.style.display = 'flex';
    bannerEl.style.background = 'rgba(255,215,0,.1)';
    bannerEl.style.borderColor = 'rgba(255,215,0,.3)';
    bannerEl.style.color = '#FFD700';
    bannerEl.innerHTML = `<svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg> You attempted this before — give it another shot`;
  } else {
    bannerEl.style.display = 'none';
  }

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
  if(!p){ console.warn('revealSolution: no problem found for id',_examId); return; }

  const locked=document.getElementById('solutionLocked');
  const sc=document.getElementById('solutionContent');
  if(!locked||!sc){ console.warn('revealSolution: DOM elements missing'); return; }

  locked.style.display='none';

  /* Build solution HTML with fully explicit inline colors so theme variables don't hide text */
  sc.innerHTML=`
    <p style="font-family:var(--fH);font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--txt-d);margin-bottom:14px;">Full Solution</p>
    <p style="font-size:14.5px;color:var(--txt);line-height:1.78;white-space:pre-wrap;word-break:break-word;overflow-wrap:break-word;">${p.solution}</p>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--bd);display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <span style="font-family:var(--fH);font-size:12px;color:var(--txt-d);">Expected answer:</span>
      <strong style="font-family:var(--fH);font-size:14px;color:var(--green);">${p.answer}</strong>
      ${p.tolerance>0?`<span style="font-size:12px;color:var(--txt-d);">(tolerance ±${p.tolerance})</span>`:''}
    </div>`;

  /* Force display — use individual property not cssText to avoid clobbering */
  sc.style.display='block';
  sc.style.width='100%';
  sc.style.boxSizing='border-box';
  sc.style.overflowWrap='break-word';
  sc.style.wordBreak='break-word';
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
  renderProblems();
  renderWA();

  /* Show loading placeholder for contests while Firestore loads */
  const box=document.getElementById('contestBox');
  if(box) box.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:14px">
      ${[1,2,3].map(()=>`
        <div style="background:var(--sf);border:1px solid var(--bd);border-radius:14px;padding:20px 24px;
             display:flex;gap:18px;align-items:center;animation:pulse 1.6s ease-in-out infinite">
          <div style="width:56px;height:56px;border-radius:12px;background:rgba(255,255,255,.07);flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <div style="height:16px;border-radius:6px;background:rgba(255,255,255,.07);width:65%"></div>
            <div style="height:12px;border-radius:6px;background:rgba(255,255,255,.05);width:45%"></div>
          </div>
        </div>`).join('')}
    </div>`;

  /* Subscribe to real-time Firestore updates — fires on every device instantly */
  if(window.BDOH_DB){
    window.BDOH_DB.onContestsChange(contests=>{
      renderContests(contests);
      /* Cache locally so page works offline after first load */
      try{ localStorage.setItem('bdoh_contests_cache', JSON.stringify(contests)); }catch(_){}
    });
  } else {
    /* Firestore not ready yet — wait for it */
    bdohFirebaseReady(()=>{
      if(window.BDOH_DB){
        window.BDOH_DB.onContestsChange(contests=>{
          renderContests(contests);
          try{ localStorage.setItem('bdoh_contests_cache', JSON.stringify(contests)); }catch(_){}
        });
      } else {
        /* Full offline fallback — use cached data */
        try{
          const cached=JSON.parse(localStorage.getItem('bdoh_contests_cache')||'[]');
          renderContests(cached);
        }catch(_){ renderContests([]); }
      }
    });
  }
});

/* ════════════════════════════════════════════════════════════════
   11. MOBILE MENU — handled by section 4 above
════════════════════════════════════════════════════════════════ */
/* Section 11 removed — mobile menu is fully managed by initMob() in section 4. */

/* ================================================================
   🔧 SURGERY — main.js

   PLACEMENT: Append this ENTIRE block at the very END of main.js,
   after the closing of Section 11 comment block.

   It uses Firebase v10 Modular SDK loaded via ESM <script type="module">
   in index.html — see NOTE below for the required script tag.
================================================================ */

// ════════════════════════════════════════════════════════════════
// 🔧 SURGERY START
// SECTION 12 — AUTH + PROFILE + PRACTICE (Firebase v10 Modular)
// ════════════════════════════════════════════════════════════════

/* ── NOTE: Add this <script type="module"> just before </body> ──
   (AFTER the auth modal HTML added in index.html surgery)

<script type="module">
  // Re-use the app already initialised by data.js if it exists.
  // data.js uses BDOH_FIREBASE_CONFIG and window.BDOH_APP_INSTANCE.
  import { initializeApp, getApps, getApp }
    from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
    from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
  import { getFirestore, doc, getDoc, setDoc, collection,
           addDoc, query, where, orderBy, limit, getDocs, serverTimestamp }
    from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

  const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyBHl3ysjKWoQjJMOCtAPdfiURsXjjuRjck",
    authDomain:        "bdoh-project.firebaseapp.com",
    projectId:         "bdoh-project",
    storageBucket:     "bdoh-project.firebasestorage.app",
    messagingSenderId: "413106966781",
    appId:             "1:413106966781:web:f3123769a8d2cec02e2e94"
  };

  const app  = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  // ── Expose to window so vanilla functions below can call them ──
  window._bdohAuth = auth;
  window._bdohDb   = db;
  window._bdohGoogleProvider = new GoogleAuthProvider();

  // ── Firebase functions exposed globally ──
  window._fbSignInWithPopup   = signInWithPopup;
  window._fbSignOut           = signOut;
  window._fbDoc               = doc;
  window._fbGetDoc            = getDoc;
  window._fbSetDoc            = setDoc;
  window._fbCollection        = collection;
  window._fbAddDoc            = addDoc;
  window._fbQuery             = query;
  window._fbWhere             = where;
  window._fbOrderBy           = orderBy;
  window._fbLimit             = limit;
  window._fbGetDocs           = getDocs;
  window._fbServerTimestamp   = serverTimestamp;

  // ── Auth state listener ──
  onAuthStateChanged(auth, user => {
    window._bdohCurrentUser = user || null;
    if (user) {
      bdohOnSignedIn(user);
    } else {
      bdohOnSignedOut();
    }
  });
</script>
──────────────────────────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════════════
   12a. AUTH — Modal helpers
════════════════════════════════════════════════════════════════ */

window.bdohOpenAuthModal = function () {
  document.getElementById('authModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authLoading').style.display = 'none';
};

window.bdohCloseAuthModal = function () {
  document.getElementById('authModal').classList.remove('open');
  document.body.style.overflow = '';
};

// Close on backdrop click
document.getElementById('authModal')?.addEventListener('click', function (e) {
  if (e.target === this) window.bdohCloseAuthModal();
});

/* ── Google sign-in ── */
window.bdohGoogleSignIn = async function () {
  const errEl  = document.getElementById('authError');
  const loadEl = document.getElementById('authLoading');
  const btn    = document.getElementById('googleSignInBtn');

  errEl.style.display  = 'none';
  loadEl.style.display = 'flex';
  btn.disabled = true;

  try {
    const result = await window._fbSignInWithPopup(
      window._bdohAuth,
      window._bdohGoogleProvider
    );
    // onAuthStateChanged will fire → bdohOnSignedIn()
    window.bdohCloseAuthModal();
  } catch (err) {
    loadEl.style.display = 'none';
    btn.disabled = false;
    errEl.textContent = 'Sign-in failed: ' + (err.message || err.code);
    errEl.style.display = 'block';
  }
};

/* ── Sign out ── */
window.bdohSignOut = async function () {
  try {
    await window._fbSignOut(window._bdohAuth);
  } catch (_) {}
};

/* ════════════════════════════════════════════════════════════════
   12b. AUTH — State handlers
════════════════════════════════════════════════════════════════ */

window.bdohOnSignedIn = async function (user) {
  // Update nav button
  const btn   = document.getElementById('authNavBtn');
  const label = document.getElementById('authNavLabel');
  if (btn && label) {
    label.textContent = user.displayName?.split(' ')[0] || 'Me';
    btn.onclick = () => {
      document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Show profile nav links
  document.getElementById('profileNavLink')?.style.setProperty('display', 'inline-block');
  document.getElementById('mobProfileLink')?.style.setProperty('display', 'block');

  // Show profile section
  const profileSection = document.getElementById('profile');
  if (profileSection) profileSection.style.display = '';

  // Ensure Firestore user doc exists
  await bdohEnsureUserDoc(user);

  // Fetch & render profile
  await bdohRenderProfile(user);

  /* ── Practice enhancements ── */
  await loadPracticeStatus();  /* load solved/attempted card status */
  showStreakPill();             /* show streak counter */
};

window.bdohOnSignedOut = function () {
  // Reset nav button
  const btn   = document.getElementById('authNavBtn');
  const label = document.getElementById('authNavLabel');
  if (btn && label) {
    label.textContent = 'Sign In';
    btn.onclick = () => window.bdohOpenAuthModal();
  }

  // Hide profile nav links
  document.getElementById('profileNavLink')?.style.setProperty('display', 'none');
  document.getElementById('mobProfileLink')?.style.setProperty('display', 'none');

  // Hide profile section
  const profileSection = document.getElementById('profile');
  if (profileSection) profileSection.style.display = 'none';
};

/* ════════════════════════════════════════════════════════════════
   12c. FIRESTORE — User document
════════════════════════════════════════════════════════════════ */

async function bdohEnsureUserDoc(user) {
  if (!window._bdohDb) return;
  const db  = window._bdohDb;
  const ref = window._fbDoc(db, 'users', user.uid);
  const snap = await window._fbGetDoc(ref);

  if (!snap.exists()) {
    // Create new user document
    await window._fbSetDoc(ref, {
      uid:         user.uid,
      name:        user.displayName || 'Olympiadian',
      email:       user.email || '',
      avatar:      user.photoURL || '',
      rating:      1200,
      solved_count: 0,
      total_attempts: 0,
      createdAt:   window._fbServerTimestamp()
    });
  }
}

async function bdohGetUserDoc(uid) {
  if (!window._bdohDb) return null;
  const ref  = window._fbDoc(window._bdohDb, 'users', uid);
  const snap = await window._fbGetDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/* ════════════════════════════════════════════════════════════════
   12d. PROFILE — Render
════════════════════════════════════════════════════════════════ */

async function bdohRenderProfile(user) {
  const data = await bdohGetUserDoc(user.uid);
  if (!data) return;

  // Avatar
  const avatarEl = document.getElementById('profileAvatar');
  const avatarPh = document.getElementById('profileAvatarPlaceholder');
  if (avatarEl && data.avatar) {
    avatarEl.src = data.avatar;
    avatarEl.onload = () => avatarEl.classList.add('loaded');
    if (avatarPh) avatarPh.style.display = 'none';
  } else if (avatarPh) {
    avatarPh.textContent = (data.name || '?')[0].toUpperCase();
  }

  // Text fields
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('profileName',    data.name  || '—');
  set('profileEmail',   data.email || '—');
  set('profileRating',  data.rating ?? 1200);
  set('profileSolved',  data.solved_count ?? 0);

  // Accuracy
  const attempts = data.total_attempts ?? 0;
  const solved   = data.solved_count   ?? 0;
  const acc = attempts > 0 ? Math.round((solved / attempts) * 100) + '%' : '—%';
  set('profileAccuracy', acc);

  // Recent submissions
  await bdohRenderRecentSubmissions(user.uid);
}

async function bdohRenderRecentSubmissions(uid) {
  const box = document.getElementById('profileSubmissions');
  if (!box || !window._bdohDb) return;

  try {
    const db  = window._bdohDb;
    const q   = window._fbQuery(
      window._fbCollection(db, 'submissions'),
      window._fbWhere('user_id', '==', uid),
      window._fbOrderBy('timestamp', 'desc'),
      window._fbLimit(5)
    );
    const snap = await window._fbGetDocs(q);

    if (snap.empty) {
      box.innerHTML = '<p style="color:var(--txt-d);font-size:14px;padding:20px 0">No submissions yet. Start solving problems!</p>';
      return;
    }

    box.innerHTML = snap.docs.map(d => {
      const s = d.data();
      const ts = s.timestamp?.toDate
        ? s.timestamp.toDate().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
        : '—';
      const badgeCls = s.status === 'correct' ? 'psb-correct' : 'psb-wrong';
      const badgeTxt = s.status === 'correct' ? '✓ Correct' : '✗ Wrong';
      return `
        <div class="profile-sub-item">
          <div>
            <div class="profile-sub-title">${s.problem_title || s.problem_id || 'Problem'}</div>
            <div class="profile-sub-meta">${ts}</div>
          </div>
          <span class="profile-sub-badge ${badgeCls}">${badgeTxt}</span>
        </div>`;
    }).join('');
  } catch (err) {
    console.warn('BDOH: could not load submissions', err);
    box.innerHTML = '<p style="color:var(--txt-d);font-size:14px;padding:20px 0">Could not load submissions.</p>';
  }
}

/* ════════════════════════════════════════════════════════════════
   PRACTICE — save submission, update card status, show toast, streak
   Uses BDOH_DB.savePracticeSubmission — the correct v4 API.
════════════════════════════════════════════════════════════════ */
(function patchSubmitAnswer(){
  const _orig = window.submitAnswer;
  if(typeof _orig !== 'function'){
    console.warn('BDOH: submitAnswer not found — practice save disabled');
    return;
  }

  window.submitAnswer = function(){
    /* 1. Run original (shows feedback, disables input) */
    _orig.call(this);

    /* 2. Fire async save without blocking UI */
    (async () => {
      /* Give the original 100ms to set _answered and disable input */
      await new Promise(r => setTimeout(r, 100));

      const p = BDOH.problems.find(x => x.id === _examId);
      if(!p) return;

      const raw = document.getElementById('examInput')?.value?.trim() || '';
      if(!raw) return;

      /* Evaluate correctness — same logic as original submitAnswer */
      const val  = parseFloat(raw);
      const exp  = parseFloat(p.answer);
      const isOk = p.tolerance === 0
        ? (raw === p.answer || (!isNaN(val) && val === exp))
        : (!isNaN(val) && Math.abs(val - exp) <= p.tolerance);

      /* Show +pts toast regardless of sign-in state */
      showPtsToast(p.points, isOk);

      /* Only save to Firestore if user is signed in */
      if(!BDOH.currentUser || !window.BDOH_DB) return;

      try {
        await window.BDOH_DB.savePracticeSubmission(p.id, isOk, raw);

        /* Update local card status cache */
        const prev = window._practiceStatus[p.id];
        if(isOk) window._practiceStatus[p.id] = 'solved';
        else if(prev !== 'solved') window._practiceStatus[p.id] = 'attempted';

        /* Record streak on correct solve */
        if(isOk){
          const days = updateStreak();
          showStreakPill();
          /* Show streak milestone toast if newly extended */
          if(days > 1){
            setTimeout(() => showPtsToast(null, true, `${days}-day streak!`), 2800);
          }
        }

        /* Re-render cards to show updated status border */
        renderProblems();

      } catch(err){
        console.warn('BDOH practice save error:', err);
      }
    })();
  };
})();

/* Extended showPtsToast that accepts optional custom message */
const _basePtsToast = showPtsToast;
showPtsToast = function(pts, correct, customMsg){
  let el = document.getElementById('_ptsToast');
  if(!el){
    el = document.createElement('div');
    el.id = '_ptsToast';
    el.className = 'pts-toast';
    document.body.appendChild(el);
  }
  if(customMsg){
    el.textContent = customMsg;
    el.style.background = 'linear-gradient(135deg,#007B8F,#4CAF50)';
  } else if(correct && pts){
    el.textContent = '+' + pts + ' pts';
    el.style.background = 'linear-gradient(135deg,#007B8F,#4CAF50)';
  } else if(correct){
    el.textContent = 'Correct!';
    el.style.background = 'linear-gradient(135deg,#007B8F,#4CAF50)';
  } else {
    el.textContent = 'Not quite — check the solution below';
    el.style.background = 'rgba(239,68,68,.85)';
  }
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove('show');
  }, 2800);
};
