import { useState, useEffect, useRef } from "react";
import { sb } from "./lib/supabase";

// ─── DESIGN TOKENS ───
const T = {
  bg: "#080812",
  surface: "#0f0f1e",
  surfaceHover: "#161630",
  card: "#12122a",
  border: "rgba(255,255,255,0.06)",
  borderActive: "rgba(139,92,246,0.3)",
  text: "#e8e8f0",
  textMuted: "#8888aa",
  textDim: "#555570",
  accent: "#8b5cf6",
  accentDim: "rgba(139,92,246,0.12)",
  accentGlow: "rgba(139,92,246,0.08)",
  claude: "#c4a7e7",
  claudeBg: "rgba(196,167,231,0.08)",
  claudeBorder: "rgba(196,167,231,0.18)",
  green: "#34d399",
  greenBg: "rgba(52,211,153,0.08)",
  greenBorder: "rgba(52,211,153,0.15)",
  red: "#f43f5e",
  amber: "#fbbf24",
  font: "'Outfit', sans-serif",
  fontDisplay: "'Fraunces', serif",
};

const LANGS = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  pt: { name: "Português", flag: "🇧🇷" },
  zh: { name: "中文", flag: "🇨🇳" },
  ar: { name: "العربية", flag: "🇸🇦" },
  hi: { name: "हिन्दी", flag: "🇮🇳" },
  ja: { name: "日本語", flag: "🇯🇵" },
};

const NEWS = [
  {
    id: 1, cat: "Breaking", time: "2h ago", mins: 3, emoji: "🤖",
    grad: "linear-gradient(135deg, #1a1040 0%, #0d1b3e 100%)",
    title: "Google Releases Gemini 3.0 – Here's What It Means For You",
    eli5: "Google made their AI assistant much smarter. It can now understand photos, videos, and documents all at once – like having a super-smart helper that can see and read everything you show it.",
    why: "If you use Google products like Gmail or Docs, you'll soon have AI helping you write better emails, summarize long documents, and organize your photos automatically. No tech skills needed.",
    questions: ["How is this different from ChatGPT?", "Will this be free to use?", "Should I switch from my current AI tool?"],
  },
  {
    id: 2, cat: "Tools", time: "5h ago", mins: 2, emoji: "🎙️",
    grad: "linear-gradient(135deg, #0f1460 0%, #2d1453 100%)",
    title: "New Free AI Tool Turns Voice Notes Into Polished Text",
    eli5: "Imagine talking into your phone about your ideas, and an AI cleans it up into a well-written email or document. That's exactly what this new tool does – no typing needed.",
    why: "Perfect for anyone who thinks better out loud. Great for busy parents, people who find typing frustrating, or anyone who wants to capture ideas on the go.",
    questions: ["What languages does it support?", "Is my voice data kept private?", "Can it handle different accents?"],
  },
  {
    id: 3, cat: "Policy", time: "8h ago", mins: 4, emoji: "⚖️",
    grad: "linear-gradient(135deg, #1b0b2f 0%, #0c2447 100%)",
    title: "EU Passes World's First Comprehensive AI Safety Law",
    eli5: "Europe created rules for AI companies – like safety standards for cars, but for artificial intelligence. Companies must prove their AI is safe before people can use it.",
    why: "This protects you. Companies can't use AI to secretly manipulate you, and you'll have the right to know when you're talking to an AI instead of a real person.",
    questions: ["Does this affect me outside Europe?", "What happens to companies that break the rules?", "Will this slow down AI progress?"],
  },
  {
    id: 4, cat: "Business", time: "12h ago", mins: 3, emoji: "📈",
    grad: "linear-gradient(135deg, #0a0823 0%, #1a0a3e 100%)",
    title: "Small Businesses Using AI See 40% More Productivity",
    eli5: "A new study shows that small shops and businesses that started using AI tools are getting almost half-more work done in the same amount of time. It's like hiring an extra employee for free.",
    why: "Whether you run a business or work at one, learning even basic AI tools could make your workday significantly easier and help you focus on what actually matters to you.",
    questions: ["What specific tools are they using?", "How long does it take to see results?", "Is this only for tech businesses?"],
  },
];

const PATHS = [
  { id: "basics", icon: "🌱", title: "AI Basics", desc: "What AI actually is and how it works – no jargon", lessons: 8, color: "#34d399", level: "beginner" },
  { id: "writing", icon: "✍️", title: "AI for Writing", desc: "Write emails, posts, and documents 5x faster", lessons: 12, color: "#8b5cf6", level: "beginner" },
  { id: "images", icon: "🎨", title: "AI Image Creation", desc: "Create stunning visuals without any design skills", lessons: 10, color: "#f43f5e", level: "beginner" },
  { id: "business", icon: "💼", title: "AI for Your Business", desc: "Automate tasks and boost your productivity", lessons: 15, color: "#fbbf24", level: "intermediate" },
  { id: "data", icon: "📊", title: "AI for Data", desc: "Analyze spreadsheets and data effortlessly", lessons: 10, color: "#6366f1", level: "intermediate" },
  { id: "daily", icon: "🏠", title: "AI in Daily Life", desc: "Cooking, travel, health, parenting with AI help", lessons: 8, color: "#06b6d4", level: "beginner" },
];

