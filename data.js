/* ================================================================
   BDOH DATA.JS — Firebase Firestore as single source of truth
   All devices (desktop, mobile, tablet) read/write the same DB.
   localStorage is used only as a fast offline cache fallback.
================================================================ */

/* ── Firebase config (shared across all pages) ── */
const BDOH_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBHl3ysjKWoQjJMOCtAPdfiURsXjjuRjck",
  authDomain: "bdoh-project.firebaseapp.com",
  projectId: "bdoh-project",
  storageBucket: "bdoh-project.firebasestorage.app",
  messagingSenderId: "413106966781",
  appId: "1:413106966781:web:f3123769a8d2cec02e2e94"
};

/* ── Hardcoded defaults (panelists, problems, whatsapp never need DB) ── */
const BDOH_DEFAULTS = {
  panelists: [
    {id:"p0",name:"Md.Mehedi Hasin Anjum",role:"President & Founder",subject:"Physics",isPresident:true,initials:"MH",photo:"assets/mehedi2.jpg",quote:"Every olympiad medal Bangladesh has ever won started with one student refusing to give up on a problem at midnight. This platform exists so that student is never alone.",achievements:["ISO, IGMO Gold Medalist","IPhO, WMTC TST Winner","Founded BDOH to make world-class olympiad training accessible to every student in every district"]},
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
  whatsapp:[
    {name:"Physics Hub",emoji:"⚛️",color:"#007B8F",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"423"},
    {name:"Maths Hub",emoji:"∞",color:"#4CAF50",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"546"},
    {name:"Biology Hub",emoji:"🌿",color:"#66bb6a",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"389"},
    {name:"Astronomy Hub",emoji:"🪐",color:"#FFD700",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"412"},
    {name:"Chemistry Hub",emoji:"🧪",color:"#00b4cc",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"397"},
    {name:"BDOH General Chat",emoji:"🏆",color:"#4CAF50",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"726"}
  ]
};

/* ── Global BDOH object — contests & submissions come from Firestore ── */
const BDOH = {
  panelists:   BDOH_DEFAULTS.panelists,
  problems:    BDOH_DEFAULTS.problems,
  whatsapp:    BDOH_DEFAULTS.whatsapp,
  contests:    [],   /* loaded from Firestore */
  submissions: []    /* loaded from Firestore */
};

/* ── Firestore helpers (loaded lazily) ── */
let _db = null;
let _fbReady = false;
let _fbReadyCallbacks = [];

/* Call this on any page that needs Firestore (index, exam) */
function bdohFirebaseReady(cb){ if(_fbReady) cb(_db); else _fbReadyCallbacks.push(cb); }

(async function initFirebase(){
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, addDoc, onSnapshot, serverTimestamp }
      = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

    const app = getApps().length ? getApps()[0] : initializeApp(BDOH_FIREBASE_CONFIG);
    _db = getFirestore(app);

    /* Attach helpers to global BDOH_DB so admin.html and exam.html can call them */
    window.BDOH_DB = {
      db: _db,

      /* ── Read all contests once ── */
      async getContests(){
        const snap = await getDocs(collection(_db,'contests'));
        return snap.docs.map(d=>({id:d.id,...d.data()}));
      },

      /* ── Save (create or update) a contest ── */
      async saveContest(contest){
        const ref = doc(_db,'contests',contest.id);
        await setDoc(ref, contest, {merge:true});
      },

      /* ── Delete a contest ── */
      async deleteContest(id){
        await deleteDoc(doc(_db,'contests',id));
      },

      /* ── Save a submission ── */
      async saveSubmission(sub){
        await setDoc(doc(_db,'submissions',sub.id), sub);
      },

      /* ── Get all submissions ── */
      async getSubmissions(){
        const snap = await getDocs(collection(_db,'submissions'));
        return snap.docs.map(d=>({id:d.id,...d.data()}));
      },

      /* ── Real-time listener: fires callback whenever contests change ── */
      onContestsChange(cb){
        return onSnapshot(collection(_db,'contests'), snap=>{
          const contests = snap.docs.map(d=>({id:d.id,...d.data()}));
          BDOH.contests = contests;
          cb(contests);
        });
      }
    };

    _fbReady = true;
    _fbReadyCallbacks.forEach(cb=>cb(_db));
    _fbReadyCallbacks = [];

  } catch(e){
    console.error('BDOH Firebase init error:', e);
    /* Fallback: load contests from localStorage cache */
    try {
      const cached = JSON.parse(localStorage.getItem('bdoh_contests_cache')||'[]');
      BDOH.contests = cached;
    } catch(_){}
    _fbReady = true;
    _fbReadyCallbacks.forEach(cb=>cb(null));
    _fbReadyCallbacks = [];
  }
})();
