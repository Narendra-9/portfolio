import { useCallback, useEffect, useRef, useState } from "react";
import { AnamEvent, createClient } from "@anam-ai/js-sdk";
import {
  TbMessageCircle,
  TbMicrophone,
  TbMicrophoneOff,
  TbPhoneOff,
  TbSparkles,
  TbVideo,
  TbX,
} from "react-icons/tb";
import styles from "./PortfolioAssistant.module.css";

const VIDEO_ELEMENT_ID = "narendra-anam-avatar-video";
const DAILY_VIDEO_LIMIT_MS = 3 * 60 * 1000;
const VIDEO_USAGE_STORAGE_KEY = "narendra-portfolio-video-usage-v1";
const SESSION_TOKEN_REFRESH_MS = 10 * 60 * 1000;

function getLocalDateKey() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function readVideoUsage() {
  if (typeof window === "undefined") return 0;

  try {
    const stored = JSON.parse(window.localStorage.getItem(VIDEO_USAGE_STORAGE_KEY));
    if (stored?.date !== getLocalDateKey()) return 0;
    return Math.max(0, Math.min(DAILY_VIDEO_LIMIT_MS, Number(stored.usedMs) || 0));
  } catch {
    return 0;
  }
}

function saveVideoUsage(usedMs) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      VIDEO_USAGE_STORAGE_KEY,
      JSON.stringify({
        date: getLocalDateKey(),
        usedMs: Math.max(0, Math.min(DAILY_VIDEO_LIMIT_MS, usedMs)),
      }),
    );
  } catch {
    // Video chat still works when local storage is unavailable.
  }
}

function upsertTranscript(current, event) {
  const index = current.findIndex((message) => message.id === event.id);
  const role = event.role === "user" ? "user" : "assistant";

  if (index === -1) {
    return [
      ...current,
      {
        id: event.id,
        role,
        text: event.content,
        interrupted: event.interrupted,
      },
    ];
  }

  const next = [...current];
  next[index] = {
    ...next[index],
    text: `${next[index].text}${event.content}`,
    interrupted: event.interrupted,
  };
  return next;
}

