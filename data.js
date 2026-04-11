/* ================================================================
   BDOH DATA.JS — single source of truth + localStorage persistence
   Admin changes saved to localStorage; exam/index always read latest.
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

  /* ── Sample contests (shown until admin creates real ones) ── */
  contests: [
    {
      id:"c_demo1", status:"open",
      title:"National Physics Olympiad Qualifier",
      subject:"Physics", date:"2026-04-15",
      openTime:"", closeTime:"",
      duration:90, level:"Grades 9 to 12",
      tags:["Mechanics","Optics","Waves"],
      description:"The official online qualifier for the Bangladesh Physics Olympiad. Covers the full syllabus with emphasis on conceptual depth.",
      passingScore:60, topics:[],
      questions:[
        {id:"dq1",type:"mcq",text:"A ball is thrown horizontally from a cliff of height 80 m. If g = 10 m/s², how long does it take to hit the ground?",options:["2 s","4 s","8 s","16 s"],answer:"1",points:10,explanation:"Using h = ½gt²: 80 = ½×10×t² → t = 4 s."},
        {id:"dq2",type:"short",text:"A spring with spring constant k = 200 N/m is compressed by 0.05 m. Calculate the elastic potential energy stored (in Joules).",answer:"0.25",tolerance:0.02,points:15,explanation:"PE = ½kx² = ½×200×0.05² = 0.25 J."},
        {id:"dq3",type:"mcq",text:"Which of the following is a vector quantity?",options:["Speed","Mass","Temperature","Velocity"],answer:"3",points:5,explanation:"Velocity has both magnitude and direction, making it a vector quantity."},
        {id:"dq4",type:"tf",text:"The refractive index of a medium can be less than 1 for visible light in a vacuum.",options:["True","False"],answer:"1",points:5,explanation:"By definition, the refractive index of vacuum is 1. For any real medium, n ≥ 1 for visible light."},
        {id:"dq5",type:"short",text:"A wave has frequency 440 Hz and wavelength 0.75 m. What is its speed in m/s?",answer:"330",tolerance:2,points:15,explanation:"v = fλ = 440 × 0.75 = 330 m/s."}
      ],
      security:{tabDetect:true,tabWarnAfter:1,tabMax:3,tabPenalty:5,detectBlur:true,disableRightClick:true,disableCopyPaste:false,shuffleQuestions:false,shuffleOptions:false,showAnswerAfter:true,allowReview:true,tabMessage:"⚠️ Tab switch detected! This is recorded.",disqualifyMessage:"You have been disqualified for repeated violations."},
      requiredFields:{name:true,category:true,classGrade:true,institution:true,phone:false,email:false}
    },
    {
      id:"c_demo2", status:"open",
      title:"Bangladesh Mathematical Olympiad Practice Drill",
      subject:"Mathematics", date:"2026-04-22",
      openTime:"", closeTime:"",
      duration:120, level:"Intermediate",
      tags:["Number Theory","Combinatorics","Algebra"],
      description:"A structured practice session simulating actual BdMO conditions. Problems require careful reasoning.",
      passingScore:60, topics:[],
      questions:[
        {id:"dq6",type:"short",text:"Find the largest positive integer k such that k divides n⁵ − n for every integer n.",answer:"30",tolerance:0,points:20,explanation:"By Fermat's Little Theorem, n⁵ ≡ n (mod 5). Also n(n−1)(n+1) divisible by 6. So k = LCM(2,3,5) = 30."},
        {id:"dq7",type:"mcq",text:"How many ways can 6 people be seated in a row if 2 specific people must sit together?",options:["120","240","360","720"],answer:"1",points:10,explanation:"Treat the pair as one unit: 5! arrangements × 2 internal = 240."},
        {id:"dq8",type:"tf",text:"For all positive integers n, the expression n² + n is always even.",options:["True","False"],answer:"0",points:5,explanation:"n² + n = n(n+1). Consecutive integers always include one even number, so the product is always even."},
        {id:"dq9",type:"short",text:"What is the sum of all positive divisors of 28?",answer:"56",tolerance:0,points:15,explanation:"Divisors of 28: 1,2,4,7,14,28. Sum = 1+2+4+7+14+28 = 56. (28 is a perfect number!)"}
      ],
      security:{tabDetect:true,tabWarnAfter:1,tabMax:3,tabPenalty:5,detectBlur:true,disableRightClick:true,disableCopyPaste:false,shuffleQuestions:true,shuffleOptions:true,showAnswerAfter:true,allowReview:true,tabMessage:"⚠️ Tab switch detected!",disqualifyMessage:"Disqualified for repeated violations."},
      requiredFields:{name:true,category:true,classGrade:true,institution:true,phone:false,email:false}
    },
    {
      id:"c_demo3", status:"soon",
      title:"IChO Prep Camp Final Assessment",
      subject:"Chemistry", date:"2026-04-30",
      openTime:"2026-04-30T09:00", closeTime:"2026-04-30T15:00",
      duration:180, level:"Advanced",
      tags:["Organic","Analytical","Physical"],
      description:"Capstone exam for the two-week IChO residential prep camp. Results determine national team shortlist.",
      passingScore:70, topics:[], questions:[],
      security:{tabDetect:true,tabWarnAfter:1,tabMax:2,tabPenalty:10,detectBlur:true,disableRightClick:true,disableCopyPaste:true,shuffleQuestions:true,shuffleOptions:true,showAnswerAfter:false,allowReview:true,tabMessage:"⚠️ Exam integrity warning!",disqualifyMessage:"Disqualified."},
      requiredFields:{name:true,category:true,classGrade:true,institution:true,phone:true,email:true}
    },
    {
      id:"c_demo4", status:"past",
      title:"Biology National Trial Round 2",
      subject:"Biology", date:"2026-03-12",
      openTime:"2026-03-12T09:00", closeTime:"2026-03-12T12:00",
      duration:90, level:"National",
      tags:["Cell Biology","Genetics","Ecology"],
      description:"The second national selection trial for IBO. Results and full solutions have been published.",
      passingScore:65, topics:[], questions:[],
      security:{tabDetect:true,tabWarnAfter:1,tabMax:3,tabPenalty:5,detectBlur:true,disableRightClick:true,disableCopyPaste:false,shuffleQuestions:false,shuffleOptions:false,showAnswerAfter:true,allowReview:true,tabMessage:"⚠️ Tab switch!",disqualifyMessage:"Disqualified."},
      requiredFields:{name:true,category:true,classGrade:true,institution:true,phone:false,email:false}
    }
  ],

  problems: [
    {id:"q1",subject:"Physics",difficulty:"Easy",title:"Projectile on an Inclined Plane",statement:"A ball is launched from the base of a smooth inclined plane at 45° to the horizontal. The incline itself makes 30° with the horizontal. Find the ratio of the range along the incline surface to the range on flat ground for the same launch speed.",hint:"Resolve gravity into components parallel and perpendicular to the incline surface, then apply kinematic equations independently along each axis.",solution:"Resolve g into g sin 30° (parallel, decelerating) and g cos 30° (perpendicular). Time of flight T = 2u sin(45°−30°) / (g cos 30°). Ratio simplifies to approximately 0.75.",answer:"0.75",tolerance:0.05,solves:1240,timeMin:15,points:10},
    {id:"q2",subject:"Mathematics",difficulty:"Medium",title:"Divisibility and Modular Arithmetic",statement:"For every integer n, the expression n³ − n is divisible by 6. Now find the largest positive integer k such that k divides n⁵ − n for every integer n. Enter k.",hint:"Factor n⁵ − n as n(n−1)(n+1)(n²+1) and test primes 2, 3, 5 systematically using Fermat's Little Theorem.",solution:"By FLT: n⁵ ≡ n (mod 5). Also n(n−1)(n+1) divisible by 2 and 3. LCM(2,3,5) = 30. Verification: n=2 gives 30, confirming k = 30.",answer:"30",tolerance:0,solves:876,timeMin:25,points:15},
    {id:"q3",subject:"Chemistry",difficulty:"Easy",title:"pH at the Half-Equivalence Point",statement:"A 25 mL sample of 0.10 M acetic acid (Ka = 1.8 × 10⁻⁵) is titrated with 0.10 M NaOH. Calculate the pH at the half-equivalence point. Give your answer to 2 decimal places.",hint:"At the half-equivalence point [CH₃COOH] = [CH₃COO⁻]. The Henderson-Hasselbalch log term vanishes.",solution:"pH = pKa + log([A⁻]/[HA]). At half-equivalence log(1) = 0. pH = pKa = −log(1.8 × 10⁻⁵) = 4.74.",answer:"4.74",tolerance:0.05,solves:954,timeMin:20,points:10},
    {id:"q4",subject:"Biology",difficulty:"Medium",title:"Dihybrid Cross — Dominant Phenotype Fraction",statement:"Two plants each with genotype AaBb are crossed. What fraction of the offspring will display both dominant phenotypes simultaneously? Express your answer as a decimal.",hint:"Calculate P(A_) and P(B_) separately then multiply. Each follows a standard monohybrid ratio.",solution:"P(A_) = 3/4, P(B_) = 3/4. By independence: 3/4 × 3/4 = 9/16 = 0.5625.",answer:"0.5625",tolerance:0.001,solves:720,timeMin:15,points:10},
    {id:"q5",subject:"Astronomy",difficulty:"Hard",title:"Binary Star Orbital Period",statement:"Two stars of mass 2M☉ and 3M☉ orbit their common centre of mass with a separation of 4 AU. Calculate their orbital period in years.",hint:"Apply Kepler's third law: T² = 4π²a³ / G(M₁+M₂). Convert AU to metres before substituting.",solution:"Total mass = 10³¹ kg. a = 5.984×10¹¹ m. T ≈ 2.19 years.",answer:"2.19",tolerance:0.12,solves:198,timeMin:45,points:25},
    {id:"q6",subject:"Informatics",difficulty:"Hard",title:"Constrained Minimum Spanning Tree",statement:"A connected weighted graph has MST weight 15. You must include edge E of weight 7 (not in the MST). Adding E creates one cycle; the heaviest non-E edge in that cycle has weight 4. What is the constrained MST weight?",hint:"Add E (weight 7), then remove the heaviest non-E cycle edge (weight 4).",solution:"15 + 7 − 4 = 18.",answer:"18",tolerance:0,solves:312,timeMin:60,points:25}
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
