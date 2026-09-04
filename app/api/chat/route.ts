import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

export const runtime = "edge";

function getGeminiApiKey(): string | undefined {
  // 1. Cloudflare Workers env (.dev.vars locally, Dashboard secrets in production)
  try {
    const cfKey = (env as unknown as { GEMINI_API_KEY?: string })?.GEMINI_API_KEY;
    if (cfKey) return cfKey;
  } catch {
    // cloudflare:workers env unavailable — fall through
  }
  // 2. Node / Vite dev fallback (process.env from .env)
  try {
    const nodeKey =
      typeof process !== "undefined" && process.env
        ? process.env.GEMINI_API_KEY
        : undefined;
    if (nodeKey) return nodeKey;
  } catch {
    // ignore
  }
  return undefined;
}

const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

async function tryWorkersAI(message: string): Promise<string | null> {
  try {
    const ai = (
      env as unknown as {
        AI?: { run(model: string, input: unknown): Promise<unknown> };
      }
    )?.AI;
    if (!ai) return null;
    const out = (await ai.run(WORKERS_AI_MODEL, {
      messages: [
        { role: "system", content: PRYSCILA_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    })) as { response?: string };
    if (out?.response && typeof out.response === "string") return out.response;
    return null;
  } catch (e) {
    console.error("Workers AI error:", e);
    return null;
  }
}

const PRYSCILA_SYSTEM_PROMPT = `
You are Pryscila-AI Bot, an interactive retro-arcade AI assistant on the official portfolio website of Pryscila Dinda Eliana.
Your job is to answer questions from visitors, recruiters, and prospective clients politely, enthusiastically, and concisely in English.

About Pryscila Dinda Eliana:
- Role: Front-End Developer & AI Automation Engineer
- Location: Tangerang, Indonesia
- Experience: 3+ years of professional experience building high-performance web applications, custom AI agent workflows, design systems, and enterprise automations.
- Primary Web Stack: JavaScript (ES6+), TypeScript, React.js, Next.js, HTML5, CSS3, Tailwind CSS, Bootstrap, DaisyUI, Lottie React.
- Low-Code & Design Tools: FlutterFlow, Webflow, Elementor, Figma, Adobe Illustrator, UI/UX Design, Interactive Wireframing & Prototyping.
- AI & Automation Stack: Agentic AI, Custom AI Agents, n8n Workflows, Make.com, Pabbly Connect, OpenAI API, Gemini API, Claude API, WhatsApp Chatbot Automation.
- Backend & Data: Node.js, Firebase, Firestore, Firebase Functions, REST API Integration, CSV Data Pipelines.
- Dev Tools: Cursor IDE, Claude Code, OpenCode, Lovable, Git, GitHub, Vercel, Cloudflare Pages.
- Professional Experience:
  1. PT Hipnoterapi Digital Indonesia (Sep 2023 - Sep 2026): Front-End Developer / UI/UX Designer / AI Automation Engineer. Architected web/mobile products, built custom AI agent automations, n8n integration pipelines, and WhatsApp chatbot systems.
  2. PT Mliki Teknologi Bersama (Sep 2023 - Sep 2026): Front-End Developer. Engineered component-driven web interfaces using React.js & Next.js, reusable design systems, and REST API state management.
  3. PT Ayoreal Finansial Teknologi (Sep 2023 - Jan 2025): Front-End Developer / Fintech Operations Specialist. Designed financial web dashboards and configured dedicated KSEI and S-INVEST workstation environments for APERD compliance.
- Education & Training:
  - Alterra Academy (2022 - 2023): Immersive Frontend Engineer Program (React, Redux, TypeScript, TDD, Gitflow, Vercel, Tailwind CSS).
  - SMK Negeri 1 Kota Tangerang (2018 - 2021): Computer Network Engineering.
- Contact Channels:
  - Email: Pryscila.dinda06@gmail.com
  - Phone / WhatsApp: +62 896-7421-4966
  - LinkedIn: linkedin.com/in/pryscila-dinda
  - GitHub: github.com/prysciladinda

Guidelines:
- Keep answers concise (2-4 paragraphs maximum).
- Use retro arcade touches like "> SYSTEM_RESPONSE", "> KNOWLEDGE_FOUND", or emojis.
- Encourage visitors to reach out via Email or WhatsApp for project inquiries or hiring.
`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Cloudflare Workers AI (production — no region block, free tier)
    const workersAiReply = await tryWorkersAI(message);
    if (workersAiReply) {
      return NextResponse.json({ reply: workersAiReply, provider: "workers-ai" });
    }

    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      // Simulated intelligent response if no AI provider is configured yet
      const fallbackResponse = generateSimulatedResponse(message);
      return NextResponse.json({
        reply: fallbackResponse,
        simulated: true,
      });
    }

    // Call Google Gemini API (gemini-2.5-flash — stable, generateContent supported)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      system_instruction: {
        parts: [{ text: PRYSCILA_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    };

    // Retry once on transient errors (e.g. 503 high demand) before falling back
    let res: Response | null = null;
    let lastError = "";
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) break;
        lastError = await res.text();
        console.error(`Gemini API Error (attempt ${attempt}):`, lastError);
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        lastError = String(e);
        console.error(`Gemini fetch failed (attempt ${attempt}):`, e);
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
      }
    }

    if (!res || !res.ok) {
      console.error("Gemini API Error:", lastError);
      const fallbackResponse = generateSimulatedResponse(message);
      return NextResponse.json({ reply: fallbackResponse, simulated: true });
    }

    const data = await res.json();
    const candidateReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      generateSimulatedResponse(message);

    return NextResponse.json({ reply: candidateReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "> ERROR: Unable to reach AI core. Please contact Pryscila directly via email at Pryscila.dinda06@gmail.com." },
      { status: 500 }
    );
  }
}

function generateSimulatedResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("skill") || q.includes("stack") || q.includes("tool") || q.includes("tech")) {
    return "> KNOWLEDGE_FOUND: Pryscila specializes in modern Front-End (React.js, Next.js, TypeScript, Tailwind CSS) and AI Automation (n8n, Make.com, OpenAI/Claude APIs, WhatsApp Chatbots).";
  }
  if (q.includes("ai") || q.includes("agent") || q.includes("automation") || q.includes("n8n")) {
    return "> KNOWLEDGE_FOUND: Pryscila builds custom autonomous AI agent workflows, n8n integration pipelines, and intelligent WhatsApp chatbots to automate business processes.";
  }
  if (q.includes("experience") || q.includes("work") || q.includes("job") || q.includes("role")) {
    return "> KNOWLEDGE_FOUND: Pryscila has 3+ years of professional experience across 3 technology companies: PT Hipnoterapi Digital Indonesia (AI & Frontend), PT Mliki Teknologi Bersama (Frontend), and PT Ayoreal Finansial Teknologi (Fintech Ops & UI).";
  }
  if (q.includes("contact") || q.includes("hire") || q.includes("email") || q.includes("whatsapp") || q.includes("phone")) {
    return "> KNOWLEDGE_FOUND: You can reach Pryscila directly via Email at Pryscila.dinda06@gmail.com, WhatsApp at +62 896-7421-4966, or LinkedIn at linkedin.com/in/pryscila-dinda.";
  }
  return `> AI_BOT_ONLINE: Thank you for your question! Pryscila is a Front-End Developer & AI Automation Engineer skilled in React/Next.js and n8n/AI Workflows. Feel free to contact her at Pryscila.dinda06@gmail.com for inquiries or collaborations!`;
}
