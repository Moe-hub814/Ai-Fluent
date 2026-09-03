import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./lib/supabase";

// One-time migration of legacy (pre-rebrand) storage keys
try{Object.keys(localStorage).filter(k=>k.startsWith("ai_fluent_")).forEach(k=>{const nk="lumicamp_"+k.slice(10);if(localStorage.getItem(nk)===null)localStorage.setItem(nk,localStorage.getItem(k))})}catch{/* storage unavailable */}

// LUMICAMP — SUMMIT EDITION v2
// Live news, practice mode, daily challenges, achievements

// THEME SYSTEM
const THEMES = {
  dark: {
    skyTop:"#0B1A2E",skyMid:"#132D4A",skyBot:"#1A4060",
    mountain:"#1E3348",mountainLight:"#2A4560",snow:"#E8F0F8",
    trail:"#D4A55A",trailGlow:"#FFE0A0",trailDark:"#8A7040",
    bgDark:"#0A1420",bgCard:"#0F1E30",bgCardLight:"#142838",
    border:"rgba(255,255,255,0.07)",borderGold:"rgba(212,165,90,0.3)",
    text:"#E8EEF4",textMuted:"#8AA0B8",textDim:"#7A92A8",
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
    text:"#1A2A3A",textMuted:"#4A6070",textDim:"#5C7384",
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
let _theme = localStorage.getItem("lumicamp_theme") || "dark";
let C = {...THEMES[_theme]};
const setTheme = (t) => { _theme = t; C = {...THEMES[t]}; localStorage.setItem("lumicamp_theme", t) };
const getTheme = () => _theme;

// MOBILE DETECTION
const _isNative=(typeof window!=="undefined")&&!!(window.Capacitor?.isNativePlatform?.());

const BOTTOM_SAFE=_isNative?48:0;
const TOP_SAFE=_isNative?28:0;
const SYNC_QUEUE_KEY="lumicamp_sync_queue";
const LOCAL_PROGRESS_KEY="lumicamp_local_progress";
const MAX_SYNC_QUEUE=200;

const getLocalProgress=()=>{try{return JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY)||"[]")}catch{return[]}};
const setLocalProgress=(rows)=>{try{localStorage.setItem(LOCAL_PROGRESS_KEY,JSON.stringify(rows))}catch(e){console.warn("Local progress save failed",e)}};
// Normalise a progress row from any source (DB, local cache, old sync queue) so
// unlock checks (`path_id` + numeric `lesson_index`) always work.
const normProgress=(p)=>({...p,path_id:p.path_id??p.node_id,lesson_index:Number(p.lesson_index??p.lesson_id)});
// Union of the DB copy and what this device already knows. A completion that
// exists locally but hasn't reached Supabase yet (offline, slow, failed write)
// must never disappear from the UI — that is what locked lesson 2 for testers.
// Later `completed_at` wins per (path, lesson); higher score is kept.
const mergeProgress=(...lists)=>{
  const byKey=new Map();
  for(const list of lists){for(const raw of list||[]){
    if(!raw)continue;const p=normProgress(raw);if(p.path_id==null||Number.isNaN(p.lesson_index))continue;
    const k=`${p.path_id}:${p.lesson_index}`;const prev=byKey.get(k);
    if(!prev){byKey.set(k,p);continue}
    const newer=(p.completed_at||"")>=(prev.completed_at||"")?p:prev;
    byKey.set(k,{...prev,...newer,score:Math.max(prev.score??0,p.score??0)});
  }}
  return[...byKey.values()];
};
// Pull from Supabase and merge with the local cache; on any failure keep local.
const loadProgress=async(uid,current)=>{
  let remote=[];try{remote=await db.getProgress(uid)}catch(e){console.warn("Progress load failed:",e)}
  const merged=mergeProgress(getLocalProgress(),current,remote);setLocalProgress(merged);return merged;
};
const getSyncQueue=()=>{try{return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)||"[]")}catch{return[]}};
const setSyncQueue=(rows)=>{try{localStorage.setItem(SYNC_QUEUE_KEY,JSON.stringify(rows))}catch(e){console.warn("Sync queue save failed",e)}};

// LANGUAGE SYSTEM
const LANGS={en:{name:"English",flag:"🇺🇸",dir:"ltr"},ar:{name:"العربية",flag:"🇸🇦",dir:"rtl"},fr:{name:"Français",flag:"🇫🇷",dir:"ltr"}};
const UI={
  en:{greeting:h=>h<12?"Good morning":h<17?"Good afternoon":"Good evening",map:"← Map",back:"← Back",signIn:"Sign In",signUp:"Sign Up",email:"Email",password:"Password",startClimbing:"Start Climbing",createAccount:"Create Account",checkEmail:"Check your email!",weSentLink:"We sent a link to",loading:"Loading Lumicamp...",tapIfStuck:"Tap anywhere if stuck",startPractice:"Start Practice →",completeLesson:"Complete lesson →",nextQ:"Next Question →",seeResults:"See My Results →",retry:"Retry for a higher rating →",tryAgain:"Try Again",reviewFirst:"← Review the lesson first",need70:"You need 70% or higher to pass this lesson",points:"Points earned",shareRating:"📤 Share My Rating",shareProgress:"📤 Share My Progress",askLumi:"Ask Lumi",questionsHelp:"Questions? Ask Lumi",guideHere:"Your guide is here to help",peoplAsk:"People often ask...",lumiGuide:"Lumi — Guide",hint:"Hint",why:"Why?",check:"Check Answer",lumiFeedback:"Lumi's feedback",lumiReviewing:"Lumi is reviewing...",submit:"Submit for Review",dailyChallenge:"Daily Challenge",keepStreak:"Keep your streak",aiNews:"AI News",live:"Live",newsDesc:"Today's AI stories, simplified by Lumi",newsSearch:"Lumi is searching for today's AI news...",aiTools:"AI Tools",toolsDesc:"Guided step-by-step workflows",profile:"Profile",dayStreak:"Day Streak",lessonsDone:"Lessons Done",lumiChats:"Lumi Chats",achievements:"Achievements",altRatings:"Altitude Ratings Earned",summit:"Summit",ridge:"Ridge",graded:"Graded",learningPaths:"Learning Paths",calendar:"Activity Calendar",bestStreak:"Best streak",freezes:"remaining",lightMode:"☀️ Light Mode",darkMode:"🌙 Dark Mode",signOut:"Sign Out",language:"Language",lessons:"lessons",sections:"sections",practice:"practice",completed:"Completed",submitChallenge:"Submit Challenge ⚡",challengeComplete:"🔥 Challenge complete!",challengeDesc:"Complete today's challenge to keep your streak alive",simpleVersion:"The simple version",whyMatters:"Why it matters to you",askAboutThis:"Ask Lumi about this",explainPlain:"Get it explained in plain language",claimSummit:"🏔️ Claim Summit Rating!",claimRidge:"⛰️ Claim Ridge Rating!",completeBtn:"✦ Complete Lesson",next:"Next",skip:"Skip",startJourney:"Start My Journey →",altitude:"Altitude",toSummit:"to summit",tapExplore:"Tap to explore",tools6:"6 tools",typeAnswer:"Type your answer...",practiceOf:"of",backToLesson:"← Back to lesson",lesson:"Lesson",nextUp:"Next up",continueLesson:"Continue",lessonDone:"Lesson complete!",pathDone:"You've completed every lesson here",nextStop:"Next stop on the trail",backToMap:"Back to the map →",lessonsLeft:"lessons left",oneLessonLeft:"1 lesson left",inProgress:"In progress",challengeDone:"Done for today ✓",comeBackTomorrow:"New challenge tomorrow",updatedNews:"Updating…",cachedNews:"Showing the latest stories we found — refreshing in the background",newsFrom:"From",refreshNews:"Refresh",yourOwnExample:"Now it's your turn",hintTitle:"Stuck? Think about…",exampleTitle:"Example",tooSimilar:"That looks a lot like the question itself. Try writing it in your own words, with your own details.",summitTitle:"You made it to The Summit!",summitSub:"Every lesson on the mountain is complete. That puts you ahead of most people on the planet when it comes to using AI.",summitStats:"Your climb",summitNext:"Where to next?",summitDaily:"Daily Challenge",summitDailyDesc:"A fresh exercise every day keeps your skills sharp",summitTools:"AI Tools",summitToolsDesc:"Put what you learned to work on real tasks",summitNews:"AI News",summitNewsDesc:"Stay current — AI changes every week",summitImprove:"Improve a rating",summitImproveDesc:"Re-take lessons below Summit rating",summitShare:"Share your summit",summitCert:"Certificate coming soon",contentUpdated:"Content reviewed",lockedReason:"Finish the previous stop to unlock",copy:"Copy",copied:"Copied ✓",share:"Share",recentResults:"Recent results",savedNote:"Saved on this device",openResult:"Open",clearRecent:"Clear",yourAnswers:"Your answers",newResult:"New",toolsBack:"← Tools",recommended:"Recommended for you",challengeHistory:"Your challenge history",climbingToward:"Climbing toward",dataAccount:"Data & account",exportData:"Export my data",resetProgress:"Reset my progress",deleteAccount:"Delete my account",resetConfirm:"This erases every lesson, score and streak on your account. Type RESET to confirm.",deleteConfirm:"This permanently deletes your account and all your data. Type DELETE to confirm.",exported:"Exported ✓ (copied to clipboard)",textSize:"Text size",textNormal:"Normal",textLarge:"Large",reduceMotion:"Reduce motion",whatIsLumicamp:"Lumicamp teaches you to actually use AI — short lessons, real practice, in plain language. Free.",skipAhead:"Already comfortable with AI?",skipAheadDesc:"You can skim the lessons — the practice at the end still unlocks the next stop."},
  ar:{greeting:h=>h<12?"صباح الخير":h<17?"مساء الخير":"مساء الخير",map:"الخريطة →",back:"رجوع →",signIn:"تسجيل الدخول",signUp:"إنشاء حساب",email:"البريد الإلكتروني",password:"كلمة المرور",startClimbing:"ابدأ التسلق",createAccount:"إنشاء حساب",checkEmail:"!تحقق من بريدك",weSentLink:"أرسلنا رابطاً إلى",loading:"...جاري تحميل Lumicamp",tapIfStuck:"اضغط في أي مكان إذا توقف",startPractice:"← ابدأ التمرين",completeLesson:"← أكمل الدرس",nextQ:"← السؤال التالي",seeResults:"← عرض نتائجي",retry:"← أعد المحاولة لتقييم أعلى",tryAgain:"حاول مرة أخرى",reviewFirst:"راجع الدرس أولاً →",need70:"تحتاج 70% أو أعلى لاجتياز هذا الدرس",points:"النقاط المكتسبة",shareRating:"📤 شارك تقييمي",shareProgress:"📤 شارك تقدمي",askLumi:"اسأل لومي",questionsHelp:"أسئلة؟ اسأل لومي",guideHere:"مرشدك هنا للمساعدة",peoplAsk:"...الناس يسألون عادة",lumiGuide:"لومي — المرشد",hint:"تلميح",why:"لماذا؟",check:"تحقق من الإجابة",lumiFeedback:"ملاحظات لومي",lumiReviewing:"...لومي يراجع",submit:"أرسل للمراجعة",dailyChallenge:"التحدي اليومي",keepStreak:"حافظ على سلسلتك",aiNews:"أخبار الذكاء",live:"مباشر",newsDesc:"أخبار الذكاء اليوم مبسطة بواسطة لومي",newsSearch:"...لومي يبحث عن أخبار اليوم",aiTools:"أدوات الذكاء",toolsDesc:"سير عمل موجه خطوة بخطوة",profile:"الملف الشخصي",dayStreak:"أيام متتالية",lessonsDone:"دروس مكتملة",lumiChats:"محادثات لومي",achievements:"الإنجازات",altRatings:"تقييمات الارتفاع المكتسبة",summit:"القمة",ridge:"التلال",graded:"مُقيَّم",learningPaths:"مسارات التعلم",calendar:"تقويم النشاط",bestStreak:"أفضل سلسلة",freezes:"متبقية",lightMode:"☀️ وضع فاتح",darkMode:"🌙 وضع داكن",signOut:"تسجيل الخروج",language:"اللغة",lessons:"دروس",sections:"أقسام",practice:"تمارين",completed:"مكتمل",submitChallenge:"أرسل التحدي ⚡",challengeComplete:"!🔥 التحدي مكتمل",challengeDesc:"أكمل تحدي اليوم للحفاظ على سلسلتك",simpleVersion:"النسخة المبسطة",whyMatters:"لماذا يهمك هذا",askAboutThis:"اسأل لومي عن هذا",explainPlain:"احصل على شرح بلغة بسيطة",claimSummit:"🏔️ !احصل على تقييم القمة",claimRidge:"⛰️ !احصل على تقييم التلال",completeBtn:"✦ أكمل الدرس",next:"التالي",skip:"تخطي",startJourney:"← ابدأ رحلتي",altitude:"الارتفاع",toSummit:"إلى القمة",tapExplore:"اضغط للاستكشاف",tools6:"6 أدوات",typeAnswer:"...اكتب إجابتك",practiceOf:"من",backToLesson:"العودة للدرس →",lesson:"درس",nextUp:"التالي",continueLesson:"متابعة",lessonDone:"!اكتمل الدرس",pathDone:"لقد أكملت كل الدروس هنا",nextStop:"المحطة التالية على المسار",backToMap:"← العودة إلى الخريطة",lessonsLeft:"دروس متبقية",oneLessonLeft:"درس واحد متبقٍ",inProgress:"قيد التقدم",challengeDone:"✓ تم اليوم",comeBackTomorrow:"تحدٍ جديد غدًا",updatedNews:"…جارٍ التحديث",cachedNews:"نعرض أحدث الأخبار التي وجدناها — يتم التحديث في الخلفية",newsFrom:"من",refreshNews:"تحديث",yourOwnExample:"الآن دورك",hintTitle:"…محتار؟ فكّر في",exampleTitle:"مثال",tooSimilar:"يبدو هذا مشابهًا جدًا للسؤال نفسه. حاول كتابته بكلماتك وتفاصيلك الخاصة.",summitTitle:"!لقد وصلت إلى القمة",summitSub:"اكتملت كل دروس الجبل. هذا يضعك في مقدمة معظم الناس في استخدام الذكاء الاصطناعي.",summitStats:"رحلتك",summitNext:"إلى أين بعد ذلك؟",summitDaily:"التحدي اليومي",summitDailyDesc:"تمرين جديد كل يوم يبقي مهاراتك حادة",summitTools:"أدوات الذكاء الاصطناعي",summitToolsDesc:"طبّق ما تعلمته على مهام حقيقية",summitNews:"أخبار الذكاء الاصطناعي",summitNewsDesc:"ابقَ على اطلاع — الذكاء الاصطناعي يتغير كل أسبوع",summitImprove:"حسّن تقييمًا",summitImproveDesc:"أعد الدروس التي لم تصل فيها إلى تقييم القمة",summitShare:"شارك قمتك",summitCert:"الشهادة قريبًا",contentUpdated:"تمت مراجعة المحتوى",lockedReason:"أكمل المحطة السابقة لفتح هذه",copy:"نسخ",copied:"✓ تم النسخ",share:"مشاركة",recentResults:"النتائج الأخيرة",savedNote:"محفوظ على هذا الجهاز",openResult:"فتح",clearRecent:"مسح",yourAnswers:"إجاباتك",newResult:"جديد",toolsBack:"الأدوات →",recommended:"موصى به لك",challengeHistory:"سجل تحدياتك",climbingToward:"تتسلق نحو",dataAccount:"البيانات والحساب",exportData:"تصدير بياناتي",resetProgress:"إعادة ضبط تقدمي",deleteAccount:"حذف حسابي",resetConfirm:"سيمسح هذا كل الدروس والدرجات والسلاسل في حسابك. اكتب RESET للتأكيد.",deleteConfirm:"سيحذف هذا حسابك وكل بياناتك نهائيًا. اكتب DELETE للتأكيد.",exported:"(تم التصدير ✓ (نُسخ إلى الحافظة",textSize:"حجم النص",textNormal:"عادي",textLarge:"كبير",reduceMotion:"تقليل الحركة",whatIsLumicamp:"لوميكامب يعلّمك استخدام الذكاء الاصطناعي فعليًا — دروس قصيرة وتمارين حقيقية بلغة بسيطة. مجانًا.",skipAhead:"مرتاح مع الذكاء الاصطناعي بالفعل؟",skipAheadDesc:"يمكنك تصفح الدروس سريعًا — التمرين في النهاية لا يزال يفتح المحطة التالية."},
  fr:{greeting:h=>h<12?"Bonjour":h<17?"Bon après-midi":"Bonsoir",map:"← Carte",back:"← Retour",signIn:"Se connecter",signUp:"S'inscrire",email:"E-mail",password:"Mot de passe",startClimbing:"Commencer",createAccount:"Créer un compte",checkEmail:"Vérifiez votre e-mail !",weSentLink:"Nous avons envoyé un lien à",loading:"Chargement de Lumicamp...",tapIfStuck:"Appuyez si bloqué",startPractice:"Commencer →",completeLesson:"Terminer →",nextQ:"Suivante →",seeResults:"Voir mes résultats →",retry:"Réessayer →",tryAgain:"Réessayer",reviewFirst:"← Revoir la leçon",need70:"70% minimum pour réussir",points:"Points gagnés",shareRating:"📤 Partager ma note",shareProgress:"📤 Partager mes progrès",askLumi:"Demander à Lumi",questionsHelp:"Questions ? Demandez à Lumi",guideHere:"Votre guide est là",peoplAsk:"Questions fréquentes...",lumiGuide:"Lumi — Guide",hint:"Indice",why:"Pourquoi ?",check:"Vérifier",lumiFeedback:"Avis de Lumi",lumiReviewing:"Lumi examine...",submit:"Soumettre",dailyChallenge:"Défi du jour",keepStreak:"Gardez votre série",aiNews:"Actu IA",live:"Direct",newsDesc:"Actus IA simplifiées par Lumi",newsSearch:"Lumi cherche les actus...",aiTools:"Outils IA",toolsDesc:"Workflows guidés",profile:"Profil",dayStreak:"Jours consécutifs",lessonsDone:"Leçons faites",lumiChats:"Discussions",achievements:"Réussites",altRatings:"Notes d'altitude",summit:"Sommet",ridge:"Crête",graded:"Noté",learningPaths:"Parcours",calendar:"Calendrier d'activité",bestStreak:"Meilleure série",freezes:"restantes",lightMode:"☀️ Mode clair",darkMode:"🌙 Mode sombre",signOut:"Se déconnecter",language:"Langue",lessons:"leçons",sections:"sections",practice:"exercices",completed:"Terminé",submitChallenge:"Soumettre ⚡",challengeComplete:"🔥 Défi terminé !",challengeDesc:"Complétez le défi pour garder votre série",simpleVersion:"Version simple",whyMatters:"Pourquoi c'est important",askAboutThis:"Demander à Lumi",explainPlain:"Explication simple",claimSummit:"🏔️ Note Sommet !",claimRidge:"⛰️ Note Crête !",completeBtn:"✦ Terminer",next:"Suivant",skip:"Passer",startJourney:"Commencer →",altitude:"Altitude",toSummit:"vers le sommet",tapExplore:"Appuyez pour explorer",tools6:"6 outils",typeAnswer:"Tapez votre réponse...",practiceOf:"sur",backToLesson:"← Retour à la leçon",lesson:"Leçon",nextUp:"À suivre",continueLesson:"Continuer",lessonDone:"Leçon terminée !",pathDone:"Vous avez terminé toutes les leçons ici",nextStop:"Prochaine étape du sentier",backToMap:"Retour à la carte →",lessonsLeft:"leçons restantes",oneLessonLeft:"1 leçon restante",inProgress:"En cours",challengeDone:"Fait pour aujourd'hui ✓",comeBackTomorrow:"Nouveau défi demain",updatedNews:"Mise à jour…",cachedNews:"Voici les dernières actualités trouvées — actualisation en arrière-plan",newsFrom:"De",refreshNews:"Actualiser",yourOwnExample:"À vous de jouer",hintTitle:"Bloqué ? Pensez à…",exampleTitle:"Exemple",tooSimilar:"Cela ressemble beaucoup à la question elle-même. Essayez avec vos propres mots et vos propres détails.",summitTitle:"Vous avez atteint le Sommet !",summitSub:"Toutes les leçons de la montagne sont terminées. Vous êtes désormais en avance sur la plupart des gens pour utiliser l'IA.",summitStats:"Votre ascension",summitNext:"Et maintenant ?",summitDaily:"Défi quotidien",summitDailyDesc:"Un nouvel exercice chaque jour pour rester affûté",summitTools:"Outils IA",summitToolsDesc:"Appliquez ce que vous avez appris à de vraies tâches",summitNews:"Actu IA",summitNewsDesc:"Restez à jour — l'IA change chaque semaine",summitImprove:"Améliorer une note",summitImproveDesc:"Refaites les leçons sous la note Sommet",summitShare:"Partager votre sommet",summitCert:"Certificat bientôt disponible",contentUpdated:"Contenu révisé",lockedReason:"Terminez l'étape précédente pour débloquer",copy:"Copier",copied:"Copié ✓",share:"Partager",recentResults:"Résultats récents",savedNote:"Enregistré sur cet appareil",openResult:"Ouvrir",clearRecent:"Effacer",yourAnswers:"Vos réponses",newResult:"Nouveau",toolsBack:"← Outils",recommended:"Recommandé pour vous",challengeHistory:"Votre historique de défis",climbingToward:"Objectif",dataAccount:"Données et compte",exportData:"Exporter mes données",resetProgress:"Réinitialiser ma progression",deleteAccount:"Supprimer mon compte",resetConfirm:"Cela efface toutes les leçons, notes et séries de votre compte. Tapez RESET pour confirmer.",deleteConfirm:"Cela supprime définitivement votre compte et toutes vos données. Tapez DELETE pour confirmer.",exported:"Exporté ✓ (copié dans le presse-papiers)",textSize:"Taille du texte",textNormal:"Normale",textLarge:"Grande",reduceMotion:"Réduire les animations",whatIsLumicamp:"Lumicamp vous apprend à vraiment utiliser l'IA — leçons courtes, pratique réelle, langage simple. Gratuit.",skipAhead:"Déjà à l'aise avec l'IA ?",skipAheadDesc:"Vous pouvez survoler les leçons — l'exercice final débloque quand même l'étape suivante."},
};
let _lang=localStorage.getItem("lumicamp_lang")||"en";
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
const setLang=(l)=>{_lang=l;T={...UI[l]};localStorage.setItem("lumicamp_lang",l);document.documentElement.dir=LANGS[l].dir;document.documentElement.lang=l};
const getLang=()=>_lang;
const isRTL=()=>LANGS[_lang]?.dir==="rtl";

// Translation cache for lesson content translated by Claude
const TCache={
  _k:"lumicamp_tcache",
  _g(){try{return JSON.parse(localStorage.getItem(this._k)||"{}")}catch{return{}}},
  get(lang,key){return this._g()[`${lang}:${key}`]},
  set(lang,key,data){const c=this._g();c[`${lang}:${key}`]=data;try{localStorage.setItem(this._k,JSON.stringify(c))}catch(e){console.warn("Cache full, clearing old translations");localStorage.removeItem(this._k)}},
};