export default function VideoAvatar({ onClose }) {
  const clientRef = useRef(null);
  const preparedAtRef = useRef(0);
  const transcriptRef = useRef(null);
  const endingRef = useRef(false);
  const [status, setStatus] = useState("preparing");
  const [conversationState, setConversationState] = useState("Preparing secure session");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [usedMs, setUsedMs] = useState(readVideoUsage);

  const stopSession = useCallback(async ({ preserveError = false } = {}) => {
    endingRef.current = true;
    const activeClient = clientRef.current;
    clientRef.current = null;
    preparedAtRef.current = 0;

    if (activeClient?.isStreaming()) {
      try {
        await activeClient.stopStreaming();
      } catch {
        // The remote side may already have closed the WebRTC session.
      }
    }

    setStatus("ended");
    setConversationState("Conversation ended");
    setIsMuted(false);
    if (!preserveError) setError("");
  }, []);

  const prepareSession = useCallback(async () => {
    setStatus("preparing");
    setConversationState("Preparing secure session");
    setError("");
    endingRef.current = false;

    const response = await fetch("/api/avatar-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.sessionToken) {
      throw new Error(data.error || "Video chat could not be prepared.");
    }

    const anamClient = createClient(data.sessionToken);

    anamClient.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (event) => {
      setMessages((current) => upsertTranscript(current, event));
      setConversationState(event.role === "user" ? "Listening to you" : "Narendra is speaking");
      if (event.endOfSpeech) setConversationState("Ready for your question");
    });
    anamClient.addListener(AnamEvent.USER_SPEECH_STARTED, () => {
      setConversationState("Listening to you");
    });
    anamClient.addListener(AnamEvent.USER_SPEECH_ENDED, () => {
      setConversationState("Thinking");
    });
    anamClient.addListener(AnamEvent.VIDEO_PLAY_STARTED, () => {
      setStatus("connected");
      setConversationState("Ready for your question");
    });
    anamClient.addListener(AnamEvent.MIC_PERMISSION_DENIED, () => {
      setError("Microphone permission is required for the video conversation.");
    });
    anamClient.addListener(AnamEvent.CONNECTION_CLOSED, () => {
      if (!endingRef.current) {
        setStatus("ended");
        setConversationState("Connection closed");
      }
    });

    clientRef.current = anamClient;
    preparedAtRef.current = Date.now();
    setStatus("ready");
    setConversationState("Ready to start");
    return anamClient;
  }, []);

  useEffect(() => {
    let cancelled = false;

    prepareSession().catch((prepareError) => {
      if (cancelled) return;
      setStatus("error");
      setConversationState("Video unavailable");
      setError(prepareError instanceof Error ? prepareError.message : "Video chat could not be prepared.");
    });

    return () => {
      cancelled = true;
      endingRef.current = true;
      const activeClient = clientRef.current;
      clientRef.current = null;
      if (activeClient?.isStreaming()) activeClient.stopStreaming().catch(() => {});
    };
  }, [prepareSession]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (status !== "connected") return undefined;

    let lastTick = Date.now();
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const nextUsage = Math.min(DAILY_VIDEO_LIMIT_MS, readVideoUsage() + Math.max(0, now - lastTick));
      lastTick = now;
      saveVideoUsage(nextUsage);
      setUsedMs(nextUsage);

      if (nextUsage >= DAILY_VIDEO_LIMIT_MS) {
        setError("You’ve reached today’s three-minute video allowance. Video chat resets tomorrow.");
        stopSession({ preserveError: true });
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [status, stopSession]);

  const startSession = async () => {
    const latestUsage = readVideoUsage();
    setUsedMs(latestUsage);
    if (latestUsage >= DAILY_VIDEO_LIMIT_MS) {
      setError("You’ve used today’s three-minute video allowance. Video chat resets tomorrow.");
      return;
    }

    try {
      setStatus("connecting");
      setConversationState("Connecting microphone and video");
      setMessages([]);
      setError("");

      let anamClient = clientRef.current;
      if (!anamClient || Date.now() - preparedAtRef.current > SESSION_TOKEN_REFRESH_MS) {
        anamClient = await prepareSession();
        setStatus("connecting");
        setConversationState("Connecting microphone and video");
      }

      // Render the video element before handing it to the streaming SDK.
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      await anamClient.streamToVideoElement(VIDEO_ELEMENT_ID);
    } catch (startError) {
      setStatus("error");
      setConversationState("Could not connect");
      setError(
        startError?.name === "NotAllowedError"
          ? "Microphone permission is required for the video conversation."
          : startError instanceof Error
            ? startError.message
            : "The video conversation could not be started.",
      );
    }
  };

  const toggleMute = () => {
    const anamClient = clientRef.current;
    if (!anamClient?.isStreaming()) return;
    const audioState = isMuted ? anamClient.unmuteInputAudio() : anamClient.muteInputAudio();
    setIsMuted(audioState.isMuted);
  };

  const leaveVideo = async (nextAction) => {
    await stopSession();
    nextAction();
  };

  const remainingMs = Math.max(0, DAILY_VIDEO_LIMIT_MS - usedMs);
  const isConnected = status === "connected";
  const headerStatus = status === "ready"
    ? "AI Avatar Ready"
    : status === "connected"
      ? "Conversation Live"
      : status === "preparing"
        ? "Preparing Avatar"
        : status === "connecting"
          ? "Connecting"
          : status === "error"
            ? "Setup Required"
            : "Call Ended";

  if (!isConnected && status !== "connecting") {
    return (
      <div className={styles.videoLanding}>
        <p className={styles.videoLandingDisclaimer}>
          Powered by AI and fully built by me.<br />
          Live video responses may not be perfectly accurate.
        </p>
        <button className={styles.videoLandingClose} type="button" onClick={() => leaveVideo(onClose)}>
          <TbX aria-hidden="true" /> Close
        </button>

        <main className={styles.videoLandingContent}>
          <img className={styles.videoLandingPortrait} src="/profile.jpg" alt="Narendra Vanapalli" />
          <h2>Narendra Vanapalli</h2>
          <p className={styles.videoLandingTagline}>See me talk, live on video.</p>
          <p className={styles.videoLandingDescription}>
            Have a real-time conversation with my AI avatar.
          </p>
          {error && <p className={styles.videoLandingError}>{error}</p>}
          <button
            className={styles.videoLandingStart}
            type="button"
            onClick={status === "error" || status === "ended" ? prepareSession : startSession}
            disabled={status === "preparing" || remainingMs === 0}
          >
            <TbVideo aria-hidden="true" />
            {status === "preparing"
              ? "Preparing..."
              : status === "error" || status === "ended"
                ? "Prepare again"
                : remainingMs === 0
                  ? "Limit reached"
                  : "Start Video Call"}
          </button>
          <p className={styles.videoLandingAllowance}>
            {remainingMs === 0 ? "Today's video time has been used." : "3:00 free today · Resets tomorrow"}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.videoExperience}>
      <div className={styles.videoTopbar}>
        <div className={styles.videoHeading}>
          <span className={styles.videoHeaderIcon}><TbVideo aria-hidden="true" /></span>
          <div>
            <strong>Talk with Narendra, live</strong>
            <p>Have a real-time conversation with my AI avatar.</p>
          </div>
        </div>
        <div className={styles.videoHeaderActions}>
          <span className={styles.videoReadyBadge}>
            <i className={status === "error" ? styles.videoStatusError : ""} aria-hidden="true" />
            {headerStatus}
          </span>
          <button className={styles.videoCloseButton} type="button" onClick={() => leaveVideo(onClose)}>
            <TbX aria-hidden="true" /> Close
          </button>
        </div>
      </div>

      <div className={`${styles.videoLayout} ${!isConnected ? styles.videoLayoutStarting : ""}`}>
        <section className={styles.videoStage} aria-label="AI avatar video">
          <video id={VIDEO_ELEMENT_ID} className={styles.avatarVideo} autoPlay playsInline />
          {!isConnected && (
            <div className={styles.videoConnectingScreen} aria-live="polite">
              <span className={styles.videoConnectingLoader} aria-hidden="true">
                <i />
                <TbVideo />
              </span>
              <strong>Bringing Narendra on screen</strong>
              <p>Connecting your microphone and preparing the live video…</p>
            </div>
          )}

          <div className={styles.videoState} aria-live="polite">
            <span className={isConnected ? styles.liveDot : styles.idleDot} aria-hidden="true" />
            {conversationState}
          </div>

          {!isConnected && (
            <div className={styles.videoPrompt}>
              <span className={styles.videoPosterBadge}><TbVideo aria-hidden="true" /></span>
              <strong>{status === "error" ? "Video needs configuration" : "Start the conversation"}</strong>
              <p>{status === "error" ? "Check the setup message below, then try again." : "Connect when you’re ready to talk."}</p>
            </div>
          )}

          {error && <p className={styles.videoError}>{error}</p>}

          <div className={styles.videoCallDock}>
            <div className={styles.videoControls}>
              {!isConnected ? (
                <button
                  className={styles.videoStartButton}
                  type="button"
                  onClick={status === "error" || status === "ended" ? prepareSession : startSession}
                  disabled={status === "preparing" || status === "connecting" || remainingMs === 0}
                >
                  <TbVideo aria-hidden="true" />
                  {status === "preparing"
                    ? "Preparing..."
                    : status === "connecting"
                      ? "Connecting..."
                      : status === "error" || status === "ended"
                        ? "Prepare again"
                        : remainingMs === 0
                          ? "Limit reached"
                          : "Start Call"}
                </button>
              ) : (
                <>
                  <button className={styles.videoControlButton} type="button" onClick={toggleMute}>
                    {isMuted ? <TbMicrophoneOff aria-hidden="true" /> : <TbMicrophone aria-hidden="true" />}
                    {isMuted ? "Unmute" : "Mute"}
                  </button>
                  <button className={styles.videoEndButton} type="button" onClick={() => stopSession()}>
                    <TbPhoneOff aria-hidden="true" /> End
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {isConnected && <aside className={styles.videoTranscriptPanel} aria-label="Live video conversation transcript">
          {isConnected && (
            <div className={styles.videoPanelTabs}>
              <span className={styles.videoTranscriptLabel}>Live Transcript</span>
            </div>
          )}

          <div className={styles.voiceTranscript} ref={transcriptRef} aria-live="polite">
            {messages.length === 0 ? (
              <div className={styles.videoTranscriptEmpty}>
                <span><TbMessageCircle aria-hidden="true" /><TbSparkles aria-hidden="true" /></span>
                <strong>Start a conversation</strong>
                <p>Your live transcript will appear here as you talk with Narendra.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  className={`${styles.voiceTranscriptMessage} ${message.role === "user" ? styles.voiceTranscriptUser : styles.voiceTranscriptAgent}`}
                  key={message.id}
                >
                  <span>{message.role === "user" ? "You" : "Narendra"}</span>
                  <p>{message.text}{message.interrupted ? " ..." : ""}</p>
                </div>
              ))
            )}
          </div>
        </aside>}
      </div>
    </div>
  );
}
