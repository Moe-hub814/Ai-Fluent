import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./lib/supabase";

// AI FLUENT — SUMMIT EDITION v2
// Live news, practice mode, daily challenges, achievements

// THEME SYSTEM
const THEMES = {
  dark: {
    skyTop:"#0B1A2E",skyMid:"#132D4A",skyBot:"#1A4060",
    mountain:"#1E3348",mountainLight:"#2A4560",snow:"#E8F0F8",
    trail:"#D4A55A",trailGlow:"#FFE0A0",trailDark:"#8A7040",
    bgDark:"#0A1420",bgCard:"#0F1E30",bgCardLight:"#142838",
    border:"rgba(255,255,255,0.07)",borderGold:"rgba(212,165,90,0.3)",
    text:"#E8EEF4",textMuted:"#8AA0B8",textDim:"#506878",
    gold:"#D4A55A",goldLight:"#FFE8C0",goldDark:"#A07830",
    green:"#4ABA78",greenDark:"#2A8A50",greenLight:"#D0F0E0",
    teal:"#3AA8A0",tealLight:"#C0F0F0",
    blue:"#4A90D9",blueLight:"#C0D8F0",
    purple:"#7A6BBF",purpleLight:"#C0B0E8",
    red:"#D85858",coral:"#E88060",
    font:"'Nunito',sans-serif",fontDisplay:"'Quicksand',sans-serif",
    mode:"dark",
  },
  light: {
    skyTop:"#E8F0F8",skyMid:"#D0E0F0",skyBot:"#B8D0E8",
    mountain:"#C0D0E0",mountainLight:"#D0DCE8",snow:"#FFFFFF",
    trail:"#B8903A",trailGlow:"#D4A55A",trailDark:"#8A7040",
    bgDark:"#F0F4F8",bgCard:"#FFFFFF",bgCardLight:"#F8FAFC",
    border:"rgba(0,0,0,0.08)",borderGold:"rgba(180,130,50,0.25)",
    text:"#1A2A3A",textMuted:"#4A6070",textDim:"#8098A8",
    gold:"#B8903A",goldLight:"#8A6A2A",goldDark:"#6A5020",
    green:"#2A8A50",greenDark:"#1A6A38",greenLight:"#D0F0E0",
    teal:"#2A8880",tealLight:"#C0F0F0",
    blue:"#3070B8",blueLight:"#C0D8F0",
    purple:"#5A4B9F",purpleLight:"#C0B0E8",
    red:"#C04040",coral:"#D06848",
    font:"'Nunito',sans-serif",fontDisplay:"'Quicksand',sans-serif",
    mode:"light",
  }
};

// Theme state — persisted in localStorage
let _theme = localStorage.getItem("ai_fluent_theme") || "dark";
let C = {...THEMES[_theme]};
const setTheme = (t) => { _theme = t; C = {...THEMES[t]}; localStorage.setItem("ai_fluent_theme", t) };
const getTheme = () => _theme;

// LANGUAGE SYSTEM
const LANGS={en:{name:"English",flag:"🇺🇸",dir:"ltr"},ar:{name:"العربية",flag:"🇸🇦",dir:"rtl"},fr:{name:"Français",flag:"🇫🇷",dir:"ltr"}};
const UI={
  en:{greeting:h=>h<12?"Good morning":h<17?"Good afternoon":"Good evening",map:"← Map",back:"← Back",signIn:"Sign In",signUp:"Sign Up",email:"Email",password:"Password",startClimbing:"Start Climbing",createAccount:"Create Account",checkEmail:"Check your email!",weSentLink:"We sent a link to",loading:"Loading AI Fluent...",tapIfStuck:"Tap anywhere if stuck",startPractice:"Start Practice →",completeLesson:"Complete lesson →",nextQ:"Next Question →",seeResults:"See My Results →",retry:"Retry for a higher rating →",tryAgain:"Try Again",reviewFirst:"← Review the lesson first",need70:"You need 70% or higher to pass this lesson",points:"Points earned",shareRating:"📤 Share My Rating",shareProgress:"📤 Share My Progress",askLumi:"Ask Lumi",questionsHelp:"Questions? Ask Lumi",guideHere:"Your guide is here to help",peoplAsk:"People often ask...",lumiGuide:"Lumi — Guide",hint:"Hint",why:"Why?",check:"Check Answer",lumiFeedback:"Lumi's feedback",lumiReviewing:"Lumi is reviewing...",submit:"Submit for Review",dailyChallenge:"Daily Challenge",keepStreak:"Keep your streak",aiNews:"AI News",live:"Live",newsDesc:"Today's AI stories, simplified by Lumi",newsSearch:"Lumi is searching for today's AI news...",aiTools:"AI Tools",toolsDesc:"Guided step-by-step workflows",profile:"Profile",dayStreak:T.dayStreak,lessonsDone:T.lessonsDone,lumiChats:T.lumiChats,achievements:T.achievements,altRatings:"Altitude Ratings Earned",summit:"Summit",ridge:"Ridge",graded:"Graded",learningPaths:"Learning Paths",calendar:"Activity Calendar",bestStreak:"Best streak",freezes:"remaining",lightMode:"☀️ Light Mode",darkMode:"🌙 Dark Mode",signOut:"Sign Out",language:"Language",lessons:"lessons",sections:"sections",practice:"practice",completed:"Completed",submitChallenge:"Submit Challenge ⚡",challengeComplete:"🔥 Challenge complete!",challengeDesc:"Complete today's challenge to keep your streak alive",simpleVersion:"The simple version",whyMatters:"Why it matters to you",askAboutThis:"Ask Lumi about this",explainPlain:"Get it explained in plain language",claimSummit:"🏔️ Claim Summit Rating!",claimRidge:"⛰️ Claim Ridge Rating!",completeBtn:"✦ Complete Lesson",next:"Next",skip:"Skip",startJourney:"Start My Journey →",altitude:"Altitude",toSummit:"to summit",tapExplore:"Tap to explore",tools6:"6 tools"},
  ar:{greeting:h=>h<12?"صباح الخير":h<17?"مساء الخير":"مساء الخير",map:"الخريطة →",back:"رجوع →",signIn:"تسجيل الدخول",signUp:"إنشاء حساب",email:"البريد الإلكتروني",password:"كلمة المرور",startClimbing:"ابدأ التسلق",createAccount:"إنشاء حساب",checkEmail:"!تحقق من بريدك",weSentLink:"أرسلنا رابطاً إلى",loading:"...جاري تحميل AI Fluent",tapIfStuck:"اضغط في أي مكان إذا توقف",startPractice:"← ابدأ التمرين",completeLesson:"← أكمل الدرس",nextQ:"← السؤال التالي",seeResults:"← عرض نتائجي",retry:"← أعد المحاولة لتقييم أعلى",tryAgain:"حاول مرة أخرى",reviewFirst:"راجع الدرس أولاً →",need70:"تحتاج 70% أو أعلى لاجتياز هذا الدرس",points:"النقاط المكتسبة",shareRating:"📤 شارك تقييمي",shareProgress:"📤 شارك تقدمي",askLumi:"اسأل لومي",questionsHelp:"أسئلة؟ اسأل لومي",guideHere:"مرشدك هنا للمساعدة",peoplAsk:"...الناس يسألون عادة",lumiGuide:"لومي — المرشد",hint:"تلميح",why:"لماذا؟",check:"تحقق من الإجابة",lumiFeedback:"ملاحظات لومي",lumiReviewing:"...لومي يراجع",submit:"أرسل للمراجعة",dailyChallenge:"التحدي اليومي",keepStreak:"حافظ على سلسلتك",aiNews:"أخبار الذكاء",live:"مباشر",newsDesc:"أخبار الذكاء اليوم مبسطة بواسطة لومي",newsSearch:"...لومي يبحث عن أخبار اليوم",aiTools:"أدوات الذكاء",toolsDesc:"سير عمل موجه خطوة بخطوة",profile:"الملف الشخصي",dayStreak:"أيام متتالية",lessonsDone:"دروس مكتملة",lumiChats:"محادثات لومي",achievements:"الإنجازات",altRatings:"تقييمات الارتفاع المكتسبة",summit:"القمة",ridge:"التلال",graded:"مُقيَّم",learningPaths:"مسارات التعلم",calendar:"تقويم النشاط",bestStreak:"أفضل سلسلة",freezes:"متبقية",lightMode:"☀️ وضع فاتح",darkMode:"🌙 وضع داكن",signOut:"تسجيل الخروج",language:"اللغة",lessons:"دروس",sections:"أقسام",practice:"تمارين",completed:"مكتمل",submitChallenge:"أرسل التحدي ⚡",challengeComplete:"!🔥 التحدي مكتمل",challengeDesc:"أكمل تحدي اليوم للحفاظ على سلسلتك",simpleVersion:"النسخة المبسطة",whyMatters:"لماذا يهمك هذا",askAboutThis:"اسأل لومي عن هذا",explainPlain:"احصل على شرح بلغة بسيطة",claimSummit:"🏔️ !احصل على تقييم القمة",claimRidge:"⛰️ !احصل على تقييم التلال",completeBtn:"✦ أكمل الدرس",next:"التالي",skip:"تخطي",startJourney:"← ابدأ رحلتي",altitude:"الارتفاع",toSummit:"إلى القمة",tapExplore:"اضغط للاستكشاف",tools6:"6 أدوات"},
  fr:{greeting:h=>h<12?"Bonjour":h<17?"Bon après-midi":"Bonsoir",map:"← Carte",back:"← Retour",signIn:"Se connecter",signUp:"S'inscrire",email:"E-mail",password:"Mot de passe",startClimbing:"Commencer",createAccount:"Créer un compte",checkEmail:"Vérifiez votre e-mail !",weSentLink:"Nous avons envoyé un lien à",loading:"Chargement d'AI Fluent...",tapIfStuck:"Appuyez si bloqué",startPractice:"Commencer →",completeLesson:"Terminer →",nextQ:"Suivante →",seeResults:"Voir mes résultats →",retry:"Réessayer →",tryAgain:"Réessayer",reviewFirst:"← Revoir la leçon",need70:"70% minimum pour réussir",points:"Points gagnés",shareRating:"📤 Partager ma note",shareProgress:"📤 Partager mes progrès",askLumi:"Demander à Lumi",questionsHelp:"Questions ? Demandez à Lumi",guideHere:"Votre guide est là",peoplAsk:"Questions fréquentes...",lumiGuide:"Lumi — Guide",hint:"Indice",why:"Pourquoi ?",check:"Vérifier",lumiFeedback:"Avis de Lumi",lumiReviewing:"Lumi examine...",submit:"Soumettre",dailyChallenge:"Défi du jour",keepStreak:"Gardez votre série",aiNews:"Actu IA",live:"Direct",newsDesc:"Actus IA simplifiées par Lumi",newsSearch:"Lumi cherche les actus...",aiTools:"Outils IA",toolsDesc:"Workflows guidés",profile:"Profil",dayStreak:"Jours consécutifs",lessonsDone:"Leçons faites",lumiChats:"Discussions",achievements:"Réussites",altRatings:"Notes d'altitude",summit:"Sommet",ridge:"Crête",graded:"Noté",learningPaths:"Parcours",calendar:"Calendrier d'activité",bestStreak:"Meilleure série",freezes:"restantes",lightMode:"☀️ Mode clair",darkMode:"🌙 Mode sombre",signOut:"Se déconnecter",language:"Langue",lessons:"leçons",sections:"sections",practice:"exercices",completed:"Terminé",submitChallenge:"Soumettre ⚡",challengeComplete:"🔥 Défi terminé !",challengeDesc:"Complétez le défi pour garder votre série",simpleVersion:"Version simple",whyMatters:"Pourquoi c'est important",askAboutThis:"Demander à Lumi",explainPlain:"Explication simple",claimSummit:"🏔️ Note Sommet !",claimRidge:"⛰️ Note Crête !",completeBtn:"✦ Terminer",next:"Suivant",skip:"Passer",startJourney:"Commencer →",altitude:"Altitude",toSummit:"vers le sommet",tapExplore:"Appuyez pour explorer",tools6:"6 outils"},
};
let _lang=localStorage.getItem("ai_fluent_lang")||"en";
let T={...UI[_lang]};

// Translated location & tool names
const LOC_NAMES={
  en:{basics:"Base Camp",writing:"Forest Lodge",images:"Artist's Outlook",business:"Market Pass",data:"Signal Peak",daily:"Village Rest",master:"The Summit"},
  ar:{basics:"المخيم الأساسي",writing:"نزل الغابة",images:"مرصد الفنان",business:"ممر السوق",data:"قمة الإشارة",daily:"استراحة القرية",master:"القمة"},
  fr:{basics:"Camp de Base",writing:"Lodge Forestier",images:"Point de Vue Artistique",business:"Col du Marché",data:"Pic du Signal",daily:"Repos du Village",master:"Le Sommet"},
};
const LOC_SUBS={
  en:{basics:"AI Basics",writing:"AI for Writing",images:"AI Images",business:"AI for Business",data:"AI for Data",daily:"AI Daily Life",master:"AI Mastery"},
  ar:{basics:"أساسيات الذكاء",writing:"الذكاء للكتابة",images:"صور الذكاء",business:"الذكاء للأعمال",data:"الذكاء للبيانات",daily:"الذكاء اليومي",master:"إتقان الذكاء"},
  fr:{basics:"Bases de l'IA",writing:"IA pour l'écriture",images:"Images IA",business:"IA pour les affaires",data:"IA pour les données",daily:"IA au quotidien",master:"Maîtrise de l'IA"},
};
const LOC_DESCS={
  en:{basics:"Where every climber begins",writing:"Master writing with AI",images:"Create visuals from any vantage",business:"AI meets real business results",data:"See clearly through any data",daily:"AI woven into everyday life",master:"You've reached AI fluency"},
  ar:{basics:"حيث يبدأ كل متسلق",writing:"أتقن الكتابة مع الذكاء",images:"أنشئ صوراً من أي زاوية",business:"الذكاء يحقق نتائج حقيقية",data:"انظر بوضوح عبر البيانات",daily:"الذكاء في الحياة اليومية",master:"لقد وصلت إلى إتقان الذكاء"},
  fr:{basics:"Où chaque grimpeur commence",writing:"Maîtrisez l'écriture avec l'IA",images:"Créez des visuels de partout",business:"L'IA au service des résultats",data:"Voyez clair dans vos données",daily:"L'IA au quotidien",master:"Vous maîtrisez l'IA"},
};
const TOOL_NAMES={
  en:{email:"Write an Email",prompt:"Build a Prompt",summarize:"Summarize Text",resume:"Resume Helper",social:"Social Post Writer",study:"Study Helper"},
  ar:{email:"اكتب بريداً إلكترونياً",prompt:"ابنِ أمر ذكاء",summarize:"لخّص نصاً",resume:"مساعد السيرة",social:"كاتب منشورات",study:"مساعد الدراسة"},
  fr:{email:"Écrire un e-mail",prompt:"Construire un prompt",summarize:"Résumer un texte",resume:"Aide CV",social:"Rédiger un post",study:"Aide aux études"},
};
const TOOL_DESCS={
  en:{email:"Professional emails in seconds",prompt:"Master the art of talking to AI",summarize:"Long docs into key points",resume:"Stand out from the crowd",social:"Scroll-stopping content",study:"Learn anything faster"},
  ar:{email:"رسائل احترافية في ثوانٍ",prompt:"أتقن فن التحدث للذكاء",summarize:"وثائق طويلة في نقاط",resume:"تميّز عن الآخرين",social:"محتوى يوقف التمرير",study:"تعلم أي شيء أسرع"},
  fr:{email:"E-mails pro en secondes",prompt:"L'art de parler à l'IA",summarize:"Docs longs en points clés",resume:"Démarquez-vous",social:"Contenu captivant",study:"Apprenez plus vite"},
};
// Helper functions
const locName=(id)=>(LOC_NAMES[_lang]||LOC_NAMES.en)[id]||id;
const locSub=(id)=>(LOC_SUBS[_lang]||LOC_SUBS.en)[id]||id;
const locDesc=(id)=>(LOC_DESCS[_lang]||LOC_DESCS.en)[id]||id;
const toolName=(id)=>(TOOL_NAMES[_lang]||TOOL_NAMES.en)[id]||id;
const toolDesc=(id)=>(TOOL_DESCS[_lang]||TOOL_DESCS.en)[id]||id;

// Lesson title translations
const LESSON_TITLES={
  ar:{"What Is AI, Really?":"ما هو الذكاء الاصطناعي حقاً؟","How AI Actually Learns":"كيف يتعلم الذكاء الاصطناعي","Choosing the Right AI Tool":"اختيار أداة الذكاء المناسبة","AI Safety and Privacy":"أمان الذكاء والخصوصية","Your First AI Email":"أول بريد إلكتروني بالذكاء","Writing Blog Posts & Articles with AI":"كتابة المقالات بالذكاء","Social Media Writing with AI":"كتابة وسائل التواصل بالذكاء","AI for Reports and Documents":"الذكاء للتقارير والوثائق","Creating AI Images":"إنشاء صور بالذكاء","AI Image Tools Compared":"مقارنة أدوات الصور","Advanced Prompting for Images":"أوامر متقدمة للصور","AI Tools That Save Hours":"أدوات توفر ساعات","AI for Customer Communication":"الذكاء للتواصل مع العملاء","AI for Meetings and Notes":"الذكاء للاجتماعات والملاحظات","Measuring AI's Impact on Your Business":"قياس تأثير الذكاء على عملك","AI + Spreadsheets":"الذكاء + جداول البيانات","Analyzing Data with AI":"تحليل البيانات بالذكاء","AI for Data Cleaning":"الذكاء لتنظيف البيانات","AI in Everyday Life":"الذكاء في الحياة اليومية","AI for Health and Wellness":"الذكاء للصحة والعافية","AI for Travel and Planning":"الذكاء للسفر والتخطيط","AI for Learning and Personal Growth":"الذكاء للتعلم والنمو الشخصي"},
  fr:{"What Is AI, Really?":"Qu'est-ce que l'IA, vraiment ?","How AI Actually Learns":"Comment l'IA apprend réellement","Choosing the Right AI Tool":"Choisir le bon outil d'IA","AI Safety and Privacy":"Sécurité et confidentialité de l'IA","Your First AI Email":"Votre premier e-mail avec l'IA","Writing Blog Posts & Articles with AI":"Écrire des articles avec l'IA","Social Media Writing with AI":"Rédaction réseaux sociaux avec l'IA","AI for Reports and Documents":"L'IA pour rapports et documents","Creating AI Images":"Créer des images avec l'IA","AI Image Tools Compared":"Comparaison des outils d'images","Advanced Prompting for Images":"Prompts avancés pour images","AI Tools That Save Hours":"Outils IA qui font gagner du temps","AI for Customer Communication":"L'IA pour la communication client","AI for Meetings and Notes":"L'IA pour réunions et notes","Measuring AI's Impact on Your Business":"Mesurer l'impact de l'IA sur votre business","AI + Spreadsheets":"IA + Tableurs","Analyzing Data with AI":"Analyser les données avec l'IA","AI for Data Cleaning":"L'IA pour le nettoyage de données","AI in Everyday Life":"L'IA au quotidien","AI for Health and Wellness":"L'IA pour la santé et le bien-être","AI for Travel and Planning":"L'IA pour voyages et planification","AI for Learning and Personal Growth":"L'IA pour l'apprentissage et le développement"},
};
const lessonTitle=(title)=>_lang==="en"?title:(LESSON_TITLES[_lang]||{})[title]||title;
const setLang=(l)=>{_lang=l;T={...UI[l]};localStorage.setItem("ai_fluent_lang",l);document.documentElement.dir=LANGS[l].dir;document.documentElement.lang=l};
const getLang=()=>_lang;
const isRTL=()=>LANGS[_lang]?.dir==="rtl";

