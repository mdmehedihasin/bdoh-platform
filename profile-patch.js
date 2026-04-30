/* ================================================================
   BDOH — PROFILE PAGE INTEGRATION PATCH
   ----------------------------------------------------------------
   HOW TO APPLY:
   
   1. In your index.html <nav>, add this button in the navbar links area:
   
      <a href="profile.html" class="nl profile-nav-btn" id="profileNavBtn"
         style="display:none" aria-label="My Profile">
        <span id="profileNavAvatar" class="profile-nav-avatar">?</span>
        <span id="profileNavName">Profile</span>
      </a>
   
   2. In your auth nav button (the Sign In button), change onclick to:
      onclick="bdohOpenAuthModal()"
      and give it id="authNavBtn"
   
   3. Add the CSS below into your main stylesheet or <style> block.
   
   4. Append the JS section at the bottom of main.js (or include as
      a separate <script src="profile-patch.js"> before </body>).
   
   5. Place profile.html in the same folder as index.html.
================================================================ */

/* ────────────────────────────────────────────────────────────────
   CSS TO ADD INTO YOUR STYLESHEET
   (add inside <style> in index.html or your main CSS file)
──────────────────────────────────────────────────────────────── */

/*
.profile-nav-btn {
  display: flex !important;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 6px;
  border-radius: 22px;
  border: 1px solid var(--bd);
  background: var(--sf);
  color: var(--txt);
  font-family: var(--fH);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color .2s, box-shadow .2s, transform .2s;
  cursor: pointer;
}
.profile-nav-btn:hover {
  border-color: var(--teal);
  box-shadow: 0 4px 16px rgba(0,180,204,.15);
  transform: translateY(-1px);
}
.profile-nav-avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--teal), var(--green));
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.profile-nav-avatar img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
*/

/* ────────────────────────────────────────────────────────────────
   HTML SNIPPET TO ADD IN YOUR NAVBAR (index.html)
   Place this near the sign-in button in your nav.
──────────────────────────────────────────────────────────────── */

/*
<!-- Profile nav button (visible only when signed in) -->
<a href="profile.html" class="nl profile-nav-btn" id="profileNavBtn"
   style="display:none" aria-label="My Profile">
  <span id="profileNavAvatar" class="profile-nav-avatar">?</span>
  <span id="profileNavName">Profile</span>
</a>
*/

/* ────────────────────────────────────────────────────────────────
   JS PATCH — append at the END of main.js
   This enhances bdohOnSignedIn / bdohOnSignedOut to also update
   the new profile nav button linking to profile.html.
──────────────────────────────────────────────────────────────── */

(function patchProfileNavButton() {

  /* ── Patch bdohOnSignedIn to update the navbar profile pill ── */
  const _origSignedIn = window.bdohOnSignedIn;

  window.bdohOnSignedIn = async function(user) {
    /* Run original logic */
    if (_origSignedIn) await _origSignedIn.call(this, user);

    /* Show profile nav pill */
    const navBtn   = document.getElementById('profileNavBtn');
    const navName  = document.getElementById('profileNavName');
    const navAvatar= document.getElementById('profileNavAvatar');

    if (!navBtn) return;

    navBtn.style.display = 'flex';

    /* Update name */
    const firstName = (user.displayName || 'Profile').split(' ')[0];
    if (navName) navName.textContent = firstName;

    /* Update avatar */
    if (navAvatar) {
      if (user.photoURL) {
        navAvatar.innerHTML = `<img src="${user.photoURL}" alt="${firstName}" crossorigin="anonymous"/>`;
      } else {
        navAvatar.textContent = firstName[0].toUpperCase();
      }
    }
  };

  /* ── Patch bdohOnSignedOut to hide the profile pill ── */
  const _origSignedOut = window.bdohOnSignedOut;

  window.bdohOnSignedOut = function() {
    if (_origSignedOut) _origSignedOut.call(this);

    const navBtn = document.getElementById('profileNavBtn');
    if (navBtn) navBtn.style.display = 'none';
  };

})();

/* ────────────────────────────────────────────────────────────────
   MOBILE MENU — Add this inside your mob-menu HTML in index.html
   (place after existing mob-links)
──────────────────────────────────────────────────────────────── */

/*
<!-- Mobile profile link (visible only when signed in) -->
<a href="profile.html" class="mob-link" id="mobProfileNavLink"
   style="display:none">
  👤 My Profile
</a>
*/

/* And add to bdohOnSignedIn / bdohOnSignedOut (already handled by patch above
   if you also add the mobProfileNavLink toggling below) */

(function patchMobProfileLink() {
  const _orig = window.bdohOnSignedIn;
  window.bdohOnSignedIn = async function(user) {
    if (_orig) await _orig.call(this, user);
    const mob = document.getElementById('mobProfileNavLink');
    if (mob) mob.style.display = '';
  };

  const _origOut = window.bdohOnSignedOut;
  window.bdohOnSignedOut = function() {
    if (_origOut) _origOut.call(this);
    const mob = document.getElementById('mobProfileNavLink');
    if (mob) mob.style.display = 'none';
  };
})();
