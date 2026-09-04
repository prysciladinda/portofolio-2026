"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Braces,
  Code2,
  Gamepad2,
  Globe2,
  Heart,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Palette,
  Phone,
  Power,
  Send,
  Sparkles,
  Terminal,
  UserRound,
  Volume2,
  VolumeX,
  Workflow,
  X,
} from "lucide-react";

type ScreenId = "home" | "about" | "skills" | "projects" | "experience" | "contact";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

function playRetroSound(type: "click" | "start" | "power" | "nav", soundEnabled: boolean) {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "click" || type === "nav") {
      osc.type = "square";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "start") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(261.63, now);
      osc.frequency.setValueAtTime(329.63, now + 0.06);
      osc.frequency.setValueAtTime(392.00, now + 0.12);
      osc.frequency.setValueAtTime(523.25, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === "power") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (e) {
    // Ignore audio context errors
  }
}

const menuItems: ReadonlyArray<readonly [string, ScreenId]> = [
  ["HOME", "home"],
  ["ABOUT", "about"],
  ["SKILLS", "skills"],
  ["PROJECTS", "projects"],
  ["EXPERIENCE", "experience"],
  ["CONTACT", "contact"],
];

const screenOrder = menuItems.map(([, screen]) => screen);

const buttonActions: Record<string, { label: string; screen?: ScreenId; direction?: -1 | 1 }> = {
  A: { label: "Next screen", direction: 1 },
  B: { label: "Previous screen", direction: -1 },
  C: { label: "Home screen", screen: "home" },
  X: { label: "Projects screen", screen: "projects" },
  Y: { label: "Skills screen", screen: "skills" },
  Z: { label: "Contact screen", screen: "contact" },
};

const workHighlights = [
  {
    number: "01",
    title: "HIGH-PERFORMANCE WEB & MOBILE UI",
    copy: "Architected and launched pixel-perfect, accessible, and responsive interfaces using React, Next.js, Webflow, and FlutterFlow with modern design systems and optimized load speeds.",
    stack: "REACT.JS / NEXT.JS / TAILWIND CSS / WEBFLOW / FLUTTERFLOW",
    type: "FRONTEND UI",
  },
  {
    number: "02",
    title: "AUTONOMOUS AI AGENTS & WORKFLOWS",
    copy: "Engineered intelligent n8n, Make, and WhatsApp chatbot automations with OpenAI & Claude integrations to automate complex business workflows and increase team productivity.",
    stack: "OPENAI / CLAUDE / N8N / MAKE.COM / PABBLY / WHATSAPP API",
    type: "AI AUTOMATION",
  },
  {
    number: "03",
    title: "FINTECH & APERD SYSTEM OPERATIONS",
    copy: "Configured secure KSEI and S-INVEST operator workstations, dedicated financial network channels, and operational troubleshooting protocols for APERD compliance.",
    stack: "KSEI / S-INVEST / NETWORK INFRASTRUCTURE / FINTECH SECURITY",
    type: "FINTECH OPS",
  },
] as const;

const realProjects = [
  {
    id: "myheal",
    company: "PT HIPNOTERAPI DIGITAL INDONESIA",
    title: "MYHEAL — HYPNOTHERAPY & PARENTING APP",
    copy: "Landing pages, admin dashboard, and mobile audio hypnotherapy app for anxiety, stress, insomnia, and modern parenting.",
    stack: "NEXT.JS / REACT / TAILWIND / FLUTTERFLOW / FIREBASE",
    type: "WEB + MOBILE APP",
    images: [
      { src: "/projects/myheal-landing-parenting.png", label: "Landing — Modern Parenting" },
      { src: "/projects/myheal-landing-biru.png", label: "Landing — Free From Anxiety" },
      { src: "/projects/myheal-dashboard.png", label: "Admin Dashboard" },
      { src: "/projects/myheal-mobile-app.png", label: "Mobile App — Audio" },
    ],
  },
  {
    id: "ayoreal",
    company: "PT AYOREAL FINANSIAL TEKNOLOGI",
    title: "AYOREAL — MUTUAL FUND & STOCK APP",
    copy: "Mutual fund landing page and mobile portfolio app for stocks, mutual funds, and bonds, with recurring savings and referral features.",
    stack: "REACT / NEXT.JS / REST API / KSEI / S-INVEST",
    type: "FINTECH",
    images: [
      { src: "/projects/ayoreal-landing.png", label: "Landing — Save & Dream" },
      { src: "/projects/ayoreal-mobile.png", label: "Mobile — Portfolio" },
    ],
  },
  {
    id: "getskillz",
    company: "GETSKILLZ / SPORT STATION",
    title: "GETSKILLZ — SPORT & COURSE APP",
    copy: "Sport station landing page and course app for sports, yoga, cooking, and art with videos, guides, and class recommendations.",
    stack: "REACT / NEXT.JS / TAILWIND / VIDEO UI",
    type: "SPORT / EDU",
    images: [
      { src: "/projects/getskillz-landing.png", label: "Landing — Sport Station" },
      { src: "/projects/getskillz-mobile.png", label: "Mobile — Course" },
    ],
  },
] as const;

