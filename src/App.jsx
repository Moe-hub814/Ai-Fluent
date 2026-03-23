import { useState, useEffect, useRef } from "react";
import { db } from "./lib/supabase";

// ═══════════════════════════════════════════════════════════════
// AI FLUENT v3 — Warm, Inclusive, Human-Centered Design
// Mascot: Lumi (a friendly glowing spark character)
// ═══════════════════════════════════════════════════════════════

// ─── LUMI MASCOT ───
const Lumi = ({ size = 40, mood = "happy", animate = false }) => {
  const s = size;
  const eyes = mood === "thinking" ? "- -" : mood === "excited" ? "◕ ◕" : "• •";
  const mouth = mood === "thinking" ? "‿" : mood === "excited" ? "▽" : "◡";
  return (
    <div style={{ width: s, height: s, position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", animation: animate ? "lumiFloat 2s ease-in-out infinite" : "none" }}>
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none">
        <defs>
          <radialGradient id="lumiGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFF0D4" />
            <stop offset="60%" stopColor="#FFD97A" />
            <stop offset="100%" stopColor="#F5A623" />
          </radialGradient>
          <radialGradient id="lumiInner" cx="50%" cy="45%" r="45%">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="100%" stopColor="#FFE8A8" />
          </radialGradient>
          <filter id="lumiShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#F5A623" floodOpacity="0.3" />
          </filter>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#lumiGlow)" filter="url(#lumiShadow)" opacity="0.9" />
        <circle cx="40" cy="40" r="28" fill="url(#lumiInner)" />
        <circle cx="25" cy="45" r="5" fill="#FFB366" opacity="0.3" />
        <circle cx="55" cy="45" r="5" fill="#FFB366" opacity="0.3" />
        <text x="40" y="40" textAnchor="middle" fontSize="11" fill="#5D4E37" fontFamily="sans-serif" fontWeight="700">{eyes}</text>
        <text x="40" y="52" textAnchor="middle" fontSize="10" fill="#8B7355" fontFamily="sans-serif">{mouth}</text>
        <path d="M40 6 L42 12 L48 14 L42 16 L40 22 L38 16 L32 14 L38 12 Z" fill="#FFF5E0" opacity="0.9" />
      </svg>
    </div>
  );
};

// ─── DESIGN TOKENS ───
const C = {
  bg: "#FFFCF5",
  bgWarm: "#FFF8EB",
  bgCard: "#FFFFFF",
  bgMint: "#F0FAF4",
  bgLavender: "#F5F0FF",
  bgPeach: "#FFF5EE",
  bgSky: "#F0F7FF",
  border: "#F0E8D8",
  text: "#2D2417",
  textBody: "#5C4F3D",
  textMuted: "#9C8E7A",
  textLight: "#BEB3A0",
  accent: "#E8952E",
  accentDark: "#C47A1F",
  accentLight: "#FFF0D4",
  lumi: "#F5A623",
  lumiLight: "#FFE8A8",
  green: "#3DAA6D",
  greenLight: "#E8F5EC",
  greenBg: "#F0FAF4",
  blue: "#4A90D9",
  blueLight: "#E8F2FF",
  purple: "#8B6BBF",
  purpleLight: "#F3EEFF",
  red: "#E85D5D",
  coral: "#FF8A6B",
  font: "'Nunito', sans-serif",
  fontDisplay: "'Quicksand', sans-serif",
};

// ─── CSS ───
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Quicksand:wght@500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { background: ${C.bg}; font-family: ${C.font}; overflow: hidden; }
  ::-webkit-scrollbar { width: 6px; height: 0; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
  input::placeholder, textarea::placeholder { color: ${C.textLight}; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes pop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  .fu { animation: fadeUp .45s ease both; }
  .fi { animation: fadeIn .3s ease both; }
  .pop { animation: pop .3s ease both; }
  .s1 { animation-delay: .06s; } .s2 { animation-delay: .12s; } .s3 { animation-delay: .18s; }
  .s4 { animation-delay: .24s; } .s5 { animation-delay: .3s; }
  button { transition: all .15s ease; }
  button:active { transform: scale(0.97); }
`;

// ─── CONTENT DATA ───
const NEWS = [
  { id: 1, cat: "Breaking", time: "2h ago", mins: 3, emoji: "🤖", color: C.bgLavender, accent: C.purple, title: "Google Releases Gemini 3.0 — Here's What It Means For You", eli5: "Google made their AI assistant much smarter. It can now understand photos, videos, and documents all at once — like having a super-smart helper that can see and read everything you show it.", why: "If you use Google products like Gmail or Docs, you'll soon have AI helping you write better emails and summarize long documents automatically.", questions: ["How is this different from ChatGPT?", "Will this be free?", "Should I switch tools?"] },
  { id: 2, cat: "Tools", time: "5h ago", mins: 2, emoji: "🎙️", color: C.bgMint, accent: C.green, title: "New Free AI Tool Turns Voice Notes Into Polished Text", eli5: "Imagine talking into your phone about your ideas, and an AI cleans it up into a well-written email or document. No typing needed.", why: "Perfect for anyone who thinks better out loud — busy parents, people who find typing frustrating, or anyone who wants to capture ideas on the go.", questions: ["What languages does it support?", "Is my voice data private?", "How accurate is it?"] },
  { id: 3, cat: "Policy", time: "8h ago", mins: 4, emoji: "⚖️", color: C.bgSky, accent: C.blue, title: "EU Passes World's First Comprehensive AI Safety Law", eli5: "Europe created rules for AI companies — like safety standards for cars, but for artificial intelligence. Companies must prove their AI is safe.", why: "This protects you. Companies can't secretly manipulate you, and you'll know when you're talking to an AI instead of a person.", questions: ["Does this affect me outside Europe?", "What if companies break the rules?", "Will this slow AI progress?"] },
  { id: 4, cat: "Business", time: "12h ago", mins: 3, emoji: "📊", color: C.bgPeach, accent: C.coral, title: "Small Businesses Using AI See 40% More Productivity", eli5: "A new study shows small businesses using AI tools get almost half-more work done in the same time. Like hiring an extra employee for free.", why: "Whether you run a business or work at one, learning basic AI tools could make your workday significantly easier.", questions: ["What tools are they using?", "How long to see results?", "Only for tech businesses?"] },
];

const PATHS = [
  { id: "basics", icon: "🌱", title: "AI Basics", desc: "What AI actually is — explained like a friend would", lessons: 8, color: C.green, bg: C.greenLight, level: "beginner" },
  { id: "writing", icon: "✍️", title: "AI for Writing", desc: "Write emails, posts & docs in half the time", lessons: 12, color: C.purple, bg: C.purpleLight, level: "beginner" },
  { id: "images", icon: "🎨", title: "AI Image Creation", desc: "Create beautiful visuals — no design skills needed", lessons: 10, color: C.coral, bg: "#FFF0EA", level: "beginner" },
  { id: "business", icon: "💼", title: "AI for Your Business", desc: "Save hours every week with smart automation", lessons: 15, color: C.accent, bg: C.accentLight, level: "intermediate" },
  { id: "data", icon: "📈", title: "AI for Data", desc: "Turn messy spreadsheets into clear insights", lessons: 10, color: C.blue, bg: C.blueLight, level: "intermediate" },
  { id: "daily", icon: "🏠", title: "AI in Daily Life", desc: "Cooking, travel, health — AI makes it easier", lessons: 8, color: "#6BBFA0", bg: "#EDFAF3", level: "beginner" },
];

const LESSONS = {
  basics: { title: "What Is AI, Really?", sections: [{ h: "Think of AI Like a Very Smart Assistant", body: "AI is a computer program that learns from examples — just like how you learned to recognize dogs by seeing lots of dogs as a child.\n\nIt doesn't \"think\" like a human. It's more like an incredibly fast pattern-matching machine that's read most of the internet." }, { h: "What Can AI Actually Do Today?", body: "Right now, AI can: write text, create images, translate languages, summarize documents, answer questions, and help you brainstorm.\n\nWhat it CAN'T do: truly understand emotions, be creative the way humans are, or reliably do complex math." }, { h: "The Key Concept: Prompts", body: "When you talk to AI, what you type is called a \"prompt.\" The better your prompt, the better the response.\n\nThink of it like giving directions — \"go somewhere nice\" gets a very different result than \"take me to the Italian restaurant on Oak Street.\"" }], questions: ["Can you give me a real-life example?", "What's the difference between AI and a regular app?", "Is AI going to take my job?", "How does AI learn from examples?"] },
  writing: { title: "Your First AI Email", sections: [{ h: "Why AI + Email Is a Perfect Match", body: "Most people spend 2+ hours a day on email. AI can cut that in half — not by writing FOR you, but by giving you a strong draft that you refine." }, { h: "The 3-Part Prompt Formula", body: "Every great AI email prompt has three parts:\n\n1. ROLE — Tell AI who to be\n2. CONTEXT — Who you're writing to and why\n3. TONE — How it should sound" }], questions: ["Show me a before/after example", "What if it sounds too robotic?", "Can I use this for sensitive emails?"] },
  images: { title: "Creating Your First AI Image", sections: [{ h: "You Don't Need to Be an Artist", body: "AI image tools let anyone create professional visuals just by describing what they want. No drawing skills needed." }, { h: "The 4-Part Image Prompt", body: "1. SUBJECT — What's in the image\n2. STYLE — Photo, illustration, painting\n3. MOOD — Warm, dramatic, playful\n4. DETAILS — Lighting, colors, angle" }], questions: ["Help me create a logo", "What's the best free image tool?", "Can AI create photos of real people?"] },
  business: { title: "AI Tools That Save You Hours", sections: [{ h: "Start With What Wastes Your Time", body: "Don't try to \"AI everything\" at once. Pick the ONE task that wastes the most time and automate that first. You'll save 5–10 hours per week." }], questions: ["What should I automate first?", "Are these tools safe?", "How much time will I save?"] },
  data: { title: "AI + Spreadsheets = Superpowers", sections: [{ h: "No More Formula Headaches", body: "AI can write spreadsheet formulas for you. Just describe what you need in plain English." }], questions: ["How do I use AI with Google Sheets?", "Can AI create charts?"] },
  daily: { title: "AI for Everyday Life", sections: [{ h: "AI Is Already in Your Daily Life", body: "Your phone's autocorrect, Netflix recommendations, Google Maps traffic — that's all AI. Now you can direct it to help with specific tasks." }], questions: ["Plan meals for my family", "Help me understand a medical term", "What AI apps should I have?"] },
};

const WORKFLOWS = [
  { id: "email", icon: "✍️", name: "AI Email Writer", desc: "Compose emails step-by-step", tag: "Popular", color: C.purple, steps: [{ q: "What kind of email?", opts: ["Professional / Work", "Friendly / Personal", "Complaint / Request", "Thank You / Follow-up"] }, { q: "Who's the audience?", opts: ["My boss", "A client", "A coworker", "A company"] }, { q: "What tone?", opts: ["Formal & polished", "Warm & friendly", "Direct & concise", "Apologetic"] }, { q: "What's it about?", free: true, ph: "e.g. Requesting time off next Friday..." }], sys: "You are an expert email writer. Write a professional email. Output ONLY the Subject line then body." },
  { id: "prompt", icon: "💬", name: "Prompt Builder", desc: "Learn to talk to AI effectively", tag: "Essential", color: C.accent, steps: [{ q: "What do you need help with?", opts: ["Writing something", "Analyzing info", "Creative ideas", "Solving a problem"] }, { q: "How detailed?", opts: ["Quick & short", "Medium detail", "Very thorough", "Step-by-step"] }, { q: "Format?", opts: ["Bullet points", "Paragraphs", "Table", "Conversation"] }, { q: "Describe your task:", free: true, ph: "e.g. Help me plan a marketing campaign..." }], sys: "You are an AI prompt expert. Generate a well-crafted prompt they can copy. Explain WHY each part works." },
  { id: "summarize", icon: "📋", name: "Summarizer", desc: "Turn long text into key points", tag: "Free", color: C.green, steps: [{ q: "Content type?", opts: ["Article / Blog", "Report / Paper", "Email chain", "Legal / Contract"] }, { q: "What do you need?", opts: ["Key takeaways", "Action items", "Simplified explanation", "Pros and cons"] }, { q: "Paste or describe:", free: true, ph: "Paste text or describe what to summarize..." }], sys: "Create a clear concise summary in simple language." },
  { id: "image", icon: "🎨", name: "Image Prompt Crafter", desc: "Describe images AI can create", tag: "New", color: C.coral, steps: [{ q: "What to create?", opts: ["Photo-realistic", "Illustration / Art", "Logo / Brand", "Social media"] }, { q: "Describe subject:", free: true, ph: "e.g. A cozy coffee shop in autumn..." }, { q: "Style?", opts: ["Warm & inviting", "Bold & dramatic", "Clean & minimal", "Vintage"] }], sys: "Generate 3 detailed image prompts for Midjourney/DALL-E with style, lighting, mood details." },
];

// ─── SHARED COMPONENTS ───
const Scr = ({ children, bg }) => (
  <div style={{ height: "100vh", overflowY: "auto", paddingTop: 20, paddingBottom: 90, paddingLeft: 20, paddingRight: 20, background: bg || C.bg, WebkitOverflowScrolling: "touch" }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, v = "primary", disabled, full = true, style: sx = {} }) => {
  const st = {
    primary: { background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(232,149,46,0.3)" },
    ghost: { background: C.bgCard, color: C.text, border: `1.5px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    soft: { background: C.accentLight, color: C.accentDark, border: "none" },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{ padding: "13px 24px", borderRadius: 14, fontSize: 15, fontWeight: 700, fontFamily: C.font, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto", ...st[v], ...sx }}>
      {children}
    </button>
  );
};

const Card = ({ children, bg, onClick, style: sx = {}, className }) => (
  <div className={className} onClick={onClick} style={{ background: bg || C.bgCard, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(45,36,23,0.04)", cursor: onClick ? "pointer" : "default", transition: "all .2s", ...sx }}>
    {children}
  </div>
);

const Pill = ({ text, color, bg }) => (
  <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: bg || `${color}18`, color, fontFamily: C.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
    {text}
  </span>
);

const Dots = () => {
  const [f, setF] = useState(0);
  useEffect(() => { const i = setInterval(() => setF(n => (n + 1) % 4), 400); return () => clearInterval(i); }, []);
  return (
    <div style={{ display: "flex", gap: 5, padding: "10px 0" }}>
      {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.lumi, opacity: f > i ? 0.85 : 0.2, transition: "opacity .3s" }} />)}
    </div>
  );
};

const Bub = ({ from, text, typing }) => (
  <div className="fu" style={{ display: "flex", justifyContent: from === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
    {from === "lumi" && !typing && <div style={{ marginRight: 8, marginTop: 4 }}><Lumi size={28} /></div>}
    <div style={{ maxWidth: "82%", padding: "12px 16px", borderRadius: from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: from === "user" ? "#EDE7F6" : "#FFF8EB", border: `1px solid ${from === "user" ? "#D1C4E9" : "#F0E8D8"}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {typing ? <Dots /> : <p style={{ color: C.text, fontSize: 14, lineHeight: 1.65, fontFamily: C.font, whiteSpace: "pre-wrap", margin: 0 }}>{text}</p>}
    </div>
  </div>
);

// ─── AUTH SCREEN ───
const AuthScreen = () => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const go = async () => {
    if (!email || !pass) { setErr("Please fill in both fields"); return; }
    setLoading(true); setErr("");
    const { error } = mode === "signup" ? await db.signUp(email, pass) : await db.signIn(email, pass);
    setLoading(false);
    if (error) { setErr(error.message); return; }
    if (mode === "signup") setMode("check");
  };

  if (mode === "check") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.bgWarm} 0%, ${C.bg} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <Lumi size={64} mood="excited" animate />
      <div style={{ height: 20 }} />
      <h2 style={{ color: C.text, fontSize: 22, fontFamily: C.fontDisplay, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>Check your email!</h2>
      <p style={{ color: C.textBody, fontSize: 14, fontFamily: C.font, textAlign: "center", lineHeight: 1.7, maxWidth: 300 }}>
        We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and sign in.
      </p>
      <div style={{ marginTop: 24, width: "100%", maxWidth: 280 }}>
        <Btn v="ghost" onClick={() => setMode("signin")}>← Back to Sign In</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.bgWarm} 0%, ${C.bg} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div className="fu"><Lumi size={72} mood="happy" animate /></div>
      <h1 className="fu s1" style={{ color: C.text, fontSize: 32, fontFamily: C.fontDisplay, fontWeight: 700, marginTop: 12 }}>AI Fluent</h1>
      <p className="fu s2" style={{ color: C.textMuted, fontSize: 15, fontFamily: C.font, marginBottom: 32 }}>Learn AI the friendly way</p>

      <div style={{ width: "100%", maxWidth: 340 }}>
        <div className="fu s3" style={{ display: "flex", gap: 6, marginBottom: 20, background: C.bgCard, borderRadius: 12, padding: 4, border: `1px solid ${C.border}` }}>
          {["signin", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: mode === m ? C.accentLight : "transparent", color: mode === m ? C.accentDark : C.textMuted, fontSize: 14, fontWeight: 700, fontFamily: C.font, cursor: "pointer" }}>
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="fu s4" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
            style={{ width: "100%", background: C.bgCard, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: "13px 16px", color: C.text, fontSize: 15, fontFamily: C.font, outline: "none" }} />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={e => e.key === "Enter" && go()}
            style={{ width: "100%", background: C.bgCard, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: "13px 16px", color: C.text, fontSize: 15, fontFamily: C.font, outline: "none" }} />
        </div>

        {err && <p className="fi" style={{ color: C.red, fontSize: 13, fontFamily: C.font, marginBottom: 12, textAlign: "center" }}>{err}</p>}
        <Btn onClick={go} disabled={loading}>{loading ? "Signing in..." : mode === "signin" ? "Sign In" : "Create My Account"}</Btn>
      </div>
    </div>
  );
};

// ─── ONBOARDING ───
const Onboarding = ({ uid, onDone }) => {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [building, setBuilding] = useState(false);

  const steps = [
    { q: "What brings you here?", sub: "This helps Lumi personalize your journey", opts: ["I run a business", "I'm a student", "I work a 9-to-5", "I'm just curious", "I'm creative / artistic", "I'm retired & want to learn"], key: "role" },
    { q: "How much do you know about AI?", sub: "No wrong answer — we all start somewhere!", opts: ["Brand new — what even is AI?", "I've played with ChatGPT", "I use AI tools sometimes", "I'm ready to go deeper"], key: "exp" },
    { q: "What excites you most?", sub: "Pick as many as you like!", opts: ["Writing better & faster", "Creating images & visuals", "Boosting my business", "Staying up-to-date on AI", "Automating boring stuff", "Just exploring — surprise me!"], key: "goals", multi: true },
  ];

  const finish = async (fa) => {
    setBuilding(true);
    const a = fa || ans;
    await db.updateProfile(uid, { role: a.role, experience_level: a.exp, goals: a.goals || [], onboarded: true });
    setTimeout(() => onDone(), 2000);
  };

  const pick = (val) => {
    const s = steps[step];
    if (s.multi) {
      const c = ans[s.key] || [];
      setAns({ ...ans, [s.key]: c.includes(val) ? c.filter(v => v !== val) : [...c, val] });
    } else {
      const na = { ...ans, [s.key]: val };
      setAns(na);
      if (step < 2) setTimeout(() => setStep(step + 1), 300);
      else finish(na);
    }
  };

  if (building) return (
    <div style={{ height: "100vh", background: `linear-gradient(180deg, ${C.bgWarm}, ${C.bg})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <Lumi size={72} mood="thinking" animate />
      <div style={{ height: 16 }} />
      <p className="fu" style={{ color: C.text, fontSize: 18, fontFamily: C.fontDisplay, fontWeight: 700 }}>Lumi is building your path...</p>
      <p className="fu s1" style={{ color: C.textMuted, fontSize: 13, fontFamily: C.font, marginTop: 6 }}>Personalizing lessons just for you</p>
    </div>
  );

  const s = steps[step];
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.bgWarm}, ${C.bg})`, display: "flex", flexDirection: "column", padding: "48px 24px 40px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
        {steps.map((_, i) => <div key={i} style={{ width: i === step ? 32 : 10, height: 10, borderRadius: 5, background: i <= step ? C.accent : `${C.text}12`, transition: "all .4s" }} />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Lumi size={36} mood={step === 2 ? "excited" : "happy"} />
        <span style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, fontWeight: 600 }}>Lumi wants to know...</span>
      </div>
      <h2 style={{ color: C.text, fontSize: 26, fontFamily: C.fontDisplay, fontWeight: 700, margin: "0 0 4px", lineHeight: 1.3 }}>{s.q}</h2>
      <p style={{ color: C.textMuted, fontSize: 14, fontFamily: C.font, margin: "0 0 24px" }}>{s.sub}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {s.opts.map((o, i) => {
          const sel = s.multi ? (ans[s.key] || []).includes(o) : ans[s.key] === o;
          return (
            <button key={o} className={`pop s${Math.min(i + 1, 5)}`} onClick={() => pick(o)} style={{ background: sel ? C.accentLight : C.bgCard, border: `2px solid ${sel ? C.accent : C.border}`, borderRadius: 16, padding: "14px 18px", cursor: "pointer", textAlign: "left", boxShadow: sel ? "0 2px 12px rgba(232,149,46,0.15)" : "0 1px 4px rgba(0,0,0,0.03)" }}>
              <span style={{ color: sel ? C.accentDark : C.textBody, fontSize: 15, fontWeight: sel ? 700 : 500, fontFamily: C.font }}>{sel ? "✓ " : ""}{o}</span>
            </button>
          );
        })}
      </div>
      {s.multi && (ans[s.key] || []).length > 0 && (
        <div className="fu" style={{ marginTop: 16 }}><Btn onClick={() => finish(ans)}>Let's go! →</Btn></div>
      )}
    </div>
  );
};

// ─── TAB BAR ───
const TabBar = ({ tab, setTab }) => (
  <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 72, background: `${C.bg}f5`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
    {[{ id: "learn", icon: "📚", l: "Learn" }, { id: "news", icon: "📰", l: "News" }, { id: "tools", icon: "🧰", l: "Tools" }, { id: "profile", icon: "😊", l: "Me" }].map(t => {
      const a = tab === t.id;
      return (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ background: a ? C.accentLight : "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", padding: "8px 20px", borderRadius: 14, transition: "all .2s" }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: a ? 800 : 600, color: a ? C.accentDark : C.textMuted, fontFamily: C.font }}>{t.l}</span>
        </button>
      );
    })}
  </div>
);

// ─── LEARN TAB ───
const LearnTab = ({ profile, progress, onOpen }) => {
  const name = profile?.display_name?.split(" ")[0] || "friend";
  const streak = profile?.current_streak || 0;
  const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

  return (
    <Scr bg={`linear-gradient(180deg, ${C.bgWarm} 0%, ${C.bg} 30%)`}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ color: C.textMuted, fontSize: 13, fontFamily: C.font, fontWeight: 600 }}>{greet()}</p>
          <h1 style={{ color: C.text, fontSize: 26, fontFamily: C.fontDisplay, fontWeight: 700, lineHeight: 1.2 }}>{name} 👋</h1>
        </div>
        <Lumi size={44} mood={streak > 2 ? "excited" : "happy"} animate />
      </div>

      <Card bg={`linear-gradient(135deg, ${C.accentLight}, ${C.bgWarm})`} style={{ marginBottom: 20, border: `1.5px solid ${C.lumiLight}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}><span style={{ fontSize: 28 }}>🔥</span><p style={{ color: C.text, fontSize: 24, fontWeight: 800, fontFamily: C.font, margin: "2px 0 0" }}>{streak}</p><p style={{ color: C.textMuted, fontSize: 11, fontFamily: C.font }}>Day streak</p></div>
          <div style={{ width: 1, height: 40, background: C.border }} />
          <div style={{ textAlign: "center" }}><span style={{ fontSize: 28 }}>✅</span><p style={{ color: C.text, fontSize: 24, fontWeight: 800, fontFamily: C.font, margin: "2px 0 0" }}>{progress.length}</p><p style={{ color: C.textMuted, fontSize: 11, fontFamily: C.font }}>Lessons done</p></div>
          <div style={{ width: 1, height: 40, background: C.border }} />
          <div style={{ textAlign: "center" }}><span style={{ fontSize: 28 }}>⭐</span><p style={{ color: C.text, fontSize: 24, fontWeight: 800, fontFamily: C.font, margin: "2px 0 0" }}>{Math.max(1, Math.floor(progress.length / 2) + 1)}</p><p style={{ color: C.textMuted, fontSize: 11, fontFamily: C.font }}>Level</p></div>
        </div>
      </Card>

      {progress.length === 0 && (
        <Card bg={C.bgWarm} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14, border: `1.5px solid ${C.lumiLight}` }}>
          <Lumi size={40} mood="happy" />
          <div>
            <p style={{ color: C.text, fontSize: 14, fontWeight: 700, fontFamily: C.font, margin: "0 0 2px" }}>Welcome! Start with AI Basics</p>
            <p style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, margin: 0, lineHeight: 1.5 }}>I picked this path for you — takes just 5 minutes!</p>
          </div>
        </Card>
      )}

      <p style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Your Learning Paths</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PATHS.map((p, i) => {
          const done = progress.filter(pr => pr.path_id === p.id).length;
          const pct = done > 0 ? Math.min(100, Math.round(done / p.lessons * 100)) : 0;
          return (
            <Card key={p.id} onClick={() => onOpen(p.id)} style={{ padding: 0, overflow: "hidden", cursor: "pointer" }} bg={C.bgCard}>
              <div className={`fu s${Math.min(i + 1, 5)}`} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <h3 style={{ color: C.text, fontSize: 15, fontWeight: 700, fontFamily: C.font, margin: 0 }}>{p.title}</h3>
                    <Pill text={p.level === "beginner" ? "Beginner" : "Intermediate"} color={p.level === "beginner" ? C.green : C.accent} bg={p.level === "beginner" ? C.greenLight : C.accentLight} />
                  </div>
                  <p style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, margin: "0 0 8px" }}>{p.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "#F0EBE0", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${p.color}, ${p.color}cc)`, borderRadius: 6, transition: "width .6s ease" }} />
                    </div>
                    <span style={{ color: C.textMuted, fontSize: 11, fontFamily: C.font, fontWeight: 600, whiteSpace: "nowrap" }}>{pct > 0 ? `${pct}%` : `${p.lessons} lessons`}</span>
                  </div>
                </div>
                <span style={{ color: C.textLight, fontSize: 18 }}>›</span>
              </div>
            </Card>
          );
        })}
      </div>
    </Scr>
  );
};

// ─── LESSON VIEW ───
const LessonView = ({ pathId, uid, onBack, onComplete }) => {
  const lesson = LESSONS[pathId] || LESSONS.basics;
  const path = PATHS.find(p => p.id === pathId) || PATHS[0];
  const [showTutor, setShowTutor] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inp, setInp] = useState("");
  const [sid, setSid] = useState(null);
  const ref = useRef(null);

  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight); }, [msgs, typing]);

  const ask = async (q) => {
    setMsgs(m => [...m, { from: "user", text: q }]);
    setTyping(true);
    try {
      const r = await db.callClaude({
        feature: "tutor",
        system: `You are Lumi, a warm and friendly AI tutor inside "AI Fluent" teaching "${lesson.title}". The user is a complete beginner. Use simple everyday language, fun analogies, and occasional emojis. Keep responses under 180 words. Be encouraging!`,
        messages: [...msgs.map(m => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })), { role: "user", content: q }],
        session_id: sid, context_type: "tutor", context_id: pathId, context_title: lesson.title,
      });
      setSid(r.session_id || sid);
      setTyping(false);
      setMsgs(m => [...m, { from: "lumi", text: r.text }]);
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { from: "lumi", text: "Hmm, having a little trouble connecting. Give me a moment and try again! 🙏" }]);
    }
  };
  const send = () => { if (inp.trim()) { ask(inp.trim()); setInp(""); } };

  if (showTutor) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: C.bgWarm }}>
        <button onClick={() => setShowTutor(false)} style={{ background: "none", border: "none", color: C.accent, fontSize: 14, cursor: "pointer", fontFamily: C.font, fontWeight: 700 }}>← Lesson</button>
        <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Lumi size={24} /><span style={{ color: C.text, fontSize: 14, fontWeight: 700, fontFamily: C.font }}>Lumi · AI Tutor</span>
        </div>
      </div>
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: 16, background: `linear-gradient(180deg, ${C.bgWarm}, ${C.bg})` }}>
        <Bub from="lumi" text={`Hey there! 👋 I'm Lumi, your AI tutor for "${lesson.title}"\n\nAsk me anything about what you just read — no question is too simple!`} />
        {msgs.map((m, i) => <Bub key={i} from={m.from} text={m.text} />)}
        {typing && <Bub from="lumi" typing />}
        {msgs.length === 0 && (
          <div className="fu s2" style={{ marginTop: 16 }}>
            <p style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, fontWeight: 600, margin: "0 0 10px" }}>💡 Try asking...</p>
            {lesson.questions.map((q, i) => (
              <button key={i} onClick={() => ask(q)} style={{ display: "block", width: "100%", background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "11px 16px", marginBottom: 8, cursor: "pointer", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                <span style={{ color: C.textBody, fontSize: 14, fontFamily: C.font }}>{q}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, flexShrink: 0, background: C.bgCard, paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask Lumi anything..."
          style={{ flex: 1, background: C.bg, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: "11px 16px", color: C.text, fontSize: 14, fontFamily: C.font, outline: "none" }} />
        <button onClick={send} style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 10px rgba(232,149,46,0.3)" }}>
          <span style={{ color: "#fff", fontSize: 18 }}>↑</span>
        </button>
      </div>
    </div>
  );

  return (
    <Scr bg={`linear-gradient(180deg, ${path.bg}, ${C.bg} 20%)`}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.accent, fontSize: 14, cursor: "pointer", fontFamily: C.font, fontWeight: 700, padding: "4px 0", marginBottom: 16 }}>← Back to paths</button>
      <div className="fu" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Pill text="Lesson 1" color={path.color} bg={path.bg} />
      </div>
      <h1 className="fu s1" style={{ color: C.text, fontSize: 26, fontFamily: C.fontDisplay, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3 }}>{lesson.title}</h1>
      <div className="fu s2" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <Lumi size={20} /><span style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font }}>Powered by Claude</span>
      </div>
      {lesson.sections.map((sec, i) => (
        <div key={i} className={`fu s${Math.min(i + 2, 5)}`} style={{ marginBottom: 28 }}>
          <h3 style={{ color: C.text, fontSize: 17, fontWeight: 700, fontFamily: C.font, margin: "0 0 8px" }}>{sec.h}</h3>
          <p style={{ color: C.textBody, fontSize: 15, lineHeight: 1.8, fontFamily: C.font, whiteSpace: "pre-wrap" }}>{sec.body}</p>
        </div>
      ))}
      <Card bg={C.bgWarm} onClick={() => setShowTutor(true)} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 14, border: `1.5px solid ${C.lumiLight}`, cursor: "pointer" }}>
        <Lumi size={44} mood="excited" animate />
        <div>
          <p style={{ color: C.text, fontSize: 16, fontWeight: 700, fontFamily: C.font, margin: "0 0 3px" }}>Ask Lumi about this lesson</p>
          <p style={{ color: C.textMuted, fontSize: 13, fontFamily: C.font, margin: 0 }}>Your friendly AI tutor is ready to help!</p>
        </div>
      </Card>
      <Btn onClick={async () => { await db.completeLesson(uid, pathId, 0); onComplete(); onBack(); }}>✓ I got it — Complete lesson!</Btn>
    </Scr>
  );
};

