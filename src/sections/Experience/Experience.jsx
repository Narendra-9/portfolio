import Reveal from '../../components/Reveal/Reveal';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './Experience.module.css';

const experiencePoints = [
  {
    lead: 'Delivered six enterprise AI and full-stack initiatives',
    detail: 'across healthcare, analytics, grant compliance, and workforce intelligence, contributing across solution design, development, testing, and deployment.',
  },
  {
    lead: 'Engineered Generative AI and agentic AI solutions',
    detail: 'using RAG, multi-agent orchestration, MCP integrations, and LLM-powered workflows for document intelligence, natural-language analytics, and automated decision support.',
  },
  {
    lead: 'Developed scalable microservices and full-stack applications',
    detail: 'with Python, FastAPI, Java Spring Boot/WebFlux, React.js, and PostgreSQL, incorporating asynchronous processing, API integrations, and performance optimisation.',
  },
  {
    lead: 'Implemented AI evaluation and reliability frameworks',
    detail: 'using gold-standard datasets, retrieval metrics, citation validation, guardrails, and human-in-the-loop review to improve output quality and explainability.',
  },
  {
    lead: 'Supported AWS and Google Cloud deployments',
    detail: 'using Docker, Kubernetes, CI/CD, and infrastructure automation to deliver secure, scalable cloud-native applications.',
  },
  {
    lead: 'Collaborated closely with engineering, QA, product, and business stakeholders',
    detail: 'through Agile ceremonies, technical reviews, debugging, demonstrations, and release coordination to deliver solutions aligned with business requirements.',
  },
];

export default function Experience() {
  return (
    <section className={styles.experienceSection} id="experience">
      <SectionHeading number="03" kicker="Experience">A fast-moving <em>engineering journey.</em></SectionHeading>
      <div className={styles.timeline}>
        <Reveal className={styles.timelineItem}>
          <div className={styles.timelineDate}>Aug 2024 to Present</div>
          <div className={styles.timelineContent}>
            <div className={styles.roleTop}><span>Current</span><p>Bengaluru, India</p></div>
            <h3>Machine Learning Engineer</h3>
            <h4>Endava Solutions India Private Limited</h4>
            <div className={styles.progression}>Associate Developer <b>→</b> Junior ML Engineer <b>→</b> Machine Learning Engineer</div>
            <ul className={styles.impactList}>
              {experiencePoints.map((point, index) => (
                <li key={point.lead}>
                  <span className={styles.pointNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <p><strong>{point.lead}</strong> {point.detail}</p>
                </li>
              ))}
            </ul>
            <div className={styles.achievementBadges} aria-label="Innovation achievements">
              <span>★ Top Codex Hackathon submission · 52 teams · 232 participants</span>
              <span>★ 2nd place · Endava AI Days 2025</span>
            </div>
          </div>
        </Reveal>

        <Reveal className={styles.timelineItem}>
          <div className={styles.timelineDate}>Feb 2024 to Apr 2024</div>
          <div className={styles.timelineContent}>
            <div className={styles.roleTop}><span>Internship</span><p>Bengaluru, India</p></div>
            <h3>Software Engineering Intern</h3>
            <h4>GalaxE Solutions, Inc.</h4>
            <ul className={`${styles.impactList} ${styles.internshipList}`}>
              <li>
                <span className={styles.pointNumber}>01</span>
                <p><strong>Independently engineered a full-stack e-commerce platform</strong> using Java Spring Boot, React.js, and SQL databases, implementing six-plus workflows across product discovery, inventory management, checkout, order fulfilment, payments, and delivery tracking.</p>
              </li>
              <li>
                <span className={styles.pointNumber}>02</span>
                <p><strong>Developed RESTful APIs and modular backend services</strong> with JWT authentication, role-based access control, and WebSocket-based real-time updates, enabling secure transactions and live order-status tracking.</p>
              </li>
            </ul>
            <div className={styles.topPerformer}>★ Top performer among 80+ trainees</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