const skillGroups = [
  {
    name: "FRONT-END",
    items: ["JavaScript (ES6+)", "TypeScript", "React.js", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "DaisyUI", "Lottie React"],
  },
  {
    name: "LOW-CODE & DESIGN",
    items: ["FlutterFlow", "Webflow", "Elementor", "Figma", "Adobe Illustrator", "UI/UX Design", "Wireframing", "Interactive Prototyping"],
  },
  {
    name: "BACKEND & DATA",
    items: ["Node.js", "Firebase", "Firestore", "Firebase Functions", "REST API Integration", "CSV Data Pipelines"],
  },
  {
    name: "AI & AUTOMATION",
    items: ["Agentic AI", "Custom AI Agents", "n8n Workflows", "Make.com", "Pabbly Connect", "OpenAI API", "Gemini API", "Claude API", "WhatsApp Automation"],
  },
  {
    name: "DEV TOOLS",
    items: ["Claude Code", "OpenCode", "Cursor IDE", "Lovable", "Git", "GitHub", "Vercel Deployment"],
  },
] as const;

const experiences = [
  {
    period: "SEP 2023 - SEP 2026",
    company: "PT HIPNOTERAPI DIGITAL INDONESIA",
    role: "FRONT-END DEVELOPER / UI/UX DESIGNER / AI AUTOMATION ENGINEER",
    copy: "Architected web and mobile products from Figma to production. Built custom AI agent automations, n8n integration pipelines, and WhatsApp chatbot workflows that streamlined client management and business operations.",
    status: "MULTI-ROLE LEAD",
  },
  {
    period: "SEP 2023 - SEP 2026",
    company: "PT MLIKI TEKNOLOGI BERSAMA",
    role: "FRONT-END DEVELOPER",
    copy: "Engineered scalable, component-driven web interfaces using React.js & Next.js. Developed reusable design systems, interactive prototypes, and seamless REST API state management.",
    status: "FRONTEND",
  },
  {
    period: "SEP 2023 - JAN 2025",
    company: "PT AYOREAL FINANSIAL TEKNOLOGI",
    role: "FRONT-END DEVELOPER / FINTECH OPERATIONS SPECIALIST",
    copy: "Designed intuitive financial web dashboards while configuring dedicated KSEI and S-INVEST workstation environments and high-security APERD network connectivity.",
    status: "FINTECH",
  },
] as const;

function Screw({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`screw ${className}`} />;
}

function PowerSwitch({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <button className={`power-switch ${on ? "is-on" : ""}`} onClick={toggle} aria-label={on ? "Turn arcade off" : "Turn arcade on"} type="button">
      <span className="switch-light"><Power size={13} /></span>
    </button>
  );
}

