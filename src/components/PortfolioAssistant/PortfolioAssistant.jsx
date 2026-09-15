import { useCallback, useEffect, useRef, useState } from "react";
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
} from "react-icons/tb";
import styles from "./PortfolioAssistant.module.css";

const AGENT_ID =
  import.meta.env.VITE_ELEVENLABS_AGENT_ID ||
  "agent_3501m2k3raesf7k978fkgxmkvsfz";

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
  const inputRef = useRef(null);
  const conversationRef = useRef(null);

  const conversation = useConversation({
    onConnect: () => setLocalError(""),
    onDisconnect: () => {
      setIsAwaitingResponse(false);
      setSessionMode(null);
    },
    onMessage: (message) => {
      const role = message.role === "agent" || message.source === "ai" ? "assistant" : "user";
      setMessages((current) => [
        ...current,
        { role, text: message.message, eventId: message.event_id },
      ]);
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
    if (conversation.status !== "disconnected") conversation.endSession();
    setIsAwaitingResponse(false);
  }, [conversation]);

  const closeAssistant = useCallback(() => {
    endConversation();
    setIsOpen(false);
    setLocalError("");
  }, [endConversation]);

  const openAssistant = (view) => {
    setAssistantView(view);
    setIsOpen(true);
    setLocalError("");
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
    conversation.sendUserMessage(trimmedQuestion);
    setInput("");
    setIsAwaitingResponse(true);
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
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isAwaitingResponse]);

  const isVoiceConnected = isConnected && sessionMode === "voice";
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
        <button className={styles.launchButton} type="button" onClick={() => openAssistant("voice")} aria-haspopup="dialog">
          <TbMicrophone className={styles.launchIcon} aria-hidden="true" />
          <span className={styles.launchLabel}>Voice chat</span>
        </button>
        <button className={styles.launchButton} type="button" onClick={() => openAssistant("chat")} aria-haspopup="dialog">
          <TbMessageCircle className={styles.launchIcon} aria-hidden="true" />
          <span className={styles.launchLabel}>Text chat</span>
        </button>
      </div>

      {isOpen && createPortal(
        <div className={styles.overlay} role="presentation" onMouseDown={closeAssistant}>
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-label={assistantView === "voice" ? "Voice conversation with Narendra" : "Chat with Narendra"}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {assistantView === "voice" ? (
              <div className={styles.voiceIntro}>
                <p className={styles.voiceDisclaimer}>AI-powered conversation<br />Responses may occasionally be inaccurate.</p>
                <button className={styles.voiceCloseButton} type="button" onClick={closeAssistant}>Close</button>

                <div className={`${styles.voiceContent} ${styles.voiceExperience}`}>
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

                  {localError && <p className={styles.connectionError}>{localError}</p>}

                  <div className={styles.voiceActions}>
                    {!isVoiceConnected ? (
                      <button className={styles.voiceStartButton} type="button" onClick={startVoiceSession} disabled={isConnecting || isConnected}>
                        <TbMicrophone aria-hidden="true" />
                        {isConnecting || isConnected ? "Switching to voice…" : "Start conversation"}
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
                      Open transcript
                    </button>
                  </div>
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