const LESSONS = {
  basics: {
    title: "What Is AI, Really?",
    sections: [
      { h: "Think of AI Like a Very Smart Assistant", body: "AI is a computer program that learns from examples – just like how you learned to recognize dogs by seeing lots of dogs as a child. The AI sees millions of examples and learns patterns.\n\nIt doesn't \"think\" like a human. It's more like an incredibly fast pattern-matching machine that's read most of the internet." },
      { h: "What Can AI Actually Do Today?", body: "Right now, AI can write text, create images, translate languages, summarize documents, answer questions, and help you brainstorm ideas.\n\nWhat it CAN'T do: truly understand emotions, be creative in the way humans are, or reliably do complex math (it sometimes gets it wrong!)." },
      { h: "The Key Concept: Prompts", body: "When you talk to AI, what you type is called a \"prompt.\" The better your prompt, the better the AI's response.\n\nThink of it like giving directions – \"go somewhere nice\" gets a very different result than \"take me to the Italian restaurant on Oak Street.\" This is the single most important skill you'll learn in this app." },
    ],
    tutorIntro: "I'm your AI tutor for \"What Is AI, Really?\" 🎓\n\nAsk me anything about what you just read. No question is too basic – I'll explain it in plain, everyday language.",
    questions: ["Can you give me a real-life example?", "What's the difference between AI and a regular app?", "Is AI going to take my job?", "How does AI learn from examples?"],
  },
  writing: {
    title: "Your First AI Email",
    sections: [
      { h: "Why AI + Email Is a Perfect Match", body: "Most people spend 2+ hours a day on email. AI can cut that in half – not by writing FOR you, but by giving you a strong starting draft that you refine.\n\nThe result is emails that are clearer, more professional, and written in a fraction of the time." },
      { h: "The 3-Part Prompt Formula", body: "Every great AI email prompt has three parts:\n\n1. ROLE – Tell AI who to be: \"You are a professional email writer\"\n2. CONTEXT – Who you're writing to and why\n3. TONE – How it should sound: formal, friendly, direct\n\nPut these together and AI gives you remarkably good drafts on the first try." },
      { h: "Try It Yourself", body: "Here's a template you can copy right now:\n\n\"Write a [tone] email to [person/role] about [topic]. Keep it [length]. The goal is to [desired outcome].\"\n\nExample: \"Write a professional email to my manager about taking Friday off. Keep it short. The goal is to get approval quickly.\"" },
    ],
    tutorIntro: "I'm your tutor for \"Your First AI Email\" ✉️\n\nTry asking me to help you write a specific email, or ask about the prompt formula – I'll walk you through it step by step.",
    questions: ["Show me a before/after example", "What if the email sounds too robotic?", "Can I use this for sensitive emails?", "Help me write an email right now"],
  },
  images: {
    title: "Creating Your First AI Image",
    sections: [
      { h: "You Don't Need to Be an Artist", body: "AI image tools let anyone create professional-looking visuals just by describing what they want. No drawing skills, no Photoshop, no design degree needed.\n\nThe key is learning how to describe what you want clearly – which is a skill anyone can learn in about 10 minutes." },
      { h: "The 4-Part Image Prompt", body: "Great AI image prompts have four elements:\n\n1. SUBJECT – What's in the image\n2. STYLE – Photo, illustration, painting, etc.\n3. MOOD – The feeling: warm, dramatic, playful\n4. DETAILS – Lighting, colors, camera angle\n\nExample: \"A cozy coffee shop in autumn, watercolor illustration style, warm golden lighting, rain visible through the window.\"" },
    ],
    tutorIntro: "I'm your tutor for AI image creation 🎨\n\nDescribe any image you want to create and I'll help you build the perfect prompt for it.",
    questions: ["Help me create a logo for my business", "What's the best free AI image tool?", "How do I make images look professional?", "Can AI create photos of real people?"],
  },
  business: {
    title: "AI Tools That Save You Hours",
    sections: [
      { h: "Start With What Wastes Your Time", body: "Don't try to \"AI everything\" at once. Instead, identify the 3 tasks that eat the most time in your week. For most business owners, that's: email, content creation, and data entry.\n\nPick ONE and automate it first. You'll save 5-10 hours per week from that single change." },
      { h: "The 5 AI Tools Every Business Owner Needs", body: "1. AI Writing Assistant – for emails, proposals, social posts\n2. AI Meeting Summarizer – never take manual notes again\n3. AI Scheduler – automates appointment booking\n4. AI Customer Support – handles FAQ responses 24/7\n5. AI Data Analyzer – turns spreadsheets into insights\n\nAll of these have free tiers. You can start without spending a dime." },
    ],
    tutorIntro: "I'm your business AI tutor 💼\n\nTell me about your business and I'll recommend specific AI tools and workflows that could save you time and money.",
    questions: ["What should I automate first?", "Are these tools safe for sensitive business data?", "How much time will this realistically save me?", "I run a [type] business – what AI tools do you recommend?"],
  },
  data: {
    title: "AI + Spreadsheets = Superpowers",
    sections: [
      { h: "You Don't Need to Know Formulas Anymore", body: "AI can write spreadsheet formulas for you. Just describe what you need in plain English: \"Calculate the percentage change between last month and this month\" and AI writes the formula.\n\nThis works in Google Sheets, Excel, and most spreadsheet tools." },
    ],
    tutorIntro: "I'm your data & spreadsheets tutor 📊\n\nDescribe any spreadsheet task and I'll help you figure out how AI can handle it.",
    questions: ["How do I use AI with Google Sheets?", "Can AI create charts from my data?", "Help me analyze my sales numbers"],
  },
  daily: {
    title: "AI for Everyday Life",
    sections: [
      { h: "AI Is Already in Your Daily Life", body: "You're already using AI without realizing it – your phone's autocorrect, Netflix recommendations, Google Maps traffic predictions, and spam filters are all AI.\n\nThe difference now is that you can actively direct AI to help you with specific tasks, like a personal assistant that's available 24/7." },
      { h: "10 Things to Try This Week", body: "1. Ask AI to plan your meals for the week based on what's in your fridge\n2. Have AI create a packing list for your next trip\n3. Use AI to explain a confusing medical term from a doctor's visit\n4. Ask AI to help your kid with homework (as a tutor, not an answer machine)\n5. Have AI draft a complaint letter to a company\n6. Use AI to compare products before buying\n7. Ask AI to create a workout routine for your fitness level\n8. Have AI summarize a long article you don't have time to read\n9. Use AI to write a heartfelt birthday message\n10. Ask AI to help you understand your electricity bill" },
    ],
    tutorIntro: "I'm your everyday AI tutor 🏠\n\nAsk me how AI can help with literally anything in your daily life – cooking, travel, health, parenting, shopping, you name it.",
    questions: ["Plan a week of meals for my family", "Help me understand a medical term", "Write a complaint letter for me", "What AI apps should I have on my phone?"],
  },
};

const WORKFLOWS = [
  {
    id: "email", icon: "✉️", name: "AI Email Writer", desc: "Compose professional emails step-by-step", tag: "Popular",
    steps: [
      { q: "What kind of email?", opts: ["Professional / Work", "Friendly / Personal", "Complaint / Request", "Thank You / Follow-up"] },
      { q: "Who's the audience?", opts: ["My boss", "A client / customer", "A coworker", "A company / support team"] },
      { q: "What tone?", opts: ["Formal & polished", "Warm & friendly", "Direct & concise", "Apologetic & careful"] },
      { q: "What's it about?", free: true, ph: "e.g. Requesting time off next Friday..." },
    ],
    systemPrompt: "You are an expert email writer. Write a professional email based on the user's specifications. Keep it concise and natural-sounding. Never use placeholder text – write as if you know the details. Output ONLY the email with Subject line, then body.",
  },
  {
    id: "prompt", icon: "💬", name: "Prompt Builder", desc: "Build perfect AI prompts step-by-step", tag: "Essential",
    steps: [
      { q: "What do you need AI help with?", opts: ["Writing something", "Analyzing information", "Creative ideas", "Solving a problem"] },
      { q: "How detailed should the output be?", opts: ["Quick & short", "Medium detail", "Very thorough", "Step-by-step guide"] },
      { q: "Any specific format?", opts: ["Bullet points", "Paragraphs", "Table / comparison", "Conversation style"] },
      { q: "Describe your task:", free: true, ph: "e.g. Help me plan a marketing campaign for..." },
    ],
    systemPrompt: "You are an AI prompt engineering expert helping beginners. Based on the user's answers, generate a well-crafted prompt they can copy and use with any AI tool. Explain WHY each part of the prompt works. Format: first show the prompt in a clear block, then briefly explain the technique.",
  },
  {
    id: "summarize", icon: "📋", name: "Document Summarizer", desc: "Turn long text into key points", tag: "Free",
    steps: [
      { q: "What type of content?", opts: ["Article / Blog post", "Report / Whitepaper", "Email chain / Thread", "Legal / Contract terms"] },
      { q: "What do you need?", opts: ["Key takeaways (3-5 points)", "Action items only", "Simplified explanation", "Pros and cons breakdown"] },
      { q: "Paste or describe the content:", free: true, ph: "Paste the text you want summarized, or describe what it's about..." },
    ],
    systemPrompt: "You are an expert document summarizer. Create a clear, concise summary based on the user's preference. Use simple language a non-expert can understand. Be specific and actionable.",
  },
  {
    id: "image", icon: "🎨", name: "Image Prompt Crafter", desc: "Create perfect AI image descriptions", tag: "New",
    steps: [
      { q: "What do you want to create?", opts: ["Photo-realistic image", "Illustration / Art", "Logo / Brand graphic", "Social media visual"] },
      { q: "Describe the subject:", free: true, ph: "e.g. A cozy coffee shop in autumn..." },
      { q: "What style or mood?", opts: ["Warm & inviting", "Bold & dramatic", "Clean & minimal", "Vintage / Retro"] },
    ],
    systemPrompt: "You are an AI image prompt expert. Based on the user's inputs, generate 3 detailed image prompts they can use with Midjourney, DALL-E, or similar tools. Each prompt should be specific with style, lighting, mood, and composition details. Also briefly explain what makes each prompt effective.",
  },
  {
    id: "finder", icon: "🔍", name: "AI Tool Finder", desc: "Find the right AI tool for any task", tag: "Free",
    steps: [
      { q: "What area?", opts: ["Writing & Content", "Images & Design", "Data & Spreadsheets", "Productivity / Automation"] },
      { q: "Your budget?", opts: ["Free only", "Under $20/month", "Under $50/month", "Price doesn't matter"] },
      { q: "Experience level?", opts: ["Total beginner", "Some experience", "Comfortable with tech"] },
    ],
    systemPrompt: "You are an AI tool recommendation expert. Recommend 3-5 specific AI tools based on the user's needs, budget, and experience level. For each tool: name, what it does, pricing, and a 1-sentence why-it's-good-for-you. Prioritize tools that are genuinely beginner-friendly.",
  },
];

