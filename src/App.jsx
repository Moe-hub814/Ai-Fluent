import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./lib/supabase";

// AI FLUENT — SUMMIT EDITION
// Mountain climbing metaphor — universally appealing

// DESIGN TOKENS
const C = {
  skyTop: "#0B1A2E", skyMid: "#132D4A", skyBot: "#1A4060",
  fogLight: "rgba(200,220,240,.06)", fogMid: "rgba(150,180,210,.08)",
  mountain: "#1E3348", mountainLight: "#2A4560", snow: "#E8F0F8",
  trail: "#D4A55A", trailGlow: "#FFE0A0", trailDark: "#8A7040",
  bgDark: "#0A1420", bgCard: "#0F1E30", bgCardLight: "#142838",
  border: "rgba(255,255,255,0.07)", borderGold: "rgba(212,165,90,0.3)",
  text: "#E8EEF4", textMuted: "#8AA0B8", textDim: "#506878",
  gold: "#D4A55A", goldLight: "#FFE8C0", goldDark: "#A07830",
  green: "#4ABA78", greenDark: "#2A8A50", greenLight: "#D0F0E0",
  teal: "#3AA8A0", tealLight: "#C0F0F0",
  blue: "#4A90D9", blueLight: "#C0D8F0",
  purple: "#7A6BBF", purpleLight: "#C0B0E8",
  red: "#D85858", coral: "#E88060",
  font: "'Nunito', sans-serif",
  fontDisplay: "'Quicksand', sans-serif",
};

