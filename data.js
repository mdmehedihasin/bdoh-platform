/* ================================================================
   BDOH DATA.JS  v4.0 — Firebase Firestore as single source of truth
   Upgraded: User Auth & Profiles, RBAC, Problems, Contests,
             Submissions, Leaderboards, and all Firestore API helpers.
   All devices (desktop, mobile, tablet) read/write the same DB.
   localStorage is used only as a fast offline cache fallback.
================================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────────
   SECTION 1 — FIREBASE CONFIG
   Shared across all pages.
──────────────────────────────────────────────────────────────── */
const BDOH_FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBHl3ysjKWoQjJMOCtAPdfiURsXjjuRjck",
  authDomain:        "bdoh-project.firebaseapp.com",
  projectId:         "bdoh-project",
  storageBucket:     "bdoh-project.firebasestorage.app",
  messagingSenderId: "413106966781",
  appId:             "1:413106966781:web:f3123769a8d2cec02e2e94"
};

/* ────────────────────────────────────────────────────────────────
   SECTION 2 — ROLE-BASED ACCESS CONTROL (RBAC) DEFINITIONS
   Roles: super_admin > admin > panelist > moderator > user
──────────────────────────────────────────────────────────────── */
const BDOH_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN:       'admin',
  PANELIST:    'panelist',
  MODERATOR:   'moderator',
  USER:        'user'
};

/* Permissions matrix — what each role can do */
const BDOH_PERMISSIONS = {
  /* Super Admin: all powers */
  super_admin: [
    'manage_users', 'manage_admins', 'manage_roles',
    'create_problem', 'edit_any_problem', 'delete_problem', 'publish_problem',
    'create_contest', 'edit_contest', 'delete_contest', 'publish_contest',
    'view_all_submissions', 'delete_submission',
    'view_analytics', 'manage_leaderboard',
    'send_announcements', 'manage_settings'
  ],
  /* Admin: site management but cannot change roles above admin */
  admin: [
    'manage_users',
    'create_problem', 'edit_any_problem', 'delete_problem', 'publish_problem',
    'create_contest', 'edit_contest', 'delete_contest', 'publish_contest',
    'view_all_submissions',
    'view_analytics', 'manage_leaderboard',
    'send_announcements'
  ],
  /* Panelist: can only edit problems they are assigned to */
  panelist: [
    'create_problem', 'edit_assigned_problem', 'publish_problem'
  ],
  /* Moderator: content review */
  moderator: [
    'view_all_submissions', 'delete_submission', 'send_announcements'
  ],
  /* Regular user */
  user: []
};

/**
 * Check if a role has a specific permission.
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
function bdohHasPermission(role, permission) {
  const perms = BDOH_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

/* ────────────────────────────────────────────────────────────────
   SECTION 3 — FIRESTORE DATA MODELS (schemas as JSDoc for clarity)
──────────────────────────────────────────────────────────────── */

/**
 * @typedef {Object} BDOHUser
 * @property {string}   uid            - Firebase Auth UID (doc ID)
 * @property {string}   email
 * @property {string}   displayName
 * @property {string}   photoURL
 * @property {string}   role           - one of BDOH_ROLES
 * @property {string[]} assignedProblems - problem IDs (panelist only)
 * @property {string}   institution    - school/college
 * @property {string}   district
 * @property {string}   division
 * @property {string[]} subjects       - interests e.g. ["Physics","Math"]
 * @property {number}   rating         - ELO rating, starts at 1200
 * @property {number}   totalSolves
 * @property {number}   totalAttempts
 * @property {number}   totalPoints
 * @property {number}   contestCount
 * @property {Object}   subjectStats   - { Physics: { solves, attempts }, … }
 * @property {number[]} ratingHistory  - array of past ratings
 * @property {string[]} badges         - earned badge IDs
 * @property {string}   bio
 * @property {boolean}  isVerified
 * @property {boolean}  isBanned
 * @property {string}   banReason
 * @property {Timestamp} createdAt
 * @property {Timestamp} lastActive
 */

/**
 * @typedef {Object} BDOHProblem
 * @property {string}   id
 * @property {string}   title
 * @property {string}   subject        - Physics | Mathematics | Chemistry | Biology | Astronomy | Informatics
 * @property {string}   difficulty     - Easy | Medium | Hard | Expert
 * @property {string}   statement      - full problem text (supports LaTeX via MathJax)
 * @property {string}   hint           - optional hint text
 * @property {string}   solution       - full solution (hidden until unlocked)
 * @property {string}   answer         - the correct numeric/text answer
 * @property {number}   tolerance      - acceptable numeric delta (0 for exact)
 * @property {string}   answerType     - 'numeric' | 'exact' | 'mcq'
 * @property {string[]} options        - MCQ choices (if answerType === 'mcq')
 * @property {number}   correctOption  - index of correct MCQ option
 * @property {number}   points
 * @property {number}   solves
 * @property {number}   attempts
 * @property {number}   timeMin        - suggested solve time in minutes
 * @property {string}   authorUid      - creator's UID
 * @property {string[]} panelists      - UIDs of assigned panelists
 * @property {string}   status         - 'draft' | 'review' | 'published' | 'archived'
 * @property {string[]} tags
 * @property {Timestamp} createdAt
 * @property {Timestamp} updatedAt
 */

/**
 * @typedef {Object} BDOHContest
 * @property {string}   id
 * @property {string}   title
 * @property {string}   description
 * @property {string}   subject        - subject or 'Mixed'
 * @property {string}   type           - 'olympiad' | 'practice' | 'ranked' | 'mock'
 * @property {string[]} problemIds     - ordered list of problem IDs
 * @property {number}   durationMin    - contest duration in minutes
 * @property {Timestamp} startTime
 * @property {Timestamp} endTime
 * @property {string}   status         - 'draft' | 'scheduled' | 'live' | 'ended' | 'archived'
 * @property {string}   reviewMode     - 'locked' | 'partial' | 'full'
 *   locked  → no solutions/scores visible after end
 *   partial → scores visible, solutions still locked
 *   full    → everything visible
 * @property {boolean}  requiresReg    - registration required?
 * @property {number}   maxParticipants
 * @property {string[]} allowedRoles   - roles permitted to join (empty = all)
 * @property {boolean}  antiCheat      - enable tab-switch detection?
 * @property {number}   warningLimit   - tab-switch warnings before DQ
 * @property {string}   authorUid
 * @property {number}   participantCount
 * @property {Timestamp} createdAt
 * @property {Timestamp} updatedAt
 */