const DEMO_RESPONSES = {
  "Can you give me a real-life example?": "Sure! When you use Google Maps and it predicts traffic, that's AI in action. It learned from millions of trips that \"highway 101 at 5pm on Friday = slow.\" It doesn't understand traffic – it recognized the pattern from massive amounts of past data.\n\nSame idea powers Netflix recommendations (\"people who watched X also liked Y\"), spam filters in your email, and even the autocorrect on your phone. You've been using AI for years without knowing it!",
  "What's the difference between AI and a regular app?": "A regular app follows exact rules a programmer wrote: \"if user taps X, show Y.\" It never changes or adapts.\n\nAI is different – it learns from examples and can handle situations nobody specifically programmed it for. A calculator app can only add numbers you type in. An AI can read your question in everyday language – even with typos – and figure out what you're asking.\n\nThink of it like this: a vending machine (regular app) gives you exactly what you press. A good waiter (AI) understands \"something refreshing and not too sweet\" and makes a recommendation.",
  "Is AI going to take my job?": "Here's the honest answer: AI will change most jobs, but \"change\" usually means \"handle the boring parts.\"\n\nRadiologists still read X-rays, but AI flags the obvious ones first. Writers still write, but AI helps with first drafts. Accountants still advise clients, but AI does the data entry.\n\nThe people actually at risk are those who refuse to learn AI at all – which is exactly why you're here. You're already ahead of 90% of people just by taking this step. The goal isn't to compete with AI – it's to use AI to become better at what you already do.",
  "How does AI learn from examples?": "Think of teaching a child to recognize cats. You don't explain \"cats have triangular ears and whiskers and four legs.\" You just show them hundreds of cats and they figure out the pattern themselves.\n\nAI works the same way – but with millions of examples and math instead of a brain. You feed it millions of cat photos labeled \"cat\" and millions of non-cat photos labeled \"not cat.\" It finds patterns in the pixels that are too complex for any human to write as rules.\n\nThe same principle applies to language AI. It read billions of sentences and learned patterns like \"after 'thank you,' people usually say something polite.\" It's pattern matching at an incredible scale.",
  "default": "That's a great question! Let me break it down in simple terms.\n\nAI works by finding patterns in huge amounts of data – kind of like how you might notice that it always rains after the sky gets dark and cloudy. You didn't study meteorology; you just noticed the pattern from experience.\n\nThe key thing to remember is that AI is a tool, not magic. The better you understand how to use it (which is what you're learning here!), the more useful it becomes.\n\nWant me to explain any specific part in more detail?",
};

// ─── CSS ───
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { background: #080812; overflow: hidden; }
  ::-webkit-scrollbar { width: 0; height: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.4s ease both; }
  .fade-in { animation: fadeIn 0.3s ease both; }
  .stagger-1 { animation-delay: 0.05s; }
  .stagger-2 { animation-delay: 0.1s; }
  .stagger-3 { animation-delay: 0.15s; }
  .stagger-4 { animation-delay: 0.2s; }
  .stagger-5 { animation-delay: 0.25s; }
`;

// ─── COMPONENTS ───

const ClaudeBadge = ({ small }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    background: T.claudeBg, border: `1px solid ${T.claudeBorder}`,
    borderRadius: 6, padding: small ? "1px 6px" : "3px 8px",
    fontSize: small ? 9 : 10, fontWeight: 600, color: T.claude, fontFamily: T.font,
    letterSpacing: 0.3, whiteSpace: "nowrap",
  }}>
    <svg width={small ? 9 : 11} height={small ? 9 : 11} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={T.claude} />
    </svg>
    Claude
  </span>
);

const Dots = () => {
  const [f, setF] = useState(0);
  useEffect(() => { const i = setInterval(() => setF(n => (n + 1) % 4), 350); return () => clearInterval(i); }, []);
  return (
    <div style={{ display: "flex", gap: 5, padding: "10px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.claude, opacity: f > i ? 0.85 : 0.2, transition: "opacity 0.3s" }} />
      ))}
    </div>
  );
};

const Bubble = ({ from, text, typing }) => (
  <div className="fade-up" style={{ display: "flex", justifyContent: from === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
    <div style={{
      maxWidth: "85%", padding: "10px 14px",
      borderRadius: from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      background: from === "user" ? T.accentDim : T.claudeBg,
      border: `1px solid ${from === "user" ? T.borderActive : T.claudeBorder}`,
    }}>
      {from === "claude" && !typing && <div style={{ marginBottom: 5 }}><ClaudeBadge small /></div>}
      {typing ? <Dots /> : <p style={{ color: T.text, fontSize: 13, lineHeight: 1.6, fontFamily: T.font, whiteSpace: "pre-wrap", margin: 0 }}>{text}</p>}
    </div>
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style: s = {}, disabled }) => {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${T.accent}, #6d28d9)`, color: "#fff", border: "none" },
    ghost: { background: T.surface, color: T.text, border: `1px solid ${T.border}` },
    claude: { background: T.claudeBg, color: T.claude, border: `1px solid ${T.claudeBorder}` },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{
      padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
      fontFamily: T.font, cursor: disabled ? "default" : "pointer", transition: "all 0.2s",
      opacity: disabled ? 0.5 : 1, width: "100%", ...styles[variant], ...s,
    }}>{children}</button>
  );
};

const TabBar = ({ tab, setTab }) => {
  const tabs = [
    { id: "learn", icon: "📚", label: "Learn" },
    { id: "news", icon: "📰", label: "News" },
    { id: "tools", icon: "🧰", label: "Tools" },
    { id: "profile", icon: "👤", label: "You" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 70,
      background: `${T.bg}ee`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center",
      justifyContent: "space-around", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0)",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          background: "none", border: "none", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 2, cursor: "pointer", padding: "6px 20px",
          opacity: tab === t.id ? 1 : 0.35, transition: "all 0.2s",
          transform: tab === t.id ? "scale(1.05)" : "scale(1)",
        }}>
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.accent : T.textMuted, fontFamily: T.font }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

const Screen = ({ children, noPad }) => (
  <div style={{
    height: "100vh", overflowY: "auto", paddingTop: 16, paddingBottom: 86,
    paddingLeft: noPad ? 0 : 20, paddingRight: noPad ? 0 : 20,
    WebkitOverflowScrolling: "touch",
  }}>{children}</div>
);

