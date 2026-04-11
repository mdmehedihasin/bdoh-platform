/* ================================================================
   BDOH DATA.JS — single source of truth + localStorage persistence
   Admin changes are saved to localStorage and read by exam/index.
================================================================ */

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
  contests: [],
  problems: [
    {id:"q1",subject:"Physics",difficulty:"Easy",title:"Projectile on an Inclined Plane",statement:"A ball is launched from the base of a smooth inclined plane at 45° to the horizontal. The incline itself makes 30° with the horizontal. Find the ratio of the range along the incline surface to the range on flat ground for the same launch speed.",hint:"Resolve gravity into components parallel and perpendicular to the incline surface, then apply kinematic equations independently along each axis. Remember that the time of flight changes with the inclined geometry.",solution:"Resolve g into g sin 30° (parallel, decelerating) and g cos 30° (perpendicular). Time of flight T = 2u sin(45°−30°) / (g cos 30°). Range along incline = u cos 15° × T − ½ g sin 30° × T². Flat range = u² sin 90° / g. Ratio simplifies to approximately 0.75.",answer:"0.75",tolerance:0.05,solves:1240,timeMin:15,points:10},
    {id:"q2",subject:"Mathematics",difficulty:"Medium",title:"Divisibility and Modular Arithmetic",statement:"For every integer n, the expression n³ − n is divisible by 6. Now find the largest positive integer k such that k divides n⁵ − n for every integer n. Enter k.",hint:"Factor n³ − n as n(n−1)(n+1). For the second part, factor n⁵ − n as n(n−1)(n+1)(n²+1) and test primes 2, 3, 5 systematically using Fermat's Little Theorem to identify all guaranteed prime divisors.",solution:"By FLT: n⁵ ≡ n (mod 5) for all n. Also n(n−1)(n+1) is divisible by 2 and 3. The product n(n²−1)(n²+1) = n⁵−n is always divisible by 2, 3, and 5. LCM(2,3,5) = 30. Verification: n=2 gives 30, confirming k = 30.",answer:"30",tolerance:0,solves:876,timeMin:25,points:15},
    {id:"q3",subject:"Chemistry",difficulty:"Easy",title:"pH at the Half-Equivalence Point",statement:"A 25 mL sample of 0.10 M acetic acid (Ka = 1.8 × 10⁻⁵) is titrated with 0.10 M NaOH. Calculate the pH at the half-equivalence point. Give your answer to 2 decimal places.",hint:"At the half-equivalence point exactly half the acid has been neutralised, making [CH₃COOH] = [CH₃COO⁻]. The Henderson-Hasselbalch equation simplifies beautifully at this point — the log term vanishes.",solution:"pH = pKa + log([A⁻]/[HA]). At half-equivalence [A⁻] = [HA], so log(1) = 0. pH = pKa = −log(1.8 × 10⁻⁵) = 4.745 ≈ 4.74.",answer:"4.74",tolerance:0.05,solves:954,timeMin:20,points:10},
    {id:"q4",subject:"Biology",difficulty:"Medium",title:"Dihybrid Cross — Dominant Phenotype Fraction",statement:"Two plants each with genotype AaBb are crossed. What fraction of the offspring will display both dominant phenotypes simultaneously? Express your answer as a decimal (e.g. 0.5625).",hint:"Apply the product rule for independent assortment. Calculate P(at least one A allele) and P(at least one B allele) separately using a Punnett square for each gene, then multiply. Each gene follows a standard monohybrid ratio.",solution:"P(A_) = 3/4 from Aa × Aa cross. P(B_) = 3/4 from Bb × Bb cross. By independence: P(A_ and B_) = 3/4 × 3/4 = 9/16 = 0.5625.",answer:"0.5625",tolerance:0.001,solves:720,timeMin:15,points:10},
    {id:"q5",subject:"Astronomy",difficulty:"Hard",title:"Binary Star Orbital Period",statement:"Two stars of mass 2M☉ and 3M☉ orbit their common centre of mass with a separation of 4 AU. Calculate their orbital period in years. Use G = 6.674×10⁻¹¹ SI and M☉ = 2×10³⁰ kg. Round to 2 decimal places.",hint:"Apply Kepler's third law for a two-body system using the total mass M₁+M₂. Convert the separation from AU to metres (1 AU = 1.496×10¹¹ m) before substituting into T² = 4π²a³ / G(M₁+M₂), then convert seconds to years.",solution:"Total mass = 5 × 2×10³⁰ = 10³¹ kg. a = 4×1.496×10¹¹ = 5.984×10¹¹ m. T² = 4π²(5.984×10¹¹)³/(6.674×10⁻¹¹ × 10³¹). T ≈ 2.19 years.",answer:"2.19",tolerance:0.12,solves:198,timeMin:45,points:25},
    {id:"q6",subject:"Informatics",difficulty:"Hard",title:"Constrained Minimum Spanning Tree",statement:"A connected weighted graph has MST weight 15. You must include edge E of weight 7 (not in the MST). Adding E to the MST creates one cycle. The heaviest non-E edge in that cycle has weight 4. What is the minimum spanning tree weight containing E?",hint:"Adding a non-MST edge to the MST always creates exactly one cycle. To restore the spanning tree property while minimising total weight, remove the maximum-weight edge from the cycle — but that edge cannot be the forced edge E itself.",solution:"Original MST weight = 15. Add edge E (weight 7): new weight = 15 + 7 = 22. The cycle contains E and other MST edges. Remove the heaviest non-E edge (weight 4): 22 − 4 = 18.",answer:"18",tolerance:0,solves:312,timeMin:60,points:25}
  ],
  whatsapp:[
    {name:"Physics Hub",emoji:"⚛️",color:"#007B8F",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"423"},
    {name:"Maths Hub",emoji:"∞",color:"#4CAF50",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"546"},
    {name:"Biology Hub",emoji:"🌿",color:"#66bb6a",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"389"},
    {name:"Astronomy Hub",emoji:"🪐",color:"#FFD700",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"412"},
    {name:"Chemistry Hub",emoji:"🧪",color:"#00b4cc",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"397"},
    {name:"BDOH General Chat",emoji:"🏆",color:"#4CAF50",link:"https://chat.whatsapp.com/BQWjAm1koZABG3Amd5D4ic",members:"726"}
  ],
  submissions:[]
};

/* ── localStorage persistence ── */
const BDOH_STORAGE_KEY='bdoh_data_v1';

function bdohLoad(){
  try{
    const raw=localStorage.getItem(BDOH_STORAGE_KEY);
    if(raw){
      const s=JSON.parse(raw);
      return{
        panelists:  s.panelists   ||BDOH_DEFAULTS.panelists,
        contests:   s.contests    ||BDOH_DEFAULTS.contests,
        problems:   s.problems    ||BDOH_DEFAULTS.problems,
        whatsapp:   s.whatsapp    ||BDOH_DEFAULTS.whatsapp,
        submissions:s.submissions ||BDOH_DEFAULTS.submissions
      };
    }
  }catch(e){console.warn('BDOH load error',e);}
  return JSON.parse(JSON.stringify(BDOH_DEFAULTS));
}

function bdohSave(){
  try{
    localStorage.setItem(BDOH_STORAGE_KEY,JSON.stringify({
      panelists:BDOH.panelists,
      contests:BDOH.contests,
      problems:BDOH.problems,
      whatsapp:BDOH.whatsapp,
      submissions:BDOH.submissions
    }));
  }catch(e){console.warn('BDOH save error',e);}
}

const BDOH=bdohLoad();
