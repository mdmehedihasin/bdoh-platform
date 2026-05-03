/**
 * BDOH Practice Arena — practice.js
 * ══════════════════════════════════════════════════════════════
 * Requires: data.js (Firebase + BDOH_DATA), auth.js (BDOH_AUTH)
 * ══════════════════════════════════════════════════════════════
 *
 * Features implemented:
 *  1. Status-coloured cards (solved / attempted / unseen)
 *  2. Instant solution reveal after first attempt
 *  3. Daily streak + "+N pts" toast on every correct solve
 *  4. Multi-subject + difficulty + status filters + live search
 *  5. Session progress dots (correct / wrong / unseen)
 *  6. Subject-wise accuracy in the sidebar
 *  7. First-solver gold badge on cards + hall-of-fame sidebar
 *  8. Solve panel with hints, formula sheet, tolerance feedback
 *  9. Timer per problem (15 min countdown)
 * 10. Rating + points stored in Firebase per user
 */

/* ═══════════════════════ PROBLEM DATA SEED ═══════════════════════
   Replace / extend this array with your real Firestore fetch.
   Each object follows the schema the solve panel expects.
═══════════════════════════════════════════════════════════════════ */
const BDOH_PROBLEMS = [
  /* ── PHYSICS ── */
  {
    id: 'phy-001',
    subject: 'Physics',
    title: 'Projectile Range',
    difficulty: 'Easy',
    pts: 8,
    solves: 2341,
    successRate: 91,
    statement: 'A ball is launched at an angle of 45° with an initial speed of 20 m/s from flat ground. Find the horizontal range R of the projectile in metres.\n\nTake g = 10 m/s².',
    given: 'θ = 45°\nv₀ = 20 m/s\ng = 10 m/s²',
    answer: 40,
    tolerance: 0.5,
    hint1: 'The range formula is R = v₀² sin(2θ) / g. At 45°, sin(90°) = 1.',
    hint2: 'Plug directly: R = (20² × 1) / 10 = 400 / 10.',
    formulas: 'Range: R = v₀² sin(2θ) / g\nMax height: H = v₀² sin²θ / 2g\nTime of flight: T = 2 v₀ sinθ / g',
    solution: 'R = v₀² sin(2θ) / g\n  = (20)² × sin(90°) / 10\n  = 400 × 1 / 10\n  = 40 m',
    firstSolver: 'Raihan_Hasan',
    addedAt: 1710000000,
  },
  {
    id: 'phy-002',
    subject: 'Physics',
    title: 'Electric Flux',
    difficulty: 'Medium',
    pts: 12,
    solves: 1182,
    successRate: 64,
    statement: 'A uniform electric field E = 500 N/C passes through a square surface of side 0.2 m. The field makes an angle of 30° with the normal to the surface. Calculate the electric flux Φ through the surface in N·m²/C.',
    given: 'E = 500 N/C\nside a = 0.2 m\nθ = 30° (angle with normal)',
    answer: 17.32,
    tolerance: 0.5,
    hint1: 'Electric flux Φ = E A cosθ, where θ is the angle between E and the area normal.',
    hint2: 'Area A = (0.2)² = 0.04 m². cos(30°) = √3/2 ≈ 0.866.',
    formulas: 'Φ = E · A · cosθ\nA_square = a²\ncos30° = √3/2 ≈ 0.8660',
    solution: 'A = (0.2)² = 0.04 m²\nΦ = E A cosθ = 500 × 0.04 × cos30°\n  = 20 × 0.8660\n  ≈ 17.32 N·m²/C',
    firstSolver: 'Zarif_Islam',
    addedAt: 1711000000,
  },
  {
    id: 'phy-003',
    subject: 'Physics',
    title: 'Orbital Period',
    difficulty: 'Hard',
    pts: 20,
    solves: 743,
    successRate: 38,
    statement: 'A satellite orbits Earth at an altitude of 400 km above the surface. Calculate its orbital period T in minutes.\n\nGiven: Mass of Earth M = 5.97 × 10²⁴ kg, Radius of Earth Rₑ = 6.37 × 10⁶ m, G = 6.674 × 10⁻¹¹ N·m²/kg².',
    given: 'h = 400 km = 4 × 10⁵ m\nRₑ = 6.37 × 10⁶ m\nM = 5.97 × 10²⁴ kg\nG = 6.674 × 10⁻¹¹ N·m²/kg²',
    answer: 92.6,
    tolerance: 1.5,
    hint1: 'Orbital radius r = Rₑ + h. Then use T = 2π √(r³/GM).',
    hint2: 'r = 6.37×10⁶ + 4×10⁵ = 6.77×10⁶ m. Compute r³ then √(r³/GM) and convert to minutes.',
    formulas: "Kepler's 3rd: T = 2π √(r³/GM)\nr = Rₑ + h",
    solution: 'r = 6.37×10⁶ + 4×10⁵ = 6.77×10⁶ m\nr³ = (6.77×10⁶)³ ≈ 3.099×10²⁰ m³\nGM = 6.674×10⁻¹¹ × 5.97×10²⁴ ≈ 3.985×10¹⁴ m³/s²\nT = 2π √(3.099×10²⁰ / 3.985×10¹⁴)\n  = 2π √(7.776×10⁵)\n  = 2π × 881.8 s\n  ≈ 5542 s\n  ≈ 92.4 min',
    firstSolver: 'Anika_Chowdhury',
    addedAt: 1712000000,
  },
  {
    id: 'phy-004',
    subject: 'Physics',
    title: 'Simple Pendulum Period',
    difficulty: 'Easy',
    pts: 6,
    solves: 3100,
    successRate: 95,
    statement: 'A simple pendulum has a length of 1.5 m. Find its period T of oscillation in seconds (on Earth where g = 9.8 m/s²).\n\nGive your answer to 2 decimal places.',
    given: 'L = 1.5 m\ng = 9.8 m/s²',
    answer: 2.46,
    tolerance: 0.05,
    hint1: 'T = 2π √(L/g) for small oscillation angles.',
    hint2: '√(1.5/9.8) ≈ √(0.1531) ≈ 0.3912.',
    formulas: 'T = 2π √(L/g)',
    solution: 'T = 2π √(1.5/9.8)\n  = 2π √(0.15306)\n  = 2π × 0.39122\n  ≈ 2.46 s',
    firstSolver: 'Nusrat_Jahan',
    addedAt: 1709000000,
  },
  {
    id: 'phy-005',
    subject: 'Physics',
    title: 'Snell\'s Law Refraction',
    difficulty: 'Medium',
    pts: 10,
    solves: 1440,
    successRate: 72,
    statement: 'Light travels from air (n₁ = 1.00) into glass (n₂ = 1.52) at an angle of incidence of 40°. Find the angle of refraction θ₂ in degrees (to 1 decimal place).',
    given: 'n₁ = 1.00\nn₂ = 1.52\nθ₁ = 40°',
    answer: 24.9,
    tolerance: 0.3,
    hint1: "Snell's law: n₁ sinθ₁ = n₂ sinθ₂.",
    hint2: 'sinθ₂ = (n₁ / n₂) sinθ₁ = (1/1.52) × sin40°. Then θ₂ = arcsin(...).',
    formulas: "Snell's Law: n₁ sinθ₁ = n₂ sinθ₂\nsin40° ≈ 0.6428",
    solution: 'sinθ₂ = (1.00/1.52) × sin40°\n       = (1/1.52) × 0.6428\n       ≈ 0.4229\nθ₂ = arcsin(0.4229) ≈ 25.0°',
    firstSolver: 'Towfiq_Ahmed',
    addedAt: 1713000000,
  },

  /* ── MATHEMATICS ── */
  {
    id: 'mat-001',
    subject: 'Mathematics',
    title: 'Sum of Arithmetic Series',
    difficulty: 'Easy',
    pts: 6,
    solves: 4210,
    successRate: 94,
    statement: 'Find the sum of all integers from 1 to 200 inclusive.',
    given: 'First term a₁ = 1\nLast term aₙ = 200\nn = 200 terms',
    answer: 20100,
    tolerance: 0,
    hint1: 'Use the arithmetic series formula: Sₙ = n(a₁ + aₙ)/2.',
    hint2: 'S₂₀₀ = 200 × (1 + 200) / 2.',
    formulas: 'Sₙ = n(a₁ + aₙ)/2 = n(2a + (n−1)d)/2',
    solution: 'S₂₀₀ = 200 × (1 + 200) / 2\n      = 200 × 201 / 2\n      = 100 × 201\n      = 20100',
    firstSolver: 'Mehedi_Hasan',
    addedAt: 1708000000,
  },
  {
    id: 'mat-002',
    subject: 'Mathematics',
    title: 'Number of Divisors',
    difficulty: 'Medium',
    pts: 14,
    solves: 982,
    successRate: 58,
    statement: 'How many positive divisors does 720 have?',
    given: '720',
    answer: 30,
    tolerance: 0,
    hint1: 'Find the prime factorisation of 720 first.',
    hint2: '720 = 2⁴ × 3² × 5¹. The number of divisors is (4+1)(2+1)(1+1).',
    formulas: 'If n = p₁^a₁ × p₂^a₂ × … then τ(n) = (a₁+1)(a₂+1)…',
    solution: '720 = 2 × 360 = 2² × 180 = 2³ × 90 = 2⁴ × 45 = 2⁴ × 3² × 5\nSo 720 = 2⁴ × 3² × 5¹\nτ(720) = (4+1)(2+1)(1+1) = 5 × 3 × 2 = 30',
    firstSolver: 'Sabrina_Islam',
    addedAt: 1711500000,
  },
  {
    id: 'mat-003',
    subject: 'Mathematics',
    title: 'Combinatorics — Committee',
    difficulty: 'Medium',
    pts: 12,
    solves: 1340,
    successRate: 66,
    statement: 'A committee of 4 people is to be chosen from a group of 9. In how many ways can this be done?',
    given: 'n = 9, r = 4',
    answer: 126,
    tolerance: 0,
    hint1: 'Order does not matter — use combinations: C(n, r) = n! / (r!(n−r)!).',
    hint2: 'C(9,4) = 9! / (4! × 5!) = (9 × 8 × 7 × 6) / (4 × 3 × 2 × 1).',
    formulas: 'C(n,r) = n! / (r!(n−r)!)',
    solution: 'C(9,4) = (9 × 8 × 7 × 6) / (4!)\n       = 3024 / 24\n       = 126',
    firstSolver: 'Rifat_Chowdhury',
    addedAt: 1712500000,
  },
  {
    id: 'mat-004',
    subject: 'Mathematics',
    title: 'Geometric Sequence',
    difficulty: 'Hard',
    pts: 18,
    solves: 610,
    successRate: 41,
    statement: 'The sum of the first 8 terms of a geometric sequence is 765 and the first term is 3. Find the common ratio r.',
    given: 'a = 3, n = 8, S₈ = 765',
    answer: 2,
    tolerance: 0,
    hint1: 'Sₙ = a(rⁿ − 1)/(r − 1) for r ≠ 1.',
    hint2: '765 = 3(r⁸ − 1)/(r − 1). So (r⁸ − 1)/(r − 1) = 255. Try r = 2.',
    formulas: 'Geometric sum: Sₙ = a(rⁿ − 1)/(r − 1)',
    solution: 'S₈ = 3(r⁸ − 1)/(r − 1) = 765\n(r⁸ − 1)/(r − 1) = 255\n\nTry r = 2:\n(2⁸ − 1)/(2 − 1) = 255/1 = 255 ✓\n\nCommon ratio r = 2',
    firstSolver: 'Mehedi_Hasan',
    addedAt: 1714000000,
  },

  /* ── CHEMISTRY ── */
  {
    id: 'che-001',
    subject: 'Chemistry',
    title: 'Hydrogen Spectrum',
    difficulty: 'Medium',
    pts: 12,
    solves: 994,
    successRate: 72,
    statement: 'Calculate the wavelength (in nm) of the photon emitted when an electron in a hydrogen atom transitions from n=3 to n=2 (Balmer series).\n\nUse: Rydberg constant Rₕ = 1.097 × 10⁷ m⁻¹.',
    given: 'n₁ = 2 (final), n₂ = 3 (initial)\nRₕ = 1.097 × 10⁷ m⁻¹',
    answer: 656,
    tolerance: 2,
    hint1: '1/λ = Rₕ (1/n₁² − 1/n₂²). The result is the famous red Hα line.',
    hint2: '1/λ = 1.097×10⁷ × (1/4 − 1/9) = 1.097×10⁷ × 5/36.',
    formulas: 'Rydberg: 1/λ = Rₕ (1/n₁² − 1/n₂²)\nλ(m) → λ(nm): multiply by 10⁹',
    solution: '1/λ = Rₕ(1/n₁² − 1/n₂²)\n    = 1.097×10⁷ × (1/4 − 1/9)\n    = 1.097×10⁷ × (9−4)/36\n    = 1.097×10⁷ × 5/36\n    ≈ 1.524×10⁶ m⁻¹\n\nλ = 1/1.524×10⁶ ≈ 6.56×10⁻⁷ m\n  ≈ 656 nm (red Hα line)',
    firstSolver: 'Tania_Begum',
    addedAt: 1710500000,
  },
  {
    id: 'che-002',
    subject: 'Chemistry',
    title: 'Molar Mass of Compound',
    difficulty: 'Easy',
    pts: 6,
    solves: 3450,
    successRate: 97,
    statement: 'Calculate the molar mass of calcium carbonate (CaCO₃) in g/mol.\n\nAtomic masses: Ca = 40, C = 12, O = 16.',
    given: 'Formula: CaCO₃\nCa=40, C=12, O=16 (g/mol)',
    answer: 100,
    tolerance: 0,
    hint1: 'Add atomic masses: Ca + C + 3×O.',
    hint2: '40 + 12 + 48 = ?',
    formulas: 'M(CaCO₃) = M(Ca) + M(C) + 3 × M(O)',
    solution: 'M = 40 + 12 + 3×16\n  = 40 + 12 + 48\n  = 100 g/mol',
    firstSolver: 'Nusrat_Jahan',
    addedAt: 1708500000,
  },
  {
    id: 'che-003',
    subject: 'Chemistry',
    title: 'pH of Strong Acid',
    difficulty: 'Medium',
    pts: 10,
    solves: 1670,
    successRate: 78,
    statement: 'What is the pH of a 0.005 M solution of HCl (a strong acid) at 25°C?\n\nGive your answer to 2 decimal places.',
    given: '[HCl] = 0.005 M = 5 × 10⁻³ M',
    answer: 2.30,
    tolerance: 0.05,
    hint1: 'HCl is a strong acid — it fully dissociates. So [H⁺] = [HCl].',
    hint2: 'pH = −log[H⁺] = −log(5×10⁻³) = −log(5) − log(10⁻³) = −0.699 + 3.',
    formulas: 'pH = −log₁₀[H⁺]\nlog(5) ≈ 0.699',
    solution: '[H⁺] = 5×10⁻³ M\npH = −log(5×10⁻³)\n   = −(log5 + log10⁻³)\n   = −(0.699 − 3)\n   = 2.301\n   ≈ 2.30',
    firstSolver: 'Sabrina_Islam',
    addedAt: 1713500000,
  },

  /* ── BIOLOGY ── */
  {
    id: 'bio-001',
    subject: 'Biology',
    title: 'Mitosis Stages',
    difficulty: 'Easy',
    pts: 7,
    solves: 2780,
    successRate: 88,
    statement: 'How many distinct phases does mitosis pass through (not including interphase)? Enter the count as a whole number.',
    given: 'Count the phases of M-phase mitosis only.',
    answer: 4,
    tolerance: 0,
    hint1: 'Remember: PMAT — Prophase, Metaphase, Anaphase, Telophase.',
    hint2: 'The answer is a single digit.',
    formulas: 'Phases: Prophase → Metaphase → Anaphase → Telophase',
    solution: 'The 4 phases of mitosis are:\n1. Prophase\n2. Metaphase\n3. Anaphase\n4. Telophase\n\nAnswer: 4',
    firstSolver: 'Farhan_Kabir',
    addedAt: 1710200000,
  },
  {
    id: 'bio-002',
    subject: 'Biology',
    title: 'Hardy-Weinberg: Allele Frequency',
    difficulty: 'Hard',
    pts: 20,
    solves: 510,
    successRate: 33,
    statement: 'In a population of 1000 individuals at Hardy-Weinberg equilibrium, 360 are homozygous dominant (AA). Find the frequency of the recessive allele q (to 2 decimal places).',
    given: 'N = 1000\nAA count = 360\nHardy-Weinberg equilibrium',
    answer: 0.40,
    tolerance: 0.02,
    hint1: 'Under H-W: p² + 2pq + q² = 1. Frequency of AA = p². So p² = 360/1000.',
    hint2: 'p = √0.36 = 0.6. Then q = 1 − p.',
    formulas: 'p + q = 1\np² + 2pq + q² = 1\nf(AA) = p²',
    solution: 'f(AA) = 360/1000 = 0.36\np² = 0.36 → p = 0.6\nq = 1 − p = 1 − 0.6 = 0.40',
    firstSolver: 'Anika_Chowdhury',
    addedAt: 1714500000,
  },

  /* ── ASTRONOMY ── */
  {
    id: 'ast-001',
    subject: 'Astronomy',
    title: 'Luminosity–Distance',
    difficulty: 'Medium',
    pts: 14,
    solves: 421,
    successRate: 52,
    statement: 'A star has an apparent magnitude m = 6.5 and absolute magnitude M = 1.5. Calculate its distance in parsecs using the distance modulus.',
    given: 'm = 6.5\nM = 1.5',
    answer: 100,
    tolerance: 2,
    hint1: 'Distance modulus: m − M = 5 log(d/10), where d is in parsecs.',
    hint2: '5 = 5 log(d/10) → log(d/10) = 1 → d/10 = 10 → d = 100 pc.',
    formulas: 'Distance modulus: m − M = 5 log₁₀(d/10 pc)',
    solution: 'm − M = 5 log(d/10)\n6.5 − 1.5 = 5 log(d/10)\n5 = 5 log(d/10)\nlog(d/10) = 1\nd/10 = 10\nd = 100 parsecs',
    firstSolver: 'Zarif_Islam',
    addedAt: 1712000000,
  },
  {
    id: 'ast-002',
    subject: 'Astronomy',
    title: "Kepler's Third Law",
    difficulty: 'Hard',
    pts: 18,
    solves: 287,
    successRate: 45,
    statement: "Mars orbits the Sun with a semi-major axis of 1.524 AU. Using Kepler's third law, calculate Mars's orbital period in Earth years (to 2 decimal places).",
    given: 'a(Mars) = 1.524 AU\nFor Earth: a = 1 AU, T = 1 year',
    answer: 1.88,
    tolerance: 0.03,
    hint1: "Kepler's 3rd: T² ∝ a³. In AU/years: T² = a³.",
    hint2: 'T = √(1.524³) = √(3.5396) ≈ 1.881 years.',
    formulas: "Kepler's 3rd Law: T² = a³ (in AU and years)",
    solution: 'T² = a³ = (1.524)³\n   = 1.524 × 1.524 × 1.524\n   ≈ 3.5396\nT = √3.5396 ≈ 1.88 years',
    firstSolver: 'Towfiq_Ahmed',
    addedAt: 1713000000,
  },

  /* ── INFORMATICS ── */
  {
    id: 'inf-001',
    subject: 'Informatics',
    title: 'Binary Conversion',
    difficulty: 'Easy',
    pts: 6,
    solves: 2930,
    successRate: 92,
    statement: 'Convert the binary number 11010110 to decimal. Enter the decimal value.',
    given: 'Binary: 11010110',
    answer: 214,
    tolerance: 0,
    hint1: 'Each bit position represents a power of 2, starting from 2⁰ on the right.',
    hint2: '128+64+0+16+0+4+2+0 = ?',
    formulas: 'bₙbₙ₋₁…b₁b₀ → Σ bᵢ × 2ⁱ',
    solution: '1×2⁷ + 1×2⁶ + 0×2⁵ + 1×2⁴ + 0×2³ + 1×2² + 1×2¹ + 0×2⁰\n= 128 + 64 + 0 + 16 + 0 + 4 + 2 + 0\n= 214',
    firstSolver: 'Rifat_Chowdhury',
    addedAt: 1709500000,
  },
  {
    id: 'inf-002',
    subject: 'Informatics',
    title: 'Time Complexity — Big-O',
    difficulty: 'Medium',
    pts: 12,
    solves: 890,
    successRate: 61,
    statement: 'An algorithm takes exactly T(n) = 3n² + 5n + 100 operations for an input of size n. What is the Big-O complexity? Express your answer as the exponent of n (e.g. enter 2 for O(n²)).',
    given: 'T(n) = 3n² + 5n + 100',
    answer: 2,
    tolerance: 0,
    hint1: 'Big-O ignores constant coefficients and lower-order terms.',
    hint2: 'The dominant term is 3n². So T(n) = O(n²). The exponent is 2.',
    formulas: 'Big-O: keep the fastest-growing term, drop constants.',
    solution: 'T(n) = 3n² + 5n + 100\nDominant term: 3n² → O(n²)\nExponent of n = 2',
    firstSolver: 'Farhan_Kabir',
    addedAt: 1711200000,
  },
];

