import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./lib/supabase";

// AI FLUENT — SUMMIT EDITION v2
// Live news, practice mode, daily challenges, achievements

const C = {
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
  {id:"basics",name:"Base Camp",icon:"🏕️",desc:"Where every climber begins",color:C.green,x:15,y:85,lessons:8,sub:"AI Basics"},
  {id:"writing",name:"Forest Lodge",icon:"✍️",desc:"Master writing with AI",color:C.teal,x:35,y:70,lessons:12,sub:"AI for Writing"},
  {id:"images",name:"Artist's Outlook",icon:"🎨",desc:"Create visuals from any vantage",color:C.coral,x:60,y:75,lessons:10,sub:"AI Images"},
  {id:"business",name:"Market Pass",icon:"💼",desc:"AI meets real business results",color:C.gold,x:75,y:55,lessons:15,sub:"AI for Business"},
  {id:"data",name:"Signal Peak",icon:"📈",desc:"See clearly through any data",color:C.blue,x:55,y:38,lessons:10,sub:"AI for Data"},
  {id:"daily",name:"Village Rest",icon:"🏠",desc:"AI woven into everyday life",color:C.tealLight,x:28,y:48,lessons:8,sub:"AI Daily Life"},
  {id:"master",name:"The Summit",icon:"⛰️",desc:"You've reached AI fluency",color:C.snow,x:50,y:12,lessons:0,sub:"AI Mastery"},
];