// Translation cache for lesson content translated by Claude
const TCache={
  _k:"ai_fluent_tcache",
  _g(){try{return JSON.parse(localStorage.getItem(this._k)||"{}")}catch{return{}}},
  get(lang,key){return this._g()[`${lang}:${key}`]},
  set(lang,key,data){const c=this._g();c[`${lang}:${key}`]=data;try{localStorage.setItem(this._k,JSON.stringify(c))}catch(e){console.warn("Cache full, clearing old translations");localStorage.removeItem(this._k)}},
};

// Language selector component
const LangSelector=({onChangeLang,compact})=>{
  const[open,setOpen]=useState(false);const cur=LANGS[getLang()];
  return(<div style={{position:"relative",zIndex:50}}>
    <button onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:compact?4:6,background:C.mode==="dark"?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,borderRadius:compact?10:12,padding:compact?"6px 10px":"8px 14px",fontSize:compact?12:14,fontFamily:C.font,color:C.text}}>
      <span>{cur.flag}</span>{!compact&&<span style={{fontSize:13,fontWeight:600}}>{cur.name}</span>}
    </button>
    {open&&<div style={{position:"absolute",top:"110%",[isRTL()?"left":"right"]:0,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:6,zIndex:100,minWidth:160,boxShadow:"0 8px 30px rgba(0,0,0,.3)"}}>
      {Object.entries(LANGS).map(([code,lang])=>(
        <button key={code} onClick={()=>{onChangeLang(code);setOpen(false)}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",borderRadius:10,border:"none",background:code===getLang()?"rgba(212,165,90,.1)":"transparent",textAlign:"left"}}>
          <span style={{fontSize:18}}>{lang.flag}</span>
          <span style={{color:code===getLang()?C.gold:C.text,fontSize:14,fontWeight:code===getLang()?700:500,fontFamily:C.font}}>{lang.name}</span>
        </button>
      ))}
    </div>}
  </div>);
};

const Lumi = ({size=40,level=1,mood="happy",animate=false}) => {
  const s=size;const glow=Math.min(0.2+level*0.05,0.5);const ir=Math.min(16+level,22);
  return(<div style={{width:s,height:s,display:"inline-flex",alignItems:"center",justifyContent:"center",animation:animate?"lumiFloat 3s ease-in-out infinite":"none"}}>
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs><radialGradient id={`lo${s}`} cx="50%" cy="45%" r="50%"><stop offset="0%" stopColor="#FFF8E8" stopOpacity={glow+0.2}/><stop offset="100%" stopColor="#D4A55A" stopOpacity="0"/></radialGradient><radialGradient id={`lb${s}`} cx="50%" cy="40%" r="45%"><stop offset="0%" stopColor="#FFFDF5"/><stop offset="40%" stopColor="#FFE8C0"/><stop offset="100%" stopColor="#D4A55A"/></radialGradient></defs>
      <circle cx="30" cy="30" r={ir+8} fill={`url(#lo${s})`}/><circle cx="30" cy="30" r={ir} fill={`url(#lb${s})`} stroke="#D4A55A" strokeWidth="0.5" opacity="0.9"/>
      {level>=3&&<circle cx="30" cy="30" r={ir+3} fill="none" stroke="#FFE8C0" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4"/>}
      <circle cx="24" cy="28" r="1.5" fill="#8A7040"/><circle cx="36" cy="28" r="1.5" fill="#8A7040"/>
      {mood==="happy"&&<path d="M25 33 Q30 37 35 33" fill="none" stroke="#8A7040" strokeWidth="1.2" strokeLinecap="round"/>}
      {mood==="thinking"&&<circle cx="30" cy="34" r="2" fill="none" stroke="#8A7040" strokeWidth="1"/>}
      {mood==="excited"&&<path d="M25 32 Q30 38 35 32" fill="none" stroke="#8A7040" strokeWidth="1.5" strokeLinecap="round"/>}
      <line x1="30" y1={30-ir-4} x2="30" y2={30-ir-8} stroke="#FFE8C0" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    </svg>
  </div>);
};

const LOCS = [
  {id:"basics",name:"Base Camp",icon:"🏕️",desc:"Where every climber begins",color:C.green,x:15,y:85,lessons:4,sub:"AI Basics"},
  {id:"writing",name:"Forest Lodge",icon:"✍️",desc:"Master writing with AI",color:C.teal,x:35,y:70,lessons:4,sub:"AI for Writing"},
  {id:"images",name:"Artist's Outlook",icon:"🎨",desc:"Create visuals from any vantage",color:C.coral,x:60,y:75,lessons:3,sub:"AI Images"},
  {id:"business",name:"Market Pass",icon:"💼",desc:"AI meets real business results",color:C.gold,x:75,y:55,lessons:4,sub:"AI for Business"},
  {id:"data",name:"Signal Peak",icon:"📈",desc:"See clearly through any data",color:C.blue,x:55,y:38,lessons:3,sub:"AI for Data"},
  {id:"daily",name:"Village Rest",icon:"🏠",desc:"AI woven into everyday life",color:C.tealLight,x:28,y:48,lessons:4,sub:"AI Daily Life"},
  {id:"master",name:"The Summit",icon:"⛰️",desc:"You've reached AI fluency",color:C.snow,x:50,y:12,lessons:0,sub:"AI Mastery"},
];

const LESSONS = {
  basics: [
    {title:"What Is AI, Really?",sections:[{h:"Think of AI like a smart assistant",body:"AI is a computer program that learns from examples — like how you learned to recognize dogs by seeing lots of dogs.\n\nIt doesn't \"think\" like a human. It's an incredibly fast pattern-matching machine that's read most of the internet."},{h:"What can AI do today?",body:"AI can: write text, create images, translate languages, summarize documents, answer questions, and brainstorm.\n\nCAN'T do: truly understand emotions, be creative like humans, or reliably do complex math."},{h:"The key concept: prompts",body:"What you type to AI is called a \"prompt.\" Better prompt = better response.\n\nLike giving directions — \"go somewhere nice\" vs \"take me to the Italian restaurant on Oak Street.\""}],questions:["Give me a real-life example","Difference between AI and a regular app?","Is AI going to take my job?"],practice:[{type:"multiple_choice",q:"What is a 'prompt' in AI?",opts:["A computer virus","What you type to tell AI what to do","An AI's name","A type of software"],correct:1,explain:"A prompt is your instruction to AI — the better you describe what you want, the better the result."},{type:"multiple_choice",q:"Which of these can AI do TODAY?",opts:["Feel emotions like humans","Write text and create images","Think independently","Replace all human jobs"],correct:1,explain:"AI excels at writing, images, translation, and summarization."},{type:"free_response",q:"Write a prompt asking AI to help draft a professional email to your boss about taking Friday off. Be specific!",hint:"Include WHO you're writing to, WHAT it's about, and WHAT TONE you want."}]},
    {title:"How AI Actually Learns",sections:[{h:"The training process",body:"AI learns by studying millions of examples. Imagine showing a child thousands of pictures of cats and dogs until they can tell them apart — AI works similarly but with billions of examples.\n\nThis process is called \"training.\" Companies like Anthropic, OpenAI, and Google train their AI models on enormous amounts of text from books, websites, and documents."},{h:"What are AI models?",body:"An AI \"model\" is like a finished student that's already been trained. When you use ChatGPT or Claude, you're talking to a model that finished its training months ago.\n\nDifferent models are good at different things. Some are fast but basic (like Haiku). Others are slower but brilliant (like Opus). It's like choosing between a quick text and a thoughtful letter."},{h:"Why AI makes mistakes",body:"AI doesn't actually \"know\" things — it predicts what words should come next based on patterns it learned. Sometimes those patterns lead to wrong answers.\n\nThis is called \"hallucination\" — when AI confidently says something incorrect. Always double-check important facts, especially numbers, dates, and medical information."}],questions:["Why does AI sometimes make things up?","What's the difference between ChatGPT and Claude?","How long does it take to train an AI?"],practice:[{type:"multiple_choice",q:"What is an AI 'hallucination'?",opts:["When AI creates images","When AI confidently says something incorrect","When AI gets confused","When AI stops working"],correct:1,explain:"Hallucination is when AI generates confident-sounding but incorrect information. Always verify important facts."},{type:"multiple_choice",q:"Why do different AI models exist?",opts:["Companies can't agree on one","Different models have different speed/quality tradeoffs","Only one model actually works","They're all the same inside"],correct:1,explain:"Models range from fast & cheap (Haiku) to slow & brilliant (Opus). You pick based on your needs."},{type:"free_response",q:"Explain to a friend why they shouldn't blindly trust everything AI tells them. Use a real-world analogy.",hint:"Think about the hallucination concept. Compare AI to something familiar that's helpful but not always right."}]},
    {title:"Choosing the Right AI Tool",sections:[{h:"The big players",body:"The main AI assistants you'll encounter:\n\n• Claude (by Anthropic) — great at writing, analysis, and following complex instructions\n• ChatGPT (by OpenAI) — the most popular, good all-around\n• Gemini (by Google) — built into Google products, good with current info\n• Copilot (by Microsoft) — integrated into Word, Excel, and Windows"},{h:"Free vs paid",body:"Most AI tools have free tiers that are perfectly useful for beginners. Paid versions ($20/month typically) give you faster responses, smarter models, and more usage.\n\nStart free. Upgrade when you find yourself hitting limits or wanting better quality."},{h:"When to use which tool",body:"Writing emails or documents → Claude or ChatGPT\nSearching for current info → Gemini or Copilot\nWorking in Google Docs → Gemini\nWorking in Microsoft Office → Copilot\nCreating images → Midjourney, DALL-E, or Adobe Firefly\n\nThe best tool is the one you'll actually use. Pick one and learn it well before trying others."}],questions:["Which AI tool is best for beginners?","Is the free version good enough?","Can I use multiple AI tools?"],practice:[{type:"multiple_choice",q:"What's the best strategy for a beginner choosing AI tools?",opts:["Buy the most expensive one","Use all of them equally","Pick one, learn it well, then explore others","Wait for the perfect tool to come out"],correct:2,explain:"Mastering one tool first gives you transferable skills. Most AI tools work similarly once you understand prompting."},{type:"free_response",q:"Based on your daily tasks, which AI tool would help you most and why? Be specific about what you'd use it for.",hint:"Think about your actual daily routine — emails, documents, research, creative work. Match a tool to your biggest need."}]},
    {title:"AI Safety and Privacy",sections:[{h:"What happens to what you type",body:"When you type something into an AI tool, your text gets sent to the company's servers. Most companies say they don't read your conversations, but policies vary.\n\nRule of thumb: Don't share passwords, social security numbers, confidential business secrets, or deeply private medical information with AI tools."},{h:"AI bias and limitations",body:"AI learned from internet text, which includes biases. It might give different advice based on names that suggest different genders or ethnicities.\n\nAlways think critically about AI responses, especially when it comes to medical advice, legal matters, financial decisions, or anything with real consequences."},{h:"How to use AI responsibly",body:"The golden rules:\n\n1. Don't pass off AI writing as entirely your own in school or work without disclosure\n2. Verify facts before sharing them\n3. Don't use AI to create misleading content\n4. Remember AI makes mistakes — you're the final editor\n5. Keep sensitive personal info out of AI chats"}],questions:["Is it safe to put my personal info in AI?","Can AI be biased?","Should I tell people when I use AI?"],practice:[{type:"multiple_choice",q:"Which of these should you NEVER share with an AI chatbot?",opts:["A recipe you want to improve","Your social security number","A work email you need help writing","A question about history"],correct:1,explain:"Never share sensitive personal data like SSN, passwords, or financial account numbers with AI tools."},{type:"multiple_choice",q:"What should you do with important facts AI gives you?",opts:["Trust them completely — AI is always right","Ignore them — AI is always wrong","Verify them from a reliable source","Share them immediately on social media"],correct:2,explain:"AI can hallucinate. Always verify important facts, especially medical, legal, or financial information."},{type:"free_response",q:"Your coworker says 'I just paste all our client contracts into ChatGPT to summarize them.' What would you tell them about the risks?",hint:"Think about what happens to the data, who might see it, and whether client info should be shared externally."}]}
  ],
  writing: [
    {title:"Your First AI Email",sections:[{h:"Why AI and email are perfect together",body:"Most people spend 2+ hours/day on email. AI cuts that in half — not writing FOR you, but giving strong drafts you refine.\n\nThe result: clearer emails, faster turnaround, less staring at a blank screen."},{h:"The 3-part prompt formula",body:"Every great AI email prompt has three parts:\n\n1. ROLE — Tell AI who to be: \"You are a professional email writer\"\n2. CONTEXT — Who you're writing to and why: \"Writing to my manager about...\"\n3. TONE — How it should sound: formal, friendly, direct\n\nPut these together and AI gives remarkably good drafts on the first try."}],questions:["Show me a before/after","What if it sounds robotic?","Help me write one now"],practice:[{type:"multiple_choice",q:"What are the 3 parts of a great email prompt?",opts:["Subject, Body, Signature","Role, Context, Tone","From, To, Message","Draft, Edit, Send"],correct:1,explain:"Role (who AI should be), Context (who you're writing to and why), and Tone (how it should sound)."},{type:"free_response",q:"Using the 3-part formula, write a prompt to AI for drafting a thank-you email to a client who just signed a contract.",hint:"Start with the ROLE, add CONTEXT about the client and contract, specify the TONE."}]},
    {title:"Writing Blog Posts & Articles with AI",sections:[{h:"AI as your writing partner",body:"AI won't write a perfect blog post for you — but it's incredible at breaking through writer's block, creating outlines, and drafting sections you can refine.\n\nThink of AI as a fast-typing assistant who has read every blog on the internet. They know the formulas, but you bring the expertise and personality."},{h:"The outline-first method",body:"The most effective approach:\n\n1. Ask AI to create an outline for your topic\n2. Review and adjust the outline\n3. Ask AI to draft each section one at a time\n4. Edit each section in your voice\n5. Ask AI to write the intro and conclusion last\n\nThis gives you far better results than asking AI to write the entire post at once."},{h:"Making AI writing sound like YOU",body:"The secret: give AI examples of your writing style. Say \"Match this tone:\" and paste a paragraph you've written before.\n\nAlso: always add your own stories, opinions, and specific examples. AI provides structure, you provide soul."}],questions:["How do I make AI match my writing style?","Can AI write long-form content?","Should I edit AI writing?"],practice:[{type:"free_response",q:"Write a prompt asking AI to create an outline for a blog post about 'Why Everyone Should Learn Basic AI Skills in 2026.' Specify your target audience and the tone.",hint:"Be specific: who reads your blog? What tone do you use? How long should the post be? What key points should it cover?"}]},
    {title:"Social Media Writing with AI",sections:[{h:"Each platform has a voice",body:"LinkedIn = professional thought leadership\nTwitter/X = sharp, witty, concise\nInstagram = visual storytelling with captions\nFacebook = conversational and community-focused\n\nAI can match any of these voices — you just need to tell it which one."},{h:"The hook formula",body:"The first line is everything in social media. Tell AI:\n\n\"Write a LinkedIn post that starts with a surprising statistic or counterintuitive statement about [topic]. The hook should make someone stop scrolling.\"\n\nGreat hooks: surprising numbers, personal stories, bold opinions, and \"here's what nobody tells you\" angles."}],questions:["How do I get more engagement?","Can AI write hashtags?","How often should I post?"],practice:[{type:"free_response",q:"Write a prompt asking AI to create a LinkedIn post about a lesson you learned at work this week. Use the hook formula from the lesson.",hint:"Tell AI the platform (LinkedIn), your industry, the lesson learned, and ask for a scroll-stopping opening line."}]},
    {title:"AI for Reports and Documents",sections:[{h:"From messy notes to polished reports",body:"AI's superpower for reports: turning your brain dump into organized, professional writing.\n\nJust paste your rough notes and say: \"Turn these notes into a structured report with sections, an executive summary, and clear recommendations.\""},{h:"The revision workflow",body:"First draft → ask AI to make it more concise\nSecond pass → ask AI to strengthen the opening\nThird pass → ask AI to check for jargon and simplify\n\nEach pass improves the writing. You're directing AI like a writing coach, not just accepting the first output."}],questions:["How do I format a professional report?","Can AI help with technical writing?","What about citations?"],practice:[{type:"free_response",q:"You have these rough notes: 'Sales up 15%, marketing spend down, new product launched, customer complaints about shipping.' Write a prompt asking AI to turn these into a professional quarterly report summary.",hint:"Specify the audience (executives?), the format (executive summary?), and what conclusions you want highlighted."}]}
  ],
  images: [
    {title:"Creating AI Images",sections:[{h:"No design skills needed",body:"AI image tools let anyone create professional visuals by describing what they want. No drawing talent, no Photoshop experience, no design degree required."},{h:"The 4-part image prompt",body:"1. SUBJECT — What's in the image (a coffee shop, a mountain, a person working)\n2. STYLE — Photo, illustration, watercolor, 3D render\n3. MOOD — Warm, dramatic, playful, minimal\n4. DETAILS — Lighting (soft morning light), colors (earth tones), angle (overhead view)"}],questions:["Help me create a logo","Best free image tool?","Can AI create real photos?"],practice:[{type:"free_response",q:"Write an image prompt for a social media banner for a bakery called 'Sweet Sunrise'. Include all 4 parts.",hint:"SUBJECT (what's shown), STYLE (photo? illustration?), MOOD (warm? playful?), DETAILS (colors, lighting)."}]},
    {title:"AI Image Tools Compared",sections:[{h:"The main tools",body:"Midjourney — best artistic quality, runs through Discord\nDALL-E (ChatGPT) — easiest to use, built into ChatGPT\nAdobe Firefly — best for professional/commercial use, won't copy artists\nStable Diffusion — free, runs on your computer, most customizable\nCanva AI — best for non-designers who need quick marketing graphics"},{h:"Choosing the right one",body:"Need it fast and easy? → DALL-E through ChatGPT\nWant the best quality? → Midjourney\nUsing it commercially? → Adobe Firefly (safest for copyright)\nOn a budget? → Stable Diffusion or Canva's free tier\n\nFor most beginners, start with DALL-E — you might already have ChatGPT access."}],questions:["Which tool is free?","Is AI art copyrighted?","Can I use AI images for my business?"],practice:[{type:"multiple_choice",q:"Which AI image tool is safest for commercial/business use?",opts:["Midjourney","Stable Diffusion","Adobe Firefly","Any of them"],correct:2,explain:"Adobe Firefly was trained only on licensed content, making it the safest for commercial use without copyright concerns."}]},
    {title:"Advanced Prompting for Images",sections:[{h:"Style references",body:"Instead of generic descriptions, reference specific styles:\n\n\"in the style of a Pixar movie poster\"\n\"editorial photography for Vogue magazine\"\n\"flat vector illustration like Dropbox's website\"\n\"watercolor painting with visible brushstrokes\"\n\nThe more specific your style reference, the more predictable the result."},{h:"Negative prompts",body:"Tell AI what NOT to include:\n\n\"No text, no watermarks, no people\"\n\"Avoid dark colors, nothing scary\"\n\nThis is just as important as saying what you want. Without it, AI might add unwanted elements."}],questions:["How do I get consistent brand images?","Can AI edit existing photos?","What resolution do I get?"],practice:[{type:"free_response",q:"Write a detailed image prompt for a professional headshot background — something someone could use behind their photo on LinkedIn. Include style reference and negative prompts.",hint:"Specify the exact look, reference a style you've seen, and tell AI what to exclude."}]}
  ],
  business: [
    {title:"AI Tools That Save Hours",sections:[{h:"Start with what wastes time",body:"Don't try to AI-ify everything at once. Pick the ONE task that wastes the most time and automate that first. Common time-wasters: email, meeting notes, report writing, data entry, scheduling.\n\nAutomate one thing well → save 5-10 hours/week."},{h:"The 80/20 rule for AI",body:"80% of your AI productivity gains will come from 20% of the tools. For most businesses, that 20% is:\n\n1. Email drafting (saves 30 min/day)\n2. Meeting summaries (saves 15 min/meeting)\n3. Document creation (saves 1-2 hours/week)\n\nMaster these three before exploring anything else."}],questions:["What should I automate first?","Are these tools safe?","How much time saved?"],practice:[{type:"multiple_choice",q:"What's the best approach to start using AI in business?",opts:["AI-ify everything at once","Pick ONE time-wasting task and automate it first","Wait until AI is more mature","Only use AI for emails"],correct:1,explain:"Starting with one task lets you learn without overwhelm and see immediate savings."}]},
    {title:"AI for Customer Communication",sections:[{h:"Faster responses, better quality",body:"AI can draft customer emails, chat responses, and FAQ answers in seconds. The key is creating templates that AI fills in with context.\n\nExample: \"Using this customer complaint about [issue], draft a response that: 1) acknowledges their frustration, 2) explains what happened, 3) offers a specific solution, 4) ends warmly.\""},{h:"Building an AI response library",body:"Create a document with your 10 most common customer scenarios and the ideal response for each. Then when a new situation arises, tell AI: \"Based on our response style in these examples, draft a reply for this new situation.\"\n\nThis ensures consistency across your whole team."}],questions:["Can AI handle angry customers?","How do I maintain my brand voice?","Is AI replacing customer service?"],practice:[{type:"free_response",q:"A customer emails: 'I ordered 2 weeks ago and still haven't received my package. This is ridiculous.' Write a prompt asking AI to draft a response following the 4-step formula from the lesson.",hint:"1) Acknowledge frustration, 2) Explain what happened, 3) Offer a specific solution, 4) End warmly."}]},
    {title:"AI for Meetings and Notes",sections:[{h:"Never take notes manually again",body:"AI meeting tools like Otter.ai, Fireflies, and Fathom can join your calls, transcribe everything, and create summaries automatically.\n\nAfter the meeting, you get: key decisions, action items with owners, and a searchable transcript."},{h:"The post-meeting prompt",body:"Even without a transcription tool, you can paste rough notes into AI and ask:\n\n\"Turn these meeting notes into: 1) a 3-sentence summary, 2) a list of action items with who's responsible, 3) key decisions that were made, 4) open questions for next meeting.\"\n\nThis turns 20 minutes of note cleanup into 30 seconds."}],questions:["Best AI meeting tools?","Can AI join my Zoom calls?","What about privacy?"],practice:[{type:"free_response",q:"You just left a meeting with rough notes: 'discussed Q2 budget, Maria wants to increase marketing spend by 20%, John disagrees, decided to test with 10% first, review in May.' Write a prompt to turn these into professional meeting minutes.",hint:"Ask for a structured format: summary, decisions made, action items, and next steps."}]},
    {title:"Measuring AI's Impact on Your Business",sections:[{h:"Track your time savings",body:"Before using AI, estimate how long tasks take. After one month of AI usage, measure again. Most businesses see:\n\nEmail: 40-60% faster\nReports: 50-70% faster\nContent creation: 60-80% faster\nResearch: 30-50% faster\n\nTrack these numbers — they justify the cost of AI tools to your boss or yourself."},{h:"Calculating ROI",body:"Simple formula: Hours saved per week × your hourly rate = weekly value\n\nExample: 8 hours saved × $50/hour = $400/week saved = $20,800/year\n\nMost AI subscriptions cost $20-50/month. That's a 30x+ return on investment for even modest time savings."}],questions:["How do I prove AI's value to my boss?","What metrics should I track?","How long until I see results?"],practice:[{type:"free_response",q:"Calculate the potential ROI of AI tools for your work. Estimate: hours you could save per week, your approximate hourly rate, and the cost of the AI tool you'd use. Show your math.",hint:"Be realistic about time savings. Even 5 hours/week at a modest rate shows impressive ROI vs. a $20/month subscription."}]}
  ],
  data: [
    {title:"AI + Spreadsheets",sections:[{h:"No more formula headaches",body:"AI can write spreadsheet formulas for you. Just describe what you need:\n\n\"Write a Google Sheets formula that calculates the percentage change between column B and column C for each row.\"\n\nAI gives you the formula ready to paste. No more Googling VLOOKUP syntax."},{h:"Getting started",body:"You can use AI with spreadsheets in two ways:\n\n1. Copy-paste: Describe what you need to ChatGPT/Claude, get the formula, paste it in\n2. Built-in AI: Google Sheets and Excel both now have AI assistants built right in\n\nMethod 1 works today with any AI tool. Method 2 is getting better every month."}],questions:["AI with Google Sheets?","Can AI create charts?","What about complex formulas?"],practice:[{type:"free_response",q:"You have a spreadsheet with columns: Employee Name, Hours Worked, Hourly Rate. Write a prompt asking AI to create formulas for: total pay, overtime hours (over 40), and overtime pay (1.5x rate).",hint:"Be specific about which columns contain what, and describe exactly what each formula should calculate."}]},
    {title:"Analyzing Data with AI",sections:[{h:"Turn numbers into stories",body:"AI is remarkably good at looking at data and finding the story in it. Paste a table of numbers and ask:\n\n\"What trends do you see? What's unusual? What should I pay attention to?\"\n\nAI will spot patterns that might take you hours to find manually."},{h:"The data analysis prompt template",body:"\"Here is [type of data] from [time period]. Please:\n1. Identify the top 3 trends\n2. Flag anything unusual or concerning\n3. Compare to [benchmark/previous period]\n4. Suggest 2-3 actions based on the data\n5. Present findings as bullet points a non-technical person would understand\""}],questions:["Can AI read my Excel files?","How accurate is AI analysis?","What kind of data works best?"],practice:[{type:"free_response",q:"Monthly website visitors: Jan 1200, Feb 1100, Mar 1400, Apr 1800, May 2200, Jun 3100, Jul 2800. Write a prompt asking AI to analyze this data, identify trends, and suggest what might be causing the pattern.",hint:"Use the template from the lesson. Ask for trends, anomalies, and actionable suggestions."}]},
    {title:"AI for Data Cleaning",sections:[{h:"The boring work AI does best",body:"Data cleaning — fixing typos, standardizing formats, removing duplicates — is tedious but necessary. AI handles it instantly.\n\nPaste messy data and say: \"Clean this data: standardize the date format to MM/DD/YYYY, fix obvious typos in company names, and flag any duplicate entries.\""},{h:"Common cleaning tasks",body:"AI excels at:\n• Standardizing addresses (St → Street, Apt → Apartment)\n• Fixing inconsistent capitalization\n• Converting between date formats\n• Splitting full names into first/last columns\n• Removing extra spaces and special characters\n• Categorizing free-text responses into groups"}],questions:["Can AI handle large datasets?","What about sensitive data?","Best tools for data cleaning?"],practice:[{type:"free_response",q:"You have messy customer data: 'john smith, New york, NY' and 'JANE DOE, new york city, New York' and 'J. Smith, NYC, ny'. Write a prompt asking AI to standardize this into a clean, consistent format.",hint:"Specify the exact format you want: how names should be capitalized, how cities/states should be written."}]}
  ],
  daily: [
    {title:"AI in Everyday Life",sections:[{h:"AI is already around you",body:"Autocorrect, Netflix recommendations, Google Maps traffic, spam filters — all AI. You've been using AI for years without knowing it.\n\nNow you can actively direct AI to help with specific tasks, like having a personal assistant available 24/7 who works for free."},{h:"Quick wins for today",body:"Things you can try right now:\n\n• Ask AI to plan meals for the week based on what's in your fridge\n• Have AI explain a medical bill or insurance document in plain English\n• Ask AI to create a workout plan based on your goals and available equipment\n• Use AI to draft a complaint letter to a company\n• Ask AI to help you understand a school assignment or homework"}],questions:["Plan meals for my family","Help with a medical term","Best AI apps?"],practice:[{type:"free_response",q:"Think about one annoying task you do every week. Write a detailed prompt asking AI to help you with it. Be specific about what you need and what the output should look like.",hint:"The more specific you are, the better. Include context about your situation, constraints, and desired format."}]},
    {title:"AI for Health and Wellness",sections:[{h:"Your AI wellness assistant",body:"AI can't replace a doctor, but it's great for:\n\n• Explaining medical terms in plain English\n• Creating personalized meal plans based on dietary needs\n• Building exercise routines for your fitness level\n• Tracking habits and suggesting improvements\n• Translating doctor's instructions into actionable steps"},{h:"Important limitations",body:"NEVER use AI to:\n• Diagnose medical conditions\n• Replace prescribed medication advice\n• Make emergency health decisions\n\nAI is a research assistant, not a doctor. Always verify health information with a medical professional."}],questions:["Can AI create a meal plan?","Is AI health advice reliable?","Best health AI apps?"],practice:[{type:"free_response",q:"Write a prompt asking AI to create a simple 5-day meal plan. Include: your dietary preferences, any allergies, your cooking skill level, and how much time you have for cooking.",hint:"Be specific: vegetarian? Budget-friendly? Quick 30-minute meals? Family of 4? The more detail, the better the plan."}]},
    {title:"AI for Travel and Planning",sections:[{h:"Your personal travel agent",body:"AI is incredible at travel planning. It can create detailed itineraries, find hidden gems, estimate budgets, and even help you learn key phrases in the local language.\n\nThe key: be specific about your travel style. \"Plan a trip to Japan\" gets generic results. \"Plan a 7-day Japan trip for a couple who loves street food and hates tourist traps, budget $150/day\" gets amazing results."},{h:"The perfect trip prompt",body:"\"I'm traveling to [destination] for [duration]. My interests are [activities]. My budget is [amount] per day. I prefer [style: luxury/budget/mid-range]. I'm traveling with [who]. Please create a day-by-day itinerary including specific restaurant names, estimated costs, and travel tips locals would know.\""}],questions:["Can AI book flights?","How accurate are AI travel recommendations?","Help me plan a trip"],practice:[{type:"free_response",q:"Plan a long weekend trip using AI. Write a detailed prompt for a 3-day trip to a city you've always wanted to visit. Include all the details from the lesson's template.",hint:"Include destination, duration, interests, budget, travel style, who you're with, and what kind of recommendations you want."}]},
    {title:"AI for Learning and Personal Growth",sections:[{h:"AI as your personal tutor",body:"AI can explain any concept at exactly your level. The magic phrase: \"Explain this like I'm [your level].\"\n\n\"Explain quantum computing like I'm 10\" → simple analogy\n\"Explain quantum computing like I'm a CS student\" → technical detail\n\"Explain quantum computing like I'm a CEO\" → business implications"},{h:"Building a learning habit",body:"Use AI to:\n\n1. Create a study plan for any topic\n2. Quiz you on what you've learned\n3. Explain concepts you don't understand\n4. Summarize long articles or books\n5. Connect new concepts to things you already know\n\nAI makes self-education faster than any other time in history. The only limit is your curiosity."}],questions:["Can AI help me learn a language?","How do I study with AI?","Best learning prompts?"],practice:[{type:"free_response",q:"Pick something you've always wanted to learn. Write a prompt asking AI to create a 2-week learning plan for you, starting from absolute beginner. Be specific about your schedule and learning style.",hint:"Include: the topic, your current knowledge, how much time you can dedicate daily, and whether you prefer reading, watching, or doing."}]}
  ],
};

// DAILY CHALLENGES
const DAILY_CHALLENGES = [
  {id:"dc1",title:"Write a Better Prompt",desc:"Improve this vague prompt into a specific one",task:"The prompt 'Write me something about dogs' is too vague. Rewrite it to get a much better result from AI. Be specific about what kind of content, for what audience, and in what format.",category:"prompts"},
  {id:"dc2",title:"Simplify AI Jargon",desc:"Explain an AI term in everyday words",task:"Explain what 'machine learning' means as if you're telling a friend who's never heard of it. Use an everyday analogy.",category:"basics"},
  {id:"dc3",title:"AI for Your Morning",desc:"Find 3 ways AI could help your morning routine",task:"Think about your typical morning. Describe 3 specific ways AI tools could save you time or make things easier. Be practical — things you could actually try tomorrow.",category:"daily"},
  {id:"dc4",title:"Craft an Image Prompt",desc:"Describe an image for AI to create",task:"Write a detailed prompt for an AI image generator to create a professional-looking cover photo for a LinkedIn profile of someone who works in [your industry]. Include style, mood, colors, and composition.",category:"images"},
  {id:"dc5",title:"Email Challenge",desc:"Draft a tricky email with AI",task:"Use the 3-part prompt formula (Role, Context, Tone) to write a prompt that would help AI draft an email declining a meeting invitation politely while suggesting an alternative time.",category:"writing"},
  {id:"dc6",title:"Data Detective",desc:"Ask AI to analyze information",task:"You have monthly sales numbers: Jan: $12K, Feb: $15K, Mar: $11K, Apr: $18K, May: $22K, Jun: $19K. Write a prompt asking AI to identify the trend and suggest what might explain the pattern.",category:"data"},
  {id:"dc7",title:"AI News Reporter",desc:"Summarize today's top AI story",task:"Find or think of a recent AI development you've heard about. Write a 3-sentence summary that anyone — even your grandmother — could understand. No jargon allowed!",category:"news"},
];

// ACHIEVEMENTS
const ACHIEVEMENTS = [
  {id:"first_lesson",name:"First Steps",desc:"Complete your first lesson",icon:"👣",condition:(p)=>p.length>=1},
  {id:"streak_3",name:"Consistent Climber",desc:"Reach a 3-day streak",icon:"🔥",condition:(p,prof)=>(prof?.current_streak||0)>=3},
  {id:"streak_7",name:"Week Warrior",desc:"Reach a 7-day streak",icon:"⚡",condition:(p,prof)=>(prof?.current_streak||0)>=7},
  {id:"five_lessons",name:"Trailblazer",desc:"Complete 5 lessons",icon:"🥾",condition:(p)=>p.length>=5},
  {id:"first_chat",name:"Asked Lumi",desc:"Have your first tutor chat",icon:"💬",condition:(p,prof)=>(prof?.total_tutor_sessions||0)>=1},
  {id:"all_paths",name:"Explorer",desc:"Try lessons from 3 different paths",icon:"🗺️",condition:(p)=>[...new Set(p.map(x=>x.path_id))].length>=3},
  {id:"ten_lessons",name:"Mountaineer",desc:"Complete 10 lessons",icon:"⛰️",condition:(p)=>p.length>=10},
  {id:"summit",name:"Summit Reached",desc:"Complete all learning paths",icon:"🏆",condition:(p)=>[...new Set(p.map(x=>x.path_id))].length>=6},
];

// Custom SVG Icons — AI Fluent branded
const Icon = ({type,size=24,color="#D4A55A"}) => {
  const s=size;const p={width:s,height:s,display:"inline-block",verticalAlign:"middle"};
  const icons={
    email:<svg style={p} viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.5"/><path d="M2 8l8.5 5.5a3 3 0 003 0L22 8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="18" cy="8" r="2.5" fill={color} opacity=".2"/></svg>,
    prompt:<svg style={p} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5"/><path d="M8 10l3 2-3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="13" y1="14" x2="17" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="18" cy="6" r="1.5" fill={color} opacity=".3"/></svg>,
    summarize:<svg style={p} viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke={color} strokeWidth="1.5"/><path d="M4 4l4-2h8l4 2" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><line x1="8" y1="9" x2="16" y2="9" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><line x1="8" y1="12" x2="14" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><line x1="8" y1="15" x2="12" y2="15" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><circle cx="17" cy="17" r="3" fill={color} opacity=".15" stroke={color} strokeWidth="1"/></svg>,
    resume:<svg style={p} viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="1.5"/><circle cx="12" cy="8" r="2.5" stroke={color} strokeWidth="1.2"/><path d="M8 14h8M9 17h6" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><rect x="14" y="2" width="5" height="5" rx="1" fill={color} opacity=".15"/></svg>,
    social:<svg style={p} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="2" stroke={color} strokeWidth="1.2"/><path d="M3 17l4-4a2 2 0 012.8 0l2.4 2.4a2 2 0 002.8 0L21 10" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><circle cx="17" cy="7" r="1.5" fill={color} opacity=".3"/></svg>,
    study:<svg style={p} viewBox="0 0 24 24" fill="none"><path d="M2 6l10-4 10 4-10 4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 8v6c0 2 2.7 4 6 4s6-2 6-4V8" stroke={color} strokeWidth="1.5"/><line x1="22" y1="6" x2="22" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="22" cy="14" r="1.5" fill={color} opacity=".3"/></svg>,
    news:<svg style={p} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.5"/><rect x="5" y="6" width="8" height="5" rx="1" fill={color} opacity=".15" stroke={color} strokeWidth=".8"/><line x1="15" y1="7" x2="19" y2="7" stroke={color} strokeWidth="1" strokeLinecap="round"/><line x1="15" y1="9.5" x2="19" y2="9.5" stroke={color} strokeWidth="1" strokeLinecap="round"/><line x1="5" y1="14" x2="19" y2="14" stroke={color} strokeWidth="1" strokeLinecap="round"/><line x1="5" y1="17" x2="15" y2="17" stroke={color} strokeWidth="1" strokeLinecap="round"/></svg>,
    challenge:<svg style={p} viewBox="0 0 24 24" fill="none"><polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} opacity=".1"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.2"/><path d="M12 9v-2M12 17v-2M9 12H7M17 12h-2" stroke={color} strokeWidth="1" strokeLinecap="round"/></svg>,
    tools:<svg style={p} viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94L14.7 6.3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  };
  return icons[type]||null;
};