// Language selector component
const LangSelector=({onChangeLang,compact})=>{
  const[open,setOpen]=useState(false);const cur=LANGS[getLang()];
  return(<div style={{position:"relative",zIndex:50}}>
    <button aria-label={`${T.language}: ${LANGS[getLang()]?.name}`} aria-haspopup="listbox" onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:compact?4:6,background:C.mode==="dark"?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,borderRadius:compact?10:12,padding:compact?"6px 10px":"8px 14px",fontSize:compact?12:14,fontFamily:C.font,color:C.text}}>
      <span>{cur.flag}</span>{!compact&&<span style={{fontSize:13,fontWeight:600}}>{cur.name}</span>}
    </button>
    {open&&<div style={{position:"absolute",top:"110%",[isRTL()?"left":"right"]:0,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:6,zIndex:100,minWidth:160,boxShadow:"0 8px 30px rgba(0,0,0,.3)"}}>
      {Object.entries(LANGS).map(([code,lang])=>(
        <button key={code} aria-label={LANGS[code].name} onClick={()=>{onChangeLang(code);setOpen(false)}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",borderRadius:10,border:"none",background:code===getLang()?"rgba(212,165,90,.1)":"transparent",textAlign:"left"}}>
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

// Bump this whenever lesson text is reviewed against the current AI landscape
// (see docs/CONTENT-FRESHNESS.md). It is shown on every location page so
// learners can see the material isn't stale.
const CONTENT_REVIEWED={en:"Sep 2026",ar:"سبتمبر 2026",fr:"sept. 2026"};
const LESSONS = {
  basics: [
    {title:"What Is AI, Really?",sections:[{h:"Think of AI like a smart assistant",body:"AI is a computer program that learns from examples — like how you learned to recognize dogs by seeing lots of dogs.\n\nIt doesn't \"think\" like a human. It's an incredibly fast pattern-matching machine that's read most of the internet."},{h:"What can AI do today?",body:"AI can: write text, create images, translate languages, summarize documents, answer questions, and brainstorm.\n\nCAN'T do: truly understand emotions, be creative like humans, or reliably do complex math."},{h:"The key concept: prompts",body:"What you type to AI is called a \"prompt.\" Better prompt = better response.\n\nLike giving directions — \"go somewhere nice\" vs \"take me to the Italian restaurant on Oak Street.\""}],questions:["Give me a real-life example","Difference between AI and a regular app?","Is AI going to take my job?"],practice:[{type:"multiple_choice",q:"What is a 'prompt' in AI?",opts:["A computer virus","What you type to tell AI what to do","An AI's name","A type of software"],correct:1,explain:"A prompt is your instruction to AI — the better you describe what you want, the better the result."},{type:"multiple_choice",q:"Which of these can AI do TODAY?",opts:["Feel emotions like humans","Write text and create images","Think independently","Replace all human jobs"],correct:1,explain:"AI excels at writing, images, translation, and summarization."},{type:"free_response",own:true,q:"Pick a real email YOU need to write this week (to a boss, landlord, teacher, client — anyone). Write the prompt you would give AI to draft it.",hint:"Who is it to, and what do they need to know? What outcome do you want? How should it sound to that person?",example:"Prompt: \"Draft a short, friendly email to my landlord, Mr. Patel, letting him know the kitchen tap has been dripping since Monday. Ask if a plumber can come this week — I'm home after 5pm. Keep it polite and under 100 words.\""}]},
    {title:"How AI Actually Learns",sections:[{h:"The training process",body:"AI learns by studying millions of examples. Imagine showing a child thousands of pictures of cats and dogs until they can tell them apart — AI works similarly but with billions of examples.\n\nThis process is called \"training.\" Companies like Anthropic, OpenAI, and Google train their AI models on enormous amounts of text from books, websites, and documents."},{h:"What are AI models?",body:"An AI \"model\" is like a finished student that's already been trained. When you use ChatGPT or Claude, you're talking to a model that finished its training months ago.\n\nDifferent models are good at different things. Some are fast but basic (like Haiku). Others are slower but brilliant (like Opus). It's like choosing between a quick text and a thoughtful letter."},{h:"Why AI makes mistakes",body:"AI doesn't actually \"know\" things — it predicts what words should come next based on patterns it learned. Sometimes those patterns lead to wrong answers.\n\nThis is called \"hallucination\" — when AI confidently says something incorrect. Always double-check important facts, especially numbers, dates, and medical information."}],questions:["Why does AI sometimes make things up?","What's the difference between ChatGPT and Claude?","How long does it take to train an AI?"],practice:[{type:"multiple_choice",q:"What is an AI 'hallucination'?",opts:["When AI creates images","When AI confidently says something incorrect","When AI gets confused","When AI stops working"],correct:1,explain:"Hallucination is when AI generates confident-sounding but incorrect information. Always verify important facts."},{type:"multiple_choice",q:"Why do different AI models exist?",opts:["Companies can't agree on one","Different models have different speed/quality tradeoffs","Only one model actually works","They're all the same inside"],correct:1,explain:"Models range from fast & cheap (Haiku) to slow & brilliant (Opus). You pick based on your needs."},{type:"free_response",own:true,q:"Think of a time you (or someone you know) trusted a source that turned out to be wrong. Using that story, explain to a friend why AI answers need checking.",hint:"What made the wrong source feel trustworthy? Where might AI feel the same way? What's your friend's simple rule going forward?",example:"\"Remember when the GPS confidently sent us down that closed road? It sounded sure, but it was working from an old map. AI is the same — confident, usually right, but it can't tell when its map is out of date. So for anything that matters, we double-check.\""}]},
    {title:"Choosing the Right AI Tool",sections:[{h:"The big players",body:"The main AI assistants you'll encounter — each is a strong all-rounder, so think in terms of where each one lives and what it's known for:\n\n• ChatGPT (by OpenAI) — the one most people have heard of; broad features, huge app ecosystem\n• Claude (by Anthropic) — known for careful writing, analysis, long documents, and following detailed instructions\n• Gemini (by Google) — built into Gmail, Docs, Android and Google Search\n• Copilot (by Microsoft) — built into Word, Excel, Teams and Windows\n\nHeads-up: this list shifts every few months. New models leapfrog each other constantly, and no single tool stays \"the best\" for long. The skills in this course — writing clear prompts, checking facts, giving good context — work in all of them."},{h:"Free vs paid",body:"Most AI tools have free tiers that are perfectly useful for beginners. Paid versions ($20/month typically) give you faster responses, smarter models, and more usage.\n\nStart free. Upgrade when you find yourself hitting limits or wanting better quality."},{h:"When to use which tool",body:"A simple rule: start with the AI that's already inside the apps you use every day.\n\nLive in Gmail / Google Docs → Gemini\nLive in Outlook / Word / Excel → Copilot\nLong writing, analysis, or careful instructions → Claude or ChatGPT\nCreating images → the image tool built into ChatGPT or Gemini, Midjourney, or Adobe Firefly\n\nThe best tool is the one you'll actually use. Pick one and learn it well before trying others — most of what you learn transfers."}],questions:["Which AI tool is best for beginners?","Is the free version good enough?","Can I use multiple AI tools?"],practice:[{type:"multiple_choice",q:"What's the best strategy for a beginner choosing AI tools?",opts:["Buy the most expensive one","Use all of them equally","Pick one, learn it well, then explore others","Wait for the perfect tool to come out"],correct:2,explain:"Mastering one tool first gives you transferable skills. Most AI tools work similarly once you understand prompting."},{type:"free_response",own:true,q:"Look at YOUR last three days. Name the one task AI could take off your plate, which tool you'd use for it, and why that tool fits your situation.",hint:"Which task ate the most time? Which apps do you already live in — Gmail, Outlook, Docs, Word? What would make you actually open the tool again tomorrow?",example:"\"I spend Tuesday mornings rewriting the same client update. I'd use Gemini because our whole team is on Google Docs, so I can draft right inside the doc without copying anything around.\""}]},
    {title:"AI Safety and Privacy",sections:[{h:"What happens to what you type",body:"When you type something into an AI tool, your text gets sent to the company's servers. Most companies say they don't read your conversations, but policies vary.\n\nRule of thumb: Don't share passwords, social security numbers, confidential business secrets, or deeply private medical information with AI tools."},{h:"AI bias and limitations",body:"AI learned from internet text, which includes biases. It might give different advice based on names that suggest different genders or ethnicities.\n\nAlways think critically about AI responses, especially when it comes to medical advice, legal matters, financial decisions, or anything with real consequences."},{h:"How to use AI responsibly",body:"The golden rules:\n\n1. Don't pass off AI writing as entirely your own in school or work without disclosure\n2. Verify facts before sharing them\n3. Don't use AI to create misleading content\n4. Remember AI makes mistakes — you're the final editor\n5. Keep sensitive personal info out of AI chats"}],questions:["Is it safe to put my personal info in AI?","Can AI be biased?","Should I tell people when I use AI?"],practice:[{type:"multiple_choice",q:"Which of these should you NEVER share with an AI chatbot?",opts:["A recipe you want to improve","Your social security number","A work email you need help writing","A question about history"],correct:1,explain:"Never share sensitive personal data like SSN, passwords, or financial account numbers with AI tools."},{type:"multiple_choice",q:"What should you do with important facts AI gives you?",opts:["Trust them completely — AI is always right","Ignore them — AI is always wrong","Verify them from a reliable source","Share them immediately on social media"],correct:2,explain:"AI can hallucinate. Always verify important facts, especially medical, legal, or financial information."},{type:"free_response",own:true,q:"Describe a situation from YOUR work or life where someone might be tempted to paste sensitive information into an AI tool. What would you say to them, and what safer option would you suggest?",hint:"What exactly is in that data? Who could be affected if it leaked? Is there a way to get the same help without the sensitive parts?",example:"\"At the clinic, a colleague wanted to paste a patient's full record into a chatbot to summarize it. I suggested she remove the name, date of birth and ID first, then paste only the treatment notes. Same summary, none of the risk.\""}]}
  ],
  writing: [
    {title:"Your First AI Email",sections:[{h:"Why AI and email are perfect together",body:"Most people spend 2+ hours/day on email. AI cuts that in half — not writing FOR you, but giving strong drafts you refine.\n\nThe result: clearer emails, faster turnaround, less staring at a blank screen."},{h:"The 3-part prompt formula",body:"Every great AI email prompt has three parts:\n\n1. GOAL — What you need, in one line: \"Draft a short email asking for Friday off\"\n2. CONTEXT — Who it's for and the facts that matter: \"To my manager, Dana. I've covered my shifts, and I'll finish the report Thursday.\"\n3. TONE — How it should sound: formal, friendly, direct, apologetic\n\nPut these together and AI gives remarkably good drafts on the first try.\n\nA note on \"You are a professional email writer…\": you'll see this advice everywhere, but telling today's AI to play a role does little on its own — research shows it can even make answers slightly worse. Spend those words on real context instead. Facts beat costumes."},{h:"Example — from vague to great",body:"Vague: \"Write an email to my boss about Friday.\"\n\nStrong: \"GOAL: Draft a short email requesting this Friday off. CONTEXT: To my manager Dana. I've already swapped my shift with Sam, and the weekly report will be done Thursday. TONE: Friendly and professional, 4-5 sentences.\"\n\nThe second prompt gives AI everything a good assistant would ask you for. That's the whole trick."}],questions:["Show me a before/after","What if it sounds robotic?","Help me write one now"],practice:[{type:"multiple_choice",q:"What are the 3 parts of a great email prompt?",opts:["Subject, Body, Signature","Goal, Context, Tone","From, To, Message","Draft, Edit, Send"],correct:1,explain:"Goal (what you need), Context (who it's for and the facts that matter), and Tone (how it should sound)."},{type:"free_response",own:true,q:"Choose a real thank-you, follow-up, or request email YOU owe someone. Using GOAL → CONTEXT → TONE, write the full prompt you'd give AI.",hint:"Goal: what's the one thing this email must achieve? Context: what facts does AI need that only you know? Tone: how does this person expect you to sound?",example:"\"GOAL: Draft a thank-you email after a job interview. CONTEXT: To Priya, the hiring manager at Northwind. We spoke Tuesday about the marketing coordinator role and she mentioned their spring campaign. TONE: Warm, confident, 4-5 sentences.\""}]},
    {title:"Writing Blog Posts & Articles with AI",sections:[{h:"AI as your writing partner",body:"AI won't write a perfect blog post for you — but it's incredible at breaking through writer's block, creating outlines, and drafting sections you can refine.\n\nThink of AI as a fast-typing assistant who has read every blog on the internet. They know the formulas, but you bring the expertise and personality."},{h:"The outline-first method",body:"The most effective approach:\n\n1. Ask AI to create an outline for your topic\n2. Review and adjust the outline\n3. Ask AI to draft each section one at a time\n4. Edit each section in your voice\n5. Ask AI to write the intro and conclusion last\n\nThis gives you far better results than asking AI to write the entire post at once."},{h:"Making AI writing sound like YOU",body:"The secret: give AI examples of your writing style. Say \"Match this tone:\" and paste a paragraph you've written before.\n\nAlso: always add your own stories, opinions, and specific examples. AI provides structure, you provide soul."}],questions:["How do I make AI match my writing style?","Can AI write long-form content?","Should I edit AI writing?"],practice:[{type:"free_response",own:true,q:"Pick a topic YOU could write a post about — a hobby, your job, something you learned recently. Write a prompt asking AI for an outline, including who it's for and how it should sound.",hint:"Who exactly would read this? What do they already know? What do you want them to do or feel at the end?",example:"\"Create an outline for a 700-word blog post: 'What I learned in my first year of beekeeping.' Readers are curious beginners in cities. Friendly, honest tone — include the mistakes I made. Five sections, ending with three tips.\""}]},
    {title:"Social Media Writing with AI",sections:[{h:"Each platform has a voice",body:"LinkedIn = professional thought leadership\nTwitter/X = sharp, witty, concise\nInstagram = visual storytelling with captions\nFacebook = conversational and community-focused\n\nAI can match any of these voices — you just need to tell it which one."},{h:"The hook formula",body:"The first line is everything in social media. Tell AI:\n\n\"Write a LinkedIn post that starts with a surprising statistic or counterintuitive statement about [topic]. The hook should make someone stop scrolling.\"\n\nGreat hooks: surprising numbers, personal stories, bold opinions, and \"here's what nobody tells you\" angles."}],questions:["How do I get more engagement?","Can AI write hashtags?","How often should I post?"],practice:[{type:"free_response",own:true,q:"Write a prompt for a social post about something that actually happened to YOU recently — at work, at home, anywhere. Choose the platform and ask for a scroll-stopping opening line.",hint:"Which platform, and what's its voice? What's the surprising or honest part of your story? Who do you want to react to it?",example:"\"Write a LinkedIn post about how I missed a deadline last week because I said yes to everything. Start with a bold, honest opening line. Reflective, not preachy. End with one question for readers. Under 150 words.\""}]},
    {title:"AI for Reports and Documents",sections:[{h:"From messy notes to polished reports",body:"AI's superpower for reports: turning your brain dump into organized, professional writing.\n\nJust paste your rough notes and say: \"Turn these notes into a structured report with sections, an executive summary, and clear recommendations.\""},{h:"The revision workflow",body:"First draft → ask AI to make it more concise\nSecond pass → ask AI to strengthen the opening\nThird pass → ask AI to check for jargon and simplify\n\nEach pass improves the writing. You're directing AI like a writing coach, not just accepting the first output."}],questions:["How do I format a professional report?","Can AI help with technical writing?","What about citations?"],practice:[{type:"free_response",own:true,q:"Think of messy notes YOU have right now — from a meeting, a class, a project, a to-do list. Write a prompt that turns them into a clean document for a specific reader.",hint:"Who will read the result, and what do they care about? What format do they expect? What must not get lost from your notes?",example:"\"Turn these notes into a one-page update for my landlord about the shared garden project. Sections: what's done, what's next, costs so far. Plain, friendly tone. Keep every number exactly as written.\""}]}
  ],
  images: [
    {title:"Creating AI Images",sections:[{h:"No design skills needed",body:"AI image tools let anyone create professional visuals by describing what they want. No drawing talent, no Photoshop experience, no design degree required."},{h:"The 4-part image prompt",body:"1. SUBJECT — What's in the image (a coffee shop, a mountain, a person working)\n2. STYLE — Photo, illustration, watercolor, 3D render\n3. MOOD — Warm, dramatic, playful, minimal\n4. DETAILS — Lighting (soft morning light), colors (earth tones), angle (overhead view)"}],questions:["Help me create a logo","Best free image tool?","Can AI create real photos?"],practice:[{type:"free_response",own:true,q:"Describe an image YOU actually need — for a business, an event, a gift, your desk. Write the full prompt with all 4 parts.",hint:"Subject: what's in it? Style: photo, illustration, watercolor? Mood: how should someone feel looking at it? Details: lighting, colors, angle?",example:"\"A cozy corner bookshop café at golden hour (SUBJECT), soft watercolor illustration (STYLE), warm and inviting (MOOD), morning light through the window, cream and forest-green palette, seen from the doorway (DETAILS).\""}]},
    {title:"AI Image Tools Compared",sections:[{h:"The main tools",body:"ChatGPT & Gemini (built-in image generation) — easiest start; you describe, it draws, you ask for changes in plain English\nMidjourney — known for artistic, polished results\nAdobe Firefly — built for professional/commercial use, trained on licensed content\nStable Diffusion / open models — free, runs on your own computer, most customizable\nCanva AI — for non-designers who need quick marketing graphics\n\nNames and features change fast here — the 4-part prompt from the last lesson works in every one of them."},{h:"Choosing the right one",body:"Need it fast and easy? → the image tool inside the chatbot you already use (ChatGPT or Gemini)\nWant a polished, artistic look? → Midjourney\nUsing it commercially? → Adobe Firefly (safest for copyright)\nOn a budget? → an open model or Canva's free tier\n\nFor most beginners, start inside the chatbot you already have — no new account needed."}],questions:["Which tool is free?","Is AI art copyrighted?","Can I use AI images for my business?"],practice:[{type:"multiple_choice",q:"Which AI image tool is safest for commercial/business use?",opts:["Midjourney","Stable Diffusion","Adobe Firefly","Any of them"],correct:2,explain:"Adobe Firefly was trained only on licensed content, making it the safest for commercial use without copyright concerns."}]},
    {title:"Advanced Prompting for Images",sections:[{h:"Style references",body:"Instead of generic descriptions, reference specific styles:\n\n\"in the style of a Pixar movie poster\"\n\"editorial photography for Vogue magazine\"\n\"flat vector illustration like Dropbox's website\"\n\"watercolor painting with visible brushstrokes\"\n\nThe more specific your style reference, the more predictable the result."},{h:"Negative prompts",body:"Tell AI what NOT to include:\n\n\"No text, no watermarks, no people\"\n\"Avoid dark colors, nothing scary\"\n\nThis is just as important as saying what you want. Without it, AI might add unwanted elements."}],questions:["How do I get consistent brand images?","Can AI edit existing photos?","What resolution do I get?"],practice:[{type:"free_response",own:true,q:"Write an image prompt for something YOU would put in front of real people — a profile background, a poster, a website header. Include a style reference and what to exclude.",hint:"What existing look do you admire, and how would you name it? What would ruin the image if it showed up (text, clutter, the wrong colors)?",example:"\"Abstract background for a therapist's website: soft gradient in sage green and sand, editorial minimalist style like a wellness magazine cover, gentle out-of-focus shapes. No text, no people, no harsh contrast.\""}]}
  ],
  business: [
    {title:"AI Tools That Save Hours",sections:[{h:"Start with what wastes time",body:"Don't try to AI-ify everything at once. Pick the ONE task that wastes the most time and automate that first. Common time-wasters: email, meeting notes, report writing, data entry, scheduling.\n\nAutomate one thing well → save 5-10 hours/week."},{h:"The 80/20 rule for AI",body:"80% of your AI productivity gains will come from 20% of the tools. For most businesses, that 20% is:\n\n1. Email drafting (saves 30 min/day)\n2. Meeting summaries (saves 15 min/meeting)\n3. Document creation (saves 1-2 hours/week)\n\nMaster these three before exploring anything else."}],questions:["What should I automate first?","Are these tools safe?","How much time saved?"],practice:[{type:"multiple_choice",q:"What's the best approach to start using AI in business?",opts:["AI-ify everything at once","Pick ONE time-wasting task and automate it first","Wait until AI is more mature","Only use AI for emails"],correct:1,explain:"Starting with one task lets you learn without overwhelm and see immediate savings."}]},
    {title:"AI for Customer Communication",sections:[{h:"Faster responses, better quality",body:"AI can draft customer emails, chat responses, and FAQ answers in seconds. The key is creating templates that AI fills in with context.\n\nExample: \"Using this customer complaint about [issue], draft a response that: 1) acknowledges their frustration, 2) explains what happened, 3) offers a specific solution, 4) ends warmly.\""},{h:"Building an AI response library",body:"Create a document with your 10 most common customer scenarios and the ideal response for each. Then when a new situation arises, tell AI: \"Based on our response style in these examples, draft a reply for this new situation.\"\n\nThis ensures consistency across your whole team."}],questions:["Can AI handle angry customers?","How do I maintain my brand voice?","Is AI replacing customer service?"],practice:[{type:"free_response",own:true,q:"Think of a complaint YOUR business (or a business you know well) actually gets. Write a prompt asking AI to draft the reply using the 4-step formula.",hint:"What is the customer really upset about? What honestly happened? What can you actually offer? What tone fits your brand?",example:"\"A regular customer says her weekly grocery delivery was late twice this month. Draft a reply that acknowledges her frustration, explains we changed delivery partners, offers a 20% discount on next week's order, and ends warmly. Casual, human tone, under 120 words.\""}]},
    {title:"AI for Meetings and Notes",sections:[{h:"Never take notes manually again",body:"AI meeting tools like Otter.ai, Fireflies, and Fathom can join your calls, transcribe everything, and create summaries automatically.\n\nAfter the meeting, you get: key decisions, action items with owners, and a searchable transcript."},{h:"The post-meeting prompt",body:"Even without a transcription tool, you can paste rough notes into AI and ask:\n\n\"Turn these meeting notes into: 1) a 3-sentence summary, 2) a list of action items with who's responsible, 3) key decisions that were made, 4) open questions for next meeting.\"\n\nThis turns 20 minutes of note cleanup into 30 seconds."}],questions:["Best AI meeting tools?","Can AI join my Zoom calls?","What about privacy?"],practice:[{type:"free_response",own:true,q:"Use notes from a real meeting or conversation YOU had recently (change names if needed). Write a prompt that turns them into minutes a colleague who missed it could act on.",hint:"What did you decide? Who owns what? What's still open? What format does your team actually read?",example:"\"Turn these notes into minutes: 'talked about the school fundraiser, Lena will book the hall, we still need a date, Omar thinks May is too late, budget $800 max.' Format: 2-line summary, decisions, action items with owners, open questions.\""}]},
    {title:"Measuring AI's Impact on Your Business",sections:[{h:"Track your time savings",body:"Before using AI, estimate how long tasks take. After one month of AI usage, measure again. Most businesses see:\n\nEmail: 40-60% faster\nReports: 50-70% faster\nContent creation: 60-80% faster\nResearch: 30-50% faster\n\nTrack these numbers — they justify the cost of AI tools to your boss or yourself."},{h:"Calculating ROI",body:"Simple formula: Hours saved per week × your hourly rate = weekly value\n\nExample: 8 hours saved × $50/hour = $400/week saved = $20,800/year\n\nMost AI subscriptions cost $20-50/month. That's a 30x+ return on investment for even modest time savings."}],questions:["How do I prove AI's value to my boss?","What metrics should I track?","How long until I see results?"],practice:[{type:"free_response",own:true,q:"Calculate the ROI of AI tools for YOUR actual work. Estimate your own hours saved per week, a realistic hourly value for your time, and the tool cost — then show your math and say whether it's worth it.",hint:"Which tasks would really get faster, and by how much? What's an honest value of an hour of your time? What would you do with the hours you get back?",example:"\"I write ~6 client updates a week, 30 min each → AI drafts cut that to 10 min = 2 hours saved. My time is worth about $40/hour → $80/week ≈ $4,000/year. Tool cost $20/month = $240/year. Worth it, even if I only save half that.\""}]}
  ],
  data: [
    {title:"AI + Spreadsheets",sections:[{h:"No more formula headaches",body:"AI can write spreadsheet formulas for you. Just describe what you need:\n\n\"Write a Google Sheets formula that calculates the percentage change between column B and column C for each row.\"\n\nAI gives you the formula ready to paste. No more Googling VLOOKUP syntax."},{h:"Getting started",body:"You can use AI with spreadsheets in two ways:\n\n1. Copy-paste: Describe what you need to ChatGPT/Claude, get the formula, paste it in\n2. Built-in AI: Google Sheets and Excel both now have AI assistants built right in\n\nMethod 1 works today with any AI tool. Method 2 is getting better every month."}],questions:["AI with Google Sheets?","Can AI create charts?","What about complex formulas?"],practice:[{type:"free_response",own:true,q:"Think of a spreadsheet YOU use (or wish you had) — a budget, a roster, a tracker. Write a prompt asking AI for the formulas you'd need, naming your actual columns.",hint:"What are your column names? What should each formula calculate, in plain words? Are there edge cases (blanks, limits, thresholds)?",example:"\"My Google Sheet has columns: Item (A), Cost (B), Category (C), Date (D). Write formulas for: total spent this month, total per category, and a cell that shows 'Over budget' if the monthly total passes $1,500.\""}]},
    {title:"Analyzing Data with AI",sections:[{h:"Turn numbers into stories",body:"AI is remarkably good at looking at data and finding the story in it. Paste a table of numbers and ask:\n\n\"What trends do you see? What's unusual? What should I pay attention to?\"\n\nAI will spot patterns that might take you hours to find manually."},{h:"The data analysis prompt template",body:"\"Here is [type of data] from [time period]. Please:\n1. Identify the top 3 trends\n2. Flag anything unusual or concerning\n3. Compare to [benchmark/previous period]\n4. Suggest 2-3 actions based on the data\n5. Present findings as bullet points a non-technical person would understand\""}],questions:["Can AI read my Excel files?","How accurate is AI analysis?","What kind of data works best?"],practice:[{type:"free_response",own:true,q:"Find some real numbers from YOUR life — steps per day, monthly spending, sales, grades, anything over time. Paste them and write a prompt asking AI to analyze them using the lesson's template.",hint:"What period do the numbers cover? What would 'normal' look like? What decision would you make differently depending on what AI finds?",example:"\"Here are my electricity bills for 8 months: Jan $140, Feb $135, Mar $110, Apr $95, May $90, Jun $130, Jul $170, Aug $165. Identify the top trends, flag anything unusual, compare summer to winter, and suggest 2-3 ways to lower the bill. Keep it non-technical.\""}]},
    {title:"AI for Data Cleaning",sections:[{h:"The boring work AI does best",body:"Data cleaning — fixing typos, standardizing formats, removing duplicates — is tedious but necessary. AI handles it instantly.\n\nPaste messy data and say: \"Clean this data: standardize the date format to MM/DD/YYYY, fix obvious typos in company names, and flag any duplicate entries.\""},{h:"Common cleaning tasks",body:"AI excels at:\n• Standardizing addresses (St → Street, Apt → Apartment)\n• Fixing inconsistent capitalization\n• Converting between date formats\n• Splitting full names into first/last columns\n• Removing extra spaces and special characters\n• Categorizing free-text responses into groups"}],questions:["Can AI handle large datasets?","What about sensitive data?","Best tools for data cleaning?"],practice:[{type:"free_response",own:true,q:"Describe messy data YOU deal with — contacts, inventory, addresses, sign-up forms. Write a prompt that tells AI exactly how you want it cleaned and standardized.",hint:"What inconsistencies show up in your data? What is the one correct format for each column? What should AI flag rather than silently change?",example:"\"Clean this volunteer sign-up list: capitalize names as First Last, write phone numbers as (555) 123-4567, convert all dates to MM/DD/YYYY, and flag (don't delete) rows that look like duplicates.\""}]}
  ],
  daily: [
    {title:"AI in Everyday Life",sections:[{h:"AI is already around you",body:"Autocorrect, Netflix recommendations, Google Maps traffic, spam filters — all AI. You've been using AI for years without knowing it.\n\nNow you can actively direct AI to help with specific tasks, like having a personal assistant available 24/7 who works for free."},{h:"Quick wins for today",body:"Things you can try right now:\n\n• Ask AI to plan meals for the week based on what's in your fridge\n• Have AI explain a medical bill or insurance document in plain English\n• Ask AI to create a workout plan based on your goals and available equipment\n• Use AI to draft a complaint letter to a company\n• Ask AI to help you understand a school assignment or homework"}],questions:["Plan meals for my family","Help with a medical term","Best AI apps?"],practice:[{type:"free_response",own:true,q:"Name one annoying task from YOUR week — a real one. Write a detailed prompt asking AI to help, including your constraints and exactly what you want back.",hint:"What makes this task annoying? What limits do you have (time, budget, people, tools)? What would a perfect answer look like on your screen?",example:"\"Every Sunday I plan school lunches for two picky kids (no nuts, one hates cheese). Create a 5-day lunch plan with a shopping list grouped by supermarket aisle. Each lunch under 10 minutes to pack.\""}]},
    {title:"AI for Health and Wellness",sections:[{h:"Your AI wellness assistant",body:"AI can't replace a doctor, but it's great for:\n\n• Explaining medical terms in plain English\n• Creating personalized meal plans based on dietary needs\n• Building exercise routines for your fitness level\n• Tracking habits and suggesting improvements\n• Translating doctor's instructions into actionable steps"},{h:"Important limitations",body:"NEVER use AI to:\n• Diagnose medical conditions\n• Replace prescribed medication advice\n• Make emergency health decisions\n\nAI is a research assistant, not a doctor. Always verify health information with a medical professional."}],questions:["Can AI create a meal plan?","Is AI health advice reliable?","Best health AI apps?"],practice:[{type:"free_response",own:true,q:"Write a prompt for a meal plan that fits YOUR real life — your preferences, allergies, cooking skill, budget, and how much time you honestly have.",hint:"Who are you feeding? What do you never want to eat? What's your weeknight time limit? What's the budget?",example:"\"Create a 5-day dinner plan for two adults, vegetarian, one is allergic to sesame. Beginner cook, 30 minutes max on weeknights, budget $60 for the week. Include a single shopping list.\""}]},
    {title:"AI for Travel and Planning",sections:[{h:"Your personal travel agent",body:"AI is incredible at travel planning. It can create detailed itineraries, find hidden gems, estimate budgets, and even help you learn key phrases in the local language.\n\nThe key: be specific about your travel style. \"Plan a trip to Japan\" gets generic results. \"Plan a 7-day Japan trip for a couple who loves street food and hates tourist traps, budget $150/day\" gets amazing results."},{h:"The perfect trip prompt",body:"\"I'm traveling to [destination] for [duration]. My interests are [activities]. My budget is [amount] per day. I prefer [style: luxury/budget/mid-range]. I'm traveling with [who]. Please create a day-by-day itinerary including specific restaurant names, estimated costs, and travel tips locals would know.\""}],questions:["Can AI book flights?","How accurate are AI travel recommendations?","Help me plan a trip"],practice:[{type:"free_response",own:true,q:"Pick a trip YOU actually want to take. Write the full prompt using the lesson's template, with your real interests, budget, travel style, and companions.",hint:"Where and for how long? What do you love — and hate — when traveling? What's your daily budget? Who's coming?",example:"\"I'm going to Lisbon for 3 days in October with my mom (70, walks slowly). We love food markets and history, hate nightlife. Budget €120/day for both. Day-by-day plan with specific restaurants, short walking distances, and tips locals would know.\""}]},
    {title:"AI for Learning and Personal Growth",sections:[{h:"AI as your personal tutor",body:"AI can explain any concept at exactly your level. The magic phrase: \"Explain this like I'm [your level].\"\n\n\"Explain quantum computing like I'm 10\" → simple analogy\n\"Explain quantum computing like I'm a CS student\" → technical detail\n\"Explain quantum computing like I'm a CEO\" → business implications"},{h:"Building a learning habit",body:"Use AI to:\n\n1. Create a study plan for any topic\n2. Quiz you on what you've learned\n3. Explain concepts you don't understand\n4. Summarize long articles or books\n5. Connect new concepts to things you already know\n\nAI makes self-education faster than any other time in history. The only limit is your curiosity."}],questions:["Can AI help me learn a language?","How do I study with AI?","Best learning prompts?"],practice:[{type:"free_response",own:true,q:"Choose something YOU have wanted to learn for a while. Write a prompt asking AI for a 2-week beginner plan that fits your schedule and how you learn best.",hint:"What's the topic and where are you starting from? How many minutes a day, realistically? Do you learn by reading, watching, or doing?",example:"\"Create a 2-week beginner plan to learn basic Spanish for a trip. I know zero Spanish, have 20 minutes a day on the train, and learn best by listening and speaking. Include a short daily task and one weekend review.\""}]}
  ],
};

// REMOTE LESSON OVERRIDES — rows in public.lesson_overrides are merged over the
// built-in lessons so a dated sentence can be fixed from the Supabase dashboard
// without a deploy. Cached locally so the fix shows on the very next open.
const OVERRIDES_KEY="lumicamp_lesson_overrides";
const applyLessonOverrides=(rows)=>{
  let n=0;
  for(const r of rows||[]){const l=LESSONS[r.path_id]?.[Number(r.lesson_index)];if(!l||!r.lesson||typeof r.lesson!=="object")continue;Object.assign(l,r.lesson);n++}
  return n;
};
try{applyLessonOverrides(JSON.parse(localStorage.getItem(OVERRIDES_KEY)||"[]"))}catch{}
const refreshLessonOverrides=async()=>{try{const rows=await db.getLessonOverrides();if(Array.isArray(rows)){localStorage.setItem(OVERRIDES_KEY,JSON.stringify(rows));applyLessonOverrides(rows)}}catch{}};

// PERSONALISATION — the three onboarding answers finally do something.
// goals → which tools are recommended, which daily challenge you get, and
// which stop Lumi points you to next; experience → tone of Lumi's guidance.
const GOAL_TOOLS={"Better writing":["email","social","prompt"],"Creating images":["prompt"],"Business growth":["summarize","email","resume"],"Staying informed":["summarize","study"],"Automating tasks":["prompt","summarize"],"Just exploring":["prompt","study"]};
const GOAL_PATHS={"Better writing":"writing","Creating images":"images","Business growth":"business","Staying informed":"data","Automating tasks":"business","Just exploring":"daily"};
const getPersona=(profile,user)=>{
  let local={};try{local=JSON.parse(localStorage.getItem(`lumicamp_onboarding_answers_${user?.id||"anon"}`)||"{}")}catch{}
  const goals=(profile?.goals&&profile.goals.length?profile.goals:local.goals)||[];
  return{role:profile?.role||local.role||"",exp:profile?.experience_level||local.experience_level||"",goals:Array.isArray(goals)?goals:[]};
};
const recommendedTools=(persona)=>{const set=[];for(const g of persona.goals||[])for(const t of GOAL_TOOLS[g]||[])if(!set.includes(t))set.push(t);return set.slice(0,3)}; // 3 max — "everything is recommended" means nothing is
const isExperienced=(persona)=>/deeper|occasionally/i.test(persona.exp||"");

// A path counts as complete only when EVERY one of its lessons has been passed
// (score >= 70 is enforced before a completion row is ever written). Having
// finished just one lesson used to mark the whole path done and unlock the
// next location on the map.
const pathLessonCount=(pathId)=>(LESSONS[pathId]||[]).length;
const isPathComplete=(progress,pathId)=>{
  const n=pathLessonCount(pathId);if(!n)return false;
  const done=new Set((progress||[]).filter(p=>p.path_id===pathId).map(p=>Number(p.lesson_index)));
  for(let i=0;i<n;i++)if(!done.has(i))return false;
  return true;
};
const completedPaths=(progress)=>Object.keys(LESSONS).filter(id=>isPathComplete(progress,id));


// DAILY CHALLENGES
const DAILY_CHALLENGES = [
  {id:"dc1",title:"Write a Better Prompt",desc:"Improve this vague prompt into a specific one",task:"The prompt 'Write me something about dogs' is too vague. Rewrite it to get a much better result from AI. Be specific about what kind of content, for what audience, and in what format.",category:"prompts"},
  {id:"dc2",title:"Simplify AI Jargon",desc:"Explain an AI term in everyday words",task:"Explain what 'machine learning' means as if you're telling a friend who's never heard of it. Use an everyday analogy.",category:"basics"},
  {id:"dc3",title:"AI for Your Morning",desc:"Find 3 ways AI could help your morning routine",task:"Think about your typical morning. Describe 3 specific ways AI tools could save you time or make things easier. Be practical — things you could actually try tomorrow.",category:"daily"},
  {id:"dc4",title:"Craft an Image Prompt",desc:"Describe an image for AI to create",task:"Write a detailed prompt for an AI image generator to create a professional-looking cover photo for a LinkedIn profile of someone who works in [your industry]. Include style, mood, colors, and composition.",category:"images"},
  {id:"dc5",title:"Email Challenge",desc:"Draft a tricky email with AI",task:"Use the 3-part prompt formula (Goal, Context, Tone) to write a prompt that would help AI draft an email declining a meeting invitation politely while suggesting an alternative time.",category:"writing"},
  {id:"dc6",title:"Data Detective",desc:"Ask AI to analyze information",task:"You have monthly sales numbers: Jan: $12K, Feb: $15K, Mar: $11K, Apr: $18K, May: $22K, Jun: $19K. Write a prompt asking AI to identify the trend and suggest what might explain the pattern.",category:"data"},
  {id:"dc7",title:"AI News Reporter",desc:"Summarize today's top AI story",task:"Find or think of a recent AI development you've heard about. Write a 3-sentence summary that anyone — even your grandmother — could understand. No jargon allowed!",category:"news"},
  {id:"dc8",title:"Fact-Check Lumi",desc:"Catch a confident mistake",task:"Ask any AI chatbot a question about something you know very well (your town, your hobby, your job). Find one detail it got wrong or oversimplified, and write down how you'd verify it. What does this tell you about trusting AI?",category:"basics"},
  {id:"dc9",title:"Shrink a Long Message",desc:"Turn a wall of text into 3 lines",task:"Take a long message, email, or article you received recently. Write the prompt you'd give AI to shrink it to the 3 things you actually need to know — and say who the summary is for.",category:"writing"},
  {id:"dc10",title:"Ask Better Follow-ups",desc:"Improve an answer with one more question",task:"Think of an AI answer that was too generic for you. Write the follow-up question you'd ask to make it specific to your situation — include the missing context you'd add.",category:"prompts"},
  {id:"dc11",title:"Safe to Share?",desc:"Sort information before you paste it",task:"List 3 things from your work or life you might be tempted to paste into an AI tool. For each one, say whether it's safe to share, needs details removed first, or should never go in — and why.",category:"safety"},
  {id:"dc12",title:"Explain It Three Ways",desc:"Use the 'like I'm…' trick",task:"Pick a topic from your job or a hobby. Write three prompts asking AI to explain it 'like I'm 10', 'like I'm a new colleague', and 'like I'm an expert'. Which one would you actually send to someone this week?",category:"daily"},
  {id:"dc13",title:"Weekly Plan in One Prompt",desc:"Plan your week with AI",task:"Write one prompt that would get AI to draft your week: your fixed commitments, the two things that matter most, and how much free time you really have. Ask for the plan in a format you'd actually look at (list, table, calendar).",category:"daily"},
  {id:"dc14",title:"Picture Your Project",desc:"Describe an image for something real",task:"Think of a real thing you're working on (an event, a shop, a class, a gift). Write a 4-part image prompt for it — subject, style, mood, details — and say where the image would actually be used.",category:"images"},
];
// Which bank challenge shows on a given day. Day-of-year over a 14-item bank
// means the same challenge repeats every two weeks — and only when the
// per-day generated challenge (see ChallengeView) is unavailable.
const dayOfYear=(d=new Date())=>Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
const bankChallenge=(d=new Date())=>DAILY_CHALLENGES[dayOfYear(d)%DAILY_CHALLENGES.length];

const challengeDayKey=(d=new Date())=>`lumicamp_challenge_${d.toISOString().slice(0,10)}`;
const isChallengeDoneToday=()=>{try{return !!JSON.parse(localStorage.getItem(challengeDayKey())||"null")}catch{return false}};

// ACHIEVEMENTS
const ACHIEVEMENTS = [
  {id:"first_lesson",name:"First Steps",desc:"Complete your first lesson",icon:"👣",condition:(p)=>p.length>=1},
  {id:"streak_3",name:"Consistent Climber",desc:"Reach a 3-day streak",icon:"🔥",condition:(p,prof)=>Math.max(prof?.current_streak||0,Streak.getData().current||0)>=3},
  {id:"streak_7",name:"Week Warrior",desc:"Reach a 7-day streak",icon:"⚡",condition:(p,prof)=>Math.max(prof?.current_streak||0,Streak.getData().current||0)>=7},
  {id:"five_lessons",name:"Trailblazer",desc:"Complete 5 lessons",icon:"🥾",condition:(p)=>p.length>=5},
  {id:"first_chat",name:"Asked Lumi",desc:"Have your first tutor chat",icon:"💬",condition:(p,prof)=>(prof?.total_tutor_sessions||0)>=1},
  {id:"all_paths",name:"Explorer",desc:"Try lessons from 3 different paths",icon:"🗺️",condition:(p)=>[...new Set(p.map(x=>x.path_id))].length>=3},
  {id:"ten_lessons",name:"Mountaineer",desc:"Complete 10 lessons",icon:"⛰️",condition:(p)=>p.length>=10},
  {id:"summit",name:"Summit Reached",desc:"Complete all learning paths",icon:"🏆",condition:(p)=>completedPaths(p).length>=6},
];

// Custom SVG Icons — Lumicamp branded
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
  {id:"email",iconType:"email",name:"Write an Email",desc:"Professional emails in seconds",color:C.teal,steps:[{q:"What kind?",opts:["Work / Professional","Personal","Complaint","Thank You"]},{q:"Who to?",opts:["My boss","A client","A coworker","A company"]},{q:"Tone?",opts:["Formal","Warm","Direct","Apologetic"]},{q:"About what?",free:true,ph:"e.g. Requesting time off..."}],sys:"Write a concise, natural-sounding email from the details given. Output a subject line, then the body only — no commentary. Leave [square-bracket placeholders] for facts the user did not supply."},
  {id:"prompt",iconType:"prompt",name:"Build a Prompt",desc:"Master the art of talking to AI",color:C.gold,steps:[{q:"Help with?",opts:["Writing","Analyzing","Creative ideas","Problem solving"]},{q:"Detail level?",opts:["Quick","Medium","Thorough","Step-by-step"]},{q:"Describe task:",free:true,ph:"e.g. Plan a marketing campaign..."}],sys:"Generate a ready-to-copy prompt for the user's task using GOAL, CONTEXT, TONE/FORMAT and any constraints. Put the prompt in its own block first, then explain in 3 short bullets why each part works. Do not tell the AI to 'act as' a persona — put real context in instead."},
  {id:"summarize",iconType:"summarize",name:"Summarize Text",desc:"Long docs into key points",color:C.blue,steps:[{q:"Content type?",opts:["Article","Report","Email chain","Contract"]},{q:"What do you need?",opts:["Key takeaways","Action items","Simple explanation","Pros and cons"]},{q:"Paste text:",free:true,ph:"Paste or describe content..."}],sys:"Create a clear concise summary in simple language."},
  {id:"resume",iconType:"resume",name:"Resume Helper",desc:"Stand out from the crowd",color:C.purple,steps:[{q:"What do you need?",opts:["Write a summary","Improve bullet points","Tailor for a job posting","Write a cover letter"]},{q:"Your field?",opts:["Tech / IT","Business / Finance","Healthcare","Education","Creative","Other"]},{q:"Details:",free:true,ph:"Paste your current text or describe what you need..."}],sys:"Improve the user's resume content: strong action verbs, measurable results, concise phrasing tailored to the field given. Keep every fact they supplied; never invent achievements. Help improve their resume content. Be specific, use action verbs, quantify achievements where possible."},
  {id:"social",iconType:"social",name:"Social Post Writer",desc:"Scroll-stopping content",color:C.coral,steps:[{q:"Platform?",opts:["LinkedIn","Twitter/X","Instagram","Facebook"]},{q:"Goal?",opts:["Share expertise","Promote something","Tell a story","Ask for engagement"]},{q:"Topic:",free:true,ph:"e.g. I just learned how to use AI for..."}],sys:"Write an engaging post for the specified platform. Match the platform's tone and best practices. Include relevant hashtag suggestions."},
  {id:"study",iconType:"study",name:"Study Helper",desc:"Learn anything faster",color:C.green,steps:[{q:"What are you studying?",opts:["A concept I don't understand","Preparing for a test","Researching a topic","Learning a new skill"]},{q:"How should I help?",opts:["Explain it simply","Create flashcards","Quiz me","Give me a study plan"]},{q:"The topic:",free:true,ph:"e.g. How does blockchain work..."}],sys:"Explain patiently and encouragingly at the level the request implies. Use analogies and examples. If creating flashcards, format them clearly."},
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
  const LUMI_MSG={
    en:{summit:"INCREDIBLE! You absolutely crushed it!",ridge:"Really solid work! You've got this!",treeline:"Getting there! One more try?",base:"Let's review together and try again!"},
    ar:{summit:"!رائع! لقد أبدعت حقاً",ridge:"!عمل ممتاز! أنت على الطريق الصحيح",treeline:"اقتربت! محاولة أخرى؟",base:"!لنراجع معاً ونحاول مرة أخرى"},
    fr:{summit:"INCROYABLE ! Vous avez tout déchiré !",ridge:"Excellent travail ! Vous assurez !",treeline:"Presque ! Encore un essai ?",base:"Révisons ensemble et réessayons !"},
  };
  const lm=LUMI_MSG[getLang()]||LUMI_MSG.en;
  const config={
    summit:{eyes:"★ ★",mouth:"▽",color:"#FFD700",msg:lm.summit,anim:"celebrate"},
    ridge:{eyes:"◠ ◠",mouth:"▽",color:C.green,msg:lm.ridge,anim:"lumiFloat"},
    treeline:{eyes:"◠ ◠",mouth:"‿",color:"#E8B84B",msg:lm.treeline,anim:"lumiFloat"},
    base:{eyes:"• •",mouth:"○",color:C.red,msg:lm.base,anim:"lumiFloat"},
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

// Clipboard that also works inside the Android WebView and older browsers.
const copyText=async(t)=>{
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(t);return true}}catch{}
  try{const ta=document.createElement("textarea");ta.value=t;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.top="-1000px";document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,t.length);const ok=document.execCommand("copy");document.body.removeChild(ta);return ok}catch{return false}
};
const canShare=()=>typeof navigator!=="undefined"&&!!navigator.share;
const shareText=async(title,text)=>{try{await navigator.share({title,text});return true}catch{return false}};
// Copy button with visible confirmation — a silent copy reads as "nothing happened".
const CopyBtn=({text,v="ghost",label,style:sx={}})=>{const[ok,setOk]=useState(false);return<Btn v={v} style={sx} onClick={async()=>{if(await copyText(text)){setOk(true);SFX.play("click");setTimeout(()=>setOk(false),1600)}}}>{ok?T.copied:(label||"📋 "+T.copy)}</Btn>};
// Tool results are kept on the device so a generated email doesn't vanish the
// moment you tap back. Last 30, newest first.
const TOOL_HISTORY_KEY="lumicamp_tool_history";
const ToolHistory={
  list(){try{return JSON.parse(localStorage.getItem(TOOL_HISTORY_KEY)||"[]")}catch{return[]}},
  add(entry){try{const l=[{id:Date.now().toString(36),at:Date.now(),...entry},...this.list()].slice(0,30);localStorage.setItem(TOOL_HISTORY_KEY,JSON.stringify(l))}catch{}},
  remove(id){try{localStorage.setItem(TOOL_HISTORY_KEY,JSON.stringify(this.list().filter(e=>e.id!==id)))}catch{}},
  clear(){try{localStorage.removeItem(TOOL_HISTORY_KEY)}catch{}},
};
const timeAgo=(ts)=>{const m=Math.round((Date.now()-ts)/60000);if(m<1)return"now";if(m<60)return`${m}m`;const h=Math.round(m/60);if(h<24)return`${h}h`;return`${Math.round(h/24)}d`};

// BACK BUTTON — the app is pure React state, so the Android hardware back
// button (and browser back) used to leave Lumicamp from inside a lesson.
// We keep one sentinel entry in window.history; popping it fires popstate,
// we route "back" to the innermost screen that can handle it, then re-push
// the sentinel. At the map with nothing left to close, native exits the app.
const BackStack={
  handlers:[],
  register(fn){this.handlers.push(fn);return()=>{this.handlers=this.handlers.filter(h=>h!==fn)}},
  handle(){for(let i=this.handlers.length-1;i>=0;i--){try{if(this.handlers[i]())return true}catch{}}return false},
  arm(){try{if(!window.history.state?.lumi)window.history.pushState({lumi:1},"")}catch{}},
};
// Hook: `handler` returns true when it consumed the back press.
const useBackHandler=(handler)=>{const ref=useRef(handler);useEffect(()=>{ref.current=handler;BackStack.arm()});useEffect(()=>BackStack.register(()=>ref.current()),[])};

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
  _key: "lumicamp_streak",
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
  // Server is the source of truth across devices (record_activity RPC writes
  // profiles.current_streak / longest_streak / last_active_date). Adopt the
  // server values when they are ahead of this device's local copy.
  syncFromServer(profile) {
    if (!profile) return this._get();
    const d = this._get();
    const sc = Number(profile.current_streak || 0), sb = Number(profile.longest_streak || 0);
    const today = new Date().toISOString().slice(0, 10);
    const nd = { ...d, best: Math.max(d.best || 0, sb, sc), freezes: d.freezes ?? 1, history: d.history || [] };
    if (sc > (d.current || 0)) { nd.current = sc; nd.lastActive = profile.last_active_date || d.lastActive; }
    if (profile.last_active_date === today && !nd.history.includes(today)) nd.history = [...nd.history, today].slice(-60);
    if (profile.last_active_date === today) nd.todayDone = true;
    this._set(nd);
    return nd;
  },
  // Apply the RPC result ({streak, date}) so the UI matches the server immediately.
  applyServer(res) {
    if (!res || typeof res.streak !== "number") return this._get();
    const d = this._get();
    const nd = { ...d, current: Math.max(d.current || 0, res.streak), best: Math.max(d.best || 0, res.streak) };
    this._set(nd);
    return nd;
  },
  addFreeze() { const d = this._get(); d.freezes = Math.min((d.freezes || 0) + 1, 3); this._set(d); return d },
};

// PROGRESS CELEBRATIONS — milestone screens
const MilestoneCheck = ({progress, onDismiss}) => {
  const MS_TEXT={
    en:[{t:"First Lesson!",m:"You've taken your first step up the mountain.",b:"Keep Climbing →"},{t:"Getting Warmed Up!",m:"3 lessons done! You're building real momentum.",b:"Keep Climbing →"},{t:"Trailblazer!",m:"5 lessons complete! You know more about AI than most people.",b:"Keep Climbing →"},{t:"Mountaineer!",m:"Double digits! 10 lessons shows serious commitment.",b:"Keep Climbing →"},{t:"Almost There!",m:"15 lessons! You can see the summit from here.",b:"Keep Climbing →"},{t:"AI Master!",m:"20 lessons! You understand AI better than 99% of people.",b:"Keep Climbing →"}],
    ar:[{t:"!الدرس الأول",m:"لقد اتخذت خطوتك الأولى على الجبل.",b:"← واصل التسلق"},{t:"!بدأت الحماس",m:"3 دروس مكتملة! أنت تبني زخماً حقيقياً.",b:"← واصل التسلق"},{t:"!رائد الطريق",m:"5 دروس! أنت تعرف عن الذكاء أكثر من معظم الناس.",b:"← واصل التسلق"},{t:"!متسلق الجبال",m:"رقمان! 10 دروس تُظهر التزاماً حقيقياً.",b:"← واصل التسلق"},{t:"!اقتربت",m:"15 درساً! يمكنك رؤية القمة من هنا.",b:"← واصل التسلق"},{t:"!خبير الذكاء",m:"20 درساً! أنت تفهم الذكاء أفضل من 99% من الناس.",b:"← واصل التسلق"}],
    fr:[{t:"Première leçon !",m:"Vous avez fait votre premier pas sur la montagne.",b:"Continuer →"},{t:"Ça chauffe !",m:"3 leçons terminées ! Vous prenez de l'élan.",b:"Continuer →"},{t:"Pionnier !",m:"5 leçons ! Vous en savez plus que la plupart des gens.",b:"Continuer →"},{t:"Alpiniste !",m:"10 leçons, un engagement sérieux !",b:"Continuer →"},{t:"Presque au sommet !",m:"15 leçons ! Vous voyez le sommet d'ici.",b:"Continuer →"},{t:"Maître de l'IA !",m:"20 leçons ! Vous comprenez l'IA mieux que 99% des gens.",b:"Continuer →"}],
  };
  const milestones = [
    { at: 1, icon: "👣", color: C.green },
    { at: 3, icon: "🔥", color: C.gold },
    { at: 5, icon: "🥾", color: C.teal },
    { at: 10, icon: "⛰️", color: C.blue },
    { at: 15, icon: "🌟", color: C.purple },
    { at: 20, icon: "🏔️", color: "#FFD700" },
  ];

  const [show, setShow] = useState(() => {
    const seen = JSON.parse(localStorage.getItem("lumicamp_milestones") || "[]");
    const idx = milestones.findIndex(m => progress.length >= m.at && !seen.includes(m.at));
    return idx >= 0 ? { ...milestones[idx], idx } : null;
  });

  if (!show) return null;
  const txt = (MS_TEXT[getLang()] || MS_TEXT.en)[show.idx];

  const dismiss = () => {
    const seen = JSON.parse(localStorage.getItem("lumicamp_milestones") || "[]");
    localStorage.setItem("lumicamp_milestones", JSON.stringify([...seen, show.at]));
    setShow(null);
    if(onDismiss) onDismiss();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(6,13,26,.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 30 }} onClick={dismiss}>
      <Confetti />
      <div className="fu" style={{ textAlign: "center", maxWidth: 320 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: "celebrate 0.6s ease infinite" }}>{show.icon}</div>
        <h2 style={{ color: show.color, fontSize: 28, fontFamily: C.fontDisplay, fontWeight: 800, margin: "0 0 8px" }}>{txt.t}</h2>
        <p style={{ color: C.textMuted, fontSize: 15, fontFamily: C.font, lineHeight: 1.7, margin: "0 0 8px" }}>{txt.m}</p>
        <p style={{ color: C.textDim, fontSize: 12, fontFamily: C.font, margin: "0 0 24px" }}>{progress.length} {T.lessonsDone}</p>
        <Btn v="gold" onClick={dismiss}>{txt.b}</Btn>
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

      ctx.font="bold 28px 'Nunito',sans-serif";ctx.fillStyle="rgba(212,165,90,.6)";ctx.fillText("MY LUMICAMP JOURNEY",cx,320);
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
    ctx.font="bold 40px 'Quicksand',sans-serif";ctx.fillStyle="#D4A55A";ctx.fillText("Lumicamp",cx,h-170);
    ctx.font="500 22px 'Nunito',sans-serif";ctx.fillStyle="rgba(138,160,184,.5)";ctx.fillText("Your climb to AI fluency",cx,h-130);

    // CTA
    ctx.font="bold 20px 'Nunito',sans-serif";ctx.fillStyle="rgba(212,165,90,.4)";ctx.fillText("Try it free → lumicamp.app",cx,h-70);

    setReady(true);
  },[type,data]);

  const download=()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const link=document.createElement("a");
    link.download=`lumicamp-${type}-${Date.now()}.png`;
    link.href=canvas.toDataURL("image/png");
    link.click();
  };

  const share=async()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    try{
      const blob=await new Promise(r=>canvas.toBlob(r,"image/png"));
      if(navigator.share&&navigator.canShare?.({files:[new File([blob],"lumicamp.png",{type:"image/png"})]})){
        await navigator.share({title:"My Lumicamp Progress",text:type==="altitude"?`I earned ${data.altitude} Rating (${data.pct}%) on Lumicamp!`:`I'm Level ${data.level} on Lumicamp with ${data.lessons} lessons completed!`,files:[new File([blob],"lumicamp.png",{type:"image/png"})]});
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
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{background:${C.bgDark};direction:${isRTL()?'rtl':'ltr'};overflow:hidden;transition:background .3s;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
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
  button{transition:all .15s ease;cursor:pointer}button:active{transform:scale(.97)}button:disabled{cursor:not-allowed}
  @media(hover:hover){button:not(:disabled):hover{filter:brightness(1.07)}}
  input,textarea{transition:border-color .15s ease,box-shadow .15s ease}
  input:focus,textarea:focus{border-color:${C.gold} !important;box-shadow:0 0 0 3px rgba(212,165,90,.18)}
  ::selection{background:rgba(212,165,90,.35)}
  @media(max-width:420px){html{font-size:14px}}
  html[data-text-large="1"] body{zoom:1.15}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}}
  html[data-reduce-motion="1"] *,html[data-reduce-motion="1"] *::before,html[data-reduce-motion="1"] *::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
  button:focus-visible,input:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid ${C.gold};outline-offset:2px}
