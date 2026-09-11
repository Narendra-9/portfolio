import Reveal from '../../components/Reveal/Reveal';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './About.module.css';

export default function About() {
  return (
    <section className={styles.about} id="about">
      <SectionHeading number="01" kicker="Who I am">Engineering across the <em>whole stack.</em></SectionHeading>
      <div className={styles.aboutGrid}>
        <Reveal className={styles.aboutCopy}>
          <p className={styles.aboutLead}>I Turn AI Capabilities Into Dependable Products People Can Actually Use.</p>
          <p>My work spans model orchestration, retrieval, evaluation, backend services, responsive interfaces, data systems, and deployment. That full-stack perspective helps me build AI experiences that are useful, secure, and production-ready.</p>
          <div className={styles.certStrip}>
            <img src="/aws-ai-practitioner-badge.png" alt="AWS Certified AI Practitioner Foundational" />
            <img src="/databricks-genai-engineer-badge.png" alt="Databricks Certified Generative AI Engineer Associate" />
          </div>
        </Reveal>
        <Reveal className={styles.currentCard} delay={120}>
          <p>Currently</p>
          <h3>Machine Learning Engineer</h3>
          <strong>Endava Solutions India</strong>
          <div className={styles.currentDetails}>
            <span><b>Based in</b> Bangalore, India</span>
            <span><b>Working on</b> Enterprise AI & full-stack systems</span>
            <span><b>Approach</b> Build, measure, improve</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