const TOOLS = [
  {id:"email",iconType:"email",name:"Write an Email",desc:"Professional emails in seconds",color:C.teal,steps:[{q:"What kind?",opts:["Work / Professional","Personal","Complaint","Thank You"]},{q:"Who to?",opts:["My boss","A client","A coworker","A company"]},{q:"Tone?",opts:["Formal","Warm","Direct","Apologetic"]},{q:"About what?",free:true,ph:"e.g. Requesting time off..."}],sys:"You are an expert email writer. Write a concise professional email. Subject line then body only."},
  {id:"prompt",iconType:"prompt",name:"Build a Prompt",desc:"Master the art of talking to AI",color:C.gold,steps:[{q:"Help with?",opts:["Writing","Analyzing","Creative ideas","Problem solving"]},{q:"Detail level?",opts:["Quick","Medium","Thorough","Step-by-step"]},{q:"Describe task:",free:true,ph:"e.g. Plan a marketing campaign..."}],sys:"You are an AI prompt expert. Generate a prompt they can copy. Explain why each part works."},
  {id:"summarize",iconType:"summarize",name:"Summarize Text",desc:"Long docs into key points",color:C.blue,steps:[{q:"Content type?",opts:["Article","Report","Email chain","Contract"]},{q:"What do you need?",opts:["Key takeaways","Action items","Simple explanation","Pros and cons"]},{q:"Paste text:",free:true,ph:"Paste or describe content..."}],sys:"Create a clear concise summary in simple language."},
  {id:"resume",iconType:"resume",name:"Resume Helper",desc:"Stand out from the crowd",color:C.purple,steps:[{q:"What do you need?",opts:["Write a summary","Improve bullet points","Tailor for a job posting","Write a cover letter"]},{q:"Your field?",opts:["Tech / IT","Business / Finance","Healthcare","Education","Creative","Other"]},{q:"Details:",free:true,ph:"Paste your current text or describe what you need..."}],sys:"You are an expert resume writer and career coach. Help improve their resume content. Be specific, use action verbs, quantify achievements where possible."},
  {id:"social",iconType:"social",name:"Social Post Writer",desc:"Scroll-stopping content",color:C.coral,steps:[{q:"Platform?",opts:["LinkedIn","Twitter/X","Instagram","Facebook"]},{q:"Goal?",opts:["Share expertise","Promote something","Tell a story","Ask for engagement"]},{q:"Topic:",free:true,ph:"e.g. I just learned how to use AI for..."}],sys:"You are a social media expert. Write an engaging post for the specified platform. Match the platform's tone and best practices. Include relevant hashtag suggestions."},
  {id:"study",iconType:"study",name:"Study Helper",desc:"Learn anything faster",color:C.green,steps:[{q:"What are you studying?",opts:["A concept I don't understand","Preparing for a test","Researching a topic","Learning a new skill"]},{q:"How should I help?",opts:["Explain it simply","Create flashcards","Quiz me","Give me a study plan"]},{q:"The topic:",free:true,ph:"e.g. How does blockchain work..."}],sys:"You are a patient, encouraging tutor. Explain concepts at the appropriate level. Use analogies and examples. If creating flashcards, format them clearly."},
];

