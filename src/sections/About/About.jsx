import Reveal from '../../components/Reveal/Reveal';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './About.module.css';

export default function About() {
  return (
    <section className={styles.about} id="about">
      <SectionHeading number="01" kicker="Who I am">Engineering across the <em>whole stack.</em></SectionHeading>
      <div className={styles.aboutGrid}>
        <Reveal className={styles.aboutCopy}>
          <p className={styles.aboutBody}>My work sits at the intersection of <strong>artificial intelligence</strong>, <strong>software engineering</strong>, and <strong>product development</strong>. I'm interested in the challenges that make AI useful in the real world: <strong>grounding models in reliable information</strong>, <strong>evaluating their behavior</strong>, <strong>designing secure systems</strong>, and <strong>creating interfaces people can use with confidence</strong>.</p>
          <p className={styles.aboutBody}>With experience across <strong>retrieval</strong>, <strong>backend services</strong>, <strong>data systems</strong>, <strong>evaluation</strong>, and <strong>deployment</strong>, I approach AI as an <strong>end-to-end engineering discipline</strong>, not just a model or a prototype. I care about turning complex technical capabilities into <strong>dependable products</strong> that solve meaningful problems.</p>
          <div className={styles.certStrip}>
            <img src="/aws-ai-practitioner-badge.png" alt="AWS Certified AI Practitioner Foundational" />
            <img src="/aws-solutions-architect-associate-badge.png" alt="AWS Certified Solutions Architect Associate" />
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
