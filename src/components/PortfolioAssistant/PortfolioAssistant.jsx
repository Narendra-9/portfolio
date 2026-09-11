import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [hasStarted, setHasStarted] = useState(false);
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
    if (hasStarted && isOpen) inputRef.current?.focus();
  }, [hasStarted, isOpen]);

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

  return (
    <>
      <button
        className={styles.launchButton}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        <span className={styles.launchIcon} aria-hidden="true">
          ✦
        </span>
        Ask My AI
      </button>

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
            aria-labelledby="assistant-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.dialogHeader}>
              <div className={styles.assistantBrand}>
                <span className={styles.brandMark}>NV</span>
                <strong id="assistant-title">PORTFOLIO ASSISTANT</strong>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Close <span aria-hidden="true">×</span>
              </button>
            </header>

            {!hasStarted ? (
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
                  <div className={styles.chatIdentity}>
                    <div className={styles.miniPortrait}>
                      <img src="/profile.jpg" alt="" />
                    </div>
                    <div>
                      <strong>Narendra’s Portfolio</strong>
                      <span>Ask about the work</span>
                    </div>
                  </div>
                </div>

                <div className={styles.chatPanel}>
                  <div
                    className={styles.conversation}
                    ref={conversationRef}
                    aria-live="polite"
                  >
                    {messages.map((message, index) => (
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
                      <div className={styles.followUps}>
                        <span>Suggested follow-ups</span>
                        <div>
                          {quickPrompts.map((prompt) => (
                            <button
                              type="button"
                              onClick={() => askQuestion(prompt)}
                              key={prompt}
                            >
                              {prompt} <span aria-hidden="true">↗</span>
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
                      placeholder="Ask about projects, impact, skills..."
                      autoComplete="off"
                    />
                    <button type="submit" disabled={!input.trim() || isTyping}>
                      Send <span aria-hidden="true">↗</span>
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