/**
 * @typedef {Object} BDOHSubmission
 * @property {string}   id             - auto-generated
 * @property {string}   contestId      - null for standalone problem solve
 * @property {string}   problemId
 * @property {string}   userUid
 * @property {string}   userName
 * @property {string}   userInstitution
 * @property {any}      answer         - submitted answer
 * @property {boolean}  isCorrect
 * @property {number}   pointsEarned
 * @property {number}   timeTakenSec   - seconds from start to submit
 * @property {string}   status         - 'correct' | 'wrong' | 'partial' | 'pending'
 * @property {Timestamp} submittedAt
 */

/**
 * @typedef {Object} BDOHLeaderboardEntry
 * @property {string}   uid
 * @property {string}   displayName
 * @property {string}   institution
 * @property {string}   photoURL
 * @property {number}   rating
 * @property {number}   totalPoints
 * @property {number}   totalSolves
 * @property {number}   contestCount
 * @property {string}   topSubject
 * @property {Timestamp} updatedAt
 */

/* ────────────────────────────────────────────────────────────────
   SECTION 4 — HARDCODED DEFAULTS
   (panelists, seed problems, whatsapp — never need DB round-trip)
──────────────────────────────────────────────────────────────── */
const BDOH_DEFAULTS = {
  panelists: [
    {
      id:"p0", name:"Md.Mehedi Hasin Anjum", role:"President & Founder",
      subject:"Physics", isPresident:true, initials:"MH", photo:"assets/mehedi2.jpg",
      quote:"Every olympiad medal Bangladesh has ever won started with one student refusing to give up on a problem at midnight. This platform exists so that student is never alone.",
      achievements:[
        "ISO, IGMO Gold Medalist",
        "IPhO, WMTC TST Winner",
        "Founded BDOH to make world-class olympiad training accessible to every student in every district"
      ]
    },
    {
      id:"p1", name:"Talha Harun", role:"Core Math Executive",
      subject:"Mathematics", isPresident:false, initials:"TH", photo:"assets/talha.jpg",
      achievements:[
        "WMTC, ICO Silver Medalist",
        "Regional Winner at BDMO",
        "Former 2x2 National Record Holder"
      ]
    },
    {
      id:"p2", name:"Istiak Ahmed", role:"Core Math Executive",
      subject:"Mathematics", isPresident:false, initials:"IA", photo:"assets/istiak.jpg",
      achievements:[
        "Nationalist at BDMO'24'25",
        "National Winner at BMTC'24'25",
        "NDMC Academic Member"
      ]
    },
    {
      id:"p3", name:"Abdul Majid", role:"Core Physics Executive",
      subject:"Physics", isPresident:false, initials:"AM", photo:"assets/majid.jpg",
      achievements:[
        "Joint Secretary of Physics at RCSC",
        "IPhO, BdJSO TST Camper",
        "Regional Winner at BdPhO,BdChO"
      ]
    },
    {
      id:"p4", name:"Rakibul Hasan Siam", role:"Core Chemistry Executive",
      subject:"Chemistry", isPresident:false, initials:"RHS", photo:"assets/siam.jpg",
      achievements:[
        "Excellence Honor Awardee at International Environment Olympiad",
        "Nationalist at BdChO'26",
        "Merit Award at BdOC ChO"
      ]
    },
    {
      id:"p5", name:"Radi Amamul", role:"Core Astronomy Executive",
      subject:"Astronomy", isPresident:false, initials:"RA", photo:"assets/radi.jpg",
      achievements:[
        "Nationalist at BdOAA'24'26",
        "Nationalist at BAO'24'25",
        "NDESC Academic Member"
      ]
    },
    {
      id:"p6", name:"Nafis Sazzad Niloy", role:"Core Math Executive",
      subject:"Math", isPresident:false, initials:"NSN", photo:"assets/niloy.jpg",
      achievements:[
        "Nationalist at BdMO'24'25",
        "National Winner at BMTC",
        "2nd Runner Up at 45th NSO"
      ]
    },
    {
      id:"p7", name:"Sarder Raghib Nihal", role:"Core Chemistry Executive",
      subject:"Chemistry", isPresident:false, initials:"SRN", photo:"assets/nihal.jpg",
      achievements:[
        "Regional Winner at BdChO",
        "Regional Winner at BdMO"
      ]
    }
  ],

  problems: [
    {
      id:"q1", subject:"Physics", difficulty:"Easy",
      title:"Projectile on an Inclined Plane",
      statement:"A ball is launched from the base of a smooth inclined plane at 45° to the horizontal. The incline itself makes 30° with the horizontal. Find the ratio of the range along the incline surface to the range on flat ground for the same launch speed.",
      hint:"Resolve gravity into components parallel and perpendicular to the incline surface.",
      solution:"Ratio simplifies to approximately 0.75.",
      answer:"0.75", tolerance:0.05,
      answerType:"numeric", options:[], correctOption:-1,
      solves:1240, attempts:1800, timeMin:15, points:10,
      authorUid:"system", panelists:[], status:"published", tags:["kinematics","projectile"],
      createdAt:null, updatedAt:null
    },
    {
      id:"q2", subject:"Mathematics", difficulty:"Medium",
      title:"Divisibility and Modular Arithmetic",
      statement:"Find the largest positive integer k such that k divides n⁵ − n for every integer n.",
      hint:"Factor n⁵ − n and use Fermat's Little Theorem.",
      solution:"By FLT n⁵≡n (mod 5). Also divisible by 6. So k=LCM(2,3,5)=30.",
      answer:"30", tolerance:0,
      answerType:"numeric", options:[], correctOption:-1,
      solves:876, attempts:1240, timeMin:25, points:15,
      authorUid:"system", panelists:[], status:"published", tags:["number-theory","modular"],
      createdAt:null, updatedAt:null
    },
    {
      id:"q3", subject:"Chemistry", difficulty:"Easy",
      title:"pH at the Half-Equivalence Point",
      statement:"A 25 mL sample of 0.10 M acetic acid (Ka=1.8×10⁻⁵) is titrated with 0.10 M NaOH. Calculate the pH at the half-equivalence point.",
      hint:"At half-equivalence [HA]=[A⁻] so log term vanishes.",
      solution:"pH = pKa = 4.74.",
      answer:"4.74", tolerance:0.05,
      answerType:"numeric", options:[], correctOption:-1,
      solves:954, attempts:1400, timeMin:20, points:10,
      authorUid:"system", panelists:[], status:"published", tags:["acid-base","titration"],
      createdAt:null, updatedAt:null
    },
    {
      id:"q4", subject:"Biology", difficulty:"Medium",
      title:"Dihybrid Cross — Dominant Phenotype Fraction",
      statement:"Two plants AaBb × AaBb. What fraction of offspring show both dominant phenotypes?",
      hint:"P(A_)=3/4, P(B_)=3/4. Multiply.",
      solution:"9/16 = 0.5625.",
      answer:"0.5625", tolerance:0.001,
      answerType:"numeric", options:[], correctOption:-1,
      solves:720, attempts:1050, timeMin:15, points:10,
      authorUid:"system", panelists:[], status:"published", tags:["genetics","mendelian"],
      createdAt:null, updatedAt:null
    },
    {
      id:"q5", subject:"Astronomy", difficulty:"Hard",
      title:"Binary Star Orbital Period",
      statement:"Two stars 2M☉ and 3M☉, separation 4 AU. Find orbital period in years.",
      hint:"T²=4π²a³/G(M₁+M₂). Convert AU to metres.",
      solution:"T ≈ 2.19 years.",
      answer:"2.19", tolerance:0.12,
      answerType:"numeric", options:[], correctOption:-1,
      solves:198, attempts:560, timeMin:45, points:25,
      authorUid:"system", panelists:[], status:"published", tags:["orbital-mechanics","kepler"],
      createdAt:null, updatedAt:null
    },
    {
      id:"q6", subject:"Informatics", difficulty:"Hard",
      title:"Constrained Minimum Spanning Tree",
      statement:"MST weight 15. Must include edge E (weight 7). Heaviest non-E cycle edge = 4. Find constrained MST weight.",
      hint:"Add E then remove heaviest non-E cycle edge.",
      solution:"15+7−4=18.",
      answer:"18", tolerance:0,
      answerType:"numeric", options:[], correctOption:-1,
      solves:312, attempts:720, timeMin:60, points:25,
      authorUid:"system", panelists:[], status:"published", tags:["graph-theory","mst"],
      createdAt:null, updatedAt:null
    }
  ],

  whatsapp: [
    { name:"Physics Hub",      emoji:"⚛️",  color:"#007B8F", link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic", members:"423" },
    { name:"Maths Hub",        emoji:"∞",   color:"#4CAF50", link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic", members:"546" },
    { name:"Biology Hub",      emoji:"🌿",  color:"#66bb6a", link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic", members:"389" },
    { name:"Astronomy Hub",    emoji:"🪐",  color:"#FFD700", link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic", members:"412" },
    { name:"Chemistry Hub",    emoji:"🧪",  color:"#00b4cc", link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic", members:"397" },
    { name:"BDOH General Chat",emoji:"🏆",  color:"#4CAF50", link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic", members:"726" }
  ],

  /* ELO / Rating constants */
  rating: {
    initial:   1200,
    kFactor:   32,    /* k-factor for ELO calculation */
    maxDelta:  400    /* max rating swing per contest */
  },

  /* Badge definitions */
  badges: [
    { id:"first_solve",    label:"First Blood",    icon:"🩸", desc:"Solved your very first problem" },
    { id:"streak_7",       label:"Weekly Warrior",  icon:"🔥", desc:"7-day solve streak" },
    { id:"streak_30",      label:"Month Master",    icon:"🌙", desc:"30-day solve streak" },
    { id:"top10_contest",  label:"Podium",          icon:"🏅", desc:"Finished top 10 in a contest" },
    { id:"gold_contest",   label:"Gold Medalist",   icon:"🥇", desc:"Finished #1 in a ranked contest" },
    { id:"100_solves",     label:"Century Club",    icon:"💯", desc:"Solved 100 problems" },
    { id:"all_subjects",   label:"Polymath",        icon:"🎓", desc:"Solved at least 1 problem in every subject" },
    { id:"speed_demon",    label:"Speed Demon",     icon:"⚡", desc:"Solved a Hard problem in under 5 minutes" },
    { id:"rating_1500",    label:"Expert",          icon:"⭐", desc:"Reached rating 1500" },
    { id:"rating_1800",    label:"Master",          icon:"🌟", desc:"Reached rating 1800" },
    { id:"rating_2000",    label:"Grandmaster",     icon:"💎", desc:"Reached rating 2000" }
  ]
};

/* ────────────────────────────────────────────────────────────────
   SECTION 5 — GLOBAL BDOH STATE OBJECT
   Contests & submissions come from Firestore; rest from defaults.
──────────────────────────────────────────────────────────────── */
const BDOH = {
  panelists:   BDOH_DEFAULTS.panelists,
  problems:    BDOH_DEFAULTS.problems,
  whatsapp:    BDOH_DEFAULTS.whatsapp,
  contests:    [],   /* loaded from Firestore */
  submissions: [],   /* loaded from Firestore */
  currentUser: null, /* BDOHUser object of logged-in user */
  authReady:   false /* true once Firebase Auth has resolved */
};

/* ────────────────────────────────────────────────────────────────
   SECTION 6 — FIREBASE INIT (lazy, async)
──────────────────────────────────────────────────────────────── */
let _db   = null;
let _auth = null;
let _fbReady = false;
let _fbReadyCallbacks = [];

/** Register a callback to run once Firebase is ready. */
function bdohFirebaseReady(cb) {
  if (_fbReady) cb(_db, _auth);
  else _fbReadyCallbacks.push(cb);
}

/** Broadcast readiness to all waiting callers. */
function _resolveFbReady() {
  _fbReady = true;
  _fbReadyCallbacks.forEach(cb => cb(_db, _auth));
  _fbReadyCallbacks = [];
}

(async function initFirebase() {
  try {
    const { initializeApp, getApps } =
      await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");

    const {
      getFirestore, collection, doc,
      getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
      onSnapshot, query, where, orderBy, limit,
      serverTimestamp, increment, arrayUnion, arrayRemove,
      runTransaction, writeBatch
    } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

    const {
      getAuth,
      onAuthStateChanged,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signInWithPopup,
      GoogleAuthProvider,
      signOut,
      updateProfile,
      sendPasswordResetEmail,
      EmailAuthProvider,
      reauthenticateWithCredential,
      updatePassword
    } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");

    /* Boot Firebase app */
    const app = getApps().length ? getApps()[0] : initializeApp(BDOH_FIREBASE_CONFIG);
    _db   = getFirestore(app);
    _auth = getAuth(app);

    /* ══════════════════════════════════════════════════════════
       AUTH API  — window.BDOH_AUTH
    ══════════════════════════════════════════════════════════ */
    window.BDOH_AUTH = {

      /**
       * Register with email + password, then create Firestore profile.
       * @param {string} email
       * @param {string} password
       * @param {Object} profile  { displayName, institution, district, division, subjects[] }
       * @returns {Promise<BDOHUser>}
       */
      async register(email, password, profile = {}) {
        const cred = await createUserWithEmailAndPassword(_auth, email, password);
        await updateProfile(cred.user, { displayName: profile.displayName || email.split('@')[0] });
        const user = await BDOH_AUTH._createUserDoc(cred.user, profile);
        BDOH.currentUser = user;
        return user;
      },

      /**
       * Sign in with email + password.
       * @param {string} email
       * @param {string} password
       * @returns {Promise<BDOHUser>}
       */
      async loginEmail(email, password) {
        const cred = await signInWithEmailAndPassword(_auth, email, password);
        const user = await BDOH_AUTH._ensureUserDoc(cred.user);
        BDOH.currentUser = user;
        return user;
      },

      /**
       * Sign in with Google OAuth popup.
       * @returns {Promise<BDOHUser>}
       */
      async loginGoogle() {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        const cred = await signInWithPopup(_auth, provider);
        const user = await BDOH_AUTH._ensureUserDoc(cred.user);
        BDOH.currentUser = user;
        return user;
      },

      /** Sign out the current user. */
      async logout() {
        await signOut(_auth);
        BDOH.currentUser = null;
      },

      /**
       * Send password reset email.
       * @param {string} email
       */
      async resetPassword(email) {
        await sendPasswordResetEmail(_auth, email);
      },

      /**
       * Change password (requires re-authentication).
       * @param {string} currentPassword
       * @param {string} newPassword
       */
      async changePassword(currentPassword, newPassword) {
        const user = _auth.currentUser;
        if (!user) throw new Error('Not logged in');
        const cred = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, cred);
        await updatePassword(user, newPassword);
      },

      /**
       * Listen to auth state changes. Fires immediately with current state.
       * @param {Function} cb  receives (BDOHUser|null)
       */
      onAuthChange(cb) {
        return onAuthStateChanged(_auth, async (firebaseUser) => {
          if (firebaseUser) {
            const user = await BDOH_AUTH._ensureUserDoc(firebaseUser);
            BDOH.currentUser = user;
            BDOH.authReady = true;
            cb(user);
          } else {
            BDOH.currentUser = null;
            BDOH.authReady = true;
            cb(null);
          }
        });
      },

      /** Create a Firestore user document from a Firebase Auth user + extra profile data. */
      async _createUserDoc(firebaseUser, profile = {}) {
        const uid = firebaseUser.uid;
        const now = serverTimestamp();
        const userData = {
          uid,
          email:           firebaseUser.email || '',
          displayName:     profile.displayName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL:        firebaseUser.photoURL || '',
          role:            BDOH_ROLES.USER,
          assignedProblems:[],
          institution:     profile.institution || '',
          district:        profile.district    || '',
          division:        profile.division    || '',
          subjects:        profile.subjects    || [],
          rating:          BDOH_DEFAULTS.rating.initial,
          totalSolves:     0,
          totalAttempts:   0,
          totalPoints:     0,
          contestCount:    0,
          subjectStats:    {},
          ratingHistory:   [BDOH_DEFAULTS.rating.initial],
          badges:          [],
          bio:             profile.bio || '',
          isVerified:      false,
          isBanned:        false,
          banReason:       '',
          createdAt:       now,
          lastActive:      now
        };
        await setDoc(doc(_db, 'users', uid), userData);
        return { ...userData, createdAt: new Date(), lastActive: new Date() };
      },

      /** Fetch user doc; create it if it doesn't exist yet (first Google login). */
      async _ensureUserDoc(firebaseUser) {
        const ref = doc(_db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          /* Update lastActive on each login */
          await updateDoc(ref, { lastActive: serverTimestamp() });
          return { uid: firebaseUser.uid, ...snap.data() };
        } else {
          return BDOH_AUTH._createUserDoc(firebaseUser, {
            displayName: firebaseUser.displayName,
            photoURL:    firebaseUser.photoURL
          });
        }
      }
    };

    /* ══════════════════════════════════════════════════════════
       USERS API  — window.BDOH_USERS
    ══════════════════════════════════════════════════════════ */
    window.BDOH_USERS = {

      /**
       * Get a single user by UID.
       * @param {string} uid
       * @returns {Promise<BDOHUser|null>}
       */
      async getUser(uid) {
        const snap = await getDoc(doc(_db, 'users', uid));
        return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
      },

      /**
       * List users with optional filters.
       * @param {Object} opts  { role, limit: number, orderByField, banned }
       * @returns {Promise<BDOHUser[]>}
       */
      async listUsers({ role, max = 100, banned } = {}) {
        let q = collection(_db, 'users');
        const constraints = [];
        if (role)   constraints.push(where('role', '==', role));
        if (banned !== undefined) constraints.push(where('isBanned', '==', banned));
        constraints.push(orderBy('rating', 'desc'));
        constraints.push(limit(max));
        const snap = await getDocs(query(q, ...constraints));
        return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      },

      /**
       * Update a user's profile fields.
       * @param {string} uid
       * @param {Object} data  partial BDOHUser fields
       */
      async updateUser(uid, data) {
        data.updatedAt = serverTimestamp();
        await updateDoc(doc(_db, 'users', uid), data);
      },

      /**
       * Change a user's role (admin+ only; enforce in UI).
       * @param {string} uid
       * @param {string} newRole  one of BDOH_ROLES
       */
      async setRole(uid, newRole) {
        await updateDoc(doc(_db, 'users', uid), { role: newRole });
      },

      /**
       * Assign problems to a panelist.
       * @param {string} panelistUid
       * @param {string[]} problemIds
       */
      async assignProblems(panelistUid, problemIds) {
        await updateDoc(doc(_db, 'users', panelistUid), {
          assignedProblems: problemIds
        });
      },

      /**
       * Ban or unban a user.
       * @param {string} uid
       * @param {boolean} banned
       * @param {string} reason
       */
      async setBanned(uid, banned, reason = '') {
        await updateDoc(doc(_db, 'users', uid), {
          isBanned:  banned,
          banReason: reason
        });
      },

      /**
       * Award a badge to a user (idempotent).
       * @param {string} uid
       * @param {string} badgeId
       */
      async awardBadge(uid, badgeId) {
        await updateDoc(doc(_db, 'users', uid), {
          badges: arrayUnion(badgeId)
        });
      },

      /**
       * Update a user's rating and append to history.
       * @param {string} uid
       * @param {number} newRating
       */
      async updateRating(uid, newRating) {
        await updateDoc(doc(_db, 'users', uid), {
          rating:        newRating,
          ratingHistory: arrayUnion(newRating)
        });
      },

      /**
       * Listen to a user document in real-time.
       * @param {string} uid
       * @param {Function} cb
       */
      onUserChange(uid, cb) {
        return onSnapshot(doc(_db, 'users', uid), snap => {
          if (snap.exists()) cb({ uid: snap.id, ...snap.data() });
        });
      }
    };

    /* ══════════════════════════════════════════════════════════
       PROBLEMS API  — window.BDOH_PROBLEMS
    ══════════════════════════════════════════════════════════ */
    window.BDOH_PROBLEMS = {

      /**
       * Fetch a single problem by ID.
       * @param {string} id
       * @returns {Promise<BDOHProblem|null>}
       */
      async getProblem(id) {
        const snap = await getDoc(doc(_db, 'problems', id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
      },

      /**
       * List problems with filters.
       * @param {Object} opts  { subject, difficulty, status, authorUid, max }
       * @returns {Promise<BDOHProblem[]>}
       */
      async listProblems({ subject, difficulty, status = 'published', authorUid, max = 50 } = {}) {
        const constraints = [];
        if (subject)   constraints.push(where('subject',    '==', subject));
        if (difficulty)constraints.push(where('difficulty', '==', difficulty));
        if (status)    constraints.push(where('status',     '==', status));
        if (authorUid) constraints.push(where('authorUid',  '==', authorUid));
        constraints.push(orderBy('createdAt', 'desc'));
        constraints.push(limit(max));
        const snap = await getDocs(query(collection(_db, 'problems'), ...constraints));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },

      /**
       * List problems assigned to a specific panelist.
       * @param {string} panelistUid
       * @returns {Promise<BDOHProblem[]>}
       */
      async listAssignedProblems(panelistUid) {
        const snap = await getDocs(
          query(collection(_db, 'problems'),
            where('panelists', 'array-contains', panelistUid))
        );
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },

      /**
       * Create or overwrite a problem document.
       * @param {BDOHProblem} problem
       */
      async saveProblem(problem) {
        const now = serverTimestamp();
        const data = {
          ...problem,
          updatedAt: now,
          createdAt: problem.createdAt || now
        };
        await setDoc(doc(_db, 'problems', problem.id), data, { merge: true });
      },

      /**
       * Delete a problem (admin+ only).
       * @param {string} id
       */
      async deleteProblem(id) {
        await deleteDoc(doc(_db, 'problems', id));
      },

      /**
       * Change a problem's publish status.
       * @param {string} id
       * @param {string} status  'draft'|'review'|'published'|'archived'
       */
      async setStatus(id, status) {
        await updateDoc(doc(_db, 'problems', id), {
          status,
          updatedAt: serverTimestamp()
        });
      },

      /**
       * Increment solve/attempt counters atomically.
       * @param {string} id
       * @param {boolean} correct
       */
      async recordAttempt(id, correct) {
        const updates = { attempts: increment(1) };
        if (correct) updates.solves = increment(1);
        await updateDoc(doc(_db, 'problems', id), updates);
      },

      /** Real-time listener for a problem list (published only, by subject). */
      onProblemsChange(subject, cb) {
        const constraints = [where('status', '==', 'published')];
        if (subject) constraints.push(where('subject', '==', subject));
        constraints.push(orderBy('createdAt', 'desc'));
        return onSnapshot(
          query(collection(_db, 'problems'), ...constraints),
          snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
      }
    };

    /* ══════════════════════════════════════════════════════════
       SUBMISSIONS API  — window.BDOH_SUBMISSIONS
    ══════════════════════════════════════════════════════════ */
    window.BDOH_SUBMISSIONS = {

      /**
       * Save a submission.
       * @param {BDOHSubmission} sub
       * @returns {Promise<string>}  doc ID
       */
      async save(sub) {
        const data = { ...sub, submittedAt: serverTimestamp() };
        if (sub.id) {
          await setDoc(doc(_db, 'submissions', sub.id), data);
          return sub.id;
        } else {
          const ref = await addDoc(collection(_db, 'submissions'), data);
          return ref.id;
        }
      },

      /**
       * Get all submissions for a user.
       * @param {string} userUid
       * @param {number} max
       * @returns {Promise<BDOHSubmission[]>}
       */
      async getByUser(userUid, max = 100) {
        const snap = await getDocs(
          query(collection(_db, 'submissions'),
            where('userUid', '==', userUid),
            orderBy('submittedAt', 'desc'),
            limit(max))
        );
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },

      /**
       * Get all submissions for a contest.
       * @param {string} contestId
       * @returns {Promise<BDOHSubmission[]>}
       */
      async getByContest(contestId) {
        const snap = await getDocs(
          query(collection(_db, 'submissions'),
            where('contestId', '==', contestId),
            orderBy('submittedAt', 'asc'))
        );
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },

      /**
       * Check if a user already solved a specific problem (standalone).
       * @param {string} userUid
       * @param {string} problemId
       * @returns {Promise<boolean>}
       */
      async hasSolved(userUid, problemId) {
        const snap = await getDocs(
          query(collection(_db, 'submissions'),
            where('userUid',   '==', userUid),
            where('problemId', '==', problemId),
            where('isCorrect', '==', true),
            where('contestId', '==', null),
            limit(1))
        );
        return !snap.empty;
      },

      /**
       * Get all submissions (admin view).
       * @param {number} max
       * @returns {Promise<BDOHSubmission[]>}
       */
      async getAll(max = 200) {
        const snap = await getDocs(
          query(collection(_db, 'submissions'),
            orderBy('submittedAt', 'desc'),
            limit(max))
        );
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },

      /**
       * Delete a submission (moderator+).
       * @param {string} id
       */
      async delete(id) {
        await deleteDoc(doc(_db, 'submissions', id));
      },

      /** Real-time listener for a contest's submissions. */
      onContestSubmissions(contestId, cb) {
        return onSnapshot(
          query(collection(_db, 'submissions'),
            where('contestId', '==', contestId),
            orderBy('submittedAt', 'asc')),
          snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
      }
    };

    /* ══════════════════════════════════════════════════════════
       CONTESTS API  — window.BDOH_CONTESTS
    ══════════════════════════════════════════════════════════ */
    window.BDOH_CONTESTS = {

      /**
       * Fetch a single contest.
       * @param {string} id
       * @returns {Promise<BDOHContest|null>}
       */
      async getContest(id) {
        const snap = await getDoc(doc(_db, 'contests', id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
      },

      /**
       * List contests.
       * @param {Object} opts  { status, type, max }
       * @returns {Promise<BDOHContest[]>}
       */
      async listContests({ status, type, max = 50 } = {}) {
        const constraints = [];
        if (status) constraints.push(where('status', '==', status));
        if (type)   constraints.push(where('type',   '==', type));
        constraints.push(orderBy('startTime', 'desc'));
        constraints.push(limit(max));
        const snap = await getDocs(query(collection(_db, 'contests'), ...constraints));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },

      /**
       * Create or update a contest.
       * @param {BDOHContest} contest
       */
      async saveContest(contest) {
        const now = serverTimestamp();
        const data = {
          ...contest,
          updatedAt: now,
          createdAt: contest.createdAt || now,
          participantCount: contest.participantCount || 0
        };
        await setDoc(doc(_db, 'contests', contest.id), data, { merge: true });
      },

      /**
       * Delete a contest.
       * @param {string} id
       */
      async deleteContest(id) {
        await deleteDoc(doc(_db, 'contests', id));
      },

      /**
       * Update a contest's status.
       * @param {string} id
       * @param {string} status  'draft'|'scheduled'|'live'|'ended'|'archived'
       */
      async setStatus(id, status) {
        await updateDoc(doc(_db, 'contests', id), {
          status,
          updatedAt: serverTimestamp()
        });
      },

      /**
       * Update review mode after a contest ends.
       * @param {string} id
       * @param {string} mode  'locked'|'partial'|'full'
       */
      async setReviewMode(id, mode) {
        await updateDoc(doc(_db, 'contests', id), {
          reviewMode: mode,
          updatedAt:  serverTimestamp()
        });
      },

      /**
       * Increment participant count atomically.
       * @param {string} id
       */
      async incrementParticipants(id) {
        await updateDoc(doc(_db, 'contests', id), {
          participantCount: increment(1)
        });
      },

      /** Real-time listener for all contests. Fires immediately + on every change. */
      onContestsChange(cb) {
        return onSnapshot(
          query(collection(_db, 'contests'), orderBy('startTime', 'desc')),
          snap => {
            const contests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            BDOH.contests = contests;
            cb(contests);
          }
        );
      },

      /** Real-time listener for a single contest. */
      onContestChange(id, cb) {
        return onSnapshot(doc(_db, 'contests', id), snap => {
          if (snap.exists()) cb({ id: snap.id, ...snap.data() });
        });
      }
    };

    /* ══════════════════════════════════════════════════════════
       LEADERBOARD API  — window.BDOH_LEADERBOARD
    ══════════════════════════════════════════════════════════ */
    window.BDOH_LEADERBOARD = {

      /**
       * Get global leaderboard sorted by rating.
       * @param {number} max
       * @returns {Promise<BDOHLeaderboardEntry[]>}
       */
      async getGlobal(max = 100) {
        const snap = await getDocs(
          query(collection(_db, 'users'),
            where('isBanned', '==', false),
            orderBy('rating', 'desc'),
            limit(max))
        );
        return snap.docs.map((d, i) => ({
          rank: i + 1,
          uid:          d.id,
          displayName:  d.data().displayName,
          institution:  d.data().institution,
          photoURL:     d.data().photoURL,
          rating:       d.data().rating,
          totalPoints:  d.data().totalPoints,
          totalSolves:  d.data().totalSolves,
          contestCount: d.data().contestCount
        }));
      },

      /**
       * Get Top Solvers leaderboard sorted by total solves.
       * @param {number} max
       * @returns {Promise<BDOHLeaderboardEntry[]>}
       */
      async getTopSolvers(max = 100) {
        const snap = await getDocs(
          query(collection(_db, 'users'),
            where('isBanned', '==', false),
            orderBy('totalSolves', 'desc'),
            limit(max))
        );
        return snap.docs.map((d, i) => ({
          rank: i + 1,
          uid:         d.id,
          displayName: d.data().displayName,
          institution: d.data().institution,
          photoURL:    d.data().photoURL,
          totalSolves: d.data().totalSolves,
          totalPoints: d.data().totalPoints,
          rating:      d.data().rating
        }));
      },

      /**
       * Get a contest-specific leaderboard by computing scores from submissions.
       * @param {string} contestId
       * @param {BDOHContest} contest  (to know problem order + points)
       * @returns {Promise<Object[]>}  ranked array
       */
      async getContestLeaderboard(contestId, contest) {
        const submissions = await BDOH_SUBMISSIONS.getByContest(contestId);

        /* Aggregate per user */
        const byUser = {};
        for (const sub of submissions) {
          if (!byUser[sub.userUid]) {
            byUser[sub.userUid] = {
              uid:            sub.userUid,
              displayName:    sub.userName,
              institution:    sub.userInstitution || '',
              totalPoints:    0,
              correctCount:   0,
              lastSubmitTime: 0
            };
          }
          if (sub.isCorrect) {
            byUser[sub.userUid].totalPoints  += sub.pointsEarned || 0;
            byUser[sub.userUid].correctCount += 1;
            const ts = sub.submittedAt?.seconds || 0;
            if (ts > byUser[sub.userUid].lastSubmitTime)
              byUser[sub.userUid].lastSubmitTime = ts;
          }
        }

        /* Sort: points desc, then last submit time asc (earlier = better) */
        const ranked = Object.values(byUser).sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
          return a.lastSubmitTime - b.lastSubmitTime;
        });

        return ranked.map((u, i) => ({ rank: i + 1, ...u }));
      },

      /**
       * Compute and apply ELO rating changes after a ranked contest.
       * Uses a simplified ELO calculation based on rank vs field.
       * @param {string} contestId
       * @param {Object[]} rankedResults  from getContestLeaderboard()
       */
      async applyEloUpdates(contestId, rankedResults) {
        if (!rankedResults.length) return;

        const K   = BDOH_DEFAULTS.rating.kFactor;
        const MAX = BDOH_DEFAULTS.rating.maxDelta;
        const n   = rankedResults.length;

        /* Fetch current ratings */
        const users = await Promise.all(rankedResults.map(r => BDOH_USERS.getUser(r.uid)));
        const ratings = {};
        users.forEach(u => { if (u) ratings[u.uid] = u.rating; });

        const batch = writeBatch(_db);

        for (let i = 0; i < rankedResults.length; i++) {
          const r   = rankedResults[i];
          const uid = r.uid;
          const myRating = ratings[uid] || BDOH_DEFAULTS.rating.initial;

          /* Expected score against the field (average of all pairwise) */
          let expected = 0;
          for (let j = 0; j < n; j++) {
            if (j === i) continue;
            const oppRating = ratings[rankedResults[j].uid] || BDOH_DEFAULTS.rating.initial;
            expected += 1 / (1 + Math.pow(10, (oppRating - myRating) / 400));
          }
          expected /= (n - 1);

          /* Actual score: fraction of opponents beaten (rank-based) */
          const actual = (n - 1 - i) / Math.max(n - 1, 1);

          /* Delta */
          let delta = Math.round(K * (actual - expected) * (n - 1));
          delta = Math.max(-MAX, Math.min(MAX, delta));

          const newRating = Math.max(100, myRating + delta);

          const ref = doc(_db, 'users', uid);
          batch.update(ref, {
            rating:        newRating,
            ratingHistory: arrayUnion(newRating),
            contestCount:  increment(1),
            lastActive:    serverTimestamp()
          });
        }

        await batch.commit();
      },

      /** Real-time listener for the global leaderboard (top 50). */
      onGlobalLeaderboard(cb) {
        return onSnapshot(
          query(collection(_db, 'users'),
            where('isBanned', '==', false),
            orderBy('rating', 'desc'),
            limit(50)),
          snap => cb(snap.docs.map((d, i) => ({
            rank: i + 1,
            uid:          d.id,
            displayName:  d.data().displayName,
            institution:  d.data().institution,
            photoURL:     d.data().photoURL,
            rating:       d.data().rating,
            totalPoints:  d.data().totalPoints,
            totalSolves:  d.data().totalSolves,
            contestCount: d.data().contestCount
          })))
        );
      }
    };

    /* ══════════════════════════════════════════════════════════
       ADMIN / ANALYTICS API  — window.BDOH_ADMIN
    ══════════════════════════════════════════════════════════ */
    window.BDOH_ADMIN = {

      /**
       * Get platform-wide analytics snapshot.
       * @returns {Promise<Object>}
       */
      async getAnalytics() {
        const [usersSnap, problemsSnap, contestsSnap, subsSnap] = await Promise.all([
          getDocs(collection(_db, 'users')),
          getDocs(query(collection(_db, 'problems'), where('status', '==', 'published'))),
          getDocs(collection(_db, 'contests')),
          getDocs(query(collection(_db, 'submissions'), orderBy('submittedAt', 'desc'), limit(500)))
        ]);

        const users    = usersSnap.docs.map(d => d.data());
        const subs     = subsSnap.docs.map(d => d.data());
        const correct  = subs.filter(s => s.isCorrect).length;

        /* Subject distribution */
        const subjectDist = {};
        problemsSnap.docs.forEach(d => {
          const subj = d.data().subject || 'Other';
          subjectDist[subj] = (subjectDist[subj] || 0) + 1;
        });

        /* Daily submissions (last 7 days) */
        const now   = Date.now();
        const daily = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now - i * 86400000);
          daily[d.toISOString().slice(0, 10)] = 0;
        }
        subs.forEach(s => {
          const key = s.submittedAt?.toDate?.().toISOString?.().slice(0, 10);
          if (key && daily[key] !== undefined) daily[key]++;
        });

        return {
          totalUsers:        usersSnap.size,
          totalProblems:     problemsSnap.size,
          totalContests:     contestsSnap.size,
          totalSubmissions:  subsSnap.size,
          overallAccuracy:   subs.length ? Math.round((correct / subs.length) * 100) : 0,
          subjectDist,
          dailySubmissions:  daily,
          avgRating:         users.length
            ? Math.round(users.reduce((a, u) => a + (u.rating || 0), 0) / users.length)
            : 0
        };
      },

      /**
       * Search users by display name (prefix match via client-side filter).
       * @param {string} query
       * @returns {Promise<BDOHUser[]>}
       */
      async searchUsers(searchQuery) {
        const snap = await getDocs(
          query(collection(_db, 'users'), orderBy('displayName'), limit(200))
        );
        const q = searchQuery.toLowerCase();
        return snap.docs
          .map(d => ({ uid: d.id, ...d.data() }))
          .filter(u =>
            u.displayName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.institution?.toLowerCase().includes(q)
          );
      },

      /**
       * Batch-update multiple users (e.g. bulk role change).
       * @param {Object[]} updates  [{ uid, ...fields }]
       */
      async batchUpdateUsers(updates) {
        const batch = writeBatch(_db);
        updates.forEach(({ uid, ...fields }) => {
          batch.update(doc(_db, 'users', uid), { ...fields, updatedAt: serverTimestamp() });
        });
        await batch.commit();
      }
    };

    /* ══════════════════════════════════════════════════════════
       LEGACY compat — window.BDOH_DB (for admin.html / exam.html)
    ══════════════════════════════════════════════════════════ */
    window.BDOH_DB = {
      db: _db,

      async getContests()                { return BDOH_CONTESTS.listContests(); },
      async saveContest(c)               { return BDOH_CONTESTS.saveContest(c); },
      async deleteContest(id)            { return BDOH_CONTESTS.deleteContest(id); },
      async saveSubmission(sub)          { return BDOH_SUBMISSIONS.save(sub); },
      async getSubmissions()             { return BDOH_SUBMISSIONS.getAll(); },
      onContestsChange(cb)               { return BDOH_CONTESTS.onContestsChange(cb); }
    };

    /* ─── Mark Firebase as ready ─── */
    _resolveFbReady();

    /* ─── Seed BDOH.contests from Firestore immediately ─── */
    try {
      BDOH.contests = await BDOH_CONTESTS.listContests();
    } catch (_) {
      /* non-fatal: pages set up their own listeners */
    }

  } catch (e) {
    console.error('BDOH Firebase init error:', e);

    /* Offline fallback: load from localStorage cache */
    try {
      const cached = JSON.parse(localStorage.getItem('bdoh_contests_cache') || '[]');
      BDOH.contests = cached;
    } catch (_) {}

    /* Stub out APIs so calling code doesn't crash */
    window.BDOH_AUTH        = window.BDOH_AUTH        || { onAuthChange: (cb) => cb(null) };
    window.BDOH_USERS       = window.BDOH_USERS       || {};
    window.BDOH_PROBLEMS    = window.BDOH_PROBLEMS    || {};
    window.BDOH_SUBMISSIONS = window.BDOH_SUBMISSIONS || {};
    window.BDOH_CONTESTS    = window.BDOH_CONTESTS    || {};
    window.BDOH_LEADERBOARD = window.BDOH_LEADERBOARD || {};
    window.BDOH_ADMIN       = window.BDOH_ADMIN       || {};
    window.BDOH_DB = {
      getContests:    async () => BDOH.contests,
      saveContest:    async () => {},
      deleteContest:  async () => {},
      saveSubmission: async () => {},
      getSubmissions: async () => [],
      onContestsChange: (cb) => { cb(BDOH.contests); return () => {}; }
    };

    _resolveFbReady();
  }
})();

/* ────────────────────────────────────────────────────────────────
   SECTION 7 — UTILITY HELPERS (pure JS, no Firebase needed)
──────────────────────────────────────────────────────────────── */

/**
 * Generate a unique ID (crypto-safe, URL-friendly).
 * Falls back to Math.random if crypto is unavailable.
 * @param {number} len
 * @returns {string}
 */
function bdohGenId(len = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (window.crypto?.getRandomValues) {
    const arr = new Uint8Array(len);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(b => chars[b % chars.length]).join('');
  }
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Grade an answer against correct answer + tolerance.
 * @param {BDOHProblem} problem
 * @param {string|number} submitted
 * @returns {{ correct: boolean, delta: number|null }}
 */
function bdohGradeAnswer(problem, submitted) {
  if (problem.answerType === 'mcq') {
    const idx = parseInt(submitted, 10);
    return { correct: idx === problem.correctOption, delta: null };
  }

  const correct  = parseFloat(problem.answer);
  const userAns  = parseFloat(String(submitted).replace(',', '.'));
  if (isNaN(userAns)) return { correct: false, delta: null };

  if (problem.tolerance === 0) {
    /* Exact numeric match (still float-safe via string compare) */
    const exact = String(submitted).trim() === String(problem.answer).trim();
    return { correct: exact, delta: 0 };
  }

  const delta = Math.abs(userAns - correct);
  return { correct: delta <= problem.tolerance, delta };
}

/**
 * Format a duration in seconds to "MM:SS" or "HH:MM:SS".
 * @param {number} totalSeconds
 * @returns {string}
 */
function bdohFormatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Relative time string ("2 hours ago", "just now").
 * @param {Date|number|{seconds:number}} ts
 * @returns {string}
 */
function bdohRelativeTime(ts) {
  let date;
  if (!ts) return '';
  if (ts?.toDate) date = ts.toDate();
  else if (ts?.seconds) date = new Date(ts.seconds * 1000);
  else date = new Date(ts);

  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (diff < 60000)    return 'just now';
  if (mins  < 60)      return `${mins}m ago`;
  if (hours < 24)      return `${hours}h ago`;
  if (days  < 30)      return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

/**
 * Difficulty color map for UI badges.
 * @param {string} difficulty
 * @returns {string}  CSS hex or var
 */
function bdohDifficultyColor(difficulty) {
  const map = {
    Easy:   '#4CAF50',
    Medium: '#FFD700',
    Hard:   '#ff7043',
    Expert: '#e040fb'
  };
  return map[difficulty] || '#aaa';
}

/**
 * Subject icon map.
 * @param {string} subject
 * @returns {string}
 */
function bdohSubjectIcon(subject) {
  const map = {
    Physics:     '⚛️',
    Mathematics: '∑',
    Chemistry:   '🧪',
    Biology:     '🌿',
    Astronomy:   '🪐',
    Informatics: '💻',
    Math:        '∑'
  };
  return map[subject] || '📚';
}

/**
 * Persist contests to localStorage cache for offline use.
 * @param {BDOHContest[]} contests
 */
function bdohCacheContests(contests) {
  try {
    localStorage.setItem('bdoh_contests_cache', JSON.stringify(contests));
  } catch (_) {}
}

/**
 * Persist user profile to localStorage for instant load on next visit.
 * @param {BDOHUser} user
 */
function bdohCacheUser(user) {
  try {
    localStorage.setItem('bdoh_user_cache', JSON.stringify({
      uid:         user.uid,
      displayName: user.displayName,
      photoURL:    user.photoURL,
      role:        user.role,
      rating:      user.rating
    }));
  } catch (_) {}
}

/** Retrieve cached user (fast bootstrap before Firestore responds). */
function bdohGetCachedUser() {
  try {
    return JSON.parse(localStorage.getItem('bdoh_user_cache') || 'null');
  } catch (_) { return null; }
}

/* ────────────────────────────────────────────────────────────────
   SECTION 8 — EXPOSE UTILITIES GLOBALLY
──────────────────────────────────────────────────────────────── */
window.bdohFirebaseReady    = bdohFirebaseReady;
window.bdohHasPermission    = bdohHasPermission;
window.bdohGenId            = bdohGenId;
window.bdohGradeAnswer      = bdohGradeAnswer;
window.bdohFormatTime       = bdohFormatTime;
window.bdohRelativeTime     = bdohRelativeTime;
window.bdohDifficultyColor  = bdohDifficultyColor;
window.bdohSubjectIcon      = bdohSubjectIcon;
window.bdohCacheContests    = bdohCacheContests;
window.bdohCacheUser        = bdohCacheUser;
window.bdohGetCachedUser    = bdohGetCachedUser;

window.BDOH                 = BDOH;
window.BDOH_ROLES           = BDOH_ROLES;
window.BDOH_PERMISSIONS     = BDOH_PERMISSIONS;
window.BDOH_DEFAULTS        = BDOH_DEFAULTS;