// LUMI — sleek, modern AI companion (not cartoonish)
const Lumi = ({ size = 40, level = 1, mood = "happy", animate = false }) => {
  const s = size;
  const glow = Math.min(0.2 + level * 0.05, 0.5);
  const innerR = Math.min(16 + level, 22);
  const outerR = innerR + 8;
  return (
    <div style={{ width: s, height: s, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: animate ? "lumiFloat 3s ease-in-out infinite" : "none" }}>
      <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
        <defs>
          <radialGradient id={`lo${s}`} cx="50%" cy="45%" r="50%"><stop offset="0%" stopColor="#FFF8E8" stopOpacity={glow + 0.2}/><stop offset="100%" stopColor="#D4A55A" stopOpacity="0"/></radialGradient>
          <radialGradient id={`lb${s}`} cx="50%" cy="40%" r="45%"><stop offset="0%" stopColor="#FFFDF5"/><stop offset="40%" stopColor="#FFE8C0"/><stop offset="100%" stopColor="#D4A55A"/></radialGradient>
        </defs>
        <circle cx="30" cy="30" r={outerR} fill={`url(#lo${s})`}/>
        <circle cx="30" cy="30" r={innerR} fill={`url(#lb${s})`} stroke="#D4A55A" strokeWidth="0.5" opacity="0.9"/>
        {level >= 3 && <circle cx="30" cy="30" r={innerR + 3} fill="none" stroke="#FFE8C0" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4"/>}
        {level >= 5 && <circle cx="30" cy="30" r={innerR + 6} fill="none" stroke="#FFE8C0" strokeWidth="0.3" strokeDasharray="2 4" opacity="0.25"/>}
        <circle cx="24" cy="28" r="1.5" fill="#8A7040"/>
        <circle cx="36" cy="28" r="1.5" fill="#8A7040"/>
        {mood === "happy" && <path d="M25 33 Q30 37 35 33" fill="none" stroke="#8A7040" strokeWidth="1.2" strokeLinecap="round"/>}
        {mood === "thinking" && <circle cx="30" cy="34" r="2" fill="none" stroke="#8A7040" strokeWidth="1"/>}
        {mood === "excited" && <path d="M25 32 Q30 38 35 32" fill="none" stroke="#8A7040" strokeWidth="1.5" strokeLinecap="round"/>}
        <line x1="30" y1={30-innerR-4} x2="30" y2={30-innerR-8} stroke="#FFE8C0" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
        <line x1={30-3} y1={30-innerR-2} x2={30-5} y2={30-innerR-6} stroke="#FFE8C0" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
        <line x1={30+3} y1={30-innerR-2} x2={30+5} y2={30-innerR-6} stroke="#FFE8C0" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
      </svg>
    </div>
  );
};

// LOCATION DATA — mountain stops
const LOCS = [
  { id: "basics", name: "Base Camp", icon: "🏕️", desc: "Where every climber begins their AI journey", color: C.green, x: 15, y: 85, lessons: 8, sub: "AI Basics" },
  { id: "writing", name: "Forest Lodge", icon: "✍️", desc: "Master writing with AI as your partner", color: C.teal, x: 35, y: 70, lessons: 12, sub: "AI for Writing" },
  { id: "images", name: "Artist's Outlook", icon: "🎨", desc: "Create visuals from any vantage point", color: C.coral, x: 60, y: 75, lessons: 10, sub: "AI Image Creation" },
  { id: "business", name: "Market Pass", icon: "💼", desc: "Where AI meets real business results", color: C.gold, x: 75, y: 55, lessons: 15, sub: "AI for Business" },
  { id: "data", name: "Signal Peak", icon: "📈", desc: "See clearly through any amount of data", color: C.blue, x: 55, y: 38, lessons: 10, sub: "AI for Data" },
  { id: "daily", name: "Village Rest", icon: "🏠", desc: "AI woven into everyday life", color: C.tealLight, x: 28, y: 48, lessons: 8, sub: "AI in Daily Life" },
  { id: "master", name: "The Summit", icon: "⛰️", desc: "You've reached AI fluency", color: C.snow, x: 50, y: 12, lessons: 0, sub: "AI Mastery" },
];

// LESSONS
const LESSONS = {
  basics:{title:"What Is AI, Really?",sections:[{h:"Think of AI like a smart assistant",body:"AI is a computer program that learns from examples — like how you learned to recognize dogs by seeing lots of dogs as a child.\n\nIt doesn't \"think\" like a human. It's more like an incredibly fast pattern-matching machine that's read most of the internet."},{h:"What can AI do today?",body:"AI can: write text, create images, translate languages, summarize documents, answer questions, and brainstorm ideas.\n\nWhat it CAN'T do: truly understand emotions, be creative the way humans are, or reliably do complex math."},{h:"The key concept: prompts",body:"When you talk to AI, what you type is called a \"prompt.\" The better your prompt, the better the response.\n\nThink of it like giving directions — \"go somewhere nice\" gets a different result than \"take me to the Italian restaurant on Oak Street.\""}],questions:["Can you give me a real-life example?","What's the difference between AI and a regular app?","Is AI going to take my job?","How does AI learn from examples?"]},
  writing:{title:"Your First AI Email",sections:[{h:"Why AI and email are a perfect match",body:"Most people spend 2+ hours a day on email. AI can cut that in half — not by writing FOR you, but by giving you a strong draft that you refine."},{h:"The 3-part prompt formula",body:"Every great AI email prompt has three parts:\n\n1. ROLE — Tell AI who to be\n2. CONTEXT — Who you're writing to and why\n3. TONE — How it should sound"}],questions:["Show me a before/after example","What if it sounds robotic?","Help me write an email now"]},
  images:{title:"Creating Your First AI Image",sections:[{h:"No design skills needed",body:"AI image tools let anyone create professional visuals just by describing what they want."},{h:"The 4-part image prompt",body:"1. SUBJECT — What's in the image\n2. STYLE — Photo, illustration, painting\n3. MOOD — Warm, dramatic, playful\n4. DETAILS — Lighting, colors, angle"}],questions:["Help me create a logo","Best free AI image tool?","Can AI create real photos?"]},
  business:{title:"AI Tools That Save Hours",sections:[{h:"Start with what wastes your time",body:"Pick the ONE task that wastes the most time and automate that first. You'll save 5-10 hours per week."}],questions:["What should I automate first?","Are these tools safe?","How much time will I save?"]},
  data:{title:"AI + Spreadsheets",sections:[{h:"No more formula headaches",body:"AI can write spreadsheet formulas for you. Just describe what you need in plain English."}],questions:["How do I use AI with Google Sheets?","Can AI create charts?"]},
  daily:{title:"AI in Everyday Life",sections:[{h:"AI is already around you",body:"Your phone's autocorrect, Netflix recommendations, Google Maps traffic — that's all AI. Now you can direct it to help with specific tasks."}],questions:["Plan meals for my family","Help with a medical term","What AI apps should I have?"]},
};

// NEWS
const NEWS = [
  {id:1,cat:"Breaking",time:"2h ago",title:"Google Releases Gemini 3.0 — What It Means For You",eli5:"Google made their AI much smarter. It now understands photos, videos, and documents all at once.",why:"If you use Gmail or Google Docs, AI will soon help you write emails and summarize documents automatically.",questions:["How is this different from ChatGPT?","Will it be free?","Should I switch tools?"]},
  {id:2,cat:"Tools",time:"5h ago",title:"Free AI Tool Turns Voice Notes Into Polished Text",eli5:"Talk into your phone and AI turns it into a clean email or document. No typing needed.",why:"Perfect for anyone who thinks better out loud or finds typing frustrating.",questions:["What languages?","Is my voice data private?","How accurate is it?"]},
  {id:3,cat:"Policy",time:"8h ago",title:"EU Passes First AI Safety Law",eli5:"Europe created safety rules for AI companies — like car safety standards but for AI.",why:"Companies can't secretly manipulate you, and you'll know when you're talking to AI.",questions:["Affect me outside Europe?","What if companies break rules?","Slow AI progress?"]},
];

// TOOLS
const TOOLS = [
  {id:"email",icon:"✍️",name:"Write an Email",color:C.teal,steps:[{q:"What kind?",opts:["Work / Professional","Personal / Friendly","Complaint","Thank You"]},{q:"Who to?",opts:["My boss","A client","A coworker","A company"]},{q:"Tone?",opts:["Formal","Warm","Direct","Apologetic"]},{q:"About what?",free:true,ph:"e.g. Requesting time off..."}],sys:"You are an expert email writer. Write a concise professional email. Subject line then body only."},
  {id:"prompt",icon:"💬",name:"Build a Prompt",color:C.gold,steps:[{q:"Help with?",opts:["Writing","Analyzing","Creative ideas","Problem solving"]},{q:"Detail level?",opts:["Quick","Medium","Thorough","Step-by-step"]},{q:"Describe task:",free:true,ph:"e.g. Plan a marketing campaign..."}],sys:"You are an AI prompt expert. Generate a prompt they can copy and use. Explain why each part works."},
  {id:"summarize",icon:"📄",name:"Summarize Text",color:C.blue,steps:[{q:"Content type?",opts:["Article","Report","Email chain","Contract"]},{q:"What do you need?",opts:["Key takeaways","Action items","Simple explanation","Pros and cons"]},{q:"Paste text:",free:true,ph:"Paste or describe content..."}],sys:"Create a clear concise summary in simple language."},
];

// CSS
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Quicksand:wght@500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{background:#0A1420;overflow:hidden}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2A4060;border-radius:2px}
  input::placeholder,textarea::placeholder{color:#506878}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes lumiFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:.8}}
  @keyframes pop{0%{transform:scale(.92);opacity:0}100%{transform:scale(1);opacity:1}}
  @keyframes pulse{0%,100%{opacity:.15}50%{opacity:.35}}
  .fu{animation:fadeUp .4s ease both}.fi{animation:fadeIn .3s ease both}.pop{animation:pop .3s ease both}
  .s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}.s4{animation-delay:.2s}.s5{animation-delay:.25s}
  button{transition:all .15s ease;cursor:pointer}button:active{transform:scale(.97)}
`;

// SMALL COMPONENTS
const Btn = ({children,onClick,v="gold",disabled,style:sx={}}) => {
  const st={gold:{background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(212,165,90,.3)"},ghost:{background:"rgba(255,255,255,.05)",color:C.text,border:`1px solid ${C.border}`},teal:{background:`linear-gradient(135deg,${C.teal},#2A8888)`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(58,168,160,.25)"}};
  return <button disabled={disabled} onClick={onClick} style={{padding:"13px 24px",borderRadius:14,fontSize:15,fontWeight:700,fontFamily:C.font,opacity:disabled?.5:1,width:"100%",...st[v],...sx}}>{children}</button>;
};
const Dots = () => {const[f,sF]=useState(0);useEffect(()=>{const i=setInterval(()=>sF(n=>(n+1)%4),400);return()=>clearInterval(i)},[]);return<div style={{display:"flex",gap:5,padding:"10px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.gold,opacity:f>i?.8:.2,transition:"opacity .3s"}}/>)}</div>};
const Bub = ({from,text,typing}) => <div className="fu" style={{display:"flex",justifyContent:from==="user"?"flex-end":"flex-start",mb:12,gap:8,marginBottom:12}}>{from==="lumi"&&!typing&&<div style={{marginTop:4}}><Lumi size={26}/></div>}<div style={{maxWidth:"82%",padding:"11px 15px",borderRadius:from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:from==="user"?"rgba(58,168,160,.12)":"rgba(212,165,90,.08)",border:`1px solid ${from==="user"?"rgba(58,168,160,.2)":C.borderGold}`}}>{typing?<Dots/>:<p style={{color:C.text,fontSize:14,lineHeight:1.6,fontFamily:C.font,whiteSpace:"pre-wrap",margin:0}}>{text}</p>}</div></div>;
const Stars = () => <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>{Array.from({length:50},(_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*50}%`,width:Math.random()>.8?2.5:1.5,height:Math.random()>.8?2.5:1.5,background:"#fff",borderRadius:"50%",opacity:.1+Math.random()*.3,animation:`twinkle ${3+Math.random()*4}s ease-in-out infinite`,animationDelay:`${Math.random()*4}s`}}/>)}</div>;

// AUTH
const AuthScreen = () => {
  const [mode,setMode]=useState("signin");const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [loading,setLoading]=useState(false);const [err,setErr]=useState("");
  const go=async()=>{if(!email||!pass){setErr("Please fill in both fields");return}setLoading(true);setErr("");const{error}=mode==="signup"?await db.signUp(email,pass):await db.signIn(email,pass);setLoading(false);if(error){setErr(error.message);return}if(mode==="signup")setMode("check")};
  if(mode==="check")return(<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,position:"relative"}}><Stars/><Lumi size={72} mood="excited" level={1} animate/><h2 style={{color:C.goldLight,fontSize:22,fontFamily:C.fontDisplay,fontWeight:700,marginTop:14,textAlign:"center"}}>Check your email!</h2><p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,textAlign:"center",lineHeight:1.7,maxWidth:300,marginTop:8}}>We sent a link to <strong style={{color:C.gold}}>{email}</strong></p><div style={{marginTop:24,width:"100%",maxWidth:280}}><Btn v="ghost" onClick={()=>setMode("signin")}>Back to Sign In</Btn></div></div>);
  return(<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop} 0%,${C.skyMid} 50%,${C.mountain} 80%,${C.green} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",position:"relative"}}>
    <Stars/>
    <div className="fu" style={{position:"relative",zIndex:1}}><Lumi size={80} mood="happy" level={1} animate/></div>
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
    </div>
  </div>);
};

// ONBOARDING
const Onboarding = ({uid,onDone}) => {
  const [step,setStep]=useState(0);const [ans,setAns]=useState({});const [building,setBuilding]=useState(false);
  const steps=[{q:"Tell us about yourself",sub:"This shapes your path up the mountain",opts:["Business Owner","Student","Working Professional","Curious Learner","Creative / Artist","Retired & Exploring"],key:"role"},{q:"Your experience with AI?",sub:"Everyone starts somewhere — no wrong answer",opts:["Completely new to AI","Tried ChatGPT once","Use AI occasionally","Ready to go deeper"],key:"exp"},{q:"What are you climbing toward?",sub:"Select everything that interests you",opts:["Better writing","Creating images","Business growth","Staying informed","Automating tasks","Just exploring"],key:"goals",multi:true}];
  const pick=(val)=>{const s=steps[step];if(s.multi){const c=ans[s.key]||[];setAns({...ans,[s.key]:c.includes(val)?c.filter(v=>v!==val):[...c,val]})}else{const na={...ans,[s.key]:val};setAns(na);if(step<2)setTimeout(()=>setStep(step+1),300);else finish(na)}};
  const finish=async(fa)=>{setBuilding(true);const a=fa||ans;await db.updateProfile(uid,{role:a.role,experience_level:a.exp,goals:a.goals||[],onboarded:true});setTimeout(()=>onDone(),2000)};
  if(building)return(<div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,position:"relative"}}><Stars/><Lumi size={72} mood="thinking" level={1} animate/><p className="fu" style={{color:C.goldLight,fontSize:18,fontFamily:C.fontDisplay,fontWeight:700,marginTop:14}}>Charting your route...</p><p className="fu s1" style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginTop:4}}>Personalizing the climb for you</p></div>);
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

// WORLD MAP — Mountain with trail
const WorldMap = ({profile,progress,onOpenLoc,onOpenNews,onOpenTools,onOpenProfile}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  const done=[...new Set(progress.map(p=>p.path_id))];
  const status=(loc)=>{if(loc.id==="master")return done.length>=6?"current":"locked";const idx=LOCS.findIndex(l=>l.id===loc.id);if(done.includes(loc.id))return"done";if(idx===0)return"current";const prev=LOCS[idx-1];if(prev&&done.includes(prev.id))return"current";return"locked"};
  return(<div style={{height:"100vh",position:"relative",overflow:"hidden",background:`linear-gradient(180deg,${C.skyTop} 0%,${C.skyMid} 30%,${C.skyBot} 50%,${C.mountain} 65%,${C.green} 80%,${C.greenDark} 100%)`}}>
    <Stars/>
    {/* Fog layers */}
    <div style={{position:"absolute",top:"42%",left:0,right:0,height:60,background:"linear-gradient(180deg,transparent,rgba(200,220,240,.04),transparent)",zIndex:3}}/>
    <div style={{position:"absolute",top:"58%",left:0,right:0,height:40,background:"linear-gradient(180deg,transparent,rgba(180,210,230,.03),transparent)",zIndex:3}}/>
    {/* Mountain silhouette */}
    <svg viewBox="0 0 400 200" preserveAspectRatio="none" style={{position:"absolute",top:"35%",left:0,width:"100%",height:"30%",zIndex:2,opacity:.3}}>
      <path d="M0 200 L80 60 L140 120 L200 20 L260 100 L320 40 L400 200 Z" fill={C.mountainLight}/>
    </svg>
    {/* Snow caps */}
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{position:"absolute",top:"35%",left:0,width:"100%",height:"8%",zIndex:2,opacity:.15}}>
      <path d="M180 100 L200 20 L220 100" fill={C.snow}/>
      <path d="M300 100 L320 40 L340 100" fill={C.snow}/>
    </svg>
    {/* Top bar */}
    <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20,background:"linear-gradient(180deg,rgba(10,20,32,.92) 0%,transparent 100%)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><Lumi size={30} mood="happy" level={level}/><div><p style={{color:C.text,fontSize:13,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>AI Fluent</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font,margin:0}}>Altitude {level}</p></div></div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(255,255,255,.05)",padding:"4px 10px",borderRadius:16,border:`1px solid ${C.border}`}}><span style={{fontSize:12}}>🔥</span><span style={{color:C.gold,fontSize:13,fontWeight:700,fontFamily:C.font}}>{profile?.current_streak||0}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(255,255,255,.05)",padding:"4px 10px",borderRadius:16,border:`1px solid ${C.border}`}}><span style={{fontSize:12}}>⭐</span><span style={{color:C.teal,fontSize:13,fontWeight:700,fontFamily:C.font}}>{progress.length}</span></div>
        <button onClick={onOpenProfile} style={{width:30,height:30,borderRadius:10,background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>👤</button>
      </div>
    </div>
    {/* TRAIL MAP */}
    <svg viewBox="0 0 400 700" style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:5}}>
      {/* Trail rope */}
      <path d="M65 595 Q130 555 120 490 Q110 430 195 395 Q100 345 115 285 Q125 235 235 255 Q305 270 300 210 Q295 150 225 120 Q195 105 205 60" fill="none" stroke={C.trailDark} strokeWidth="14" strokeLinecap="round" opacity=".25"/>
      <path d="M65 595 Q130 555 120 490 Q110 430 195 395 Q100 345 115 285 Q125 235 235 255 Q305 270 300 210 Q295 150 225 120 Q195 105 205 60" fill="none" stroke={C.trail} strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" opacity=".45"/>
      {LOCS.map((loc)=>{const st=status(loc);const x=loc.x*4;const y=loc.y*7;const d=st==="done";const cur=st==="current";const lk=st==="locked";
        return(<g key={loc.id} onClick={()=>!lk&&onOpenLoc(loc.id)} style={{cursor:lk?"default":"pointer"}}>
          {cur&&<circle cx={x} cy={y} r="30" fill={C.gold} opacity=".08"><animate attributeName="opacity" values=".05;.15;.05" dur="3s" repeatCount="indefinite"/></circle>}
          <circle cx={x} cy={y} r={cur?24:20} fill={d?C.green:cur?"rgba(212,165,90,.2)":"rgba(255,255,255,.03)"} stroke={d?C.greenDark:cur?C.gold:"rgba(255,255,255,.08)"} strokeWidth={cur?2:1.5} opacity={lk?.35:1}/>
          <circle cx={x} cy={y} r={cur?16:13} fill={d?C.greenDark:cur?C.goldLight:"rgba(255,255,255,.04)"} opacity={d?.4:cur?.7:.3}/>
          <text x={x} y={y+5} textAnchor="middle" fontSize={cur?17:15} fill={lk?"rgba(255,255,255,.2)":"#fff"} opacity={lk?.4:1}>{d?"✓":lk?"●":loc.icon}</text>
          <text x={x} y={y+(cur?38:34)} textAnchor="middle" fontSize="10" fill={lk?C.textDim:cur?C.goldLight:C.textMuted} fontFamily="'Nunito',sans-serif" fontWeight="700">{loc.name}</text>
          {cur&&<text x={x} y={y+49} textAnchor="middle" fontSize="8" fill={C.textDim} fontFamily="'Nunito',sans-serif">Tap to explore</text>}
        </g>);
      })}
    </svg>
    {/* Bottom bar */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,padding:"0 14px 14px",paddingBottom:"max(14px,env(safe-area-inset-bottom))"}}>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onOpenNews} style={{flex:1,background:"rgba(10,20,32,.88)",backdropFilter:"blur(10px)",border:`1px solid ${C.border}`,borderRadius:16,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}><span style={{fontSize:20}}>📰</span><div><p style={{color:C.gold,fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>AI News</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:0}}>Today's updates</p></div></button>
        <button onClick={onOpenTools} style={{flex:1,background:"rgba(10,20,32,.88)",backdropFilter:"blur(10px)",border:`1px solid ${C.border}`,borderRadius:16,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}><span style={{fontSize:20}}>🛠️</span><div><p style={{color:C.teal,fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>AI Tools</p><p style={{color:C.textDim,fontSize:9,fontFamily:C.font,margin:0}}>Try them out</p></div></button>
      </div>
    </div>
  </div>);
};

// LOCATION VIEW + TUTOR
const LocView = ({locId,uid,progress,onBack,onComplete}) => {
  const loc=LOCS.find(l=>l.id===locId)||LOCS[0];const lesson=LESSONS[locId];
  const [view,setView]=useState("intro");const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);

  const ask=async(q)=>{setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, a knowledgeable and warm AI guide in "AI Fluent." You're at "${loc.name}" teaching "${lesson?.title}". The user could be any age or background. Use clear, simple language. Be encouraging but not condescending. Use analogies from everyday life. Keep responses under 180 words.`,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"tutor",context_id:locId,context_title:lesson?.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch{setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:"Connection dropped — try again in a moment."}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  if(view==="tutor")return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bgDark}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}>
      <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>← Back</button>
      <div style={{flex:1,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Lumi size={22} level={level}/><span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>Lumi — Your Guide</span></div>
    </div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}>
      <Bub from="lumi" text={`Welcome to ${loc.name}. I'm here to help with "${lesson?.title}" — ask me anything, no matter how basic it seems.`}/>
      {msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text}/>)}{typing&&<Bub from="lumi" typing/>}
      {msgs.length===0&&lesson&&<div className="fu s2" style={{marginTop:14}}>
        <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600,margin:"0 0 10px"}}>People often ask...</p>
        {lesson.questions.map((q,i)=><button key={i} onClick={()=>ask(q)} style={{display:"block",width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",marginBottom:7,textAlign:"left"}}><span style={{color:C.textMuted,fontSize:13,fontFamily:C.font}}>{q}</span></button>)}
      </div>}
    </div>
    <div style={{padding:"8px 14px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,background:C.bgCard,paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}>
      <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask Lumi anything..." style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/>
      <button onClick={send} style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:16}}>↑</span></button>
    </div>
  </div>);

  if(view==="lesson"&&lesson)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>setView("intro")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← {loc.name}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:18}}>{loc.icon}</span><span style={{color:loc.color,fontSize:10,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1}}>{loc.sub}</span></div>
    <h1 className="fu s1" style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 22px",lineHeight:1.3}}>{lesson.title}</h1>
    {lesson.sections.map((sec,i)=>(<div key={i} className={`fu s${Math.min(i+2,5)}`} style={{marginBottom:26}}><h3 style={{color:C.text,fontSize:16,fontWeight:700,fontFamily:C.font,margin:"0 0 8px"}}>{sec.h}</h3><p style={{color:C.textMuted,fontSize:14,lineHeight:1.8,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{sec.body}</p></div>))}
    <button onClick={()=>setView("tutor")} className="fu" style={{width:"100%",background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,textAlign:"left",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={32} mood="happy" level={level} animate/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>Have questions? Ask Lumi</p><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>Your guide is here to help</p></div></div>
    </button>
    <Btn onClick={async()=>{await db.completeLesson(uid,locId,0);onComplete();onBack()}}>Complete & continue climbing →</Btn>
  </div>);

  return(<div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid} 60%,${C.bgDark})`,display:"flex",flexDirection:"column",position:"relative"}}>
    <Stars/><button onClick={onBack} style={{position:"absolute",top:14,left:14,background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"7px 14px",color:C.gold,fontSize:13,fontFamily:C.font,fontWeight:700,zIndex:10}}>← Map</button>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",position:"relative",zIndex:5}}>
      <div className="fu" style={{fontSize:48,marginBottom:6}}>{loc.icon}</div>
      <h1 className="fu s1" style={{color:C.text,fontSize:28,fontFamily:C.fontDisplay,fontWeight:700,textAlign:"center"}}>{loc.name}</h1>
      <p className="fu s2" style={{color:C.textMuted,fontSize:14,fontFamily:C.font,textAlign:"center",marginBottom:2}}>{loc.sub}</p>
      <p className="fu s3" style={{color:C.textDim,fontSize:13,fontFamily:C.font,textAlign:"center",lineHeight:1.6,maxWidth:280,marginBottom:24}}>{loc.desc}</p>
      <div className="fu s4" style={{display:"flex",alignItems:"center",gap:8,marginBottom:22}}><Lumi size={32} mood="happy" level={level} animate/><p style={{color:C.textDim,fontSize:13,fontFamily:C.font,fontStyle:"italic"}}>Ready when you are</p></div>
      <div className="fu s5" style={{width:"100%",maxWidth:280}}>{lesson?<Btn onClick={()=>setView("lesson")}>Start learning →</Btn>:<p style={{color:C.textDim,fontSize:14,fontFamily:C.font,textAlign:"center"}}>Complete all stops to reach the summit</p>}</div>
    </div>
  </div>);
};

// NEWS
const NewsView = ({uid,onBack}) => {
  const [open,setOpen]=useState(null);const [chat,setChat]=useState(false);const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);
  const art=NEWS.find(n=>n.id===open);
  const ask=async(q)=>{setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);try{const r=await db.callClaude({feature:"news",system:`You are Lumi, an AI news explainer. Reading: "${art.title}". Summary: ${art.eli5}. Explain simply. Under 150 words.`,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"news",context_id:String(art.id),context_title:art.title});setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}])}catch{setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:"Connection issue — try again."}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  if(chat&&art)return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bgDark}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.bgCard}}><button onClick={()=>{setChat(false);setMsgs([]);setSid(null)}} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>← Story</button><div style={{flex:1,textAlign:"center"}}><span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>Ask Lumi</span></div></div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}><Bub from="lumi" text={`I've read "${art.title}" — what would you like to know?`}/>{msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text}/>)}{typing&&<Bub from="lumi" typing/>}
      {msgs.length===0&&<div className="fu" style={{marginTop:14}}><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600,margin:"0 0 10px"}}>Common questions</p>{art.questions.map((q,i)=><button key={i} onClick={()=>ask(q)} style={{display:"block",width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",marginBottom:7,textAlign:"left"}}><span style={{color:C.textMuted,fontSize:13,fontFamily:C.font}}>{q}</span></button>)}</div>}</div>
    <div style={{padding:"8px 14px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about this..." style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/><button onClick={send} style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:16}}>↑</span></button></div>
  </div>);

  if(art)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 100px"}}>
    <button onClick={()=>setOpen(null)} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← Back</button>
    <h1 className="fu" style={{color:C.text,fontSize:21,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 18px",lineHeight:1.35}}>{art.title}</h1>
    <div className="fu s1" style={{background:"rgba(74,186,120,.06)",border:"1px solid rgba(74,186,120,.12)",borderRadius:16,padding:16,marginBottom:12}}><p style={{color:C.green,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 6px"}}>The simple version</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.eli5}</p></div>
    <div className="fu s2" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:12}}><p style={{color:C.gold,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 6px"}}>Why it matters to you</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.why}</p></div>
    <button onClick={()=>setChat(true)} className="fu s3" style={{width:"100%",background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:14,textAlign:"left"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={30}/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>Ask Lumi</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font,margin:"2px 0 0"}}>Get it explained in plain language</p></div></div></button>
  </div>);

  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← Map</button>
    <h1 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,marginBottom:4}}>AI News</h1>
    <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:18}}>What's happening in the world of AI</p>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>{NEWS.map((n,i)=>(<button key={n.id} className={`fu s${Math.min(i+1,5)}`} onClick={()=>setOpen(n.id)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:14,textAlign:"left",width:"100%"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:.8}}>{n.cat}</span><span style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>{n.time}</span></div><p style={{color:C.text,fontSize:14,fontWeight:600,fontFamily:C.font,margin:0,lineHeight:1.4}}>{n.title}</p></button>))}</div>
  </div>);
};

// TOOLS
const ToolsView = ({uid,onBack}) => {
  const [wf,setWf]=useState(null);const [step,setStep]=useState(0);const [ans,setAns]=useState([]);const [ft,setFt]=useState("");const [gen,setGen]=useState(false);const [result,setResult]=useState(null);
  const reset=()=>{setWf(null);setStep(0);setAns([]);setFt("");setResult(null)};
  const doGen=async(all)=>{setGen(true);try{const prompt=wf.steps.map((s,i)=>`${s.q}: ${all[i]}`).join("\n");const r=await db.callClaude({feature:"tool",system:wf.sys+" You are Lumi from AI Fluent. Practical, beginner-friendly.",messages:[{role:"user",content:prompt}],context_type:"tool",context_id:wf.id,context_title:wf.name});setResult(r.text)}catch{setResult("Something went wrong — try again.")}setGen(false)};
  const pick=(v)=>{const na=[...ans,v];setAns(na);if(step<wf.steps.length-1)setTimeout(()=>setStep(step+1),200);else doGen(na)};

  if(result)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}>
    <button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← Tools</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Lumi size={24}/><h2 style={{color:C.text,fontSize:18,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>Here's your result</h2></div>
    <div className="fu s1" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:14}}><p style={{color:C.text,fontSize:14,lineHeight:1.75,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{result}</p></div>
    <div style={{display:"flex",gap:8}}><div style={{flex:1}}><Btn v="ghost" onClick={()=>navigator.clipboard?.writeText(result)}>Copy</Btn></div><div style={{flex:1}}><Btn v="ghost" onClick={reset}>New</Btn></div></div>
  </div>);
  if(gen)return(<div style={{height:"100vh",background:C.bgDark,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><Lumi size={56} mood="thinking" animate/><p className="fu" style={{color:C.textMuted,fontSize:15,fontFamily:C.font,marginTop:14}}>Working on it...</p></div>);
  if(wf){const s=wf.steps[step];return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}>
    <button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:10}}>← Back</button>
    <div style={{display:"flex",gap:3,marginBottom:18}}>{wf.steps.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div>
    <p style={{color:C.textDim,fontSize:11,fontFamily:C.font,fontWeight:700,marginBottom:3}}>Step {step+1} of {wf.steps.length}</p>
    <h2 className="fu" style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 18px"}}>{s.q}</h2>
    {s.free?<div className="fu s1"><textarea value={ft} onChange={e=>setFt(e.target.value)} placeholder={s.ph} style={{width:"100%",minHeight:100,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical"}}/><div style={{marginTop:10}}><Btn onClick={()=>pick(ft||"General")} disabled={!ft.trim()}>{step<wf.steps.length-1?"Next →":"Generate"}</Btn></div></div>
    :<div style={{display:"flex",flexDirection:"column",gap:8}}>{s.opts.map((o,i)=><button key={o} className={`pop s${Math.min(i+1,5)}`} onClick={()=>pick(o)} style={{background:"rgba(255,255,255,.03)",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 16px",textAlign:"left",width:"100%"}}><span style={{color:C.textMuted,fontSize:14,fontFamily:C.font}}>{o}</span></button>)}</div>}
  </div>)}
  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"14px 20px 40px"}}>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← Map</button>
    <h1 style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,marginBottom:4}}>AI Tools</h1>
    <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:18}}>Guided step-by-step workflows</p>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>{TOOLS.map((t,i)=>(<button key={t.id} className={`fu s${Math.min(i+1,5)}`} onClick={()=>{setWf(t);setStep(0);setAns([]);setFt("");setResult(null)}} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:14,display:"flex",alignItems:"center",gap:12,textAlign:"left",width:"100%"}}><div style={{width:44,height:44,borderRadius:12,background:`${t.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{t.icon}</div><p style={{color:C.text,fontSize:14,fontWeight:600,fontFamily:C.font,margin:0}}>{t.name}</p></button>))}</div>
  </div>);
};

// PROFILE
const ProfileView = ({profile,progress,onBack,onSignOut}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.bgDark})`,padding:"14px 20px 40px",position:"relative"}}>
    <Stars/><button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:18,position:"relative",zIndex:1}}>← Map</button>
    <div className="fu" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24,position:"relative",zIndex:1}}>
      <Lumi size={72} mood="excited" level={level} animate/>
      <p style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,marginTop:8}}>{profile?.display_name||"Explorer"}</p>
      <p style={{color:C.textDim,fontSize:12,fontFamily:C.font}}>Altitude {level} · {profile?.subscription_tier==="pro"?"Pro":"Free"}</p>
    </div>
    <div className="fu s1" style={{background:"rgba(212,165,90,.05)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,marginBottom:18,position:"relative",zIndex:1}}>
      <div style={{display:"flex",justifyContent:"space-around"}}>{[{v:profile?.current_streak||0,l:"Streak",e:"🔥"},{v:progress.length,l:"Lessons",e:"⭐"},{v:profile?.total_tutor_sessions||0,l:"Chats",e:"💬"}].map((s,i)=><div key={i} style={{textAlign:"center"}}><span style={{fontSize:20}}>{s.e}</span><p style={{color:C.text,fontSize:20,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{s.v}</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>{s.l}</p></div>)}</div>
    </div>
    <div className="fu s2" style={{position:"relative",zIndex:1}}><Btn v="ghost" onClick={onSignOut}>Sign Out</Btn></div>
    <p className="fu s3" style={{textAlign:"center",color:C.textDim,fontSize:11,fontFamily:C.font,marginTop:20,position:"relative",zIndex:1}}>AI Fluent v2 · Powered by Claude</p>
  </div>);
};

// MAIN APP
export default function AIFluent(){
  const [loading,setLoading]=useState(true);const [user,setUser]=useState(null);const [profile,setProfile]=useState(null);const [progress,setProgress]=useState([]);
  const [screen,setScreen]=useState("map");const [activeLoc,setActiveLoc]=useState(null);

  useEffect(()=>{
    const init=async()=>{try{const s=await db.getSession();if(s?.user){setUser(s.user);setProfile(await db.getProfile(s.user.id));setProgress(await db.getProgress(s.user.id))}}catch(e){console.error(e)}setLoading(false)};
    init();
    const{data}=db.onAuth(async(ev,s)=>{if(ev==="SIGNED_IN"&&s?.user){setUser(s.user);setProfile(await db.getProfile(s.user.id));setProgress(await db.getProgress(s.user.id))}else if(ev==="SIGNED_OUT"){setUser(null);setProfile(null);setProgress([])}});
    return()=>data?.subscription?.unsubscribe?.();
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
  if(screen==="profile")return<><style>{css}</style><ProfileView profile={profile} progress={progress} onBack={goMap} onSignOut={out}/></>;

  return<><style>{css}</style><WorldMap profile={profile} progress={progress}
    onOpenLoc={(id)=>{setActiveLoc(id);setScreen("location")}}
    onOpenNews={()=>setScreen("news")}
    onOpenTools={()=>setScreen("tools")}
    onOpenProfile={()=>setScreen("profile")}
  /></>;
}