const LESSONS = {
  basics:{title:"What Is AI, Really?",sections:[{h:"Think of AI like a smart assistant",body:"AI is a computer program that learns from examples — like how you learned to recognize dogs by seeing lots of dogs.\n\nIt doesn't \"think\" like a human. It's an incredibly fast pattern-matching machine that's read most of the internet."},{h:"What can AI do today?",body:"AI can: write text, create images, translate languages, summarize documents, answer questions, and brainstorm.\n\nCAN'T do: truly understand emotions, be creative like humans, or reliably do complex math."},{h:"The key concept: prompts",body:"What you type to AI is called a \"prompt.\" Better prompt = better response.\n\nLike giving directions — \"go somewhere nice\" vs \"take me to the Italian restaurant on Oak Street.\""}],questions:["Give me a real-life example","Difference between AI and a regular app?","Is AI going to take my job?","How does AI learn?"],practice:[{type:"multiple_choice",q:"What is a 'prompt' in AI?",opts:["A computer virus","What you type to tell AI what to do","An AI's name","A type of software"],correct:1,explain:"A prompt is your instruction to AI — the better you describe what you want, the better the result."},{type:"multiple_choice",q:"Which of these can AI do TODAY?",opts:["Feel emotions like humans","Write text and create images","Think independently","Replace all human jobs"],correct:1,explain:"AI excels at writing, images, translation, and summarization. It can't feel emotions or think independently."},{type:"free_response",q:"Write a prompt asking AI to help you draft a professional email to your boss about taking Friday off. Be specific!",hint:"Remember the lesson: include WHO you're writing to, WHAT it's about, and WHAT TONE you want."}]},
  writing:{title:"Your First AI Email",sections:[{h:"Why AI and email are perfect together",body:"Most people spend 2+ hours/day on email. AI cuts that in half — not writing FOR you, but giving strong drafts you refine."},{h:"The 3-part prompt formula",body:"1. ROLE — Tell AI who to be\n2. CONTEXT — Who you're writing to and why\n3. TONE — How it should sound"}],questions:["Show me a before/after","What if it sounds robotic?","Help me write one now"],practice:[{type:"multiple_choice",q:"What are the 3 parts of a great email prompt?",opts:["Subject, Body, Signature","Role, Context, Tone","From, To, Message","Draft, Edit, Send"],correct:1,explain:"Role (who AI should be), Context (who you're writing to and why), and Tone (how it should sound)."},{type:"free_response",q:"Using the 3-part formula, write a prompt to AI for drafting a thank-you email to a client who just signed a contract.",hint:"Start with the ROLE, add CONTEXT about the client and contract, specify the TONE."}]},
  images:{title:"Creating AI Images",sections:[{h:"No design skills needed",body:"AI image tools let anyone create professional visuals by describing what they want."},{h:"The 4-part image prompt",body:"1. SUBJECT — What's in the image\n2. STYLE — Photo, illustration, painting\n3. MOOD — Warm, dramatic, playful\n4. DETAILS — Lighting, colors, angle"}],questions:["Help me create a logo","Best free image tool?","Can AI create real photos?"],practice:[{type:"free_response",q:"Write an image prompt for a professional-looking social media banner for a bakery called 'Sweet Sunrise'. Include all 4 parts.",hint:"SUBJECT (what's shown), STYLE (photo? illustration?), MOOD (warm? playful?), DETAILS (colors, lighting)."}]},
  business:{title:"AI Tools That Save Hours",sections:[{h:"Start with what wastes time",body:"Pick the ONE task that wastes the most time and automate that first. You'll save 5-10 hours/week."}],questions:["What should I automate?","Are these tools safe?","How much time saved?"],practice:[{type:"multiple_choice",q:"What's the best approach to start using AI in your business?",opts:["AI-ify everything at once","Pick ONE time-wasting task and automate it first","Wait until AI is more mature","Only use AI for emails"],correct:1,explain:"Starting with one task lets you learn without overwhelm and see immediate time savings."}]},
  data:{title:"AI + Spreadsheets",sections:[{h:"No more formula headaches",body:"AI writes spreadsheet formulas for you. Just describe what you need in plain English."}],questions:["AI with Google Sheets?","Can AI create charts?"],practice:[]},
  daily:{title:"AI in Everyday Life",sections:[{h:"AI is already around you",body:"Autocorrect, Netflix recommendations, Google Maps traffic — all AI. Now you can direct it for specific tasks."}],questions:["Plan meals for my family","Help with a medical term","Best AI apps?"],practice:[]},
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

const TOOLS = [
  {id:"email",icon:"✍️",name:"Write an Email",color:C.teal,steps:[{q:"What kind?",opts:["Work / Professional","Personal","Complaint","Thank You"]},{q:"Who to?",opts:["My boss","A client","A coworker","A company"]},{q:"Tone?",opts:["Formal","Warm","Direct","Apologetic"]},{q:"About what?",free:true,ph:"e.g. Requesting time off..."}],sys:"You are an expert email writer. Write a concise professional email. Subject line then body only."},
  {id:"prompt",icon:"💬",name:"Build a Prompt",color:C.gold,steps:[{q:"Help with?",opts:["Writing","Analyzing","Creative ideas","Problem solving"]},{q:"Detail level?",opts:["Quick","Medium","Thorough","Step-by-step"]},{q:"Describe task:",free:true,ph:"e.g. Plan a marketing campaign..."}],sys:"You are an AI prompt expert. Generate a prompt they can copy. Explain why each part works."},
  {id:"summarize",icon:"📄",name:"Summarize Text",color:C.blue,steps:[{q:"Content type?",opts:["Article","Report","Email chain","Contract"]},{q:"What do you need?",opts:["Key takeaways","Action items","Simple explanation","Pros and cons"]},{q:"Paste text:",free:true,ph:"Paste or describe content..."}],sys:"Create a clear concise summary in simple language."},
  {id:"resume",icon:"📋",name:"Resume Helper",color:C.purple,steps:[{q:"What do you need?",opts:["Write a summary","Improve bullet points","Tailor for a job posting","Write a cover letter"]},{q:"Your field?",opts:["Tech / IT","Business / Finance","Healthcare","Education","Creative","Other"]},{q:"Details:",free:true,ph:"Paste your current text or describe what you need..."}],sys:"You are an expert resume writer and career coach. Help improve their resume content. Be specific, use action verbs, quantify achievements where possible."},
  {id:"social",icon:"📱",name:"Social Post Writer",color:C.coral,steps:[{q:"Platform?",opts:["LinkedIn","Twitter/X","Instagram","Facebook"]},{q:"Goal?",opts:["Share expertise","Promote something","Tell a story","Ask for engagement"]},{q:"Topic:",free:true,ph:"e.g. I just learned how to use AI for..."}],sys:"You are a social media expert. Write an engaging post for the specified platform. Match the platform's tone and best practices. Include relevant hashtag suggestions."},
  {id:"study",icon:"📚",name:"Study Helper",color:C.green,steps:[{q:"What are you studying?",opts:["A concept I don't understand","Preparing for a test","Researching a topic","Learning a new skill"]},{q:"How should I help?",opts:["Explain it simply","Create flashcards","Quiz me","Give me a study plan"]},{q:"The topic:",free:true,ph:"e.g. How does blockchain work..."}],sys:"You are a patient, encouraging tutor. Explain concepts at the appropriate level. Use analogies and examples. If creating flashcards, format them clearly."},
];

// CSS
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Quicksand:wght@500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{background:#0A1420;overflow:hidden}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2A4060;border-radius:2px}
  input::placeholder,textarea::placeholder{color:#506878}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}
  @keyframes lumiFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:.8}}
  @keyframes pop{0%{transform:scale(.92);opacity:0}100%{transform:scale(1);opacity:1}}
  @keyframes confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-80px) rotate(360deg);opacity:0}}
  @keyframes celebrate{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
  .fu{animation:fadeUp .4s ease both}.fi{animation:fadeIn .3s ease both}.pop{animation:pop .3s ease both}
  .s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}.s4{animation-delay:.2s}.s5{animation-delay:.25s}
  button{transition:all .15s ease;cursor:pointer}button:active{transform:scale(.97)}
