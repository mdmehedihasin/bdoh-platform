/* ================================================================
   BDOH AUTH.JS v4.2 — CLEAN FINAL
   ─────────────────────────────────────────────────────────────
   FIXES:
   • Only ONE sign-in button or ONE profile pill ever shown
   • No duplicate elements — works alongside profile-patch.js
   • auth.js owns #navAuthWrap ONLY
   • profile-patch.js owns #profileNavBtn, #mobProfileNavLink
   • Fast — no redundant Firestore calls
   • Admin panel: only superadmin/admin can log in
================================================================ */
'use strict';

/* ── Inject modal + styles once ── */
(function(){
  if(document.getElementById('bdohAuthModal')) return; /* already injected */

  const STYLES = `<style id="bdoh-auth-css">
/* ── Auth modal ── */
#bdohAuthModal{position:fixed;inset:0;background:rgba(6,9,26,.88);
  backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);
  z-index:9000;display:none;align-items:center;justify-content:center;padding:16px}
#bdohAuthModal.open{display:flex}
.bam-box{background:#0d1420;border:1px solid rgba(0,180,204,.22);border-radius:22px;
  padding:38px 34px;width:100%;max-width:420px;position:relative;
  animation:bamIn .3s cubic-bezier(.34,1.56,.64,1) both}
@keyframes bamIn{from{opacity:0;transform:scale(.9) translateY(16px)}to{opacity:1;transform:none}}
.bam-close{position:absolute;top:14px;right:14px;width:30px;height:30px;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);
  border-radius:7px;color:rgba(232,237,245,.5);font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .18s;line-height:1}
.bam-close:hover{background:rgba(239,68,68,.15);color:#f87171}
.bam-logo{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.bam-logo-icon{width:40px;height:40px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#007B8F,#4CAF50);display:flex;align-items:center;
  justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;color:#fff;font-size:14px}
.bam-logo-name{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:13px;color:#e8edf5;line-height:1.3}
.bam-logo-sub{font-size:11px;color:rgba(232,237,245,.4);margin-top:2px}
.bam-tabs{display:flex;background:rgba(255,255,255,.05);border-radius:10px;padding:3px;margin-bottom:18px}
.bam-tab{flex:1;padding:9px 8px;border-radius:8px;border:none;cursor:pointer;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;
  color:rgba(232,237,245,.45);background:none;transition:all .2s}
.bam-tab.on{background:rgba(0,180,204,.2);color:#e8edf5}
.bam-err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.28);
  color:#f87171;border-radius:9px;padding:10px 14px;font-size:13px;
  margin-bottom:14px;display:none;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.5}
.bam-google{width:100%;padding:12px;background:rgba(255,255,255,.06);
  border:1px solid rgba(0,180,204,.2);border-radius:11px;
  color:#e8edf5;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
  transition:all .2s;margin-bottom:16px}
.bam-google:hover{background:rgba(0,180,204,.1);border-color:rgba(0,180,204,.4)}
.bam-google:disabled{opacity:.55;cursor:not-allowed}
.bam-div{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.bam-div::before,.bam-div::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.07)}
.bam-div span{font-size:11px;color:rgba(232,237,245,.3);font-family:'Plus Jakarta Sans',sans-serif}
.bam-lbl{display:block;font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;
  text-transform:uppercase;letter-spacing:1.2px;color:rgba(232,237,245,.4);margin-bottom:5px}
.bam-inp{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
  border-radius:9px;padding:11px 14px;font-size:14px;color:#e8edf5;outline:none;
  font-family:'DM Sans',sans-serif;transition:border-color .2s;margin-bottom:12px}
.bam-inp:focus{border-color:#007B8F;box-shadow:0 0 0 3px rgba(0,123,143,.18)}
.bam-inp::placeholder{color:rgba(232,237,245,.25)}
.bam-submit{width:100%;padding:13px;background:linear-gradient(135deg,#007B8F,#4CAF50);
  color:#fff;border:none;border-radius:11px;font-family:'Plus Jakarta Sans',sans-serif;
  font-size:14px;font-weight:800;cursor:pointer;margin-top:2px;
  box-shadow:0 5px 18px rgba(0,123,143,.3);transition:all .22s}
.bam-submit:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,123,143,.45)}
.bam-submit:disabled{opacity:.55;cursor:not-allowed;transform:none}
.bam-switch{text-align:center;font-size:12px;color:rgba(232,237,245,.38);margin-top:14px;
  font-family:'Plus Jakarta Sans',sans-serif}
.bam-switch a{color:#00b4cc;text-decoration:none}

/* ── Nav auth wrap outputs ── */
/* Sign-in button (when signed out) */
.bdoh-nav-signin{padding:8px 18px;border-radius:22px;
  background:linear-gradient(135deg,#007B8F,#4CAF50);color:#fff;border:none;
  font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;
  box-shadow:0 4px 14px rgba(0,123,143,.28);transition:all .22s;white-space:nowrap}
.bdoh-nav-signin:hover{transform:translateY(-1px);box-shadow:0 7px 20px rgba(0,123,143,.42)}

/* Profile pill (when signed in) — owned by auth.js for navAuthWrap */
.bdoh-nav-pill{display:flex;align-items:center;gap:8px;padding:5px 14px 5px 5px;
  border-radius:22px;border:1px solid rgba(0,123,143,.3);background:rgba(0,123,143,.1);
  color:#e8edf5;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;
  text-decoration:none;transition:all .22s;cursor:pointer}
.bdoh-nav-pill:hover{border-color:rgba(0,180,204,.5);background:rgba(0,123,143,.18);transform:translateY(-1px)}
.bdoh-nav-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;overflow:hidden;
  background:linear-gradient(135deg,#007B8F,#4CAF50);
  display:flex;align-items:center;justify-content:center;
  font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;color:#fff;font-size:12px}
.bdoh-nav-av img{width:100%;height:100%;object-fit:cover}
</style>`;

  const MODAL = `<div id="bdohAuthModal">
  <div class="bam-box">
    <button class="bam-close" onclick="BDOH_AUTH.close()" aria-label="Close">&#10005;</button>
    <div class="bam-logo">
      <div class="bam-logo-icon">BD</div>
      <div><div class="bam-logo-name">Bangladesh Olympiadians Hub</div>
        <div class="bam-logo-sub">Sign in to track your progress</div></div>
    </div>
    <div class="bam-tabs">
      <button class="bam-tab on" id="bam-tab-login" onclick="BDOH_AUTH.tab('login')">Sign In</button>
      <button class="bam-tab" id="bam-tab-reg" onclick="BDOH_AUTH.tab('reg')">Register</button>
    </div>
    <div class="bam-err" id="bamErr"></div>

    <!-- Google -->
    <button class="bam-google" id="bamGoogleBtn" onclick="BDOH_AUTH.google()">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.2H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.7-.4-3.8z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.5 26.7 36 24 36c-5.2 0-9.7-3.3-11.4-8H5.8C9.1 39.4 16 44 24 44z"/><path fill="#1976D2" d="M43.6 20.2H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C41.4 35.2 44 30 44 24c0-1.3-.1-2.7-.4-3.8z"/></svg>
      Continue with Google
    </button>
    <div class="bam-div"><span>or with email</span></div>

    <!-- Login panel -->
    <div id="bam-panel-login">
      <label class="bam-lbl">Email</label>
      <input class="bam-inp" id="bam-li-email" type="email" placeholder="you@example.com" autocomplete="email"/>
      <label class="bam-lbl">Password</label>
      <input class="bam-inp" id="bam-li-pass" type="password" placeholder="••••••••" autocomplete="current-password"
        onkeydown="if(event.key==='Enter')BDOH_AUTH.email()"/>
      <button class="bam-submit" id="bam-li-btn" onclick="BDOH_AUTH.email()">Sign In</button>
      <p class="bam-switch">No account? <a href="#" onclick="BDOH_AUTH.tab('reg');return false">Create one</a></p>
    </div>

    <!-- Register panel -->
    <div id="bam-panel-reg" style="display:none">
      <label class="bam-lbl">Full Name</label>
      <input class="bam-inp" id="bam-reg-name" type="text" placeholder="Your full name" autocomplete="name"/>
      <label class="bam-lbl">Email</label>
      <input class="bam-inp" id="bam-reg-email" type="email" placeholder="you@example.com" autocomplete="email"/>
      <label class="bam-lbl">Password</label>
      <input class="bam-inp" id="bam-reg-pass" type="password" placeholder="Min 6 characters" autocomplete="new-password"
        onkeydown="if(event.key==='Enter')BDOH_AUTH.register()"/>
      <button class="bam-submit" id="bam-reg-btn" onclick="BDOH_AUTH.register()">Create Account</button>
      <p class="bam-switch">Have an account? <a href="#" onclick="BDOH_AUTH.tab('login');return false">Sign in</a></p>
    </div>
  </div>
</div>`;

  /* Inject */
  document.head.insertAdjacentHTML('beforeend', STYLES);
  document.body.insertAdjacentHTML('beforeend', MODAL);

  /* Close on backdrop */
  document.getElementById('bdohAuthModal').addEventListener('click', e => {
    if(e.target.id === 'bdohAuthModal') BDOH_AUTH.close();
  });
})();