// Sound effects system using Web Audio API
const SFX = {
  _ctx: null,
  _getCtx() { if(!this._ctx) this._ctx = new (window.AudioContext||window.webkitAudioContext)(); return this._ctx; },
  play(type) {
    try {
      const ctx=this._getCtx(); const now=ctx.currentTime;
      if(type==="correct") {
        // Bright ascending chime
        [523.25, 659.25, 783.99].forEach((f,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0.15,now+i*0.08);g.gain.exponentialRampToValueAtTime(0.001,now+i*0.08+0.3);o.connect(g);g.connect(ctx.destination);o.start(now+i*0.08);o.stop(now+i*0.08+0.3)});
      } else if(type==="wrong") {
        // Soft low tone
        const o=ctx.createOscillator();const g=ctx.createGain();o.type="sine";o.frequency.value=220;g.gain.setValueAtTime(0.1,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.4);o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.4);
      } else if(type==="triumph") {
        // Victory fanfare - ascending major chord
        [523.25, 659.25, 783.99, 1046.5].forEach((f,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(0.12,now+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,now+i*0.12+0.5);o.connect(g);g.connect(ctx.destination);o.start(now+i*0.12);o.stop(now+i*0.12+0.5)});
      } else if(type==="sparkle") {
        // Magical sparkle for achievements
        [1200, 1400, 1600, 1800, 2000].forEach((f,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0.06,now+i*0.06);g.gain.exponentialRampToValueAtTime(0.001,now+i*0.06+0.2);o.connect(g);g.connect(ctx.destination);o.start(now+i*0.06);o.stop(now+i*0.06+0.2)});
      } else if(type==="click") {
        // Subtle tap
        const o=ctx.createOscillator();const g=ctx.createGain();o.type="sine";o.frequency.value=800;g.gain.setValueAtTime(0.05,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.05);o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.05);
      } else if(type==="fail") {
        // Descending tone — not harsh, just "not quite"
        [400, 350, 300].forEach((f,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0.08,now+i*0.1);g.gain.exponentialRampToValueAtTime(0.001,now+i*0.1+0.25);o.connect(g);g.connect(ctx.destination);o.start(now+i*0.1);o.stop(now+i*0.1+0.25)});
      }
    } catch(e) { /* Audio not available */ }
  }
};

// Lumi Reaction component for results screen
const LumiReaction = ({rating,size=100}) => {
  const s=size;
  const config={
    summit:{eyes:"★ ★",mouth:"▽",color:"#FFD700",msg:"INCREDIBLE! You absolutely crushed it!",anim:"celebrate"},
    ridge:{eyes:"◠ ◠",mouth:"▽",color:C.green,msg:"Really solid work! You've got this!",anim:"lumiFloat"},
    treeline:{eyes:"◠ ◠",mouth:"‿",color:"#E8B84B",msg:"Getting there! One more try?",anim:"lumiFloat"},
    base:{eyes:"• •",mouth:"○",color:C.red,msg:"Let's review together and try again!",anim:"lumiFloat"},
  };
  const c=config[rating]||config.base;
  return(
    <div style={{textAlign:"center",marginBottom:16}}>
      <div style={{display:"inline-block",animation:`${c.anim} ${c.anim==="celebrate"?"0.6s ease infinite":"3s ease-in-out infinite"}`}}>
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
          <defs>
            <radialGradient id="lrGlow" cx="50%" cy="45%" r="50%"><stop offset="0%" stopColor="#FFF8E8" stopOpacity=".3"/><stop offset="100%" stopColor={c.color} stopOpacity="0"/></radialGradient>
            <radialGradient id="lrBody" cx="50%" cy="40%" r="45%"><stop offset="0%" stopColor="#FFFDF5"/><stop offset="40%" stopColor="#FFE8C0"/><stop offset="100%" stopColor="#D4A55A"/></radialGradient>
          </defs>
          {/* Outer glow */}
          <circle cx="50" cy="50" r="48" fill="url(#lrGlow)"/>
          {/* Body */}
          <circle cx="50" cy="50" r="35" fill="url(#lrBody)" stroke="#D4A55A" strokeWidth="0.8"/>
          {/* Cheeks - bigger when happy */}
          {(rating==="summit"||rating==="ridge")&&<><circle cx="32" cy="56" r="6" fill="#FFB366" opacity=".2"/><circle cx="68" cy="56" r="6" fill="#FFB366" opacity=".2"/></>}
          {/* Eyes */}
          <text x="50" y="48" textAnchor="middle" fontSize={rating==="summit"?"16":"14"} fill="#5D4E37" fontFamily="sans-serif" fontWeight="700">{c.eyes}</text>
          {/* Mouth */}
          {rating==="summit"?<path d="M38 56 Q50 68 62 56" fill="none" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round"/>
          :rating==="ridge"?<path d="M40 57 Q50 64 60 57" fill="none" stroke="#5D4E37" strokeWidth="1.5" strokeLinecap="round"/>
          :rating==="treeline"?<path d="M42 58 Q50 62 58 58" fill="none" stroke="#5D4E37" strokeWidth="1.5" strokeLinecap="round"/>
          :<circle cx="50" cy="60" r="3" fill="none" stroke="#5D4E37" strokeWidth="1.5"/>}
          {/* Summit sparkles */}
          {rating==="summit"&&<>
            <path d="M50 5 L52 12 L58 14 L52 16 L50 23 L48 16 L42 14 L48 12 Z" fill="#FFE8C0" opacity=".9"/>
            <path d="M20 25 L22 29 L26 30 L22 31 L20 35 L18 31 L14 30 L18 29 Z" fill="#FFE8C0" opacity=".6"/>
            <path d="M80 25 L82 29 L86 30 L82 31 L80 35 L78 31 L74 30 L78 29 Z" fill="#FFE8C0" opacity=".6"/>
            <path d="M30 75 L31 78 L34 79 L31 80 L30 83 L29 80 L26 79 L29 78 Z" fill="#FFE8C0" opacity=".5"/>
            <path d="M70 75 L71 78 L74 79 L71 80 L70 83 L69 80 L66 79 L69 78 Z" fill="#FFE8C0" opacity=".5"/>
          </>}
          {/* Ridge - small sparkle */}
          {rating==="ridge"&&<path d="M50 8 L51 13 L56 14 L51 15 L50 20 L49 15 L44 14 L49 13 Z" fill="#FFE8C0" opacity=".7"/>}
          {/* Treeline - thinking lines */}
          {rating==="treeline"&&<><line x1="72" y1="38" x2="78" y2="35" stroke="#D4A55A" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/><line x1="74" y1="43" x2="80" y2="42" stroke="#D4A55A" strokeWidth="1.5" strokeLinecap="round" opacity=".3"/></>}
          {/* Base - sweat drop */}
          {rating==="base"&&<path d="M72 35 Q74 30 76 35 Q74 38 72 35" fill="#8AA0B8" opacity=".4"/>}
        </svg>
      </div>
      <p style={{color:c.color,fontSize:15,fontWeight:700,fontFamily:C.font,margin:"8px 0 0"}}>{c.msg}</p>
    </div>
  );
};

// Markdown-lite renderer for AI responses
const Md = ({text=""}) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\n)/g).filter(Boolean);
  return <>{parts.map((p,i) => {
    if(p==="\n") return <br key={i}/>;
    if(p.startsWith("**")&&p.endsWith("**")) return <strong key={i} style={{color:C.goldLight,fontWeight:700}}>{p.slice(2,-2)}</strong>;
    if(p.startsWith("*")&&p.endsWith("*")) return <em key={i} style={{color:C.textMuted}}>{p.slice(1,-1)}</em>;
    if(p.startsWith("`")&&p.endsWith("`")) return <code key={i} style={{background:"rgba(212,165,90,.1)",padding:"1px 6px",borderRadius:4,fontSize:13,fontFamily:"monospace",color:C.goldLight}}>{p.slice(1,-1)}</code>;
    return <span key={i}>{p}</span>;
  })}</>;
};

// Page transition wrapper
const PageWrap = ({children,k}) => <div key={k} style={{animation:"fadeUp .35s ease both"}}>{children}</div>;

// Skeleton loading placeholder
const Skeleton = ({lines=3,style:sx={}}) => (
  <div style={{padding:16,...sx}}>
    {Array.from({length:lines},(_,i)=><div key={i} style={{height:14,background:"rgba(255,255,255,.04)",borderRadius:8,marginBottom:10,width:`${85-i*15}%`,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
  </div>
);

// Error message component
const ErrorMsg = ({msg,onRetry}) => (
  <div className="fu" style={{background:"rgba(200,120,88,.08)",border:"1px solid rgba(200,120,88,.15)",borderRadius:14,padding:16,textAlign:"center",margin:"12px 0"}}>
    <Lumi size={36} mood="thinking"/>
    <p style={{color:"#E8A878",fontSize:14,fontWeight:600,fontFamily:C.font,margin:"8px 0 4px"}}>Oops, something went wrong</p>
    <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,margin:"0 0 10px"}}>{msg||"Check your connection and try again."}</p>
    {onRetry&&<Btn v="ghost" onClick={onRetry} style={{width:"auto",padding:"8px 20px",fontSize:13}}>{T.tryAgain}</Btn>}
  </div>
);

// STREAK SYSTEM — tracks daily activity, streak freeze, calendar
const Streak = {
  _key: "ai_fluent_streak",
  _get() { try { return JSON.parse(localStorage.getItem(this._key) || "{}") } catch { return {} } },
  _set(data) { localStorage.setItem(this._key, JSON.stringify(data)) },

  check() {
    const d = this._get();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (d.lastActive === today) return d; // Already active today

    if (d.lastActive === yesterday) {
      // Streak continues
      return { ...d, current: (d.current || 0), todayDone: false };
    } else if (d.lastActive && d.lastActive !== today) {
      // Streak broken — check for freeze
      if (d.freezes > 0) {
        const nd = { ...d, freezes: d.freezes - 1, freezeUsedOn: d.lastActive, todayDone: false };
        this._set(nd);
        return nd;
      }
      // Streak lost
      return { ...d, current: 0, todayDone: false };
    }
    return { current: 0, best: d.best || 0, freezes: d.freezes || 1, history: d.history || [], todayDone: false };
  },

  recordActivity() {
    const d = this._get();
    const today = new Date().toISOString().slice(0, 10);
    if (d.lastActive === today) return d; // Already recorded today

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let current = d.lastActive === yesterday ? (d.current || 0) + 1 : d.lastActive === today ? (d.current || 1) : 1;
    // If freeze was used, continue streak
    if (d.freezeUsedOn && d.lastActive !== yesterday && d.lastActive !== today) current = (d.current || 0) + 1;

    const best = Math.max(current, d.best || 0);
    const history = [...(d.history || []), today].slice(-60); // Keep last 60 days
    const nd = { ...d, current, best, lastActive: today, history, todayDone: true, freezeUsedOn: null };
    this._set(nd);
    return nd;
  },

  getCalendar() {
    const d = this._get();
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      days.push({ date: key, active: (d.history || []).includes(key), isToday: i === 0, day: date.getDate(), dow: ["S","M","T","W","T","F","S"][date.getDay()] });
    }
    return days;
  },

  getData() { return this._get() },
  addFreeze() { const d = this._get(); d.freezes = Math.min((d.freezes || 0) + 1, 3); this._set(d); return d },
};

// PROGRESS CELEBRATIONS — milestone screens
const MilestoneCheck = ({progress, onDismiss}) => {
  const milestones = [
    { at: 1, title: "First Lesson!", msg: "You've taken your first step up the mountain. The journey of a thousand miles begins with a single step.", icon: "👣", color: C.green },
    { at: 3, title: "Getting Warmed Up!", msg: "3 lessons done! You're building real momentum. Most people never get this far.", icon: "🔥", color: C.gold },
    { at: 5, title: "Trailblazer!", msg: "5 lessons complete! You officially know more about AI than most people. Keep climbing!", icon: "🥾", color: C.teal },
    { at: 10, title: "Mountaineer!", msg: "Double digits! 10 lessons shows serious commitment. You're becoming AI fluent.", icon: "⛰️", color: C.blue },
    { at: 15, title: "Almost There!", msg: "15 lessons! You can see the summit from here. The air is getting thin but you're strong.", icon: "🌟", color: C.purple },
    { at: 20, title: "AI Master!", msg: "20 lessons! You've reached near-mastery. You understand AI better than 99% of people.", icon: "🏔️", color: "#FFD700" },
  ];

  const [show, setShow] = useState(() => {
    const seen = JSON.parse(localStorage.getItem("ai_fluent_milestones") || "[]");
    const hit = milestones.find(m => progress.length >= m.at && !seen.includes(m.at));
    return hit || null;
  });

  if (!show) return null;

  const dismiss = () => {
    const seen = JSON.parse(localStorage.getItem("ai_fluent_milestones") || "[]");
    localStorage.setItem("ai_fluent_milestones", JSON.stringify([...seen, show.at]));
    setShow(null);
    if(onDismiss) onDismiss();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(6,13,26,.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 30 }} onClick={dismiss}>
      <Confetti />
      <div className="fu" style={{ textAlign: "center", maxWidth: 320 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: "celebrate 0.6s ease infinite" }}>{show.icon}</div>
        <h2 style={{ color: show.color, fontSize: 28, fontFamily: C.fontDisplay, fontWeight: 800, margin: "0 0 8px" }}>{show.title}</h2>
        <p style={{ color: C.textMuted, fontSize: 15, fontFamily: C.font, lineHeight: 1.7, margin: "0 0 8px" }}>{show.msg}</p>
        <p style={{ color: C.textDim, fontSize: 12, fontFamily: C.font, margin: "0 0 24px" }}>{progress.length} lessons completed</p>
        <Btn v="gold" onClick={dismiss}>Keep Climbing →</Btn>
      </div>
    </div>
  );
};

// STREAK CALENDAR widget for profile
const StreakCalendar = () => {
  const cal = Streak.getCalendar();
  const data = Streak.getData();
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ color: C.text, fontSize: 14, fontWeight: 700, fontFamily: C.font, margin: 0 }}>{T.calendar}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ color: C.gold, fontSize: 14, fontWeight: 800, fontFamily: C.font }}>{data.current || 0} {T.dayStreak}</span>
        </div>
      </div>
      {data.best > 0 && <p style={{ color: C.textDim, fontSize: 11, fontFamily: C.font, margin: "0 0 10px" }}>Best streak: {data.best} days · Freezes: {data.freezes || 0} remaining</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} style={{ textAlign: "center", color: C.textDim, fontSize: 9, fontFamily: C.font, fontWeight: 600, marginBottom: 2 }}>{d}</div>)}
        {cal.map((d, i) => (
          <div key={i} style={{
            width: "100%", aspectRatio: "1", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            background: d.active ? "rgba(74,186,120,.2)" : d.isToday ? "rgba(212,165,90,.1)" : "rgba(255,255,255,.02)",
            border: d.isToday ? `1.5px solid ${C.gold}` : d.active ? "1px solid rgba(74,186,120,.3)" : "1px solid rgba(255,255,255,.03)",
          }}>
            <span style={{ color: d.active ? C.green : d.isToday ? C.gold : C.textDim, fontSize: 10, fontWeight: d.isToday ? 800 : 500, fontFamily: C.font }}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// SHARE CARD — generates a canvas-based progress image for social media
const ShareCard = ({type="progress",data={},onClose}) => {
  const canvasRef=useRef(null);
  const [ready,setReady]=useState(false);
  const [shared,setShared]=useState(false);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const w=1080,h=1080; // Square for Instagram
    canvas.width=w;canvas.height=h;

    // Background gradient
    const bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,"#0B1A2E");bg.addColorStop(0.4,"#132D4A");bg.addColorStop(0.7,"#1E5040");bg.addColorStop(1,"#1E4A35");
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);

    // Mountain silhouette
    ctx.fillStyle="rgba(15,30,48,.6)";
    ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(200,350);ctx.lineTo(350,500);ctx.lineTo(540,200);ctx.lineTo(700,450);ctx.lineTo(880,150);ctx.lineTo(w,400);ctx.lineTo(w,h);ctx.fill();

    // Snow caps
    ctx.fillStyle="rgba(200,220,240,.12)";
    ctx.beginPath();ctx.moveTo(500,240);ctx.lineTo(540,200);ctx.lineTo(580,240);ctx.fill();
    ctx.beginPath();ctx.moveTo(840,190);ctx.lineTo(880,150);ctx.lineTo(920,190);ctx.fill();

    // Stars
    for(let i=0;i<80;i++){
      ctx.fillStyle=`rgba(255,255,255,${.1+Math.random()*.3})`;
      ctx.beginPath();ctx.arc(Math.random()*w,Math.random()*h*.5,Math.random()*1.5+.5,0,Math.PI*2);ctx.fill();
    }

    // Lumi circle (golden orb)
    const cx=w/2,lumiY=type==="altitude"?240:200;
    const lumiGrad=ctx.createRadialGradient(cx,lumiY,10,cx,lumiY,70);
    lumiGrad.addColorStop(0,"#FFFDF5");lumiGrad.addColorStop(0.4,"#FFE8C0");lumiGrad.addColorStop(1,"#D4A55A");
    ctx.fillStyle=lumiGrad;ctx.beginPath();ctx.arc(cx,lumiY,55,0,Math.PI*2);ctx.fill();
    // Lumi glow
    ctx.fillStyle="rgba(255,248,232,.15)";ctx.beginPath();ctx.arc(cx,lumiY,80,0,Math.PI*2);ctx.fill();
    // Lumi eyes
    ctx.fillStyle="#5D4E37";ctx.beginPath();ctx.arc(cx-15,lumiY-5,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+15,lumiY-5,5,0,Math.PI*2);ctx.fill();
    // Lumi smile
    ctx.strokeStyle="#5D4E37";ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,lumiY+5,15,0.1*Math.PI,0.9*Math.PI);ctx.stroke();

    // Content based on type
    ctx.textAlign="center";

    if(type==="altitude"){
      // Altitude rating card
      const alt=data.altitude||"Ridge";const pct=data.pct||75;const lesson=data.lesson||"";
      const altColors={Summit:"#FFD700",Ridge:"#4ABA78",Treeline:"#E8B84B","Base Camp":"#C87858"};
      const altIcons={Summit:"🏔️",Ridge:"⛰️",Treeline:"◈","Base Camp":"△"};

      ctx.font="bold 28px 'Nunito',sans-serif";ctx.fillStyle="rgba(212,165,90,.6)";ctx.fillText("I EARNED",cx,340);
      ctx.font="bold 72px 'Quicksand',sans-serif";ctx.fillStyle=altColors[alt]||"#D4A55A";ctx.fillText(`${alt.toUpperCase()} RATING`,cx,420);
      ctx.font="bold 120px 'Quicksand',sans-serif";ctx.fillStyle="#E8EEF4";ctx.fillText(`${pct}%`,cx,560);
      if(lesson){ctx.font="500 24px 'Nunito',sans-serif";ctx.fillStyle="rgba(138,160,184,.7)";ctx.fillText(lesson,cx,610)}
    } else {
      // Progress card
      const lessons=data.lessons||0;const paths=data.paths||0;const streakVal=data.streak||0;const lvl=data.level||1;

      ctx.font="bold 28px 'Nunito',sans-serif";ctx.fillStyle="rgba(212,165,90,.6)";ctx.fillText("MY AI FLUENT JOURNEY",cx,320);
      ctx.font="bold 96px 'Quicksand',sans-serif";ctx.fillStyle="#E8EEF4";ctx.fillText(`Level ${lvl}`,cx,440);

      // Stats row
      const stats=[{v:lessons,l:"Lessons"},{v:paths,l:"Paths"},{v:streakVal,l:T.dayStreak}];
      const sw=240;const startX=cx-((stats.length-1)*sw)/2;
      stats.forEach((s,i)=>{
        const sx=startX+i*sw;
        ctx.font="bold 56px 'Quicksand',sans-serif";ctx.fillStyle="#D4A55A";ctx.fillText(String(s.v),sx,550);
        ctx.font="500 22px 'Nunito',sans-serif";ctx.fillStyle="rgba(138,160,184,.6)";ctx.fillText(s.l,sx,585);
      });
    }

    // Divider line
    ctx.strokeStyle="rgba(212,165,90,.2)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(w*.2,h-250);ctx.lineTo(w*.8,h-250);ctx.stroke();

    // Branding
    ctx.font="bold 40px 'Quicksand',sans-serif";ctx.fillStyle="#D4A55A";ctx.fillText("AI Fluent",cx,h-170);
    ctx.font="500 22px 'Nunito',sans-serif";ctx.fillStyle="rgba(138,160,184,.5)";ctx.fillText("Your climb to AI fluency",cx,h-130);

    // CTA
    ctx.font="bold 20px 'Nunito',sans-serif";ctx.fillStyle="rgba(212,165,90,.4)";ctx.fillText("Try it free → aifluent.app",cx,h-70);

    setReady(true);
  },[type,data]);

  const download=()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const link=document.createElement("a");
    link.download=`ai-fluent-${type}-${Date.now()}.png`;
    link.href=canvas.toDataURL("image/png");
    link.click();
  };

  const share=async()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    try{
      const blob=await new Promise(r=>canvas.toBlob(r,"image/png"));
      if(navigator.share&&navigator.canShare?.({files:[new File([blob],"ai-fluent.png",{type:"image/png"})]})){
        await navigator.share({title:"My AI Fluent Progress",text:type==="altitude"?`I earned ${data.altitude} Rating (${data.pct}%) on AI Fluent!`:`I'm Level ${data.level} on AI Fluent with ${data.lessons} lessons completed!`,files:[new File([blob],"ai-fluent.png",{type:"image/png"})]});
        setShared(true);
      } else { download() }
    } catch(e){ download() }
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(6,13,26,.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:C.textMuted,fontSize:24,zIndex:10}}>✕</button>
      <canvas ref={canvasRef} style={{width:"100%",maxWidth:340,borderRadius:16,boxShadow:"0 8px 40px rgba(0,0,0,.4)"}}/>
      <div style={{display:"flex",gap:10,marginTop:20,width:"100%",maxWidth:340}}>
        <Btn v="gold" onClick={share}>{shared?"Shared!":"Share →"}</Btn>
        <Btn v="ghost" onClick={download} style={{width:"auto",padding:"13px 20px"}}>💾</Btn>
      </div>
      <p style={{color:C.textDim,fontSize:11,fontFamily:C.font,marginTop:12}}>
        {navigator.share?"Tap Share to post directly":"Image will download to your device"}
      </p>
    </div>
  );
};