`;

const Btn = ({children,onClick,v="gold",disabled,style:sx={}}) => {
  const st={gold:{background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(212,165,90,.3)"},ghost:{background:"rgba(255,255,255,.05)",color:C.text,border:`1px solid ${C.border}`},teal:{background:`linear-gradient(135deg,${C.teal},#2A8888)`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(58,168,160,.25)"},green:{background:`linear-gradient(135deg,${C.green},${C.greenDark})`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(74,186,120,.25)"},red:{background:`linear-gradient(135deg,${C.red},#A83838)`,color:"#fff",border:"none"}};
  return <button disabled={disabled} onClick={onClick} style={{padding:"13px 24px",borderRadius:14,fontSize:15,fontWeight:700,fontFamily:C.font,opacity:disabled?.5:1,width:"100%",...st[v],...sx}}>{children}</button>;
};
const Dots = () => {const[f,sF]=useState(0);useEffect(()=>{const i=setInterval(()=>sF(n=>(n+1)%4),400);return()=>clearInterval(i)},[]);return<div style={{display:"flex",gap:5,padding:"10px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.gold,opacity:f>i?.8:.2,transition:"opacity .3s"}}/>)}</div>};
const Bub = ({from,text,typing}) => <div className="fu" style={{display:"flex",justifyContent:from==="user"?"flex-end":"flex-start",gap:8,marginBottom:12}}>{from==="lumi"&&!typing&&<div style={{marginTop:4}}><Lumi size={26}/></div>}<div style={{maxWidth:"82%",padding:"11px 15px",borderRadius:from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:from==="user"?"rgba(58,168,160,.12)":"rgba(212,165,90,.08)",border:`1px solid ${from==="user"?"rgba(58,168,160,.2)":C.borderGold}`}}>{typing?<Dots/>:<p style={{color:C.text,fontSize:14,lineHeight:1.6,fontFamily:C.font,whiteSpace:"pre-wrap",margin:0}}>{text}</p>}</div></div>;
const Stars = () => <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>{Array.from({length:50},(_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*50}%`,width:Math.random()>.8?2.5:1.5,height:Math.random()>.8?2.5:1.5,background:"#fff",borderRadius:"50%",opacity:.1+Math.random()*.3,animation:`twinkle ${3+Math.random()*4}s ease-in-out infinite`,animationDelay:`${Math.random()*4}s`}}/>)}</div>;

// Confetti component
const Confetti = () => <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:100}}>{Array.from({length:20},(_,i)=><div key={i} style={{position:"absolute",left:`${10+Math.random()*80}%`,top:"60%",width:8,height:8,borderRadius:Math.random()>.5?"50%":"2px",background:["#D4A55A","#4ABA78","#3AA8A0","#E88060","#4A90D9","#7A6BBF"][i%6],animation:`confetti ${1+Math.random()}s ease-out forwards`,animationDelay:`${Math.random()*0.5}s`}}/>)}</div>;

// AUTH
const AuthScreen = () => {
  const [mode,setMode]=useState("signin");const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [loading,setLoading]=useState(false);const [err,setErr]=useState("");
  const go=async()=>{if(!email||!pass){setErr("Please fill in both fields");return}setLoading(true);setErr("");const{error}=mode==="signup"?await db.signUp(email,pass):await db.signIn(email,pass);setLoading(false);if(error){setErr(error.message);return}if(mode==="signup")setMode("check")};
  if(mode==="check")return(<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,position:"relative"}}><Stars/><Lumi size={72} mood="excited" level={1} animate/><h2 style={{color:C.goldLight,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,marginTop:14,textAlign:"center"}}>Check your email!</h2><p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,textAlign:"center",lineHeight:1.7,maxWidth:300,marginTop:8}}>We sent a link to <strong style={{color:C.gold}}>{email}</strong></p><div style={{marginTop:24,width:"100%",maxWidth:280}}><Btn v="ghost" onClick={()=>setMode("signin")}>Back to Sign In</Btn></div></div>);
  return(<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop} 0%,${C.skyMid} 50%,${C.mountain} 80%,${C.green} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",position:"relative"}}>
    <Stars/><div className="fu" style={{position:"relative",zIndex:1}}><Lumi size={80} mood="happy" level={1} animate/></div>
    <h1 className="fu s1" style={{color:C.goldLight,fontSize:34,fontFamily:C.fontDisplay,fontWeight:700,marginTop:8}}>AI Fluent</h1>
    <p className="fu s2" style={{color:C.textMuted,fontSize:14,fontFamily:C.font,marginBottom:28}}>Your climb to AI fluency starts here</p>
    <div style={{width:"100%",maxWidth:340,position:"relative",zIndex:1}}>
      <div className="fu s3" style={{display:"flex",gap:4,marginBottom:18,background:"rgba(255,255,255,.04)",borderRadius:12,padding:3,border:`1px solid ${C.border}`}}>{["signin","signup"].map(m=><button key={m} onClick={()=>{setMode(m);setErr("")}} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",background:mode===m?"rgba(212,165,90,.12)":"transparent",color:mode===m?C.gold:C.textDim,fontSize:14,fontWeight:700,fontFamily:C.font}}>{m==="signin"?"Sign In":"Sign Up"}</button>)}</div>
      <div className="fu s4" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={{width:"100%",background:"rgba(255,255,255,.05)",borderRadius:12,border:`1.5px solid ${C.border}`,padding:"13px 16px",color:C.text,fontSize:15,fontFamily:C.font,outline:"none"}}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",background:"rgba(255,255,255,.05)",borderRadius:12,border:`1.5px solid ${C.border}`,padding:"13px 16px",color:C.text,fontSize:15,fontFamily:C.font,outline:"none"}}/>
      </div>
      {err&&<p className="fi" style={{color:C.red,fontSize:13,fontFamily:C.font,marginBottom:12,textAlign:"center"}}>{err}</p>}
      <Btn onClick={go} disabled={loading}>{loading?"...":mode==="signin"?"Start Climbing":"Create Account"}</Btn>
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

// WORLD MAP with daily challenge + achievements
const WorldMap = ({profile,progress,onOpenLoc,onOpenNews,onOpenTools,onOpenProfile,onOpenChallenge,onOpenAchievements}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);const done=[...new Set(progress.map(p=>p.path_id))];
  const status=(loc)=>{if(loc.id==="master")return done.length>=6?"current":"locked";const idx=LOCS.findIndex(l=>l.id===loc.id);if(done.includes(loc.id))return"done";if(idx===0)return"current";const prev=LOCS[idx-1];if(prev&&done.includes(prev.id))return"current";return"locked"};
  const pct=Math.round((done.length/6)*100);
  const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"};
  const streak=profile?.current_streak||0;

  return(<div style={{height:"100vh",position:"relative",overflow:"hidden",background:`linear-gradient(180deg,${C.skyTop} 0%,${C.skyMid} 30%,${C.skyBot} 50%,${C.mountain} 65%,${C.green} 80%,${C.greenDark} 100%)`}}>
    <Stars/>
    {/* Fog */}
    <div style={{position:"absolute",top:"42%",left:0,right:0,height:60,background:"linear-gradient(180deg,transparent,rgba(200,220,240,.04),transparent)",zIndex:3}}/>
    {/* Mountain */}
    <svg viewBox="0 0 400 200" preserveAspectRatio="none" style={{position:"absolute",top:"35%",left:0,width:"100%",height:"30%",zIndex:2,opacity:.3}}><path d="M0 200 L80 60 L140 120 L200 20 L260 100 L320 40 L400 200 Z" fill={C.mountainLight}/></svg>
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{position:"absolute",top:"35%",left:0,width:"100%",height:"8%",zIndex:2,opacity:.15}}><path d="M180 100 L200 20 L220 100" fill={C.snow}/><path d="M300 100 L320 40 L340 100" fill={C.snow}/></svg>

    {/* Top bar */}
    <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20,background:"linear-gradient(180deg,rgba(10,20,32,.92) 0%,transparent 100%)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <Lumi size={30} mood={streak>=7?"excited":"happy"} level={level}/>
        <div><p style={{color:C.text,fontSize:13,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{greet()}</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font,margin:0}}>Altitude {level} · {pct}% to summit</p></div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(255,255,255,.05)",padding:"4px 10px",borderRadius:16,border:`1px solid ${C.border}`}}><span style={{fontSize:12}}>🔥</span><span style={{color:C.gold,fontSize:13,fontWeight:700,fontFamily:C.font}}>{streak}</span></div>
        <button onClick={onOpenAchievements} style={{display:"flex",alignItems:"center",gap:3,background:"rgba(255,255,255,.05)",padding:"4px 10px",borderRadius:16,border:`1px solid ${C.border}`,fontSize:12}}>🏆<span style={{color:C.teal,fontSize:13,fontWeight:700,fontFamily:C.font}}>{ACHIEVEMENTS.filter(a=>a.condition(progress,profile)).length}</span></button>
        <button onClick={onOpenProfile} style={{width:30,height:30,borderRadius:10,background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>👤</button>
      </div>
    </div>

    {/* MAP */}
    <svg viewBox="0 0 400 700" style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:5}}>
      <path d="M65 595 Q130 555 120 490 Q110 430 195 395 Q100 345 115 285 Q125 235 235 255 Q305 270 300 210 Q295 150 225 120 Q195 105 205 60" fill="none" stroke={C.trailDark} strokeWidth="14" strokeLinecap="round" opacity=".25"/>
      <path d="M65 595 Q130 555 120 490 Q110 430 195 395 Q100 345 115 285 Q125 235 235 255 Q305 270 300 210 Q295 150 225 120 Q195 105 205 60" fill="none" stroke={C.trail} strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" opacity=".45"/>
      {LOCS.map((loc)=>{const st=status(loc);const x=loc.x*4;const y=loc.y*7;const d=st==="done";const cur=st==="current";const lk=st==="locked";
        return(<g key={loc.id} onClick={()=>!lk&&onOpenLoc(loc.id)} style={{cursor:lk?"default":"pointer"}}>
          {cur&&<circle cx={x} cy={y} r="30" fill={C.gold} opacity=".08"><animate attributeName="opacity" values=".05;.15;.05" dur="3s" repeatCount="indefinite"/></circle>}
          <circle cx={x} cy={y} r={cur?24:20} fill={d?C.green:cur?"rgba(212,165,90,.2)":"rgba(255,255,255,.03)"} stroke={d?C.greenDark:cur?C.gold:"rgba(255,255,255,.08)"} strokeWidth={cur?2:1.5} opacity={lk?.35:1}/>
          <circle cx={x} cy={y} r={cur?16:13} fill={d?C.greenDark:cur?C.goldLight:"rgba(255,255,255,.04)"} opacity={d?.4:cur?.7:.3}/>
          <text x={x} y={y+5} textAnchor="middle" fontSize={cur?17:15} fill={lk?"rgba(255,255,255,.2)":"#fff"} opacity={lk?.4:1}>{d?"✓":lk?"●":loc.icon}</text>
          <text x={x} y={y+(cur?38:34)} textAnchor="middle" fontSize="10" fill={lk?C.textDim:cur?C.goldLight:C.textMuted} fontFamily="'Nunito',sans-serif" fontWeight="700">{loc.name}</text>
        </g>);
      })}
    </svg>

    {/* Bottom bar - now with 3 buttons */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,padding:"0 12px 12px",paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}>
      <div style={{display:"flex",gap:6}}>
        <button onClick={onOpenChallenge} style={{flex:1,background:"rgba(10,20,32,.88)",backdropFilter:"blur(10px)",border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 12px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}><span style={{fontSize:18}}>⚡</span><div><p style={{color:C.coral,fontSize:11,fontWeight:700,fontFamily:C.font,margin:0}}>Daily</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:0}}>Challenge</p></div></button>
        <button onClick={onOpenNews} style={{flex:1,background:"rgba(10,20,32,.88)",backdropFilter:"blur(10px)",border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 12px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}><span style={{fontSize:18}}>📰</span><div><p style={{color:C.gold,fontSize:11,fontWeight:700,fontFamily:C.font,margin:0}}>AI News</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:0}}>Live today</p></div></button>
        <button onClick={onOpenTools} style={{flex:1,background:"rgba(10,20,32,.88)",backdropFilter:"blur(10px)",border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 12px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}><span style={{fontSize:18}}>🛠️</span><div><p style={{color:C.teal,fontSize:11,fontWeight:700,fontFamily:C.font,margin:0}}>Tools</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:0}}>6 tools</p></div></button>
      </div>
    </div>
  </div>);
};

// LOCATION VIEW + TUTOR + PRACTICE MODE
const LocView = ({locId,uid,progress,onBack,onComplete}) => {
  const loc=LOCS.find(l=>l.id===locId)||LOCS[0];const lesson=LESSONS[locId];
  const [view,setView]=useState("intro");const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  // Practice state
  const [practiceIdx,setPracticeIdx]=useState(0);const [selected,setSelected]=useState(null);const [submitted,setSubmitted]=useState(false);
  const [freeAns,setFreeAns]=useState("");const [feedback,setFeedback]=useState("");const [grading,setGrading]=useState(false);
  const [showConfetti,setShowConfetti]=useState(false);const [practiceScore,setPracticeScore]=useState(0);

  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);

  const ask=async(q)=>{setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, a knowledgeable warm AI guide in "AI Fluent" at "${loc.name}" teaching "${lesson?.title}". Clear, simple language. Encouraging, not condescending. Everyday analogies. Under 180 words.`,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"tutor",context_id:locId,context_title:lesson?.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch{setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:"Connection dropped — try again."}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  const practice=lesson?.practice||[];
  const currentP=practice[practiceIdx];

  const gradeFreeResponse=async()=>{
    setGrading(true);
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, grading a practice exercise. The question was: "${currentP.q}". The hint was: "${currentP.hint||""}". Grade their response: 1) Was it specific enough? 2) Did they follow the lesson's framework? Give a score out of 10, brief encouraging feedback, and one specific suggestion to improve. Keep under 120 words. Be warm and encouraging.`,messages:[{role:"user",content:freeAns}]});
      setFeedback(r.text);setPracticeScore(ps=>ps+1);
    }catch{setFeedback("Great effort! The key is being specific — the more detail you give AI, the better the result.")}
    setGrading(false);setSubmitted(true);
  };

  // PRACTICE MODE
  if(view==="practice"&&practice.length>0)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← Back to lesson</button>
    {showConfetti&&<Confetti/>}
    {/* Progress */}
    <div style={{display:"flex",gap:4,marginBottom:16}}>{practice.map((_,i)=><div key={i} style={{flex:1,height:5,borderRadius:3,background:i<practiceIdx?C.green:i===practiceIdx?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Lumi size={28} mood={submitted?"excited":"happy"} level={level}/><span style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600}}>Practice {practiceIdx+1} of {practice.length}</span></div>
    <h2 className="fu s1" style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 16px",lineHeight:1.35}}>{currentP.q}</h2>

    {currentP.type==="multiple_choice"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {currentP.opts.map((o,i)=>{
        const isCorrect=i===currentP.correct;const isSelected=selected===i;const showResult=submitted;
        return<button key={i} onClick={()=>{if(!submitted){setSelected(i)}}} disabled={submitted} className={`pop s${Math.min(i+1,5)}`}
          style={{background:showResult?(isCorrect?"rgba(74,186,120,.12)":isSelected?"rgba(216,88,88,.12)":"rgba(255,255,255,.03)"):(isSelected?"rgba(212,165,90,.1)":"rgba(255,255,255,.03)"),
            border:`1.5px solid ${showResult?(isCorrect?C.green:isSelected?C.red:C.border):(isSelected?C.gold:C.border)}`,borderRadius:14,padding:"13px 16px",textAlign:"left",width:"100%"}}>
          <span style={{color:showResult?(isCorrect?C.green:isSelected?C.red:C.textMuted):(isSelected?C.goldLight:C.textMuted),fontSize:14,fontWeight:isSelected?700:500,fontFamily:C.font}}>{showResult?(isCorrect?"✓ ":isSelected?"✗ ":""):isSelected?"● ":""}{o}</span>
        </button>})}
      {!submitted&&selected!==null&&<div style={{marginTop:8}}><Btn onClick={()=>{setSubmitted(true);if(selected===currentP.correct)setPracticeScore(ps=>ps+1)}}>Check Answer</Btn></div>}
      {submitted&&<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14,marginTop:10}}><p style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 4px"}}>💡 Why?</p><p style={{color:C.textMuted,fontSize:13,lineHeight:1.6,fontFamily:C.font,margin:0}}>{currentP.explain}</p></div>}
    </div>}

    {currentP.type==="free_response"&&<div>
      {currentP.hint&&!submitted&&<div className="fu" style={{background:"rgba(212,165,90,.04)",border:`1px solid ${C.borderGold}`,borderRadius:12,padding:10,marginBottom:12}}><p style={{color:C.gold,fontSize:12,fontFamily:C.font,margin:0}}>💡 Hint: {currentP.hint}</p></div>}
      <textarea value={freeAns} onChange={e=>setFreeAns(e.target.value)} placeholder="Type your answer here..." disabled={submitted}
        style={{width:"100%",minHeight:120,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical",marginBottom:10}}/>
      {!submitted&&<Btn onClick={gradeFreeResponse} disabled={!freeAns.trim()||grading}>{grading?"Lumi is reviewing...":"Submit for Review"}</Btn>}
      {submitted&&feedback&&<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14,marginTop:10}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Lumi size={22}/><span style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font}}>Lumi's feedback</span></div><p style={{color:C.textMuted,fontSize:13,lineHeight:1.65,fontFamily:C.font,margin:0,whiteSpace:"pre-wrap"}}>{feedback}</p></div>}
    </div>}

    {submitted&&<div style={{marginTop:14}}>
      {practiceIdx<practice.length-1?<Btn v="teal" onClick={()=>{setPracticeIdx(practiceIdx+1);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("")}}>Next Question →</Btn>
      :<Btn v="green" onClick={async()=>{setShowConfetti(true);await db.completeLesson(uid,locId,0);setTimeout(()=>{onComplete();onBack()},1500)}}>🎉 Practice Complete! Return to map</Btn>}
    </div>}
  </div>);

  // TUTOR
  if(view==="tutor")return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bgDark}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}>
      <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>← Back</button>
      <div style={{flex:1,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Lumi size={22} level={level}/><span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>Lumi — Guide</span></div>
    </div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}>
      <Bub from="lumi" text={`Welcome to ${loc.name}. Ask me anything about "${lesson?.title}" — nothing is too basic.`}/>
      {msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text}/>)}{typing&&<Bub from="lumi" typing/>}
      {msgs.length===0&&lesson&&<div className="fu s2" style={{marginTop:14}}><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600,margin:"0 0 10px"}}>People often ask...</p>{lesson.questions.map((q,i)=><button key={i} onClick={()=>ask(q)} style={{display:"block",width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",marginBottom:7,textAlign:"left"}}><span style={{color:C.textMuted,fontSize:13,fontFamily:C.font}}>{q}</span></button>)}</div>}
    </div>
    <div style={{padding:"8px 14px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,background:C.bgCard,paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}>
      <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask Lumi..." style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/>
      <button onClick={send} style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:16}}>↑</span></button>
    </div></div>);

  // LESSON
  if(view==="lesson"&&lesson)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>setView("intro")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← {loc.name}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:18}}>{loc.icon}</span><span style={{color:loc.color,fontSize:10,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1}}>{loc.sub}</span></div>
    <h1 className="fu s1" style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 22px",lineHeight:1.3}}>{lesson.title}</h1>
    {lesson.sections.map((sec,i)=>(<div key={i} className={`fu s${Math.min(i+2,5)}`} style={{marginBottom:26}}><h3 style={{color:C.text,fontSize:16,fontWeight:700,fontFamily:C.font,margin:"0 0 8px"}}>{sec.h}</h3><p style={{color:C.textMuted,fontSize:14,lineHeight:1.8,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{sec.body}</p></div>))}
    <button onClick={()=>setView("tutor")} className="fu" style={{width:"100%",background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,textAlign:"left",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={32} mood="happy" level={level} animate/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>Questions? Ask Lumi</p><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>Your guide is here to help</p></div></div>
    </button>
    {practice.length>0?<Btn v="teal" onClick={()=>{setView("practice");setPracticeIdx(0);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("")}}>Start Practice →</Btn>
    :<Btn onClick={async()=>{await db.completeLesson(uid,locId,0);onComplete();onBack()}}>Complete & continue →</Btn>}
  </div>);

  // INTRO
  return(<div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid} 60%,${C.bgDark})`,display:"flex",flexDirection:"column",position:"relative"}}>
    <Stars/><button onClick={onBack} style={{position:"absolute",top:14,left:14,background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"7px 14px",color:C.gold,fontSize:13,fontFamily:C.font,fontWeight:700,zIndex:10}}>← Map</button>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",position:"relative",zIndex:5}}>
      <div className="fu" style={{fontSize:48,marginBottom:6}}>{loc.icon}</div>
      <h1 className="fu s1" style={{color:C.text,fontSize:28,fontFamily:C.fontDisplay,fontWeight:700,textAlign:"center"}}>{loc.name}</h1>
      <p className="fu s2" style={{color:C.textMuted,fontSize:14,fontFamily:C.font,textAlign:"center",marginBottom:2}}>{loc.sub}</p>
      <p className="fu s3" style={{color:C.textDim,fontSize:13,fontFamily:C.font,textAlign:"center",lineHeight:1.6,maxWidth:280,marginBottom:20}}>{loc.desc}</p>
      {practice.length>0&&<p className="fu s3" style={{color:C.teal,fontSize:12,fontFamily:C.font,textAlign:"center",marginBottom:4}}>Includes {practice.length} practice exercises</p>}
      <div className="fu s4" style={{display:"flex",alignItems:"center",gap:8,marginBottom:22}}><Lumi size={32} mood="happy" level={level} animate/><p style={{color:C.textDim,fontSize:13,fontFamily:C.font,fontStyle:"italic"}}>Ready when you are</p></div>
      <div className="fu s5" style={{width:"100%",maxWidth:280}}>{lesson?<Btn onClick={()=>setView("lesson")}>Start learning →</Btn>:<p style={{color:C.textDim,fontSize:14,fontFamily:C.font,textAlign:"center"}}>Complete all stops to reach the summit</p>}</div>
    </div></div>);
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
        const r=await db.callClaude({feature:"news_fetch",use_search:true,system:`You are Lumi, an AI news curator for "AI Fluent". Search for the latest AI news from today. Return EXACTLY 4 news items as a JSON array. Each item must have: title (string), category (one of: Breaking, Tools, Policy, Business, Research), summary (2-3 sentence ELI5 explanation a non-tech person would understand), impact (1-2 sentences on why this matters to the average person), timeAgo (like "2h ago" or "Today"), source (publication name). Return ONLY valid JSON, no markdown, no backticks, no explanation. Example format: [{"title":"...","category":"...","summary":"...","impact":"...","timeAgo":"...","source":"..."}]`,messages:[{role:"user",content:"What are the top 4 AI news stories from today? Search the web for the very latest."}]});
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
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}><button onClick={()=>{setChat(false);setMsgs([]);setSid(null)}} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>← Story</button><div style={{flex:1,textAlign:"center"}}><span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>Ask Lumi</span></div></div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}><Bub from="lumi" text={`I've got the details on "${art.title}" — what would you like to know?`}/>{msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text}/>)}{typing&&<Bub from="lumi" typing/>}</div>
    <div style={{padding:"8px 14px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about this..." style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/><button onClick={send} style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:16}}>↑</span></button></div>
  </div>);

  // Article detail
  if(art)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 100px"}}>
    <button onClick={()=>setOpen(null)} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← Back</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:.8}}>{art.category}</span>{art.source&&<span style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>· {art.source}</span>}</div>
    <h1 className="fu s1" style={{color:C.text,fontSize:21,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 18px",lineHeight:1.35}}>{art.title}</h1>
    <div className="fu s2" style={{background:"rgba(74,186,120,.06)",border:"1px solid rgba(74,186,120,.12)",borderRadius:16,padding:16,marginBottom:12}}><p style={{color:C.green,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 6px"}}>The simple version</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.summary}</p></div>
    <div className="fu s3" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:12}}><p style={{color:C.gold,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 6px"}}>Why it matters to you</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.impact}</p></div>
    <button onClick={()=>setChat(true)} className="fu s4" style={{width:"100%",background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:14,textAlign:"left"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={30}/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>Ask Lumi about this</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>Get it explained in plain language</p></div></div></button>
  </div>);

  // News list
  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← Map</button>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><h1 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700}}>AI News</h1><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"twinkle 2s infinite"}}/><span style={{color:C.green,fontSize:11,fontFamily:C.font,fontWeight:600}}>Live</span></div></div>
    <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:18}}>Today's AI stories, simplified by Lumi</p>
    {loading?<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 0"}}><Lumi size={48} mood="thinking" animate/><p style={{color:C.textMuted,fontSize:13,fontFamily:C.font,marginTop:12}}>Lumi is fetching today's news...</p></div>
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
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← Map</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontSize:24}}>⚡</span><h1 style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>Daily Challenge</h1></div>
    <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,marginBottom:18}}>Complete today's challenge to keep your streak alive</p>

    <div className="fu s1" style={{background:"rgba(232,128,96,.06)",border:"1px solid rgba(232,128,96,.15)",borderRadius:16,padding:16,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Lumi size={28} mood="excited"/><div><p style={{color:C.coral,fontSize:15,fontWeight:700,fontFamily:C.font,margin:0}}>{challenge.title}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>{challenge.desc}</p></div></div>
      <p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{challenge.task}</p>
    </div>

    {!submitted?<>
      <textarea value={response} onChange={e=>setResponse(e.target.value)} placeholder="Type your response here..." style={{width:"100%",minHeight:140,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical",marginBottom:12}}/>
      <Btn onClick={submit} disabled={!response.trim()||grading} v="teal">{grading?"Lumi is reviewing...":"Submit Challenge ⚡"}</Btn>
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
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← Map</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><span style={{fontSize:24}}>🏆</span><h1 style={{color:C.text,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>Achievements</h1><span style={{color:C.gold,fontSize:14,fontWeight:700,fontFamily:C.font}}>{earned.length}/{ACHIEVEMENTS.length}</span></div>
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
  if(wf){const s=wf.steps[step];return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}><button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:10}}>← Back</button><div style={{display:"flex",gap:3,marginBottom:18}}>{wf.steps.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,fontWeight:700,marginBottom:3}}>Step {step+1}/{wf.steps.length}</p><h2 className="fu" style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 18px"}}>{s.q}</h2>
    {s.free?<div className="fu s1"><textarea value={ft} onChange={e=>setFt(e.target.value)} placeholder={s.ph} style={{width:"100%",minHeight:100,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical"}}/><div style={{marginTop:10}}><Btn onClick={()=>pick(ft||"General")} disabled={!ft.trim()}>{step<wf.steps.length-1?"Next →":"Generate"}</Btn></div></div>
    :<div style={{display:"flex",flexDirection:"column",gap:8}}>{s.opts.map((o,i)=><button key={o} className={`pop s${Math.min(i+1,5)}`} onClick={()=>pick(o)} style={{background:"rgba(255,255,255,.03)",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 16px",textAlign:"left",width:"100%"}}><span style={{color:C.textMuted,fontSize:14,fontFamily:C.font}}>{o}</span></button>)}</div>}
  </div>)}
  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}><button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← Map</button><h1 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,marginBottom:4}}>AI Tools</h1><p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:18}}>Guided step-by-step workflows</p>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>{TOOLS.map((t,i)=>(<button key={t.id} className={`fu s${Math.min(i+1,5)}`} onClick={()=>{setWf(t);setStep(0);setAns([]);setFt("");setResult(null)}} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:14,display:"flex",alignItems:"center",gap:12,textAlign:"left",width:"100%"}}><div style={{width:44,height:44,borderRadius:12,background:`${t.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{t.icon}</div><p style={{color:C.text,fontSize:14,fontWeight:600,fontFamily:C.font,margin:0}}>{t.name}</p></button>))}</div>
  </div>);
};

// PROFILE
const ProfileView = ({profile,progress,onBack,onSignOut}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.bgDark})`,padding:"14px 20px 40px",position:"relative"}}><Stars/><button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:18,position:"relative",zIndex:1}}>← Map</button>
    <div className="fu" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24,position:"relative",zIndex:1}}><Lumi size={72} mood="excited" level={level} animate/><p style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,marginTop:8}}>{profile?.display_name||"Explorer"}</p><p style={{color:C.textDim,fontSize:12,fontFamily:C.font}}>Altitude {level} · {profile?.subscription_tier==="pro"?"Pro":"Free"}</p></div>
    <div className="fu s1" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:18,position:"relative",zIndex:1}}><div style={{display:"flex",justifyContent:"space-around"}}>{[{v:profile?.current_streak||0,l:"Streak",e:"🔥"},{v:progress.length,l:"Lessons",e:"⭐"},{v:profile?.total_tutor_sessions||0,l:"Chats",e:"💬"},{v:ACHIEVEMENTS.filter(a=>a.condition(progress,profile)).length,l:"Badges",e:"🏆"}].map((s,i)=><div key={i} style={{textAlign:"center"}}><span style={{fontSize:18}}>{s.e}</span><p style={{color:C.text,fontSize:18,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{s.v}</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>{s.l}</p></div>)}</div></div>
    <div className="fu s2" style={{position:"relative",zIndex:1}}><Btn v="ghost" onClick={onSignOut}>Sign Out</Btn></div>
    <p className="fu s3" style={{textAlign:"center",color:C.textDim,fontSize:11,fontFamily:C.font,marginTop:20,position:"relative",zIndex:1}}>AI Fluent v3 · Powered by Claude</p>
  </div>);
};

