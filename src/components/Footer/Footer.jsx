import { HiArrowUp } from 'react-icons/hi2';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <a className={styles.identity} href="#home" aria-label="Narendra Vanapalli back to home">
          <span className={styles.monogram} aria-hidden="true">
            <img src="/nv-logo-mark.png" alt="" />
          </span>
          <span>
            <strong>Narendra Vanapalli</strong>
            <small>AI/ML + Full-Stack Engineer</small>
          </span>
        </a>

        <p className={styles.footerStatement}>
          Building reliable AI products from grounded intelligence and agentic workflows to the full-stack systems that bring them to life.
        </p>
      </div>

      <div className={styles.footerBottom}>
        <p>© 2026 Narendra Vanapalli</p>
        <nav className={styles.footerNav} aria-label="Footer navigation">
          <a href="#projects">Selected work</a>
          <a href="#contact">Contact</a>
          <a className={styles.backToTop} href="#home">Back to top <HiArrowUp aria-hidden="true" /></a>
        </nav>
      </div>
    </footer>
  );
}
