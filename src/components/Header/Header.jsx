import Nav from '../Nav/Nav';
import PortfolioAssistant from '../PortfolioAssistant/PortfolioAssistant';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <a className={styles.brand} href="#home" aria-label="Narendra Vanapalli home">
        <span className={styles.brandMark} aria-hidden="true">
          <img src="/nv-logo-mark.png" alt="" />
        </span>
        <span>Narendra Vanapalli</span>
      </a>
      <Nav />
      <div className={styles.headerActions}>
        <a className={styles.headerCta} href="/Narendra_Vanapalli_Resume.pdf" download>
          Resume <span aria-hidden="true">↓</span>
        </a>
        <PortfolioAssistant />
      </div>
    </header>
  );
}