`;

// Theme toggle button
const ThemeToggle = ({onToggle}) => (
  <button onClick={onToggle} aria-label={C.mode==="dark"?"Switch to light mode":"Switch to dark mode"} title={C.mode==="dark"?"Light mode":"Dark mode"} style={{width:34,height:34,borderRadius:12,background:C.mode==="dark"?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
    {C.mode==="dark"?"☀️":"🌙"}
  </button>
);

const Btn = ({children,onClick,v="gold",disabled,style:sx={}}) => {
  const st={gold:{background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(212,165,90,.3)"},ghost:{background:C.mode==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",color:C.text,border:`1px solid ${C.border}`},teal:{background:`linear-gradient(135deg,${C.teal},#2A8888)`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(58,168,160,.25)"},green:{background:`linear-gradient(135deg,${C.green},${C.greenDark})`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(74,186,120,.25)"},red:{background:`linear-gradient(135deg,${C.red},#A83838)`,color:"#fff",border:"none"}};
  return <button disabled={disabled} onClick={onClick} style={{padding:"13px 24px",borderRadius:14,fontSize:15,fontWeight:700,fontFamily:C.font,opacity:disabled?.5:1,width:"100%",...st[v],...sx}}>{children}</button>;
};
const Dots = () => {const[f,sF]=useState(0);useEffect(()=>{const i=setInterval(()=>sF(n=>(n+1)%4),400);return()=>clearInterval(i)},[]);return<div style={{display:"flex",gap:5,padding:"10px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.gold,opacity:f>i?.8:.2,transition:"opacity .3s"}}/>)}</div>};
const Bub = ({from,text,typing,copyable}) => {const[ok,setOk]=useState(false);return<div className="fu" style={{display:"flex",justifyContent:from==="user"?"flex-end":"flex-start",gap:8,marginBottom:12}}>{from==="lumi"&&!typing&&<div style={{marginTop:4,flexShrink:0}}><Lumi size={26}/></div>}<div style={{maxWidth:"82%",padding:"11px 15px",borderRadius:from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:from==="user"?"rgba(58,168,160,.12)":"rgba(212,165,90,.08)",border:`1px solid ${from==="user"?"rgba(58,168,160,.2)":C.borderGold}`,userSelect:"text",WebkitUserSelect:"text"}}>{typing?<Dots/>:<p style={{color:C.text,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{from==="lumi"?<Md text={text}/>:text}</p>}{copyable&&!typing&&from==="lumi"&&<button onClick={async()=>{if(await copyText(text)){setOk(true);setTimeout(()=>setOk(false),1600)}}} style={{background:"none",border:"none",padding:"6px 0 0",color:C.textDim,fontSize:11,fontFamily:C.font,fontWeight:700}}>{ok?T.copied:"📋 "+T.copy}</button>}</div></div>};
// Star positions are generated once at module load. Generating them inside the
// render made the whole sky jump on every re-render ("the screen shakes").
const STAR_FIELD = Array.from({length:50},()=>({left:`${Math.random()*100}%`,top:`${Math.random()*50}%`,size:Math.random()>.8?2.5:1.5,opacity:.1+Math.random()*.3,dur:`${3+Math.random()*4}s`,delay:`${Math.random()*4}s`}));
const MAP_STARS = Array.from({length:50},()=>({left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,size:Math.random()>.85?2:1.5,opacity:.1+Math.random()*.3,dur:`${3+Math.random()*5}s`,delay:`${Math.random()*4}s`}));
const MAP_PARTICLES = Array.from({length:8},()=>({left:`${15+Math.random()*70}%`,top:`${30+Math.random()*50}%`,dur:`${4+Math.random()*4}s`,delay:`${Math.random()*5}s`}));
const Stars = () => <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>{STAR_FIELD.map((st,i)=><div key={i} style={{position:"absolute",left:st.left,top:st.top,width:st.size,height:st.size,background:"#fff",borderRadius:"50%",opacity:st.opacity,animation:`twinkle ${st.dur} ease-in-out infinite`,animationDelay:st.delay}}/>)}</div>;

// Confetti component
const Confetti = () => <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:100}}>{Array.from({length:20},(_,i)=><div key={i} style={{position:"absolute",left:`${10+Math.random()*80}%`,top:"60%",width:8,height:8,borderRadius:Math.random()>.5?"50%":"2px",background:["#D4A55A","#4ABA78","#3AA8A0","#E88060","#4A90D9","#7A6BBF"][i%6],animation:`confetti ${1+Math.random()}s ease-out forwards`,animationDelay:`${Math.random()*0.5}s`}}/>)}</div>;

// AUTH
const AuthScreen = ({onClose,onSignedIn,headline="Sign in or create your free account",subhead="Enter your email and we'll send a 6-digit code. No password needed — new accounts are created automatically."}) => {
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [step,setStep]=useState("email");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [note,setNote]=useState("");
  const mapOtpError=(msg)=>{
    const m=(msg||"").toLowerCase();
    if(m.includes("rate")||m.includes("too many"))return"Too many attempts. Please wait a moment and try again.";
    if(m.includes("expired"))return"This code expired. Please request a new one.";
    if(m.includes("invalid")||m.includes("token"))return"That code is incorrect. Check your email and try again.";
    return msg||"Could not complete sign-in. Please try again.";
  };
  const sendCode=async()=>{
    if(!email.trim()){setErr("Please enter your email.");return}
    setLoading(true);setErr("");setNote("");
    const {error}=await db.sendOtp(email.trim().toLowerCase());
    setLoading(false);
    if(error){setErr(mapOtpError(error.message));return}
    setStep("code");
    setNote(`Code sent to ${email.trim().toLowerCase()} — check spam if you don't see it. If your email shows a button instead of a code, tapping it signs you in too.`);
  };
  const verifyCode=async()=>{
    if(code.trim().length!==6){setErr("Enter the 6-digit code from your email.");return}
    setLoading(true);setErr("");
    const {error}=await db.verifyOtp(email.trim().toLowerCase(),code.trim());
    setLoading(false);
    if(error){setErr(mapOtpError(error.message));return}
    setCode("");
    onSignedIn?.();
    onClose?.();
  };
  return(<div style={{minHeight:onClose?"auto":"100vh",background:`linear-gradient(180deg,${C.skyTop} 0%,${C.skyMid} 50%,${C.mountain} 80%,${C.green} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:onClose?"22px 20px":`40px 28px ${36+BOTTOM_SAFE}px`,position:"relative",borderRadius:onClose?18:0,border:onClose?`1px solid ${C.border}`:"none"}}>
    <Stars/><div className="fu" style={{position:"relative",zIndex:1}}><Lumi size={72} mood="happy" level={1} animate/></div>
    <p className="fu s1" style={{color:C.gold,fontSize:14,fontFamily:C.fontDisplay,fontWeight:700,letterSpacing:5,textTransform:"uppercase",marginTop:12,marginBottom:2,textAlign:"center"}}>Lumicamp</p>
    <h1 className="fu s1" style={{color:C.goldLight,fontSize:28,fontFamily:C.fontDisplay,fontWeight:700,marginTop:8,textAlign:"center"}}>{headline}</h1>
    <p className="fu s2" style={{color:C.textMuted,fontSize:14,fontFamily:C.font,marginBottom:20,textAlign:"center",maxWidth:320}}>{subhead}</p>
    <div style={{width:"100%",maxWidth:340,position:"relative",zIndex:1}}>
      <div className="fu s3" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={T.email} type="email" disabled={step==="code"} style={{width:"100%",background:"rgba(255,255,255,.05)",borderRadius:12,border:`1.5px solid ${C.border}`,padding:"13px 16px",color:C.text,fontSize:15,fontFamily:C.font,outline:"none",opacity:step==="code"?0.65:1}}/>
        {step==="code"&&<input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6-digit code" inputMode="numeric" onKeyDown={e=>e.key==="Enter"&&verifyCode()} style={{width:"100%",background:"rgba(255,255,255,.05)",borderRadius:12,border:`1.5px solid ${C.border}`,padding:"13px 16px",color:C.text,fontSize:17,letterSpacing:3,fontFamily:C.font,outline:"none",textAlign:"center"}}/>}
      </div>
      {note&&<p className="fi" style={{color:C.green,fontSize:12,fontFamily:C.font,marginBottom:8,textAlign:"center"}}>{note}</p>}
      {err&&<p className="fi" style={{color:C.red,fontSize:13,fontFamily:C.font,marginBottom:12,textAlign:"center"}}>{err}</p>}
      {step==="email"
        ?<Btn onClick={sendCode} disabled={loading}>{loading?"...":"Send code"}</Btn>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <Btn onClick={verifyCode} disabled={loading}>{loading?"...":"Verify code"}</Btn>
          <Btn v="ghost" onClick={()=>{setStep("email");setCode("");setErr("");setNote("")}}>Use a different email</Btn>
          <Btn v="ghost" onClick={sendCode} disabled={loading}>Resend code</Btn>
        </div>}
      {onClose&&<button onClick={onClose} style={{marginTop:10,width:"100%",background:"none",border:"none",color:C.textDim,fontSize:13,fontFamily:C.font}}>Close</button>}
    </div></div>);
};

// Display-name cascade: profile row → JWT user_metadata (instant on load) →
// a prettified email prefix → generic. Never renders a raw email address.
const prettyFromEmail = (email) => (email||"").split("@")[0].replace(/[._-]+/g," ").trim().replace(/\b\w/g,c=>c.toUpperCase());
// Placeholder values a DB default/trigger used to write into display_name
// (the map was greeting people "Good afternoon, AI"). Treated as "no name".
const PLACEHOLDER_NAMES = new Set(["ai","aifluent","ai fluent","ai explorer","ai learner","ai climber","lumicamp","learner","explorer","climber","user","null","undefined"]);
const realName = (v) => {const t=String(v||"").trim();return t&&!PLACEHOLDER_NAMES.has(t.toLowerCase().replace(/\s+/g," "))?t:""};
const getDisplayName = (profile,user,fallback="there") =>
  realName(profile?.display_name) || realName(user?.user_metadata?.display_name) || prettyFromEmail(user?.email) || fallback;
const getFirstName = (profile,user,fallback) => getDisplayName(profile,user,fallback).split(" ")[0]||fallback;
const hasDisplayName = (profile,user) => !!(realName(profile?.display_name)||realName(user?.user_metadata?.display_name));

// One-field step right after sign-in: Lumi asks, the guess is pre-filled, one tap
// to continue. Only non-empty is required — no first/last split, no validation.
const NameStep = ({open,user,onSave,loading}) => {
  const [name,setName]=useState(()=>prettyFromEmail(user?.email));
  const [err,setErr]=useState("");
  useEffect(()=>{if(open)setName(prettyFromEmail(user?.email))},[open,user?.email]);
  if(!open)return null;
  const clean=name.trim().slice(0,40);
  const save=()=>{if(!clean||loading)return;onSave(clean,setErr)};
  return(<div style={{position:"fixed",inset:0,zIndex:120,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{width:"100%",maxWidth:420,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:18,padding:22,textAlign:"center"}}>
      <Lumi size={64} mood="excited" level={1} animate/>
      <h2 style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,margin:"12px 0 6px"}}>What should Lumi call you?</h2>
      <p style={{color:C.textMuted,fontSize:13,fontFamily:C.font,margin:"0 0 14px",lineHeight:1.6}}>I took a guess from your email — tap Continue if it's right, or type anything you like.</p>
      <input value={name} onChange={e=>setName(e.target.value)} maxLength={40} autoFocus placeholder="Your name" onKeyDown={e=>e.key==="Enter"&&save()} style={{width:"100%",background:"rgba(255,255,255,.04)",borderRadius:12,border:`1.5px solid ${C.border}`,padding:"12px 14px",color:C.text,fontSize:16,fontFamily:C.font,outline:"none",textAlign:"center"}}/>
      {err&&<p style={{color:C.red,fontSize:12,fontFamily:C.font,marginTop:8}}>{err}</p>}
      <div style={{marginTop:14}}><Btn onClick={save} disabled={loading||!clean}>{loading?"Saving…":"Continue →"}</Btn></div>
    </div>
  </div>);
};

const JoinOrgView = ({token,user,onClose,onNeedSignIn,onMembershipActivated}) => {
  const [state,setState]=useState("idle");
  const [err,setErr]=useState("");
  const [orgName,setOrgName]=useState("your organization");
  const runJoin=useCallback(async()=>{
    if(!user?.id){setState("needsAuth");return}
    setState("loading");setErr("");
    const inviteRes=await db.getInviteByToken(token);
    const invite=inviteRes.data;
    if(inviteRes.error||!invite){setState("error");setErr("This invite link is invalid.");return}
    if(invite.org_name)setOrgName(invite.org_name);
    if(invite.accepted_at){setState("error");setErr("This invite was already used.");return}
    if(invite.expires_at&&new Date(invite.expires_at).getTime()<Date.now()){setState("error");setErr("This invite has expired.");return}
    const memberRes=await db.findOrgMember(invite.org_id,user.email||"");
    if(memberRes.error||!memberRes.data){setState("error");setErr("This invite was sent to a different email address.");return}
    const activateRes=await db.activateOrgMembership(memberRes.data.id,user.id);
    if(activateRes.error){setState("error");setErr("Could not activate this membership right now.");return}
    await db.markInviteAccepted(invite.id);
    setState("success");
    onMembershipActivated?.();
  },[token,user,onMembershipActivated]);

  useEffect(()=>{runJoin()},[runJoin]);

  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.bgDark})`,padding:`${TOP_SAFE+14}px 20px ${BOTTOM_SAFE+24}px`,position:"relative"}}>
    <Stars/>
    <div style={{position:"relative",zIndex:1,maxWidth:560,margin:"0 auto"}}>
      <button onClick={onClose} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.map}</button>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><Lumi size={44} mood="excited" level={2}/><h2 style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>Organization invite</h2></div>
        {state==="needsAuth"&&<>
          <p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,lineHeight:1.7,margin:"0 0 14px"}}>You've been invited to join an organization on Lumicamp. Sign in to continue.</p>
          <Btn onClick={onNeedSignIn}>Sign in to continue</Btn>
        </>}
        {state==="loading"&&<p style={{color:C.textMuted,fontSize:14,fontFamily:C.font}}>Validating your invite...</p>}
        {state==="error"&&<>
          <p style={{color:C.red,fontSize:14,fontFamily:C.font,margin:"0 0 12px"}}>{err}</p>
          <Btn v="ghost" onClick={runJoin}>Try again</Btn>
        </>}
        {state==="success"&&<>
          <p style={{color:C.green,fontSize:15,fontFamily:C.font,lineHeight:1.7,margin:"0 0 12px"}}>Welcome to {orgName} - your progress now counts toward your team.</p>
          <Btn onClick={onClose}>Continue into app</Btn>
        </>}
      </div>
    </div>
  </div>);
};