// CSS
const getCss = () => `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Quicksand:wght@500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{background:${C.bgDark};direction:${isRTL()?'rtl':'ltr'};overflow:hidden;transition:background .3s}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.mode==="dark"?"#2A4060":"#C0D0E0"};border-radius:2px}
  input::placeholder,textarea::placeholder{color:${C.textDim}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}
  @keyframes lumiFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:.8}}
  @keyframes pop{0%{transform:scale(.92);opacity:0}100%{transform:scale(1);opacity:1}}
  @keyframes confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-80px) rotate(360deg);opacity:0}}
  @keyframes celebrate{0%,100%{transform:scale(1) rotate(0deg)}25%{transform:scale(1.1) rotate(-5deg)}50%{transform:scale(1.15) rotate(0deg)}75%{transform:scale(1.1) rotate(5deg)}}
  @keyframes pulse{0%,100%{opacity:.04}50%{opacity:.08}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  .fu{animation:fadeUp .4s ease both}.fi{animation:fadeIn .3s ease both}.pop{animation:pop .3s ease both}
  .s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}.s4{animation-delay:.2s}.s5{animation-delay:.25s}
  button{transition:all .15s ease;cursor:pointer}button:active{transform:scale(.97)}
  @media(max-width:420px){html{font-size:14px}}
`;

