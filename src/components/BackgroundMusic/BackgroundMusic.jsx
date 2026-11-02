import { createContext, useContext, useEffect, useRef, useState } from 'react';

const BackgroundMusicContext = createContext(null);

export function BackgroundMusicProvider({ children }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.45;

    const pauseForConversation = () => audioRef.current?.pause();
    const pauseWhenHidden = () => {
      if (document.hidden) audioRef.current?.pause();
    };

    window.addEventListener('portfolio:pause-music', pauseForConversation);
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      window.removeEventListener('portfolio:pause-music', pauseForConversation);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
      setAudioError(false);
    } catch {
      setAudioError(true);
    }
  };

  const seekTo = (seconds) => {
    if (audioRef.current && duration) audioRef.current.currentTime = seconds;
  };

  return (
    <BackgroundMusicContext.Provider value={{ isPlaying, currentTime, duration, audioError, togglePlayback, seekTo }}>
      {children}
      <audio
        ref={audioRef}
        src="/audio/mixkit-vastness-andrew-ev.mp3"
        preload="none"
        loop
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setAudioError(true)}
      />
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic() {
  const music = useContext(BackgroundMusicContext);
  if (!music) throw new Error('useBackgroundMusic must be used inside BackgroundMusicProvider');
  return music;
}
