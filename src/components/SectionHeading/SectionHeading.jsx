import Reveal from '../Reveal/Reveal';
import styles from './SectionHeading.module.css';

export default function SectionHeading({ number, kicker, children, description, headingId, dark = false }) {
  return (
    <Reveal className={`${styles.sectionIntro} ${dark ? styles.dark : ''}`}>
      <div className={styles.sectionKicker}><span>{number}</span>{kicker}</div>
      <h2 id={headingId}>{children}</h2>
      {description && <p>{description}</p>}
    </Reveal>
  );
}
