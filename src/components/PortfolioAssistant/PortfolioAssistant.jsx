import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import {
  TbArrowLeft,
  TbMicrophone,
  TbMicrophoneOff,
  TbPhoneOff,
  TbSend2,
  TbSparkles,
  TbMessageCircle,
  TbVideo,
} from "react-icons/tb";
import styles from "./PortfolioAssistant.module.css";

const loadVideoAvatar = () => import("./VideoAvatar");
const VideoAvatar = lazy(loadVideoAvatar);

const AGENT_ID =
  import.meta.env.VITE_ELEVENLABS_AGENT_ID ||
  "agent_3501m2k3raesf7k978fkgxmkvsfz";

const DAILY_VOICE_LIMIT_MS = 5 * 60 * 1000;
const VOICE_USAGE_STORAGE_KEY = "narendra-portfolio-voice-usage-v1";

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readVoiceUsage() {
  if (typeof window === "undefined") return 0;

  try {
    const stored = JSON.parse(window.localStorage.getItem(VOICE_USAGE_STORAGE_KEY));
    if (stored?.date !== getLocalDateKey()) return 0;
    return Math.max(0, Math.min(DAILY_VOICE_LIMIT_MS, Number(stored.usedMs) || 0));
  } catch {
    return 0;
  }
}

function saveVoiceUsage(usedMs) {
  try {
    window.localStorage.setItem(
      VOICE_USAGE_STORAGE_KEY,
      JSON.stringify({
        date: getLocalDateKey(),
        usedMs: Math.max(0, Math.min(DAILY_VOICE_LIMIT_MS, usedMs)),
      }),
    );
  } catch {
    // The conversation still works when storage is unavailable.
  }
}

function formatVoiceTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const quickPrompts = [
  "Walk me through your AI projects",
  "What have you owned end to end?",
  "Show me measurable impact",
];

const idleBars = [18, 30, 46, 28, 58, 38, 70, 48, 82, 54, 72, 42, 62, 34, 50, 26, 38, 20];

function AudioVisualizer({ active, isSpeaking, getInputData, getOutputData }) {
  const [bars, setBars] = useState(idleBars);

  useEffect(() => {
    if (!active) {
      setBars(idleBars);
      return undefined;
    }

    let frameId;
    let lastUpdate = 0;

    const update = (time) => {
      if (time - lastUpdate > 48) {
        try {
          const frequencyData = isSpeaking ? getOutputData() : getInputData();
          const step = Math.max(1, Math.floor(frequencyData.length / idleBars.length));
          const nextBars = idleBars.map((_, index) => {
            const value = frequencyData[Math.min(index * step, frequencyData.length - 1)] || 0;
            return Math.max(10, Math.min(100, 10 + (value / 255) * 90));
          });
          setBars(nextBars);
        } catch {
          setBars(idleBars);
        }
        lastUpdate = time;
      }
      frameId = window.requestAnimationFrame(update);
    };

    frameId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frameId);
  }, [active, getInputData, getOutputData, isSpeaking]);

  return (
    <div
      className={`${styles.visualizer} ${active ? styles.visualizerActive : ""}`}
      role="img"
      aria-label={isSpeaking ? "Narendra is speaking" : active ? "Listening" : "Voice visualizer idle"}
    >
      {bars.map((height, index) => (
        <span
          key={index}
          style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }}
        />
      ))}
    </div>
  );
}