// Theme toggle button
const ThemeToggle = ({onToggle}) => (
  <button onClick={onToggle} style={{width:34,height:34,borderRadius:12,background:C.mode==="dark"?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
    {C.mode==="dark"?"☀️":"🌙"}
  </button>
);

const Btn = ({children,onClick,v="gold",disabled,style:sx={}}) => {
  const st={gold:{background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(212,165,90,.3)"},ghost:{background:C.mode==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",color:C.text,border:`1px solid ${C.border}`},teal:{background:`linear-gradient(135deg,${C.teal},#2A8888)`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(58,168,160,.25)"},green:{background:`linear-gradient(135deg,${C.green},${C.greenDark})`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(74,186,120,.25)"},red:{background:`linear-gradient(135deg,${C.red},#A83838)`,color:"#fff",border:"none"}};
  return <button disabled={disabled} onClick={onClick} style={{padding:"13px 24px",borderRadius:14,fontSize:15,fontWeight:700,fontFamily:C.font,opacity:disabled?.5:1,width:"100%",...st[v],...sx}}>{children}</button>;
};
const Dots = () => {const[f,sF]=useState(0);useEffect(()=>{const i=setInterval(()=>sF(n=>(n+1)%4),400);return()=>clearInterval(i)},[]);return<div style={{display:"flex",gap:5,padding:"10px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.gold,opacity:f>i?.8:.2,transition:"opacity .3s"}}/>)}</div>};
const Bub = ({from,text,typing}) => <div className="fu" style={{display:"flex",justifyContent:from==="user"?"flex-end":"flex-start",gap:8,marginBottom:12}}>{from==="lumi"&&!typing&&<div style={{marginTop:4,flexShrink:0}}><Lumi size={26}/></div>}<div style={{maxWidth:"82%",padding:"11px 15px",borderRadius:from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:from==="user"?"rgba(58,168,160,.12)":"rgba(212,165,90,.08)",border:`1px solid ${from==="user"?"rgba(58,168,160,.2)":C.borderGold}`}}>{typing?<Dots/>:<p style={{color:C.text,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{from==="lumi"?<Md text={text}/>:text}</p>}</div></div>;
const Stars = () => <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>{Array.from({length:50},(_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*50}%`,width:Math.random()>.8?2.5:1.5,height:Math.random()>.8?2.5:1.5,background:"#fff",borderRadius:"50%",opacity:.1+Math.random()*.3,animation:`twinkle ${3+Math.random()*4}s ease-in-out infinite`,animationDelay:`${Math.random()*4}s`}}/>)}</div>;

// Confetti component
const Confetti = () => <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:100}}>{Array.from({length:20},(_,i)=><div key={i} style={{position:"absolute",left:`${10+Math.random()*80}%`,top:"60%",width:8,height:8,borderRadius:Math.random()>.5?"50%":"2px",background:["#D4A55A","#4ABA78","#3AA8A0","#E88060","#4A90D9","#7A6BBF"][i%6],animation:`confetti ${1+Math.random()}s ease-out forwards`,animationDelay:`${Math.random()*0.5}s`}}/>)}</div>;

// AUTH
const AuthScreen = () => {
  const [mode,setMode]=useState("signin");const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [loading,setLoading]=useState(false);const [err,setErr]=useState("");
  const go=async()=>{if(!email||!pass){setErr("Please fill in both fields");return}setLoading(true);setErr("");const{error}=mode==="signup"?await db.signUp(email,pass):await db.signIn(email,pass);setLoading(false);if(error){setErr(error.message);return}if(mode==="signup")setMode("check")};
  if(mode==="check")return(<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,position:"relative"}}><Stars/><Lumi size={72} mood="excited" level={1} animate/><h2 style={{color:C.goldLight,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,marginTop:14,textAlign:"center"}}>Check your email!</h2><p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,textAlign:"center",lineHeight:1.7,maxWidth:300,marginTop:8}}>We sent a link to <strong style={{color:C.gold}}>{email}</strong></p><div style={{marginTop:24,width:"100%",maxWidth:280}}><Btn v="ghost" onClick={()=>setMode("signin")}>{T.backToSignIn}</Btn></div></div>);
  return(<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop} 0%,${C.skyMid} 50%,${C.mountain} 80%,${C.green} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",position:"relative"}}>
    <Stars/><div className="fu" style={{position:"relative",zIndex:1}}><Lumi size={80} mood="happy" level={1} animate/></div>
    <h1 className="fu s1" style={{color:C.goldLight,fontSize:34,fontFamily:C.fontDisplay,fontWeight:700,marginTop:8}}>AI Fluent</h1>
    <p className="fu s2" style={{color:C.textMuted,fontSize:14,fontFamily:C.font,marginBottom:28}}>Your climb to AI fluency starts here</p>
    <div style={{width:"100%",maxWidth:340,position:"relative",zIndex:1}}>
      <div className="fu s3" style={{display:"flex",gap:4,marginBottom:18,background:"rgba(255,255,255,.04)",borderRadius:12,padding:3,border:`1px solid ${C.border}`}}>{["signin","signup"].map(m=><button key={m} onClick={()=>{setMode(m);setErr("")}} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",background:mode===m?"rgba(212,165,90,.12)":"transparent",color:mode===m?C.gold:C.textDim,fontSize:14,fontWeight:700,fontFamily:C.font}}>{m==="signin"?T.signIn:T.signUp}</button>)}</div>
      <div className="fu s4" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={T.email} type="email" style={{width:"100%",background:"rgba(255,255,255,.05)",borderRadius:12,border:`1.5px solid ${C.border}`,padding:"13px 16px",color:C.text,fontSize:15,fontFamily:C.font,outline:"none"}}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder={T.password} type="password" onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",background:"rgba(255,255,255,.05)",borderRadius:12,border:`1.5px solid ${C.border}`,padding:"13px 16px",color:C.text,fontSize:15,fontFamily:C.font,outline:"none"}}/>
      </div>
      {err&&<p className="fi" style={{color:C.red,fontSize:13,fontFamily:C.font,marginBottom:12,textAlign:"center"}}>{err}</p>}
      <Btn onClick={go} disabled={loading}>{loading?"...":mode==="signin"?T.startClimbing:T.createAccount}</Btn>
    </div></div>);
};

// ONBOARDING
const Onboarding = ({uid,onDone}) => {
  const [step,setStep]=useState(0);const [ans,setAns]=useState({});const [building,setBuilding]=useState(false);
  const steps=[{q:"Tell us about yourself",sub:"This shapes your path",opts:["Business Owner","Student","Working Professional","Curious Learner","Creative / Artist","Retired & Exploring"],key:"role"},{q:"Your experience with AI?",sub:"Everyone starts somewhere",opts:["Completely new","Tried ChatGPT once","Use AI occasionally","Ready to go deeper"],key:"exp"},{q:"What are you climbing toward?",sub:"Select all that interest you",opts:["Better writing","Creating images","Business growth","Staying informed","Automating tasks","Just exploring"],key:"goals",multi:true}];
  const pick=(val)=>{const s=steps[step];if(s.multi){const c=ans[s.key]||[];setAns({...ans,[s.key]:c.includes(val)?c.filter(v=>v!==val):[...c,val]})}else{const na={...ans,[s.key]:val};setAns(na);if(step<2)setTimeout(()=>setStep(step+1),300);else finish(na)}};
  const finish=async(fa)=>{setBuilding(true);const a=fa||ans;await db.updateProfile(uid,{role:a.role,experience_level:a.exp,goals:a.goals||[],onboarded:true});setTimeout(()=>onDone(),2000)};
  if(building)return(<div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,position:"relative"}}><Stars/><Lumi size={72} mood="thinking" level={1} animate/><p className="fu" style={{color:C.goldLight,fontSize:18,fontFamily:C.fontDisplay,fontWeight:700,marginTop:14}}>Charting your route...</p></div>);
  const s=steps[step];
  return(<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid} 70%,${C.mountain})`,display:"flex",flexDirection:"column",padding:"44px 24px 40px",position:"relative"}}><Stars/>
    <div style={{display:"flex",gap:6,marginBottom:28,justifyContent:"center",position:"relative",zIndex:1}}>{steps.map((_,i)=><div key={i} style={{width:i===step?28:8,height:8,borderRadius:4,background:i<=step?C.gold:"rgba(255,255,255,.08)",transition:"all .4s"}}/>)}</div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,position:"relative",zIndex:1}}><Lumi size={36} mood={step===2?"excited":"happy"} level={1}/><span style={{color:C.textMuted,fontSize:13,fontFamily:C.font,fontWeight:600}}>Lumi, your guide</span></div>
    <h2 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 3px",position:"relative",zIndex:1}}>{s.q}</h2>
    <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,margin:"0 0 20px",position:"relative",zIndex:1}}>{s.sub}</p>
    <div style={{display:"flex",flexDirection:"column",gap:8,flex:1,position:"relative",zIndex:1}}>{s.opts.map((o,i)=>{const sel=s.multi?(ans[s.key]||[]).includes(o):ans[s.key]===o;return<button key={o} className={`pop s${Math.min(i+1,5)}`} onClick={()=>pick(o)} style={{background:sel?"rgba(212,165,90,.1)":"rgba(255,255,255,.03)",border:`1.5px solid ${sel?C.gold:C.border}`,borderRadius:14,padding:"13px 16px",textAlign:"left"}}><span style={{color:sel?C.goldLight:C.textMuted,fontSize:14,fontWeight:sel?700:500,fontFamily:C.font}}>{sel?"● ":""}{o}</span></button>})}</div>
    {s.multi&&(ans[s.key]||[]).length>0&&<div className="fu" style={{marginTop:14,position:"relative",zIndex:1}}><Btn onClick={()=>finish()}>Begin the climb →</Btn></div>}
  </div>);
};

// WORLD MAP — Premium mountain climbing experience
const WorldMap = ({profile,progress,onOpenLoc,onOpenNews,onOpenTools,onOpenProfile,onOpenChallenge,onOpenAchievements,onToggleTheme,onChangeLang}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);const done=[...new Set(progress.map(p=>p.path_id))];
  const status=(loc)=>{if(loc.id==="master")return done.length>=6?"current":"locked";const idx=LOCS.findIndex(l=>l.id===loc.id);if(done.includes(loc.id))return"done";if(idx===0)return"current";const prev=LOCS[idx-1];if(prev&&done.includes(prev.id))return"current";return"locked"};
  const pct=Math.round((done.length/6)*100);
  const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"};
  const streak=Streak.getData().current||profile?.current_streak||0;
  const name=profile?.display_name?.split(" ")[0]||"Climber";
  const dk=C.mode==="dark";

  const nodes=[
    {loc:LOCS[0],nx:22,ny:86},{loc:LOCS[1],nx:42,ny:72},{loc:LOCS[2],nx:68,ny:78},
    {loc:LOCS[3],nx:78,ny:58},{loc:LOCS[4],nx:55,ny:42},{loc:LOCS[5],nx:32,ny:50},
    {loc:LOCS[6],nx:50,ny:16},
  ];

  // Trail colors that work on both themes
  const trailDone=dk?"rgba(74,186,120,.5)":"rgba(42,138,80,.6)";
  const trailPending=dk?"rgba(212,165,90,.2)":"rgba(160,120,50,.25)";
  const trailKnot=dk?"rgba(212,165,90,.25)":"rgba(160,120,50,.3)";

  return(<div style={{height:"100vh",position:"relative",overflow:"hidden",background:dk
    ?"linear-gradient(180deg, #060D1A 0%, #0B1A2E 12%, #102840 30%, #1A4060 48%, #1A4838 65%, #1E5040 78%, #2A6A48 90%, #1E4A35 100%)"
    :"linear-gradient(180deg, #D8E8F8 0%, #C0D8F0 12%, #A8C8E0 30%, #90B8D0 48%, #88B8A0 65%, #6AA878 78%, #5A9868 90%, #4A8858 100%)"}}>

    {/* Stars / Clouds depending on theme */}
    {dk?<div style={{position:"absolute",top:0,left:0,right:0,height:"45%",overflow:"hidden",pointerEvents:"none"}}>
      {Array.from({length:50},(_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:Math.random()>.85?2:1.5,height:Math.random()>.85?2:1.5,background:"#fff",borderRadius:"50%",opacity:.1+Math.random()*.3,animation:`twinkle ${3+Math.random()*5}s ease-in-out infinite`,animationDelay:`${Math.random()*4}s`}}/>)}
    </div>
    :<div style={{position:"absolute",top:0,left:0,right:0,height:"40%",overflow:"hidden",pointerEvents:"none"}}>
      {[{x:15,y:8,w:80,h:20},{x:65,y:5,w:100,h:24},{x:40,y:15,w:60,h:16},{x:85,y:12,w:70,h:18}].map((c,i)=>
        <div key={i} style={{position:"absolute",left:`${c.x}%`,top:`${c.y}%`,width:c.w,height:c.h,borderRadius:c.h,background:"rgba(255,255,255,.5)",filter:"blur(8px)",animation:`lumiFloat ${6+i*2}s ease-in-out infinite`,animationDelay:`${i*1.5}s`}}/>
      )}
    </div>}

    {/* Sun (light) or Moon (dark) */}
    <div style={{position:"absolute",top:dk?"8%":"6%",right:dk?"12%":"10%",width:dk?36:50,height:dk?36:50,borderRadius:"50%",
      background:dk?"radial-gradient(circle at 35% 35%, #F0E8D8, #B8B0A0)":"radial-gradient(circle at 45% 40%, #FFF8E0, #FFE090, #FFD060)",
      opacity:dk?.15:1,zIndex:1,
      boxShadow:dk?"none":"0 0 40px rgba(255,210,80,.3), 0 0 80px rgba(255,210,80,.15)"}}/>

    {/* Mountain range - theme aware */}
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" style={{position:"absolute",top:"22%",left:0,width:"100%",height:"48%",zIndex:1}}>
      {/* Far range */}
      <path d="M-20 300 L50 110 L90 160 L150 50 L210 140 L270 30 L330 120 L420 300 Z" fill={dk?"#0F1E30":"#6A7888"} opacity={dk?".7":".3"}/>
      <path d="M135 75 L150 50 L165 75 Z" fill={dk?"#C0D0E0":"#E8F0F8"} opacity={dk?".15":".4"}/>
      <path d="M255 55 L270 30 L285 55 Z" fill={dk?"#C0D0E0":"#E8F0F8"} opacity={dk?".18":".5"}/>
      {/* Near range */}
      <path d="M-20 300 L30 160 L80 210 L140 90 L190 180 L250 70 L300 170 L370 130 L420 300 Z" fill={dk?"#142838":"#5A6878"} opacity={dk?".6":".25"}/>
      <path d="M130 115 L140 90 L150 115 Z" fill={dk?"#D0DCE8":"#F0F4F8"} opacity={dk?".12":".5"}/>
      <path d="M240 95 L250 70 L260 95 Z" fill={dk?"#D0DCE8":"#F0F4F8"} opacity={dk?".14":".55"}/>
    </svg>

    {/* Fog bands */}
    <div style={{position:"absolute",top:"40%",left:0,right:0,height:60,background:`linear-gradient(180deg, transparent, ${dk?"rgba(180,210,230,.04)":"rgba(255,255,255,.15)"}, transparent)`,zIndex:2}}/>

    {/* Tree silhouettes */}
    <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{position:"absolute",bottom:"8%",left:0,width:"100%",height:"12%",zIndex:2,opacity:dk?.15:.2}}>
      <path d="M0 80 L10 30 L20 80 M30 80 L42 20 L54 80 M70 80 L78 35 L86 80 M100 80 L115 15 L130 80 M150 80 L158 40 L166 80 M190 80 L200 25 L210 80 M230 80 L240 35 L250 80 M270 80 L285 10 L300 80 M320 80 L328 40 L336 80 M350 80 L365 20 L380 80 M390 80 L398 45 L406 80" fill={dk?"#1A3A28":"#3A6848"} stroke="none"/>
    </svg>

    {/* Floating particles — fireflies (dark) or pollen (light) */}
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:3}}>
      {Array.from({length:8},(_,i)=><div key={i} style={{
        position:"absolute",left:`${15+Math.random()*70}%`,top:`${30+Math.random()*50}%`,
        width:dk?3:2,height:dk?3:2,borderRadius:"50%",
        background:dk?"#FFE8A0":"rgba(255,255,255,.8)",
        opacity:dk?.15:.4,
        animation:`lumiFloat ${4+Math.random()*4}s ease-in-out infinite`,
        animationDelay:`${Math.random()*5}s`,
      }}/>)}
    </div>

    {/* Top bar */}
    <div style={{position:"absolute",top:0,left:0,right:0,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20,
      background:dk?"linear-gradient(180deg, rgba(6,13,26,.95) 0%, rgba(6,13,26,.6) 70%, transparent 100%)":"linear-gradient(180deg, rgba(216,232,248,.95) 0%, rgba(216,232,248,.6) 70%, transparent 100%)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Lumi size={32} mood={streak>=7?"excited":"happy"} level={level}/>
        <div>
          <p style={{color:C.text,fontSize:14,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{T.greeting(new Date().getHours())}, {name}</p>
          <p style={{color:C.textMuted,fontSize:11,fontFamily:C.font,margin:0}}>{T.altitude} {level} · {pct}% {T.toSummit}</p>
        </div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:4,background:dk?"rgba(212,165,90,.1)":"rgba(180,130,40,.1)",padding:"6px 10px",borderRadius:20,border:`1px solid ${dk?"rgba(212,165,90,.2)":"rgba(180,130,40,.2)"}`}}><span style={{fontSize:13}}>🔥</span><span style={{color:C.gold,fontSize:13,fontWeight:800,fontFamily:C.font}}>{streak}</span></div>
        <button onClick={onOpenAchievements} style={{display:"flex",alignItems:"center",gap:3,background:dk?"rgba(58,168,160,.1)":"rgba(42,128,120,.08)",padding:"6px 10px",borderRadius:20,border:`1px solid ${dk?"rgba(58,168,160,.2)":"rgba(42,128,120,.15)"}`,fontSize:13}}>🏆<span style={{color:C.teal,fontSize:13,fontWeight:800,fontFamily:C.font}}>{ACHIEVEMENTS.filter(a=>a.condition(progress,profile)).length}</span></button>
        <ThemeToggle onToggle={onToggleTheme}/>
        <LangSelector onChangeLang={onChangeLang} compact/>
        <button onClick={onOpenProfile} style={{width:32,height:32,borderRadius:10,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.05)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>👤</button>
      </div>
    </div>

    {/* CLIMBING TRAIL */}
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:4,pointerEvents:"none"}}>
      {/* Trail shadow for depth */}
      {nodes.slice(0,-1).map((n,i)=>{
        const next=nodes[i+1];const completed=status(n.loc)==="done";
        return<line key={`s${i}`} x1={n.nx+.2} y1={n.ny+.2} x2={next.nx+.2} y2={next.ny+.2}
          stroke={dk?"rgba(0,0,0,.2)":"rgba(0,0,0,.08)"} strokeWidth=".5" strokeLinecap="round"/>;
      })}
      {/* Main trail lines */}
      {nodes.slice(0,-1).map((n,i)=>{
        const next=nodes[i+1];const completed=status(n.loc)==="done";
        return<line key={i} x1={n.nx} y1={n.ny} x2={next.nx} y2={next.ny}
          stroke={completed?trailDone:trailPending}
          strokeWidth={completed?".5":".35"} strokeDasharray={completed?"none":"2 1.5"}
          strokeLinecap="round"/>;
      })}
      {/* Rope knots */}
      {nodes.slice(0,-1).map((n,i)=>{
        const next=nodes[i+1];const mx=(n.nx+next.nx)/2;const my=(n.ny+next.ny)/2;
        return<circle key={`k${i}`} cx={mx} cy={my} r=".5" fill={trailKnot}/>;
      })}
    </svg>

    {/* LOCATION NODES */}
    {nodes.map(({loc,nx,ny},i)=>{
      const st=status(loc);const d=st==="done";const cur=st==="current";const lk=st==="locked";
      return(<div key={loc.id} onClick={()=>!lk&&onOpenLoc(loc.id)}
        style={{position:"absolute",left:`${nx}%`,top:`${ny}%`,transform:"translate(-50%,-50%)",zIndex:10,cursor:lk?"default":"pointer",textAlign:"center"}}>

        {/* Pulse ring for current */}
        {cur&&<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:74,height:74,borderRadius:"50%",border:`2px solid ${dk?"rgba(212,165,90,.25)":"rgba(180,130,40,.3)"}`,animation:"pulse 2.5s ease-in-out infinite"}}/>}

        {/* Node */}
        <div style={{
          width:d?52:cur?56:44,height:d?52:cur?56:44,borderRadius:"50%",
          background:d?`radial-gradient(circle at 40% 35%, ${dk?"#60E898":"#4ABA78"}, ${dk?"#3AAA68":"#2A8A50"})`
            :cur?`radial-gradient(circle at 40% 35%, ${dk?"#FFE8C0":"#FFD880"}, ${dk?"#D4A55A":"#B8903A"})`
            :`radial-gradient(circle at 40% 35%, ${dk?"rgba(60,80,100,.6)":"rgba(180,195,210,.8)"}, ${dk?"rgba(30,50,70,.8)":"rgba(140,160,180,.9)"})`,
          border:d?`3px solid ${dk?"rgba(74,186,120,.5)":"rgba(42,138,80,.5)"}`
            :cur?`3px solid ${dk?"rgba(212,165,90,.5)":"rgba(180,130,40,.5)"}`
            :`2px solid ${dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.08)"}`,
          boxShadow:d?`0 4px 20px ${dk?"rgba(74,186,120,.25)":"rgba(42,138,80,.2)"}`
            :cur?`0 4px 24px ${dk?"rgba(212,165,90,.3)":"rgba(180,130,40,.25)"}`:"none",
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto",opacity:lk?.3:1,transition:"all .3s ease",
          animation:cur?"lumiFloat 3s ease-in-out infinite":"none",
        }}>
          <span style={{fontSize:d?20:cur?22:18,filter:lk?"grayscale(1) brightness(.5)":"none"}}>{d?"✓":loc.icon}</span>
        </div>

        {/* Label */}
        <div style={{marginTop:6,padding:"3px 10px",borderRadius:8,
          background:cur?(dk?"rgba(212,165,90,.2)":"rgba(180,130,40,.15)")
            :d?(dk?"rgba(74,186,120,.12)":"rgba(42,138,80,.1)")
            :(dk?"rgba(0,0,0,.4)":"rgba(255,255,255,.7)"),
          backdropFilter:"blur(6px)",display:"inline-block",
          boxShadow:dk?"none":"0 1px 4px rgba(0,0,0,.08)"}}>
          <p style={{color:lk?(dk?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)")
            :cur?(dk?"#FFE8C0":"#8A6A2A")
            :d?(dk?"#A0F0C0":"#2A6A38")
            :(dk?"#C0D0E0":"#3A5060"),
            fontSize:11,fontWeight:700,fontFamily:C.font,margin:0,whiteSpace:"nowrap"}}>{locName(loc.id)}</p>
        </div>
        {cur&&<p style={{color:dk?"rgba(212,165,90,.5)":"rgba(140,100,30,.5)",fontSize:9,fontFamily:C.font,margin:"2px 0 0"}}>{T.tapExplore}</p>}
      </div>);
    })}

    {/* Bottom action bar */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,padding:"0 12px 12px",paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}>
      <div style={{display:"flex",gap:8,background:dk?"rgba(6,13,26,.85)":"rgba(255,255,255,.85)",backdropFilter:"blur(16px)",borderRadius:18,padding:8,border:`1px solid ${dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.08)"}`,boxShadow:dk?"none":"0 -2px 20px rgba(0,0,0,.06)"}}>
        <button onClick={onOpenChallenge} style={{flex:1,background:dk?"rgba(232,128,96,.08)":"rgba(232,128,96,.06)",border:`1px solid ${dk?"rgba(232,128,96,.15)":"rgba(232,128,96,.12)"}`,borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <Icon type="challenge" size={22} color={dk?"#F0A878":"#C08058"}/><div><p style={{color:dk?"#F0A878":"#A06840",fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>{T.dailyChallenge}</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:0}}>{T.keepStreak}</p></div>
        </button>
        <button onClick={onOpenNews} style={{flex:1,background:dk?"rgba(212,165,90,.06)":"rgba(180,130,40,.05)",border:`1px solid ${dk?"rgba(212,165,90,.12)":"rgba(180,130,40,.1)"}`,borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <Icon type="news" size={22} color={dk?"#E8C878":"#A08838"}/><div><p style={{color:dk?"#E8C878":"#806820",fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>{T.aiNews}</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:0}}>{T.live}</p></div>
        </button>
        <button onClick={onOpenTools} style={{flex:1,background:dk?"rgba(58,168,160,.06)":"rgba(42,128,120,.05)",border:`1px solid ${dk?"rgba(58,168,160,.12)":"rgba(42,128,120,.1)"}`,borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <Icon type="tools" size={22} color={dk?"#68D8C8":"#388880"}/><div><p style={{color:dk?"#68D8C8":"#2A7068",fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>{T.aiTools}</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:0}}>{T.tools6}</p></div>
        </button>
      </div>
    </div>
  </div>);
};

// LOCATION VIEW + LESSON SELECTOR + TUTOR + PRACTICE MODE
// Altitude Rating helper
const getAltitude=(pct)=>{
  if(pct>=90)return{label:"Summit",icon:"🏔️",color:"#FFD700",bg:"rgba(255,215,0,.12)",border:"rgba(255,215,0,.25)",msg:"Outstanding! You've mastered this lesson."};
  if(pct>=70)return{label:"Ridge",icon:"⛰️",color:"#4ABA78",bg:"rgba(74,186,120,.1)",border:"rgba(74,186,120,.2)",msg:"Solid understanding. Great work!"};
  if(pct>=50)return{label:"Treeline",icon:"◈",color:"#E8B84B",bg:"rgba(232,184,75,.08)",border:"rgba(232,184,75,.18)",msg:"Almost there! You need 70% to pass. Review and try again."};
  return{label:"Base Camp",icon:"△",color:"#C87858",bg:"rgba(200,120,88,.08)",border:"rgba(200,120,88,.18)",msg:"You need more practice. Review the lesson and try again."};
};

const LocView = ({locId,uid,progress,onBack,onComplete,profile}) => {
  const loc=LOCS.find(l=>l.id===locId)||LOCS[0];
  const lessons=LESSONS[locId]||[];
  const [lessonIdx,setLessonIdx]=useState(null);
  const lesson=lessonIdx!==null?lessons[lessonIdx]:null;
  const [view,setView]=useState("intro");const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  // Lumi personality context
  const userName=profile?.display_name?.split(" ")[0]||"friend";
  const userRole=profile?.role||"learner";
  const completedCount=progress.length;
  const streakDays=Streak.getData().current||0;
  const langInstruction=getLang()==="en"?"":`IMPORTANT: Respond ENTIRELY in ${LANGS[getLang()].name}. The user's interface language is ${LANGS[getLang()].name}.`;
  const lumiPersonality=`You are Lumi, a warm and knowledgeable AI guide in "AI Fluent" at "${loc.name}" teaching "${lesson?.title}". The learner's name is ${userName} and they are a ${userRole}. They have completed ${completedCount} lessons and have a ${streakDays}-day streak. Reference their name occasionally (not every message). If they've done many lessons, acknowledge their progress. Be clear, use simple language, everyday analogies. Encouraging but never condescending. Under 180 words. ${langInstruction}`;
  const [practiceIdx,setPracticeIdx]=useState(0);const [selected,setSelected]=useState(null);const [submitted,setSubmitted]=useState(false);
  const [freeAns,setFreeAns]=useState("");const [feedback,setFeedback]=useState("");const [grading,setGrading]=useState(false);
  const [showConfetti,setShowConfetti]=useState(false);const [practiceScore,setPracticeScore]=useState(0);
  const [totalPossible,setTotalPossible]=useState(0);
  const [showResults,setShowResults]=useState(false);
  const [showShare,setShowShare]=useState(false);
  // Store scores per lesson: { "basics-0": 85, "writing-1": 70 }
  const [lessonScores,setLessonScores]=useState(()=>{try{return JSON.parse(localStorage.getItem("ai_fluent_scores")||"{}")}catch{return{}}});
  const saveScore=(pathId,li,pct)=>{const k=`${pathId}-${li}`;const ns={...lessonScores,[k]:Math.max(pct,lessonScores[k]||0)};setLessonScores(ns);localStorage.setItem("ai_fluent_scores",JSON.stringify(ns))};
  const getScore=(pathId,li)=>lessonScores[`${pathId}-${li}`]||null;

  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);

  // Which lessons in this path has the user completed?
  const completedInPath=progress.filter(p=>p.path_id===locId).map(p=>p.lesson_index);
  const isLessonDone=(idx)=>completedInPath.includes(idx);
  const isLessonUnlocked=(idx)=>idx===0||completedInPath.includes(idx-1);

  const ask=async(q)=>{setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);
    try{const r=await db.callClaude({feature:"tutor",system:lumiPersonality,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"tutor",context_id:locId,context_title:lesson?.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch(e){setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:"Hmm, I lost my connection for a moment. Could you try asking that again? 🌟"}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  const practice=lesson?.practice||[];
  const currentP=practice[practiceIdx];

  const gradeFreeResponse=async()=>{
    setGrading(true);
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, grading a practice exercise. The question was: "${currentP.q}". The hint was: "${currentP.hint||""}". IMPORTANT: Start your response with exactly "SCORE: X/10" on the first line (where X is 1-10). Then grade their response: 1) Was it specific enough? 2) Did they follow the lesson's framework? Give brief encouraging feedback and one specific suggestion to improve. Keep under 120 words. Be warm and encouraging.${getLang()!=="en"?` Respond ENTIRELY in ${LANGS[getLang()].name} (except the SCORE: X/10 line which must stay in English).`:""}`,messages:[{role:"user",content:freeAns}]});
      const scoreMatch=r.text.match(/SCORE:\s*(\d+)\s*\/\s*10/i);
      const numScore=scoreMatch?parseInt(scoreMatch[1]):6;
      setFeedback(r.text.replace(/SCORE:\s*\d+\s*\/\s*10\s*/i,"").trim());
      setPracticeScore(ps=>ps+numScore);
      setTotalPossible(tp=>tp+10);
      SFX.play(numScore>=7?"correct":"click");
    }catch{setFeedback("Great effort! The key is being specific — the more detail you give AI, the better the result.");setPracticeScore(ps=>ps+6);setTotalPossible(tp=>tp+10)}
    setGrading(false);setSubmitted(true);
  };

  const resetPractice=()=>{setPracticeIdx(0);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("");setPracticeScore(0);setTotalPossible(0);setShowConfetti(false);setShowResults(false)};
  const goToLesson=(idx)=>{setLessonIdx(idx);setView("lesson");setMsgs([]);setSid(null);resetPractice()};

  // PRACTICE MODE
  if(view==="practice"&&practice.length>0&&!showResults)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.back}</button>
    {showConfetti&&<Confetti/>}
    <div style={{display:"flex",gap:4,marginBottom:16}}>{practice.map((_,i)=><div key={i} style={{flex:1,height:5,borderRadius:3,background:i<practiceIdx?C.green:i===practiceIdx?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Lumi size={28} mood={submitted?"excited":"happy"} level={level}/><span style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600}}>Practice {practiceIdx+1} of {practice.length}</span></div>
    <h2 className="fu s1" style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 16px",lineHeight:1.35}}>{currentP.q}</h2>
    {currentP.type==="multiple_choice"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {currentP.opts.map((o,i)=>{const isCorrect=i===currentP.correct;const isSelected=selected===i;const showResult=submitted;
        return<button key={i} onClick={()=>{if(!submitted)setSelected(i)}} disabled={submitted} className={`pop s${Math.min(i+1,5)}`}
          style={{background:showResult?(isCorrect?"rgba(74,186,120,.12)":isSelected?"rgba(216,88,88,.12)":"rgba(255,255,255,.03)"):(isSelected?"rgba(212,165,90,.1)":"rgba(255,255,255,.03)"),border:`1.5px solid ${showResult?(isCorrect?C.green:isSelected?C.red:C.border):(isSelected?C.gold:C.border)}`,borderRadius:14,padding:"13px 16px",textAlign:"left",width:"100%"}}>
          <span style={{color:showResult?(isCorrect?C.green:isSelected?C.red:C.textMuted):(isSelected?C.goldLight:C.textMuted),fontSize:14,fontWeight:isSelected?700:500,fontFamily:C.font}}>{showResult?(isCorrect?"✓ ":isSelected?"✗ ":""):isSelected?"● ":""}{o}</span></button>})}
      {!submitted&&selected!==null&&<div style={{marginTop:8}}><Btn onClick={()=>{setSubmitted(true);setTotalPossible(tp=>tp+10);if(selected===currentP.correct){setPracticeScore(ps=>ps+10);SFX.play("correct")}else{SFX.play("wrong")}}}>{T.check}</Btn></div>}
      {submitted&&<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14,marginTop:10}}><p style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 4px"}}>💡 Why?</p><p style={{color:C.textMuted,fontSize:13,lineHeight:1.6,fontFamily:C.font,margin:0}}>{currentP.explain}</p></div>}
    </div>}
    {currentP.type==="free_response"&&<div>
      {currentP.hint&&!submitted&&<div className="fu" style={{background:"rgba(212,165,90,.04)",border:`1px solid ${C.borderGold}`,borderRadius:12,padding:10,marginBottom:12}}><p style={{color:C.gold,fontSize:12,fontFamily:C.font,margin:0}}>💡 Hint: {currentP.hint}</p></div>}
      <textarea value={freeAns} onChange={e=>setFreeAns(e.target.value)} placeholder="Type your answer..." disabled={submitted} style={{width:"100%",minHeight:120,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical",marginBottom:10}}/>
      {!submitted&&<Btn onClick={gradeFreeResponse} disabled={!freeAns.trim()||grading}>{grading?T.lumiReviewing:"Submit for Review"}</Btn>}
      {submitted&&feedback&&<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14,marginTop:10}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Lumi size={22}/><span style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font}}>{T.lumiFeedback}</span></div><p style={{color:C.textMuted,fontSize:13,lineHeight:1.65,fontFamily:C.font,margin:0}}><Md text={feedback}/></p></div>}
    </div>}
    {submitted&&<div style={{marginTop:14}}>
      {practiceIdx<practice.length-1?<Btn v="teal" onClick={()=>{setPracticeIdx(practiceIdx+1);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("")}}>{T.nextQ}</Btn>
      :<Btn v="gold" onClick={()=>{const p=totalPossible>0?Math.round((practiceScore/totalPossible)*100):0;try{SFX.play(p>=70?"triumph":p>=50?"sparkle":"fail")}catch(e){}setShowResults(true)}}>{T.seeResults}</Btn>}
    </div>}
  </div>);

  // RESULTS SCREEN
  if(view==="practice"&&showResults){
    const pct=totalPossible>0?Math.round((practiceScore/totalPossible)*100):0;
    const alt=getAltitude(pct);
    const passed=pct>=70;
    const ratingKey=pct>=90?"summit":pct>=70?"ridge":pct>=50?"treeline":"base";
    return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      {passed&&<Confetti/>}
      <div className="fu" style={{textAlign:"center",maxWidth:340}}>
        <LumiReaction rating={ratingKey} size={120}/>
        <p style={{color:alt.color,fontSize:14,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:2,margin:"0 0 4px"}}>{alt.label} Rating</p>
        <p style={{color:C.text,fontSize:48,fontWeight:800,fontFamily:C.fontDisplay,margin:"0 0 8px"}}>{pct}%</p>
        <p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,lineHeight:1.6,margin:"0 0 24px"}}>{alt.msg}</p>
        <div style={{background:"rgba(255,255,255,.03)",borderRadius:14,padding:16,marginBottom:20,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{color:C.textDim,fontSize:13,fontFamily:C.font}}>{T.points}</span>
            <span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>{practiceScore}/{totalPossible}</span>
          </div>
          <div style={{height:8,background:"rgba(255,255,255,.06)",borderRadius:4,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${alt.color},${alt.color}88)`,borderRadius:4,transition:"width .8s ease"}}/>
          </div>
        </div>
        {passed?<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <Btn v="green" onClick={async()=>{
            try{SFX.play("triumph")}catch(e){}
            saveScore(locId,lessonIdx,pct);
            try{await db.completeLesson(uid,locId,lessonIdx)}catch(e){console.warn(e)}
            onComplete();
            // Navigate directly — don't call resetPractice which conflicts
            setShowResults(false);
            setLessonIdx(null);
            setView("intro");
          }}>
            {pct>=90?"🏔️ Claim Summit Rating!":"⛰️ Claim Ridge Rating!"}
          </Btn>
          {pct<90&&<Btn v="ghost" onClick={()=>{setShowResults(false);setPracticeIdx(0);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("");setPracticeScore(0);setTotalPossible(0);setView("practice")}}>{T.retry}</Btn>}
          <Btn v="ghost" onClick={()=>setShowShare(true)}>{T.shareRating}</Btn>
          {showShare&&<ShareCard type="altitude" data={{altitude:alt.label,pct,lesson:lesson?.title||""}} onClose={()=>setShowShare(false)}/>}
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <p style={{color:C.textMuted,fontSize:13,fontFamily:C.font,margin:"0 0 8px"}}>{T.need70}</p>
          <Btn v="gold" onClick={()=>{setShowResults(false);setPracticeIdx(0);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("");setPracticeScore(0);setTotalPossible(0);setView("practice")}}>{T.tryAgain}</Btn>
          <Btn v="ghost" onClick={()=>{setShowResults(false);setView("lesson")}}>{T.reviewFirst}</Btn>
        </div>}
      </div>
    </div>);
  }

  // TUTOR
  if(view==="tutor")return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bgDark}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}>
      <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>{T.back}</button>
      <div style={{flex:1,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Lumi size={22} level={level}/><span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>{T.lumiGuide}</span></div>
    </div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}>
      <Bub from="lumi" text={`Hey ${userName}! Welcome to ${locName(loc.id)}. I'm here to help with "${lesson?.title}" — ask me anything!`}/>
      {msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text}/>)}{typing&&<Bub from="lumi" typing/>}
      {msgs.length===0&&lesson&&<div className="fu s2" style={{marginTop:14}}><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600,margin:"0 0 10px"}}>{T.peoplAsk}</p>{lesson.questions.map((q,i)=><button key={i} onClick={()=>ask(q)} style={{display:"block",width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",marginBottom:7,textAlign:"left"}}><span style={{color:C.textMuted,fontSize:13,fontFamily:C.font}}>{q}</span></button>)}</div>}
    </div>
    <div style={{padding:"8px 14px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,background:C.bgCard,paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}>
      <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={T.askLumi+"..."} style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/>
      <button onClick={send} style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:16}}>↑</span></button>
    </div></div>);

  // LESSON CONTENT
  if(view==="lesson"&&lesson)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>{setView("intro");setLessonIdx(null)}} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.back} {locName(loc.id)}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:18}}>{loc.icon}</span><span style={{color:loc.color,fontSize:10,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1}}>{loc.sub} · Lesson {lessonIdx+1}</span></div>
    <h1 className="fu s1" style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 22px",lineHeight:1.3}}>{lessonTitle(lesson.title)}</h1>
    {lesson.sections.map((sec,i)=>(<div key={i} className={`fu s${Math.min(i+2,5)}`} style={{marginBottom:26}}><h3 style={{color:C.text,fontSize:16,fontWeight:700,fontFamily:C.font,margin:"0 0 8px"}}>{sec.h}</h3><p style={{color:C.textMuted,fontSize:14,lineHeight:1.8,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{sec.body}</p></div>))}
    <button onClick={()=>setView("tutor")} className="fu" style={{width:"100%",background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,textAlign:"left",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={32} mood="happy" level={level} animate/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{T.questionsHelp}</p><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>{T.guideHere}</p></div></div>
    </button>
    {practice.length>0?<Btn v="teal" onClick={()=>{setView("practice");resetPractice()}}>{T.startPractice}</Btn>
    :<Btn onClick={async()=>{await db.completeLesson(uid,locId,lessonIdx);onComplete();setView("intro");setLessonIdx(null)}}>{T.completeLesson}</Btn>}
  </div>);

  // INTRO — LESSON SELECTOR
  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid} 40%,${C.bgDark})`,padding:"14px 20px 40px",position:"relative"}}>
    <Stars/>
    <button onClick={onBack} style={{background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"7px 14px",color:C.gold,fontSize:13,fontFamily:C.font,fontWeight:700,position:"relative",zIndex:10,marginBottom:16}}>{T.map}</button>
    <div style={{position:"relative",zIndex:5}}>
      <div className="fu" style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
        <span style={{fontSize:40}}>{loc.icon}</span>
        <div><h1 style={{color:C.text,fontSize:26,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{locName(loc.id)}</h1><p style={{color:C.textMuted,fontSize:13,fontFamily:C.font,margin:"2px 0 0"}}>{locSub(loc.id)} · {lessons.length} {T.lessons}</p></div>
      </div>
      <p className="fu s1" style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:20,lineHeight:1.6}}>{locDesc(loc.id)}</p>

      {/* Progress bar */}
      <div className="fu s2" style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <div style={{flex:1,height:6,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}>
          <div style={{width:`${lessons.length>0?Math.round(completedInPath.length/lessons.length*100):0}%`,height:"100%",background:`linear-gradient(90deg,${C.green},${C.teal})`,borderRadius:3,transition:"width .6s"}}/>
        </div>
        <span style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600}}>{completedInPath.length}/{lessons.length}</span>
      </div>

      {/* Lesson list */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {lessons.map((l,i)=>{
          const done=isLessonDone(i);const unlocked=isLessonUnlocked(i);
          const score=getScore(locId,i);const alt=score?getAltitude(score):null;
          return(<button key={i} className={`fu s${Math.min(i+1,5)}`} onClick={()=>unlocked&&goToLesson(i)} disabled={!unlocked}
            style={{background:done?"rgba(74,186,120,.06)":unlocked?C.bgCard:"rgba(255,255,255,.02)",border:`1px solid ${done?(alt?alt.border:"rgba(74,186,120,.15)"):unlocked?C.border:"rgba(255,255,255,.04)"}`,borderRadius:14,padding:"14px 16px",textAlign:"left",width:"100%",opacity:unlocked?1:.4}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:done?(alt?alt.bg:"rgba(74,186,120,.15)"):unlocked?"rgba(212,165,90,.1)":"rgba(255,255,255,.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:done&&alt?18:14}}>{done&&alt?alt.icon:done?"✓":unlocked?(i+1):"🔒"}</span>
              </div>
              <div style={{flex:1}}>
                <p style={{color:unlocked?C.text:C.textDim,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{lessonTitle(l.title)}</p>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                  <span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{l.sections.length} {T.sections}{l.practice?.length>0?` · ${l.practice.length} ${T.practice}`:""}</span>
                  {done&&alt&&<span style={{color:alt.color,fontSize:10,fontWeight:700,fontFamily:C.font,background:alt.bg,padding:"1px 8px",borderRadius:8,border:`1px solid ${alt.border}`}}>{alt.icon} {alt.label} · {score}%</span>}
                  {done&&!alt&&<span style={{color:C.green,fontSize:10,fontFamily:C.font}}>✅ {T.completed}</span>}
                </div>
              </div>
              {unlocked&&!done&&<span style={{color:C.gold,fontSize:16}}>→</span>}
              {done&&score&&score<90&&<span style={{color:C.gold,fontSize:11,fontFamily:C.font}}>↑</span>}
            </div>
          </button>);
        })}
      </div>
    </div>
  </div>);
};

// LIVE NEWS - fetches real AI news via Claude web search
const NewsView = ({uid,onBack}) => {
  const [articles,setArticles]=useState([]);const [loading,setLoading]=useState(true);const [open,setOpen]=useState(null);
  const [chat,setChat]=useState(false);const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);

  // Fetch live news on mount
  useEffect(()=>{
    const fetchNews=async()=>{
      try{
        const today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
        const langNote=getLang()!=="en"?` Write ALL titles, summaries, and impact text in ${LANGS[getLang()].name}.`:"";
        const r=await db.callClaude({feature:"news_fetch",use_search:true,system:`You are Lumi, an AI news curator. Today is ${today}. Search for AI news published TODAY or in the last 24 hours ONLY. Do NOT include news older than 24 hours. Return EXACTLY 4 items as a JSON array. Each item: title (string), category (Breaking/Tools/Policy/Business/Research), summary (2-3 sentence ELI5), impact (why it matters to average person), timeAgo (e.g. "3h ago" or "Today"), source (publication name). Return ONLY valid JSON array, no markdown, no backticks, no extra text.${langNote}`,messages:[{role:"user",content:`Search for the 4 most important AI news stories from ${today}. Only include stories from today or the last 24 hours.`}]});
        try{
          const cleaned=r.text.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
          const parsed=JSON.parse(cleaned);
          if(Array.isArray(parsed)&&parsed.length>0)setArticles(parsed);
          else throw new Error("bad format");
        }catch{
          setArticles([{title:"AI News Loading Issue",category:"Info",summary:"Lumi had trouble formatting today's news. Try refreshing!",impact:"This is a temporary issue.",timeAgo:"now",source:"AI Fluent"}]);
        }
      }catch{setArticles([{title:"Couldn't fetch news right now",category:"Info",summary:"Lumi's news connection is down. Check back soon!",impact:"This is temporary.",timeAgo:"now",source:"AI Fluent"}])}
      setLoading(false);
    };
    fetchNews();
  },[]);

  const art=open!==null?articles[open]:null;

  const ask=async(q)=>{setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);
    try{const r=await db.callClaude({feature:"news_chat",system:`You are Lumi, explaining this news story: "${art.title}". Summary: ${art.summary}. Explain simply. Under 150 words.`,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"news",context_id:String(open),context_title:art.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch{setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:"Connection issue — try again."}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  // Chat
  if(chat&&art)return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bgDark}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}><button onClick={()=>{setChat(false);setMsgs([]);setSid(null)}} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>{T.back}</button><div style={{flex:1,textAlign:"center"}}><span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>Ask Lumi</span></div></div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}><Bub from="lumi" text={`I've got the details on "${art.title}" — what would you like to know?`}/>{msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text}/>)}{typing&&<Bub from="lumi" typing/>}</div>
    <div style={{padding:"8px 14px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about this..." style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/><button onClick={send} style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:16}}>↑</span></button></div>
  </div>);

  // Article detail
  if(art)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 100px"}}>
    <button onClick={()=>setOpen(null)} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.back}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:.8}}>{art.category}</span>{art.source&&<span style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>· {art.source}</span>}</div>
    <h1 className="fu s1" style={{color:C.text,fontSize:21,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 18px",lineHeight:1.35}}>{art.title}</h1>
    <div className="fu s2" style={{background:"rgba(74,186,120,.06)",border:"1px solid rgba(74,186,120,.12)",borderRadius:16,padding:16,marginBottom:12}}><p style={{color:C.green,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 6px"}}>{T.simpleVersion}</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.summary}</p></div>
    <div className="fu s3" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:12}}><p style={{color:C.gold,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 6px"}}>{T.whyMatters}</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.impact}</p></div>
    <button onClick={()=>setChat(true)} className="fu s4" style={{width:"100%",background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:14,textAlign:"left"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={30}/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{T.askAboutThis}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{T.explainPlain}</p></div></div></button>
  </div>);

  // News list
  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>{T.map}</button>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><h1 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700}}>{T.aiNews}</h1><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"twinkle 2s infinite"}}/><span style={{color:C.green,fontSize:11,fontFamily:C.font,fontWeight:600}}>{T.live}</span></div></div>
    <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:18}}>{T.newsDesc}</p>
    {loading?<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {[1,2,3,4].map(i=><div key={i} className={`fu s${i}`} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}><Skeleton lines={2}/></div>)}
      <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,textAlign:"center",marginTop:8}}>{T.newsSearch}</p>
    </div>
    :<div style={{display:"flex",flexDirection:"column",gap:10}}>{articles.map((n,i)=>(<button key={i} className={`fu s${Math.min(i+1,5)}`} onClick={()=>setOpen(i)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:14,textAlign:"left",width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:.8}}>{n.category}</span><span style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>{n.timeAgo}</span>{n.source&&<span style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>· {n.source}</span>}</div>
      <p style={{color:C.text,fontSize:14,fontWeight:600,fontFamily:C.font,margin:0,lineHeight:1.4}}>{n.title}</p>
    </button>))}</div>}
  </div>);
};