/* ═══════════════════════ PRACTICE ARENA ENGINE ═══════════════════════ */
const PA = (function () {

  /* ── State ── */
  let allProblems  = [];
  let filtered     = [];
  let currentIdx   = 0;         // index in `filtered` for solve panel
  let sessionPips  = [];        // {id, result: 'done'|'wrong'|'cur'} per opened problem
  let activeSubject = 'All';
  let activeDiffs   = new Set();
  let activeStatus  = null;
  let timerHandle   = null;
  let timerSec      = 900;

  /* ── User stats (stored in localStorage + Firebase) ── */
  let userStats = {
    rating:    1200,
    ratingHistory: [1180,1190,1195,1200,1200,1200,1200],
    streak:    0,
    lastSolveDate: null,
    solved:    {},   // id → {correct:bool, attempts:int, pts:int}
    subjectCorrect: {},
    subjectTotal:   {},
  };

  /* ── DOM shortcuts ── */
  const $ = (id) => document.getElementById(id);

  /* ── Init ── */
  function init() {
    loadStats();
    loadProblems();
    renderSidebar();
    setupKeyboard();
  }

  /* ── Load problems (extend with Firebase fetch if desired) ── */
  function loadProblems() {
    // Use the seed data above; you can also merge with window.BDOH_DATA here
    allProblems = BDOH_PROBLEMS.slice();
    applyFilters();
  }

  /* ── Filters ── */
  function setSubject(btn) {
    document.querySelectorAll('[data-subject]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeSubject = btn.dataset.subject;
    applyFilters();
  }

  function setDiff(btn) {
    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
      activeDiffs.delete(btn.dataset.diff);
    } else {
      btn.classList.add('active');
      activeDiffs.add(btn.dataset.diff);
    }
    applyFilters();
  }

  function setStatus(btn) {
    const s = btn.dataset.status;
    if (activeStatus === s) {
      btn.classList.remove('active');
      activeStatus = null;
    } else {
      document.querySelectorAll('[data-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = s;
    }
    applyFilters();
  }

  function applyFilters() {
    const q = ($('searchBox').value || '').trim().toLowerCase();
    const sort = $('sortSelect').value;

    filtered = allProblems.filter(p => {
      if (activeSubject !== 'All' && p.subject !== activeSubject) return false;
      if (activeDiffs.size && !activeDiffs.has(p.difficulty)) return false;
      if (activeStatus) {
        const st = getStatus(p.id);
        if (activeStatus === 'solved'    && st !== 'solved')    return false;
        if (activeStatus === 'attempted' && st !== 'attempted') return false;
        if (activeStatus === 'unseen'    && st !== 'unseen')    return false;
      }
      if (q && !p.title.toLowerCase().includes(q) && !p.subject.toLowerCase().includes(q)) return false;
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sort === 'popular')     return b.solves - a.solves;
      if (sort === 'newest')      return b.addedAt - a.addedAt;
      if (sort === 'easiest')     return diffRank(a) - diffRank(b);
      if (sort === 'hardest')     return diffRank(b) - diffRank(a);
      if (sort === 'success_asc') return a.successRate - b.successRate;
      return b.solves - a.solves;
    });

    renderGrid();
  }

  function diffRank(p) { return {Easy:1,Medium:2,Hard:3,Expert:4}[p.difficulty] || 2; }

  /* ── Get problem status ── */
  function getStatus(id) {
    const rec = userStats.solved[id];
    if (!rec) return 'unseen';
    return rec.correct ? 'solved' : 'attempted';
  }

  /* ── Render problem grid ── */
  function renderGrid() {
    const grid = $('probGrid');
    $('countLabel').textContent = `Showing ${filtered.length} problem${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      grid.innerHTML = '<div class="pa-no-results"><svg viewBox="0 0 48 48" width="48" height="48" fill="currentColor"><path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4zm0 36c-8.8 0-16-7.2-16-16S15.2 8 24 8s16 7.2 16 16-7.2 16-16 16zm-2-9h4v4h-4zm0-20h4v14h-4z"/></svg><br>No problems match your filters.<br><small>Try resetting the filters above.</small></div>';
      return;
    }

    grid.innerHTML = filtered.map((p, i) => cardHTML(p, i)).join('');
  }

  function cardHTML(p, idx) {
    const status = getStatus(p.id);
    const statusClass = `status-${status}`;
    const rateClass = p.successRate >= 75 ? 'pa-rate-high' : p.successRate >= 50 ? 'pa-rate-mid' : 'pa-rate-low';
    const diffBadge = `pa-badge-${p.difficulty.toLowerCase()}`;

    let statusLabel = '';
    if (status === 'solved')    statusLabel = `<span class="pa-prob-status-text solved">✓ Solved</span>`;
    else if (status === 'attempted') statusLabel = `<span class="pa-prob-status-text attempted">◎ Attempted</span>`;
    else statusLabel = `<span class="pa-prob-pts">+${p.pts} pts</span>`;

    const hofBadge = p.firstSolver
      ? `<span class="pa-first-badge" title="🏅 First solved by ${p.firstSolver}">🏅</span>`
      : '';

    return `
      <div class="pa-prob-card ${statusClass}" role="listitem" onclick="PA.openPanel(${idx})" tabindex="0"
        onkeydown="if(event.key==='Enter'||event.key===' ')PA.openPanel(${idx})">
        ${hofBadge}
        <div class="pa-prob-name">${p.title}</div>
        <div class="pa-prob-meta">
          <span class="pa-badge pa-badge-gray">${p.subject}</span>
          <span class="pa-badge ${diffBadge}">${p.difficulty}</span>
          <span class="pa-prob-rate ${rateClass}">${p.successRate}% success</span>
        </div>
        <div class="pa-prob-footer">
          <span>${p.solves.toLocaleString()} solves</span>
          ${statusLabel}
        </div>
      </div>`;
  }

  /* ── Open solve panel ── */
  function openPanel(idx) {
    currentIdx = idx;
    // Start/reset session pip tracking
    if (!sessionPips.find(s => s.id === filtered[idx].id)) {
      sessionPips.push({ id: filtered[idx].id, result: 'cur' });
    }
    renderPanel();
    $('solveOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('answerInput').focus(), 200);
  }

  function closePanel() {
    $('solveOverlay').classList.remove('open');
    document.body.style.overflow = '';
    clearInterval(timerHandle);
  }

  /* ── Render panel contents ── */
  function renderPanel() {
    const p = filtered[currentIdx];
    if (!p) return;

    // Reset UI
    $('answerInput').value = '';
    $('answerInput').disabled = false;
    $('submitBtn').disabled = false;
    $('feedbackBox').className = 'pa-feedback';
    $('solutionLocked').style.display = 'block';
    $('solutionContent').className = 'pa-solution-content';
    $('hintBox1').className = 'pa-hint-content';
    $('hintBox2').className = 'pa-hint-content';
    $('formulaBox').className = 'pa-hint-content';
    $('hintBtn1').className = 'pa-hint-chip';
    $('hintBtn2').className = 'pa-hint-chip';
    $('formulaBtn').className = 'pa-hint-chip';

    // If already solved, prefill UI
    const rec = userStats.solved[p.id];
    if (rec) {
      $('answerInput').disabled = true;
      $('submitBtn').disabled = true;
      showFeedback(rec.correct);
      unlockSolution(p);
    }

    // Content
    $('solveName').textContent = p.title;
    const meta = document.querySelector('.pa-solve-meta');
    if (!meta) {
      $('solveName').insertAdjacentHTML('afterend', `<span class="pa-solve-meta"></span>`);
    }
    $('solveName').nextElementSibling.textContent = `${p.subject} · ${p.difficulty}`;

    $('solveStmt').textContent = p.statement;

    const givenBox = $('solveGiven');
    if (p.given) {
      givenBox.style.display = 'block';
      givenBox.innerHTML = `<strong>Given:</strong>\n` +
        p.given.split('\n').map(l => l.replace(/([^=]+)=(.+)/, '<strong>$1</strong>= $2')).join('\n');
    } else {
      givenBox.style.display = 'none';
    }

    $('toleranceLabel').textContent = p.tolerance === 0
      ? 'Exact integer answer required'
      : `Tolerance: ±${p.tolerance}`;

    $('hintBox1').textContent = p.hint1 || '';
    $('hintBox2').textContent = p.hint2 || '';
    $('formulaBox').textContent = p.formulas || 'No formula sheet for this problem.';

    if (!p.hint2) $('hintBtn2').style.display = 'none'; else $('hintBtn2').style.display = '';
    if (!p.formulas) $('formulaBtn').style.display = 'none'; else $('formulaBtn').style.display = '';

    $('solutionContent').textContent = p.solution || '';

    // Progress
    $('progressLabel').textContent = `${currentIdx + 1} / ${filtered.length}`;
    $('prevBtn').disabled = currentIdx === 0;
    $('nextBtn').disabled = currentIdx === filtered.length - 1;

    // Session pips
    renderPips();

    // Timer
    startTimer();
  }

  /* ── Session pips ── */
  function renderPips() {
    const row = $('solveProgRow');
    // Mark current as 'cur', keep previous results
    row.innerHTML = sessionPips.slice(-12).map(s => {
      let cls = 'pa-prog-pip';
      if (s.id === filtered[currentIdx].id) cls += ' cur';
      else if (s.result === 'done') cls += ' done';
      else if (s.result === 'wrong') cls += ' wrong';
      return `<div class="${cls}" title="${s.id}"></div>`;
    }).join('');
  }

  /* ── Timer ── */
  function startTimer() {
    clearInterval(timerHandle);
    timerSec = 900; // 15 min
    renderTimer();
    timerHandle = setInterval(() => {
      timerSec--;
      renderTimer();
      if (timerSec <= 0) {
        clearInterval(timerHandle);
        // Auto-submit with blank (timeout)
        if (!$('answerInput').disabled) autoTimeout();
      }
    }, 1000);
  }

  function renderTimer() {
    const m = String(Math.floor(timerSec / 60)).padStart(2, '0');
    const s = String(timerSec % 60).padStart(2, '0');
    const el = $('solveTimer');
    el.textContent = `${m}:${s}`;
    el.classList.toggle('warn', timerSec <= 120);
  }

  function autoTimeout() {
    $('answerInput').disabled = true;
    $('submitBtn').disabled = true;
    showFeedback(false, 'Time\'s up! The solution is now unlocked.');
    unlockSolution(filtered[currentIdx]);
    recordAttempt(filtered[currentIdx], false);
  }

  /* ── Hints ── */
  function revealHint(n) {
    const box = $(`hintBox${n}`);
    const btn = $(`hintBtn${n}`);
    box.classList.toggle('show');
    btn.classList.toggle('revealed', box.classList.contains('show'));
  }

  function toggleFormulas() {
    const box = $('formulaBox');
    box.classList.toggle('show');
    $('formulaBtn').classList.toggle('revealed', box.classList.contains('show'));
  }

  /* ── Submit answer ── */
  function submit() {
    const p = filtered[currentIdx];
    if (!p || $('answerInput').disabled) return;

    const raw = $('answerInput').value.trim();
    if (!raw) return;

    const val = parseFloat(raw);
    if (isNaN(val)) {
      showFeedback(false, 'Please enter a valid number.');
      return;
    }

    clearInterval(timerHandle);

    const correct = p.tolerance === 0
      ? val === p.answer
      : Math.abs(val - p.answer) <= p.tolerance;

    $('answerInput').disabled = true;
    $('submitBtn').disabled = true;

    showFeedback(correct);
    unlockSolution(p);
    recordAttempt(p, correct);

    if (correct) {
      showPtsToast(p.pts);
      updateStreak();
      updatePip(p.id, 'done');
    } else {
      updatePip(p.id, 'wrong');
    }

    renderGrid();
    renderSidebar();
  }

  function showFeedback(correct, msg) {
    const box = $('feedbackBox');
    const txt = $('feedbackText');
    box.className = 'pa-feedback show ' + (correct ? 'correct' : 'wrong');
    if (msg) {
      txt.textContent = msg;
    } else if (correct) {
      const p = filtered[currentIdx];
      txt.textContent = `✓ Correct! +${p.pts} points added to your profile.`;
    } else {
      txt.textContent = `✗ Incorrect. Check the worked solution below.`;
    }
  }

  function unlockSolution(p) {
    $('solutionLocked').style.display = 'none';
    $('solutionContent').classList.add('show');
  }

  /* ── Navigation ── */
  function navigate(dir) {
    const next = currentIdx + dir;
    if (next < 0 || next >= filtered.length) return;
    currentIdx = next;
    // Mark in pips
    if (!sessionPips.find(s => s.id === filtered[next].id)) {
      sessionPips.push({ id: filtered[next].id, result: 'cur' });
    }
    renderPanel();
  }

  /* ── +pts toast ── */
  function showPtsToast(pts) {
    const el = $('ptsToast');
    el.textContent = `+${pts} pts`;
    el.classList.add('show');
    el.classList.remove('hide');
    setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hide');
    }, 1800);
  }

  /* ── Stats management ── */
  function recordAttempt(p, correct) {
    if (!userStats.solved[p.id]) {
      userStats.solved[p.id] = { correct, attempts: 1, pts: correct ? p.pts : 0 };
    } else {
      const rec = userStats.solved[p.id];
      if (!rec.correct && correct) {
        rec.correct = true;
        rec.pts = p.pts;
      }
      rec.attempts++;
    }

    // Subject accuracy
    if (!userStats.subjectTotal[p.subject]) userStats.subjectTotal[p.subject] = 0;
    if (!userStats.subjectCorrect[p.subject]) userStats.subjectCorrect[p.subject] = 0;
    userStats.subjectTotal[p.subject]++;
    if (correct) userStats.subjectCorrect[p.subject]++;

    // Rating
    if (correct) {
      const delta = Math.floor(p.pts * 1.5);
      userStats.rating += delta;
      userStats.ratingHistory.push(userStats.rating);
      if (userStats.ratingHistory.length > 7) userStats.ratingHistory.shift();
    }

    saveStats();
    updateTopbarBadges();
  }

  function updateStreak() {
    const today = new Date().toDateString();
    if (userStats.lastSolveDate !== today) {
      userStats.streak++;
      userStats.lastSolveDate = today;
      saveStats();
    }
  }

  function updatePip(id, result) {
    const pip = sessionPips.find(s => s.id === id);
    if (pip) pip.result = result;
    renderPips();
  }

  /* ── Sidebar render ── */
  function renderSidebar() {
    // Streak
    const streak = userStats.streak;
    $('sideStreakNum').innerHTML = `${streak} <span style="font-size:14px;font-weight:400;color:var(--color-text-secondary)">days</span>`;
    const dotRow = $('sideStreakDots');
    dotRow.innerHTML = Array.from({length: 7}, (_, i) => {
      const cls = i < 6 && i < streak ? 'done' : i === 6 ? 'today' : '';
      return `<div class="pa-dot ${cls}"></div>`;
    }).join('');

    // Rating
    const rating = userStats.rating;
    $('sideRatingNum').textContent = rating;
    const hist = userStats.ratingHistory;
    const baseDelta = hist.length > 1 ? hist[hist.length-1] - hist[0] : 0;
    $('sideRatingDelta').textContent = baseDelta >= 0 ? `+${baseDelta}` : baseDelta;
    $('sideRatingDelta').style.color = baseDelta >= 0 ? 'var(--pa-green)' : 'var(--pa-red)';

    const maxR = Math.max(...hist);
    const minR = Math.min(...hist);
    const barsEl = $('sideMiniChart');
    if (barsEl) {
      barsEl.innerHTML = hist.map((v, i) => {
        const pct = maxR === minR ? 60 : Math.round(30 + 65 * (v - minR) / (maxR - minR));
        const cur = i === hist.length - 1 ? 'cur' : '';
        return `<div class="pa-mini-bar ${cur}" style="height:${pct}%"></div>`;
      }).join('');
    }

    // Solved summary
    const solvedArr  = Object.values(userStats.solved);
    const nSolved    = solvedArr.filter(r => r.correct).length;
    const nAttempted = solvedArr.filter(r => !r.correct && r.attempts > 0).length;
    $('sideSolved').textContent    = nSolved;
    $('sideAttempted').textContent = nAttempted;
    $('sideSkipped').textContent   = Math.max(0, allProblems.length - nSolved - nAttempted);

    // Accuracy bars
    const subjects = ['Physics','Mathematics','Chemistry','Biology','Astronomy','Informatics'];
    const colors = {
      Physics: 'var(--pa-teal)', Mathematics: 'var(--pa-blue)',
      Chemistry: 'var(--pa-amber)', Biology: 'var(--pa-green)',
      Astronomy: '#ffb74d', Informatics: '#ce93d8'
    };
    $('sideAccBars').innerHTML = subjects.map(s => {
      const tot = userStats.subjectTotal[s] || 0;
      const cor = userStats.subjectCorrect[s] || 0;
      const pct = tot ? Math.round(100 * cor / tot) : 0;
      const col = colors[s];
      const rateCol = pct >= 70 ? 'var(--pa-green)' : pct >= 50 ? 'var(--pa-amber)' : pct > 0 ? 'var(--pa-red)' : 'var(--color-text-secondary)';
      return `
        <div class="pa-acc-row">
          <span class="pa-acc-label">${s.slice(0,9)}</span>
          <div class="pa-acc-track"><div class="pa-acc-fill" style="width:${pct}%;background:${col}"></div></div>
          <span class="pa-acc-pct" style="color:${rateCol}">${tot ? pct+'%' : '—'}</span>
        </div>`;
    }).join('');

    // Hall of fame
    const unique = [];
    const seenSolvers = new Set();
    for (const p of allProblems) {
      if (p.firstSolver && !seenSolvers.has(p.firstSolver)) {
        seenSolvers.add(p.firstSolver);
        unique.push(p);
        if (unique.length >= 5) break;
      }
    }
    $('sideHofList').innerHTML = unique.map(p =>
      `<div class="pa-hof-item">
        <span class="pa-hof-badge">🏅</span>
        <div>
          <div class="pa-hof-name">${p.firstSolver.replace('_',' ')}</div>
          <div class="pa-hof-prob">${p.title}</div>
        </div>
      </div>`
    ).join('');

    updateTopbarBadges();
  }

  function updateTopbarBadges() {
    $('streakCount').textContent = userStats.streak;
    $('ratingNum').textContent   = userStats.rating;
    // Sync with sidebar elements that might be off-screen
    if($('sideStreakNum')) $('sideStreakNum').innerHTML = userStats.streak +
      ' <span style="font-size:14px;font-weight:400;color:var(--color-text-secondary)">days</span>';
    if($('sideRatingNum')) $('sideRatingNum').textContent = userStats.rating;
  }

  /* ── Persist stats (localStorage; swap for Firebase if needed) ── */
  function saveStats() {
    try { localStorage.setItem('bdoh_pa_stats', JSON.stringify(userStats)); } catch(e) {}
  }

  function loadStats() {
    try {
      const raw = localStorage.getItem('bdoh_pa_stats');
      if (raw) Object.assign(userStats, JSON.parse(raw));
    } catch(e) {}
    updateTopbarBadges();
  }

  /* ── Keyboard shortcuts ── */
  function setupKeyboard() {
    document.addEventListener('keydown', e => {
      if (!$('solveOverlay').classList.contains('open')) return;
      if (e.key === 'Escape') closePanel();
      if (e.key === 'ArrowRight' && !e.target.matches('input')) navigate(1);
      if (e.key === 'ArrowLeft'  && !e.target.matches('input')) navigate(-1);
    });
  }

  /* ── Public API ── */
  return { init, setSubject, setDiff, setStatus, applyFilters,
           openPanel, closePanel, navigate, submit,
           revealHint, toggleFormulas };

})();

/* ── Boot on DOM ready ── */
document.addEventListener('DOMContentLoaded', PA.init);
