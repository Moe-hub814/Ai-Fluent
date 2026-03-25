import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./lib/supabase";

// AI FLUENT — STORYBOOK WORLD EDITION

// DESIGN TOKENS
const C = {
  skyTop: "#1B0F3B", skyMid: "#2D1B69", skyBot: "#4A2D8A",
  ground: "#2A5A3A", groundDark: "#1A3A28",
  path: "#C4A060", pathDark: "#8A7040", pathGlow: "#FFE8A0",
  bgDark: "#0E0824", bgCard: "#1A1040",
  border: "rgba(255,255,255,0.08)", borderGold: "rgba(245,166,35,0.3)",
  text: "#F0E8FF", textMuted: "#A098C0", textDim: "#6A6290",
  gold: "#F5A623", goldLight: "#FFE8A8", goldDark: "#C47A1F",
  green: "#4ACA7A", greenDark: "#2A8A50",
  purple: "#8B6BBF", purpleLight: "#C4A7E7", purpleDim: "#4A3A70",
  blue: "#5AA8E8", red: "#E85D5D", coral: "#FF8A6B",
  font: "'Nunito', sans-serif",
  fontDisplay: "'Quicksand', sans-serif",
  fontStory: "'Baloo 2', cursive",
};

// LUMI MASCOT - evolves with level
const Lumi = ({ size = 40, mood = "happy", level = 1, animate = false }) => {
  const s = size;
  const eyes = mood === "thinking" ? "—  —" : mood === "excited" ? "✦ ✦" : "◠ ◠";
  const mouth = mood === "thinking" ? "○" : mood === "excited" ? "▽" : "‿";
  const hasHat = level >= 3;
  const hasCape = level >= 5;
  return (
    <div style={{ width:s, height:s, position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", animation: animate ? "lumiFloat 2.5s ease-in-out infinite" : "none" }}>
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none">
        <defs>
          <radialGradient id={`lg${s}`} cx="50%" cy="40%" r="50%"><stop offset="0%" stopColor="#FFF5E0"/><stop offset="50%" stopColor="#FFD97A"/><stop offset="100%" stopColor="#F5A623"/></radialGradient>
          <radialGradient id={`li${s}`} cx="50%" cy="45%" r="45%"><stop offset="0%" stopColor="#FFFDF5"/><stop offset="100%" stopColor="#FFE8A8"/></radialGradient>
        </defs>
        <circle cx="40" cy="42" r="36" fill={`url(#lg${s})`} opacity="0.15"/>
        {hasCape && <><path d="M28 50 Q20 65 25 75 L40 68 L55 75 Q60 65 52 50 Z" fill="#8B6BBF" opacity="0.6"/><path d="M30 52 Q22 65 27 73 L40 67 L53 73 Q58 65 50 52 Z" fill="#C4A7E7" opacity="0.4"/></>}
        <circle cx="40" cy="42" r="30" fill={`url(#lg${s})`} opacity="0.7"/>
        <circle cx="40" cy="42" r="24" fill={`url(#li${s})`}/>
        <circle cx="26" cy="48" r="4.5" fill="#FFB366" opacity="0.25"/>
        <circle cx="54" cy="48" r="4.5" fill="#FFB366" opacity="0.25"/>
        {hasHat && <><ellipse cx="40" cy="22" rx="14" ry="6" fill="#8B6BBF"/><rect x="33" y="12" width="14" height="12" rx="3" fill="#6B4BA0"/><rect x="36" y="9" width="8" height="5" rx="2" fill="#C4A7E7"/></>}
        <text x="40" y="43" textAnchor="middle" fontSize="11" fill="#5D4E37" fontFamily="sans-serif" fontWeight="700">{eyes}</text>
        <text x="40" y="54" textAnchor="middle" fontSize="10" fill="#8B7355" fontFamily="sans-serif">{mouth}</text>
        <path d="M40 4 L42 10 L48 12 L42 14 L40 20 L38 14 L32 12 L38 10 Z" fill="#FFF5E0" opacity="0.8"/>
        {level >= 2 && <path d="M62 18 L63 21 L66 22 L63 23 L62 26 L61 23 L58 22 L61 21 Z" fill="#FFF5E0" opacity="0.6"/>}
      </svg>
    </div>
  );
};

// LOCATION DATA
const LOCATIONS = [
  { id:"basics", name:"Spark Village", icon:"🌱", desc:"Where every AI journey begins", color:C.green, mapX:12, mapY:82, lessons:8, subtitle:"AI Basics" },
  { id:"writing", name:"Quill Cabin", icon:"✍️", desc:"Learn to write with AI by your side", color:C.purpleLight, mapX:30, mapY:62, lessons:12, subtitle:"AI for Writing" },
  { id:"images", name:"Canvas Cove", icon:"🎨", desc:"Create images without design skills", color:C.coral, mapX:55, mapY:72, lessons:10, subtitle:"AI Image Creation" },
  { id:"business", name:"Trade Market", icon:"💼", desc:"AI tools for your business", color:C.gold, mapX:72, mapY:50, lessons:15, subtitle:"AI for Business" },
  { id:"data", name:"Crystal Tower", icon:"📊", desc:"Turn data into clear insights", color:C.blue, mapX:50, mapY:32, lessons:10, subtitle:"AI for Data" },
  { id:"daily", name:"Home Hearth", icon:"🏠", desc:"AI in your everyday life", color:"#6BBFA0", mapX:25, mapY:42, lessons:8, subtitle:"AI in Daily Life" },
  { id:"master", name:"Lumi's Castle", icon:"🏰", desc:"You've mastered AI Fluency!", color:C.purpleLight, mapX:48, mapY:10, lessons:0, subtitle:"AI Mastery" },
];

// LESSON CONTENT
const LESSONS = {
  basics:{title:"What Is AI, Really?",sections:[{h:"Think of AI Like a Very Smart Assistant",body:"AI is a computer program that learns from examples — just like how you learned to recognize dogs by seeing lots of dogs as a child.\n\nIt doesn't \"think\" like a human. It's more like an incredibly fast pattern-matching machine that's read most of the internet."},{h:"What Can AI Actually Do Today?",body:"Right now, AI can: write text, create images, translate languages, summarize documents, answer questions, and brainstorm ideas.\n\nWhat it CAN'T do: truly understand emotions, be creative the way humans are, or reliably do complex math."},{h:"The Key Concept: Prompts",body:"When you talk to AI, what you type is called a \"prompt.\" The better your prompt, the better the response.\n\nThink of it like giving directions — \"go somewhere nice\" gets a very different result than \"take me to the Italian restaurant on Oak Street.\""}],questions:["Can you give me a real-life example?","What's the difference between AI and a regular app?","Is AI going to take my job?","How does AI learn from examples?"]},
  writing:{title:"Your First AI Email",sections:[{h:"Why AI + Email Is a Perfect Match",body:"Most people spend 2+ hours a day on email. AI can cut that in half — not by writing FOR you, but by giving you a strong draft that you refine."},{h:"The 3-Part Prompt Formula",body:"Every great AI email prompt has three parts:\n\n1. ROLE — Tell AI who to be\n2. CONTEXT — Who you're writing to and why\n3. TONE — How it should sound"}],questions:["Show me a before/after example","What if it sounds too robotic?","Help me write an email right now"]},
  images:{title:"Creating Your First AI Image",sections:[{h:"You Don't Need to Be an Artist",body:"AI image tools let anyone create professional visuals just by describing what they want. No drawing skills needed."},{h:"The 4-Part Image Prompt",body:"1. SUBJECT — What's in the image\n2. STYLE — Photo, illustration, painting\n3. MOOD — Warm, dramatic, playful\n4. DETAILS — Lighting, colors, angle"}],questions:["Help me create a logo","Best free AI image tool?","Can AI create photos of real people?"]},
  business:{title:"AI Tools That Save You Hours",sections:[{h:"Start With What Wastes Your Time",body:"Don't try to \"AI everything\" at once. Pick the ONE task that wastes the most time and automate that first. You'll save 5-10 hours per week."}],questions:["What should I automate first?","Are these tools safe?","How much time will I save?"]},
  data:{title:"AI + Spreadsheets = Superpowers",sections:[{h:"No More Formula Headaches",body:"AI can write spreadsheet formulas for you. Just describe what you need in plain English."}],questions:["How do I use AI with Google Sheets?","Can AI create charts?"]},
  daily:{title:"AI for Everyday Life",sections:[{h:"AI Is Already in Your Daily Life",body:"Your phone's autocorrect, Netflix recommendations, Google Maps traffic — that's all AI. Now you can actively direct AI to help with specific tasks."}],questions:["Plan meals for my family","Help me understand a medical term","What AI apps should I have?"]},
};

// NEWS DATA
const NEWS = [
  {id:1,cat:"Breaking",time:"2h ago",title:"Google Releases Gemini 3.0 — What It Means For You",eli5:"Google made their AI much smarter. It now understands photos, videos, and documents all at once.",why:"If you use Gmail or Google Docs, AI will soon help you write emails and summarize documents automatically.",questions:["How is this different from ChatGPT?","Will it be free?","Should I switch tools?"]},
  {id:2,cat:"Tools",time:"5h ago",title:"Free AI Tool Turns Voice Notes Into Polished Text",eli5:"Talk into your phone and AI turns it into a clean email or document. No typing needed.",why:"Perfect for anyone who thinks better out loud or finds typing frustrating.",questions:["What languages?","Is my voice data private?","How accurate is it?"]},
  {id:3,cat:"Policy",time:"8h ago",title:"EU Passes First AI Safety Law",eli5:"Europe created safety rules for AI companies — like car safety standards but for AI.",why:"Companies can't secretly manipulate you, and you'll know when you're talking to AI.",questions:["Does this affect me outside Europe?","What if companies break rules?","Will this slow AI progress?"]},
];

// TOOL WORKFLOWS
const TOOLS = [
  {id:"email",icon:"✉️",name:"Write an Email",color:C.purpleLight,steps:[{q:"What kind?",opts:["Work / Professional","Personal / Friendly","Complaint","Thank You"]},{q:"Who to?",opts:["My boss","A client","A coworker","A company"]},{q:"Tone?",opts:["Formal","Warm","Direct","Apologetic"]},{q:"About what?",free:true,ph:"e.g. Requesting time off..."}],sys:"You are an expert email writer. Write a concise professional email. Output Subject line then body only."},
  {id:"prompt",icon:"💬",name:"Build a Prompt",color:C.gold,steps:[{q:"Help with?",opts:["Writing","Analyzing","Creative ideas","Problem solving"]},{q:"Detail level?",opts:["Quick","Medium","Thorough","Step-by-step"]},{q:"Describe task:",free:true,ph:"e.g. Plan a marketing campaign..."}],sys:"You are an AI prompt expert. Generate a prompt they can copy. Explain why each part works."},
  {id:"summarize",icon:"📋",name:"Summarize Text",color:C.blue,steps:[{q:"Content type?",opts:["Article","Report","Email chain","Contract"]},{q:"What do you need?",opts:["Key takeaways","Action items","Simple explanation","Pros and cons"]},{q:"Paste text:",free:true,ph:"Paste or describe content..."}],sys:"Create a clear concise summary in simple language."},
];

// CSS
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Quicksand:wght@500;600;700&family=Baloo+2:wght@500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{background:#0E0824;overflow:hidden}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#4A3A70;border-radius:2px}
  input::placeholder,textarea::placeholder{color:#6A6290}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes lumiFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}
  @keyframes pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
  .fu{animation:fadeUp .45s ease both}.fi{animation:fadeIn .3s ease both}.pop{animation:pop .35s ease both}
  .s1{animation-delay:.06s}.s2{animation-delay:.12s}.s3{animation-delay:.18s}.s4{animation-delay:.24s}.s5{animation-delay:.3s}
  button{transition:all .15s ease;cursor:pointer}button:active{transform:scale(.97)}
`;

// COMPONENTS
const Btn = ({children,onClick,v="gold",disabled,style:sx={}}) => {
  const styles = {
    gold:{background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:"#fff",border:"none",boxShadow:"0 4px 16px rgba(245,166,35,.35)"},
    ghost:{background:"rgba(255,255,255,.06)",color:C.text,border:`1px solid ${C.border}`},
    purple:{background:`linear-gradient(135deg,${C.purple},#6B4BA0)`,color:"#fff",border:"none",boxShadow:"0 4px 16px rgba(139,107,191,.3)"},
  };
  return <button disabled={disabled} onClick={onClick} style={{padding:"14px 24px",borderRadius:16,fontSize:15,fontWeight:700,fontFamily:C.font,opacity:disabled?.5:1,width:"100%",...styles[v],...sx}}>{children}</button>;
};

const Dots = () => {const[f,sF]=useState(0);useEffect(()=>{const i=setInterval(()=>sF(n=>(n+1)%4),400);return()=>clearInterval(i)},[]);return<div style={{display:"flex",gap:5,padding:"10px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.gold,opacity:f>i?.85:.2,transition:"opacity .3s"}}/>)}</div>};

const Bub = ({from,text,typing}) => <div className="fu" style={{display:"flex",justifyContent:from==="user"?"flex-end":"flex-start",marginBottom:12,gap:8}}>
  {from==="lumi"&&!typing&&<div style={{marginTop:4}}><Lumi size={28}/></div>}
  <div style={{maxWidth:"82%",padding:"12px 16px",borderRadius:from==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:from==="user"?C.purpleDim:"rgba(245,166,35,.1)",border:`1px solid ${from==="user"?"rgba(139,107,191,.3)":C.borderGold}`}}>
    {typing?<Dots/>:<p style={{color:C.text,fontSize:14,lineHeight:1.65,fontFamily:C.font,whiteSpace:"pre-wrap",margin:0}}>{text}</p>}
  </div>
</div>;

const Stars = () => <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
  {Array.from({length:35},(_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*55}%`,width:Math.random()>.7?3:2,height:Math.random()>.7?3:2,background:"#fff",borderRadius:"50%",opacity:.15+Math.random()*.35,animation:`twinkle ${2+Math.random()*3}s ease-in-out infinite`,animationDelay:`${Math.random()*3}s`}}/>)}
</div>;

// AUTH SCREEN
const AuthScreen = () => {
  const [mode,setMode]=useState("signin");
  const [email,setEmail]=useState("");const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);const [err,setErr]=useState("");
  const go = async()=>{
    if(!email||!pass){setErr("Please fill in both fields");return;}
    setLoading(true);setErr("");
    const{error}=mode==="signup"?await db.signUp(email,pass):await db.signIn(email,pass);
    setLoading(false);
    if(error){setErr(error.message);return;}
    if(mode==="signup")setMode("check");
  };
  if(mode==="check")return(
    <div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,position:"relative"}}>
      <Stars/><Lumi size={80} mood="excited" level={1} animate/>
      <h2 style={{color:C.goldLight,fontSize:22,fontFamily:C.fontStory,fontWeight:700,marginTop:16,textAlign:"center"}}>Check your email!</h2>
      <p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,textAlign:"center",lineHeight:1.7,maxWidth:300,marginTop:8}}>We sent a magic link to <strong style={{color:C.gold}}>{email}</strong>. Tap it to begin!</p>
      <div style={{marginTop:24,width:"100%",maxWidth:280}}><Btn v="ghost" onClick={()=>setMode("signin")}>Back to Sign In</Btn></div>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop} 0%,${C.skyMid} 60%,${C.ground} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",position:"relative"}}>
      <Stars/>
      <div className="fu" style={{position:"relative",zIndex:1}}><Lumi size={88} mood="happy" level={1} animate/></div>
      <h1 className="fu s1" style={{color:C.goldLight,fontSize:36,fontFamily:C.fontStory,fontWeight:800,marginTop:8,textShadow:"0 2px 20px rgba(245,166,35,.3)"}}>AI Fluent</h1>
      <p className="fu s2" style={{color:C.textMuted,fontSize:15,fontFamily:C.font,marginBottom:28}}>Your journey through AI Land begins</p>
      <div style={{width:"100%",maxWidth:340,position:"relative",zIndex:1}}>
        <div className="fu s3" style={{display:"flex",gap:6,marginBottom:18,background:"rgba(255,255,255,.04)",borderRadius:14,padding:4,border:`1px solid ${C.border}`}}>
          {["signin","signup"].map(m=><button key={m} onClick={()=>{setMode(m);setErr("")}} style={{flex:1,padding:"10px 0",borderRadius:11,border:"none",background:mode===m?"rgba(245,166,35,.15)":"transparent",color:mode===m?C.gold:C.textDim,fontSize:14,fontWeight:700,fontFamily:C.font}}>{m==="signin"?"Sign In":"Sign Up"}</button>)}
        </div>
        <div className="fu s4" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={{width:"100%",background:"rgba(255,255,255,.06)",borderRadius:14,border:`1.5px solid ${C.border}`,padding:"14px 16px",color:C.text,fontSize:15,fontFamily:C.font,outline:"none"}}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",background:"rgba(255,255,255,.06)",borderRadius:14,border:`1.5px solid ${C.border}`,padding:"14px 16px",color:C.text,fontSize:15,fontFamily:C.font,outline:"none"}}/>
        </div>
        {err&&<p className="fi" style={{color:C.red,fontSize:13,fontFamily:C.font,marginBottom:12,textAlign:"center"}}>{err}</p>}
        <Btn onClick={go} disabled={loading}>{loading?"Opening the gates...":mode==="signin"?"Enter AI Land":"Begin Your Journey"}</Btn>
      </div>
    </div>
  );
};

// ONBOARDING
const Onboarding = ({uid,onDone}) => {
  const [step,setStep]=useState(0);const [ans,setAns]=useState({});const [building,setBuilding]=useState(false);
  const steps=[
    {q:"Who are you, traveler?",sub:"Lumi will tailor your journey",opts:["Business Owner","Student","Working Professional","Curious Explorer","Creative Soul","Retired & Learning"],key:"role"},
    {q:"Have you encountered AI before?",sub:"Be honest — no wrong answer!",opts:["Never heard of it","I've tried ChatGPT once","I use AI sometimes","Ready for advanced stuff"],key:"exp"},
    {q:"What treasure do you seek?",sub:"Pick all that excite you!",opts:["Writing superpowers","Create images & art","Business growth","Stay informed on AI","Automate boring stuff","Surprise me!"],key:"goals",multi:true},
  ];
  const pick=(val)=>{const s=steps[step];if(s.multi){const c=ans[s.key]||[];setAns({...ans,[s.key]:c.includes(val)?c.filter(v=>v!==val):[...c,val]})}else{const na={...ans,[s.key]:val};setAns(na);if(step<2)setTimeout(()=>setStep(step+1),300);else finish(na)}};
  const finish=async(fa)=>{setBuilding(true);const a=fa||ans;await db.updateProfile(uid,{role:a.role,experience_level:a.exp,goals:a.goals||[],onboarded:true});setTimeout(()=>onDone(),2200)};
  if(building)return(<div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,position:"relative"}}><Stars/><Lumi size={80} mood="thinking" level={1} animate/><p className="fu" style={{color:C.goldLight,fontSize:20,fontFamily:C.fontStory,fontWeight:700,marginTop:16}}>Lumi is charting your path...</p></div>);
  const s=steps[step];
  return(<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid} 70%,${C.ground})`,display:"flex",flexDirection:"column",padding:"48px 24px 40px",position:"relative"}}>
    <Stars/>
    <div style={{display:"flex",gap:8,marginBottom:28,justifyContent:"center",position:"relative",zIndex:1}}>{steps.map((_,i)=><div key={i} style={{width:i===step?32:10,height:10,borderRadius:5,background:i<=step?C.gold:"rgba(255,255,255,.1)",transition:"all .4s"}}/>)}</div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,position:"relative",zIndex:1}}><Lumi size={40} mood={step===2?"excited":"happy"} level={1}/><span style={{color:C.textMuted,fontSize:13,fontFamily:C.font,fontWeight:600}}>Lumi asks...</span></div>
    <h2 style={{color:C.goldLight,fontSize:26,fontFamily:C.fontStory,fontWeight:700,margin:"0 0 4px",lineHeight:1.3,position:"relative",zIndex:1}}>{s.q}</h2>
    <p style={{color:C.textDim,fontSize:14,fontFamily:C.font,margin:"0 0 22px",position:"relative",zIndex:1}}>{s.sub}</p>
    <div style={{display:"flex",flexDirection:"column",gap:10,flex:1,position:"relative",zIndex:1}}>
      {s.opts.map((o,i)=>{const sel=s.multi?(ans[s.key]||[]).includes(o):ans[s.key]===o;return<button key={o} className={`pop s${Math.min(i+1,5)}`} onClick={()=>pick(o)} style={{background:sel?"rgba(245,166,35,.15)":"rgba(255,255,255,.04)",border:`2px solid ${sel?C.gold:C.border}`,borderRadius:16,padding:"14px 18px",textAlign:"left",boxShadow:sel?"0 0 20px rgba(245,166,35,.15)":"none"}}><span style={{color:sel?C.goldLight:C.textMuted,fontSize:15,fontWeight:sel?700:500,fontFamily:C.font}}>{sel?"✦  ":""}{o}</span></button>})}
    </div>
    {s.multi&&(ans[s.key]||[]).length>0&&<div className="fu" style={{marginTop:16,position:"relative",zIndex:1}}><Btn onClick={()=>finish()}>Let the journey begin! ✨</Btn></div>}
  </div>);
};

// WORLD MAP
const WorldMap = ({profile,progress,onOpenLocation,onOpenNews,onOpenTools,onOpenProfile}) => {
  const level = Math.max(1,Math.floor(progress.length/2)+1);
  const completedPaths = [...new Set(progress.map(p=>p.path_id))];
  const getStatus=(loc)=>{
    if(loc.id==="master")return completedPaths.length>=6?"unlocked":"locked";
    const idx=LOCATIONS.findIndex(l=>l.id===loc.id);
    if(completedPaths.includes(loc.id))return"completed";
    if(idx===0)return"current";
    const prev=LOCATIONS[idx-1];
    if(prev&&completedPaths.includes(prev.id))return"current";
    return"locked";
  };
  return(
    <div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop} 0%,${C.skyMid} 40%,${C.skyBot} 60%,${C.ground} 78%,${C.groundDark} 100%)`,position:"relative",overflow:"hidden"}}>
      <Stars/>
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20,background:"linear-gradient(180deg,rgba(14,8,36,.9) 0%,transparent 100%)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Lumi size={32} mood="happy" level={level}/>
          <div><p style={{color:C.goldLight,fontSize:14,fontFamily:C.fontStory,fontWeight:700,margin:0}}>AI Land</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font,margin:0}}>Level {level}</p></div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,.06)",padding:"5px 12px",borderRadius:20,border:`1px solid ${C.border}`}}><span style={{fontSize:14}}>🔥</span><span style={{color:C.gold,fontSize:14,fontWeight:700,fontFamily:C.font}}>{profile?.current_streak||0}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,.06)",padding:"5px 12px",borderRadius:20,border:`1px solid ${C.border}`}}><span style={{fontSize:14}}>⭐</span><span style={{color:C.purpleLight,fontSize:14,fontWeight:700,fontFamily:C.font}}>{progress.length}</span></div>
          <button onClick={onOpenProfile} style={{width:32,height:32,borderRadius:12,background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>👤</button>
        </div>
      </div>
      <svg viewBox="0 0 400 700" style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:5}}>
        <path d="M60 600 Q140 560 130 490 Q120 430 200 400 Q110 350 120 290 Q130 240 240 260 Q310 270 310 210 Q310 150 230 120 Q200 110 210 60" fill="none" stroke={C.pathDark} strokeWidth="18" strokeLinecap="round" opacity=".3"/>
        <path d="M60 600 Q140 560 130 490 Q120 430 200 400 Q110 350 120 290 Q130 240 240 260 Q310 270 310 210 Q310 150 230 120 Q200 110 210 60" fill="none" stroke={C.path} strokeWidth="5" strokeDasharray="10 8" strokeLinecap="round" opacity=".5"/>
        {LOCATIONS.map((loc)=>{
          const status=getStatus(loc);const x=loc.mapX*4;const y=loc.mapY*7;
          const done=status==="completed";const cur=status==="current";const locked=status==="locked";
          return(<g key={loc.id} onClick={()=>!locked&&onOpenLocation(loc.id)} style={{cursor:locked?"default":"pointer"}}>
            {cur&&<circle cx={x} cy={y} r="32" fill={C.gold} opacity=".12"><animate attributeName="opacity" values=".08;.2;.08" dur="2s" repeatCount="indefinite"/></circle>}
            <circle cx={x} cy={y} r={cur?26:22} fill={done?C.green:cur?C.gold:C.purpleDim} stroke={done?C.greenDark:cur?C.goldLight:"rgba(255,255,255,.1)"} strokeWidth={cur?3:2} opacity={locked?.4:1}/>
            {!locked&&<circle cx={x} cy={y} r={cur?18:15} fill={done?C.greenDark:cur?C.goldLight:C.bgCard} opacity={done?.5:cur?.8:.5}/>}
            <text x={x} y={y+5} textAnchor="middle" fontSize={cur?18:16} fill="#fff" opacity={locked?.3:1}>{done?"✓":locked?"🔒":loc.icon}</text>
            <text x={x} y={y+(cur?42:38)} textAnchor="middle" fontSize="11" fill={locked?C.textDim:cur?C.goldLight:C.textMuted} fontFamily="'Nunito',sans-serif" fontWeight="700">{loc.name}</text>
            {cur&&<text x={x} y={y+54} textAnchor="middle" fontSize="9" fill={C.textDim} fontFamily="'Nunito',sans-serif">Tap to enter!</text>}
          </g>);
        })}
      </svg>
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,padding:"0 16px 16px",paddingBottom:"max(16px,env(safe-area-inset-bottom))"}}>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onOpenNews} style={{flex:1,background:"rgba(14,8,36,.88)",backdropFilter:"blur(12px)",border:`1px solid ${C.border}`,borderRadius:18,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
            <span style={{fontSize:24}}>📰</span><div><p style={{color:C.gold,fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>Town Crier</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font,margin:0}}>{NEWS.length} stories</p></div>
          </button>
          <button onClick={onOpenTools} style={{flex:1,background:"rgba(14,8,36,.88)",backdropFilter:"blur(12px)",border:`1px solid ${C.border}`,borderRadius:18,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
            <span style={{fontSize:24}}>🛠️</span><div><p style={{color:C.purpleLight,fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>Workshop</p><p style={{color:C.textDim,fontSize:10,fontFamily:C.font,margin:0}}>AI tools</p></div>
          </button>
        </div>
      </div>
    </div>
  );
};

// LOCATION VIEW + TUTOR
const LocationView = ({locId,uid,progress,onBack,onComplete}) => {
  const loc=LOCATIONS.find(l=>l.id===locId)||LOCATIONS[0];const lesson=LESSONS[locId];
  const [view,setView]=useState("intro");const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);

  const ask=async(q)=>{setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, a magical glowing guide in "AI Fluent." You're at "${loc.name}" teaching "${lesson?.title}". User is a complete beginner. Use simple language, fun analogies, emojis. Keep under 180 words. Be warm and encouraging!`,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"tutor",context_id:locId,context_title:lesson?.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch{setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:"The magical connection flickered! Try again. ✨"}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  if(view==="tutor")return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`}}>
    <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0,background:C.bgDark}}>
      <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>← Lesson</button>
      <div style={{flex:1,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Lumi size={22} level={level}/><span style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font}}>Lumi — Guide</span></div>
    </div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}>
      <Bub from="lumi" text={`Welcome to ${loc.name}! ${loc.icon}\n\nAsk me anything about "${lesson?.title}" — no question is too simple!`}/>
      {msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text}/>)}{typing&&<Bub from="lumi" typing/>}
      {msgs.length===0&&lesson&&<div className="fu s2" style={{marginTop:14}}>
        <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600,margin:"0 0 10px"}}>✦ Travelers often ask...</p>
        {lesson.questions.map((q,i)=><button key={i} onClick={()=>ask(q)} style={{display:"block",width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 16px",marginBottom:8,textAlign:"left"}}><span style={{color:C.textMuted,fontSize:14,fontFamily:C.font}}>{q}</span></button>)}
      </div>}
    </div>
    <div style={{padding:"10px 16px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,background:C.bgDark,paddingBottom:"max(14px,env(safe-area-inset-bottom))"}}>
      <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask Lumi..." style={{flex:1,background:"rgba(255,255,255,.05)",borderRadius:14,border:`1px solid ${C.border}`,padding:"12px 16px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/>
      <button onClick={send} style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:18}}>→</span></button>
    </div>
  </div>);

  if(view==="lesson"&&lesson)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"16px 20px 100px"}}>
    <button onClick={()=>setView("intro")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← {loc.name}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:20}}>{loc.icon}</span><span style={{color:loc.color,fontSize:11,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1}}>{loc.name}</span></div>
    <h1 className="fu s1" style={{color:C.goldLight,fontSize:26,fontFamily:C.fontStory,fontWeight:700,margin:"0 0 24px",lineHeight:1.3}}>{lesson.title}</h1>
    {lesson.sections.map((sec,i)=>(<div key={i} className={`fu s${Math.min(i+2,5)}`} style={{marginBottom:28}}><h3 style={{color:C.text,fontSize:17,fontWeight:700,fontFamily:C.font,margin:"0 0 8px"}}>{sec.h}</h3><p style={{color:C.textMuted,fontSize:15,lineHeight:1.8,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{sec.body}</p></div>))}
    <button onClick={()=>setView("tutor")} className="fu" style={{width:"100%",background:"rgba(245,166,35,.08)",border:`1.5px solid ${C.borderGold}`,borderRadius:18,padding:18,textAlign:"left",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><Lumi size={36} mood="excited" level={level} animate/><span style={{color:C.goldLight,fontSize:16,fontWeight:700,fontFamily:C.font}}>Ask Lumi about this</span></div>
      <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,margin:0}}>Your magical guide is ready to explain anything!</p>
    </button>
    <Btn onClick={async()=>{await db.completeLesson(uid,locId,0);onComplete();onBack()}}>✨ Complete & return to map</Btn>
  </div>);

  return(<div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.bgDark})`,display:"flex",flexDirection:"column",position:"relative"}}>
    <Stars/><button onClick={onBack} style={{position:"absolute",top:16,left:16,background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:12,padding:"8px 16px",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,zIndex:10}}>← Map</button>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",position:"relative",zIndex:5}}>
      <div className="fu" style={{fontSize:56,marginBottom:8}}>{loc.icon}</div>
      <h1 className="fu s1" style={{color:C.goldLight,fontSize:32,fontFamily:C.fontStory,fontWeight:800,textAlign:"center"}}>{loc.name}</h1>
      <p className="fu s2" style={{color:C.textMuted,fontSize:15,fontFamily:C.font,textAlign:"center",marginBottom:4}}>{loc.subtitle}</p>
      <p className="fu s3" style={{color:C.textDim,fontSize:13,fontFamily:C.font,textAlign:"center",lineHeight:1.6,maxWidth:280,marginBottom:28}}>{loc.desc}</p>
      <div className="fu s4" style={{display:"flex",alignItems:"center",gap:8,marginBottom:24}}><Lumi size={36} mood="happy" level={level} animate/><p style={{color:C.textMuted,fontSize:13,fontFamily:C.font,fontStyle:"italic"}}>"Let me show you around!"</p></div>
      <div className="fu s5" style={{width:"100%",maxWidth:300}}>{lesson?<Btn onClick={()=>setView("lesson")}>Begin Lesson →</Btn>:<p style={{color:C.textDim,fontSize:14,fontFamily:C.font,textAlign:"center"}}>Complete all locations to unlock!</p>}</div>
    </div>
  </div>);
};