// ─── NEWS TAB ───
const NewsTab = ({ uid }) => {
  const [open, setOpen] = useState(null);
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inp, setInp] = useState("");
  const [sid, setSid] = useState(null);
  const ref = useRef(null);

  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight); }, [msgs, typing]);
  const art = NEWS.find(n => n.id === open);

  const ask = async (q) => {
    setMsgs(m => [...m, { from: "user", text: q }]);
    setTyping(true);
    try {
      const r = await db.callClaude({
        feature: "news",
        system: `You are Lumi, a warm AI news explainer inside "AI Fluent." The user is reading: "${art.title}". Summary: ${art.eli5}. Explain in everyday language. Keep under 150 words. Use an emoji occasionally.`,
        messages: [...msgs.map(m => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })), { role: "user", content: q }],
        session_id: sid, context_type: "news", context_id: String(art.id), context_title: art.title,
      });
      setSid(r.session_id || sid);
      setTyping(false);
      setMsgs(m => [...m, { from: "lumi", text: r.text }]);
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { from: "lumi", text: "Oops — having trouble connecting. Try again in a moment! 🙏" }]);
    }
  };
  const send = () => { if (inp.trim()) { ask(inp.trim()); setInp(""); } };

  if (chat && art) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: C.bgWarm }}>
        <button onClick={() => { setChat(false); setMsgs([]); setSid(null); }} style={{ background: "none", border: "none", color: C.accent, fontSize: 14, cursor: "pointer", fontFamily: C.font, fontWeight: 700 }}>← Story</button>
        <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Lumi size={24} /><span style={{ color: C.text, fontSize: 14, fontWeight: 700, fontFamily: C.font }}>Ask Lumi</span>
        </div>
      </div>
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: 16, background: `linear-gradient(180deg, ${C.bgWarm}, ${C.bg})` }}>
        <Bub from="lumi" text={`I read "${art.title}" for you! 📰\n\nAsk me anything — I'll break it down in plain language.`} />
        {msgs.map((m, i) => <Bub key={i} from={m.from} text={m.text} />)}
        {typing && <Bub from="lumi" typing />}
        {msgs.length === 0 && (
          <div className="fu" style={{ marginTop: 16 }}>
            <p style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, fontWeight: 600, margin: "0 0 10px" }}>💡 People are asking...</p>
            {art.questions.map((q, i) => (
              <button key={i} onClick={() => ask(q)} style={{ display: "block", width: "100%", background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "11px 16px", marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
                <span style={{ color: C.textBody, fontSize: 14, fontFamily: C.font }}>{q}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, flexShrink: 0, background: C.bgCard, paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about this story..."
          style={{ flex: 1, background: C.bg, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: "11px 16px", color: C.text, fontSize: 14, fontFamily: C.font, outline: "none" }} />
        <button onClick={send} style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 18 }}>↑</span>
        </button>
      </div>
    </div>
  );

  if (art) return (
    <Scr>
      <button onClick={() => setOpen(null)} style={{ background: "none", border: "none", color: C.accent, fontSize: 14, cursor: "pointer", fontFamily: C.font, fontWeight: 700, marginBottom: 16 }}>← Back</button>
      <Pill text={art.cat} color={art.accent} />
      <h1 className="fu s1" style={{ color: C.text, fontSize: 23, fontFamily: C.fontDisplay, fontWeight: 700, margin: "10px 0 20px", lineHeight: 1.35 }}>{art.title}</h1>
      <Card bg={C.greenLight} className="fu s2" style={{ marginBottom: 14, border: `1px solid ${C.greenBg}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <p style={{ color: C.green, fontSize: 14, fontWeight: 700, fontFamily: C.font, margin: 0 }}>Explain Like I'm 5</p>
        </div>
        <p style={{ color: C.textBody, fontSize: 14, lineHeight: 1.7, fontFamily: C.font, margin: 0 }}>{art.eli5}</p>
      </Card>
      <Card bg={C.bgPeach} className="fu s3" style={{ marginBottom: 14, border: "1px solid #F5E0D0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <p style={{ color: C.coral, fontSize: 14, fontWeight: 700, fontFamily: C.font, margin: 0 }}>Why It Matters To You</p>
        </div>
        <p style={{ color: C.textBody, fontSize: 14, lineHeight: 1.7, fontFamily: C.font, margin: 0 }}>{art.why}</p>
      </Card>
      <Card bg={C.bgWarm} onClick={() => setChat(true)} className="fu s4" style={{ display: "flex", alignItems: "center", gap: 14, border: `1.5px solid ${C.lumiLight}`, cursor: "pointer" }}>
        <Lumi size={44} mood="happy" animate />
        <div>
          <p style={{ color: C.text, fontSize: 15, fontWeight: 700, fontFamily: C.font, margin: "0 0 3px" }}>Still have questions?</p>
          <p style={{ color: C.textMuted, fontSize: 13, fontFamily: C.font, margin: 0 }}>Ask Lumi to explain anything!</p>
        </div>
      </Card>
    </Scr>
  );

  return (
    <Scr>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ color: C.textMuted, fontSize: 13, fontFamily: C.font, fontWeight: 600 }}>Daily Digest 📬</p>
          <h1 style={{ color: C.text, fontSize: 26, fontFamily: C.fontDisplay, fontWeight: 700 }}>AI News</h1>
        </div>
        <Lumi size={36} mood="happy" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {NEWS.map((n, i) => (
          <Card key={n.id} onClick={() => setOpen(n.id)} bg={n.color} style={{ border: "none", padding: 0, overflow: "hidden", cursor: "pointer" }} className={`fu s${Math.min(i + 1, 5)}`}>
            <div style={{ padding: "18px 18px 14px", position: "relative" }}>
              <div style={{ position: "absolute", top: 14, right: 16, fontSize: 28, opacity: 0.5 }}>{n.emoji}</div>
              <Pill text={n.cat} color={n.accent} />
              <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, fontFamily: C.font, margin: "10px 0 0", lineHeight: 1.4, paddingRight: 36 }}>{n.title}</h3>
            </div>
            <div style={{ background: `${C.bgCard}99`, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.textMuted, fontSize: 11, fontFamily: C.font }}>{n.time} · {n.mins} min</span>
              <div style={{ display: "flex", gap: 6 }}>
                <Pill text="💡 ELI5" color={C.green} />
                <Pill text="✦ Ask Lumi" color={C.accent} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Scr>
  );
};

// ─── TOOLS TAB ───
const ToolsTab = ({ uid }) => {
  const [wf, setWf] = useState(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState([]);
  const [ft, setFt] = useState("");
  const [gen, setGen] = useState(false);
  const [result, setResult] = useState(null);
  const reset = () => { setWf(null); setStep(0); setAns([]); setFt(""); setResult(null); };

  const doGen = async (all) => {
    setGen(true);
    try {
      const prompt = wf.steps.map((s, i) => `${s.q}: ${all[i]}`).join("\n");
      const r = await db.callClaude({
        feature: "tool",
        system: wf.sys + " You are Lumi from AI Fluent. Keep output practical and beginner-friendly.",
        messages: [{ role: "user", content: prompt }],
        context_type: "tool", context_id: wf.id, context_title: wf.name,
      });
      setResult(r.text);
    } catch {
      setResult("Hmm, having trouble connecting. Try again in a moment!");
    }
    setGen(false);
  };

  const pick = (v) => {
    const na = [...ans, v];
    setAns(na);
    if (step < wf.steps.length - 1) setTimeout(() => setStep(step + 1), 200);
    else doGen(na);
  };

  if (result) return (
    <Scr>
      <button onClick={reset} style={{ background: "none", border: "none", color: C.accent, fontSize: 14, cursor: "pointer", fontFamily: C.font, fontWeight: 700, marginBottom: 16 }}>← Tools</button>
      <div className="fu" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>✨</span>
        <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, fontFamily: C.fontDisplay, margin: 0 }}>Here's your result!</h2>
      </div>
      <Card bg={C.bgWarm} className="fu s1" style={{ marginBottom: 16, border: `1.5px solid ${C.lumiLight}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Lumi size={24} /><span style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, fontWeight: 600 }}>Created by Lumi</span>
        </div>
        <p style={{ color: C.text, fontSize: 14, lineHeight: 1.75, fontFamily: C.font, whiteSpace: "pre-wrap" }}>{result}</p>
      </Card>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><Btn v="ghost" onClick={() => navigator.clipboard?.writeText(result)}>📋 Copy</Btn></div>
        <div style={{ flex: 1 }}><Btn v="ghost" onClick={reset}>🔄 New</Btn></div>
      </div>
    </Scr>
  );

  if (gen) return (
    <div style={{ height: "100vh", background: `linear-gradient(180deg, ${C.bgWarm}, ${C.bg})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <Lumi size={64} mood="thinking" animate />
      <div style={{ height: 16 }} />
      <p className="fu" style={{ color: C.text, fontSize: 17, fontFamily: C.fontDisplay, fontWeight: 700 }}>Lumi is working on it...</p>
    </div>
  );

  if (wf) {
    const s = wf.steps[step];
    return (
      <Scr>
        <button onClick={reset} style={{ background: "none", border: "none", color: C.accent, fontSize: 14, cursor: "pointer", fontFamily: C.font, fontWeight: 700, marginBottom: 8 }}>← Back</button>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {wf.steps.map((_, i) => <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= step ? C.accent : `${C.text}0c`, transition: "all .3s" }} />)}
        </div>
        <p style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, fontWeight: 700, marginBottom: 4 }}>Step {step + 1} of {wf.steps.length}</p>
        <h2 className="fu" style={{ color: C.text, fontSize: 22, fontFamily: C.fontDisplay, fontWeight: 700, margin: "0 0 20px" }}>{s.q}</h2>
        {s.free ? (
          <div className="fu s1">
            <textarea value={ft} onChange={e => setFt(e.target.value)} placeholder={s.ph}
              style={{ width: "100%", minHeight: 110, background: C.bgCard, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: 16, color: C.text, fontSize: 15, fontFamily: C.font, outline: "none", resize: "vertical", lineHeight: 1.6 }} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={() => pick(ft || s.ph.replace("e.g. ", ""))} disabled={!ft.trim()}>
                {step < wf.steps.length - 1 ? "Next →" : "Create with Lumi ✨"}
              </Btn>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.opts.map((o, i) => (
              <button key={o} className={`pop s${Math.min(i + 1, 5)}`} onClick={() => pick(o)} style={{ background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "14px 18px", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                <span style={{ color: C.textBody, fontSize: 15, fontFamily: C.font, fontWeight: 500 }}>{o}</span>
              </button>
            ))}
          </div>
        )}
      </Scr>
    );
  }

  return (
    <Scr>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ color: C.textMuted, fontSize: 13, fontFamily: C.font, fontWeight: 600 }}>Guided by Lumi</p>
          <h1 style={{ color: C.text, fontSize: 26, fontFamily: C.fontDisplay, fontWeight: 700 }}>AI Tools 🧰</h1>
        </div>
        <Lumi size={36} mood="excited" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {WORKFLOWS.map((w, i) => (
          <Card key={w.id} onClick={() => { setWf(w); setStep(0); setAns([]); setFt(""); setResult(null); }} className={`fu s${Math.min(i + 1, 5)}`} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
            <div style={{ width: 50, height: 50, borderRadius: 16, background: `${w.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{w.icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: C.text, fontSize: 15, fontWeight: 700, fontFamily: C.font, margin: 0 }}>{w.name}</h3>
              <p style={{ color: C.textMuted, fontSize: 12, fontFamily: C.font, margin: "2px 0 0" }}>{w.desc}</p>
            </div>
            <Pill text={w.tag} color={w.tag === "Popular" || w.tag === "Essential" ? C.coral : w.tag === "New" ? C.green : C.accent} />
          </Card>
        ))}
      </div>
    </Scr>
  );
};

