/* ================================================================
   BDOH DATA.JS v4.1 — FINAL PRODUCTION BUILD
   ── Schema is 100% synchronized with profile.html ──
   Field names: totalSolves, totalAttempts, totalPoints,
                contestCount, subjectStats, ratingHistory,
                badges, district, division, user_id, timestamp
================================================================ */

const BDOH_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBHl3ysjKWoQjJMOCtAPdfiURsXjjuRjck",
  authDomain: "bdoh-project.firebaseapp.com",
  projectId: "bdoh-project",
  storageBucket: "bdoh-project.firebasestorage.app",
  messagingSenderId: "413106966781",
  appId: "1:413106966781:web:f3123769a8d2cec02e2e94"
};

const BDOH_DEFAULTS = {
  panelists: [
    {id:"p0",name:"Md.Mehedi Hasin Anjum",role:"President & Founder",subject:"Physics",isPresident:true,initials:"MH",photo:"assets/mehedi2.jpg",quote:"Every olympiad medal Bangladesh has ever won started with one student refusing to give up on a problem at midnight.",achievements:["ISO, IGMO Gold Medalist","IPhO, WMTC TST Winner","Founded BDOH"]},
    {id:"p1",name:"Talha Harun",role:"Core Math Executive",subject:"Mathematics",isPresident:false,initials:"TH",photo:"assets/talha.jpg",achievements:["WMTC, ICO Silver Medalist","Regional Winner at BDMO","Former 2x2 National Record Holder"]},
    {id:"p2",name:"Istiak Ahmed",role:"Core Math Executive",subject:"Mathematics",isPresident:false,initials:"IA",photo:"assets/istiak.jpg",achievements:["Nationalist at BDMO'24'25","National Winner at BMTC'24'25","NDMC Academic Member"]},
    {id:"p3",name:"Abdul Majid",role:"Core Physics Executive",subject:"Physics",isPresident:false,initials:"AM",photo:"assets/majid.jpg",achievements:["Joint Secretary of Physics at RCSC","IPhO, BdJSO TST Camper","Regional Winner at BdPhO,BdChO"]},
    {id:"p4",name:"Rakibul Hasan Siam",role:"Core Chemistry Executive",subject:"Chemistry",isPresident:false,initials:"RHS",photo:"assets/siam.jpg",achievements:["Excellence Honor Awardee at International Environment Olympiad","Nationalist at BdChO'26","Merit Award at BdOC ChO"]},
    {id:"p5",name:"Radi Amamul",role:"Core Astronomy Executive",subject:"Astronomy",isPresident:false,initials:"RA",photo:"assets/radi.jpg",achievements:["Nationalist at BdOAA'24'26","Nationalist at BAO'24'25","NDESC Academic Member"]},
    {id:"p6",name:"Nafis Sazzad Niloy",role:"Core Math Executive",subject:"Math",isPresident:false,initials:"NSN",photo:"assets/niloy.jpg",achievements:["Nationalist at BdMO'24'25","National Winner at BMTC","2nd Runner Up at 45th NSO"]},
    {id:"p7",name:"Sarder Raghib Nihal",role:"Core Chemistry Executive",subject:"Chemistry",isPresident:false,initials:"SRN",photo:"assets/nihal.jpg",achievements:["Regional Winner at BdChO","Regional Winner at BdMO"]}
  ],
  problems: [
    {id:"q1",subject:"Physics",difficulty:"Easy",title:"Projectile on an Inclined Plane",statement:"A ball is launched from the base of a smooth inclined plane at 45° to the horizontal. The incline itself makes 30° with the horizontal. Find the ratio of the range along the incline surface to the range on flat ground for the same launch speed.",hint:"Resolve gravity into components parallel and perpendicular to the incline surface.",solution:"Ratio simplifies to approximately 0.75.",answer:"0.75",tolerance:0.05,solves:1240,timeMin:15,points:10},
    {id:"q2",subject:"Mathematics",difficulty:"Medium",title:"Divisibility and Modular Arithmetic",statement:"Find the largest positive integer k such that k divides n⁵ − n for every integer n.",hint:"Factor n⁵ − n and use Fermat's Little Theorem.",solution:"By FLT n⁵≡n (mod 5). Also divisible by 6. So k=LCM(2,3,5)=30.",answer:"30",tolerance:0,solves:876,timeMin:25,points:15},
    {id:"q3",subject:"Chemistry",difficulty:"Easy",title:"pH at the Half-Equivalence Point",statement:"A 25 mL sample of 0.10 M acetic acid (Ka=1.8×10⁻⁵) is titrated with 0.10 M NaOH. Calculate the pH at the half-equivalence point.",hint:"At half-equivalence [HA]=[A⁻] so log term vanishes.",solution:"pH = pKa = 4.74.",answer:"4.74",tolerance:0.05,solves:954,timeMin:20,points:10},
    {id:"q4",subject:"Biology",difficulty:"Medium",title:"Dihybrid Cross — Dominant Phenotype Fraction",statement:"Two plants AaBb × AaBb. What fraction of offspring show both dominant phenotypes?",hint:"P(A_)=3/4, P(B_)=3/4. Multiply.",solution:"9/16 = 0.5625.",answer:"0.5625",tolerance:0.001,solves:720,timeMin:15,points:10},
    {id:"q5",subject:"Astronomy",difficulty:"Hard",title:"Binary Star Orbital Period",statement:"Two stars 2M☉ and 3M☉, separation 4 AU. Find orbital period in years.",hint:"T²=4π²a³/G(M₁+M₂). Convert AU to metres.",solution:"T ≈ 2.19 years.",answer:"2.19",tolerance:0.12,solves:198,timeMin:45,points:25},
    {id:"q6",subject:"Informatics",difficulty:"Hard",title:"Constrained Minimum Spanning Tree",statement:"MST weight 15. Must include edge E (weight 7). Heaviest non-E cycle edge = 4. Find constrained MST weight.",hint:"Add E then remove heaviest non-E cycle edge.",solution:"15+7−4=18.",answer:"18",tolerance:0,solves:312,timeMin:60,points:25}
  ],
  whatsapp: [
    {name:"Physics Hub",emoji:"⚛️",color:"#007B8F",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"423"},
    {name:"Maths Hub",emoji:"∞",color:"#4CAF50",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"546"},
    {name:"Biology Hub",emoji:"🌿",color:"#66bb6a",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"389"},
    {name:"Astronomy Hub",emoji:"🪐",color:"#FFD700",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"412"},
    {name:"Chemistry Hub",emoji:"🧪",color:"#00b4cc",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"397"},
    {name:"BDOH General Chat",emoji:"🏆",color:"#4CAF50",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"726"}
  ]
};