// NEWS - Town Crier
const NewsView = ({uid,onBack}) => {
  const [open,setOpen]=useState(null);const [chat,setChat]=useState(false);
  const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs,typing]);
  const art=NEWS.find(n=>n.id===open);

  const ask=async(q)=>{setMsgs(m=>[...m,{from:"user",text:q}]);setTyping(true);
    try{const r=await db.callClaude({feature:"news",system:`You are Lumi, the Town Crier of AI Land. Explain AI news simply and friendly. Reading: "${art.title}". Summary: ${art.eli5}. Keep under 150 words. Use emojis.`,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"news",context_id:String(art.id),context_title:art.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch{setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:"Carrier pigeon got lost! Try again. 🕊️"}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  if(chat&&art)return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bgDark}}>
    <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}><button onClick={()=>{setChat(false);setMsgs([]);setSid(null)}} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>← Story</button><div style={{flex:1,textAlign:"center"}}><span style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:C.font}}>Ask the Town Crier</span></div></div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:16}}><Bub from="lumi" text={`Hear ye! 📢 I read "${art.title}" — ask away!`}/>{msgs.map((m,i)=><Bub key={i} from={m.from} text={m.text}/>)}{typing&&<Bub from="lumi" typing/>}
      {msgs.length===0&&<div className="fu" style={{marginTop:14}}><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600,margin:"0 0 10px"}}>✦ Common questions...</p>{art.questions.map((q,i)=><button key={i} onClick={()=>ask(q)} style={{display:"block",width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 16px",marginBottom:8,textAlign:"left"}}><span style={{color:C.textMuted,fontSize:14,fontFamily:C.font}}>{q}</span></button>)}</div>}
    </div>
    <div style={{padding:"10px 16px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,paddingBottom:"max(14px,env(safe-area-inset-bottom))"}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about this..." style={{flex:1,background:"rgba(255,255,255,.05)",borderRadius:14,border:`1px solid ${C.border}`,padding:"12px 16px",color:C.text,fontSize:14,fontFamily:C.font,outline:"none"}}/><button onClick={send} style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:18}}>→</span></button></div>
  </div>);

  if(art)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"16px 20px 100px"}}>
    <button onClick={()=>setOpen(null)} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← News</button>
    <h1 className="fu" style={{color:C.goldLight,fontSize:22,fontFamily:C.fontStory,fontWeight:700,margin:"0 0 20px",lineHeight:1.3}}>{art.title}</h1>
    <div className="fu s1" style={{background:"rgba(74,202,122,.08)",border:"1px solid rgba(74,202,122,.15)",borderRadius:18,padding:18,marginBottom:14}}><p style={{color:C.green,fontSize:14,fontWeight:700,fontFamily:C.font,margin:"0 0 8px"}}>💡 The Simple Version</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.eli5}</p></div>
    <div className="fu s2" style={{background:"rgba(245,166,35,.06)",border:`1px solid ${C.borderGold}`,borderRadius:18,padding:18,marginBottom:14}}><p style={{color:C.gold,fontSize:14,fontWeight:700,fontFamily:C.font,margin:"0 0 8px"}}>🎯 Why You Should Care</p><p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,fontFamily:C.font,margin:0}}>{art.why}</p></div>
    <button onClick={()=>setChat(true)} className="fu s3" style={{width:"100%",background:"rgba(245,166,35,.08)",border:`1.5px solid ${C.borderGold}`,borderRadius:18,padding:18,textAlign:"left"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={36} mood="happy"/><div><p style={{color:C.goldLight,fontSize:15,fontWeight:700,fontFamily:C.font,margin:0}}>Ask the Town Crier</p><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>Lumi explains in plain language</p></div></div></button>
  </div>);

  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"16px 20px 40px"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>← Map</button></div>
    <h1 style={{color:C.goldLight,fontSize:26,fontFamily:C.fontStory,fontWeight:700,marginBottom:4}}>Town Crier 📰</h1>
    <p style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:20}}>Today's dispatches from AI Land</p>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>{NEWS.map((n,i)=>(<button key={n.id} className={`fu s${Math.min(i+1,5)}`} onClick={()=>setOpen(n.id)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:18,padding:16,textAlign:"left",width:"100%"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1}}>{n.cat}</span><span style={{color:C.textDim,fontSize:10,fontFamily:C.font}}>{n.time}</span></div><p style={{color:C.text,fontSize:15,fontWeight:700,fontFamily:C.font,margin:0,lineHeight:1.4}}>{n.title}</p></button>))}</div>
  </div>);
};