// DAILY CHALLENGE
const ChallengeView = ({uid,onBack}) => {
  const today=new Date();const dayIdx=today.getDate()%DAILY_CHALLENGES.length;
  const challenge=DAILY_CHALLENGES[dayIdx];
  const [response,setResponse]=useState("");const [feedback,setFeedback]=useState("");const [submitted,setSubmitted]=useState(false);const [grading,setGrading]=useState(false);const [showConfetti,setShowConfetti]=useState(false);

  const submit=async()=>{
    setGrading(true);
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, grading a daily challenge. The challenge was: "${challenge.title}" - "${challenge.task}". Evaluate their response. Give: 1) A score out of 10, 2) What they did well, 3) One specific improvement suggestion. Be encouraging. Under 150 words.`,messages:[{role:"user",content:response}],context_type:"tool",context_id:challenge.id,context_title:"Daily Challenge: "+challenge.title});
      setFeedback(r.text);setShowConfetti(true);
    }catch{setFeedback("Great effort! Keep practicing daily and you'll build strong AI skills.")}
    setGrading(false);setSubmitted(true);
  };

  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 40px"}}>
    {showConfetti&&<Confetti/>}
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>{T.map}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontSize:24}}>⚡</span><h1 style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{T.dailyChallenge}</h1></div>
    <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,marginBottom:18}}>{T.challengeDesc}</p>

    <div className="fu s1" style={{background:"rgba(232,128,96,.06)",border:"1px solid rgba(232,128,96,.15)",borderRadius:16,padding:16,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Lumi size={28} mood="excited"/><div><p style={{color:C.coral,fontSize:15,fontWeight:700,fontFamily:C.font,margin:0}}>{challenge.title}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{challenge.desc}</p></div></div>
      <p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{challenge.task}</p>
    </div>

    {!submitted?<>
      <textarea value={response} onChange={e=>setResponse(e.target.value)} placeholder="Type your response here..." style={{width:"100%",minHeight:140,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical",marginBottom:12}}/>
      <Btn onClick={submit} disabled={!response.trim()||grading} v="teal">{grading?T.lumiReviewing:"Submit Challenge ⚡"}</Btn>
    </>:<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Lumi size={28} mood="excited" animate/><span style={{color:C.goldLight,fontSize:15,fontWeight:700,fontFamily:C.font}}>Lumi's Review</span></div>
      <p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0,whiteSpace:"pre-wrap"}}>{feedback}</p>
      <p style={{color:C.green,fontSize:13,fontWeight:700,fontFamily:C.font,marginTop:12}}>🔥 Challenge complete! Your streak continues.</p>
    </div>}
  </div>);
};

// ACHIEVEMENTS
const AchievementsView = ({profile,progress,onBack}) => {
  const earned=ACHIEVEMENTS.filter(a=>a.condition(progress,profile));
  const locked=ACHIEVEMENTS.filter(a=>!a.condition(progress,profile));
  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 40px"}}>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>{T.map}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><span style={{fontSize:24}}>🏆</span><h1 style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{T.achievements}</h1><span style={{color:C.gold,fontSize:14,fontWeight:700,fontFamily:C.font}}>{earned.length}/{ACHIEVEMENTS.length}</span></div>
    {earned.length>0&&<><p style={{color:C.green,fontSize:12,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Earned</p>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{earned.map(a=>(<div key={a.id} className="fu" style={{background:"rgba(74,186,120,.06)",border:"1px solid rgba(74,186,120,.12)",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:28}}>{a.icon}</span><div><p style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{a.name}</p><p style={{color:C.textMuted,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>{a.desc}</p></div>
      </div>))}</div></>}
    {locked.length>0&&<><p style={{color:C.textDim,fontSize:12,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Locked</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>{locked.map(a=>(<div key={a.id} style={{background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,opacity:.5}}>
        <span style={{fontSize:28,filter:"grayscale(1)"}}>{a.icon}</span><div><p style={{color:C.textDim,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{a.name}</p><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>{a.desc}</p></div>
      </div>))}</div></>}
  </div>);
};

// TOOLS
const ToolsView = ({uid,onBack}) => {
  const [wf,setWf]=useState(null);const [step,setStep]=useState(0);const [ans,setAns]=useState([]);const [ft,setFt]=useState("");const [gen,setGen]=useState(false);const [result,setResult]=useState(null);
  const reset=()=>{setWf(null);setStep(0);setAns([]);setFt("");setResult(null)};
  const doGen=async(all)=>{setGen(true);try{const prompt=wf.steps.map((s,i)=>`${s.q}: ${all[i]}`).join("\n");const r=await db.callClaude({feature:"tool",system:wf.sys+" You are Lumi from AI Fluent. Practical, beginner-friendly.",messages:[{role:"user",content:prompt}],context_type:"tool",context_id:wf.id,context_title:wf.name});setResult(r.text)}catch{setResult("Something went wrong — try again.")}setGen(false)};
  const pick=(v)=>{const na=[...ans,v];setAns(na);if(step<wf.steps.length-1)setTimeout(()=>setStep(step+1),200);else doGen(na)};

  if(result)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}><button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← Tools</button><div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Lumi size={24}/><h2 style={{color:C.text,fontSize:18,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>Here's your result</h2></div><div className="fu s1" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:14}}><p style={{color:C.text,fontSize:14,lineHeight:1.75,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{result}</p></div><div style={{display:"flex",gap:8}}><div style={{flex:1}}><Btn v="ghost" onClick={()=>navigator.clipboard?.writeText(result)}>Copy</Btn></div><div style={{flex:1}}><Btn v="ghost" onClick={reset}>New</Btn></div></div></div>);
  if(gen)return(<div style={{height:"100vh",background:C.bgDark,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><Lumi size={56} mood="thinking" animate/><p className="fu" style={{color:C.textMuted,fontSize:15,fontFamily:C.font,marginTop:14}}>Working on it...</p></div>);
  if(wf){const s=wf.steps[step];return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}><button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:10}}>{T.back}</button><div style={{display:"flex",gap:3,marginBottom:18}}>{wf.steps.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,fontWeight:700,marginBottom:3}}>Step {step+1}/{wf.steps.length}</p><h2 className="fu" style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 18px"}}>{s.q}</h2>
    {s.free?<div className="fu s1"><textarea value={ft} onChange={e=>setFt(e.target.value)} placeholder={s.ph} style={{width:"100%",minHeight:100,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical"}}/><div style={{marginTop:10}}><Btn onClick={()=>pick(ft||"General")} disabled={!ft.trim()}>{step<wf.steps.length-1?"Next →":"Generate"}</Btn></div></div>
    :<div style={{display:"flex",flexDirection:"column",gap:8}}>{s.opts.map((o,i)=><button key={o} className={`pop s${Math.min(i+1,5)}`} onClick={()=>pick(o)} style={{background:"rgba(255,255,255,.03)",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 16px",textAlign:"left",width:"100%"}}><span style={{color:C.textMuted,fontSize:14,fontFamily:C.font}}>{o}</span></button>)}</div>}
  </div>)}
  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}><button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>{T.map}</button><h1 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,marginBottom:4}}>{T.aiTools}</h1><p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:18}}>{T.toolsDesc}</p>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>{TOOLS.map((t,i)=>(<button key={t.id} className={`fu s${Math.min(i+1,5)}`} onClick={()=>{setWf(t);setStep(0);setAns([]);setFt("");setResult(null)}} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%"}}><div style={{width:48,height:48,borderRadius:14,background:`${t.color}12`,border:`1px solid ${t.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon type={t.iconType} size={26} color={t.color}/></div><div style={{flex:1}}><p style={{color:C.text,fontSize:15,fontWeight:700,fontFamily:C.font,margin:0}}>{toolName(t.id)}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{toolDesc(t.id)}</p></div><span style={{color:t.color,fontSize:16,opacity:.5}}>→</span></button>))}</div>
  </div>);
};