const BDOH = {
  panelists:   BDOH_DEFAULTS.panelists,
  problems:    BDOH_DEFAULTS.problems,
  whatsapp:    BDOH_DEFAULTS.whatsapp,
  contests:    [],
  submissions: [],
  currentUser: null,
  userProfile: null,
  userRole:    null
};

let _db = null, _auth = null, _fbReady = false, _fbReadyCallbacks = [];

function bdohFirebaseReady(cb){
  if(_fbReady) cb(_db, _auth); else _fbReadyCallbacks.push(cb);
}

(async function initFirebase(){
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc,
            addDoc, updateDoc, onSnapshot, serverTimestamp, query, where,
            orderBy, limit, increment }
      = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup,
            GoogleAuthProvider, createUserWithEmailAndPassword, signOut, updateProfile }
      = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");

    const app = getApps().length ? getApps()[0] : initializeApp(BDOH_FIREBASE_CONFIG);
    _db   = getFirestore(app);
    _auth = getAuth(app);

    onAuthStateChanged(_auth, async (user) => {
      BDOH.currentUser = user;
      if (user) {
        const uRef = doc(_db, 'users', user.uid);
        const snap = await getDoc(uRef);
        if (!snap.exists()) {
          /* Create new user doc — schema exactly matches profile.html */
          const newDoc = {
            uid:           user.uid,
            displayName:   user.displayName || user.email.split('@')[0],
            email:         user.email || '',
            photoURL:      user.photoURL || '',
            role:          'user',
            institution:   '',
            district:      '',
            division:      '',
            subjects:      [],
            bio:           '',
            rating:        1200,
            totalSolves:   0,       /* profile.html: d.totalSolves  */
            totalAttempts: 0,       /* profile.html: d.totalAttempts */
            totalPoints:   0,       /* profile.html: d.totalPoints  */
            contestCount:  0,       /* profile.html: d.contestCount */
            subjectStats:  {},      /* profile.html: d.subjectStats */
            ratingHistory: [1200],  /* profile.html: d.ratingHistory */
            badges:        [],      /* profile.html: d.badges       */
            isVerified:    false,
            isBanned:      false,
            banReason:     '',
            createdAt:     serverTimestamp(),
            lastActive:    serverTimestamp()
          };
          await setDoc(uRef, newDoc);
          BDOH.userProfile = newDoc;
        } else {
          BDOH.userProfile = snap.data();
          await updateDoc(uRef, { lastActive: serverTimestamp() });
        }

        const rSnap = await getDoc(doc(_db,'roles',user.uid));
        BDOH.userRole = rSnap.exists() ? rSnap.data().role : (BDOH.userProfile.role || 'user');

        window.dispatchEvent(new CustomEvent('bdoh:authReady',
          { detail: { user, profile: BDOH.userProfile, role: BDOH.userRole } }));

        /* Fire profile-patch.js hooks */
        if (typeof window.bdohOnSignedIn === 'function') window.bdohOnSignedIn(user);

      } else {
        BDOH.userProfile = null;
        BDOH.userRole    = null;
        window.dispatchEvent(new CustomEvent('bdoh:authReady', { detail: { user: null } }));
        if (typeof window.bdohOnSignedOut === 'function') window.bdohOnSignedOut();
      }
    });

    window.BDOH_DB = {
      db: _db, auth: _auth,

      /* ── AUTH ── */
      async loginEmail(email, pass){ return signInWithEmailAndPassword(_auth, email, pass); },
      async loginGoogle(){ return signInWithPopup(_auth, new GoogleAuthProvider()); },
      async register(email, pass, displayName){
        const cred = await createUserWithEmailAndPassword(_auth, email, pass);
        await updateProfile(cred.user, { displayName });
        return cred;
      },
      async logout(){ return signOut(_auth); },

      /* ── USERS ── */
      async getProfile(uid){
        const s = await getDoc(doc(_db,'users', uid || _auth.currentUser?.uid));
        return s.exists() ? { id:s.id, ...s.data() } : null;
      },
      /* Fields match profile.html saveProfile() exactly */
      async updateProfile(uid, data){
        await updateDoc(doc(_db,'users',uid), { ...data, lastActive: serverTimestamp() });
      },
      async getAllUsers(limitN=100){
        const s = await getDocs(query(collection(_db,'users'), orderBy('rating','desc'), limit(limitN)));
        return s.docs.map(d => ({ id:d.id, ...d.data() }));
      },
      async setUserRole(uid, role, assignedBy){
        await setDoc(doc(_db,'roles',uid), { role, assignedBy, assignedAt: new Date().toISOString() });
        await updateDoc(doc(_db,'users',uid), { role });
      },
      async banUser(uid, reason){
        await updateDoc(doc(_db,'users',uid), { isBanned:true, banReason: reason||'' });
      },
      async unbanUser(uid){
        await updateDoc(doc(_db,'users',uid), { isBanned:false, banReason:'' });
      },

      /* ── PROBLEMS ── */
      async getProblems(){
        const s = await getDocs(collection(_db,'problems'));
        return s.docs.map(d => ({ id:d.id, ...d.data() }));
      },
      async saveProblem(problem){
        const ref = doc(_db,'problems', problem.id || ('q'+Date.now()));
        await setDoc(ref, { ...problem, id:ref.id }, { merge:true });
        return ref.id;
      },
      async deleteProblem(id){ await deleteDoc(doc(_db,'problems',id)); },

      /* ── CONTESTS ── */
      async getContests(){
        const s = await getDocs(collection(_db,'contests'));
        return s.docs.map(d => ({ id:d.id, ...d.data() }));
      },
      async saveContest(contest){
        await setDoc(doc(_db,'contests',contest.id),
          { ...contest, updatedAt: new Date().toISOString() }, { merge:true });
      },
      async deleteContest(id){ await deleteDoc(doc(_db,'contests',id)); },
      onContestsChange(cb){
        return onSnapshot(collection(_db,'contests'), snap => {
          const c = snap.docs.map(d => ({ id:d.id, ...d.data() }));
          BDOH.contests = c; cb(c);
        });
      },

      /* ── SUBMISSIONS ──
         CRITICAL: profile.html queries submissions with where('user_id','==',uid)
         AND where('timestamp') for ordering. We write BOTH user_id and userId,
         and BOTH timestamp (Firestore TS) and submittedAt (ISO string).        */
      async saveSubmission(sub){
        const uid = sub.userId || sub.user_id || BDOH.currentUser?.uid || null;
        const now = serverTimestamp();
        const normalized = {
          ...sub,
          user_id:      uid,          /* profile.html: where('user_id','==',uid) */
          userId:       uid,
          timestamp:    now,          /* profile.html: orderBy('timestamp','desc') */
          submittedAt:  new Date().toISOString(),
          /* profile.html shows: s.problem_title, s.title, s.subject, s.status, s.isCorrect */
          status:       sub.status || (sub.score >= (sub.maxScore||1)*.5 ? 'correct' : 'incorrect'),
          isCorrect:    sub.isCorrect !== undefined ? sub.isCorrect : (sub.score >= (sub.maxScore||1)*.5),
          savedAt:      new Date().toISOString()
        };
        await setDoc(doc(_db,'submissions',sub.id), normalized);
        if (uid) await this._updateUserStats(uid, normalized);
      },
      async getSubmissions(){
        const s = await getDocs(collection(_db,'submissions'));
        return s.docs.map(d => ({ id:d.id, ...d.data() }));
      },
      async getSubmissionsForContest(contestId){
        const q = query(collection(_db,'submissions'),
          where('contestId','==',contestId), orderBy('score','desc'));
        const s = await getDocs(q);
        return s.docs.map(d => ({ id:d.id, ...d.data() }));
      },
      async getUserSubmissions(uid){
        /* profile.html uses user_id + timestamp fields */
        try {
          const q = query(collection(_db,'submissions'),
            where('user_id','==',uid), orderBy('timestamp','desc'), limit(20));
          const s = await getDocs(q);
          return s.docs.map(d => ({ id:d.id, ...d.data() }));
        } catch(_) {
          const q2 = query(collection(_db,'submissions'),
            where('userId','==',uid), orderBy('submittedAt','desc'), limit(20));
          const s2 = await getDocs(q2);
          return s2.docs.map(d => ({ id:d.id, ...d.data() }));
        }
      },

      /* ── LEADERBOARD ── */
      async getLeaderboard(type='global'){
        const q = type==='solvers'
          ? query(collection(_db,'leaderboard'), orderBy('totalSolves','desc'), limit(100))
          : query(collection(_db,'leaderboard'), orderBy('rating','desc'), limit(100));
        const s = await getDocs(q);
        return s.docs.map((d,i) => ({ id:d.id, rank:i+1, ...d.data() }));
      },
      async getContestLeaderboard(contestId){
        const q = query(collection(_db,'submissions'),
          where('contestId','==',contestId), orderBy('score','desc'));
        const s = await getDocs(q);
        return s.docs.map((d,i) => ({ id:d.id, rank:i+1, ...d.data() }));
      },
      async recalculateLeaderboard(){
        const users = await this.getAllUsers(500);
        await Promise.all(users.map(u => setDoc(doc(_db,'leaderboard',u.id), {
          userId:       u.id,
          displayName:  u.displayName||'—',
          photoURL:     u.photoURL||null,
          institution:  u.institution||'',
          rating:       u.rating||1200,
          totalSolves:  u.totalSolves||0,
          totalPoints:  u.totalPoints||0,
          contestCount: u.contestCount||0,
          accuracy:     u.totalAttempts>0
            ? Math.round((u.totalSolves||0)/u.totalAttempts*100) : 0,
          subjectStats: u.subjectStats||{},
          updatedAt:    new Date().toISOString()
        }, { merge:true })));
      },

      /* ── ACTIVITY LOGS ── */
      async logActivity(action, target, targetId, meta={}){
        const uid = _auth.currentUser?.uid;
        if (!uid) return;
        await addDoc(collection(_db,'activityLogs'), {
          userId: uid, action, target, targetId,
          timestamp: new Date().toISOString(), meta
        });
      },
      async getActivityLogs(limitN=50){
        const q = query(collection(_db,'activityLogs'),
          orderBy('timestamp','desc'), limit(limitN));
        const s = await getDocs(q);
        return s.docs.map(d => ({ id:d.id, ...d.data() }));
      },

      /* ── RBAC ── */
      canDo(action){
        const role = BDOH.userRole || 'user';
        const m = {
          superadmin: ['*'],
          admin:      ['manage_contests','manage_problems','view_submissions','view_users','manage_panelists','view_analytics','recalc_leaderboard','ban_users'],
          panelist:   ['create_problem','edit_own_problem'],
          moderator:  ['view_submissions','flag_submission','view_users'],
          user:       ['submit_answer','view_leaderboard','view_profile']
        };
        const p = m[role]||m.user;
        return p.includes('*')||p.includes(action);
      },

      /* ── INTERNAL stat updater — called after every submission save ── */
      async _updateUserStats(uid, sub){
        try {
          const uRef  = doc(_db,'users',uid);
          const uSnap = await getDoc(uRef);
          if (!uSnap.exists()) return;
          const u = uSnap.data();

          const allSubs   = await this.getUserSubmissions(uid);
          const attempted  = allSubs.length;
          const solved     = allSubs.filter(s => !s.disqualified && s.isCorrect).length;
          const pct        = sub.maxScore>0 ? sub.score/sub.maxScore : 0;
          const delta      = Math.round((pct-.5)*40);
          const newRating  = Math.max(800, Math.min(3000,(u.rating||1200)+delta));
          const ratingHist = [...(u.ratingHistory||[1200]), newRating].slice(-50);
          const newPoints  = (u.totalPoints||0)+(sub.score||0);

          /* subjectStats — profile.html reads: ss[s.name]?.solves */
          const contest     = BDOH.contests.find(c=>c.id===sub.contestId);
          const subject     = contest?.subject||'';
          const ss = { ...(u.subjectStats||{}) };
          if (subject && subject!=='Mixed'){
            if (!ss[subject]) ss[subject]={solves:0,attempts:0};
            ss[subject].attempts++;
            if (pct>=.5) ss[subject].solves++;
          }

          /* Badge awards */
          const badges=[...(u.badges||[])];
          const award = (id)=>{ if(!badges.includes(id)) badges.push(id); };
          if (solved>=1)                                        award('first_solve');
          if (solved>=100)                                      award('100_solves');
          if (newRating>=1500)                                  award('rating_1500');
          if (newRating>=1800)                                  award('rating_1800');
          if (newRating>=2000)                                  award('rating_2000');
          const SUBJS=['Physics','Mathematics','Chemistry','Biology','Astronomy','Informatics'];
          if (SUBJS.every(s=>(ss[s]?.solves||0)>=1))           award('all_subjects');

          await updateDoc(uRef, {
            totalSolves:   solved,
            totalAttempts: attempted,
            totalPoints:   newPoints,
            contestCount:  increment(1),
            rating:        newRating,
            ratingHistory: ratingHist,
            subjectStats:  ss,
            badges,
            lastActive:    serverTimestamp()
          });

          await setDoc(doc(_db,'leaderboard',uid), {
            userId:      uid,
            displayName: u.displayName,
            photoURL:    u.photoURL||null,
            institution: u.institution||'',
            rating:      newRating,
            totalSolves: solved,
            totalPoints: newPoints,
            accuracy:    attempted>0?Math.round(solved/attempted*100):0,
            contestCount:(u.contestCount||0)+1,
            subjectStats: ss,
            updatedAt:   new Date().toISOString()
          }, { merge:true });
        } catch(e){ console.warn('_updateUserStats:', e); }
      }
    };

    _fbReady = true;
    _fbReadyCallbacks.forEach(cb=>cb(_db,_auth));
    _fbReadyCallbacks = [];

    /* Warm contest cache */
    try {
      const cached = JSON.parse(localStorage.getItem('bdoh_contests_cache')||'[]');
      if (cached.length) BDOH.contests = cached;
      window.BDOH_DB.getContests().then(fresh=>{
        BDOH.contests = fresh;
        localStorage.setItem('bdoh_contests_cache', JSON.stringify(fresh));
      }).catch(()=>{});
    } catch(_){}

  } catch(e){
    console.error('BDOH Firebase init error:', e);
    try { BDOH.contests = JSON.parse(localStorage.getItem('bdoh_contests_cache')||'[]'); } catch(_){}
    _fbReady = true;
    _fbReadyCallbacks.forEach(cb=>cb(null,null));
    _fbReadyCallbacks = [];
  }
})();

function bdohSave(){
  try {
    localStorage.setItem('bdoh_data_v1', JSON.stringify({
      panelists: BDOH.panelists, problems: BDOH.problems,
      whatsapp:  BDOH.whatsapp,  contests: BDOH.contests
    }));
  } catch(_){}
}