// ─── AUTH SCREEN ───
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!email || !pass) { setErr("Please fill in both fields"); return; }
    setLoading(true); setErr("");
    const { data, error } = mode === "signup"
      ? await sb.signUp(email, pass)
      : await sb.signIn(email, pass);
    setLoading(false);
    if (error) { setErr(error.message); return; }
    if (mode === "signup") { setMode("check_email"); return; }
    if (data?.user) onAuth(data.user);
  };

  if (mode === "check_email") return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <span style={{ fontSize: 48, marginBottom: 16 }}>📬</span>
      <h2 style={{ color: T.text, fontSize: 22, fontFamily: T.fontDisplay, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>Check Your Email</h2>
      <p style={{ color: T.textMuted, fontSize: 14, fontFamily: T.font, textAlign: "center", lineHeight: 1.6 }}>
        We sent a confirmation link to <strong style={{ color: T.text }}>{email}</strong>. Click it to activate your account, then come back and sign in.
      </p>
      <div style={{ marginTop: 24, width: "100%", maxWidth: 300 }}>
        <Btn variant="ghost" onClick={() => setMode("signin")}>Back to Sign In</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <h1 className="fade-up" style={{ color: T.text, fontSize: 36, fontFamily: T.fontDisplay, fontWeight: 700, marginBottom: 4 }}>AI Fluent</h1>
      <p className="fade-up stagger-1" style={{ color: T.accent, fontSize: 14, fontFamily: T.font, fontStyle: "italic", marginBottom: 6 }}>Learn AI. Simply.</p>
      <div className="fade-up stagger-2" style={{ marginBottom: 32 }}><ClaudeBadge /></div>

      <div style={{ width: "100%", maxWidth: 340 }}>
        <div className="fade-up stagger-3" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["signin", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              border: `1px solid ${mode === m ? T.borderActive : T.border}`,
              background: mode === m ? T.accentDim : T.surface,
              color: mode === m ? T.text : T.textMuted,
              fontSize: 13, fontWeight: 600, fontFamily: T.font, cursor: "pointer",
            }}>{m === "signin" ? "Sign In" : "Sign Up"}</button>
          ))}
        </div>

        <div className="fade-up stagger-4" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
            style={{ width: "100%", background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: "12px 14px", color: T.text, fontSize: 14, fontFamily: T.font, outline: "none" }} />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: "12px 14px", color: T.text, fontSize: 14, fontFamily: T.font, outline: "none" }} />
        </div>

        {err && <p className="fade-in" style={{ color: T.red, fontSize: 12, fontFamily: T.font, marginBottom: 12, textAlign: "center" }}>{err}</p>}

        <Btn onClick={handleSubmit} disabled={loading}>
          {loading ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
        </Btn>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <p style={{ color: T.textDim, fontSize: 11, fontFamily: T.font }}>
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(""); }}
              style={{ background: "none", border: "none", color: T.accent, fontSize: 11, fontFamily: T.font, cursor: "pointer", marginLeft: 4 }}>
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
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
    { q: "What brings you to AI Fluent?", opts: ["Business Owner", "Student", "Working Professional", "Curious Learner", "Creative / Artist", "Retiree"], key: "role" },
    { q: "How much do you know about AI?", opts: ["Brand new to AI", "I've tried ChatGPT", "I use AI sometimes", "I want to go deeper"], key: "exp" },
    { q: "What do you want to do with AI?", opts: ["Write better & faster", "Create images & content", "Boost my business", "Stay informed on AI news", "Automate boring tasks", "Just explore"], key: "goals", multi: true },
  ];

  const finish = async (finalAns) => {
    setBuilding(true);
    const a = finalAns || ans;
    // Save to Supabase if user is authenticated
    if (uid) {
      await sb.updateProfile(uid, {
        role: a.role,
        experience_level: a.exp,
        goals: a.goals || [],
        onboarded: true,
      });
    }
    setTimeout(() => onDone(a), 1800);
  };

  const pick = (val) => {
    const s = steps[step];
    if (s.multi) {
      const cur = ans[s.key] || [];
      setAns({ ...ans, [s.key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] });
    } else {
      const newAns = { ...ans, [s.key]: val };
      setAns(newAns);
      if (step < 2) setTimeout(() => setStep(step + 1), 250);
      else finish(newAns);
    }
  };

  if (building) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, padding: 40 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.claude, animation: "spin 0.7s linear infinite" }} />
      <p className="fade-up" style={{ color: T.text, fontSize: 17, fontFamily: T.font, fontWeight: 600, marginTop: 20 }}>Building your personalized path...</p>
      <div className="fade-up stagger-2" style={{ marginTop: 10 }}><ClaudeBadge /></div>
    </div>
  );

  const s = steps[step];
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", padding: "60px 24px 40px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 36, justifyContent: "center" }}>
        {steps.map((_, i) => <div key={i} style={{ width: i === step ? 28 : 8, height: 8, borderRadius: 4, background: i <= step ? T.accent : `${T.text}15`, transition: "all 0.3s" }} />)}
      </div>
      <ClaudeBadge />
      <h2 style={{ color: T.text, fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 700, margin: "12px 0 6px", lineHeight: 1.3 }}>{s.q}</h2>
      <p style={{ color: T.textDim, fontSize: 13, fontFamily: T.font, margin: "0 0 24px" }}>{s.multi ? "Select all that apply" : "Choose one"}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {s.opts.map((o, i) => {
          const sel = s.multi ? (ans[s.key] || []).includes(o) : ans[s.key] === o;
          return (
            <button key={o} className={`fade-up stagger-${Math.min(i + 1, 5)}`} onClick={() => pick(o)} style={{
              background: sel ? T.accentDim : T.surface, border: `1.5px solid ${sel ? T.borderActive : T.border}`,
              borderRadius: 14, padding: "14px 18px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
            }}>
              <span style={{ color: sel ? T.text : T.textMuted, fontSize: 15, fontWeight: sel ? 600 : 400, fontFamily: T.font }}>{o}</span>
            </button>
          );
        })}
      </div>
      {s.multi && (ans[s.key] || []).length > 0 && (
        <div className="fade-up" style={{ marginTop: 16 }}>
          <Btn onClick={() => finish(ans)}>Continue →</Btn>
        </div>
      )}
    </div>
  );
};