// PROFILE
const ProfileView = ({profile,progress,onBack,onSignOut,onToggleTheme,onChangeLang}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  const donePaths=[...new Set(progress.map(p=>p.path_id))];
  const scores=(() => {try{return JSON.parse(localStorage.getItem("ai_fluent_scores")||"{}")}catch{return{}}})();
  const summitCount=Object.values(scores).filter(s=>s>=90).length;
  const ridgeCount=Object.values(scores).filter(s=>s>=70&&s<90).length;
  const totalScored=Object.keys(scores).length;
  const streakData=Streak.getData();
  const [showShare,setShowShare]=useState(false);

  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.bgDark})`,padding:"14px 20px 40px",position:"relative"}}><Stars/>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:18,position:"relative",zIndex:1}}>{T.map}</button>

    {/* Profile header */}
    <div className="fu" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20,position:"relative",zIndex:1}}>
      <Lumi size={80} mood="excited" level={level} animate/>
      <p style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,marginTop:8}}>{profile?.display_name||"Explorer"}</p>
      <p style={{color:C.textDim,fontSize:12,fontFamily:C.font}}>Altitude {level} · {profile?.role||"Learner"}</p>
    </div>

    {/* Stats grid */}
    <div className="fu s1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16,position:"relative",zIndex:1}}>
      {[
        {v:streakData.current||0,l:T.dayStreak,icon:"🔥",color:C.gold,bg:"rgba(212,165,90,.06)"},
        {v:progress.length,l:T.lessonsDone,icon:"📖",color:C.teal,bg:"rgba(58,168,160,.06)"},
        {v:profile?.total_tutor_sessions||0,l:T.lumiChats,icon:"💬",color:C.blue,bg:"rgba(74,144,217,.06)"},
        {v:ACHIEVEMENTS.filter(a=>a.condition(progress,profile)).length,l:T.achievements,icon:"🏆",color:C.green,bg:"rgba(74,186,120,.06)"},
      ].map((s,i)=>(
        <div key={i} className={`fu s${i+1}`} style={{background:s.bg,border:`1px solid ${s.color}20`,borderRadius:14,padding:"14px 12px",textAlign:"center"}}>
          <span style={{fontSize:20}}>{s.icon}</span>
          <p style={{color:C.text,fontSize:22,fontWeight:800,fontFamily:C.font,margin:"4px 0 0"}}>{s.v}</p>
          <p style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>{s.l}</p>
        </div>
      ))}
    </div>

    {/* Streak Calendar */}
    <div className="fu s2" style={{marginBottom:16,position:"relative",zIndex:1}}><StreakCalendar/></div>

    {/* Altitude ratings earned */}
    {totalScored>0&&<div className="fu s2" style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:16,position:"relative",zIndex:1}}>
      <p style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font,margin:"0 0 12px"}}>{T.altRatings}</p>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <div style={{textAlign:"center"}}><span style={{fontSize:24}}>🏔️</span><p style={{color:"#FFD700",fontSize:18,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{summitCount}</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font}}>{T.summit}</p></div>
        <div style={{textAlign:"center"}}><span style={{fontSize:24}}>⛰️</span><p style={{color:C.green,fontSize:18,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{ridgeCount}</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font}}>{T.ridge}</p></div>
        <div style={{textAlign:"center"}}><span style={{fontSize:24}}>📊</span><p style={{color:C.teal,fontSize:18,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{totalScored}</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font}}>{T.graded}</p></div>
      </div>
    </div>}

    {/* Learning paths progress */}
    <div className="fu s3" style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:16,position:"relative",zIndex:1}}>
      <p style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font,margin:"0 0 12px"}}>{T.learningPaths}</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {LOCS.filter(l=>l.id!=="master").map(loc=>{
          const lessons=LESSONS[loc.id]||[];
          const completed=progress.filter(p=>p.path_id===loc.id).length;
          const pct=lessons.length>0?Math.round(completed/lessons.length*100):0;
          return(<div key={loc.id} style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16,width:24,textAlign:"center"}}>{loc.icon}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{color:C.textMuted,fontSize:11,fontFamily:C.font}}>{locName(loc.id)}</span>
                <span style={{color:pct===100?C.green:C.textDim,fontSize:10,fontFamily:C.font,fontWeight:600}}>{completed}/{lessons.length}</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:pct===100?C.green:C.gold,borderRadius:2,transition:"width .5s"}}/>
              </div>
            </div>
          </div>);
        })}
      </div>
    </div>

    {/* Language */}
    <div className="fu s4" style={{marginBottom:8,position:"relative",zIndex:2}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.mode==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,borderRadius:14,padding:"10px 16px"}}>
        <span style={{color:C.text,fontSize:15,fontWeight:700,fontFamily:C.font}}>{T.language}</span>
        <LangSelector onChangeLang={onChangeLang}/>
      </div>
    </div>

    {/* Share progress */}
    <div className="fu s4" style={{marginBottom:8,position:"relative",zIndex:1}}>
      <Btn v="gold" onClick={()=>setShowShare(true)}>{T.shareProgress}</Btn>
    </div>
    {showShare&&<ShareCard type="progress" data={{lessons:progress.length,paths:donePaths.length,streak:streakData.current||0,level}} onClose={()=>setShowShare(false)}/>}

    <div className="fu s5" style={{display:"flex",gap:8,position:"relative",zIndex:1}}>
      <button onClick={onToggleTheme} style={{flex:1,background:C.mode==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 24px",fontSize:15,fontWeight:700,fontFamily:C.font,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {C.mode==="dark"?T.lightMode:T.darkMode}
      </button>
      <button onClick={onSignOut} style={{flex:1,background:C.mode==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 24px",fontSize:15,fontWeight:700,fontFamily:C.font,color:C.textMuted}}>{T.signOut}</button>
    </div>
    <p className="fu s5" style={{textAlign:"center",color:C.textDim,fontSize:11,fontFamily:C.font,marginTop:16,position:"relative",zIndex:1}}>AI Fluent v5 · Powered by Claude</p>
  </div>);
};

// TUTORIAL — animated walkthrough for first-time users
const Tutorial = ({onComplete}) => {
  const [step,setStep]=useState(0);
  const slides=[
    {
      title:"Welcome to AI Land",
      desc:"You're about to climb the mountain of AI fluency. Each stop on the trail teaches you a new skill — from the basics at Base Camp to mastery at The Summit.",
      visual:(
        <div style={{position:"relative",width:200,height:200,margin:"0 auto"}}>
          <svg viewBox="0 0 200 200" width="200" height="200">
            <path d="M30 180 L100 40 L170 180 Z" fill="#1E3348" stroke="#2A4560" strokeWidth="1"/>
            <path d="M85 65 L100 40 L115 65 Z" fill="#E8F0F8" opacity=".3"/>
            <circle cx="50" cy="165" r="8" fill="#4ABA78"/><text x="50" y="168" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">1</text>
            <circle cx="75" cy="130" r="8" fill="#3AA8A0"/><text x="75" y="133" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">2</text>
            <circle cx="110" cy="110" r="8" fill="#D4A55A"/><text x="110" y="113" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">3</text>
            <circle cx="130" cy="80" r="8" fill="#4A90D9"/><text x="130" y="83" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">4</text>
            <circle cx="100" cy="52" r="10" fill="#FFD700" stroke="#FFE8A8" strokeWidth="1.5"/><text x="100" y="56" textAnchor="middle" fontSize="8" fill="#5D4E37" fontWeight="700">★</text>
            <path d="M50 165 L75 130 L110 110 L130 80 L100 52" fill="none" stroke="#D4A55A" strokeWidth="1.5" strokeDasharray="4 3" opacity=".5"/>
          </svg>
        </div>
      ),
    },
    {
      title:"Meet Lumi, Your Guide",
      desc:"Lumi is your AI companion on this journey. Tap 'Ask Lumi' in any lesson to get personalized explanations, ask questions, and get instant answers — like having a private tutor.",
      visual:(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <Lumi size={100} mood="excited" level={3} animate/>
          <div style={{display:"flex",gap:16,marginTop:8}}>
            <div style={{textAlign:"center"}}><Lumi size={40} mood="happy" level={1}/><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:"4px 0 0"}}>Beginner</p></div>
            <div style={{textAlign:"center"}}><Lumi size={40} mood="happy" level={3}/><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:"4px 0 0"}}>Level 3</p></div>
            <div style={{textAlign:"center"}}><Lumi size={40} mood="excited" level={5}/><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:"4px 0 0"}}>Level 5</p></div>
          </div>
          <p style={{color:C.textDim,fontSize:11,fontFamily:C.font,marginTop:4}}>Lumi evolves as you level up!</p>
        </div>
      ),
    },
    {
      title:"Learn, Practice, Prove It",
      desc:"Each lesson has three phases: read the content, ask Lumi questions, then prove your understanding in practice mode. Score 70% or higher to earn your Altitude Rating and unlock the next lesson.",
      visual:(
        <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:240,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(74,186,120,.08)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(74,186,120,.15)"}}>
            <span style={{fontSize:20}}>📖</span><div><p style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>Read</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font,margin:0}}>Learn the concepts</p></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(212,165,90,.08)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(212,165,90,.15)"}}>
            <span style={{fontSize:20}}>💬</span><div><p style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>Ask Lumi</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font,margin:0}}>Get instant help</p></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(58,168,160,.08)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(58,168,160,.15)"}}>
            <span style={{fontSize:20}}>✍️</span><div><p style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>Practice</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font,margin:0}}>Prove your skills</p></div>
          </div>
        </div>
      ),
    },
    {
      title:"Earn Your Altitude",
      desc:"Your practice score earns an Altitude Rating. Push for Summit to show true mastery — or retry anytime to improve your rating.",
      visual:(
        <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:220,margin:"0 auto"}}>
          {[{icon:"🏔️",label:"Summit",pct:"90%+",color:"#FFD700",bg:"rgba(255,215,0,.1)"},{icon:"⛰️",label:"Ridge",pct:"70-89%",color:"#4ABA78",bg:"rgba(74,186,120,.08)"},{icon:"◈",label:"Treeline",pct:"50-69%",color:"#E8B84B",bg:"rgba(232,184,75,.06)"},{icon:"△",label:"Base Camp",pct:"<50%",color:"#C87858",bg:"rgba(200,120,88,.06)"}].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:r.bg,borderRadius:10,padding:"8px 12px"}}>
              <span style={{fontSize:18,width:28,textAlign:"center"}}>{r.icon}</span>
              <div style={{flex:1}}><span style={{color:r.color,fontSize:13,fontWeight:700,fontFamily:C.font}}>{r.label}</span></div>
              <span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{r.pct}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title:"Stay Sharp Every Day",
      desc:"Complete Daily Challenges to keep your streak alive, read today's AI News simplified by Lumi, and use 6 AI Tools to practice real-world skills. You've got everything you need.",
      visual:(
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",maxWidth:280,margin:"0 auto"}}>
          {[{icon:<Icon type="challenge" size={28} color="#F0A878"/>,label:"Daily Challenge",bg:"rgba(232,128,96,.08)"},{icon:<Icon type="news" size={28} color="#E8C878"/>,label:"AI News",bg:"rgba(212,165,90,.06)"},{icon:<Icon type="tools" size={28} color="#68D8C8"/>,label:"6 AI Tools",bg:"rgba(58,168,160,.06)"}].map((f,i)=>(
            <div key={i} style={{background:f.bg,borderRadius:14,padding:"14px 18px",textAlign:"center",width:80}}>
              <div style={{marginBottom:6}}>{f.icon}</div>
              <p style={{color:C.textMuted,fontSize:10,fontFamily:C.font,margin:0}}>{f.label}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];
  const s=slides[step];
  const isLast=step===slides.length-1;
  return(
    <div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid} 60%,${C.bgDark})`,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <Stars/>
      {/* Progress dots */}
      <div style={{display:"flex",gap:6,justifyContent:"center",padding:"20px 0 0",position:"relative",zIndex:10}}>
        {slides.map((_,i)=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i<=step?C.gold:"rgba(255,255,255,.1)",transition:"all .4s"}}/>)}
      </div>
      {/* Skip */}
      {!isLast&&<button onClick={onComplete} style={{position:"absolute",top:20,right:20,background:"none",border:"none",color:C.textDim,fontSize:13,fontFamily:C.font,zIndex:10}}>{T.skip}</button>}
      {/* Content */}
      <div className="fu" key={step} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 30px",position:"relative",zIndex:5}}>
        <div style={{marginBottom:24}}>{s.visual}</div>
        <h2 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,textAlign:"center",margin:"0 0 10px"}}>{s.title}</h2>
        <p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,textAlign:"center",lineHeight:1.7,maxWidth:320,margin:0}}>{s.desc}</p>
      </div>
      {/* Navigation */}
      <div style={{padding:"0 24px 30px",position:"relative",zIndex:10,paddingBottom:"max(30px,env(safe-area-inset-bottom))"}}>
        <Btn v={isLast?"gold":"teal"} onClick={()=>{
          try{SFX.play("click")}catch(e){}
          if(isLast){onComplete()}else{setStep(step+1)}
        }}>
          {isLast?"Start My Journey →":"Next"}
        </Btn>
        {step>0&&!isLast&&<button onClick={()=>setStep(step-1)} style={{display:"block",width:"100%",background:"none",border:"none",color:C.textDim,fontSize:13,fontFamily:C.font,marginTop:12,textAlign:"center"}}>{T.back}</button>}
      </div>
    </div>
  );
};

// MAIN APP
export default function AIFluent(){
  const [loading,setLoading]=useState(true);const [user,setUser]=useState(null);const [profile,setProfile]=useState(null);const [progress,setProgress]=useState([]);
  const [screen,setScreen]=useState("map");const [activeLoc,setActiveLoc]=useState(null);
  const [showTutorial,setShowTutorial]=useState(()=>!localStorage.getItem("ai_fluent_tutorial_seen"));
  const [theme,setThemeState]=useState(()=>getTheme());
  const toggleTheme=()=>{const nt=theme==="dark"?"light":"dark";setTheme(nt);setThemeState(nt);C={...THEMES[nt]}};
  const [lang,setLangState]=useState(()=>getLang());
  const changeLang=(l)=>{setLang(l);setLangState(l);T={...UI[l]}};

  useEffect(()=>{
    // Failsafe: if loading takes more than 5 seconds, force it to stop
    const timeout=setTimeout(()=>{setLoading(false);console.warn("Loading timeout — forced to sign-in screen")},5000);
    const init=async()=>{
      try{
        const s=await db.getSession();
        if(s?.user){
          setUser(s.user);
          try{setProfile(await db.getProfile(s.user.id))}catch(e){console.warn("Profile load failed:",e);setProfile({})}
          try{setProgress(await db.getProgress(s.user.id))}catch(e){console.warn("Progress load failed:",e);setProgress([])}
        }
      }catch(e){console.error("Init error:",e)}
      clearTimeout(timeout);
      setLoading(false);
    };
    init();
    const{data}=db.onAuth(async(ev,s)=>{if(ev==="SIGNED_IN"&&s?.user){setUser(s.user);try{setProfile(await db.getProfile(s.user.id))}catch(e){setProfile({})}try{setProgress(await db.getProgress(s.user.id))}catch(e){setProgress([])}}else if(ev==="SIGNED_OUT"){setUser(null);setProfile(null);setProgress([])}});
    return()=>{clearTimeout(timeout);data?.subscription?.unsubscribe?.()};
  },[]);

  const refresh=async()=>{
    if(!user)return;
    setProfile(await db.getProfile(user.id));
    setProgress(await db.getProgress(user.id));
    // Record streak activity when user completes something
    Streak.recordActivity();
  };
  const out=async()=>{await db.signOut();setUser(null);setProfile(null);setProgress([])};
  const goMap=()=>{setScreen("map");setActiveLoc(null)};

  // Record streak on initial load if user is active
  useEffect(()=>{if(user) Streak.check()},[user]);

  if(loading)return<><style>{getCss()}</style><div onClick={()=>setLoading(false)} style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",cursor:"pointer"}}><Stars/><Lumi size={56} mood="happy" level={1} animate/><p style={{color:C.textMuted,fontSize:14,fontFamily:"'Nunito',sans-serif",marginTop:14}}>{T.loading}</p><p style={{color:C.textDim,fontSize:11,fontFamily:"'Nunito',sans-serif",marginTop:20}}>{T.tapIfStuck}</p></div></>;
  if(!user)return<><style>{getCss()}</style><AuthScreen/></>;
  if(profile&&!profile.onboarded)return<><style>{getCss()}</style><Onboarding uid={user.id} onDone={refresh}/></>;
  if(showTutorial&&user)return<><style>{getCss()}</style><Tutorial onComplete={()=>{localStorage.setItem("ai_fluent_tutorial_seen","1");setShowTutorial(false)}}/></>;
  if(screen==="location"&&activeLoc)return<><style>{getCss()}</style><LocView locId={activeLoc} uid={user.id} progress={progress} profile={profile} onBack={goMap} onComplete={refresh}/></>;
  if(screen==="news")return<><style>{getCss()}</style><NewsView uid={user.id} onBack={goMap}/></>;
  if(screen==="tools")return<><style>{getCss()}</style><ToolsView uid={user.id} onBack={goMap}/></>;
  if(screen==="challenge")return<><style>{getCss()}</style><ChallengeView uid={user.id} onBack={goMap}/></>;
  if(screen==="achievements")return<><style>{getCss()}</style><AchievementsView profile={profile} progress={progress} onBack={goMap}/></>;
  if(screen==="profile")return<><style>{getCss()}</style><ProfileView profile={profile} progress={progress} onBack={goMap} onSignOut={out} onToggleTheme={toggleTheme} onChangeLang={changeLang}/></>;

  return<><style>{getCss()}</style>
    <MilestoneCheck progress={progress}/>
    <WorldMap profile={profile} progress={progress} onToggleTheme={toggleTheme} onChangeLang={changeLang}
    onOpenLoc={(id)=>{setActiveLoc(id);setScreen("location")}}
    onOpenNews={()=>setScreen("news")}
    onOpenTools={()=>setScreen("tools")}
    onOpenChallenge={()=>setScreen("challenge")}
    onOpenAchievements={()=>setScreen("achievements")}
    onOpenProfile={()=>setScreen("profile")}
  /></>;
}