import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TbArrowLeft, TbMicrophone, TbSend2, TbSparkles, TbVideo } from "react-icons/tb";
import styles from "./PortfolioAssistant.module.css";

const quickPrompts = [
  "Walk me through your AI projects",
  "What have you owned end to end?",
  "Show me measurable impact",
  "Why should we hire you?",
];

const answers = {
  greeting:
    "Hi, I’m Narendra’s portfolio assistant. Ask me about his production AI work, full-stack delivery, project ownership, skills, or measurable impact.",
  projects:
    "Narendra’s featured work starts with this AI-ready conversational portfolio, followed by a production-style RAG Knowledge Assistant and Agentic Synthetic Data Studio, then QuickPark, a GalaxE internship fitness-commerce capstone, and FakeCET. The RAG platform combines hybrid retrieval, reranking, grounded citations, RAGAS and LLM-as-a-Judge evaluation, Langfuse observability, Redis semantic caching, and Dockerized delivery. His foundational projects were built without AI-generated code to strengthen full-stack fundamentals.",
  ownership:
    "For Agentic Synthetic Data Studio, Narendra owns the end-to-end product architecture across configurable data connectivity, source profiling, React workflows, FastAPI services, agentic generation, deterministic validation, batch execution, observability, and delivery. The platform is designed as a reusable enterprise product with extensible connectors, policies, and output destinations.",
  impact:
    "His work has delivered concrete results: about 80% lower latency for repeated analytical requests, about 50% less analyst time spent identifying relevant competitors, API response time improved from 3 seconds to 400 milliseconds, and automated validation across more than 1 million records with 30+ checks.",
  hire: "Narendra brings a valuable combination: production AI depth and full-stack ownership. He can build the RAG or agentic workflow, expose it through reliable APIs, create the React product around it, tune data and caching performance, and collaborate through delivery. That makes him useful beyond a prototype. He can help ship the complete product.",
  experience:
    "At Endava Solutions India, Narendra progressed from Associate Developer to Junior ML Engineer and then Machine Learning Engineer. His work combines AI engineering with hands-on full-stack delivery across healthcare, automation, and enterprise intelligence products.",
  skills:
    "His core stack includes ReactJS, JavaScript, Python, FastAPI, Java, Spring Boot, Spring WebFlux, PostgreSQL, MongoDB, Redis, Caffeine, REST APIs, AWS, GCP, Docker, and CI/CD. His AI toolkit includes RAG, agentic and multi-agent systems, LangChain, LangGraph, LangSmith, evaluations, and guardrails.",
  achievements:
    "Narendra’s team earned a top finish in the InSync Codex Hackathon among 52 teams and 232 participants with Dava Compass. He also secured second place in Endava AI Days 2025 for AI Evaluator. He is a Databricks Certified Generative AI Engineer Associate and an AWS Certified AI Practitioner.",
  contact:
    "You can reach Narendra through the contact section of this portfolio or connect with him through the LinkedIn link there. His resume is also available from the navigation bar.",
  fallback:
    "I can help with Narendra’s projects, project ownership, experience, technical skills, measurable outcomes, certifications, hackathons, or contact details. Try one of the suggested questions below.",
};

function getAnswer(question) {
  const query = question.toLowerCase();

  if (/project|product|companion|match|rag|agent|regression|talent/.test(query))
    return answers.projects;
  if (/own|sole|end.to.end|responsib|lead/.test(query))
    return answers.ownership;
  if (/impact|metric|result|performance|latency|percent|outcome/.test(query))
    return answers.impact;
  if (/why|hire|fit|value|different/.test(query)) return answers.hire;
  if (/experience|role|promotion|career|endava/.test(query))
    return answers.experience;
  if (/skill|stack|technology|tech|java|python|react|aws|database/.test(query))
    return answers.skills;
  if (/award|achievement|hackathon|certif|databricks|codex/.test(query))
    return answers.achievements;
  if (/contact|email|linkedin|resume|reach/.test(query)) return answers.contact;

  return answers.fallback;
}