export default function HomePage() {
  const [powered, setPowered] = useState(true);
  const [started, setStarted] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");
  const [pressed, setPressed] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(766);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [githubModalTarget, setGithubModalTarget] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "> AI_CORE_ONLINE: Hello! I'm Pryscila-AI Bot. Ask me anything about Pryscila's Front-End skills, AI automation workflows, or experience!",
    },
  ]);

  const handleSendChat = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    playRetroSound("click", soundEnabled);
    const newMessages: ChatMessage[] = [...chatMessages, { sender: "user", text: textToSend }];
    setChatMessages(newMessages);
    if (!queryText) setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();
      const botReply = data?.reply || "> AI_BOT: Systems operational. Feel free to reach Pryscila via email!";
      setChatMessages([...newMessages, { sender: "bot", text: botReply }]);
      playRetroSound("start", soundEnabled);
    } catch {
      setChatMessages([
        ...newMessages,
        { sender: "bot", text: "> ERROR: Unable to reach AI core. Contact Pryscila directly at Pryscila.dinda06@gmail.com!" },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const togglePower = () => {
    playRetroSound("power", soundEnabled);
    setPowered((value) => !value);
  };

  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    playRetroSound("click", nextSound);
  };

  const selectScreen = (screen: ScreenId, soundType: "click" | "start" | "nav" = "nav") => {
    if (!powered) return;
    playRetroSound(soundType, soundEnabled);
    setStarted(true);
    setActiveScreen(screen);
  };

  const moveScreen = (direction: -1 | 1) => {
    if (!powered) return;
    playRetroSound("nav", soundEnabled);
    setStarted(true);
    setActiveScreen((screen) => {
      const currentIndex = screenOrder.indexOf(screen);
      return screenOrder[(currentIndex + direction + screenOrder.length) % screenOrder.length];
    });
  };

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Enter" && powered) {
        playRetroSound("start", soundEnabled);
        setStarted(true);
        setActiveScreen((screen) => screen === "home" ? "about" : screen);
      }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        setPressed(event.key);
        window.setTimeout(() => setPressed(null), 180);
      }
      if (event.key === "ArrowLeft" && powered) {
        event.preventDefault();
        playRetroSound("nav", soundEnabled);
        setStarted(true);
        setActiveScreen((screen) => screenOrder[(screenOrder.indexOf(screen) - 1 + screenOrder.length) % screenOrder.length]);
      }
      if (event.key === "ArrowRight" && powered) {
        event.preventDefault();
        playRetroSound("nav", soundEnabled);
        setStarted(true);
        setActiveScreen((screen) => screenOrder[(screenOrder.indexOf(screen) + 1) % screenOrder.length]);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [powered, soundEnabled]);

  useEffect(() => {
    if (!lightbox) return;
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, [lightbox]);

  const uptime = `00:${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const pressButton = (label: string) => {
    playRetroSound("click", soundEnabled);
    setPressed(label);
    window.setTimeout(() => setPressed(null), 180);
    const action = buttonActions[label];
    if (action?.screen) selectScreen(action.screen);
    if (action?.direction) moveScreen(action.direction);
  };

  return (
    <main className="portfolio-shell">
      <div className="ambient-glow" aria-hidden="true" />
      <section className="arcade-cabinet" aria-label="Interactive arcade portfolio">
        <header className="machine-header">
          <Screw className="top-left" /><Screw className="top-right" />
          <div className="brand-plate">
            <Code2 className="brand-icon" size={34} strokeWidth={2.5} />
            <div><strong>PRYSCILA DINDA</strong><span>FRONT-END / AI AUTOMATION</span></div>
          </div>
          <nav className="top-navigation" aria-label="Primary navigation">
            {menuItems.map(([label, screen]) => (
              <button type="button" onClick={() => selectScreen(screen)} key={screen} className={activeScreen === screen ? "active" : ""} aria-current={activeScreen === screen ? "page" : undefined}>
                {activeScreen === screen && <span aria-hidden="true">//</span>} {label}
              </button>
            ))}
            <button type="button" onClick={() => { playRetroSound("click", soundEnabled); setChatOpen((v) => !v); }} className={`sound-toggle ai-bot-toggle ${chatOpen ? "active" : ""}`} title="Open Pryscila-AI Bot Terminal">
              <Bot size={16} />
              <span>AI BOT</span>
            </button>
            <button type="button" onClick={toggleSound} className={`sound-toggle ${soundEnabled ? "on" : "off"}`} title={soundEnabled ? "Mute Arcade SFX" : "Unmute Arcade SFX"}>
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{soundEnabled ? "SFX: ON" : "SFX: OFF"}</span>
            </button>
            <div className="status-lights" aria-label="System online"><i /><i /><i /></div>
          </nav>
          <div className="power-module"><small>SYSTEM POWER</small><PowerSwitch on={powered} toggle={togglePower} /></div>
        </header>

        <div className="screen-housing">
          <Screw className="housing-left" /><Screw className="housing-right" />
          <section className={`crt-screen ${!powered ? "powered-off" : ""}`} aria-live="polite" aria-label={`${activeScreen} portfolio screen`} data-active-screen={activeScreen}>
            <div className="crt-reflection" aria-hidden="true" /><div className="crt-scanlines" aria-hidden="true" />
            <div className="screen-content" key={activeScreen}>
              <div className="terminal-row">
                <div><p>&gt; SYSTEM READY</p><p>&gt; {activeScreen === "home" ? (started ? "PLAYER ONE CONNECTED" : "LOADING PORTFOLIO...") : `OPENING ${activeScreen.toUpperCase()}...`}</p></div>
                <span>CV DATA / 2026</span>
              </div>

              {activeScreen === "home" && (
                <div className="screen-view home-screen">
                  <div className="hero-copy"><h1>{started ? <>PLAYER ONE<br />READY</> : <>INSERT<br />DEVELOPER</>}</h1><p>{started ? "SELECT A LEVEL_" : "TO START_"}</p></div>
                  <div className="hero-info row g-4 align-items-stretch">
                    <div className="col-lg-7">
                      <article className="player-card">
                        <div className="pixel-avatar" aria-label="Pryscila Dinda profile mark">
                          <img src="/character.jpg" alt="Female Arcade Character Developer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div className="player-copy"><h2>PRYSCILA DINDA ELIANA</h2><h3>FRONT-END DEVELOPER / AI AUTOMATION ENGINEER</h3><div className="divider" /><p>3+ years of experience building high-performance web apps, custom AI agent workflows, intuitive UI/UX, and enterprise automations.</p></div>
                      </article>
                    </div>
                    <div className="col-lg-5"><div className="feature-box"><div><Globe2 /><span>WEB</span></div><div><Bot /><span>AI</span></div><div><Palette /><span>UI/UX</span></div><div><Workflow /><span>AUTO</span></div></div></div>
                  </div>
                  <div className="screen-actions"><div className="boot-log d-none d-md-block"><p>&gt; REACT / NEXT.JS ONLINE</p><p>&gt; AI AUTOMATION ONLINE</p></div><button className="start-button" onClick={() => selectScreen("about", "start")} disabled={!powered} type="button"><span>&gt;</span> START <span>&lt;</span></button><button className="project-button" type="button" onClick={() => selectScreen("projects", "start")}>VIEW WORK <ArrowRight size={18} /></button></div>
                  <p className="keyboard-hint">PRESS ENTER TO START • USE ← → TO CHANGE SCREEN</p>
                </div>
              )}

              {activeScreen === "about" && (
                <div className="screen-view level-screen about-screen">
                  <header className="screen-heading"><span>LEVEL 01 / PLAYER PROFILE</span><h1>ABOUT PLAYER</h1><p>Results-driven Front-End Developer &amp; AI Automation Engineer with 3+ years of experience transforming complex ideas into intuitive web products and automated workflow engines.</p></header>
                  <div className="profile-layout">
                    <div className="profile-identity">
                      <div className="pixel-avatar large" fill-avatar="true">
                        <img src="/character.jpg" alt="Female Arcade Character Developer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div><small>CODENAME</small><h2>PRYSCILA DINDA ELIANA</h2><p>FRONT-END / AI AUTOMATION</p></div>
                    </div>
                    <div className="profile-stats"><div><span>LOCATION</span><strong>TANGERANG, INDONESIA</strong></div><div><span>EXPERIENCE</span><strong>3+ YEARS</strong></div><div><span>LANGUAGE</span><strong>INDONESIAN / ENGLISH</strong></div><div><span>FOCUS</span><strong>REACT / NEXT.JS / AI AGENTS</strong></div></div>
                  </div>
                  <div className="education-grid">
                    <article><span>TRAINING / 2022 - 2023</span><h2>ALTERRA ACADEMY</h2><h3>Immersive Program, Frontend Engineer</h3><p>Intensive frontend engineering track mastering React.js, Redux, TypeScript, TDD/testing, Gitflow, Vercel deployment, Tailwind CSS, and Figma prototyping.</p></article>
                    <article><span>EDUCATION / 2018 - 2021</span><h2>SMK NEGERI 1 KOTA TANGERANG</h2><h3>Computer Network Engineering</h3><p>Foundational software engineering, network administration, system security, hardware configuration, and enterprise IT troubleshooting.</p></article>
                  </div>
                  <div className="screen-footer-action"><span>&gt; PROFILE &amp; EDUCATION DATA LOADED</span><button type="button" onClick={() => selectScreen("projects")}>NEXT LEVEL <ArrowRight size={16} /></button></div>
                </div>
              )}

              {activeScreen === "projects" && (
                <div className="screen-view level-screen projects-screen">
                  <header className="screen-heading"><span>LEVEL 02 / SELECTED WORK</span><h1>FEATURED PROJECTS</h1><p>Selected work: MyHeal, AyoReal, and GetSkillz — including landing pages, dashboards, and mobile views. Click any image to view it fullscreen.</p></header>
                  <div className="screen-project-grid">{workHighlights.map((project) => <article className="screen-project-card" key={project.number}><div><span>BUILD {project.number}</span><i /></div><h2>{project.title}</h2><p>{project.copy}</p><small>{project.stack}</small><footer><span>CLASS: {project.type}</span><button type="button" onClick={() => selectScreen("experience")}>VIEW LOG <ArrowRight size={14} /></button></footer></article>)}</div>

                  <div className="real-projects">
                    {realProjects.map((proj) => (
                      <article className="real-project-card" key={proj.id}>
                        <header className="real-project-head">
                          <div><span>{proj.company}</span><h2>{proj.title}</h2><p>{proj.copy}</p></div>
                          <strong>{proj.type}</strong>
                        </header>
                        <div className="real-project-gallery">
                          {proj.images.map((img) => (
                            <figure className="real-project-shot" key={img.src}>
                              <button type="button" className="shot-frame shot-clickable" onClick={() => { playRetroSound("click", soundEnabled); setLightbox({ src: img.src, label: img.label }); }} title={`View ${img.label} fullscreen`} aria-label={`Enlarge image ${img.label}`}>
                                <img src={img.src} alt={img.label} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                                <div className="shot-placeholder"><span>{img.label}</span><small>File stored in public{img.src}</small></div>
                                <span className="shot-zoom-hint">⛶ CLICK TO ZOOM</span>
                              </button>
                              <figcaption>{img.label}</figcaption>
                            </figure>
                          ))}
                        </div>
                        <small className="real-project-stack">{proj.stack}</small>
                      </article>
                    ))}
                  </div>

                  <div className="screen-footer-action"><span>&gt; 3 PROJECTS / 8 SCREENSHOTS LOADED</span><button type="button" onClick={() => selectScreen("skills")}>NEXT LEVEL <ArrowRight size={16} /></button></div>
                </div>
              )}

              {activeScreen === "skills" && (
                <div className="screen-view level-screen skills-screen">
                  <header className="screen-heading"><span>LEVEL 03 / TECHNICAL STACK</span><h1>SKILL MATRIX</h1><p>Comprehensive tech stack encompassing modern front-end frameworks, AI agent architectures, design platforms, and developer tooling.</p></header>
                  <div className="screen-skill-grid">{skillGroups.map((group) => <article className="screen-skill" key={group.name}><header><strong>{group.name}</strong><span>ONLINE</span></header><div className="skill-chips">{group.items.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div>
                  <div className="screen-footer-action"><span>&gt; {skillGroups.length} SKILL MODULES ONLINE</span><button type="button" onClick={() => selectScreen("experience")}>MISSION LOG <ArrowRight size={16} /></button></div>
                </div>
              )}

              {activeScreen === "experience" && (
                <div className="screen-view level-screen experience-screen">
                  <header className="screen-heading"><span>LEVEL 04 / CAREER HISTORY</span><h1>EXPERIENCE LOG</h1><p>Proven track record of high-impact engineering across concurrent technology ventures, delivering client products and automated business engines.</p></header>
                  {experiences.map((experience) => <article className="screen-mission-log" key={experience.company}><span>{experience.period}</span><div><h2>{experience.company}</h2><h3>{experience.role}</h3><p>{experience.copy}</p></div><strong>{experience.status}</strong></article>)}
                  <div className="screen-footer-action"><span>&gt; 3 COMPANY RECORDS VERIFIED</span><button type="button" onClick={() => selectScreen("contact")}>CONTACT <ArrowRight size={16} /></button></div>
                </div>
              )}

              {activeScreen === "contact" && (
                <div className="screen-view level-screen contact-screen">
                  <div className="contact-icon"><Terminal size={54} /></div>
                  <header className="screen-heading"><span>LEVEL 05 / CONTACT TERMINAL</span><h1>START A<br />NEW PROJECT</h1><p>Ready to build a high-converting web app or automate your business workflows? Let's connect and create something extraordinary.</p></header>
                  <div className="contact-grid">
                    <a href="mailto:Pryscila.dinda06@gmail.com"><Mail /><span><small>EMAIL</small>Pryscila.dinda06@gmail.com</span><ArrowRight /></a>
                    <a href="tel:+6289674214966"><Phone /><span><small>PHONE</small>+62 896-7421-4966</span><ArrowRight /></a>
                    <a href="https://www.linkedin.com/in/pryscila-dinda" target="_blank" rel="noreferrer"><UserRound /><span><small>LINKEDIN</small>pryscila-dinda</span><ArrowRight /></a>
                    <button type="button" className="contact-link-btn" onClick={() => { playRetroSound("click", soundEnabled); setGithubModalTarget("https://github.com/prysciladinda"); }}><Code2 /><span><small>GITHUB</small>prysciladinda</span><ArrowRight /></button>
                  </div>
                  <div className="location-line"><MapPin size={16} /><span>TANGERANG, INDONESIA</span></div>
                  <div className="screen-footer-action"><span>&gt; ALL CONTACT CHANNELS READY_</span><button type="button" onClick={() => selectScreen("home")}>RETURN HOME <Home size={15} /></button></div>
                </div>
              )}
            </div>
            {!powered && <div className="off-message">NO SIGNAL</div>}
          </section>
        </div>

        <section className="control-deck" aria-label="Arcade controls">
          <Screw className="deck-left" /><Screw className="deck-right" />
          <div className="player-controls"><div className="player-status"><span>PLAYER 1</span><span>READY <i /></span></div><div className={`joystick ${pressed?.startsWith("Arrow") ? "is-moving" : ""}`} aria-hidden="true"><div className="stick-ball" /><div className="stick-shaft" /><div className="stick-base" /></div><div className="button-cluster" aria-label="Arcade action buttons">{["A", "B", "C", "X", "Y", "Z"].map((label) => <button key={label} type="button" onClick={() => pressButton(label)} className={pressed === label ? "pressed" : ""} aria-label={`${buttonActions[label].label}, arcade button ${label}`} title={buttonActions[label].label}><span>{label}</span></button>)}</div></div>
          <nav className="deck-navigation" aria-label="Arcade navigation"><h2>NAVIGATION</h2><div className="deck-buttons"><button type="button" className={activeScreen === "home" ? "active" : ""} onClick={() => selectScreen("home")}><Home /><span>HOME</span><small>01</small></button><button type="button" className={activeScreen === "about" ? "active" : ""} onClick={() => selectScreen("about")}><UserRound /><span>ABOUT</span><small>02</small></button><button type="button" className={activeScreen === "skills" ? "active" : ""} onClick={() => selectScreen("skills")}><Braces /><span>SKILLS</span><small>03</small></button><button type="button" className={activeScreen === "contact" ? "active" : ""} onClick={() => selectScreen("contact")}><Mail /><span>CONTACT</span><small>04</small></button></div></nav>
        </section>

        <footer className="machine-status"><div><strong>&gt; SYSTEM STATUS</strong><span>ALL SYSTEMS OPERATIONAL <i /></span><span>UPTIME: {uptime}</span></div><div><strong>&gt; ACTIVE SCREEN</strong><span>{activeScreen.toUpperCase()}</span><span>DISPLAY MODE: CRT</span></div><Gamepad2 className="footer-mark" size={48} /><div><strong>&gt; CREDITS</strong><span>DESIGNED &amp; CODED BY</span><span>PRYSCILA DINDA</span></div><Heart className="footer-heart" size={34} /></footer>
      </section>

      {githubModalTarget && (
        <div className="arcade-modal-overlay" onClick={() => setGithubModalTarget(null)}>
          <div className="arcade-modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="arcade-modal-header">
              <span>&gt; EXTERNAL WARP DETECTED</span>
              <button type="button" onClick={() => setGithubModalTarget(null)}>✕</button>
            </header>
            <div className="arcade-modal-body">
              <h2>LEAVING ARCADE ZONE</h2>
              <p>Are you sure you want to leave the arcade portfolio zone and open <strong>Pryscila Dinda&apos;s GitHub</strong> profile?</p>
              <small>&gt; TARGET URL: {githubModalTarget}</small>
            </div>
            <footer className="arcade-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => { playRetroSound("click", soundEnabled); setGithubModalTarget(null); }}
              >
                ABORT / CANCEL
              </button>
              <a
                href={githubModalTarget}
                target="_blank"
                rel="noreferrer"
                className="btn-confirm"
                onClick={() => { playRetroSound("start", soundEnabled); setGithubModalTarget(null); }}
              >
                CONFIRM WARP &gt;
              </a>
            </footer>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="shot-lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="shot-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <header className="shot-lightbox-header">
              <span>&gt; {lightbox.label.toUpperCase()}</span>
              <button type="button" onClick={() => { playRetroSound("click", soundEnabled); setLightbox(null); }} aria-label="Close image">✕</button>
            </header>
            <div className="shot-lightbox-body">
              <img src={lightbox.src} alt={lightbox.label} />
            </div>
            <footer className="shot-lightbox-footer">
              <small>ESC / CLICK OUTSIDE TO CLOSE — SCROLL TO VIEW LONG IMAGES</small>
              <a href={lightbox.src} target="_blank" rel="noreferrer" className="btn-confirm" onClick={() => playRetroSound("start", soundEnabled)}>OPEN FULL TAB &gt;</a>
            </footer>
          </div>
        </div>
      )}

      {/* Floating Chatbot Launcher Button */}
      <button
        type="button"
        className="floating-ai-launcher"
        onClick={() => { playRetroSound("click", soundEnabled); setChatOpen((v) => !v); }}
        title="Ask Pryscila-AI Bot"
      >
        <Bot size={20} />
        <span>ASK AI</span>
        <Sparkles size={13} className="sparkle-icon" />
      </button>

      {/* Floating Chatbot CRT Terminal Window */}
      {chatOpen && (
        <div className="ai-chat-window">
          <header className="ai-chat-header">
            <div className="ai-chat-title">
              <Bot size={16} />
              <strong>PRYSCILA-AI BOT v1.0</strong>
              <small>ONLINE</small>
            </div>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Close Chat">
              <X size={16} />
            </button>
          </header>

          <div className="ai-chat-body">
            <div className="ai-messages-list">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`ai-msg-bubble ${msg.sender}`}>
                  {msg.sender === "bot" && <Bot size={14} className="bot-avatar-icon" />}
                  <div className="ai-msg-text">{msg.text}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="ai-msg-bubble bot loading">
                  <Bot size={14} className="bot-avatar-icon" />
                  <div className="ai-msg-text">&gt; THINKING_...</div>
                </div>
              )}
            </div>

            <div className="ai-quick-chips">
              <button type="button" onClick={() => handleSendChat("What are Pryscila's top skills?")}>
                ⚡ Skills
              </button>
              <button type="button" onClick={() => handleSendChat("How can Pryscila help with AI Automation?")}>
                🤖 AI Workflows
              </button>
              <button type="button" onClick={() => handleSendChat("Tell me about Pryscila's work experience.")}>
                💼 Experience
              </button>
              <button type="button" onClick={() => handleSendChat("How can I contact Pryscila?")}>
                📬 Contact Info
              </button>
            </div>
          </div>

          <form
            className="ai-chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
          >
            <input
              type="text"
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button type="submit" disabled={chatLoading || !chatInput.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
