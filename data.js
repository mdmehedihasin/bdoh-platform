/* ================================================================
   BDOH DATA.JS v4.4 — RACE-CONDITION & ERROR-HANDLING FIXES
   All field names match profile.html, admin.html, leaderboard.html
   Fixes:
     • Submissions ALWAYS write to Firestore with correct schema
     • Practice-mode submissions tracked to profile
     • Leaderboard reads from submissions when /leaderboard empty
     • User stats update immediately after every submission
     • No more "nothing shows in profile" — totalSolves etc auto-update
     • v4.4: window.BDOH_DB_READY promise so admin.html can await it
     • v4.4: roles read wrapped in try/catch — transient errors no longer
             crash the auth callback or block admin panel load
     • v4.4: bdoh:dbReady event fired after window.BDOH_DB is set
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
  panelists: BDOH_DEFAULTS.panelists,
  problems:  BDOH_DEFAULTS.problems,
  whatsapp:  BDOH_DEFAULTS.whatsapp,
  contests:  [],
  submissions: [],
  currentUser: null,
  userProfile: null,
  userRole: null
};

let _db=null, _auth=null, _fbReady=false, _fbReadyCallbacks=[];
function bdohFirebaseReady(cb){ if(_fbReady) cb(_db,_auth); else _fbReadyCallbacks.push(cb); }

/* ── Ready promise — admin.html awaits this so it never calls BDOH_DB before
   Firebase has initialised. Resolves with window.BDOH_DB (or null on failure). ── */
let _bdohDbReadyResolve;
window.BDOH_DB_READY = new Promise(res => { _bdohDbReadyResolve = res; });