export default function PortfolioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [assistantView, setAssistantView] = useState("chat");
  const [hasStarted, setHasStarted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: answers.greeting },
  ]);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (assistantView === "chat" && hasStarted && isOpen) inputRef.current?.focus();
  }, [assistantView, hasStarted, isOpen]);

  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const askQuestion = (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isTyping) return;

    setHasStarted(true);
    setInput("");
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmedQuestion },
    ]);
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: getAnswer(trimmedQuestion) },
      ]);
      setIsTyping(false);
    }, 420);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askQuestion(input);
  };

  const openAssistant = (view) => {
    setAssistantView(view);
    setVoiceStatus("idle");
    if (view === "chat") setHasStarted(true);
    setIsOpen(true);
  };

  return (
    <>
      <div className={styles.launchers} aria-label="Portfolio AI options">
        <button
          className={styles.launchButton}
          type="button"
          onClick={() => openAssistant("voice")}
          aria-haspopup="dialog"
          aria-label="Start a voice chat with AI"
        >
          <TbMicrophone className={styles.launchIcon} aria-hidden="true" />
          <span className={styles.launchLabel}>Voice Chat with AI</span>
        </button>
        <button
          className={styles.launchButton}
          type="button"
          onClick={() => openAssistant("video")}
          aria-haspopup="dialog"
          aria-label="Start a video chat with AI"
        >
          <TbVideo className={styles.launchIcon} aria-hidden="true" />
          <span className={styles.launchLabel}>Video Chat with AI</span>
        </button>
      </div>

      {isOpen && createPortal(
        <div
          className={styles.overlay}
          role="presentation"
          onMouseDown={() => setIsOpen(false)}
        >
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-label={assistantView === "voice" ? "Voice AI experience" : assistantView === "video" ? "Video chat status" : "Chat with Narendra"}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {assistantView === "voice" ? (
              <div className={styles.voiceIntro}>
                <p className={styles.voiceDisclaimer}>Powered by AI &amp; built by Narendra.<br />Responses may not always be fully accurate.</p>
                <button className={styles.voiceCloseButton} type="button" onClick={() => setIsOpen(false)}>Close</button>
                <div className={styles.voiceContent}>
                  <div className={styles.voicePortrait}>
                    <img src="/profile.jpg" alt="Narendra Vanapalli" />
                  </div>
                  <h2>Narendra Vanapalli</h2>
                  <p className={styles.voiceTagline}>Ask my AI about the work I build.</p>
                  <div className={styles.voiceActions}>
                    <button
                      className={styles.voiceStartButton}
                      type="button"
                      onClick={() => setVoiceStatus("ready")}
                    >
                      <TbMicrophone aria-hidden="true" />
                      {voiceStatus === "ready" ? "Voice session ready" : "Start the call"}
                    </button>
                    <button
                      className={styles.voiceChatButton}
                      type="button"
                      onClick={() => {
                        setAssistantView("chat");
                        setHasStarted(true);
                      }}
                    >
                      Chat with me
                    </button>
                  </div>
                  <p className={styles.voiceAvailability}>{voiceStatus === "ready" ? "Voice interface is ready for a realtime connection." : "Voice experience preview"}</p>
                  <p className={styles.voicePrompt}>Ask me to <strong>“walk me through your RAG work”</strong> and I&apos;ll explain the architecture, evaluation, and impact.</p>
                </div>
              </div>
            ) : assistantView === "video" ? (
              <div className={styles.videoIntro}>
                <button className={styles.videoCloseButton} type="button" onClick={() => setIsOpen(false)}>Close</button>
                <div className={styles.videoContent}>
                  <span className={styles.videoIcon} aria-hidden="true"><TbVideo /></span>
                  <p className={styles.videoEyebrow}>COMING SOON</p>
                  <h2>Video Chat is<br />in development.</h2>
                  <p>I&apos;m building an interactive way to explore my work through video. For now, you can still ask my portfolio assistant anything by text.</p>
                  <button
                    className={styles.videoChatButton}
                    type="button"
                    onClick={() => {
                      setAssistantView("chat");
                      setHasStarted(true);
                    }}
                  >
                    Chat with me instead
                  </button>
                </div>
              </div>
            ) : !hasStarted ? (
              <div className={styles.intro}>
                <div className={styles.portraitFrame}>
                  <img src="/profile.jpg" alt="Narendra Vanapalli" />
                  <span className={styles.onlineDot} aria-label="Available" />
                </div>
                <h2>Narendra Vanapalli</h2>
                <p className={styles.role}>
                  AI/ML ENGINEER · FULL-STACK BUILDER
                </p>
                <p className={styles.introCopy}>
                  Ask about my projects, engineering decisions, skills, and
                  measurable impact.
                </p>
                <button
                  className={styles.startButton}
                  type="button"
                  onClick={() => setHasStarted(true)}
                >
                  Start chatting <span aria-hidden="true">→</span>
                </button>
                <p className={styles.promptHint}>
                  Try asking me to{" "}
                  <button
                    type="button"
                    onClick={() => askQuestion(quickPrompts[0])}
                  >
                    “walk through an AI project”
                  </button>
                </p>
                <p className={styles.disclaimer}>
                  UI preview · Backend connection can be added later
                </p>
              </div>
            ) : (
              <div className={styles.chatView}>
                <div className={styles.chatHeader}>
                  <button
                    className={styles.chatBackButton}
                    type="button"
                    onClick={() => {
                      setAssistantView("voice");
                      setHasStarted(false);
                    }}
                    aria-label="Back to voice chat"
                  >
                    <TbArrowLeft aria-hidden="true" />
                  </button>
                  <div className={styles.chatIdentity}>
                    <div>
                      <strong>Chat with Narendra</strong>
                      <span>Portfolio assistant · Ask about my work</span>
                    </div>
                  </div>
                  {messages.length > 1 && (
                    <button
                      className={styles.chatClearButton}
                      type="button"
                      onClick={() => {
                        setMessages([{ role: "assistant", text: answers.greeting }]);
                        setIsTyping(false);
                      }}
                    >
                      Clear
                    </button>
                  )}
                  <button className={styles.chatCloseButton} type="button" onClick={() => setIsOpen(false)}>Close</button>
                </div>

                <div className={styles.chatPanel}>
                  <div
                    className={styles.conversation}
                    ref={conversationRef}
                    aria-live="polite"
                  >
                    {messages.slice(1).map((message, index) => (
                      <div
                        className={`${styles.message} ${styles[message.role]}`}
                        key={`${message.role}-${index}`}
                      >
                        <span>
                          {message.role === "assistant" ? "NV AI" : "YOU"}
                        </span>
                        <p>{message.text}</p>
                      </div>
                    ))}
                    {messages.length === 1 && !isTyping && (
                      <div className={styles.chatEmptyState}>
                        <span className={styles.chatSpark}><TbSparkles aria-hidden="true" /></span>
                        <h2>Ask me anything</h2>
                        <p>Ask about AI projects, experience, technical decisions, or the impact behind my work.</p>
                        <div className={styles.followUps}>
                          {quickPrompts.slice(0, 3).map((prompt) => (
                            <button
                              type="button"
                              onClick={() => askQuestion(prompt)}
                              key={prompt}
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {isTyping && (
                      <div className={`${styles.message} ${styles.assistant}`}>
                        <span>NV AI</span>
                        <p
                          className={styles.typing}
                          aria-label="Preparing answer"
                        >
                          <i /> <i /> <i />
                        </p>
                      </div>
                    )}
                  </div>
                  <form className={styles.chatForm} onSubmit={handleSubmit}>
                    <label
                      className={styles.srOnly}
                      htmlFor="portfolio-question"
                    >
                      Ask a question
                    </label>
                    <input
                      id="portfolio-question"
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Type a message..."
                      autoComplete="off"
                    />
                    <button type="submit" disabled={!input.trim() || isTyping} aria-label="Send message">
                      <TbSend2 aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>
      , document.body)}
    </>
  );
}
