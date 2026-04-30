/* ================================================================
   BDOH AUTH.JS v4.1 — SYNCHRONIZED WITH profile.html
   ─────────────────────────────────────────────────────────────
   • Uses same Firebase ESM imports as profile.html
   • Fires window.bdohOnSignedIn / bdohOnSignedOut hooks
     (consumed by profile-patch.js in main.js)
   • Injects Sign-In button / user avatar pill into any page
     that has id="navAuthWrap" in its navbar
   • Dispatches 'bdoh:authReady' event (same as data.js)
   ─────────────────────────────────────────────────────────────
   INCLUDE ORDER (before </body> on any page):
     <script src="data.js"></script>
     <script src="auth.js"></script>
================================================================ */
'use strict';

(function injectAuthUI(){

  /* ── Auth modal HTML ── */
  const MODAL = `
<div id="bdohAuthModal" style="position:fixed;inset:0;background:rgba(7,11,16,.88);
  backdrop-filter:blur(20px);z-index:2000;display:none;align-items:center;
  justify-content:center;padding:20px" role="dialog" aria-modal="true">
  <div style="background:#0d1420;border:1px solid rgba(0,180,204,.25);border-radius:22px;
    padding:40px 36px;width:100%;max-width:420px;position:relative;
    animation:_authIn .32s cubic-bezier(.34,1.56,.64,1) both">
    <button onclick="BDOH_AUTH.close()" style="position:absolute;top:14px;right:14px;
      background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);
      color:rgba(232,237,245,.5);width:30px;height:30px;border-radius:7px;
      font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>

    <!-- Logo -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
      <div style="width:42px;height:42px;border-radius:50%;
        background:linear-gradient(135deg,#00b4cc,#4CAF50);display:flex;align-items:center;
        justify-content:center;font-family:'Syne',sans-serif;font-weight:800;color:#fff;font-size:14px">BD</div>
      <div>
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:#e8edf5">Bangladesh Olympiadians Hub</div>
        <div style="font-size:11px;color:rgba(232,237,245,.45);margin-top:2px">Sign in to track your progress</div>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex;background:rgba(255,255,255,.05);border-radius:11px;padding:3px;margin-bottom:20px">
      <button id="_tab_login" onclick="BDOH_AUTH.tab('login')"
        style="flex:1;padding:9px;border-radius:9px;font-family:'Syne',sans-serif;font-size:13px;
        font-weight:700;cursor:pointer;border:none;background:rgba(0,180,204,.2);color:#e8edf5">Sign In</button>
      <button id="_tab_reg" onclick="BDOH_AUTH.tab('register')"
        style="flex:1;padding:9px;border-radius:9px;font-family:'Syne',sans-serif;font-size:13px;
        font-weight:700;cursor:pointer;border:none;background:none;color:rgba(232,237,245,.45)">Register</button>
    </div>

    <div id="_authErr" style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);
      color:#f87171;border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:14px;
      display:none;font-family:'Syne',sans-serif"></div>

    <!-- Google button -->
    <button onclick="BDOH_AUTH.google()" style="width:100%;padding:13px;
      background:rgba(255,255,255,.06);border:1px solid rgba(0,180,204,.25);border-radius:12px;
      color:#e8edf5;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:10px;
      transition:background .2s;margin-bottom:16px" id="_googleBtn"
      onmouseover="this.style.background='rgba(0,180,204,.1)'"
      onmouseout="this.style.background='rgba(255,255,255,.06)'">
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.2H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.7-.4-3.8z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.5 26.7 36 24 36c-5.2 0-9.7-3.3-11.4-8H5.8C9.1 39.4 16 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.2H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C41.4 35.2 44 30 44 24c0-1.3-.1-2.7-.4-3.8z"/>
      </svg>
      Continue with Google
    </button>

    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <div style="flex:1;height:1px;background:rgba(255,255,255,.07)"></div>
      <span style="font-size:11px;color:rgba(232,237,245,.3)">or with email</span>
      <div style="flex:1;height:1px;background:rgba(255,255,255,.07)"></div>
    </div>

    <!-- Login panel -->
    <div id="_panel_login">
      <div style="margin-bottom:13px">
        <div style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;
          text-transform:uppercase;letter-spacing:1.2px;color:rgba(232,237,245,.45);margin-bottom:5px">Email</div>
        <input id="_li_email" type="email" placeholder="you@example.com"
          style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
          border-radius:9px;padding:11px 15px;font-size:14px;color:#e8edf5;outline:none;
          font-family:'DM Sans',sans-serif;transition:border-color .2s"
          onfocus="this.style.borderColor='#00b4cc'" onblur="this.style.borderColor='rgba(255,255,255,.08)'"/>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;
          text-transform:uppercase;letter-spacing:1.2px;color:rgba(232,237,245,.45);margin-bottom:5px">Password</div>
        <input id="_li_pass" type="password" placeholder="••••••••"
          style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
          border-radius:9px;padding:11px 15px;font-size:14px;color:#e8edf5;outline:none;
          font-family:'DM Sans',sans-serif;transition:border-color .2s"
          onfocus="this.style.borderColor='#00b4cc'" onblur="this.style.borderColor='rgba(255,255,255,.08)'"/>
      </div>
      <button id="_li_btn" onclick="BDOH_AUTH.email()"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#00b4cc,#4CAF50);
        color:#fff;border:none;border-radius:11px;font-family:'Syne',sans-serif;font-size:14px;
        font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(0,180,204,.3);transition:opacity .2s">
        Sign In
      </button>
      <p style="text-align:center;color:rgba(232,237,245,.38);font-size:12px;margin-top:14px">
        No account? <a href="#" onclick="BDOH_AUTH.tab('register');return false"
        style="color:#00b4cc;text-decoration:none">Create one</a>
      </p>
    </div>

    <!-- Register panel -->
    <div id="_panel_reg" style="display:none">
      <div style="margin-bottom:13px">
        <div style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;
          text-transform:uppercase;letter-spacing:1.2px;color:rgba(232,237,245,.45);margin-bottom:5px">Full Name</div>
        <input id="_reg_name" type="text" placeholder="Your name"
          style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
          border-radius:9px;padding:11px 15px;font-size:14px;color:#e8edf5;outline:none;
          font-family:'DM Sans',sans-serif"/>
      </div>
      <div style="margin-bottom:13px">
        <div style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;
          text-transform:uppercase;letter-spacing:1.2px;color:rgba(232,237,245,.45);margin-bottom:5px">Email</div>
        <input id="_reg_email" type="email" placeholder="you@example.com"
          style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
          border-radius:9px;padding:11px 15px;font-size:14px;color:#e8edf5;outline:none;
          font-family:'DM Sans',sans-serif"/>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;
          text-transform:uppercase;letter-spacing:1.2px;color:rgba(232,237,245,.45);margin-bottom:5px">Password</div>
        <input id="_reg_pass" type="password" placeholder="Min 6 characters"
          style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
          border-radius:9px;padding:11px 15px;font-size:14px;color:#e8edf5;outline:none;
          font-family:'DM Sans',sans-serif"/>
      </div>
      <button id="_reg_btn" onclick="BDOH_AUTH.register()"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#00b4cc,#4CAF50);
        color:#fff;border:none;border-radius:11px;font-family:'Syne',sans-serif;font-size:14px;
        font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(0,180,204,.3)">
        Create Account
      </button>
      <p style="text-align:center;color:rgba(232,237,245,.38);font-size:12px;margin-top:14px">
        Have an account? <a href="#" onclick="BDOH_AUTH.tab('login');return false"
        style="color:#00b4cc;text-decoration:none">Sign in</a>
      </p>
    </div>
  </div>
</div>
<style>
@keyframes _authIn{from{opacity:0;transform:scale(.9) translateY(18px)}to{opacity:1;transform:none}}
/* Profile nav pill styles */
.profile-nav-btn{display:flex!important;align-items:center;gap:8px;padding:6px 14px 6px 6px;
  border-radius:22px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);
  color:#e8edf5;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;
  text-decoration:none;transition:all .2s;cursor:pointer}
.profile-nav-btn:hover{border-color:#00b4cc;box-shadow:0 4px 16px rgba(0,180,204,.15);transform:translateY(-1px)}
.profile-nav-avatar{width:26px;height:26px;border-radius:50%;
  background:linear-gradient(135deg,#00b4cc,#4CAF50);color:#fff;
  font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;overflow:hidden;font-family:'Syne',sans-serif}
.profile-nav-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
/* Sign in button style matching BDOH design */
.bdoh-signin-btn{padding:8px 20px;border-radius:22px;
  background:linear-gradient(135deg,#00b4cc,#4CAF50);
  color:#fff;border:none;font-family:'Syne',sans-serif;font-weight:700;
  font-size:13px;cursor:pointer;box-shadow:0 4px 14px rgba(0,180,204,.3);
  transition:all .22s;white-space:nowrap}
.bdoh-signin-btn:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(0,180,204,.45)}
</style>`;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', MODAL);

    /* Inject into navbar if #navAuthWrap exists */
    const wrap = document.getElementById('navAuthWrap');
    if (wrap) {
      wrap.innerHTML = `<button class="bdoh-signin-btn" onclick="BDOH_AUTH.open()">Sign In</button>`;
    }

    /* Close on backdrop click */
    document.getElementById('bdohAuthModal').addEventListener('click', e => {
      if (e.target.id === 'bdohAuthModal') BDOH_AUTH.close();
    });

    /* Listen for auth state changes — updates both navAuthWrap and profile-patch targets */
    window.addEventListener('bdoh:authReady', e => _onAuthState(e.detail));
  });

  function _onAuthState({ user, profile }){
    _updateNav(user, profile);
  }

  function _updateNav(user, profile){
    const wrap = document.getElementById('navAuthWrap');
    if (!wrap) return;

    if (user && profile) {
      const name     = (profile.displayName || user.displayName || 'Profile').split(' ')[0];
      const photoURL = profile.photoURL || user.photoURL || '';
      const initials = name.charAt(0).toUpperCase();

      wrap.innerHTML = `
        <div style="position:relative">
          <a href="profile.html" class="profile-nav-btn" id="profileNavBtn" aria-label="My Profile">
            <span id="profileNavAvatar" class="profile-nav-avatar">
              ${photoURL
                ? `<img src="${photoURL}" alt="${name}" crossorigin="anonymous"/>`
                : initials}
            </span>
            <span id="profileNavName">${name}</span>
          </a>
        </div>`;

      /* Also update mobile profile link if it exists (profile-patch.js target) */
      const mob = document.getElementById('mobProfileNavLink');
      if (mob) mob.style.display = '';

    } else {
      wrap.innerHTML = `<button class="bdoh-signin-btn" onclick="BDOH_AUTH.open()">Sign In</button>`;
      const mob = document.getElementById('mobProfileNavLink');
      if (mob) mob.style.display = 'none';
    }
  }

  /* ── Public API ── */
  window.BDOH_AUTH = {
    open(tabName='login'){
      this.tab(tabName);
      document.getElementById('bdohAuthModal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    },
    close(){
      document.getElementById('bdohAuthModal').style.display = 'none';
      document.body.style.overflow = '';
      _clearErr();
    },
    tab(name){
      const isLogin = name === 'login';
      const tl = document.getElementById('_tab_login');
      const tr = document.getElementById('_tab_reg');
      const pl = document.getElementById('_panel_login');
      const pr = document.getElementById('_panel_reg');
      if (!tl) return;
      tl.style.background = isLogin ? 'rgba(0,180,204,.2)' : 'none';
      tl.style.color = isLogin ? '#e8edf5' : 'rgba(232,237,245,.45)';
      tr.style.background = !isLogin ? 'rgba(0,180,204,.2)' : 'none';
      tr.style.color = !isLogin ? '#e8edf5' : 'rgba(232,237,245,.45)';
      pl.style.display = isLogin ? 'block' : 'none';
      pr.style.display = !isLogin ? 'block' : 'none';
      _clearErr();
    },
    async google(){
      _clearErr();
      const btn = document.getElementById('_googleBtn');
      btn.disabled = true; btn.style.opacity = '.6';
      try {
        await window.BDOH_DB.loginGoogle();
        this.close();
      } catch(e) {
        if (e.code !== 'auth/popup-closed-by-user') _showErr(_friendly(e.code));
        btn.disabled = false; btn.style.opacity = '1';
      }
    },
    async email(){
      const email = document.getElementById('_li_email').value.trim();
      const pass  = document.getElementById('_li_pass').value;
      if (!email || !pass) { _showErr('Please fill in all fields.'); return; }
      const btn = document.getElementById('_li_btn');
      btn.disabled = true; btn.textContent = 'Signing in…';
      try {
        await window.BDOH_DB.loginEmail(email, pass);
        this.close();
      } catch(e) {
        _showErr(_friendly(e.code));
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    },
    async register(){
      const name  = document.getElementById('_reg_name').value.trim();
      const email = document.getElementById('_reg_email').value.trim();
      const pass  = document.getElementById('_reg_pass').value;
      if (!name || !email || !pass) { _showErr('All fields are required.'); return; }
      if (pass.length < 6) { _showErr('Password must be at least 6 characters.'); return; }
      const btn = document.getElementById('_reg_btn');
      btn.disabled = true; btn.textContent = 'Creating account…';
      try {
        await window.BDOH_DB.register(email, pass, name);
        this.close();
      } catch(e) {
        _showErr(_friendly(e.code));
        btn.disabled = false; btn.textContent = 'Create Account';
      }
    },
    async logout(){
      await window.BDOH_DB.logout();
      location.href = 'index.html';
    }
  };

  /* Also expose as bdohOpenAuthModal for legacy calls from main.js */
  window.bdohOpenAuthModal = () => window.BDOH_AUTH.open();

  function _showErr(msg){
    const el = document.getElementById('_authErr');
    if (el){ el.textContent = msg; el.style.display = 'block'; }
  }
  function _clearErr(){
    const el = document.getElementById('_authErr');
    if (el){ el.textContent=''; el.style.display='none'; }
  }
  function _friendly(code){
    return ({
      'auth/wrong-password':      'Incorrect password. Try again.',
      'auth/user-not-found':      'No account with this email.',
      'auth/email-already-in-use':'Email already registered. Sign in.',
      'auth/weak-password':       'Password must be at least 6 characters.',
      'auth/invalid-email':       'Please enter a valid email.',
      'auth/too-many-requests':   'Too many attempts. Wait a moment.',
      'auth/network-request-failed':'Network error. Check your connection.'
    }[code]) || 'Something went wrong. Please try again.';
  }

})();