function PortfolioAssistantExperience() {
  const [isOpen, setIsOpen] = useState(false);
  const [assistantView, setAssistantView] = useState("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [localError, setLocalError] = useState("");
  const [sessionMode, setSessionMode] = useState(null);
  const [voiceUsedMs, setVoiceUsedMs] = useState(readVoiceUsage);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);
  const voiceTranscriptRef = useRef(null);

  const conversation = useConversation({
    onConnect: () => setLocalError(""),
    onDisconnect: () => {
      setIsAwaitingResponse(false);
      setSessionMode(null);
    },
    onMessage: (message) => {
      const role = message.role === "agent" || message.source === "ai" ? "assistant" : "user";
      setMessages((current) => {
        if (role === "user") {
          const pendingIndex = current.findIndex(
            (item) => item.role === "user" && item.pending && item.text === message.message,
          );

          if (pendingIndex !== -1) {
            return current.map((item, index) =>
              index === pendingIndex
                ? { ...item, pending: false, eventId: message.event_id }
                : item,
            );
          }
        }

        return [
          ...current,
          { role, text: message.message, eventId: message.event_id, pending: false },
        ];
      });
      if (role === "assistant") setIsAwaitingResponse(false);
    },
    onError: (error) => {
      setLocalError(typeof error === "string" ? error : "The conversation could not be started.");
      setIsAwaitingResponse(false);
      setSessionMode(null);
    },
  });

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";
  const endSession = conversation.endSession;

  const startTextSession = useCallback(() => {
    if (isConnected || isConnecting) return;
    setMessages([]);
    setLocalError("");
    setSessionMode("text");
    conversation.startSession({ textOnly: true, connectionType: "websocket" });
  }, [conversation, isConnected, isConnecting]);

  const startVoiceSession = async () => {
    if (isConnected || isConnecting) return;
    setMessages([]);
    setLocalError("");

    const latestUsage = readVoiceUsage();
    setVoiceUsedMs(latestUsage);
    if (latestUsage >= DAILY_VOICE_LIMIT_MS) {
      setLocalError("You’ve used today’s five-minute voice allowance. Voice chat resets tomorrow.");
      return;
    }

    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach((track) => track.stop());
      setSessionMode("voice");
      conversation.startSession({ textOnly: false, connectionType: "webrtc" });
    } catch (error) {
      setSessionMode(null);
      setLocalError(
        error?.name === "NotAllowedError"
          ? "Microphone permission is required to start the voice conversation."
          : "I could not access your microphone. Please check your browser settings and try again.",
      );
    }
  };

  const endConversation = useCallback(() => {
    if (conversation.status !== "disconnected") endSession();
    setIsAwaitingResponse(false);
  }, [conversation.status, endSession]);

  const closeAssistant = useCallback(() => {
    endConversation();
    setIsOpen(false);
    setLocalError("");
  }, [endConversation]);

  const openAssistant = (view) => {
    if (view === "video") endConversation();
    setAssistantView(view);
    setIsOpen(true);
    setLocalError("");
    setVoiceUsedMs(readVoiceUsage());
    if (view === "chat") window.setTimeout(startTextSession, 0);
  };

  const switchToChat = () => {
    setAssistantView("chat");
    if (!isConnected && !isConnecting) window.setTimeout(startTextSession, 0);
  };

  const switchToVoice = () => {
    if (sessionMode === "text") endConversation();
    setAssistantView("voice");
  };

  const askQuestion = (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || !isConnected || isAwaitingResponse) return;

    const localMessage = {
      role: "user",
      text: trimmedQuestion,
      eventId: `local-${Date.now()}`,
      pending: true,
    };
    setMessages((current) => [...current, localMessage]);

    try {
      conversation.sendUserMessage(trimmedQuestion);
      setInput("");
      setIsAwaitingResponse(true);
    } catch {
      setLocalError("Your message could not be sent. Please try again.");
      setIsAwaitingResponse(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askQuestion(input);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeAssistant();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeAssistant, isOpen]);

  useEffect(() => {
    if (assistantView === "chat" && isOpen && isConnected) inputRef.current?.focus();
  }, [assistantView, isConnected, isOpen]);

  useEffect(() => {
    [conversationRef, voiceTranscriptRef].forEach((ref) => {
      ref.current?.scrollTo({
        top: ref.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, isAwaitingResponse]);

  const isVoiceConnected = isConnected && sessionMode === "voice";
  const remainingVoiceMs = Math.max(0, DAILY_VOICE_LIMIT_MS - voiceUsedMs);
  const isVoiceLimitReached = remainingVoiceMs === 0;

  useEffect(() => {
    if (!isVoiceConnected) return undefined;

    let lastTick = Date.now();
    let limitHandled = false;
    const updateUsage = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - lastTick);
      lastTick = now;
      const nextUsage = Math.min(DAILY_VOICE_LIMIT_MS, readVoiceUsage() + elapsed);

      saveVoiceUsage(nextUsage);
      setVoiceUsedMs(nextUsage);

      if (nextUsage >= DAILY_VOICE_LIMIT_MS && !limitHandled) {
        limitHandled = true;
        setLocalError("You’ve reached today’s five-minute voice limit. Voice chat resets tomorrow.");
        endSession();
      }
    };

    const intervalId = window.setInterval(updateUsage, 1000);
    return () => {
      window.clearInterval(intervalId);
      if (!limitHandled) updateUsage();
    };
  }, [endSession, isVoiceConnected]);

  useEffect(() => {
    const syncUsage = (event) => {
      if (event.key === VOICE_USAGE_STORAGE_KEY) setVoiceUsedMs(readVoiceUsage());
    };
    window.addEventListener("storage", syncUsage);
    return () => window.removeEventListener("storage", syncUsage);
  }, []);

  useEffect(() => {
    const preload = () => loadVideoAvatar().catch(() => {});
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(preload, 800);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const voiceStatus = isConnecting || (isConnected && sessionMode === "text")
    ? "Connecting…"
    : isVoiceConnected && conversation.isSpeaking
      ? "I’m speaking"
      : isVoiceConnected
        ? "I’m listening"
        : "Ready when you are";

  return (
    <>
      <div className={styles.launchers} aria-label="Talk with Narendra">
        <button className={styles.launchButton} type="button" onClick={() => openAssistant("video")} aria-haspopup="dialog">
          <TbVideo className={styles.launchIcon} aria-hidden="true" />
          <span className={styles.launchLabel}>Video chat</span>
        </button>
        <button className={styles.launchButton} type="button" onClick={() => openAssistant("voice")} aria-haspopup="dialog">
          <TbMicrophone className={styles.launchIcon} aria-hidden="true" />
          <span className={styles.launchLabel}>Voice chat</span>
        </button>
      </div>

      {isOpen && createPortal(
        <div className={styles.overlay} role="presentation" onMouseDown={closeAssistant}>
          <section
            className={`${styles.dialog} ${assistantView === "video" ? styles.videoDialog : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={
              assistantView === "video"
                ? "Video conversation with Narendra"
                : assistantView === "voice"
                  ? "Voice conversation with Narendra"
                  : "Chat with Narendra"
            }
            onMouseDown={(event) => event.stopPropagation()}
          >
            {assistantView === "video" ? (
              <Suspense fallback={<div className={styles.videoLoading}>Preparing video experience&hellip;</div>}>
                <VideoAvatar
                  onClose={closeAssistant}
                />
              </Suspense>
            ) : assistantView === "voice" ? (
              <div className={styles.voiceIntro}>
                <p className={styles.voiceDisclaimer}>AI-powered conversation<br />Responses may occasionally be inaccurate.</p>
                <button className={styles.voiceCloseButton} type="button" onClick={closeAssistant}>Close</button>

                <div className={`${styles.voiceContent} ${styles.voiceExperience} ${sessionMode !== "voice" ? styles.voiceExperienceSolo : ""}`}>
                  <div className={styles.voiceStage}>
                    <div className={`${styles.voiceOrb} ${conversation.isSpeaking ? styles.voiceOrbSpeaking : ""}`}>
                      <div className={styles.voicePortrait}>
                        <img src="/profile.jpg" alt="Narendra Vanapalli" />
                      </div>
                    </div>

                    <p className={styles.voiceEyebrow}>LIVE PORTFOLIO CONVERSATION</p>
                    <h2>Narendra Vanapalli</h2>
                    <p className={styles.voiceTagline}>Ask me about the products I’ve built and the problems I enjoy solving.</p>

                    <AudioVisualizer
                      active={isVoiceConnected}
                      isSpeaking={conversation.isSpeaking}
                      getInputData={conversation.getInputByteFrequencyData}
                      getOutputData={conversation.getOutputByteFrequencyData}
                    />
                    <p className={styles.voiceAvailability} aria-live="polite">
                      <span className={isVoiceConnected ? styles.liveDot : styles.idleDot} aria-hidden="true" />
                      {voiceStatus}
                    </p>

                    <div className={styles.voiceBudget} aria-label={`${formatVoiceTime(remainingVoiceMs)} of voice time remaining today`}>
                      <div className={styles.voiceBudgetLabel}>
                        <span>Daily voice time</span>
                        <strong>{formatVoiceTime(remainingVoiceMs)} left</strong>
                      </div>
                      <span className={styles.voiceBudgetTrack} aria-hidden="true">
                        <span style={{ width: `${(remainingVoiceMs / DAILY_VOICE_LIMIT_MS) * 100}%` }} />
                      </span>
                    </div>

                    {localError && <p className={styles.connectionError}>{localError}</p>}

                    <div className={styles.voiceActions}>
                      {!isVoiceConnected ? (
                        <button
                          className={styles.voiceStartButton}
                          type="button"
                          onClick={startVoiceSession}
                          disabled={isConnecting || isConnected || isVoiceLimitReached}
                        >
                          <TbMicrophone aria-hidden="true" />
                          {isVoiceLimitReached
                            ? "Limit reached"
                            : isConnecting || isConnected
                              ? "Switching to voice…"
                              : "Start conversation"}
                        </button>
                      ) : (
                        <>
                          <button className={styles.voiceChatButton} type="button" onClick={() => conversation.setMuted(!conversation.isMuted)}>
                            {conversation.isMuted ? <TbMicrophoneOff aria-hidden="true" /> : <TbMicrophone aria-hidden="true" />}
                            {conversation.isMuted ? "Unmute" : "Mute"}
                          </button>
                          <button className={styles.endCallButton} type="button" onClick={endConversation}>
                            <TbPhoneOff aria-hidden="true" />
                            End
                          </button>
                        </>
                      )}
                      <button className={styles.voiceChatButton} type="button" onClick={switchToChat}>
                        <TbMessageCircle aria-hidden="true" />
                        Text chat
                      </button>
                    </div>
                  </div>

                  {sessionMode === "voice" && (
                    <aside className={styles.voiceTranscriptPanel} aria-label="Live conversation transcript">
                      <div className={styles.voiceTranscriptHeader}>
                        <div>
                          <span>LIVE TRANSCRIPT</span>
                          <strong>Conversation</strong>
                        </div>
                        <span className={isVoiceConnected ? styles.transcriptLive : styles.transcriptIdle}>
                          {isVoiceConnected ? "Live" : "Connecting"}
                        </span>
                      </div>
                      <div className={styles.voiceTranscript} ref={voiceTranscriptRef} aria-live="polite">
                        {messages.length === 0 ? (
                          <p className={styles.voiceTranscriptEmpty}>
                            What you ask and what I say will appear here as the conversation happens.
                          </p>
                        ) : (
                          messages.map((message, index) => (
                            <div
                              className={`${styles.voiceTranscriptMessage} ${message.role === "user" ? styles.voiceTranscriptUser : styles.voiceTranscriptAgent}`}
                              key={`voice-${message.role}-${message.eventId ?? index}-${index}`}
                            >
                              <span>{message.role === "user" ? "You" : "Narendra"}</span>
                              <p>{message.text}</p>
                            </div>
                          ))
                        )}
                        {isAwaitingResponse && (
                          <div className={`${styles.voiceTranscriptMessage} ${styles.voiceTranscriptAgent}`}>
                            <span>Narendra</span>
                            <p className={styles.typing} aria-label="Preparing answer"><i /><i /><i /></p>
                          </div>
                        )}
                      </div>
                    </aside>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.chatView}>
                <div className={styles.chatHeader}>
                  <button className={styles.chatBackButton} type="button" onClick={switchToVoice} aria-label="Open voice conversation">
                    <TbArrowLeft aria-hidden="true" />
                  </button>
                  <div className={styles.chatIdentity}>
                    <div>
                      <strong>Chat with Narendra</strong>
                      <span>{isConnected ? "Online · Ask me anything about my work" : isConnecting ? "Connecting…" : "Offline"}</span>
                    </div>
                  </div>
                  <button className={styles.chatCloseButton} type="button" onClick={closeAssistant}>Close</button>
                </div>

                <div className={styles.chatPanel}>
                  <div className={styles.conversation} ref={conversationRef} aria-live="polite">
                    {messages.map((message, index) => (
                      <div className={`${styles.message} ${styles[message.role]}`} key={`${message.role}-${message.eventId ?? index}-${index}`}>
                        <p>{message.text}</p>
                      </div>
                    ))}

                    {messages.length === 0 && !isAwaitingResponse && (
                      <div className={styles.chatEmptyState}>
                        <span className={styles.chatSpark}><TbSparkles aria-hidden="true" /></span>
                        <h2>{isConnecting ? "Connecting you…" : "Let’s talk"}</h2>
                        <p>Ask about my AI projects, experience, engineering decisions, certifications, or measurable impact.</p>
                        <div className={styles.followUps}>
                          {quickPrompts.map((prompt) => (
                            <button type="button" onClick={() => askQuestion(prompt)} disabled={!isConnected} key={prompt}>
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isAwaitingResponse && (
                      <div className={`${styles.message} ${styles.assistant}`}>
                        <p className={styles.typing} aria-label="Preparing answer"><i /><i /><i /></p>
                      </div>
                    )}

                    {localError && (
                      <div className={styles.chatError} role="alert">
                        <p>{localError}</p>
                        <button type="button" onClick={startTextSession}>Try again</button>
                      </div>
                    )}
                  </div>

                  <form className={styles.chatForm} onSubmit={handleSubmit}>
                    <label className={styles.srOnly} htmlFor="portfolio-question">Ask a question</label>
                    <input
                      id="portfolio-question"
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={isConnected ? "Ask me something…" : "Connecting to Narendra…"}
                      autoComplete="off"
                      disabled={!isConnected}
                    />
                    <button type="submit" disabled={!input.trim() || !isConnected || isAwaitingResponse} aria-label="Send message">
                      <TbSend2 aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

export default function PortfolioAssistant() {
  return (
    <ConversationProvider agentId={AGENT_ID}>
      <PortfolioAssistantExperience />
    </ConversationProvider>
  );
}