// MAIN APP
export default function AIFluent(){
  const [loading,setLoading]=useState(true);const [user,setUser]=useState(null);const [profile,setProfile]=useState(null);const [progress,setProgress]=useState([]);
  const [screen,setScreen]=useState("map");const [activeLoc,setActiveLoc]=useState(null);

  useEffect(()=>{
    let settled=false;
    const finish=()=>{if(!settled){settled=true;setLoading(false)}};

    // Fast path: direct session check from localStorage (doesn't hang)
    db.getSession().then(async(session)=>{
      try{if(session?.user){setUser(session.user);const[p,g]=await Promise.all([db.getProfile(session.user.id),db.getProgress(session.user.id)]);setProfile(p);setProgress(g)}}
      catch(e){console.error("init:",e)}
      finish();
    }).catch(()=>finish());

    // Hard timeout: loading always clears within 5s no matter what
    const timeout=setTimeout(finish,5000);

    // Auth listener: handles sign-in / sign-out after initial load
    const{data}=db.onAuth(async(ev,s)=>{
      if(ev==="SIGNED_IN"&&s?.user){
        try{setUser(s.user);const[p,g]=await Promise.all([db.getProfile(s.user.id),db.getProgress(s.user.id)]);setProfile(p);setProgress(g)}
        catch(e){console.error("onAuth:",e)}
        finish();
      }else if(ev==="SIGNED_OUT"){setUser(null);setProfile(null);setProgress([]);finish();}
    });

    return()=>{clearTimeout(timeout);data?.subscription?.unsubscribe?.()};
  },[]);

  const refresh=async()=>{if(!user)return;setProfile(await db.getProfile(user.id));setProgress(await db.getProgress(user.id))};
  const out=async()=>{await db.signOut();setUser(null);setProfile(null);setProgress([])};
  const goMap=()=>{setScreen("map");setActiveLoc(null)};

  if(loading)return<><style>{css}</style><div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}}><Stars/><Lumi size={56} mood="happy" level={1} animate/><p style={{color:C.textMuted,fontSize:14,fontFamily:"'Nunito',sans-serif",marginTop:14}}>Loading AI Fluent...</p></div></>;
  if(!user)return<><style>{css}</style><AuthScreen/></>;
  if(profile&&!profile.onboarded)return<><style>{css}</style><Onboarding uid={user.id} onDone={refresh}/></>;
  if(screen==="location"&&activeLoc)return<><style>{css}</style><LocView locId={activeLoc} uid={user.id} progress={progress} onBack={goMap} onComplete={refresh}/></>;
  if(screen==="news")return<><style>{css}</style><NewsView uid={user.id} onBack={goMap}/></>;
  if(screen==="tools")return<><style>{css}</style><ToolsView uid={user.id} onBack={goMap}/></>;
  if(screen==="challenge")return<><style>{css}</style><ChallengeView uid={user.id} onBack={goMap}/></>;
  if(screen==="achievements")return<><style>{css}</style><AchievementsView profile={profile} progress={progress} onBack={goMap}/></>;
  if(screen==="profile")return<><style>{css}</style><ProfileView profile={profile} progress={progress} onBack={goMap} onSignOut={out}/></>;

  return<><style>{css}</style><WorldMap profile={profile} progress={progress}
    onOpenLoc={(id)=>{setActiveLoc(id);setScreen("location")}}
    onOpenNews={()=>setScreen("news")}
    onOpenTools={()=>setScreen("tools")}
    onOpenChallenge={()=>setScreen("challenge")}
    onOpenAchievements={()=>setScreen("achievements")}
    onOpenProfile={()=>setScreen("profile")}
  /></>;
}
