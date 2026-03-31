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

// WORLD MAP — Premium mountain climbing experience
const WorldMap = ({profile,progress,onOpenLoc,onOpenNews,onOpenTools,onOpenProfile,onOpenChallenge,onOpenAchievements}) => {
  const level=Math.max(1,Math.floor(progress.length/2)+1);const done=[...new Set(progress.map(p=>p.path_id))];
  const status=(loc)=>{if(loc.id==="master")return done.length>=6?"current":"locked";const idx=LOCS.findIndex(l=>l.id===loc.id);if(done.includes(loc.id))return"done";if(idx===0)return"current";const prev=LOCS[idx-1];if(prev&&done.includes(prev.id))return"current";return"locked"};
  const pct=Math.round((done.length/6)*100);
  const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"};
  const streak=profile?.current_streak||0;
  const name=profile?.display_name?.split(" ")[0]||"Climber";

  // Node positions on the mountain (x%, y% of viewport)
  const nodes=[
    {loc:LOCS[0],nx:22,ny:86},{loc:LOCS[1],nx:42,ny:72},{loc:LOCS[2],nx:68,ny:78},
    {loc:LOCS[3],nx:78,ny:58},{loc:LOCS[4],nx:55,ny:42},{loc:LOCS[5],nx:32,ny:50},
    {loc:LOCS[6],nx:50,ny:16},
  ];

  return(<div style={{height:"100vh",position:"relative",overflow:"hidden",background:"linear-gradient(180deg, #060D1A 0%, #0B1A2E 15%, #132D4A 35%, #1A4060 50%, #1E5040 70%, #2A6A48 85%, #1E4A35 100%)"}}>
    {/* Stars - only in top half */}
    <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",overflow:"hidden",pointerEvents:"none"}}>
      {Array.from({length:60},(_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:Math.random()>.85?2.5:1.5,height:Math.random()>.85?2.5:1.5,background:"#fff",borderRadius:"50%",opacity:.08+Math.random()*.25,animation:`twinkle ${3+Math.random()*5}s ease-in-out infinite`,animationDelay:`${Math.random()*4}s`}}/>)}
    </div>

    {/* Moon */}
    <div style={{position:"absolute",top:"8%",right:"12%",width:40,height:40,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%, #F0E8D8 0%, #D8D0C0 50%, #B8B0A0 100%)",opacity:.2,zIndex:1}}/>

    {/* Mountain layers - parallax depth */}
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" style={{position:"absolute",top:"25%",left:0,width:"100%",height:"45%",zIndex:1}}>
      {/* Far mountains */}
      <path d="M-20 300 L60 100 L100 160 L160 40 L220 130 L280 20 L340 110 L420 300 Z" fill="#0F2030" opacity=".6"/>
      {/* Snow caps on far mountains */}
      <path d="M145 65 L160 40 L175 65 Z" fill="#C0D0E0" opacity=".12"/>
      <path d="M265 48 L280 20 L295 48 Z" fill="#C0D0E0" opacity=".15"/>
      {/* Mid mountains */}
      <path d="M-20 300 L40 150 L90 200 L150 80 L200 170 L260 60 L310 160 L380 120 L420 300 Z" fill="#142838" opacity=".5"/>
      {/* Snow on mid */}
      <path d="M140 105 L150 80 L160 105 Z" fill="#D0DCE8" opacity=".1"/>
      <path d="M250 85 L260 60 L270 85 Z" fill="#D0DCE8" opacity=".12"/>
    </svg>

    {/* Atmospheric fog bands */}
    <div style={{position:"absolute",top:"38%",left:0,right:0,height:80,background:"linear-gradient(180deg, transparent 0%, rgba(180,210,230,.04) 40%, rgba(180,210,230,.06) 50%, rgba(180,210,230,.04) 60%, transparent 100%)",zIndex:2}}/>
    <div style={{position:"absolute",top:"55%",left:0,right:0,height:50,background:"linear-gradient(180deg, transparent, rgba(150,200,180,.03), transparent)",zIndex:2}}/>

    {/* Tree silhouettes at bottom */}
    <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{position:"absolute",bottom:"8%",left:0,width:"100%",height:"12%",zIndex:2,opacity:.15}}>
      <path d="M0 80 L10 30 L20 80 M30 80 L42 20 L54 80 M70 80 L78 35 L86 80 M100 80 L115 15 L130 80 M150 80 L158 40 L166 80 M190 80 L200 25 L210 80 M230 80 L240 35 L250 80 M270 80 L285 10 L300 80 M320 80 L328 40 L336 80 M350 80 L365 20 L380 80 M390 80 L398 45 L406 80" fill="#1A3A28" stroke="none"/>
    </svg>

    {/* Top bar */}
    <div style={{position:"absolute",top:0,left:0,right:0,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20,background:"linear-gradient(180deg, rgba(6,13,26,.95) 0%, rgba(6,13,26,.7) 60%, transparent 100%)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Lumi size={32} mood={streak>=7?"excited":"happy"} level={level}/>
        <div>
          <p style={{color:"#F0E8D8",fontSize:14,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{greet()}, {name}</p>
          <p style={{color:"#7A9AB0",fontSize:11,fontFamily:C.font,margin:0}}>Altitude {level} · {pct}% to summit</p>
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(212,165,90,.1)",padding:"6px 12px",borderRadius:20,border:"1px solid rgba(212,165,90,.2)"}}><span style={{fontSize:14}}>🔥</span><span style={{color:"#F0C860",fontSize:14,fontWeight:800,fontFamily:C.font}}>{streak}</span></div>
        <button onClick={onOpenAchievements} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(58,168,160,.1)",padding:"6px 12px",borderRadius:20,border:"1px solid rgba(58,168,160,.2)",fontSize:14}}>🏆<span style={{color:"#60D8C8",fontSize:14,fontWeight:800,fontFamily:C.font}}>{ACHIEVEMENTS.filter(a=>a.condition(progress,profile)).length}</span></button>
        <button onClick={onOpenProfile} style={{width:34,height:34,borderRadius:12,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>👤</button>
      </div>
    </div>

    {/* CLIMBING TRAIL — rope connecting all nodes */}
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:4,pointerEvents:"none"}}>
      {nodes.slice(0,-1).map((n,i)=>{
        const next=nodes[i+1];const st=status(n.loc);const nst=status(next.loc);
        const completed=st==="done";
        return<line key={i} x1={n.nx} y1={n.ny} x2={next.nx} y2={next.ny}
          stroke={completed?"rgba(74,186,120,.4)":"rgba(212,165,90,.15)"}
          strokeWidth={completed?".4":".3"} strokeDasharray={completed?"none":"1.5 1"}
          strokeLinecap="round"/>;
      })}
      {/* Rope knots at each node */}
      {nodes.slice(0,-1).map((n,i)=>{
        const next=nodes[i+1];const mx=(n.nx+next.nx)/2;const my=(n.ny+next.ny)/2;
        return<circle key={`k${i}`} cx={mx} cy={my} r=".4" fill="rgba(212,165,90,.2)"/>;
      })}
    </svg>

    {/* LOCATION NODES */}
    {nodes.map(({loc,nx,ny},i)=>{
      const st=status(loc);const d=st==="done";const cur=st==="current";const lk=st==="locked";
      return(<div key={loc.id} onClick={()=>!lk&&onOpenLoc(loc.id)}
        style={{position:"absolute",left:`${nx}%`,top:`${ny}%`,transform:"translate(-50%,-50%)",zIndex:10,cursor:lk?"default":"pointer",textAlign:"center"}}>

        {/* Pulse ring for current */}
        {cur&&<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:72,height:72,borderRadius:"50%",border:"2px solid rgba(212,165,90,.2)",animation:"pulse 2.5s ease-in-out infinite"}}/>}

        {/* Node circle */}
        <div style={{
          width:d?52:cur?56:44,height:d?52:cur?56:44,borderRadius:"50%",
          background:d?"radial-gradient(circle at 40% 35%, #60E898, #3AAA68)":cur?"radial-gradient(circle at 40% 35%, #FFE8C0, #D4A55A)":"radial-gradient(circle at 40% 35%, rgba(60,80,100,.6), rgba(30,50,70,.8))",
          border:d?"3px solid rgba(74,186,120,.5)":cur?"3px solid rgba(212,165,90,.5)":"2px solid rgba(255,255,255,.06)",
          boxShadow:d?"0 0 20px rgba(74,186,120,.2)":cur?"0 0 24px rgba(212,165,90,.25)":"none",
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto",opacity:lk?.3:1,transition:"all .3s ease",
          animation:cur?"lumiFloat 3s ease-in-out infinite":"none",
        }}>
          <span style={{fontSize:d?20:cur?22:18,filter:lk?"grayscale(1)":"none"}}>{d?"✓":loc.icon}</span>
        </div>

        {/* Label with background for readability */}
        <div style={{marginTop:6,padding:"3px 10px",borderRadius:8,
          background:cur?"rgba(212,165,90,.15)":d?"rgba(74,186,120,.1)":"rgba(0,0,0,.3)",
          backdropFilter:"blur(4px)",display:"inline-block"}}>
          <p style={{color:lk?"rgba(255,255,255,.25)":cur?"#FFE8C0":d?"#A0F0C0":"#C0D0E0",fontSize:11,fontWeight:700,fontFamily:C.font,margin:0,whiteSpace:"nowrap"}}>{loc.name}</p>
        </div>
        {cur&&<p style={{color:"rgba(212,165,90,.6)",fontSize:9,fontFamily:C.font,margin:"2px 0 0"}}>Tap to explore</p>}
      </div>);
    })}

    {/* Bottom action bar */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,padding:"0 12px 12px",paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}>
      <div style={{display:"flex",gap:8,background:"rgba(6,13,26,.85)",backdropFilter:"blur(16px)",borderRadius:18,padding:8,border:"1px solid rgba(255,255,255,.06)"}}>
        <button onClick={onOpenChallenge} style={{flex:1,background:"rgba(232,128,96,.08)",border:"1px solid rgba(232,128,96,.15)",borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <span style={{fontSize:20}}>⚡</span><div><p style={{color:"#F0A878",fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>Daily Challenge</p><p style={{color:"#6A8898",fontSize:9,fontFamily:C.font,margin:0}}>Keep your streak</p></div>
        </button>
        <button onClick={onOpenNews} style={{flex:1,background:"rgba(212,165,90,.06)",border:"1px solid rgba(212,165,90,.12)",borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <span style={{fontSize:20}}>📰</span><div><p style={{color:"#E8C878",fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>AI News</p><p style={{color:"#6A8898",fontSize:9,fontFamily:C.font,margin:0}}>Live today</p></div>
        </button>
        <button onClick={onOpenTools} style={{flex:1,background:"rgba(58,168,160,.06)",border:"1px solid rgba(58,168,160,.12)",borderRadius:12,padding:"12px 10px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <span style={{fontSize:20}}>🛠️</span><div><p style={{color:"#68D8C8",fontSize:12,fontWeight:700,fontFamily:C.font,margin:0}}>AI Tools</p><p style={{color:"#6A8898",fontSize:9,fontFamily:C.font,margin:0}}>6 tools</p></div>
        </button>
      </div>
    </div>
  </div>);
};

// LOCATION VIEW + LESSON SELECTOR + TUTOR + PRACTICE MODE
// Altitude Rating helper
const getAltitude=(pct)=>{
  if(pct>=90)return{label:"Summit",icon:"🏔️",color:"#FFD700",bg:"rgba(255,215,0,.12)",border:"rgba(255,215,0,.25)",msg:"Outstanding! You've mastered this lesson."};
  if(pct>=70)return{label:"Ridge",icon:"⛰️",color:C.green,bg:"rgba(74,186,120,.1)",border:"rgba(74,186,120,.2)",msg:"Solid understanding. Great work!"};
  if(pct>=50)return{label:"Treeline",icon:"🌲",color:"#E8B84B",bg:"rgba(232,184,75,.1)",border:"rgba(232,184,75,.2)",msg:"Getting there! Consider retrying for a better rating."};
  return{label:"Base",icon:"🏕️",color:C.red,bg:"rgba(216,88,88,.1)",border:"rgba(216,88,88,.2)",msg:"You need more practice. Review the lesson and try again."};
};

const LocView = ({locId,uid,progress,onBack,onComplete}) => {
  const loc=LOCS.find(l=>l.id===locId)||LOCS[0];
  const lessons=LESSONS[locId]||[];
  const [lessonIdx,setLessonIdx]=useState(null);
  const lesson=lessonIdx!==null?lessons[lessonIdx]:null;
  const [view,setView]=useState("intro");const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);
  const [inp,setInp]=useState("");const [sid,setSid]=useState(null);const ref=useRef(null);
  const level=Math.max(1,Math.floor(progress.length/2)+1);
  const [practiceIdx,setPracticeIdx]=useState(0);const [selected,setSelected]=useState(null);const [submitted,setSubmitted]=useState(false);
  const [freeAns,setFreeAns]=useState("");const [feedback,setFeedback]=useState("");const [grading,setGrading]=useState(false);
  const [showConfetti,setShowConfetti]=useState(false);const [practiceScore,setPracticeScore]=useState(0);
  const [totalPossible,setTotalPossible]=useState(0);
  const [showResults,setShowResults]=useState(false);
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
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, a knowledgeable warm AI guide in "AI Fluent" at "${loc.name}" teaching "${lesson?.title}". Clear, simple language. Encouraging, not condescending. Everyday analogies. Under 180 words.`,messages:[...msgs.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text})),{role:"user",content:q}],session_id:sid,context_type:"tutor",context_id:locId,context_title:lesson?.title});
      setSid(r.session_id||sid);setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:r.text}]);
    }catch{setTyping(false);setMsgs(m=>[...m,{from:"lumi",text:"Connection dropped — try again."}])}};
  const send=()=>{if(inp.trim()){ask(inp.trim());setInp("")}};

  const practice=lesson?.practice||[];
  const currentP=practice[practiceIdx];

  const gradeFreeResponse=async()=>{
    setGrading(true);
    try{const r=await db.callClaude({feature:"tutor",system:`You are Lumi, grading a practice exercise. The question was: "${currentP.q}". The hint was: "${currentP.hint||""}". IMPORTANT: Start your response with exactly "SCORE: X/10" on the first line (where X is 1-10). Then grade their response: 1) Was it specific enough? 2) Did they follow the lesson's framework? Give brief encouraging feedback and one specific suggestion to improve. Keep under 120 words. Be warm and encouraging.`,messages:[{role:"user",content:freeAns}]});
      const scoreMatch=r.text.match(/SCORE:\s*(\d+)\s*\/\s*10/i);
      const numScore=scoreMatch?parseInt(scoreMatch[1]):6;
      setFeedback(r.text.replace(/SCORE:\s*\d+\s*\/\s*10\s*/i,"").trim());
      setPracticeScore(ps=>ps+numScore);
      setTotalPossible(tp=>tp+10);
    }catch{setFeedback("Great effort! The key is being specific — the more detail you give AI, the better the result.");setPracticeScore(ps=>ps+6);setTotalPossible(tp=>tp+10)}
    setGrading(false);setSubmitted(true);
  };

  const resetPractice=()=>{setPracticeIdx(0);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("");setPracticeScore(0);setTotalPossible(0);setShowConfetti(false);setShowResults(false)};
  const goToLesson=(idx)=>{setLessonIdx(idx);setView("lesson");setMsgs([]);setSid(null);resetPractice()};

  // PRACTICE MODE
  if(view==="practice"&&practice.length>0&&!showResults)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>setView("lesson")} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← Back to lesson</button>
    {showConfetti&&<Confetti/>}
    <div style={{display:"flex",gap:4,marginBottom:16}}>{practice.map((_,i)=><div key={i} style={{flex:1,height:5,borderRadius:3,background:i<practiceIdx?C.green:i===practiceIdx?C.gold:"rgba(255,255,255,.06)",transition:"all .3s"}}/>)}</div>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Lumi size={28} mood={submitted?"excited":"happy"} level={level}/><span style={{color:C.textDim,fontSize:12,fontFamily:C.font,fontWeight:600}}>Practice {practiceIdx+1} of {practice.length}</span></div>
    <h2 className="fu s1" style={{color:C.text,fontSize:20,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 16px",lineHeight:1.35}}>{currentP.q}</h2>
    {currentP.type==="multiple_choice"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {currentP.opts.map((o,i)=>{const isCorrect=i===currentP.correct;const isSelected=selected===i;const showResult=submitted;
        return<button key={i} onClick={()=>{if(!submitted)setSelected(i)}} disabled={submitted} className={`pop s${Math.min(i+1,5)}`}
          style={{background:showResult?(isCorrect?"rgba(74,186,120,.12)":isSelected?"rgba(216,88,88,.12)":"rgba(255,255,255,.03)"):(isSelected?"rgba(212,165,90,.1)":"rgba(255,255,255,.03)"),border:`1.5px solid ${showResult?(isCorrect?C.green:isSelected?C.red:C.border):(isSelected?C.gold:C.border)}`,borderRadius:14,padding:"13px 16px",textAlign:"left",width:"100%"}}>
          <span style={{color:showResult?(isCorrect?C.green:isSelected?C.red:C.textMuted):(isSelected?C.goldLight:C.textMuted),fontSize:14,fontWeight:isSelected?700:500,fontFamily:C.font}}>{showResult?(isCorrect?"✓ ":isSelected?"✗ ":""):isSelected?"● ":""}{o}</span></button>})}
      {!submitted&&selected!==null&&<div style={{marginTop:8}}><Btn onClick={()=>{setSubmitted(true);setTotalPossible(tp=>tp+10);if(selected===currentP.correct)setPracticeScore(ps=>ps+10)}}>Check Answer</Btn></div>}
      {submitted&&<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14,marginTop:10}}><p style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font,margin:"0 0 4px"}}>💡 Why?</p><p style={{color:C.textMuted,fontSize:13,lineHeight:1.6,fontFamily:C.font,margin:0}}>{currentP.explain}</p></div>}
    </div>}
    {currentP.type==="free_response"&&<div>
      {currentP.hint&&!submitted&&<div className="fu" style={{background:"rgba(212,165,90,.04)",border:`1px solid ${C.borderGold}`,borderRadius:12,padding:10,marginBottom:12}}><p style={{color:C.gold,fontSize:12,fontFamily:C.font,margin:0}}>💡 Hint: {currentP.hint}</p></div>}
      <textarea value={freeAns} onChange={e=>setFreeAns(e.target.value)} placeholder="Type your answer..." disabled={submitted} style={{width:"100%",minHeight:120,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${C.border}`,padding:14,color:C.text,fontSize:14,fontFamily:C.font,outline:"none",resize:"vertical",marginBottom:10}}/>
      {!submitted&&<Btn onClick={gradeFreeResponse} disabled={!freeAns.trim()||grading}>{grading?"Lumi is reviewing...":"Submit for Review"}</Btn>}
      {submitted&&feedback&&<div className="fu" style={{background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:14,padding:14,marginTop:10}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Lumi size={22}/><span style={{color:C.goldLight,fontSize:13,fontWeight:700,fontFamily:C.font}}>Lumi's feedback</span></div><p style={{color:C.textMuted,fontSize:13,lineHeight:1.65,fontFamily:C.font,margin:0,whiteSpace:"pre-wrap"}}>{feedback}</p></div>}
    </div>}
    {submitted&&<div style={{marginTop:14}}>
      {practiceIdx<practice.length-1?<Btn v="teal" onClick={()=>{setPracticeIdx(practiceIdx+1);setSelected(null);setSubmitted(false);setFreeAns("");setFeedback("")}}>Next Question →</Btn>
      :<Btn v="gold" onClick={()=>setShowResults(true)}>See My Results →</Btn>}
    </div>}
  </div>);

  // RESULTS SCREEN
  if(view==="practice"&&showResults){
    const pct=totalPossible>0?Math.round((practiceScore/totalPossible)*100):0;
    const alt=getAltitude(pct);
    const passed=pct>=50;
    return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      {passed&&<Confetti/>}
      <div className="fu" style={{textAlign:"center",maxWidth:340}}>
        {/* Altitude badge */}
        <div style={{width:100,height:100,borderRadius:"50%",background:alt.bg,border:`3px solid ${alt.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:48}}>{alt.icon}</div>
        <p style={{color:alt.color,fontSize:14,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:2,margin:"0 0 4px"}}>{alt.label} Rating</p>
        <p style={{color:C.text,fontSize:48,fontWeight:800,fontFamily:C.fontDisplay,margin:"0 0 8px"}}>{pct}%</p>
        <p style={{color:C.textMuted,fontSize:14,fontFamily:C.font,lineHeight:1.6,margin:"0 0 24px"}}>{alt.msg}</p>

        {/* Score breakdown */}
        <div style={{background:"rgba(255,255,255,.03)",borderRadius:14,padding:16,marginBottom:20,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{color:C.textDim,fontSize:13,fontFamily:C.font}}>Points earned</span>
            <span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:C.font}}>{practiceScore}/{totalPossible}</span>
          </div>
          <div style={{height:8,background:"rgba(255,255,255,.06)",borderRadius:4,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${alt.color},${alt.color}88)`,borderRadius:4,transition:"width .8s ease"}}/>
          </div>
        </div>

        {passed?<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <Btn v="green" onClick={async()=>{saveScore(locId,lessonIdx,pct);await db.completeLesson(uid,locId,lessonIdx);onComplete();setView("intro");setLessonIdx(null);resetPractice()}}>
            {pct>=90?"🏔️ Claim Summit Rating!":pct>=70?"⛰️ Claim Ridge Rating!":"🌲 Complete Lesson"}
          </Btn>
          {pct<90&&<Btn v="ghost" onClick={()=>{resetPractice();setView("practice")}}>Retry for a higher rating →</Btn>}
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <Btn v="gold" onClick={()=>{resetPractice();setView("practice")}}>🏕️ Try Again</Btn>
          <Btn v="ghost" onClick={()=>{setView("lesson");resetPractice()}}>← Review the lesson first</Btn>
        </div>}
      </div>
    </div>);
  }

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

  // LESSON CONTENT
  if(view==="lesson"&&lesson)return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.bgDark},${C.bgCard})`,padding:"14px 20px 100px"}}>
    <button onClick={()=>{setView("intro");setLessonIdx(null)}} style={{background:"none",border:"none",color:C.gold,fontSize:14,fontFamily:C.font,fontWeight:700,marginBottom:14}}>← {loc.name}</button>
    <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:18}}>{loc.icon}</span><span style={{color:loc.color,fontSize:10,fontWeight:700,fontFamily:C.font,textTransform:"uppercase",letterSpacing:1}}>{loc.sub} · Lesson {lessonIdx+1}</span></div>
    <h1 className="fu s1" style={{color:C.text,fontSize:24,fontFamily:C.fontDisplay,fontWeight:700,margin:"0 0 22px",lineHeight:1.3}}>{lesson.title}</h1>
    {lesson.sections.map((sec,i)=>(<div key={i} className={`fu s${Math.min(i+2,5)}`} style={{marginBottom:26}}><h3 style={{color:C.text,fontSize:16,fontWeight:700,fontFamily:C.font,margin:"0 0 8px"}}>{sec.h}</h3><p style={{color:C.textMuted,fontSize:14,lineHeight:1.8,fontFamily:C.font,whiteSpace:"pre-wrap"}}>{sec.body}</p></div>))}
    <button onClick={()=>setView("tutor")} className="fu" style={{width:"100%",background:"rgba(212,165,90,.06)",border:`1px solid ${C.borderGold}`,borderRadius:16,padding:16,textAlign:"left",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><Lumi size={32} mood="happy" level={level} animate/><div><p style={{color:C.goldLight,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>Questions? Ask Lumi</p><p style={{color:C.textDim,fontSize:12,fontFamily:C.font,margin:"2px 0 0"}}>Your guide is here to help</p></div></div>
    </button>
    {practice.length>0?<Btn v="teal" onClick={()=>{setView("practice");resetPractice()}}>Start Practice →</Btn>
    :<Btn onClick={async()=>{await db.completeLesson(uid,locId,lessonIdx);onComplete();setView("intro");setLessonIdx(null)}}>Complete lesson →</Btn>}
  </div>);

  // INTRO — LESSON SELECTOR
  return(<div style={{height:"100vh",overflowY:"auto",background:`linear-gradient(180deg,${C.skyTop},${C.skyMid} 40%,${C.bgDark})`,padding:"14px 20px 40px",position:"relative"}}>
    <Stars/>
    <button onClick={onBack} style={{background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"7px 14px",color:C.gold,fontSize:13,fontFamily:C.font,fontWeight:700,position:"relative",zIndex:10,marginBottom:16}}>← Map</button>
    <div style={{position:"relative",zIndex:5}}>
      <div className="fu" style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
        <span style={{fontSize:40}}>{loc.icon}</span>
        <div><h1 style={{color:C.text,fontSize:26,fontFamily:C.fontDisplay,fontWeight:700,margin:0}}>{loc.name}</h1><p style={{color:C.textMuted,fontSize:13,fontFamily:C.font,margin:"2px 0 0"}}>{loc.sub} · {lessons.length} lessons</p></div>
      </div>
      <p className="fu s1" style={{color:C.textDim,fontSize:13,fontFamily:C.font,marginBottom:20,lineHeight:1.6}}>{loc.desc}</p>

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
                <p style={{color:unlocked?C.text:C.textDim,fontSize:14,fontWeight:700,fontFamily:C.font,margin:0}}>{l.title}</p>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                  <span style={{color:C.textDim,fontSize:11,fontFamily:C.font}}>{l.sections.length} sections{l.practice?.length>0?` · ${l.practice.length} practice`:""}</span>
                  {done&&alt&&<span style={{color:alt.color,fontSize:10,fontWeight:700,fontFamily:C.font,background:alt.bg,padding:"1px 8px",borderRadius:8,border:`1px solid ${alt.border}`}}>{alt.icon} {alt.label} · {score}%</span>}
                  {done&&!alt&&<span style={{color:C.green,fontSize:10,fontFamily:C.font}}>✅ Done</span>}
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