const CertVerifyView = ({code,onBack}) => {
  const [loading,setLoading]=useState(true);
  const [cert,setCert]=useState(null);
  useEffect(()=>{
    let mounted=true;
    db.getCertificateByCode(code).then(({data})=>{if(mounted)setCert(data||null)}).finally(()=>{if(mounted)setLoading(false)});
    return()=>{mounted=false};
  },[code]);
  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.bgDark})`,padding:`${TOP_SAFE+14}px 20px ${BOTTOM_SAFE+24}px`,position:"relative"}}>
    <Stars/>
    <div style={{position:"relative",zIndex:1,maxWidth:560,margin:"0 auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.map}</button>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:22,boxShadow:"0 10px 40px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{color:C.goldLight,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>Lumicamp</h2><span style={{color:C.green,fontSize:14,fontFamily:C.font,fontWeight:700}}>Verified ✓</span></div>
        {loading&&<p style={{color:C.textMuted,fontSize:14,fontFamily:C.font}}>Checking certificate...</p>}
        {!loading&&!cert&&<p style={{color:C.red,fontSize:14,fontFamily:C.font}}>No certificate found for this code.</p>}
        {!loading&&cert&&<div style={{display:"grid",gap:8}}>
          <p style={{color:C.text,fontSize:18,fontFamily:C.font,fontWeight:700,margin:0}}>{cert.display_name||"Learner"}</p>
          <p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,margin:0}}>{cert.cert_type||"AI Fluency - Core"}</p>
          <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,margin:0}}>Issued {cert.issued_at?new Date(cert.issued_at).toLocaleDateString():"-"}</p>
          <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,marginTop:4}}>Code: {code}</p>
        </div>}
      </div>
    </div>
  </div>);
};

// ONBOARDING
const Onboarding = ({uid,onDone}) => {
  const [step,setStep]=useState(0);const [ans,setAns]=useState({});const [building,setBuilding]=useState(false);
  const steps=[{q:"Tell us about yourself",sub:"This shapes your path",opts:["Business Owner","Student","Working Professional","Curious Learner","Creative / Artist","Retired & Exploring"],key:"role"},{q:"Your experience with AI?",sub:"Everyone starts somewhere",opts:["Completely new","Tried ChatGPT once","Use AI occasionally","Ready to go deeper"],key:"exp"},{q:"What are you climbing toward?",sub:"Select all that interest you",opts:["Better writing","Creating images","Business growth","Staying informed","Automating tasks","Just exploring"],key:"goals",multi:true}];
  const pick=(val)=>{const s=steps[step];if(s.multi){const c=ans[s.key]||[];setAns({...ans,[s.key]:c.includes(val)?c.filter(v=>v!==val):[...c,val]})}else{const na={...ans,[s.key]:val};setAns(na);if(step<2)setTimeout(()=>setStep(step+1),300);else finish(na)}};
  const finish=async(fa)=>{
    setBuilding(true);const a=fa||ans;
    const payload={role:a.role,experience_level:a.exp,goals:a.goals||[],onboarded:true};
    // Never let the user get stuck on "Charting your route": cap the save at 8s,
    // swallow errors, and always fall back to a local onboarded flag.
    try{
      const timeout=new Promise(res=>setTimeout(()=>res({error:{message:"timeout"}}),8000));
      const res=await Promise.race([db.updateProfile(uid,payload),timeout]);
      if(res?.error)console.warn("Onboarding save issue:",res.error.message);
    }catch(e){console.warn("Onboarding save failed:",e)}
    try{localStorage.setItem(`lumicamp_onboarded_${uid}`,"1");localStorage.setItem(`lumicamp_onboarding_answers_${uid}`,JSON.stringify(payload))}catch{/* storage unavailable */}
    setTimeout(()=>onDone(),1200);
  };
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
const WorldMap = ({user,profile,progress,onOpenLoc,onOpenNews,onOpenTools,onOpenProfile,onOpenChallenge,onOpenAchievements,onToggleTheme,onChangeLang,onSignIn}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);const done=completedPaths(progress);
  const status=(loc)=>{if(loc.id==="master")return done.length>=6?"current":"locked";const idx=LOCS.findIndex(l=>l.id===loc.id);if(done.includes(loc.id))return"done";if(idx===0)return"current";const prev=LOCS[idx-1];if(prev&&done.includes(prev.id))return"current";return"locked"};
  const pct=Math.round((done.length/6)*100);
  // Lessons finished per location — drives the progress ring + "2/4" label so
  // it's obvious a location still has lessons left after you finish one.
  const locDone=(id)=>new Set(progress.filter(p=>p.path_id===id).map(p=>Number(p.lesson_index))).size;
  const challengeDoneToday=isChallengeDoneToday();
  const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"};
  const streak=Math.max(Streak.getData().current||0,profile?.current_streak||0);
  const name = getFirstName(profile,user,"Climber");
  const persona=getPersona(profile,user);
  const dk=C.mode==="dark";

  const nodes=[
    {loc:LOCS[0],nx:22,ny:64},{loc:LOCS[1],nx:42,ny:56},{loc:LOCS[2],nx:68,ny:61},
    {loc:LOCS[3],nx:78,ny:47},{loc:LOCS[4],nx:55,ny:35},{loc:LOCS[5],nx:32,ny:42},
    {loc:LOCS[6],nx:50,ny:22},
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
      {MAP_STARS.map((st,i)=><div key={i} style={{position:"absolute",left:st.left,top:st.top,width:st.size,height:st.size,background:"#fff",borderRadius:"50%",opacity:st.opacity,animation:`twinkle ${st.dur} ease-in-out infinite`,animationDelay:st.delay}}/>)}
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
      {MAP_PARTICLES.map((pt,i)=><div key={i} style={{
        position:"absolute",left:pt.left,top:pt.top,
        width:dk?3:2,height:dk?3:2,borderRadius:"50%",
        background:dk?"#FFE8A0":"rgba(255,255,255,.8)",
        opacity:dk?.15:.4,
        animation:`lumiFloat ${pt.dur} ease-in-out infinite`,
        animationDelay:pt.delay,
      }}/>)}
    </div>

    {/* Top bar */}
    <div style={{position:"absolute",top:0,left:0,right:0,padding:`${TOP_SAFE+10}px 12px 10px`,display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20,
      background:dk?"linear-gradient(180deg, rgba(6,13,26,.95) 0%, rgba(6,13,26,.6) 70%, transparent 100%)":"linear-gradient(180deg, rgba(216,232,248,.95) 0%, rgba(216,232,248,.6) 70%, transparent 100%)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
        <Lumi size={28} mood={streak>=7?"excited":"happy"} level={level}/>
        <div style={{minWidth:0}}>
          <p style={{color:C.text,fontSize:13,fontFamily:C.fontDisplay,fontWeight:700,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{T.greeting(new Date().getHours())}, {name}</p>
          <p style={{color:C.textMuted,fontSize:11,fontFamily:C.font,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{T.altitude} {level} · {pct}% {T.toSummit}{persona.goals?.[0]?` · 🎯 ${persona.goals[0]}`:""}</p>
        </div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:4,background:dk?"rgba(212,165,90,.1)":"rgba(180,130,40,.1)",padding:"6px 10px",borderRadius:20,border:`1px solid ${dk?"rgba(212,165,90,.2)":"rgba(180,130,40,.2)"}`}}><span style={{fontSize:13}} aria-hidden="true">🔥</span><span style={{color:C.gold,fontSize:13,fontWeight:800,fontFamily:C.font}} aria-label={`${streak} ${T.dayStreak}`}>{streak}</span></div>
        <button onClick={onOpenAchievements} aria-label={T.achievements} style={{display:"flex",alignItems:"center",gap:3,background:dk?"rgba(58,168,160,.1)":"rgba(42,128,120,.08)",padding:"6px 10px",borderRadius:20,border:`1px solid ${dk?"rgba(58,168,160,.2)":"rgba(42,128,120,.15)"}`,fontSize:13}}>🏆<span style={{color:C.teal,fontSize:13,fontWeight:800,fontFamily:C.font}}>{ACHIEVEMENTS.filter(a=>a.condition(progress,profile)).length}</span></button>
        <ThemeToggle onToggle={onToggleTheme}/>
        <LangSelector onChangeLang={onChangeLang} compact/>
        {user
          ?<button onClick={onOpenProfile} aria-label="Profile" style={{width:32,height:32,borderRadius:10,background:dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.05)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>👤</button>
          :<button onClick={onSignIn||onOpenProfile} style={{height:32,padding:"0 12px",borderRadius:10,background:C.gold,border:"none",color:"#1a1208",fontSize:12,fontWeight:800,fontFamily:C.font,whiteSpace:"nowrap"}}>{T.signIn}</button>}
      </div>
    </div>

    {/* SIGNED-OUT CALL TO ACTION — makes "how do I sign up?" obvious */}
    {!user&&<div className="fu" style={{position:"absolute",left:12,right:12,top:TOP_SAFE+62,zIndex:20,background:dk?"rgba(6,13,26,.9)":"rgba(255,255,255,.92)",border:`1px solid ${C.border}`,borderRadius:14,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 24px rgba(0,0,0,.18)"}}>
      <Lumi size={30} mood="happy" level={1}/>
      <div style={{flex:1,minWidth:0}}>
        <p style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>{T.whatIsLumicamp}</p>
        <p style={{color:C.textMuted,fontSize:11,fontFamily:C.font,margin:0}}>Just your email — we'll send a 6-digit code. Your progress will be saved.</p>
      </div>
      <button onClick={onSignIn||onOpenProfile} style={{background:C.gold,border:"none",borderRadius:10,padding:"8px 12px",color:"#1a1208",fontSize:12,fontWeight:800,fontFamily:C.font,whiteSpace:"nowrap"}}>Get started →</button>
    </div>}

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
      const total=pathLessonCount(loc.id);const fin=locDone(loc.id);const started=cur&&fin>0&&fin<total;
      const ringR=33;const ringC=2*Math.PI*ringR;
      return(<div key={loc.id} onClick={()=>!lk&&onOpenLoc(loc.id)} role="button" tabIndex={lk?-1:0} aria-disabled={lk} aria-label={`${locName(loc.id)}${d?" — "+T.completed:lk?" — "+T.lockedReason:started?` — ${fin}/${total}`:""}`} onKeyDown={e=>{if(!lk&&(e.key==="Enter"||e.key===" ")){e.preventDefault();onOpenLoc(loc.id)}}}
        style={{position:"absolute",left:`${nx}%`,top:`${ny}%`,transform:"translate(-50%,-50%)",zIndex:10,cursor:lk?"default":"pointer",textAlign:"center"}}>

        {/* Pulse ring for current */}
        {cur&&<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:74,height:74,borderRadius:"50%",border:`2px solid ${dk?"rgba(212,165,90,.25)":"rgba(180,130,40,.3)"}`,animation:"pulse 2.5s ease-in-out infinite"}}/>}
        {/* Progress ring — fills as lessons in this location are completed */}
        {started&&<svg width={ringR*2+6} height={ringR*2+6} style={{position:"absolute",top:28,left:"50%",transform:"translate(-50%,-50%) rotate(-90deg)",pointerEvents:"none"}}>
          <circle cx={ringR+3} cy={ringR+3} r={ringR} fill="none" stroke={dk?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"} strokeWidth="3"/>
          <circle cx={ringR+3} cy={ringR+3} r={ringR} fill="none" stroke={dk?"#60E898":"#2A8A50"} strokeWidth="3" strokeLinecap="round" strokeDasharray={ringC} strokeDashoffset={ringC*(1-fin/total)} style={{transition:"stroke-dashoffset .6s ease"}}/>
        </svg>}

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
        {cur&&loc.id!=="master"&&<p style={{color:started?(dk?"#A0F0C0":"#2A6A38"):(dk?"rgba(212,165,90,.5)":"rgba(140,100,30,.5)"),fontSize:11,fontWeight:started?700:400,fontFamily:C.font,margin:"2px 0 0"}}>{started?`${fin}/${total} · ${T.continueLesson} →`:T.tapExplore}</p>}
        {cur&&loc.id==="master"&&<p style={{color:dk?"#FFE8C0":"#8A6A2A",fontSize:11,fontWeight:700,fontFamily:C.font,margin:"2px 0 0"}}>🏆</p>}
        {d&&<p style={{color:dk?"rgba(160,240,192,.6)":"rgba(42,106,56,.6)",fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{fin}/{total} ✓</p>}
      </div>);
    })}

    {/* Bottom action bar */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,paddingBottom:(10+BOTTOM_SAFE)+"px",paddingTop:8,paddingLeft:8,paddingRight:8,background:dk?"rgba(6,13,26,.92)":"rgba(255,255,255,.92)",backdropFilter:"blur(16px)",borderTop:`1px solid ${dk?"rgba(255,255,255,.06)":"rgba(0,0,0,.08)"}`,boxShadow:dk?"none":"0 -2px 20px rgba(0,0,0,.06)"}}>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onOpenChallenge} style={{flex:1,background:challengeDoneToday?(dk?"rgba(74,186,120,.08)":"rgba(74,186,120,.08)"):(dk?"rgba(232,128,96,.08)":"rgba(232,128,96,.06)"),border:`1px solid ${challengeDoneToday?"rgba(74,186,120,.25)":(dk?"rgba(232,128,96,.15)":"rgba(232,128,96,.12)")}`,borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          {challengeDoneToday?<span style={{fontSize:20,lineHeight:1}}>✅</span>:<Icon type="challenge" size={22} color={dk?"#F0A878":"#C08058"}/>}<div><p style={{color:challengeDoneToday?(dk?"#A0F0C0":"#2A6A38"):(dk?"#F0A878":"#A06840"),fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>{T.dailyChallenge}</p><p style={{color:challengeDoneToday?C.green:C.textDim,fontSize:11,fontFamily:C.font,margin:0}}>{challengeDoneToday?T.challengeDone:T.keepStreak}</p></div>
        </button>
        <button onClick={onOpenNews} style={{flex:1,background:dk?"rgba(212,165,90,.06)":"rgba(180,130,40,.05)",border:`1px solid ${dk?"rgba(212,165,90,.12)":"rgba(180,130,40,.1)"}`,borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <Icon type="news" size={22} color={dk?"#E8C878":"#A08838"}/><div><p style={{color:dk?"#E8C878":"#806820",fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>{T.aiNews}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:0}}>{T.live}</p></div>
        </button>
        <button onClick={onOpenTools} style={{flex:1,background:dk?"rgba(58,168,160,.06)":"rgba(42,128,120,.05)",border:`1px solid ${dk?"rgba(58,168,160,.12)":"rgba(42,128,120,.1)"}`,borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <Icon type="tools" size={22} color={dk?"#68D8C8":"#388880"}/><div><p style={{color:dk?"#68D8C8":"#2A7068",fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>{T.aiTools}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:0}}>{T.tools6}</p></div>
        </button>
      </div>
    </div>
  </div>);
};

// LOCATION VIEW + LESSON SELECTOR + TUTOR + PRACTICE MODE
// Altitude Rating helper
const ALT_TEXT={
  en:{summit:{l:"Summit",m:"Outstanding! You've mastered this lesson."},ridge:{l:"Ridge",m:"Solid understanding. Great work!"},treeline:{l:"Treeline",m:"Almost there! You need 70% to pass. Review and try again."},base:{l:"Base Camp",m:"You need more practice. Review the lesson and try again."},rating:"Rating"},
  ar:{summit:{l:"القمة",m:"!ممتاز! لقد أتقنت هذا الدرس"},ridge:{l:"التلال",m:"!فهم جيد. عمل رائع"},treeline:{l:"خط الشجر",m:"اقتربت! تحتاج 70% للنجاح. راجع وحاول مرة أخرى."},base:{l:"المخيم الأساسي",m:"تحتاج المزيد من التمرين. راجع الدرس وحاول مرة أخرى."},rating:"تقييم"},
  fr:{summit:{l:"Sommet",m:"Exceptionnel ! Vous avez maîtrisé cette leçon."},ridge:{l:"Crête",m:"Bonne compréhension. Bravo !"},treeline:{l:"Limite forestière",m:"Presque ! Il faut 70% pour réussir. Révisez et réessayez."},base:{l:"Camp de Base",m:"Encore un effort. Révisez la leçon et réessayez."},rating:"Note"},
};
const getAltitude=(pct)=>{
  const a=ALT_TEXT[getLang()]||ALT_TEXT.en;
  if(pct>=90)return{label:a.summit.l,icon:"🏔️",color:"#FFD700",bg:"rgba(255,215,0,.12)",border:"rgba(255,215,0,.25)",msg:a.summit.m};
  if(pct>=70)return{label:a.ridge.l,icon:"⛰️",color:"#4ABA78",bg:"rgba(74,186,120,.1)",border:"rgba(74,186,120,.2)",msg:a.ridge.m};
  if(pct>=50)return{label:a.treeline.l,icon:"◈",color:"#E8B84B",bg:"rgba(232,184,75,.08)",border:"rgba(232,184,75,.18)",msg:a.treeline.m};
  return{label:a.base.l,icon:"△",color:"#C87858",bg:"rgba(200,120,88,.08)",border:"rgba(200,120,88,.18)",msg:a.base.m};
};

const LocView = ({user,locId,uid,progress,onBack,onComplete,profile,onLessonComplete,onActivity}) => {
  const loc=LOCS.find(l=>l.id===locId)||LOCS[0];
  const lessons=LESSONS[locId]||[];
  const [lessonIdx,setLessonIdx]=useState(null);
  const lesson=lessonIdx!==null?lessons[lessonIdx]:null;
  const [view,setView]=useState("intro");const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  // Lumi personality context
  const userName = getFirstName(profile,user,"friend");
  const userRole=profile?.role||"learner";
  const completedCount=progress.length;
  const streakDays=Streak.getData().current||0;
  const langInstruction=getLang()==="en"?"":`IMPORTANT: Respond ENTIRELY in ${LANGS[getLang()].name}. The user's interface language is ${LANGS[getLang()].name}.`;
  const persona=getPersona(profile,user);
  const lumiPersonality=`You are Lumi, a warm and knowledgeable AI guide in "Lumicamp" at "${loc.name}" teaching "${lesson?.title}". The learner's name is ${userName} and they are a ${userRole}. Their AI experience: "${persona.exp||"unknown"}" — ${isExperienced(persona)?"skip the basics, go straight to the useful nuance":"assume nothing, define terms the first time"}. Their goals: ${persona.goals.join(", ")||"not stated"} — tie examples to those when natural. They have completed ${completedCount} lessons and have a ${streakDays}-day streak. Reference their name occasionally (not every message). If they've done many lessons, acknowledge their progress. Be clear, use simple language, everyday analogies. Encouraging but never condescending. Under 180 words. ${langInstruction}`;
  const [practiceIdx,setPracticeIdx]=useState(0);const [selected,setSelected]=useState(null);const [submitted,setSubmitted]=useState(false);
  const [freeAns,setFreeAns]=useState("");const [feedback,setFeedback]=useState("");const [grading,setGrading]=useState(false);const [showHint,setShowHint]=useState(false);
  const [showConfetti,setShowConfetti]=useState(false);const [practiceScore,setPracticeScore]=useState(0);
  const [totalPossible,setTotalPossible]=useState(0);
  const [showResults,setShowResults]=useState(false);
  const [showShare,setShowShare]=useState(false);
  // Translated lesson content
  const [tSections,setTSections]=useState(null);
  const [tPractice,setTPractice]=useState(null);
  const [translating,setTranslating]=useState(false);
  useEffect(()=>{
    if(lessonIdx===null||!lesson||getLang()==="en"){setTSections(null);setTPractice(null);return}
    const lang=getLang();
    const cacheKey=`${locId}-${lessonIdx}`;
    const cached=TCache.get(lang,cacheKey);
    if(cached){setTSections(cached.sections||null);setTPractice(cached.practice||null);return}
    setTranslating(true);
    console.log("Translating lesson:",lesson.title,"to",lang);
    const secs=lesson.sections.map(s=>({h:s.h,body:s.body}));
    const prac=(lesson.practice||[]).map(p=>({q:p.q,opts:p.opts||[],hint:p.hint||"",explain:p.explain||"",example:p.example||""}));
    const content=JSON.stringify({sections:secs,practice:prac});
    // `translate` is served from a shared server cache: the first person to
    // open a lesson in Arabic pays the 10-20 s; everyone after gets it in ~200 ms.
    db.callClaude({feature:"translate",lang,key:cacheKey,system:`Translate the JSON below to ${LANGS[lang].name}. Return ONLY the translated JSON object. No backticks, no markdown, no extra text. Keep all JSON keys in English. Only translate string values.`,messages:[{role:"user",content:content}]}).then(r=>{
      console.log("Translation response length:",r.text?.length);
      try{
        let jsonStr=r.text||"";
        // Strip markdown code fences if present
        jsonStr=jsonStr.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
        // Find the outermost JSON object
        const firstBrace=jsonStr.indexOf("{");
        const lastBrace=jsonStr.lastIndexOf("}");
        if(firstBrace>=0&&lastBrace>firstBrace)jsonStr=jsonStr.substring(firstBrace,lastBrace+1);
        const parsed=JSON.parse(jsonStr);
        if(parsed.sections&&parsed.sections.length===lesson.sections.length){
          console.log("Translation success:",parsed.sections.length,"sections");
          setTSections(parsed.sections);
          setTPractice(parsed.practice||null);
          TCache.set(lang,cacheKey,{sections:parsed.sections,practice:parsed.practice||null});
        } else {
          console.warn("Translation mismatch: got",parsed.sections?.length,"expected",lesson.sections.length);
        }
      }catch(e){console.warn("Translation parse failed:",e.message,r.text?.substring(0,300))}
      setTranslating(false);
    }).catch(e=>{console.warn("Translation call failed:",e);setTranslating(false)});
  },[lessonIdx]);
  const displaySections=tSections||lesson?.sections||[];
  const displayPractice=tPractice; // null if not translated yet
  // Store scores per lesson: { "basics-0": 85, "writing-1": 70 }
  const [lessonScores,setLessonScores]=useState(()=>{try{return JSON.parse(localStorage.getItem("lumicamp_scores")||"{}")}catch{return{}}});
  const saveScore=(pathId,li,pct)=>{const k=`${pathId}-${li}`;const ns={...lessonScores,[k]:Math.max(pct,lessonScores[k]||0)};setLessonScores(ns);localStorage.setItem("lumicamp_scores",JSON.stringify(ns))};
  // Best % for a lesson = max(local cache, score persisted in user_progress).
  // The DB copy is what makes ratings survive a new device / cleared browser.
  const getScore=(pathId,li)=>{const local=lessonScores[`${pathId}-${li}`]||0;const remote=(progress||[]).find(p=>p.path_id===pathId&&Number(p.lesson_index)===li)?.score||0;const v=Math.max(local,remote);return v||null};

  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);
  useBackHandler(()=>{
    if(view==="practice"){if(showResults){setShowResults(false);setView("lesson")}else setView("lesson");return true}
    if(view==="tutor"){setView("lesson");return true}
    if(view==="lesson"){setView("intro");setLessonIdx(null);return true}
    return false; // intro → let the app go back to the map
  });

  // Which lessons in this path has the user completed?
  const completedInPath=progress.filter(p=>p.path_id===locId).map(p=>p.lesson_index);
  const isLessonDone=(idx)=>completedInPath.includes(idx);
  const isLessonUnlocked=(idx)=>idx===0||completedInPath.includes(idx-1);

  const ask=async(q)=>{
    if(uid&&!msgs.some(m=>m.from==="user")){db.bumpTutorSessions(uid).then(()=>onActivity?.()).catch(()=>{});Streak.recordActivity();db.recordActivity(uid,"chat").then(({data})=>Streak.applyServer(data))}
    setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);
    try{const r=await db.callClaude({feature:"tutor",system:lumiPersonality,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"tutor",context_id:locId,context_title:lesson?.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch(e){setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:(e?.code==="auth_required"||e?.code==="quota")?e.message:"Hmm, I lost my connection for a moment. Could you try asking that again? 🌟"}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  const _rawPractice=lesson?.practice||[];
  // Merge translated text with original practice (keep type, correct, etc from original)
  const practice=_rawPractice.map((p,i)=>{
    if(!displayPractice||getLang()==="en")return p;
    const tp=displayPractice[i];
    if(!tp)return p;
    return{...p,q:tp.q||p.q,opts:(tp.opts&&tp.opts.length===p.opts?.length)?tp.opts:(p.opts||[]),hint:tp.hint||p.hint,explain:tp.explain||p.explain,example:tp.example||p.example};
  });
  const currentP=practice[practiceIdx];

  // Beta feedback: exercises could be "breezed through by copying the question
  // text and typing in the hint". Two guards: (1) a local echo check that refuses
  // answers made mostly of the prompt's own words, (2) the grader is told to
  // score restated prompts / hints / examples low and reward the learner's OWN
  // details.
  const [echoWarn,setEchoWarn]=useState(false);
  const echoesPrompt=(ans)=>{
    const norm=t=>(t||"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").split(/\s+/).filter(w=>w.length>3);
    const a=norm(ans);if(a.length<6)return true;
    const src=new Set([...norm(currentP.q),...norm(currentP.hint),...norm(currentP.example)]);
    const overlap=a.filter(w=>src.has(w)).length/a.length;
    const fresh=new Set(a.filter(w=>!src.has(w))).size;
    return overlap>.7||fresh<4;
  };
  const gradeFreeResponse=async()=>{
    if(currentP.own&&echoesPrompt(freeAns)){setEchoWarn(true);SFX.play("wrong");return}
    setEchoWarn(false);
    setGrading(true);
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, grading a practice exercise in an AI-skills course. The question was: "${currentP.q}". Guiding questions the learner saw: "${currentP.hint||""}". A worked example from the lesson (the learner should NOT copy it): "${currentP.example||""}". IMPORTANT: Start your response with exactly "SCORE: X/10" on the first line (where X is 1-10). Scoring rules: 8-10 = the learner's OWN real situation with concrete, specific details (names, numbers, constraints, audience) AND the lesson's framework applied; 5-7 = follows the framework but is generic or thin on personal detail; 1-4 = mostly restates the question, the guiding questions, or the example, or contains no specifics of their own. Then give brief, warm feedback: what's strong, and ONE specific way to make it more concrete or more theirs. Under 120 words. Never condescending.${getLang()!=="en"?` Respond ENTIRELY in ${LANGS[getLang()].name} (except the SCORE: X/10 line which must stay in English).`:""}`,messages:[{role:"user",content:freeAns}]});
      const scoreMatch=r.text.match(/SCORE:\s*(\d+)\s*\/\s*10/i);
      const numScore=scoreMatch?parseInt(scoreMatch[1]):6;
      setFeedback(r.text.replace(/SCORE:\s*\d+\s*\/\s*10\s*/i,"").trim());
      setPracticeScore(ps=>ps+numScore);
      setTotalPossible(tp=>tp+10);
      SFX.play(numScore>=7?"correct":"click");
    }catch(e){
      if(e?.code==="auth_required"||e?.code==="quota"){setGrading(false);setFeedback("");setEchoWarn(false);return}
      setFeedback("Great effort! The key is being specific — the more detail you give AI, the better the result.");setPracticeScore(ps=>ps+6);setTotalPossible(tp=>tp+10)}
    setGrading(false);setSubmitted(true);
  };

  // Testers finished a lesson, got bounced to the map, and didn't realise they
  // had to re-open the same location to reach lesson 2. Now a completed lesson
  // drops you back on THIS location's lesson list with the next one called out.
  const [justDone,setJustDone]=useState(null);
  const finishLesson=(idx,pct)=>{
    onLessonComplete?.(locId,idx,pct);
    setJustDone(idx);
    setShowResults(false);setView("intro");setLessonIdx(null);
    try{window.scrollTo(0,0)}catch{}
    onComplete();
  };
  const resetPractice=()=>{setPracticeIdx(0);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("");setPracticeScore(0);setTotalPossible(0);setShowConfetti(false);setShowResults(false);setShowHint(false);setEchoWarn(false)};
  const goToLesson=(idx)=>{setLessonIdx(idx);setView("lesson");setMsgs([]);setSid(null);resetPractice()};

  // PRACTICE MODE
  if(view==="practice"&&practice.length>0&&!showResults)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.back}</button>
    {showConfetti&&<Confetti/>}
    <div style={{display:"flex",gap:4,marginBottom:16}}>{practice.map((_,i)=><div key={i} style={{flex:1,height:5,borderRadius:3,background:i<practiceIdx?C.green:i===practiceIdx?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Lumi size={28} mood={submitted?"excited":"happy"} level={level}/><span style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600}}>{T.practice} {practiceIdx+1} {T.practiceOf} {practice.length}</span></div>
    <h2 className="fu s1" style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 16px",lineHeight:1.35}}>{currentP.q}</h2>
    {currentP.type==="multiple_choice"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {currentP.opts.map((o,i)=>{const isCorrect=i===currentP.correct;const isSelected=selected===i;const showResult=submitted;
        return<button key={i} onClick={()=>{if(!submitted)setSelected(i)}} disabled={submitted} className={`pop s${Math.min(i+1,5)}`}
          style={{background:showResult?(isCorrect?"rgba(74,186,120,.12)":isSelected?"rgba(216,88,88,.12)":"rgba(255,255,255,.03)"):(isSelected?"rgba(212,165,90,.1)":"rgba(255,255,255,.03)"),border:`1.5px solid ${showResult?(isCorrect?C.green:isSelected?C.red:C.border):(isSelected?C.gold:C.border)}`,borderRadius:14,padding:"13px 16px",textAlign:"left",width:"100%"}}>
          <span style={{color:showResult?(isCorrect?C.green:isSelected?C.red:C.textMuted):(isSelected?C.goldLight:C.textMuted),fontSize:14,fontWeight:isSelected?700:500,fontFamily:C.font}}>{showResult?(isCorrect?"✓ ":isSelected?"✗ ":""):isSelected?"● ":""}{o}</span></button>})}
      {!submitted&&selected!==null&&<div style={{marginTop:8}}><Btn onClick={()=>{setSubmitted(true);setTotalPossible(tp=>tp+10);if(selected===currentP.correct){setPracticeScore(ps=>ps+10);SFX.play("correct")}else{SFX.play("wrong")}}}>{T.check}</Btn></div>}
      {submitted&&<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14,marginTop:10}}><p style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 4px"}}>💡 {T.why}</p><p style={{color:C.textMuted,fontSize:13,lineHeight:1.6,fontFamily:C.font,margin:0}}>{currentP.explain}</p></div>}
    </div>}
    {currentP.type==="free_response"&&<div>
      {currentP.own&&!submitted&&<p className="fu" style={{color:C.teal,fontSize:11,fontWeight:800,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>✍️ {T.yourOwnExample}</p>}
      {currentP.hint&&!submitted&&<div className="fu" style={{background:"rgba(212,165,90,.04)",border:`1px solid ${C.borderGold}`,borderRadius:12,padding:"8px 10px",marginBottom:12}}>
        <button onClick={()=>setShowHint(h=>!h)} style={{background:"none",border:"none",padding:0,width:"100%",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.gold,fontSize:12,fontWeight:700,fontFamily:C.font}}>💡 {T.hintTitle}</span><span style={{color:C.gold,fontSize:12}}>{showHint?"▲":"▼"}</span></button>
        {showHint&&<p className="fi" style={{color:C.textMuted,fontSize:12,lineHeight:1.6,fontFamily:C.font,margin:"6px 0 0"}}>{currentP.hint}</p>}
      </div>}
      <textarea value={freeAns} onChange={e=>{setFreeAns(e.target.value);if(echoWarn)setEchoWarn(false)}} placeholder={T.typeAnswer} disabled={submitted} style={{width:"100%",minHeight:140,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${echoWarn?C.red:C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical",marginBottom:10}}/>
      {echoWarn&&<div className="fu" style={{background:"rgba(216,88,88,.08)",border:`1px solid ${C.red}55`,borderRadius:12,padding:10,marginBottom:10}}><p style={{color:C.red,fontSize:12,lineHeight:1.5,fontFamily:C.font,margin:0}}>{T.tooSimilar}</p></div>}
      {!submitted&&<Btn onClick={gradeFreeResponse} disabled={!freeAns.trim()||grading}>{grading?T.lumiReviewing:T.submit}</Btn>}
      {submitted&&feedback&&<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14,marginTop:10}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Lumi size={22}/><span style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font}}>{T.lumiFeedback}</span></div><p style={{color:C.textMuted,fontSize:13,lineHeight:1.65,fontFamily:C.font,margin:0}}><Md text={feedback}/></p></div>}
    </div>}
    {submitted&&<div style={{marginTop:14}}>
      {practiceIdx<practice.length-1?<Btn v="teal" onClick={()=>{setPracticeIdx(practiceIdx+1);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("");setShowHint(false);setEchoWarn(false)}}>{T.nextQ}</Btn>
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
        <p style={{color:alt.color,fontSize:14,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:2,margin:"0 0 4px"}}>{alt.label} {(ALT_TEXT[getLang()]||ALT_TEXT.en).rating}</p>
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
          <Btn v="green" onClick={()=>{
            try{SFX.play("triumph")}catch(e){}
            saveScore(locId,lessonIdx,pct);
            finishLesson(lessonIdx,pct);
          }}>
            {pct>=90?T.claimSummit:T.claimRidge}
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
    <div style={{padding:"12px 16px",paddingTop:(TOP_SAFE+12)+"px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}>
      <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>{T.back}</button>
      <div style={{flex:1,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Lumi size={22} level={level}/><span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>{T.lumiGuide}</span></div>
    </div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}>
      <Bub from="lumi" text={`Hey ${userName}! Welcome to ${locName(loc.id)}. I'm here to help with "${lesson?.title}" — ask me anything!`}/>
      {msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text} copyable/>)}{typing&&<Bub from="lumi" typing/>}
      {msgs.length===0&&lesson&&<div className="fu s2" style={{marginTop:14}}><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600,margin:"0 0 10px"}}>{T.peoplAsk}</p>{lesson.questions.map((q,i)=><button key={i} onClick={()=>ask(q)} style={{display:"block",width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",marginBottom:7,textAlign:"left"}}><span style={{color:C.textMuted,fontSize:13,fontFamily:C.font}}>{q}</span></button>)}</div>}
    </div>
    <div style={{padding:"8px 14px",paddingBottom:(12+BOTTOM_SAFE)+"px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,background:C.bgCard}}>
      <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={T.askLumi+"..."} style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/>
      <button onClick={send} aria-label="Send" style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:16}}>↑</span></button>
    </div></div>);

  // LESSON CONTENT
  if(view==="lesson"&&lesson)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>{setView("intro");setLessonIdx(null)}} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.back} {locName(loc.id)}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:18}}>{loc.icon}</span><span style={{color:loc.color,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1}}>{loc.sub} · {T.lesson} {lessonIdx+1}</span></div>
    <h1 className="fu s1" style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 22px",lineHeight:1.3}}>{lessonTitle(lesson.title)}</h1>
    {translating&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"10px 14px",background:"rgba(212,165,90,.06)",borderRadius:12,border:`1px solid ${C.borderGold}`}}><Lumi size={22} mood="thinking" animate/><span style={{color:C.gold,fontSize:13,fontFamily:C.font}}>Lumi is translating...</span></div>}
    {displaySections.map((sec,i)=>(<div key={i} className={`fu s${Math.min(i+2,5)}`} style={{marginBottom:26}}><h3 style={{color:C.text,fontSize:16,fontWeight:700,fontFamily:C.font,margin:"0 0 8px"}}>{sec.h}</h3><p style={{color:C.textMuted,fontSize:14,lineHeight:1.8,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{sec.body}</p></div>))}
    {practice.filter(p=>p.example).map((p,i)=>(<div key={`ex${i}`} className="fu s4" style={{background:"rgba(58,168,160,.06)",border:"1px solid rgba(58,168,160,.2)",borderRadius:16,padding:16,marginBottom:14}}>
      <p style={{color:C.teal,fontSize:11,fontWeight:800,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,margin:"0 0 6px"}}>✅ {T.exampleTitle}</p>
      <p style={{color:C.text,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0,whiteSpace:"pre-wrap"}}>{p.example}</p>
      <p style={{color:C.textDim,fontSize:12,lineHeight:1.5,fontFamily:C.font,margin:"10px 0 0"}}>↳ {T.yourOwnExample}: {p.q}</p>
    </div>))}
    <button onClick={()=>setView("tutor")} className="fu" style={{width:"100%",background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,textAlign:"left",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={32} mood="happy" level={level} animate/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{T.questionsHelp}</p><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>{T.guideHere}</p></div></div>
    </button>
    {practice.length>0?<Btn v="teal" onClick={()=>{setView("practice");resetPractice()}}>{T.startPractice}</Btn>
    :<Btn onClick={()=>finishLesson(lessonIdx,100)}>{T.completeLesson}</Btn>}
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
      <p className="fu s1" style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:6,lineHeight:1.6}}>{locDesc(loc.id)}</p>
      <p className="fu s1" style={{color:C.textDim,fontSize:11,fontFamily:C.font,marginBottom:18,opacity:.8}}>🗓 {T.contentUpdated}: {CONTENT_REVIEWED[getLang()]||CONTENT_REVIEWED.en}</p>

      {/* Progress bar */}
      <div className="fu s2" style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <div style={{flex:1,height:6,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}>
          <div style={{width:`${lessons.length>0?Math.round(completedInPath.length/lessons.length*100):0}%`,height:"100%",background:`linear-gradient(90deg,${C.green},${C.teal})`,borderRadius:3,transition:"width .6s"}}/>
        </div>
        <span style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600}}>{completedInPath.length}/{lessons.length}</span>
      </div>

      {locId==="basics"&&completedInPath.length===0&&isExperienced(getPersona(profile,user))&&<div className="fu s2" style={{background:"rgba(58,168,160,.06)",border:"1px solid rgba(58,168,160,.2)",borderRadius:14,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:18}}>⚡</span><div><p style={{color:C.teal,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>{T.skipAhead}</p><p style={{color:C.textMuted,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{T.skipAheadDesc}</p></div></div>}

      {/* NEXT UP — what to do now (shown after a completion, or whenever there is a lesson to continue) */}
      {(()=>{
        const nextIdx=lessons.findIndex((_,i)=>!isLessonDone(i)&&isLessonUnlocked(i));
        const allDone=lessons.length>0&&completedInPath.length>=lessons.length;
        const locIdx=LOCS.findIndex(l=>l.id===locId);const nextLoc=LOCS[locIdx+1];
        if(allDone)return(<div className="fu s2" style={{background:"rgba(74,186,120,.08)",border:"1px solid rgba(74,186,120,.25)",borderRadius:16,padding:16,marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Lumi size={34} mood="excited" animate/><div><p style={{color:C.green,fontSize:15,fontWeight:800,fontFamily:C.font,margin:0}}>{justDone!==null?T.lessonDone:"🎉"} {T.pathDone}</p>{nextLoc&&<p style={{color:C.textMuted,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>{T.nextStop}: {nextLoc.icon} {locName(nextLoc.id)}</p>}</div></div>
          <Btn v="green" onClick={onBack}>{T.backToMap}</Btn>
        </div>);
        if(nextIdx<0||(completedInPath.length===0&&justDone===null))return null;
        const nl=lessons[nextIdx];const left=lessons.length-completedInPath.length;
        return(<div className="fu s2" style={{background:"rgba(212,165,90,.08)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Lumi size={34} mood={justDone!==null?"excited":"happy"} animate={justDone!==null}/><div style={{minWidth:0}}>{justDone!==null&&<p style={{color:C.green,fontSize:12,fontWeight:800,fontFamily:C.font,margin:"0 0 2px"}}>✓ {T.lessonDone}</p>}<p style={{color:C.goldLight,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,margin:0}}>{T.nextUp} · {T.lesson} {nextIdx+1}</p><p style={{color:C.text,fontSize:15,fontWeight:700,fontFamily:C.font,margin:"2px 0 0"}}>{lessonTitle(nl.title)}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{left===1?T.oneLessonLeft:`${left} ${T.lessonsLeft}`}</p></div></div>
          <Btn onClick={()=>{setJustDone(null);goToLesson(nextIdx)}}>{T.continueLesson}: {T.lesson} {nextIdx+1} →</Btn>
        </div>);
      })()}

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
                  {unlocked?<span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{l.sections.length} {T.sections}{l.practice?.length>0?` · ${l.practice.length} ${T.practice}`:""}</span>
                  :<span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>🔒 {T.lockedReason}</span>}
                  {done&&alt&&<span style={{color:alt.color,fontSize:11,fontWeight:700,fontFamily:C.font,background:alt.bg,padding:"1px 8px",borderRadius:8,border:`1px solid ${alt.border}`}}>{alt.icon} {alt.label} · {score}%</span>}
                  {done&&!alt&&<span style={{color:C.green,fontSize:11,fontFamily:C.font}}>✅ {T.completed}</span>}
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

// THE SUMMIT — a real destination, not another lesson list. Shown once every
// path is complete (the node is locked until then). Celebrates, shows the climb
// in numbers, and points to what keeps people coming back.
const SummitCard=({icon,title,desc,onClick,color})=><button onClick={onClick} className="fu" style={{width:"100%",textAlign:"left",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
  <span style={{fontSize:24,width:36,textAlign:"center"}}>{icon}</span><div style={{flex:1,minWidth:0}}><p style={{color:color||C.text,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{title}</p><p style={{color:C.textMuted,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>{desc}</p></div><span style={{color:C.gold,fontSize:16}}>→</span>
</button>;
const SummitView = ({user,profile,progress,onBack,onOpenChallenge,onOpenTools,onOpenNews,onOpenLoc}) => {
  const [showShare,setShowShare]=useState(false);
  const dk=C.mode==="dark";
  const streak=Math.max(Streak.getData().current||0,profile?.current_streak||0);
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  const donePaths=completedPaths(progress);
  const totalLessons=Object.values(LESSONS).reduce((a,l)=>a+l.length,0);
  const earned=ACHIEVEMENTS.filter(a=>a.condition(progress,profile)).length;
  let scores={};try{scores=JSON.parse(localStorage.getItem("lumicamp_scores")||"{}")}catch{}
  const bestScore=(pid,li)=>Math.max(scores[`${pid}-${li}`]||0,(progress.find(p=>p.path_id===pid&&Number(p.lesson_index)===li)?.score)||0);
  const summitRatings=progress.filter(p=>bestScore(p.path_id,Number(p.lesson_index))>=90).length;
  const improvable=[];
  LOCS.filter(l=>l.id!=="master").forEach(l=>(LESSONS[l.id]||[]).forEach((les,i)=>{const sc=bestScore(l.id,i);if(sc<90)improvable.push({loc:l,idx:i,title:les.title,score:sc})}));
  const name=getFirstName(profile,user,"Climber");
  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid} 35%,${C.bgDark})`,padding:"14px 20px 60px",position:"relative"}}>
    <Stars/><Confetti/>
    <button onClick={onBack} style={{background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"7px 14px",color:C.gold,fontSize:13,fontFamily:C.font,fontWeight:700,position:"relative",zIndex:10,marginBottom:16}}>{T.map}</button>
    <div style={{position:"relative",zIndex:5}}>
      <div className="fu" style={{textAlign:"center",marginBottom:20}}>
        <div style={{display:"inline-block",animation:"celebrate 2s ease-in-out infinite"}}><LumiReaction rating="summit" size={110}/></div>
        <p style={{color:C.gold,fontSize:11,fontWeight:800,fontFamily:C.font,textTransform:"uppercase",letterSpacing:2,margin:"6px 0 4px"}}>⛰️ {locSub("master")}</p>
        <h1 style={{color:C.text,fontSize:26,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 8px",lineHeight:1.2}}>{T.summitTitle}</h1>
        <p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,lineHeight:1.6,margin:0}}>{name}, {T.summitSub.charAt(0).toLowerCase()+T.summitSub.slice(1)}</p>
      </div>

      <p className="fu s1" style={{color:C.textDim,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T.summitStats}</p>
      <div className="fu s1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:22}}>
        {[{v:`${Math.min(progress.length,totalLessons)}/${totalLessons}`,l:T.lessonsDone,i:"📚"},{v:`${donePaths.length}/6`,l:T.learningPaths,i:"🗺️"},{v:summitRatings,l:`${T.summit} · 90%+`,i:"🏔️"},{v:streak,l:T.dayStreak,i:"🔥"},{v:earned+"/"+ACHIEVEMENTS.length,l:T.achievements,i:"🏆"},{v:level,l:T.altitude,i:"⛰️"}].map((st,i)=>
          <div key={i} style={{background:dk?"rgba(255,255,255,.04)":"rgba(255,255,255,.6)",border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 14px"}}><p style={{color:C.text,fontSize:20,fontWeight:800,fontFamily:C.fontDisplay,margin:0}}>{st.i} {st.v}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{st.l}</p></div>)}
      </div>

      <p className="fu s2" style={{color:C.textDim,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T.summitNext}</p>
      <div className="fu s2" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22}}>
        <SummitCard icon={isChallengeDoneToday()?"✅":"⚡"} title={T.summitDaily} desc={isChallengeDoneToday()?T.comeBackTomorrow:T.summitDailyDesc} onClick={onOpenChallenge} color={C.coral}/>
        <SummitCard icon="🛠️" title={T.summitTools} desc={T.summitToolsDesc} onClick={onOpenTools} color={C.teal}/>
        <SummitCard icon="📰" title={T.summitNews} desc={T.summitNewsDesc} onClick={onOpenNews} color={C.goldLight}/>
      </div>

      {improvable.length>0&&<>
        <p className="fu s3" style={{color:C.textDim,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,margin:"0 0 4px"}}>{T.summitImprove}</p>
        <p className="fu s3" style={{color:C.textMuted,fontSize:12,fontFamily:C.font,margin:"0 0 8px"}}>{T.summitImproveDesc} ({improvable.length})</p>
        <div className="fu s3" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22}}>
          {improvable.slice(0,4).map((it,i)=>{const alt=getAltitude(it.score);return<button key={i} onClick={()=>onOpenLoc(it.loc.id)} style={{width:"100%",textAlign:"left",background:C.bgCard,border:`1px solid ${alt.border}`,borderRadius:14,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{it.loc.icon}</span><div style={{flex:1,minWidth:0}}><p style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lessonTitle(it.title)}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{locName(it.loc.id)}</p></div><span style={{color:alt.color,fontSize:11,fontWeight:700,fontFamily:C.font,background:alt.bg,padding:"2px 8px",borderRadius:8,border:`1px solid ${alt.border}`}}>{alt.icon} {it.score}%</span>
          </button>})}
        </div>
      </>}

      <div className="fu s4" style={{display:"flex",flexDirection:"column",gap:8}}>
        <Btn v="gold" onClick={()=>setShowShare(true)}>📤 {T.summitShare}</Btn>
        <p style={{color:C.textDim,fontSize:11,fontFamily:C.font,textAlign:"center",margin:0}}>🎓 {T.summitCert}</p>
      </div>
      {showShare&&<ShareCard type="progress" data={{lessons:progress.length,paths:donePaths.length,streak,level}} onClose={()=>setShowShare(false)}/>}
    </div>
  </div>);
};

// LIVE NEWS - fetches real AI news via Claude web search
// Client-side news cache: the last good result per language. Rendered
// INSTANTLY on open; a fresh copy is pulled in the background only when the
// cached one is older than NEWS_STALE_MS. Pairs with the shared server cache
// in the claude-proxy edge function (one web search serves every user).
const NEWS_STALE_MS=3*60*60*1000;
const newsCacheKey=()=>`lumicamp_news_${getLang()}`;
const getCachedNews=()=>{try{const v=JSON.parse(localStorage.getItem(newsCacheKey())||"null");return v&&Array.isArray(v.articles)&&v.articles.length?v:null}catch{return null}};
const setCachedNews=(articles,fetchedAt)=>{try{localStorage.setItem(newsCacheKey(),JSON.stringify({articles,fetchedAt:fetchedAt||Date.now()}))}catch{}};
const NEWS_STAGES={
  en:["Searching today's AI headlines…","Reading the top stories…","Simplifying them for you…","Almost there — writing the plain-English version…"],
  ar:["…البحث في عناوين الذكاء الاصطناعي لليوم","…قراءة أهم الأخبار","…تبسيطها لك","…أوشكنا — كتابة النسخة المبسطة"],
  fr:["Recherche des titres IA du jour…","Lecture des principales actus…","Simplification pour vous…","Presque fini — rédaction de la version simple…"],
};

const NewsView = ({uid,onBack,onActivity}) => {
  const cached=getCachedNews();
  const [articles,setArticles]=useState(cached?.articles||[]);
  const [fetchedAt,setFetchedAt]=useState(cached?.fetchedAt||null);
  const [loading,setLoading]=useState(!cached);
  const [refreshing,setRefreshing]=useState(false);
  const [elapsed,setElapsed]=useState(0);const stage=Math.min(3,Math.floor(elapsed/6000));
  const [open,setOpen]=useState(null);
  const [chat,setChat]=useState(false);const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);

  // Rotating status while a live search runs, so the wait feels alive, not broken.
  useEffect(()=>{
    if(!loading&&!refreshing)return;
    const t0=Date.now();
    const i=setInterval(()=>setElapsed(Date.now()-t0),500);
    return()=>clearInterval(i);
  },[loading,refreshing]);

  const fetchNews=async(force=false)=>{
    if(articles.length)setRefreshing(true);else setLoading(true);
    try{
      const today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
      const langNote=getLang()!=="en"?` Write ALL titles, summaries, and impact text in ${LANGS[getLang()].name}.`:"";
      const r=await db.callClaude({feature:"news_fetch",use_search:true,lang:getLang(),force,system:`You are Lumi, an AI news curator. Today is ${today}. Search for AI news published TODAY or in the last 24 hours ONLY. Do NOT include news older than 24 hours. Return EXACTLY 4 items as a JSON array. Each item: title (string), category (Breaking/Tools/Policy/Business/Research), summary (2-3 sentence ELI5), impact (why it matters to average person), timeAgo (e.g. "3h ago" or "Today"), source (publication name). Return ONLY valid JSON array, no markdown, no backticks, no extra text.${langNote}`,messages:[{role:"user",content:`Search for the 4 most important AI news stories from ${today}. Only include stories from today or the last 24 hours.`}]});
      try{
        const cleaned=r.text.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
        const parsed=JSON.parse(cleaned);
        if(Array.isArray(parsed)&&parsed.length>0){const at=r.fetched_at||Date.now();setArticles(parsed);setFetchedAt(at);setCachedNews(parsed,at)}
        else throw new Error("bad format");
      }catch{
        if(!articles.length)setArticles([{title:"AI News Loading Issue",category:"Info",summary:"Lumi had trouble formatting today's news. Try refreshing!",impact:"This is a temporary issue.",timeAgo:"now",source:"Lumicamp"}]);
      }
    }catch{if(!articles.length)setArticles([{title:"Couldn't fetch news right now",category:"Info",summary:"Lumi's news connection is down. Check back soon!",impact:"This is temporary.",timeAgo:"now",source:"Lumicamp"}])}
    setLoading(false);setRefreshing(false);setElapsed(0);
  };

  // On open: nothing cached → fetch (server cache usually answers in <1 s);
  // cached but stale → show it and refresh quietly in the background.
  useEffect(()=>{
    const c=getCachedNews();
    if(!c||Date.now()-(c.fetchedAt||0)>NEWS_STALE_MS)fetchNews(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const fetchedLabel=fetchedAt?new Date(fetchedAt).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";

  const art=open!==null?articles[open]:null;
  useBackHandler(()=>{if(chat){setChat(false);setMsgs([]);setSid(null);return true}if(open!==null){setOpen(null);return true}return false});

  const ask=async(q)=>{
    if(uid&&!msgs.some(m=>m.from==="user")){db.bumpTutorSessions(uid).then(()=>onActivity?.()).catch(()=>{});Streak.recordActivity();db.recordActivity(uid,"chat").then(({data})=>Streak.applyServer(data))}
    setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);
    try{const r=await db.callClaude({feature:"news_chat",system:`You are Lumi, explaining this news story: "${art.title}". Summary: ${art.summary}. Explain simply. Under 150 words.`,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"news",context_id:String(open),context_title:art.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch(e){setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:(e?.code==="auth_required"||e?.code==="quota")?e.message:"Connection issue — try again."}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  // Chat
  if(chat&&art)return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bgDark}}>
    <div style={{padding:"12px 16px",paddingTop:(TOP_SAFE+12)+"px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}><button onClick={()=>{setChat(false);setMsgs([]);setSid(null)}} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>{T.back}</button><div style={{flex:1,textAlign:"center"}}><span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>Ask Lumi</span></div></div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}><Bub from="lumi" text={`I've got the details on "${art.title}" — what would you like to know?`}/>{msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text} copyable/>)}{typing&&<Bub from="lumi" typing/>}</div>
    <div style={{padding:"8px 14px",paddingBottom:(12+BOTTOM_SAFE)+"px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={T.askLumi+"..."} style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/><button onClick={send} aria-label="Send" style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:16}}>↑</span></button></div>
  </div>);

  // Article detail
  if(art)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 100px"}}>
    <button onClick={()=>setOpen(null)} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.back}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{fontSize:11,color:C.gold,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:.8}}>{art.category}</span>{art.source&&<span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>· {art.source}</span>}</div>
    <h1 className="fu s1" style={{color:C.text,fontSize:21,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 18px",lineHeight:1.35}}>{art.title}</h1>
    <div className="fu s2" style={{background:"rgba(74,186,120,.06)",border:"1px solid rgba(74,186,120,.12)",borderRadius:16,padding:16,marginBottom:12}}><p style={{color:C.green,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 6px"}}>{T.simpleVersion}</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.summary}</p></div>
    <div className="fu s3" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:12}}><p style={{color:C.gold,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 6px"}}>{T.whyMatters}</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.impact}</p></div>
    <button onClick={()=>setChat(true)} className="fu s4" style={{width:"100%",background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:14,textAlign:"left"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={30}/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{T.askAboutThis}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{T.explainPlain}</p></div></div></button>
  </div>);

  // News list
  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>{T.map}</button>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><h1 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700}}>{T.aiNews}</h1><div style={{display:"flex",alignItems:"center",gap:8}}>
      {!loading&&<button onClick={()=>!refreshing&&fetchNews(true)} disabled={refreshing} aria-label={T.refreshNews} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"4px 10px",color:C.textMuted,fontSize:11,fontFamily:C.font,fontWeight:700,display:"flex",alignItems:"center",gap:5}}><span style={{display:"inline-block",animation:refreshing?"spin 1s linear infinite":"none"}}>↻</span>{refreshing?T.updatedNews:T.refreshNews}</button>}
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"twinkle 2s infinite"}}/><span style={{color:C.green,fontSize:11,fontFamily:C.font,fontWeight:600}}>{T.live}</span></div></div></div>
    <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:refreshing||fetchedLabel?6:18}}>{T.newsDesc}</p>
    {!loading&&(refreshing||fetchedLabel)&&<p style={{color:C.textDim,fontSize:11,fontFamily:C.font,marginBottom:14}}>{refreshing?`↻ ${T.cachedNews}`:`${T.newsFrom} ${fetchedLabel}`}</p>}
    {loading?<div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Lumi size={30} mood="thinking" animate/><div style={{flex:1,minWidth:0}}><p style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>{(NEWS_STAGES[getLang()]||NEWS_STAGES.en)[stage]}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{T.newsSearch}</p></div></div>
        <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(92,8+elapsed/300)}%`,background:`linear-gradient(90deg,${C.gold},${C.goldLight})`,borderRadius:2,transition:"width .5s linear"}}/></div>
      </div>
      {[1,2,3].map(i=><div key={i} className={`fu s${i}`} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}><Skeleton lines={2}/></div>)}
    </div>
    :<div style={{display:"flex",flexDirection:"column",gap:10}}>{articles.map((n,i)=>(<button key={i} className={`fu s${Math.min(i+1,5)}`} onClick={()=>setOpen(i)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:14,textAlign:"left",width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontSize:11,color:C.gold,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:.8}}>{n.category}</span><span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{n.timeAgo}</span>{n.source&&<span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>· {n.source}</span>}</div>
      <p style={{color:C.text,fontSize:14,fontWeight:600,fontFamily:C.font,margin:0,lineHeight:1.4}}>{n.title}</p>
    </button>))}</div>}
  </div>);
};

// DAILY CHALLENGE
const ChallengeView = ({uid,profile,user,onBack,onActivity}) => {
  const today=new Date();
  const dayKey=challengeDayKey(today);
  const isoDay=today.toISOString().slice(0,10);
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(dayKey)||"null")}catch{return null}})();
  // Today's challenge: a generated, goal-aware one (shared per language/goal/day
  // via the server cache) with the 14-item bank as the offline fallback.
  const persona=getPersona(profile,user);
  const genKey=`lumicamp_challenge_gen_${isoDay}_${getLang()}`;
  const [challenge,setChallenge]=useState(()=>{try{const g=JSON.parse(localStorage.getItem(genKey)||"null");if(g?.title&&g?.task)return g}catch{}return saved?.challenge||bankChallenge(today)});
  const [loadingCh,setLoadingCh]=useState(false);
  useEffect(()=>{
    if(saved)return; // already answered today's — don't swap it out
    let cached=null;try{cached=JSON.parse(localStorage.getItem(genKey)||"null")}catch{}
    if(cached?.title)return;
    let alive=true;setLoadingCh(true);
    db.callClaude({feature:"challenge_gen",lang:getLang(),goals:persona.goals,level:persona.exp||"beginner",messages:[{role:"user",content:"today"}]}).then(r=>{
      try{const c=JSON.parse(r.text);if(alive&&c?.title&&c?.task){localStorage.setItem(genKey,JSON.stringify(c));setChallenge(c)}}catch{}
    }).catch(()=>{}).finally(()=>{if(alive)setLoadingCh(false)});
    return()=>{alive=false};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const [response,setResponse]=useState(saved?.response||"");const [feedback,setFeedback]=useState(saved?.feedback||"");const [submitted,setSubmitted]=useState(!!saved);const [grading,setGrading]=useState(false);const [showConfetti,setShowConfetti]=useState(false);
  const [history,setHistory]=useState([]);
  useEffect(()=>{if(uid)db.getChallengeLog(uid).then(setHistory).catch(()=>{})},[uid,submitted]);

  const submit=async()=>{
    setGrading(true);
    let scoreNum=null;
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, grading a daily challenge. The challenge was: "${challenge.title}" - "${challenge.task}". Start with exactly "SCORE: X/10" on the first line. Reserve 8+ for answers with the learner's OWN concrete details (real situation, names, numbers, constraints); 4 or below if it mostly restates the task or is generic. Then: what they did well, and ONE specific improvement suggestion. Be encouraging, never condescending. Under 150 words.${getLang()!=="en"?` Respond ENTIRELY in ${LANGS[getLang()].name} (keep the SCORE line in English).`:""}`,messages:[{role:"user",content:response}],context_type:"tool",context_id:challenge.id,context_title:"Daily Challenge: "+challenge.title});
      const m=r.text.match(/SCORE:\s*(\d+)\s*\/\s*10/i);scoreNum=m?parseInt(m[1]):null;
      setFeedback(r.text.replace(/SCORE:\s*\d+\s*\/\s*10\s*/i,"").trim());setShowConfetti(true);
    }catch(e){
      if(e?.code==="auth_required"||e?.code==="quota"){setGrading(false);return}
      setFeedback("Great effort! Keep practicing daily and you'll build strong AI skills.")}
    setGrading(false);setSubmitted(true);
    // The challenge copy promises "keep your streak alive" — actually do it.
    Streak.recordActivity();
    if(uid){
      db.recordActivity(uid,"challenge").then(({data})=>{Streak.applyServer(data);onActivity?.()});
      db.logChallenge(uid,{day:isoDay,challenge_id:challenge.id,title:challenge.title,score:scoreNum}).catch(()=>{});
    }
  };
  useEffect(()=>{if(submitted&&feedback){try{localStorage.setItem(dayKey,JSON.stringify({response,feedback,challenge}))}catch{}}},[submitted,feedback]);

  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 40px"}}>
    {showConfetti&&<Confetti/>}
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>{T.map}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontSize:24}}>{submitted?"✅":"⚡"}</span><h1 style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{T.dailyChallenge}</h1>{submitted&&<span style={{color:C.green,fontSize:11,fontWeight:800,fontFamily:C.font,background:"rgba(74,186,120,.12)",border:"1px solid rgba(74,186,120,.3)",borderRadius:10,padding:"3px 9px"}}>{T.challengeDone}</span>}</div>
    <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,marginBottom:18}}>{submitted?T.comeBackTomorrow:T.challengeDesc}</p>

    <div className="fu s1" style={{background:"rgba(232,128,96,.06)",border:"1px solid rgba(232,128,96,.15)",borderRadius:16,padding:16,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Lumi size={28} mood={loadingCh?"thinking":"excited"} animate={loadingCh}/><div style={{flex:1,minWidth:0}}><p style={{color:C.coral,fontSize:15,fontWeight:700,fontFamily:C.font,margin:0}}>{challenge.title}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{challenge.desc}</p></div>{persona.goals?.[0]&&String(challenge.id||"").startsWith("gen-")&&<span style={{color:C.coral,fontSize:11,fontWeight:700,fontFamily:C.font,background:"rgba(232,128,96,.12)",border:"1px solid rgba(232,128,96,.25)",borderRadius:8,padding:"2px 7px",whiteSpace:"nowrap"}}>🎯 {persona.goals[0]}</span>}</div>
      <p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{challenge.task}</p>
      {loadingCh&&<p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"8px 0 0"}}>✨ Lumi is tailoring today's challenge to your goals…</p>}
    </div>

    {!submitted?<>
      <textarea value={response} onChange={e=>setResponse(e.target.value)} placeholder={T.typeAnswer} style={{width:"100%",minHeight:140,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical",marginBottom:12}}/>
      <Btn onClick={submit} disabled={!response.trim()||grading} v="teal">{grading?T.lumiReviewing:T.submitChallenge}</Btn>
    </>:<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Lumi size={28} mood="excited" animate/><span style={{color:C.goldLight,fontSize:15,fontWeight:700,fontFamily:C.font}}>Lumi's Review</span></div>
      <p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0,whiteSpace:"pre-wrap"}}>{feedback}</p>
      <details style={{marginTop:10}}><summary style={{color:C.textDim,fontSize:12,fontFamily:C.font,cursor:"pointer"}}>{T.yourAnswers}</summary><p style={{color:C.textMuted,fontSize:13,lineHeight:1.6,fontFamily:C.font,margin:"6px 0 0",whiteSpace:"pre-wrap"}}>{response}</p></details>
      <div style={{display:"flex",gap:8,marginTop:12}}><div style={{flex:1}}><CopyBtn text={`${challenge.title}\n\n${response}\n\n— Lumi: ${feedback}`}/></div>{canShare()&&<div style={{flex:1}}><Btn v="ghost" onClick={()=>shareText("Lumicamp Daily Challenge",`${challenge.title}\n\n${response}`)}>📤 {T.share}</Btn></div>}</div>
      <p style={{color:C.green,fontSize:13,fontWeight:700,fontFamily:C.font,marginTop:12}}>{T.challengeComplete} {T.comeBackTomorrow}.</p>
      <div style={{marginTop:14}}><Btn v="ghost" onClick={onBack}>{T.backToMap}</Btn></div>
    </div>}
    {history.length>0&&<div className="fu s3" style={{marginTop:18}}>
      <p style={{color:C.textDim,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>🗓 {T.challengeHistory} · {history.length}</p>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>{history.slice(0,7).map(h=><div key={h.day} style={{display:"flex",alignItems:"center",gap:10,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"8px 12px"}}><span style={{color:C.textDim,fontSize:11,fontFamily:C.font,width:48}}>{h.day.slice(5)}</span><span style={{color:C.textMuted,fontSize:12,fontFamily:C.font,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.title||h.challenge_id}</span>{h.score!=null&&<span style={{color:h.score>=8?C.green:C.gold,fontSize:11,fontWeight:700,fontFamily:C.font}}>{h.score}/10</span>}</div>)}</div>
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
const ToolsView = ({uid,onBack,profile,user}) => {
  const rec=recommendedTools(getPersona(profile,user));
  const orderedTools=[...TOOLS].sort((a,b)=>(rec.includes(a.id)?0:1)-(rec.includes(b.id)?0:1));
  const [wf,setWf]=useState(null);const [step,setStep]=useState(0);const [ans,setAns]=useState([]);const [ft,setFt]=useState("");const [gen,setGen]=useState(false);const [result,setResult]=useState(null);
  const reset=()=>{setWf(null);setStep(0);setAns([]);setFt("");setResult(null)};
  const [history,setHistory]=useState(()=>ToolHistory.list());
  const [showAnswers,setShowAnswers]=useState(false);
  const doGen=async(all)=>{setGen(true);try{const prompt=wf.steps.map((s,i)=>`${s.q}: ${all[i]}`).join("\n");const r=await db.callClaude({feature:"tool",system:wf.sys+" You are Lumi from Lumicamp. Practical, beginner-friendly.",messages:[{role:"user",content:prompt}],context_type:"tool",context_id:wf.id,context_title:wf.name});setResult(r.text);ToolHistory.add({tool:wf.id,answers:all,text:r.text});setHistory(ToolHistory.list())}catch(e){setResult((e?.code==="auth_required"||e?.code==="quota")?e.message:"Something went wrong — try again.")}setGen(false)};
  useBackHandler(()=>{if(gen)return true;if(result||wf){reset();return true}return false});
  const openSaved=(h)=>{const t=TOOLS.find(x=>x.id===h.tool);if(!t)return;setWf(t);setAns(h.answers||[]);setResult(h.text);setShowAnswers(false)};
  const pick=(v)=>{const na=[...ans,v];setAns(na);if(step<wf.steps.length-1)setTimeout(()=>setStep(step+1),200);else doGen(na)};

  if(result)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 60px"}}>
    <button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>{T.toolsBack}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Lumi size={24}/><h2 style={{color:C.text,fontSize:18,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{toolName(wf.id)}</h2></div>
    <p className="fu" style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"0 0 12px"}}>💾 {T.savedNote}</p>
    <div className="fu s1" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:12,userSelect:"text",WebkitUserSelect:"text"}}><p style={{color:C.text,fontSize:14,lineHeight:1.75,fontFamily:C.font,whiteSpace:"pre-wrap",margin:0}}><Md text={result}/></p></div>
    <div style={{display:"flex",gap:8,marginBottom:10}}><div style={{flex:1}}><CopyBtn text={result} v="gold"/></div>{canShare()&&<div style={{flex:1}}><Btn v="ghost" onClick={()=>shareText(toolName(wf.id),result)}>📤 {T.share}</Btn></div>}</div>
    <div style={{display:"flex",gap:8,marginBottom:14}}><div style={{flex:1}}><Btn v="ghost" onClick={()=>setShowAnswers(a=>!a)}>{showAnswers?"▲":"▼"} {T.yourAnswers}</Btn></div><div style={{flex:1}}><Btn v="ghost" onClick={reset}>✨ {T.newResult}</Btn></div></div>
    {showAnswers&&<div className="fi" style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:14}}>{wf.steps.map((st,i)=><p key={i} style={{color:C.textMuted,fontSize:12,fontFamily:C.font,margin:"0 0 6px"}}><span style={{color:C.textDim}}>{st.q}</span> {ans[i]}</p>)}</div>}
  </div>);
  if(gen)return(<div style={{height:"100vh",background:C.bgDark,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><Lumi size={56} mood="thinking" animate/><p className="fu" style={{color:C.textMuted,fontSize:15,fontFamily:C.font,marginTop:14}}>Working on it...</p></div>);
  if(wf){const s=wf.steps[step];return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}><button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:10}}>{T.back}</button><div style={{display:"flex",gap:3,marginBottom:18}}>{wf.steps.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,fontWeight:700,marginBottom:3}}>Step {step+1}/{wf.steps.length}</p><h2 className="fu" style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 18px"}}>{s.q}</h2>
    {s.free?<div className="fu s1"><textarea value={ft} onChange={e=>setFt(e.target.value)} placeholder={s.ph} style={{width:"100%",minHeight:100,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical"}}/><div style={{marginTop:10}}><Btn onClick={()=>pick(ft||"General")} disabled={!ft.trim()}>{step<wf.steps.length-1?"Next →":"Generate"}</Btn></div></div>
    :<div style={{display:"flex",flexDirection:"column",gap:8}}>{s.opts.map((o,i)=><button key={o} className={`pop s${Math.min(i+1,5)}`} onClick={()=>pick(o)} style={{background:"rgba(255,255,255,.03)",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 16px",textAlign:"left",width:"100%"}}><span style={{color:C.textMuted,fontSize:14,fontFamily:C.font}}>{o}</span></button>)}</div>}
  </div>)}
  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}><button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>{T.map}</button><h1 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,marginBottom:4}}>{T.aiTools}</h1><p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:18}}>{T.toolsDesc}</p>
    {history.length>0&&<div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><p style={{color:C.textDim,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1,margin:0}}>🕘 {T.recentResults}</p><button onClick={()=>{ToolHistory.clear();setHistory([])}} style={{background:"none",border:"none",color:C.textDim,fontSize:11,fontFamily:C.font}}>{T.clearRecent}</button></div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginLeft:-20,marginRight:-20,paddingLeft:20,paddingRight:20}}>
        {history.slice(0,10).map(h=>{const t=TOOLS.find(x=>x.id===h.tool);if(!t)return null;return<button key={h.id} onClick={()=>openSaved(h)} style={{flex:"0 0 210px",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"10px 12px",textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><Icon type={t.iconType} size={14} color={t.color}/><span style={{color:t.color,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:.6,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{toolName(t.id)}</span><span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{timeAgo(h.at)}</span></div>
          <p style={{color:C.textMuted,fontSize:12,lineHeight:1.4,fontFamily:C.font,margin:0,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{(h.text||"").replace(/[#*_`>]/g,"").trim()}</p>
        </button>})}
      </div>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>{orderedTools.map((t,i)=>(<button key={t.id} className={`fu s${Math.min(i+1,5)}`} onClick={()=>{setWf(t);setStep(0);setAns([]);setFt("");setResult(null)}} style={{background:C.bgCard,border:`1px solid ${rec.includes(t.id)?t.color+"55":C.border}`,borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%"}}><div style={{width:48,height:48,borderRadius:14,background:`${t.color}12`,border:`1px solid ${t.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon type={t.iconType} size={26} color={t.color}/></div><div style={{flex:1}}><p style={{color:C.text,fontSize:15,fontWeight:700,fontFamily:C.font,margin:0}}>{toolName(t.id)}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{toolDesc(t.id)}</p>{rec.includes(t.id)&&<p style={{color:t.color,fontSize:11,fontWeight:700,fontFamily:C.font,margin:"4px 0 0"}}>🎯 {T.recommended}</p>}</div><span style={{color:t.color,fontSize:16,opacity:.5}}>→</span></button>))}</div>
  </div>);
};

// PROFILE
// Accessibility prefs — larger text (body zoom, since styles are px-based) and
// reduced motion. Persisted per device; also honours the OS-level setting.
const A11Y_KEY="lumicamp_a11y";
const getA11y=()=>{try{return{textLarge:false,reduceMotion:false,...JSON.parse(localStorage.getItem(A11Y_KEY)||"{}")}}catch{return{textLarge:false,reduceMotion:false}}};
const setA11y=(patch)=>{const n={...getA11y(),...patch};try{localStorage.setItem(A11Y_KEY,JSON.stringify(n))}catch{}applyA11y(n);return n};
const applyA11y=(a=getA11y())=>{try{document.documentElement.dataset.textLarge=a.textLarge?"1":"";document.documentElement.dataset.reduceMotion=a.reduceMotion?"1":""}catch{}};
applyA11y();

const ProfileView = ({user,profile,progress,onBack,onSignOut,onToggleTheme,onChangeLang,onSignIn,onAccountGone}) => {
  const [a11y,setA11yState]=useState(()=>getA11y());
  const [confirm,setConfirm]=useState(null); // "reset" | "delete"
  const [confirmText,setConfirmText]=useState("");
  const [busy,setBusy]=useState(false);
  const [exportMsg,setExportMsg]=useState("");
  const exportData=async()=>{
    const keys=["lumicamp_scores","lumicamp_tool_history","lumicamp_streak","lumicamp_a11y","lumicamp_lang","lumicamp_theme"];
    const local={};for(const k of keys){try{local[k]=JSON.parse(localStorage.getItem(k))}catch{local[k]=localStorage.getItem(k)}}
    const payload={exported_at:new Date().toISOString(),user:{id:user?.id,email:user?.email},profile,progress,challenges:user?.id?await db.getChallengeLog(user.id).catch(()=>[]):[],local};
    const json=JSON.stringify(payload,null,2);
    try{if(!_isNative){const a=document.createElement("a");a.href="data:application/json;charset=utf-8,"+encodeURIComponent(json);a.download=`lumicamp-export-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove()}}catch{}
    if(canShare()){try{await navigator.share({title:"Lumicamp export",text:json})}catch{}}
    await copyText(json);setExportMsg(T.exported);setTimeout(()=>setExportMsg(""),2500);
  };
  const runConfirm=async()=>{
    if(confirm==="reset"&&confirmText.trim().toUpperCase()!=="RESET")return;
    if(confirm==="delete"&&confirmText.trim().toUpperCase()!=="DELETE")return;
    setBusy(true);
    try{
      if(confirm==="reset"){
        const {error}=await db.resetMyProgress();if(error)throw error;
        for(const k of ["lumicamp_scores","lumicamp_local_progress",SYNC_QUEUE_KEY,"lumicamp_streak","lumicamp_tool_history"])localStorage.removeItem(k);
        Object.keys(localStorage).filter(k=>k.startsWith("lumicamp_challenge_")||k.startsWith("lumicamp_milestone")).forEach(k=>localStorage.removeItem(k));
        onAccountGone?.("reset");
      }else{
        const {error}=await db.deleteMyAccount();if(error)throw error;
        Object.keys(localStorage).filter(k=>k.startsWith("lumicamp_")&&!["lumicamp_lang","lumicamp_theme","lumicamp_a11y"].includes(k)).forEach(k=>localStorage.removeItem(k));
        onAccountGone?.("deleted");
      }
      setConfirm(null);setConfirmText("");
    }catch(e){alert((e?.message||"Something went wrong")+"\n\nIf this keeps happening, email support and we'll do it for you.")}
    setBusy(false);
  };
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  const donePaths=completedPaths(progress);
  const scores=(() => {const local=(()=>{try{return JSON.parse(localStorage.getItem("lumicamp_scores")||"{}")}catch{return{}}})();for(const p of progress||[]){if(p.score){const k=`${p.path_id}-${p.lesson_index}`;local[k]=Math.max(local[k]||0,p.score)}}return local})();
  const summitCount=Object.values(scores).filter(s=>s>=90).length;
  const ridgeCount=Object.values(scores).filter(s=>s>=70&&s<90).length;
  const totalScored=Object.keys(scores).length;
  const streakData={...Streak.getData(),current:Math.max(Streak.getData().current||0,profile?.current_streak||0),best:Math.max(Streak.getData().best||0,profile?.longest_streak||0)};
  const [showShare,setShowShare]=useState(false);

  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.bgDark})`,padding:"14px 20px 40px",position:"relative"}}><Stars/>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:18,position:"relative",zIndex:1}}>{T.map}</button>

    {/* Profile header */}
    <div className="fu" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20,position:"relative",zIndex:1}}>
      <Lumi size={80} mood="excited" level={level} animate/>
      <p style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,marginTop:8}}>{getDisplayName(profile,user,"Explorer")}</p>
      <p style={{color:C.textDim,fontSize:12,fontFamily:C.font}}>Altitude {level} · {profile?.role||"Learner"}{user?.email?` · ${user.email}`:""}</p>
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
          <p style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{s.l}</p>
        </div>
      ))}
    </div>

    {/* Streak Calendar */}
    <div className="fu s2" style={{marginBottom:16,position:"relative",zIndex:1}}><StreakCalendar/></div>

    {/* Altitude ratings earned */}
    {totalScored>0&&<div className="fu s2" style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:16,position:"relative",zIndex:1}}>
      <p style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font,margin:"0 0 12px"}}>{T.altRatings}</p>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <div style={{textAlign:"center"}}><span style={{fontSize:24}}>🏔️</span><p style={{color:"#FFD700",fontSize:18,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{summitCount}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{T.summit}</p></div>
        <div style={{textAlign:"center"}}><span style={{fontSize:24}}>⛰️</span><p style={{color:C.green,fontSize:18,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{ridgeCount}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{T.ridge}</p></div>
        <div style={{textAlign:"center"}}><span style={{fontSize:24}}>📊</span><p style={{color:C.teal,fontSize:18,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{totalScored}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{T.graded}</p></div>
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
                <span style={{color:pct===100?C.green:C.textDim,fontSize:11,fontFamily:C.font,fontWeight:600}}>{completed}/{lessons.length}</span>
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

    {/* Accessibility */}
    <div className="fu s3" style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:16,position:"relative",zIndex:1}}>
      <p style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font,margin:"0 0 10px"}}>♿ {T.textSize} · {T.reduceMotion}</p>
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        {[["textNormal",false],["textLarge",true]].map(([k,v])=><button key={k} aria-pressed={a11y.textLarge===v} onClick={()=>setA11yState(setA11y({textLarge:v}))} style={{flex:1,background:a11y.textLarge===v?"rgba(212,165,90,.15)":"transparent",border:`1.5px solid ${a11y.textLarge===v?C.gold:C.border}`,borderRadius:12,padding:"10px",color:C.text,fontSize:v?16:14,fontWeight:700,fontFamily:C.font}}>Aa {T[k]}</button>)}
      </div>
      <button aria-pressed={a11y.reduceMotion} onClick={()=>setA11yState(setA11y({reduceMotion:!a11y.reduceMotion}))} style={{width:"100%",background:a11y.reduceMotion?"rgba(212,165,90,.15)":"transparent",border:`1.5px solid ${a11y.reduceMotion?C.gold:C.border}`,borderRadius:12,padding:"10px",color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font,textAlign:"left",display:"flex",justifyContent:"space-between"}}><span>{T.reduceMotion}</span><span>{a11y.reduceMotion?"✓":"○"}</span></button>
    </div>

    {/* Data & account */}
    {user&&<div className="fu s4" style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:16,position:"relative",zIndex:1}}>
      <p style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font,margin:"0 0 10px"}}>🔐 {T.dataAccount}</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <Btn v="ghost" onClick={exportData}>{exportMsg||("📦 "+T.exportData)}</Btn>
        <Btn v="ghost" onClick={()=>{setConfirm("reset");setConfirmText("")}}>↺ {T.resetProgress}</Btn>
        <Btn v="ghost" style={{color:C.red}} onClick={()=>{setConfirm("delete");setConfirmText("")}}>🗑 {T.deleteAccount}</Btn>
      </div>
      {confirm&&<div className="fu" style={{marginTop:12,background:"rgba(216,88,88,.06)",border:`1px solid ${C.red}55`,borderRadius:14,padding:14}}>
        <p style={{color:C.text,fontSize:13,lineHeight:1.6,fontFamily:C.font,margin:"0 0 10px"}}>{confirm==="reset"?T.resetConfirm:T.deleteConfirm}</p>
        <input value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder={confirm==="reset"?"RESET":"DELETE"} aria-label="Confirmation" style={{width:"100%",background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none",marginBottom:10}}/>
        <div style={{display:"flex",gap:8}}><div style={{flex:1}}><Btn v="ghost" onClick={()=>setConfirm(null)}>Cancel</Btn></div><div style={{flex:1}}><Btn v="red" disabled={busy||confirmText.trim().toUpperCase()!==(confirm==="reset"?"RESET":"DELETE")} onClick={runConfirm}>{busy?"…":confirm==="reset"?T.resetProgress:T.deleteAccount}</Btn></div></div>
      </div>}
    </div>}

    {/* Share progress */}
    <div className="fu s4" style={{marginBottom:8,position:"relative",zIndex:1}}>
      <Btn v="gold" onClick={()=>setShowShare(true)}>{T.shareProgress}</Btn>
    </div>
    {showShare&&<ShareCard type="progress" data={{lessons:progress.length,paths:donePaths.length,streak:streakData.current||0,level}} onClose={()=>setShowShare(false)}/>}
    {!user&&<div className="fu s5" style={{marginBottom:8,position:"relative",zIndex:1}}><Btn v="teal" onClick={onSignIn}>Sign in</Btn></div>}

    <div className="fu s5" style={{display:"flex",gap:8,position:"relative",zIndex:1}}>
      <button onClick={onToggleTheme} style={{flex:1,background:C.mode==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 24px",fontSize:15,fontWeight:700,fontFamily:C.font,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {C.mode==="dark"?T.lightMode:T.darkMode}
      </button>
      {user&&<button onClick={onSignOut} style={{flex:1,background:C.mode==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 24px",fontSize:15,fontWeight:700,fontFamily:C.font,color:C.textMuted}}>{T.signOut}</button>}
    </div>
    <p className="fu s5" style={{textAlign:"center",color:C.textDim,fontSize:11,fontFamily:C.font,marginTop:16,position:"relative",zIndex:1}}>Lumicamp v5 · Powered by Claude</p>
  </div>);
};

// TUTORIAL — animated walkthrough for first-time users
const Tutorial = ({onComplete}) => {
  const [step,setStep]=useState(0);
  const slides=[
    {
      title:"Welcome to Lumicamp",
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
            <div style={{textAlign:"center"}}><Lumi size={40} mood="happy" level={1}/><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"4px 0 0"}}>Beginner</p></div>
            <div style={{textAlign:"center"}}><Lumi size={40} mood="happy" level={3}/><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"4px 0 0"}}>Level 3</p></div>
            <div style={{textAlign:"center"}}><Lumi size={40} mood="excited" level={5}/><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"4px 0 0"}}>Level 5</p></div>
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
            <span style={{fontSize:20}}>📖</span><div><p style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>Read</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:0}}>Learn the concepts</p></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(212,165,90,.08)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(212,165,90,.15)"}}>
            <span style={{fontSize:20}}>💬</span><div><p style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>Ask Lumi</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:0}}>Get instant help</p></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(58,168,160,.08)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(58,168,160,.15)"}}>
            <span style={{fontSize:20}}>✍️</span><div><p style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font,margin:0}}>Practice</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:0}}>Prove your skills</p></div>
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
              <p style={{color:C.textMuted,fontSize:11,fontFamily:C.font,margin:0}}>{f.label}</p>
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
      <div style={{padding:"0 24px",paddingBottom:(30+BOTTOM_SAFE)+"px",position:"relative",zIndex:10}}>
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
export default function Lumicamp(){
  const [loading,setLoading]=useState(true);const [user,setUser]=useState(null);const [profile,setProfile]=useState(null);const [progress,setProgress]=useState(()=>mergeProgress(getLocalProgress()));
  const [screen,setScreen]=useState("map");const [activeLoc,setActiveLoc]=useState(null);const [routeToken,setRouteToken]=useState("");
  const [showTutorial,setShowTutorial]=useState(()=>!localStorage.getItem("lumicamp_tutorial_seen"));
  const [showAuthPrompt,setShowAuthPrompt]=useState(false);
  const [showNamePrompt,setShowNamePrompt]=useState(false);
  const [savingName,setSavingName]=useState(false);
  const [activeOrgId,setActiveOrgId]=useState(null);
  const [theme,setThemeState]=useState(()=>getTheme());
  const toggleTheme=()=>{const nt=theme==="dark"?"light":"dark";setTheme(nt);setThemeState(nt);C={...THEMES[nt]};if(user?.id)db.savePrefs(user.id,{theme:nt})};
  const [lang,setLangState]=useState(()=>getLang());
  const changeLang=(l)=>{setLang(l);setLangState(l);T={...UI[l]};if(user?.id)db.savePrefs(user.id,{language:l})};
  // On a fresh device nothing is in localStorage yet — adopt the saved profile
  // prefs. Never override a choice already made on this device.
  const applyProfilePrefs=useCallback((p)=>{
    if(!p)return;
    try{
      if(p.language&&UI[p.language]&&!localStorage.getItem("lumicamp_lang")){setLang(p.language);setLangState(p.language);T={...UI[p.language]}}
      if(p.theme&&THEMES[p.theme]&&!localStorage.getItem("lumicamp_theme")){setTheme(p.theme);setThemeState(p.theme);C={...THEMES[p.theme]}}
      if(p.tutorial_seen){localStorage.setItem("lumicamp_tutorial_seen","1");setShowTutorial(false)}
    }catch{}
    Streak.syncFromServer(p);
  },[]);

  const addOrUpdateLocalProgress=useCallback((nodeId,lessonId,score)=>{
    setProgress(prev=>{
      const existing=(prev||[]).filter(p=>!(p.path_id===nodeId&&p.lesson_index===lessonId));
      const row={path_id:nodeId,lesson_index:lessonId,node_id:nodeId,lesson_id:lessonId,score:score??100,completed_at:new Date().toISOString()};
      const next=[...existing,row];
      setLocalProgress(next);
      return next;
    });
  },[]);

  const enqueueSync=useCallback((row)=>{
    const q=getSyncQueue();
    const next=[...q,row].slice(-MAX_SYNC_QUEUE);
    setSyncQueue(next);
  },[]);

  const flushSyncQueue=useCallback(async()=>{
    if(!user?.id)return;
    const queue=getSyncQueue();
    if(!queue.length)return;
    const pending=[];
    for(const item of queue){
      const payload={...item,user_id:user.id,org_id:activeOrgId??item.org_id??null};
      const {error}=await db.upsertUserProgress(payload);
      // Keep retrying transient failures (offline, 5xx); drop rows the DB will
      // never accept (bad shape / unknown column) so the queue can't wedge.
      const permanent=error&&(error.code==="42703"||error.code==="22P02"||error.code==="23502"||/missing user_id/.test(error.message||""));
      if(error&&!permanent)pending.push(item);
    }
    setSyncQueue(pending);
  },[user,activeOrgId]);

  const syncProgressFireAndForget=useCallback((nodeId,lessonId,score)=>{
    if(!user?.id)return;
    const row={user_id:user.id,org_id:activeOrgId,node_id:nodeId,lesson_id:lessonId,score:score??100,completed_at:new Date().toISOString()};
    db.upsertUserProgress(row).then(({error})=>{if(error)enqueueSync(row)}).catch(()=>enqueueSync(row));
  },[user,activeOrgId,enqueueSync]);

  const handleLessonComplete=useCallback((nodeId,lessonId,score)=>{
    addOrUpdateLocalProgress(nodeId,lessonId,score);
    syncProgressFireAndForget(nodeId,lessonId,score);
  },[addOrUpdateLocalProgress,syncProgressFireAndForget]);

  const requireDisplayName=useCallback((p,u)=>{
    setShowNamePrompt(!!u?.id&&!hasDisplayName(p,u));
  },[]);

  const saveDisplayName=useCallback(async(name,setErr)=>{
    if(!user?.id)return;
    setSavingName(true);
    const {error}=await db.saveDisplayName(user.id,name);
    setSavingName(false);
    if(error){setErr("Could not save your name. Please try again.");return}
    const p=await db.getProfile(user.id);
    setProfile(p||{});
    try{const s=await db.getSession();if(s?.user)setUser(s.user)}catch{}
    setShowNamePrompt(false);
  },[user]);

  useEffect(()=>{
    if(_isNative)return;
    const path=window.location.pathname||"/";
    if(path.startsWith("/join/")){
      const token=decodeURIComponent(path.split("/")[2]||"").trim();
      if(token){setRouteToken(token);setScreen("joinOrg")}
      window.history.replaceState({},"","/");
      return;
    }
    if(path.startsWith("/verify/")){
      const code=decodeURIComponent(path.split("/")[2]||"").trim();
      if(code){setRouteToken(code);setScreen("certVerify")}
      window.history.replaceState({},"","/");
    }
  },[]);

  const flushRef=useRef(flushSyncQueue);
  useEffect(()=>{flushRef.current=flushSyncQueue},[flushSyncQueue]);

  useEffect(()=>{
    // Failsafe: if loading takes more than 5 seconds, force it to stop
    const timeout=setTimeout(()=>{setLoading(false);console.warn("Loading timeout — forced to app screen")},5000);
    const init=async()=>{
      refreshLessonOverrides(); // non-blocking; applies for the next screen
      try{
        const s=await db.getSession();
        if(s?.user){
          setUser(s.user);
          try{
            const p=await db.getProfile(s.user.id);
            setProfile(p||{});
            requireDisplayName(p||{},s.user);
            applyProfilePrefs(p);
          }catch(e){console.warn("Profile load failed:",e);setProfile({});requireDisplayName({},s.user)}
          setProgress(await loadProgress(s.user.id,getLocalProgress()));
          try{setActiveOrgId(await db.getActiveOrgByUser(s.user.id))}catch(e){setActiveOrgId(null)}
        }
      }catch(e){console.error("Init error:",e)}
      clearTimeout(timeout);
      setLoading(false);
    };
    init();
    const{data}=db.onAuth(async(ev,s)=>{
      // Clear the sign-in modal the moment ANY session arrives (OTP, magic link,
      // restored session, OAuth) — otherwise the stale flag re-opens it on the
      // next screen now that the overlay renders everywhere.
      if(s?.user)setShowAuthPrompt(false);
      if(ev==="SIGNED_IN"&&s?.user){setUser(s.user);try{const p=await db.getProfile(s.user.id);setProfile(p||{});requireDisplayName(p||{},s.user);applyProfilePrefs(p)}catch(e){setProfile({});requireDisplayName({},s.user)}setProgress(await loadProgress(s.user.id,getLocalProgress()));try{setActiveOrgId(await db.getActiveOrgByUser(s.user.id))}catch(e){setActiveOrgId(null)}setShowAuthPrompt(false);flushRef.current()}else if(ev==="SIGNED_OUT"){setUser(null);setProfile(null);setActiveOrgId(null);setProgress(getLocalProgress())}});
    return()=>{clearTimeout(timeout);data?.subscription?.unsubscribe?.()};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Hardware / browser back: innermost handler first, then screen → map, then
  // (native only) exit the app.
  const screenRef=useRef(screen);const authRef=useRef(showAuthPrompt);
  useEffect(()=>{screenRef.current=screen;authRef.current=showAuthPrompt;if(screen!=="map"||showAuthPrompt)BackStack.arm()},[screen,showAuthPrompt]);
  useEffect(()=>{
    BackStack.arm();
    const onPop=()=>{
      if(authRef.current){setShowAuthPrompt(false);BackStack.arm();return}
      if(BackStack.handle()){BackStack.arm();return}
      if(screenRef.current!=="map"){setScreen("map");setActiveLoc(null);BackStack.arm();return}
      if(_isNative){try{window.Capacitor?.Plugins?.App?.exitApp?.()}catch{}}
      // On the web, at the map with nothing to close, let the browser leave.
    };
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);

  // The AI proxy now requires a signed-in user beyond a small trial quota; when
  // it says so, open the sign-in sheet right where the person is.
  useEffect(()=>{
    const onAuthReq=()=>setShowAuthPrompt(true);
    window.addEventListener("lumicamp:auth-required",onAuthReq);
    return()=>window.removeEventListener("lumicamp:auth-required",onAuthReq);
  },[]);

  useEffect(()=>{
    const onFocus=()=>{flushSyncQueue()};
    const onOnline=()=>{flushSyncQueue()};
    window.addEventListener("focus",onFocus);
    window.addEventListener("online",onOnline);
    return()=>{window.removeEventListener("focus",onFocus);window.removeEventListener("online",onOnline)};
  },[flushSyncQueue]);

  const refresh=async()=>{
    if(user){
      const p=await db.getProfile(user.id);setProfile(p);Streak.syncFromServer(p);
      // Merge, don't replace: the just-claimed lesson lives in local state and
      // may not have reached Supabase yet (fire-and-forget upsert).
      setProgress(prev=>{const m=mergeProgress(getLocalProgress(),prev);setLocalProgress(m);return m});
      loadProgress(user.id,getLocalProgress()).then(m=>setProgress(prev=>mergeProgress(prev,m)));
    }
    // Record streak activity when user completes something
    Streak.recordActivity();
  };
  const out=async()=>{await db.signOut();setUser(null);setProfile(null);setActiveOrgId(null);setProgress(getLocalProgress())};
  const goMap=()=>{setScreen("map");setActiveLoc(null)};

  // Record streak on initial load if user is active
  useEffect(()=>{if(user) Streak.check()},[user]);

  if(loading)return<><style>{getCss()}</style><div onClick={()=>setLoading(false)} style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",cursor:"pointer"}}><Stars/><Lumi size={56} mood="happy" level={1} animate/><p style={{color:C.textMuted,fontSize:14,fontFamily:"'Nunito',sans-serif",marginTop:14}}>{T.loading}</p></div></>;
  // Onboarding: trust either the server flag or the local fallback (set when the
  // profile save failed/timed out) so nobody can get stuck in onboarding.
  const locallyOnboarded=(()=>{try{return !!user&&localStorage.getItem(`lumicamp_onboarded_${user.id}`)==="1"}catch{return false}})();
  if(user&&profile&&!profile.onboarded&&!locallyOnboarded)return<><style>{getCss()}</style><Onboarding uid={user.id} onDone={refresh}/></>;
  if(showTutorial&&user)return<><style>{getCss()}</style><Tutorial onComplete={()=>{localStorage.setItem("lumicamp_tutorial_seen","1");setShowTutorial(false);if(user?.id)db.savePrefs(user.id,{tutorial_seen:true})}}/></>;

  // Auth modal is rendered on EVERY screen (previously only on the map + joinOrg
  // screens, so tapping "Sign in" from the profile page appeared to do nothing).
  const authOverlay=showAuthPrompt&&!user&&<div style={{position:"fixed",inset:0,zIndex:110,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <AuthScreen onClose={()=>setShowAuthPrompt(false)}
      headline={screen==="joinOrg"?"Sign in to join your team":"Sign in or create your free account"}
      subhead={screen==="joinOrg"?"Use your invited email — we'll send a 6-digit code.":"Enter your email and we'll send a 6-digit code (or a sign-in link). No password needed."}/>
  </div>;

  let content;
  if(screen==="location"&&activeLoc==="master")content=<SummitView user={user} profile={profile} progress={progress} onBack={goMap} onOpenChallenge={()=>setScreen("challenge")} onOpenTools={()=>setScreen("tools")} onOpenNews={()=>setScreen("news")} onOpenLoc={(id)=>{setActiveLoc(id);setScreen("location")}}/>;
  else if(screen==="location"&&activeLoc)content=<LocView user={user} locId={activeLoc} uid={user?.id} progress={progress} profile={profile} onBack={goMap} onComplete={refresh} onLessonComplete={handleLessonComplete} onActivity={refresh}/>;
  else if(screen==="news")content=<NewsView uid={user?.id} onBack={goMap} onActivity={refresh}/>;
  else if(screen==="tools")content=<ToolsView uid={user?.id} profile={profile} user={user} onBack={goMap}/>;
  else if(screen==="challenge")content=<ChallengeView uid={user?.id} profile={profile} user={user} onBack={goMap} onActivity={refresh}/>;
  else if(screen==="achievements")content=<AchievementsView profile={profile} progress={progress} onBack={goMap}/>;
  else if(screen==="profile")content=<ProfileView user={user} profile={profile} progress={progress} onBack={goMap} onSignOut={out} onToggleTheme={toggleTheme} onChangeLang={changeLang} onSignIn={()=>setShowAuthPrompt(true)} onAccountGone={async(kind)=>{if(kind==="deleted"){setUser(null);setProfile(null);setActiveOrgId(null);setProgress([]);goMap()}else{setProgress([]);setLocalProgress([]);try{const p=await db.getProfile(user.id);setProfile(p||{});Streak.syncFromServer(p)}catch{}goMap()}}}/>;
  else if(screen==="joinOrg")content=<JoinOrgView token={routeToken} user={user} onClose={goMap} onNeedSignIn={()=>setShowAuthPrompt(true)} onMembershipActivated={async()=>{if(user?.id){setActiveOrgId(await db.getActiveOrgByUser(user.id))}}}/>;
  else if(screen==="certVerify")content=<CertVerifyView code={routeToken} onBack={goMap}/>;
  else content=<>
    <MilestoneCheck progress={progress}/>
    <WorldMap user={user} profile={profile} progress={progress} onToggleTheme={toggleTheme} onChangeLang={changeLang}
    onOpenLoc={(id)=>{setActiveLoc(id);setScreen("location")}}
    onOpenNews={()=>setScreen("news")}
    onOpenTools={()=>setScreen("tools")}
    onOpenChallenge={()=>setScreen("challenge")}
    onOpenAchievements={()=>setScreen("achievements")}
    onOpenProfile={()=>setScreen("profile")}
    onSignIn={()=>setShowAuthPrompt(true)}
  />
  </>;

  const nameStep=<NameStep open={!!user&&showNamePrompt&&!showAuthPrompt} user={user} onSave={saveDisplayName} loading={savingName}/>;
  return<><style>{getCss()}</style>{content}{nameStep}{authOverlay}</>;
}