// TOOLS - Workshop
const ToolsView = ({uid,onBack}) => {
  const [wf,setWf]=useState(null);const [step,setStep]=useState(0);const [ans,setAns]=useState([]);const [ft,setFt]=useState("");
  const [gen,setGen]=useState(false);const [result,setResult]=useState(null);
  const reset=()=>{setWf(null);setStep(0);setAns([]);setFt("");setResult(null)};
  const doGen=async(all)=>{setGen(true);try{const prompt=wf.steps.map((s,i)=>`${s.q}: ${all[i]}`).join("\n");const r=await db.callClaude({feature:"tool",system:wf.sys+" You are Lumi from AI Fluent's Workshop. Practical and beginner-friendly.",messages:[{role:"user",content:prompt}],context_type:"tool",context_id:wf.id,context_title:wf.name});setResult(r.text)}catch{setResult("Workshop hiccup! Try again. 🔧")}setGen(false)};
  const pick=(v)=>{const na=[...ans,v];setAns(na);if(step<wf.steps.length-1)setTimeout(()=>setStep(step+1),200);else doGen(na)};

  if(result)return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"16px 20px 40px"}}>
    <button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:16}}>← Workshop</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><span style={{fontSize:24}}>✨</span><h2 style={{color:C.goldLight,fontSize:20,fontFamily:C.fontStory,fontWeight:700,margin:0}}>Crafted by Lumi!</h2></div>
    <div className="fu s1" style={{background:"rgba(245,166,35,.06)",border:`1px solid ${C.borderGold}`,borderRadius:18,padding:18,marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><Lumi size={24}/><span style={{color:C.textDim,fontSize:12,fontFamily:C.font}}>Lumi's Workshop</span></div><p style={{color:C.text,fontSize:14,lineHeight:1.75,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{result}</p></div>
    <div style={{display:"flex",gap:8}}><div style={{flex:1}}><Btn v="ghost" onClick={()=>navigator.clipboard?.writeText(result)}>📋 Copy</Btn></div><div style={{flex:1}}><Btn v="ghost" onClick={reset}>🔁 Again</Btn></div></div>
  </div>);

  if(gen)return(<div style={{height:"100vh",background:C.bgDark,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}><Lumi size={64} mood="thinking" animate/><p className="fu" style={{color:C.goldLight,fontSize:18,fontFamily:C.fontStory,fontWeight:700,marginTop:16}}>Lumi is crafting...</p></div>);

  if(wf){const s=wf.steps[step];return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"16px 20px 40px"}}>
    <button onClick={reset} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:12}}>← Back</button>
    <div style={{display:"flex",gap:4,marginBottom:20}}>{wf.steps.map((_,i)=><div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=step?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div>
    <p style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:700,marginBottom:4}}>Step {step+1} of {wf.steps.length}</p>
    <h2 className="fu" style={{color:C.goldLight,fontSize:22,fontFamily:C.fontStory,fontWeight:700,margin:"0 0 20px"}}>{s.q}</h2>
    {s.free?<div className="fu s1"><textarea value={ft} onChange={e=>setFt(e.target.value)} placeholder={s.ph} style={{width:"100%",minHeight:110,background:"rgba(255,255,255,.04)",borderRadius:16,border:`1px solid ${C.border}`,padding:16,color:C.text,fontSize:15,fontFamily:C.font,outline:"none",resize:"vertical"}}/><div style={{marginTop:12}}><Btn onClick={()=>pick(ft||"General")} disabled={!ft.trim()}>{step<wf.steps.length-1?"Next →":"Craft with Lumi ✨"}</Btn></div></div>
    :<div style={{display:"flex",flexDirection:"column",gap:10}}>{s.opts.map((o,i)=><button key={o} className={`pop s${Math.min(i+1,5)}`} onClick={()=>pick(o)} style={{background:"rgba(255,255,255,.04)",border:`1.5px solid ${C.border}`,borderRadius:16,padding:"14px 18px",textAlign:"left",width:"100%"}}><span style={{color:C.textMuted,fontSize:15,fontFamily:C.font}}>{o}</span></button>)}</div>}
  </div>)}

  return(<div style={{height:"100vh",overflowY:"auto",background:C.bgDark,padding:"16px 20px 40px"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700}}>← Map</button></div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><span style={{fontSize:28}}>🛠️</span><div><h1 style={{color:C.goldLight,fontSize:26,fontFamily:C.fontStory,fontWeight:700,margin:0}}>The Workshop</h1><p style={{color:C.textDim,fontSize:13,fontFamily:C.font}}>Lumi crafts things for you</p></div></div>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>{TOOLS.map((t,i)=>(<button key={t.id} className={`fu s${Math.min(i+1,5)}`} onClick={()=>{setWf(t);setStep(0);setAns([]);setFt("");setResult(null)}} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:18,padding:16,display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%"}}><div style={{width:50,height:50,borderRadius:16,background:`${t.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{t.icon}</div><p style={{color:C.text,fontSize:15,fontWeight:700,fontFamily:C.font,margin:0}}>{t.name}</p></button>))}</div>
  </div>);
};

// PROFILE
const ProfileView = ({profile,progress,onBack,onSignOut}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.bgDark})`,padding:"16px 20px 40px",position:"relative"}}>
    <Stars/><button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:20,position:"relative",zIndex:1}}>← Map</button>
    <div className="fu" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28,position:"relative",zIndex:1}}>
      <Lumi size={80} mood="excited" level={level} animate/>
      <p style={{color:C.goldLight,fontSize:22,fontFamily:C.fontStory,fontWeight:700,marginTop:8}}>{profile?.display_name||"Explorer"}</p>
      <p style={{color:C.textDim,fontSize:13,fontFamily:C.font}}>Level {level} · {profile?.subscription_tier==="pro"?"Pro":"Free"}</p>
    </div>
    <div className="fu s1" style={{background:"rgba(245,166,35,.06)",border:`1px solid ${C.borderGold}`,borderRadius:18,padding:18,marginBottom:20,position:"relative",zIndex:1}}>
      <div style={{display:"flex",justifyContent:"space-around"}}>
        {[{v:profile?.current_streak||0,l:"Streak",e:"🔥"},{v:progress.length,l:"Lessons",e:"⭐"},{v:profile?.total_tutor_sessions||0,l:"Chats",e:"💬"}].map((s,i)=><div key={i} style={{textAlign:"center"}}><span style={{fontSize:22}}>{s.e}</span><p style={{color:C.text,fontSize:22,fontWeight:800,fontFamily:C.font,margin:"2px 0 0"}}>{s.v}</p><p style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{s.l}</p></div>)}
      </div>
    </div>
    <div className="fu s2" style={{position:"relative",zIndex:1}}><Btn v="ghost" onClick={onSignOut}>Sign Out</Btn></div>
    <div className="fu s3" style={{textAlign:"center",marginTop:24,position:"relative",zIndex:1}}><p style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>AI Fluent v2.0 · Powered by Claude</p></div>
  </div>);
};

// MAIN APP
export default function AIFluent(){
  const [loading,setLoading]=useState(true);const [user,setUser]=useState(null);const [profile,setProfile]=useState(null);const [progress,setProgress]=useState([]);
  const [screen,setScreen]=useState("map");const [activeLoc,setActiveLoc]=useState(null);

  useEffect(()=>{
    const init=async()=>{try{const s=await db.getSession();if(s?.user){setUser(s.user);setProfile(await db.getProfile(s.user.id));setProgress(await db.getProgress(s.user.id))}}catch(e){console.error("Init:",e)}setLoading(false)};
    init();
    const{data}=db.onAuth(async(ev,s)=>{if(ev==="SIGNED_IN"&&s?.user){setUser(s.user);setProfile(await db.getProfile(s.user.id));setProgress(await db.getProgress(s.user.id))}else if(ev==="SIGNED_OUT"){setUser(null);setProfile(null);setProgress([])}});
    return()=>data?.subscription?.unsubscribe?.();
  },[]);

  const refresh=async()=>{if(!user)return;setProfile(await db.getProfile(user.id));setProgress(await db.getProgress(user.id))};
  const out=async()=>{await db.signOut();setUser(null);setProfile(null);setProgress([])};

  if(loading)return<><style>{css}</style><div style={{height:"100vh",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}}><Stars/><Lumi size={64} mood="happy" level={1} animate/><p style={{color:C.textMuted,fontSize:14,fontFamily:"'Nunito',sans-serif",marginTop:16}}>Entering AI Land...</p></div></>;
  if(!user)return<><style>{css}</style><AuthScreen/></>;
  if(profile&&!profile.onboarded)return<><style>{css}</style><Onboarding uid={user.id} onDone={refresh}/></>;
  if(screen==="location"&&activeLoc)return<><style>{css}</style><LocationView locId={activeLoc} uid={user.id} progress={progress} onBack={()=>{setScreen("map");setActiveLoc(null)}} onComplete={refresh}/></>;
  if(screen==="news")return<><style>{css}</style><NewsView uid={user.id} onBack={()=>setScreen("map")}/></>;
  if(screen==="tools")return<><style>{css}</style><ToolsView uid={user.id} onBack={()=>setScreen("map")}/></>;
  if(screen==="profile")return<><style>{css}</style><ProfileView profile={profile} progress={progress} onBack={()=>setScreen("map")} onSignOut={out}/></>;

  return<><style>{css}</style><WorldMap profile={profile} progress={progress}
    onOpenLocation={(id)=>{setActiveLoc(id);setScreen("location")}}
    onOpenNews={()=>setScreen("news")}
    onOpenTools={()=>setScreen("tools")}
    onOpenProfile={()=>setScreen("profile")}
  /></>;
}
