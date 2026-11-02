import { useBackgroundMusic } from '../../components/BackgroundMusic/BackgroundMusic';
import { FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { HiOutlineDocumentText, HiOutlineEnvelope } from 'react-icons/hi2';
import styles from './Contact.module.css';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function Contact() {
  const { isPlaying, currentTime, duration, audioError, togglePlayback, seekTo } = useBackgroundMusic();

  return (
    <section className={styles.contactSection} id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className={styles.visuallyHidden}>Get in touch</h2>

      <div className={styles.contactContent}>
        <div className={styles.musicCard}>
          <img className={styles.albumArt} src="/ambient-music-cover.webp" alt="Headphones and music player on a sunlit desk" loading="lazy" />
          <div className={styles.playerBody}>
            <strong>Vastness</strong>
            <span className={styles.artist}>Andrew Ev</span>
            <div className={styles.playerProgress}>
              <input
                type="range"
                min="0"
                max={duration || 229}
                step="1"
                value={Math.min(currentTime, duration || 229)}
                aria-label="Seek through Vastness"
                disabled={!duration}
                style={{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` }}
                onChange={(event) => seekTo(Number(event.target.value))}
              />
              <div className={styles.timeRow}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 229)}</span>
              </div>
            </div>
            <button className={styles.playButton} type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Pause Vastness' : 'Play Vastness'}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            {audioError && <small>Audio is unavailable right now.</small>}
          </div>
        </div>

        <nav className={styles.contactLinks} aria-label="Connect with Narendra">
          <a href="https://www.linkedin.com/in/narendra-vanapalli-853b15256/" target="_blank" rel="noreferrer"><FaLinkedinIn aria-hidden="true" />LinkedIn</a>
          <a href="https://www.instagram.com/narendra_vanapalli/" target="_blank" rel="noreferrer"><FaInstagram aria-hidden="true" />Instagram</a>
          <a href="https://github.com/Narendra-9" target="_blank" rel="noreferrer"><FaGithub aria-hidden="true" />GitHub</a>
          <a href="mailto:sivanarendravanapalli@gmail.com"><HiOutlineEnvelope aria-hidden="true" />Email</a>
          <a href="/Narendra_Vanapalli_Resume.pdf" download><HiOutlineDocumentText aria-hidden="true" />Resume</a>
        </nav>
      </div>
    </section>
  );
}