/* ── Render nav auth wrap (sign-in or profile pill) ── */
function _renderNavWrap(user, profile){
  const wrap = document.getElementById('navAuthWrap');
  if(!wrap) return;

  if(user){
    const name     = (profile?.displayName || user.displayName || user.email || 'User').split(' ')[0];
    const photoURL = profile?.photoURL || user.photoURL || '';
    const initial  = name.charAt(0).toUpperCase();

    wrap.innerHTML = `<a href="profile.html" class="bdoh-nav-pill" aria-label="My Profile">
      <span class="bdoh-nav-av">
        ${photoURL
          ? `<img src="${photoURL}" alt="${name}" crossorigin="anonymous"/>`
          : initial}
      </span>
      ${name}
    </a>`;

    /* Also update profile-patch.js targets (mobile menu pill) */
    const mobLink   = document.getElementById('mobProfileNavLink');
    const mobAvatar = document.getElementById('mobProfileAvatar');
    const mobName   = document.getElementById('mobProfileName');
    if(mobLink)   mobLink.style.display   = '';
    if(mobName)   mobName.textContent     = name;
    if(mobAvatar){
      if(photoURL) mobAvatar.innerHTML = `<img src="${photoURL}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
      else mobAvatar.textContent = initial;
    }

  } else {
    wrap.innerHTML = `<button class="bdoh-nav-signin" onclick="BDOH_AUTH.open()">Sign In</button>`;
    const mobLink = document.getElementById('mobProfileNavLink');
    if(mobLink) mobLink.style.display = 'none';
  }
}

/* ── Listen for auth state (fired by data.js onAuthStateChanged) ── */
window.addEventListener('bdoh:authReady', e => {
  _renderNavWrap(e.detail.user, e.detail.profile);
});

/* ── Also handle bdohOnSignedIn / bdohOnSignedOut from profile-patch.js
      We fire them ourselves so profile-patch.js works without changes ── */
const _origSignedIn  = window.bdohOnSignedIn;
const _origSignedOut = window.bdohOnSignedOut;

window.bdohOnSignedIn = async function(user){
  if(_origSignedIn) await _origSignedIn.call(this, user);
  /* navAuthWrap already handled by bdoh:authReady event above */
};
window.bdohOnSignedOut = function(){
  if(_origSignedOut) _origSignedOut.call(this);
};

/* ── Expose bdohOpenAuthModal for legacy buttons ── */
window.bdohOpenAuthModal = function(){ BDOH_AUTH.open(); };

/* ── Public API ── */
window.BDOH_AUTH = {
  open(tab){ this.tab(tab||'login'); document.getElementById('bdohAuthModal').classList.add('open'); document.body.style.overflow='hidden'; },
  close(){ document.getElementById('bdohAuthModal').classList.remove('open'); document.body.style.overflow=''; _clrErr(); },
  tab(name){
    const isLogin = name!=='reg';
    _el('bam-tab-login').classList.toggle('on',isLogin);
    _el('bam-tab-reg').classList.toggle('on',!isLogin);
    _el('bam-panel-login').style.display = isLogin?'block':'none';
    _el('bam-panel-reg').style.display   = !isLogin?'block':'none';
    _clrErr();
  },
  async google(){
    _clrErr();
    if(!window.BDOH_DB){ _showErr('Firebase not ready. Please wait.'); return; }
    const btn = _el('bamGoogleBtn');
    btn.disabled=true; btn.textContent='Opening…';
    try{
      await window.BDOH_DB.loginGoogle();
      this.close();
    }catch(e){
      if(e.code!=='auth/popup-closed-by-user') _showErr(_friendly(e.code));
      btn.disabled=false;
      btn.innerHTML=`<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.2H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.7-.4-3.8z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.5 26.7 36 24 36c-5.2 0-9.7-3.3-11.4-8H5.8C9.1 39.4 16 44 24 44z"/><path fill="#1976D2" d="M43.6 20.2H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C41.4 35.2 44 30 44 24c0-1.3-.1-2.7-.4-3.8z"/></svg> Continue with Google`;
    }
  },
  async email(){
    const email = _v('bam-li-email'), pass = _v('bam-li-pass');
    if(!email||!pass){ _showErr('Please fill in both fields.'); return; }
    if(!window.BDOH_DB){ _showErr('Firebase not ready. Please wait.'); return; }
    const btn = _el('bam-li-btn');
    btn.disabled=true; btn.textContent='Signing in…';
    try{
      await window.BDOH_DB.loginEmail(email, pass);
      this.close();
    }catch(e){
      _showErr(_friendly(e.code));
      btn.disabled=false; btn.textContent='Sign In';
    }
  },
  async register(){
    const name=_v('bam-reg-name'), email=_v('bam-reg-email'), pass=_v('bam-reg-pass');
    if(!name||!email||!pass){ _showErr('All fields are required.'); return; }
    if(pass.length<6){ _showErr('Password must be at least 6 characters.'); return; }
    if(!window.BDOH_DB){ _showErr('Firebase not ready. Please wait.'); return; }
    const btn = _el('bam-reg-btn');
    btn.disabled=true; btn.textContent='Creating account…';
    try{
      await window.BDOH_DB.register(email, pass, name);
      this.close();
    }catch(e){
      _showErr(_friendly(e.code));
      btn.disabled=false; btn.textContent='Create Account';
    }
  },
  async logout(){
    if(window.BDOH_DB) await window.BDOH_DB.logout();
    location.href='index.html';
  }
};

function _el(id){ return document.getElementById(id); }
function _v(id){ return (_el(id)||{}).value?.trim()||''; }
function _showErr(m){ const e=_el('bamErr'); if(e){e.textContent=m;e.style.display='block';} }
function _clrErr(){ const e=_el('bamErr'); if(e){e.textContent='';e.style.display='none';} }
function _friendly(code){
  return ({
    'auth/wrong-password':       'Incorrect password. Please try again.',
    'auth/invalid-credential':   'Incorrect email or password.',
    'auth/user-not-found':       'No account with this email.',
    'auth/email-already-in-use': 'This email is already registered. Sign in instead.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/too-many-requests':    'Too many attempts. Please wait a moment.',
    'auth/network-request-failed':'Network error. Check your connection.'
  }[code]) || 'Something went wrong. Please try again.';
}
