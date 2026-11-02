import Nav from '../Nav/Nav';
import PortfolioAssistant from '../PortfolioAssistant/PortfolioAssistant';
import { useBackgroundMusic } from '../BackgroundMusic/BackgroundMusic';
import { TbFileDownload, TbMusic, TbMusicOff } from 'react-icons/tb';
import styles from './Header.module.css';

export default function Header() {
  const { isPlaying, audioError, togglePlayback } = useBackgroundMusic();

  return (
    <div className={styles.headerShell}>
      <header className={styles.header}>
      <a className={styles.brand} href="#home" aria-label="Narendra Vanapalli home">
        <span className={styles.brandMark} aria-hidden="true">
          <img src="/nv-logo-mark.png" alt="" />
        </span>
        <span>Narendra Vanapalli</span>
      </a>
      <Nav />
      <div className={styles.headerActions}>
        <button
          className={`${styles.headerCta} ${isPlaying ? styles.musicActive : ''}`}
          type="button"
          onClick={togglePlayback}
          aria-label={audioError ? 'Music unavailable. Try again' : isPlaying ? 'Pause background music' : 'Play background music'}
          aria-pressed={isPlaying}
          data-tooltip={audioError ? 'Music unavailable — try again' : isPlaying ? 'Pause music' : 'Play ambient music'}
        >
          {isPlaying ? <TbMusic aria-hidden="true" /> : <TbMusicOff aria-hidden="true" />}
        </button>
        <a className={styles.headerCta} href="/Narendra_Vanapalli_Resume.pdf" download aria-label="Download Resume" data-tooltip="Download Resume">
          <TbFileDownload aria-hidden="true" />
        </a>
        <PortfolioAssistant />
      </div>
      </header>
      <button className={styles.aiInvitation} type="button" onClick={() => window.dispatchEvent(new Event('portfolio:open-video'))}>
        <img src="/profile.jpg" alt="" />
        <span>Try <strong>talking to my AI avatar</strong> — ask me about any project.</span>
      </button>
    </div>
  );
}