(async function initFirebase(){
  try {
    const {initializeApp,getApps} = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const {getFirestore,collection,doc,getDoc,getDocs,setDoc,deleteDoc,addDoc,
           updateDoc,onSnapshot,serverTimestamp,query,where,orderBy,limit,increment}
      = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signInWithPopup,
           GoogleAuthProvider,createUserWithEmailAndPassword,signOut,updateProfile}
      = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");

    const app = getApps().length ? getApps()[0] : initializeApp(BDOH_FIREBASE_CONFIG);
    _db  = getFirestore(app);
    _auth = getAuth(app);

    /* ── Auth state ── */
    onAuthStateChanged(_auth, async user => {
      BDOH.currentUser = user;
      if (user) {
        const uRef = doc(_db,'users',user.uid);
        const snap = await getDoc(uRef);
        if (!snap.exists()) {
          const newDoc = {
            uid:user.uid, displayName:user.displayName||user.email.split('@')[0],
            email:user.email||'', photoURL:user.photoURL||'', role:'user',
            institution:'', district:'', division:'', subjects:[], bio:'',
            rating:1200, totalSolves:0, totalAttempts:0, totalPoints:0,
            contestCount:0, subjectStats:{}, ratingHistory:[1200], badges:[],
            isVerified:false, isBanned:false, banReason:'',
            createdAt:serverTimestamp(), lastActive:serverTimestamp()
          };
          await setDoc(uRef, newDoc);
          BDOH.userProfile = newDoc;
        } else {
          BDOH.userProfile = snap.data();
          await updateDoc(uRef, {lastActive:serverTimestamp()});
        }
        const rSnap = await getDoc(doc(_db,'roles',user.uid)).catch(()=>null);
        BDOH.userRole = (rSnap&&rSnap.exists()) ? rSnap.data().role : (BDOH.userProfile.role||'user');
        window.dispatchEvent(new CustomEvent('bdoh:authReady',
          {detail:{user,profile:BDOH.userProfile,role:BDOH.userRole}}));
        if(typeof window.bdohOnSignedIn==='function') window.bdohOnSignedIn(user);
      } else {
        BDOH.userProfile=null; BDOH.userRole=null;
        window.dispatchEvent(new CustomEvent('bdoh:authReady',{detail:{user:null}}));
        if(typeof window.bdohOnSignedOut==='function') window.bdohOnSignedOut();
      }
    });

    window.BDOH_DB = {
      db:_db, auth:_auth,

      /* AUTH */
      async loginEmail(e,p){ return signInWithEmailAndPassword(_auth,e,p); },
      async loginGoogle(){ return signInWithPopup(_auth,new GoogleAuthProvider()); },
      async register(e,p,n){
        const c=await createUserWithEmailAndPassword(_auth,e,p);
        await updateProfile(c.user,{displayName:n}); return c;
      },
      async logout(){ return signOut(_auth); },

      /* USERS */
      async getProfile(uid){
        const s=await getDoc(doc(_db,'users',uid||_auth.currentUser?.uid));
        return s.exists()?{id:s.id,...s.data()}:null;
      },
      async updateProfile(uid,data){
        await updateDoc(doc(_db,'users',uid),{...data,lastActive:serverTimestamp()});
      },
      async getAllUsers(n=200){
        const s=await getDocs(query(collection(_db,'users'),orderBy('rating','desc'),limit(n)));
        return s.docs.map(d=>({id:d.id,...d.data()}));
      },
      async setUserRole(uid,role,by){
        await setDoc(doc(_db,'roles',uid),{role,assignedBy:by,assignedAt:new Date().toISOString()});
        await updateDoc(doc(_db,'users',uid),{role});
      },
      async banUser(uid,reason){
        await updateDoc(doc(_db,'users',uid),{isBanned:true,banReason:reason||''});
      },
      async unbanUser(uid){
        await updateDoc(doc(_db,'users',uid),{isBanned:false,banReason:''});
      },

      /* PROBLEMS */
      async getProblems(){
        const s=await getDocs(collection(_db,'problems'));
        return s.docs.map(d=>({id:d.id,...d.data()}));
      },
      async saveProblem(p){
        const ref=doc(_db,'problems',p.id||('q'+Date.now()));
        await setDoc(ref,{...p,id:ref.id},{merge:true}); return ref.id;
      },
      async deleteProblem(id){ await deleteDoc(doc(_db,'problems',id)); },

      /* PRACTICE SUBMISSION — called from practice.js and main.js */
      async savePracticeSubmission(problemId, isCorrect, answer, extraMeta){
        const uid = _auth.currentUser?.uid;
        // extraMeta supplied by practice.js contains richer fields (title, pts, difficulty, subject)
        const problem = extraMeta || BDOH.problems.find(p=>p.id===problemId) || {};
        const pts = problem.pts || problem.points || 0;
        const sub = {
          id: 'prac_'+Date.now()+'_'+(uid||'anon'),
          contestId: 'practice',
          user_id: uid||null,
          userId:  uid||null,
          name: BDOH.userProfile?.displayName||'Anonymous',
          problem_title: problem.title||problemId,
          title: problem.title||problemId,
          subject: problem.subject||'',
          difficulty: problem.difficulty||'',
          points: pts,
          score: isCorrect ? pts : 0,
          rawScore: isCorrect ? pts : 0,
          maxScore: pts,
          isCorrect,
          status: isCorrect?'correct':'incorrect',
          userAnswer: answer,
          correctAnswer: problem.answer,
          tabSwitches:0, penalties:0, answers:{0:answer},
          timeTaken:0, autoSubmitted:false, disqualified:false,
          submittedAt: new Date().toISOString(),
          timestamp: serverTimestamp()
        };
        await setDoc(doc(_db,'submissions',sub.id), sub);
        /* Update solves count on problem */
        if(isCorrect){
          try{ await updateDoc(doc(_db,'problems',problemId),{solves:increment(1)}); }catch(_){}
        }
        /* Update user profile stats */
        if(uid) await this._updateUserStats(uid, sub);
        return sub;
      },

      /* CONTESTS */
      async getContests(){
        const s=await getDocs(collection(_db,'contests'));
        return s.docs.map(d=>({id:d.id,...d.data()}));
      },
      async saveContest(c){
        await setDoc(doc(_db,'contests',c.id),
          {...c,updatedAt:new Date().toISOString()},{merge:true});
      },
      async deleteContest(id){ await deleteDoc(doc(_db,'contests',id)); },
      onContestsChange(cb){
        return onSnapshot(collection(_db,'contests'),snap=>{
          const c=snap.docs.map(d=>({id:d.id,...d.data()}));
          BDOH.contests=c; cb(c);
        });
      },

      /* SUBMISSIONS — the definitive saveSubmission function */
      async saveSubmission(sub){
        const uid = sub.userId||sub.user_id||_auth.currentUser?.uid||null;
        const contestObj = BDOH.contests.find(c=>c.id===sub.contestId)||{};
        /* Build the complete normalized document — every field every page needs */
        const normalized = {
          /* Identity */
          id:          sub.id,
          contestId:   sub.contestId||'',
          /* Both uid fields so ALL queries work */
          user_id:     uid,
          userId:      uid,
          /* Participant info */
          name:        sub.name||BDOH.userProfile?.displayName||'Anonymous',
          email:       sub.email||BDOH.currentUser?.email||'',
          category:    sub.category||'',
          classGrade:  sub.classGrade||'',
          institution: sub.institution||BDOH.userProfile?.institution||'',
          phone:       sub.phone||'',
          /* Contest metadata (for profile.html display) */
          problem_title: contestObj.title||sub.title||sub.problem_title||sub.contestId||'Contest',
          title:         contestObj.title||sub.title||sub.contestId||'Contest',
          subject:       contestObj.subject||sub.subject||'',
          /* Scores */
          score:       sub.score||0,
          rawScore:    sub.rawScore||sub.score||0,
          maxScore:    sub.maxScore||0,
          points:      sub.score||0,
          /* Status — isCorrect for profile.html, status for admin */
          isCorrect:   sub.isCorrect!==undefined ? sub.isCorrect : (sub.score>=(sub.maxScore||1)*.5),
          status:      sub.isCorrect||(sub.score>=(sub.maxScore||1)*.5) ? 'correct' : 'incorrect',
          /* Anti-cheat */
          tabSwitches: sub.tabSwitches||0,
          penalties:   sub.penalties||0,
          answers:     sub.answers||{},
          /* Timing — BOTH timestamp (Firestore TS) and submittedAt (ISO string) */
          submittedAt: sub.submittedAt||new Date().toISOString(),
          timestamp:   serverTimestamp(),
          timeTaken:   sub.timeTaken||0,
          autoSubmitted: sub.autoSubmitted||false,
          disqualified:  sub.disqualified||false
        };
        await setDoc(doc(_db,'submissions',sub.id), normalized);
        /* Always update user stats after contest submission */
        if(uid && sub.contestId !== 'practice') {
          await this._updateUserStats(uid, normalized);
        }
        return normalized;
      },

      async getSubmissions(){
        /* orderBy needs a Firestore index — fall back to unordered if missing */
        try {
          const s=await getDocs(query(collection(_db,'submissions'),orderBy('submittedAt','desc')));
          return s.docs.map(d=>({id:d.id,...d.data()}));
        } catch(e) {
          console.warn('[BDOH] getSubmissions ordered failed (index missing?), falling back unordered:', e.code);
          const s=await getDocs(collection(_db,'submissions'));
          const all=s.docs.map(d=>({id:d.id,...d.data()}));
          return all.sort((a,b)=>(b.submittedAt||'').localeCompare(a.submittedAt||''));
        }
      },
      async getSubmissionsForContest(contestId){
        try {
          const q=query(collection(_db,'submissions'),
            where('contestId','==',contestId),orderBy('score','desc'));
          const s=await getDocs(q);
          return s.docs.map(d=>({id:d.id,...d.data()}));
        } catch(_){
          const s=await getDocs(collection(_db,'submissions'));
          return s.docs.map(d=>({id:d.id,...d.data()}))
            .filter(d=>d.contestId===contestId)
            .sort((a,b)=>(b.score||0)-(a.score||0));
        }
      },
      async getUserSubmissions(uid){
        /* Try user_id field first (profile.html query) */
        try {
          const q=query(collection(_db,'submissions'),
            where('user_id','==',uid),orderBy('timestamp','desc'),limit(50));
          const s=await getDocs(q);
          if(s.docs.length) return s.docs.map(d=>({id:d.id,...d.data()}));
        } catch(_){}
        /* Fallback: userId field */
        try {
          const q=query(collection(_db,'submissions'),
            where('userId','==',uid),orderBy('submittedAt','desc'),limit(50));
          const s=await getDocs(q);
          return s.docs.map(d=>({id:d.id,...d.data()}));
        } catch(_){ return []; }
      },

      /* LEADERBOARD */
      async getLeaderboard(type='global'){
        try {
          const field = type==='solvers'?'totalSolves':'rating';
          const q=query(collection(_db,'leaderboard'),orderBy(field,'desc'),limit(100));
          const s=await getDocs(q);
          if(s.docs.length) return s.docs.map((d,i)=>({id:d.id,rank:i+1,...d.data()}));
        } catch(_){}
        /* Fallback: build leaderboard from users collection */
        try {
          const field = type==='solvers'?'totalSolves':'rating';
          const s=await getDocs(query(collection(_db,'users'),orderBy(field,'desc'),limit(100)));
          return s.docs.map((d,i)=>({id:d.id,userId:d.id,rank:i+1,...d.data()}));
        } catch(_){ return []; }
      },
      async getContestLeaderboard(contestId){
        try {
          const s=await this.getSubmissionsForContest(contestId);
          return s.map((d,i)=>({...d,rank:i+1}));
        } catch(_){ return []; }
      },
      async recalculateLeaderboard(){
        const users=await this.getAllUsers(500);
        await Promise.all(users.map(u=>setDoc(doc(_db,'leaderboard',u.id),{
          userId:u.id, displayName:u.displayName||'—', photoURL:u.photoURL||null,
          institution:u.institution||'', rating:u.rating||1200,
          totalSolves:u.totalSolves||0, totalPoints:u.totalPoints||0,
          contestCount:u.contestCount||0,
          accuracy:u.totalAttempts>0?Math.round((u.totalSolves||0)/u.totalAttempts*100):0,
          subjectStats:u.subjectStats||{}, updatedAt:new Date().toISOString()
        },{merge:true})));
      },

      /* ACTIVITY LOGS */
      async logActivity(action,target,targetId,meta={}){
        const uid=_auth.currentUser?.uid; if(!uid)return;
        await addDoc(collection(_db,'activityLogs'),
          {userId:uid,action,target,targetId,timestamp:new Date().toISOString(),meta});
      },
      async getActivityLogs(n=50){
        try {
          const q=query(collection(_db,'activityLogs'),orderBy('timestamp','desc'),limit(n));
          const s=await getDocs(q);
          return s.docs.map(d=>({id:d.id,...d.data()}));
        } catch(_){ return []; }
      },

      /* RBAC */
      canDo(action){
        const r=BDOH.userRole||'user';
        const m={superadmin:['*'],
          admin:['manage_contests','manage_problems','view_submissions','view_users',
                 'manage_panelists','view_analytics','recalc_leaderboard','ban_users'],
          panelist:['create_problem','edit_own_problem'],
          moderator:['view_submissions','flag_submission','view_users'],
          user:['submit_answer','view_leaderboard','view_profile']};
        const p=m[r]||m.user;
        return p.includes('*')||p.includes(action);
      },

      /* ── INTERNAL: update user stats + leaderboard after every submission ──
         Uses atomic increment() — NO composite Firestore indexes required.
         Never re-queries all submissions, so it can't silently zero-out stats. ── */
      async _updateUserStats(uid, sub){
        try {
          const uRef  = doc(_db,'users',uid);
          const uSnap = await getDoc(uRef);
          if(!uSnap.exists()) return;
          const u = uSnap.data();

          /* ── What changed? ── */
          const scored     = sub.score||0;
          const isCorrect  = !!(sub.isCorrect || (scored>0 && scored>=(sub.maxScore||1)*.5));
          const isPractice = sub.contestId==='practice';

          /* ── Atomic field increments (single-field — no index needed) ── */
          const updates = {
            totalAttempts: increment(1),
            totalPoints:   increment(scored),
            lastActive:    serverTimestamp()
          };
          if(isCorrect) updates.totalSolves = increment(1);

          /* Track unique contest IDs so contestCount is accurate */
          if(!isPractice){
            const known = u.knownContestIds||[];
            if(!known.includes(sub.contestId)){
              updates.contestCount   = increment(1);
              updates.knownContestIds= [...known, sub.contestId];
            }
          }

          /* ── ELO delta — contests only ── */
          let newRating  = u.rating||1200;
          let ratingHist = u.ratingHistory||[1200];
          if(!isPractice && (sub.maxScore||0)>0){
            const pct   = scored/sub.maxScore;
            const delta = Math.round((pct-.5)*40);
            newRating   = Math.max(800,Math.min(3000,newRating+delta));
            ratingHist  = [...ratingHist,newRating].slice(-50);
            updates.rating        = newRating;
            updates.ratingHistory = ratingHist;
          }

          /* ── subjectStats — incremental merge ── */
          const ss      = {...(u.subjectStats||{})};
          const subject = sub.subject||'';
          if(subject&&subject!=='Mixed'){
            if(!ss[subject]) ss[subject]={solves:0,attempts:0};
            ss[subject]={
              attempts:(ss[subject].attempts||0)+1,
              solves:  (ss[subject].solves||0)+(isCorrect?1:0)
            };
            updates.subjectStats = ss;
          }

          /* ── Badges — projected totals ── */
          const badges     = [...(u.badges||[])];
          const award      = id=>{ if(!badges.includes(id)) badges.push(id); };
          const projSolves = (u.totalSolves||0)+(isCorrect?1:0);
          if(projSolves>=1)   award('first_solve');
          if(projSolves>=10)  award('10_solves');
          if(projSolves>=50)  award('50_solves');
          if(projSolves>=100) award('100_solves');
          if(newRating>=1400) award('rating_1400');
          if(newRating>=1600) award('rating_1600');
          if(newRating>=1800) award('rating_1800');
          if(newRating>=2000) award('rating_2000');
          const SUBJS=['Physics','Mathematics','Chemistry','Biology','Astronomy','Informatics'];
          if(SUBJS.every(s=>(ss[s]?.solves||0)>=1)) award('all_subjects');
          if(badges.length!==(u.badges||[]).length) updates.badges=badges;

          /* ── Write atomically ── */
          await updateDoc(uRef, updates);

          /* ── Update in-memory cache so profile page sees changes without reload ── */
          if(BDOH.userProfile&&BDOH.userProfile.uid===uid){
            BDOH.userProfile={
              ...BDOH.userProfile,
              totalAttempts:(BDOH.userProfile.totalAttempts||0)+1,
              totalPoints:  (BDOH.userProfile.totalPoints||0)+scored,
              totalSolves:  (BDOH.userProfile.totalSolves||0)+(isCorrect?1:0),
              rating:newRating, ratingHistory:ratingHist,
              subjectStats:ss, badges
            };
          }

          /* ── Sync /leaderboard/{uid} ── */
          const projAttempts = (u.totalAttempts||0)+1;
          const projPoints   = (u.totalPoints||0)+scored;
          const projContests = (u.contestCount||0)+(!isPractice&&!(u.knownContestIds||[]).includes(sub.contestId)?1:0);
          await setDoc(doc(_db,'leaderboard',uid),{
            userId:uid, displayName:u.displayName||'—', photoURL:u.photoURL||null,
            institution:u.institution||'', rating:newRating,
            totalSolves:projSolves, totalPoints:projPoints,
            accuracy:projAttempts>0?Math.round(projSolves/projAttempts*100):0,
            contestCount:projContests, subjectStats:ss,
            updatedAt:new Date().toISOString()
          },{merge:true});

        } catch(e){ console.warn('_updateUserStats error:',e); }
      }
    };

    _fbReady=true;
    _fbReadyCallbacks.forEach(cb=>cb(_db,_auth));
    _fbReadyCallbacks=[];

    /* ── Resolve the ready promise so admin.html can safely call BDOH_DB methods ── */
    _bdohDbReadyResolve(window.BDOH_DB);
    window.dispatchEvent(new CustomEvent('bdoh:dbReady', {detail: window.BDOH_DB}));

    /* Load and cache contests immediately */
    try {
      const cached=JSON.parse(localStorage.getItem('bdoh_contests_cache')||'[]');
      if(cached.length) BDOH.contests=cached;
    } catch(_){}
    try {
      window.BDOH_DB.getContests().then(fresh=>{
        BDOH.contests=fresh;
        localStorage.setItem('bdoh_contests_cache',JSON.stringify(fresh));
      }).catch(()=>{});
    } catch(_){}

  } catch(e){
    console.error('BDOH Firebase init error:',e);
    try{ BDOH.contests=JSON.parse(localStorage.getItem('bdoh_contests_cache')||'[]'); }catch(_){}
    _fbReady=true;
    _fbReadyCallbacks.forEach(cb=>cb(null,null));
    _fbReadyCallbacks=[];
    /* Resolve with null so awaiters don't hang forever */
    _bdohDbReadyResolve(null);
  }
})();

function bdohSave(){
  try{localStorage.setItem('bdoh_data_v1',JSON.stringify(
    {panelists:BDOH.panelists,problems:BDOH.problems,whatsapp:BDOH.whatsapp,contests:BDOH.contests}
  ));}catch(_){}
}

/* ── PRACTICE SUBMISSION HELPER — called from main.js submitAnswer() ── */
window.bdohSavePracticeResult = async function(problemId, isCorrect, userAnswer){
  if(!window.BDOH_DB) return;
  try { await window.BDOH_DB.savePracticeSubmission(problemId, isCorrect, userAnswer); }
  catch(e){ console.warn('Practice submission failed:',e); }
};