// ─── PROFILE TAB ───
const ProfileTab = ({ profile, progress, onSignOut }) => (
  <Scr bg={`linear-gradient(180deg, ${C.bgWarm} 0%, ${C.bg} 30%)`}>
    <h1 style={{ color: C.text, fontSize: 26, fontFamily: C.fontDisplay, fontWeight: 700, marginBottom: 24 }}>My Profile</h1>
    <div className="fu" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accentLight}, ${C.lumiLight})`, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${C.lumi}` }}>
          {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: 82, height: 82, borderRadius: "50%" }} alt="" /> : <Lumi size={56} mood="excited" />}
        </div>
      </div>
      <p style={{ color: C.text, fontSize: 20, fontWeight: 700, fontFamily: C.fontDisplay }}>{profile?.display_name || "AI Explorer"}</p>
      <p style={{ color: C.accent, fontSize: 13, fontFamily: C.font, fontWeight: 600, marginTop: 2 }}>Level {Math.max(1, Math.floor(progress.length / 2) + 1)} · {profile?.subscription_tier === "pro" ? "Pro Member" : "Free Plan"}</p>
    </div>

    <Card bg={`linear-gradient(135deg, ${C.accentLight}, ${C.bgWarm})`} className="fu s1" style={{ marginBottom: 20, border: `1.5px solid ${C.lumiLight}` }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {[{ v: profile?.current_streak || 0, l: "Streak", e: "🔥" }, { v: progress.length, l: "Lessons", e: "📖" }, { v: profile?.total_tutor_sessions || 0, l: "Chats", e: "💬" }].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <span style={{ fontSize: 22 }}>{s.e}</span>
            <p style={{ color: C.text, fontSize: 22, fontWeight: 800, fontFamily: C.font, margin: "2px 0 0" }}>{s.v}</p>
            <p style={{ color: C.textMuted, fontSize: 11, fontFamily: C.font }}>{s.l}</p>
          </div>
        ))}
      </div>
    </Card>

    <div className="fu s2" style={{ marginBottom: 12 }}><Btn v="ghost" onClick={onSignOut}>Sign Out</Btn></div>
    <div className="fu s3" style={{ textAlign: "center", marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Lumi size={18} /><span style={{ color: C.textLight, fontSize: 11, fontFamily: C.font }}>AI Fluent v1.0 · Powered by Claude</span>
      </div>
    </div>
  </Scr>
);

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function AIFluent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState([]);
  const [tab, setTab] = useState("learn");
  const [lesson, setLesson] = useState(null);
  const [ready, setReady] = useState(false);

  // Inject Supabase SDK via CDN
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    s.onload = () => { window.__supabase = window.supabase; setReady(true); };
    s.onerror = () => setLoading(false);
    document.head.appendChild(s);
  }, []);

  // Once SDK is ready, restore session and set up auth listener
  useEffect(() => {
    if (!ready) return;
    const init = async () => {
      const s = await db.getSession();
      if (s?.user) {
        setUser(s.user);
        setProfile(await db.getProfile(s.user.id));
        setProgress(await db.getProgress(s.user.id));
      }
      setLoading(false);
    };
    init();

    const { data } = db.onAuth(async (ev, s) => {
      if (ev === "SIGNED_IN" && s?.user) {
        setUser(s.user);
        setProfile(await db.getProfile(s.user.id));
        setProgress(await db.getProgress(s.user.id));
        setLoading(false);
      } else if (ev === "SIGNED_OUT") {
        setUser(null); setProfile(null); setProgress([]);
        setLoading(false);
      }
    });
    return () => data?.subscription?.unsubscribe?.();
  }, [ready]);

  const refresh = async () => {
    if (!user) return;
    setProfile(await db.getProfile(user.id));
    setProgress(await db.getProgress(user.id));
  };

  const signOut = async () => {
    await db.signOut();
    setUser(null); setProfile(null); setProgress([]);
  };

  if (loading || !ready) return (
    <>
      <style>{css}</style>
      <div style={{ height: "100vh", background: `linear-gradient(180deg, ${C.bgWarm}, ${C.bg})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Lumi size={56} mood="happy" animate />
        <p style={{ color: C.textMuted, fontSize: 14, fontFamily: C.font, marginTop: 16 }}>Loading AI Fluent...</p>
      </div>
    </>
  );

  if (!user) return <><style>{css}</style><AuthScreen /></>;

  if (profile && !profile.onboarded) return (
    <><style>{css}</style><Onboarding uid={user.id} onDone={refresh} /></>
  );

  if (lesson) return (
    <><style>{css}</style><LessonView pathId={lesson} uid={user.id} onBack={() => setLesson(null)} onComplete={refresh} /></>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ background: C.bg, minHeight: "100vh" }}>
        {tab === "learn" && <LearnTab profile={profile} progress={progress} onOpen={setLesson} />}
        {tab === "news" && <NewsTab uid={user.id} />}
        {tab === "tools" && <ToolsTab uid={user.id} />}
        {tab === "profile" && <ProfileTab profile={profile} progress={progress} onSignOut={signOut} />}
        <TabBar tab={tab} setTab={setTab} />
      </div>
    </>
  );
}