// ─── LEARN SCREEN ───
const LearnScreen = ({ progress, onOpen }) => {
  const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };
  const streak = progress.streak || 0;
  const done = Object.keys(progress.completed || {}).length;

  return (
    <Screen>
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ color: T.accent, fontSize: 13, fontFamily: T.font, fontWeight: 500 }}>{greet()} 👋</p>
          <ClaudeBadge small />
        </div>
        <h1 style={{ color: T.text, fontSize: 28, fontFamily: T.fontDisplay, fontWeight: 700, margin: "4px 0 2px" }}>Your Learning Path</h1>
        <p style={{ color: T.textDim, fontSize: 12, fontFamily: T.font }}>Your path adapts as you learn</p>
      </div>
      <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
        {[{ v: streak, l: "Day Streak", e: "🔥" }, { v: done, l: "Lessons Done", e: "✅" }].map((s, i) => (
          <div key={i} className={`fade-up stagger-${i + 1}`} style={{ flex: 1, background: T.surface, borderRadius: 14, padding: "12px 10px", textAlign: "center", border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 16 }}>{s.e}</span>
            <p style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: "2px 0 0", fontFamily: T.font }}>{s.v}</p>
            <p style={{ color: T.textDim, fontSize: 10, fontFamily: T.font }}>{s.l}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PATHS.map((p, i) => {
          const pDone = Object.keys(progress.completed || {}).filter(k => k === p.id).length;
          const pct = pDone > 0 ? Math.min(100, Math.round((pDone / p.lessons) * 100)) : 0;
          return (
            <div key={p.id} className={`fade-up stagger-${Math.min(i + 1, 5)}`} onClick={() => onOpen(p.id)}
              style={{ background: T.surface, borderRadius: 18, padding: 16, border: `1px solid ${T.border}`, cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${p.color}12 0%, transparent 70%)`, borderRadius: "50%" }} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, position: "relative" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                    <h3 style={{ color: T.text, fontSize: 15, fontWeight: 600, fontFamily: T.font, margin: 0 }}>{p.title}</h3>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: p.level === "beginner" ? T.greenBg : "rgba(251,191,36,0.1)", color: p.level === "beginner" ? T.green : T.amber, fontFamily: T.font, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {p.level === "beginner" ? "Beginner" : "Intermediate"}
                    </span>
                  </div>
                  <p style={{ color: T.textMuted, fontSize: 12, fontFamily: T.font, margin: "2px 0 10px" }}>{p.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 4, background: `${T.text}0a`, borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${p.color}, ${p.color}aa)`, borderRadius: 10, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ color: T.textDim, fontSize: 11, fontFamily: T.font }}>{pct > 0 ? `${pct}%` : `${p.lessons} lessons`}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
};

// ─── LESSON VIEW ───
const LessonView = ({ pathId, uid, onBack, onComplete }) => {
  const lesson = LESSONS[pathId] || LESSONS.basics;
  const [showTutor, setShowTutor] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [msgs, typing]);

  const ask = async (q) => {
    setMsgs(m => [...m, { from: "user", text: q }]);
    setTyping(true);
    try {
      const r = await sb.callClaude({
        feature: "tutor",
        system: `You are an AI tutor inside "AI Fluent" teaching "${lesson.title}". The user is a beginner with no tech background. Explain in simple everyday language. Use analogies. Keep responses under 200 words. Be warm and never condescending.`,
        messages: [...msgs.map(m => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })), { role: "user", content: q }],
        session_id: sessionId,
        context_type: "tutor",
        context_id: pathId,
        context_title: lesson.title,
      });
      setSessionId(r.session_id || sessionId);
      setTyping(false);
      setMsgs(m => [...m, { from: "claude", text: r.text }]);
    } catch {
      // Fall back to demo responses when Supabase Edge Function is unavailable
      setTimeout(() => {
        setTyping(false);
        setMsgs(m => [...m, { from: "claude", text: DEMO_RESPONSES[q] || DEMO_RESPONSES.default }]);
      }, 1200 + Math.random() * 800);
    }
  };

  const send = () => { if (inputVal.trim()) { ask(inputVal.trim()); setInputVal(""); } };

  if (showTutor) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => setShowTutor(false)} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>← Lesson</button>
        <div style={{ flex: 1, textAlign: "center" }}><span style={{ color: T.text, fontSize: 14, fontWeight: 600, fontFamily: T.font }}>AI Tutor</span></div>
        <ClaudeBadge small />
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, WebkitOverflowScrolling: "touch" }}>
        <Bubble from="claude" text={lesson.tutorIntro} />
        {msgs.map((m, i) => <Bubble key={i} from={m.from} text={m.text} />)}
        {typing && <Bubble from="claude" typing />}
        {msgs.length === 0 && (
          <div className="fade-up stagger-2" style={{ marginTop: 12 }}>
            <p style={{ color: T.textDim, fontSize: 11, fontFamily: T.font, margin: "0 0 8px" }}>Tap a question or type your own</p>
            {lesson.questions.map((q, i) => (
              <button key={i} onClick={() => ask(q)} style={{ display: "block", width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 6, cursor: "pointer", textAlign: "left" }}>
                <span style={{ color: T.textMuted, fontSize: 13, fontFamily: T.font }}>{q}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "8px 16px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything about this lesson..."
          style={{ flex: 1, background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: "10px 14px", color: T.text, fontSize: 13, fontFamily: T.font, outline: "none" }} />
        <button onClick={send} style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, #6d28d9)`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 16 }}>↑</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", overflowY: "auto", background: T.bg, padding: "16px 20px 100px", WebkitOverflowScrolling: "touch" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontFamily: T.font, padding: "4px 0", marginBottom: 12 }}>← Back</button>
      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, background: T.greenBg, color: T.green, fontWeight: 600, fontFamily: T.font, textTransform: "uppercase", letterSpacing: 0.5 }}>Lesson 1</span>
        <ClaudeBadge small />
      </div>
      <h1 className="fade-up stagger-1" style={{ color: T.text, fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 700, margin: "0 0 24px", lineHeight: 1.3 }}>{lesson.title}</h1>
      {lesson.sections.map((sec, i) => (
        <div key={i} className={`fade-up stagger-${Math.min(i + 2, 5)}`} style={{ marginBottom: 28 }}>
          <h3 style={{ color: "#ddd", fontSize: 16, fontWeight: 600, fontFamily: T.font, margin: "0 0 8px" }}>{sec.h}</h3>
          <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.75, fontFamily: T.font, whiteSpace: "pre-wrap" }}>{sec.body}</p>
        </div>
      ))}
      <button onClick={() => setShowTutor(true)} className="fade-up" style={{
        width: "100%", background: T.claudeBg, border: `1.5px solid ${T.claudeBorder}`,
        borderRadius: 16, padding: 18, cursor: "pointer", textAlign: "left", marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={T.claude} /></svg>
          <span style={{ color: T.claude, fontSize: 16, fontWeight: 700, fontFamily: T.font }}>Ask Your AI Tutor</span>
        </div>
        <p style={{ color: T.textMuted, fontSize: 12, fontFamily: T.font, margin: 0, lineHeight: 1.5 }}>Confused about anything? Chat with Claude – ask in plain language, get simple answers.</p>
      </button>
      <Btn onClick={async () => {
        if (uid) await sb.completeLesson(uid, pathId, 0);
        onComplete(pathId);
        onBack();
      }}>✓ Complete Lesson & Continue</Btn>
    </div>
  );
};

// ─── NEWS SCREEN ───
const NewsScreen = ({ uid }) => {
  const [open, setOpen] = useState(null);
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [msgs, typing]);

  const article = NEWS.find(n => n.id === open);

  const ask = async (q) => {
    setMsgs(m => [...m, { from: "user", text: q }]);
    setTyping(true);
    try {
      const r = await sb.callClaude({
        feature: "news",
        system: `You are a friendly AI news explainer inside "AI Fluent." The user is reading: "${article.title}". Summary: ${article.eli5}. Explain follow-up questions in simple everyday language. Keep answers under 150 words.`,
        messages: [...msgs.map(m => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })), { role: "user", content: q }],
        session_id: sessionId,
        context_type: "news",
        context_id: String(article.id),
        context_title: article.title,
      });
      setSessionId(r.session_id || sessionId);
      setTyping(false);
      setMsgs(m => [...m, { from: "claude", text: r.text }]);
    } catch {
      // Demo fallback
      setTimeout(() => {
        setTyping(false);
        setMsgs(m => [...m, { from: "claude", text: `Great question about "${article.title}"!\n\nIn simple terms: ${article.eli5}\n\n${article.why}\n\nWant me to break down any specific part further?` }]);
      }, 1200);
    }
  };

  const send = () => { if (inputVal.trim()) { ask(inputVal.trim()); setInputVal(""); } };

  if (chat && article) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => { setChat(false); setMsgs([]); setSessionId(null); }} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>← Story</button>
        <div style={{ flex: 1, textAlign: "center" }}><span style={{ color: T.text, fontSize: 14, fontWeight: 600, fontFamily: T.font }}>Ask About This</span></div>
        <ClaudeBadge small />
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <Bubble from="claude" text={`I've read "${article.title}" so you don't have to decode the jargon 🎉\n\nAsk me anything – I'll explain like we're having coffee.`} />
        {msgs.map((m, i) => <Bubble key={i} from={m.from} text={m.text} />)}
        {typing && <Bubble from="claude" typing />}
        {msgs.length === 0 && (
          <div className="fade-up" style={{ marginTop: 12 }}>
            <p style={{ color: T.textDim, fontSize: 11, fontFamily: T.font, margin: "0 0 8px" }}>Tap a question or type your own</p>
            {article.questions.map((q, i) => (
              <button key={i} onClick={() => ask(q)} style={{ display: "block", width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 6, cursor: "pointer", textAlign: "left" }}>
                <span style={{ color: T.textMuted, fontSize: 13, fontFamily: T.font }}>{q}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "8px 16px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about this story..."
          style={{ flex: 1, background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: "10px 14px", color: T.text, fontSize: 13, fontFamily: T.font, outline: "none" }} />
        <button onClick={send} style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, #6d28d9)`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 16 }}>↑</span>
        </button>
      </div>
    </div>
  );

  if (article) return (
    <Screen>
      <button onClick={() => setOpen(null)} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontFamily: T.font, padding: "4px 0", marginBottom: 12 }}>← Back</button>
      <span className="fade-up" style={{ fontSize: 11, color: T.accent, fontWeight: 600, fontFamily: T.font, textTransform: "uppercase", letterSpacing: 1 }}>{article.cat}</span>
      <h1 className="fade-up stagger-1" style={{ color: T.text, fontSize: 22, fontFamily: T.fontDisplay, fontWeight: 700, margin: "8px 0 20px", lineHeight: 1.3 }}>{article.title}</h1>
      <div className="fade-up stagger-2" style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <h3 style={{ color: T.green, fontSize: 14, fontWeight: 700, fontFamily: T.font, margin: 0 }}>Explain Like I'm 5</h3>
          <ClaudeBadge small />
        </div>
        <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.65, fontFamily: T.font, margin: 0 }}>{article.eli5}</p>
      </div>
      <div className="fade-up stagger-3" style={{ background: T.accentGlow, border: `1px solid ${T.borderActive}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>🎯</span>
          <h3 style={{ color: T.accent, fontSize: 14, fontWeight: 700, fontFamily: T.font, margin: 0 }}>Why It Matters To You</h3>
        </div>
        <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.65, fontFamily: T.font, margin: 0 }}>{article.why}</p>
      </div>
      <button onClick={() => setChat(true)} className="fade-up stagger-4" style={{
        width: "100%", background: T.claudeBg, border: `1.5px solid ${T.claudeBorder}`,
        borderRadius: 16, padding: 18, cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={T.claude} /></svg>
          <span style={{ color: T.claude, fontSize: 16, fontWeight: 700, fontFamily: T.font }}>Ask About This Story</span>
        </div>
        <p style={{ color: T.textMuted, fontSize: 12, fontFamily: T.font, margin: 0, lineHeight: 1.5 }}>Still have questions? Chat with Claude and get plain-language answers.</p>
      </button>
    </Screen>
  );

  return (
    <Screen>
      <div style={{ marginBottom: 16 }}>
        <p style={{ color: T.accent, fontSize: 13, fontFamily: T.font, fontWeight: 500, marginBottom: 2 }}>Daily Digest 🗞️</p>
        <h1 style={{ color: T.text, fontSize: 28, fontFamily: T.fontDisplay, fontWeight: 700, lineHeight: 1.2 }}>Today's AI News</h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {NEWS.map((n, i) => (
          <div key={n.id} className={`fade-up stagger-${Math.min(i + 1, 5)}`} onClick={() => setOpen(n.id)}
            style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", border: `1px solid ${T.border}` }}>
            <div style={{ background: n.grad, padding: "20px 18px 16px", position: "relative" }}>
              <div style={{ position: "absolute", top: 14, right: 14, fontSize: 32, opacity: 0.3 }}>{n.emoji}</div>
              <span style={{ fontSize: 10, color: n.cat === "Breaking" ? T.red : T.accent, fontWeight: 700, fontFamily: T.font, textTransform: "uppercase", letterSpacing: 1.2, background: n.cat === "Breaking" ? "rgba(244,63,94,0.15)" : T.accentDim, padding: "3px 8px", borderRadius: 6 }}>{n.cat}</span>
              <h3 style={{ color: T.text, fontSize: 16, fontWeight: 600, fontFamily: T.font, margin: "10px 0 0", lineHeight: 1.4, paddingRight: 40 }}>{n.title}</h3>
            </div>
            <div style={{ background: `${T.text}03`, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: T.textDim, fontSize: 11, fontFamily: T.font }}>{n.time} · {n.mins} min read</span>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ color: T.green, fontSize: 10, fontWeight: 600, fontFamily: T.font, background: T.greenBg, padding: "3px 8px", borderRadius: 6 }}>💡 ELI5</span>
                <span style={{ color: T.claude, fontSize: 10, fontWeight: 600, fontFamily: T.font, background: T.claudeBg, padding: "3px 8px", borderRadius: 6 }}>✦ Ask</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
};

// ─── TOOLS SCREEN ───
const ToolsScreen = ({ uid }) => {
  const [wf, setWf] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [freeText, setFreeText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => { setWf(null); setStep(0); setAnswers([]); setFreeText(""); setResult(null); };

  const DEMO_RESULTS = {
    email: `Subject: Time Off Request – Friday, March 14th\n\nDear [Manager's Name],\n\nI hope this message finds you well. I'm writing to request a day off on Friday, March 14th.\n\nI've made sure my current projects are on track and have coordinated with the team to cover any urgent matters while I'm away.\n\nPlease let me know if this date works or if you need any additional information.\n\nThank you for your consideration.\n\nBest regards,\n[Your Name]`,
    prompt: `Here's your crafted prompt:\n\n"You are an expert [topic] advisor. I need help with [task]. My audience is [who]. Please be [tone] and format your response as [format]. Keep it [length]. Avoid jargon and explain any technical terms."\n\n💡 Why this works:\n• "You are an expert" → gives the AI a clear role\n• Specifying audience → ensures the right language level\n• Format request → gets structured, usable output\n• "Avoid jargon" → keeps it accessible`,
    summarize: `📋 Key Takeaways:\n\n1. The main point of this content is [X]\n2. The most important action item is [Y]\n3. The key data/evidence shows [Z]\n\n⚡ Bottom Line:\nIn one sentence, this means [simplified conclusion].\n\n🎯 What You Should Do:\n• [Specific action 1]\n• [Specific action 2]`,
    image: `Here are 3 prompts you can use:\n\n🎨 Prompt 1 (Detailed):\n"A cozy autumn coffee shop interior, warm golden light streaming through rain-spotted windows, watercolor illustration style, soft amber and cream tones, steaming cup on a wooden table"\n\n🎨 Prompt 2 (Dramatic):\n"Dramatic overhead shot of a coffee shop in fall, cinematic lighting, rain outside, warm interior glow, photorealistic, 35mm film grain"\n\n🎨 Prompt 3 (Minimal):\n"Minimalist line drawing of a coffee cup with autumn leaves, clean white background, single continuous line, elegant and simple"\n\n💡 Tip: The more specific you are about lighting, mood, and style, the better your results.`,
    finder: `Based on your needs, here are my top recommendations:\n\n1. 🤖 Claude (claude.ai) – Best for writing, analysis, and learning. Free tier available. Perfect for beginners.\n\n2. 🎨 Canva AI – Best for creating images, social posts, and presentations. Free tier with paid upgrade ($12.99/mo).\n\n3. 📊 Google Sheets + AI – Built-in AI features for spreadsheets. Free with a Google account.\n\n4. 📝 Notion AI – Best for organizing notes and documents with AI assistance. Free tier available.\n\n5. 🎙️ Otter.ai – Best for meeting notes and transcription. Free tier with 300 min/month.`,
  };

  const doGenerate = async (allAnswers) => {
    setGenerating(true);
    const prompt = wf.steps.map((s, i) => `${s.q}: ${allAnswers[i]}`).join("\n");
    try {
      const r = await sb.callClaude({
        feature: "tool",
        system: wf.systemPrompt + "\n\nYou are part of AI Fluent. Keep output practical and ready to use. The user is a non-technical beginner.",
        messages: [{ role: "user", content: prompt }],
        context_type: "tool",
        context_id: wf.id,
        context_title: wf.name,
      });
      setResult(r.text);
    } catch {
      // Demo fallback
      setTimeout(() => {
        setResult(DEMO_RESULTS[wf.id] || DEMO_RESULTS.prompt);
        setGenerating(false);
      }, 1500);
      return;
    }
    setGenerating(false);
  };

  const pick = (val) => {
    const na = [...answers, val];
    setAnswers(na);
    if (step < wf.steps.length - 1) setTimeout(() => setStep(step + 1), 200);
    else doGenerate(na);
  };

  if (result) return (
    <Screen>
      <button onClick={reset} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontFamily: T.font, padding: "4px 0", marginBottom: 12 }}>← Tools</button>
      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>✨</span>
        <h2 style={{ color: T.text, fontSize: 18, fontWeight: 600, fontFamily: T.font, margin: 0 }}>Your Result</h2>
      </div>
      <div className="fade-up stagger-1" style={{ background: T.claudeBg, border: `1px solid ${T.claudeBorder}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
        <ClaudeBadge />
        <p style={{ color: T.text, fontSize: 13, lineHeight: 1.7, fontFamily: T.font, marginTop: 10, whiteSpace: "pre-wrap" }}>{result}</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><Btn variant="ghost" onClick={() => { navigator.clipboard?.writeText(result); }}>📋 Copy</Btn></div>
        <div style={{ flex: 1 }}><Btn variant="ghost" onClick={reset}>🔄 Start Over</Btn></div>
      </div>
    </Screen>
  );

  if (generating) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, padding: 40 }}>
      <div style={{ width: 50, height: 50, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.claude, animation: "spin 0.7s linear infinite" }} />
      <p className="fade-up" style={{ color: T.text, fontSize: 15, fontFamily: T.font, fontWeight: 600, marginTop: 16 }}>Claude is crafting your result...</p>
      <div className="fade-up stagger-1" style={{ marginTop: 8 }}><ClaudeBadge /></div>
    </div>
  );

  if (wf) {
    const s = wf.steps[step];
    return (
      <Screen>
        <button onClick={reset} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontFamily: T.font, padding: "4px 0", marginBottom: 8 }}>← Back</button>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {wf.steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? T.accent : `${T.text}10`, transition: "all 0.3s" }} />)}
        </div>
        <p style={{ color: T.textDim, fontSize: 11, fontFamily: T.font, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Step {step + 1} of {wf.steps.length}</p>
        <h2 className="fade-up" style={{ color: T.text, fontSize: 22, fontFamily: T.fontDisplay, fontWeight: 700, margin: "0 0 20px" }}>{s.q}</h2>
        {s.free ? (
          <div className="fade-up stagger-1">
            <textarea value={freeText} onChange={e => setFreeText(e.target.value)} placeholder={s.ph}
              style={{ width: "100%", minHeight: 100, background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: 14, color: T.text, fontSize: 14, fontFamily: T.font, outline: "none", resize: "vertical" }} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={() => pick(freeText || s.ph.replace("e.g. ", ""))} disabled={!freeText.trim()}>
                {step < wf.steps.length - 1 ? "Next →" : "Generate with Claude ✨"}
              </Btn>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.opts.map((o, i) => (
              <button key={o} className={`fade-up stagger-${Math.min(i + 1, 5)}`} onClick={() => pick(o)} style={{
                background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "14px 18px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              }}>
                <span style={{ color: T.textMuted, fontSize: 14, fontFamily: T.font }}>{o}</span>
              </button>
            ))}
          </div>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h1 style={{ color: T.text, fontSize: 28, fontFamily: T.fontDisplay, fontWeight: 700, margin: 0 }}>AI Tools 🧰</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ color: T.textMuted, fontSize: 13, fontFamily: T.font }}>Step-by-step guided workflows</p>
          <ClaudeBadge small />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {WORKFLOWS.map((w, i) => (
          <div key={w.id} className={`fade-up stagger-${Math.min(i + 1, 5)}`}
            onClick={() => { setWf(w); setStep(0); setAnswers([]); setFreeText(""); setResult(null); }}
            style={{ background: T.surface, borderRadius: 16, padding: 16, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{w.icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: T.text, fontSize: 14, fontWeight: 600, fontFamily: T.font, margin: 0 }}>{w.name}</h3>
              <p style={{ color: T.textMuted, fontSize: 12, fontFamily: T.font, margin: "2px 0 0" }}>{w.desc}</p>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, fontFamily: T.font, padding: "4px 10px", borderRadius: 8,
              background: w.tag === "Popular" || w.tag === "Essential" ? "rgba(244,63,94,0.1)" : w.tag === "New" ? T.greenBg : T.accentDim,
              color: w.tag === "Popular" || w.tag === "Essential" ? T.red : w.tag === "New" ? T.green : T.accent,
            }}>{w.tag}</span>
          </div>
        ))}
      </div>
    </Screen>
  );
};

// ─── PROFILE SCREEN ───
const ProfileScreen = ({ progress, lang, setLang, apiKey, setApiKey, uid, profile, onSignOut }) => {
  const [showLang, setShowLang] = useState(false);
  const [showApi, setShowApi] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const streak = profile?.current_streak ?? (progress.streak || 0);
  const done = Object.keys(progress.completed || {}).length;

  if (showApi) return (
    <Screen>
      <button onClick={() => setShowApi(false)} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontFamily: T.font, padding: "4px 0", marginBottom: 12 }}>← Back</button>
      <h1 style={{ color: T.text, fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 700, margin: "0 0 8px" }}>Claude API Key</h1>
      <p style={{ color: T.textMuted, fontSize: 13, fontFamily: T.font, marginBottom: 20, lineHeight: 1.6 }}>
        Add your Anthropic API key to enable live Claude responses. Without a key, the app runs in demo mode with pre-written responses.
      </p>
      <p style={{ color: T.textDim, fontSize: 12, fontFamily: T.font, marginBottom: 12 }}>
        Get a key at platform.anthropic.com → Your key stays on your device only.
      </p>
      <input value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="sk-ant-..."
        style={{ width: "100%", background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: "12px 14px", color: T.text, fontSize: 14, fontFamily: T.font, outline: "none", marginBottom: 12 }} />
      <Btn onClick={() => { setApiKey(tempKey); setShowApi(false); }}>Save Key</Btn>
      {apiKey && <div style={{ marginTop: 12 }}><Btn variant="ghost" onClick={() => { setApiKey(""); setTempKey(""); }}>Remove Key</Btn></div>}
    </Screen>
  );

  if (showLang) return (
    <Screen>
      <button onClick={() => setShowLang(false)} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontFamily: T.font, padding: "4px 0", marginBottom: 12 }}>← Back</button>
      <h1 style={{ color: T.text, fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 700, margin: "0 0 20px" }}>Select Language 🌐</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(LANGS).map(([code, { name, flag }]) => (
          <button key={code} onClick={() => { setLang(code); setShowLang(false); }} style={{
            background: lang === code ? T.accentDim : T.surface, border: `1px solid ${lang === code ? T.borderActive : T.border}`,
            borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 28 }}>{flag}</span>
            <span style={{ color: T.text, fontSize: 15, fontWeight: 600, fontFamily: T.font }}>{name}</span>
            {lang === code && <span style={{ marginLeft: "auto", color: T.accent, fontSize: 18 }}>✓</span>}
          </button>
        ))}
      </div>
    </Screen>
  );

  return (
    <Screen>
      <h1 style={{ color: T.text, fontSize: 28, fontFamily: T.fontDisplay, fontWeight: 700, marginBottom: 20 }}>Settings ⚙️</h1>
      <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, #6d28d9)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, marginBottom: 10 }}>
          {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: 80, height: 80, borderRadius: "50%" }} alt="" /> : "👤"}
        </div>
        <p style={{ color: T.text, fontSize: 18, fontWeight: 600, fontFamily: T.font }}>{profile?.display_name || "AI Explorer"}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ color: T.accent, fontSize: 12, fontFamily: T.font }}>Level {Math.max(1, Math.floor(done / 2) + 1)} · {profile?.subscription_tier === "pro" ? "Pro" : "Free"}</span>
          <ClaudeBadge small />
        </div>
      </div>
      <div className="fade-up stagger-1" style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        {[{ v: streak, l: "Streak", e: "🔥" }, { v: done, l: "Lessons", e: "📖" }].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", background: T.surface, borderRadius: 14, padding: "12px 14px", border: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 14, margin: 0 }}>{s.e}</p>
            <p style={{ color: T.text, fontSize: 22, fontWeight: 700, fontFamily: T.font, margin: "4px 0 0" }}>{s.v}</p>
            <p style={{ color: T.textDim, fontSize: 10, fontFamily: T.font }}>{s.l}</p>
          </div>
        ))}
      </div>
      <div className="fade-up stagger-2" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "🌐", label: "Language", sub: `${LANGS[lang]?.flag} ${LANGS[lang]?.name}`, onClick: () => setShowLang(true) },
          { icon: "🔑", label: "Claude API Key", sub: apiKey ? "Connected ✓" : "Demo mode – tap to connect", onClick: () => setShowApi(true) },
        ].map((item, i) => (
          <button key={i} onClick={item.onClick} style={{
            width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: T.text, fontSize: 14, fontWeight: 600, fontFamily: T.font, margin: 0 }}>{item.label}</p>
              <p style={{ color: item.sub.includes("✓") ? T.green : T.textMuted, fontSize: 12, fontFamily: T.font, margin: "2px 0 0" }}>{item.sub}</p>
            </div>
            <span style={{ color: T.textDim, fontSize: 16 }}>›</span>
          </button>
        ))}
      </div>
      {onSignOut && (
        <div className="fade-up stagger-3" style={{ marginTop: 20 }}>
          <Btn variant="ghost" onClick={onSignOut}>Sign Out</Btn>
        </div>
      )}
      <div className="fade-up stagger-4" style={{ marginTop: 20, textAlign: "center" }}>
        <p style={{ color: T.textDim, fontSize: 11, fontFamily: T.font }}>AI Fluent v1.0 · Powered by Claude</p>
      </div>
    </Screen>
  );
};

// ─── MAIN APP ───
export default function AIFluent() {
  const [tab, setTab] = useState("learn");
  const [lang, setLang] = useState("en");
  const [apiKey, setApiKey] = useState("");
  const [onboarded, setOnboarded] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState({ streak: 0, completed: {}, lastVisit: null });

  // Supabase auth state
  const [sbReady, setSbReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sbProgress, setSbProgress] = useState([]);

  // Inject Supabase SDK via CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    script.onload = () => { window.__supabase = window.supabase; setSbReady(true); };
    script.onerror = () => setAuthLoading(false); // SDK failed — run in demo mode
    document.head.appendChild(script);
  }, []);

  // Once SDK is ready, check for an existing session
  useEffect(() => {
    if (!sbReady) return;
    const init = async () => {
      const session = await sb.getSession();
      if (session?.user) {
        setUser(session.user);
        const p = await sb.getProfile(session.user.id);
        setProfile(p);
        const prog = await sb.getProgress(session.user.id);
        setSbProgress(prog);
        if (p?.onboarded) setOnboarded(true);
      }
      setAuthLoading(false);
    };
    init();

    const { data } = sb.onAuthChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        const p = await sb.getProfile(session.user.id);
        setProfile(p);
        const prog = await sb.getProgress(session.user.id);
        setSbProgress(prog);
        if (p?.onboarded) setOnboarded(true);
        setAuthLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null); setProfile(null); setSbProgress([]);
        setOnboarded(false);
        setAuthLoading(false);
      }
    });
    return () => data?.subscription?.unsubscribe();
  }, [sbReady]);

  // Load local storage preferences on mount
  useEffect(() => {
    try {
      const p = localStorage.getItem("ai-fluent-progress");
      if (p) setProgress(JSON.parse(p));
      if (localStorage.getItem("ai-fluent-onboarded") === "true") setOnboarded(true);
      const k = localStorage.getItem("ai-fluent-apikey");
      if (k) setApiKey(k);
      const l = localStorage.getItem("ai-fluent-lang");
      if (l) setLang(l);
    } catch {}
  }, []);

  const save = (key, val) => {
    try { localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val)); } catch {}
  };

  const handleComplete = (pathId) => {
    const today = new Date().toDateString();
    const newProgress = {
      ...progress,
      completed: { ...progress.completed, [pathId]: true },
      streak: progress.lastVisit === today ? progress.streak : (progress.streak || 0) + 1,
      lastVisit: today,
    };
    setProgress(newProgress);
    save("ai-fluent-progress", newProgress);
  };

  const handleOnboard = () => {
    setOnboarded(true);
    save("ai-fluent-onboarded", "true");
    const today = new Date().toDateString();
    const newProgress = { ...progress, streak: 1, lastVisit: today };
    setProgress(newProgress);
    save("ai-fluent-progress", newProgress);
  };

  const handleSignOut = async () => {
    await sb.signOut();
    setOnboarded(false);
    setUser(null);
    setProfile(null);
    setSbProgress([]);
    localStorage.removeItem("ai-fluent-onboarded");
  };

  const handleSetApiKey = (k) => { setApiKey(k); save("ai-fluent-apikey", k); };
  const handleSetLang = (l) => { setLang(l); save("ai-fluent-lang", l); };

  // Waiting for Supabase SDK + session check
  if (authLoading) return (
    <>
      <style>{css}</style>
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.claude, animation: "spin 0.7s linear infinite" }} />
      </div>
    </>
  );

  // Not authenticated — show sign in / sign up
  if (!user) return (
    <>
      <style>{css}</style>
      <AuthScreen onAuth={(u) => setUser(u)} />
    </>
  );

  // Authenticated but not onboarded
  if (!onboarded) return (
    <>
      <style>{css}</style>
      <Onboarding uid={user.id} onDone={handleOnboard} />
    </>
  );

  if (lesson) return (
    <>
      <style>{css}</style>
      <LessonView pathId={lesson} uid={user.id} onBack={() => setLesson(null)} onComplete={handleComplete} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ background: T.bg, minHeight: "100vh" }}>
        {tab === "learn" && <LearnScreen progress={progress} onOpen={setLesson} />}
        {tab === "news" && <NewsScreen uid={user.id} />}
        {tab === "tools" && <ToolsScreen uid={user.id} />}
        {tab === "profile" && (
          <ProfileScreen
            progress={progress}
            lang={lang} setLang={handleSetLang}
            apiKey={apiKey} setApiKey={handleSetApiKey}
            uid={user.id} profile={profile}
            onSignOut={handleSignOut}
          />
        )}
        <TabBar tab={tab} setTab={setTab} />
      </div>
    </>
  );
}
