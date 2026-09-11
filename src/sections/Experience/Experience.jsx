import Reveal from '../../components/Reveal/Reveal';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './Experience.module.css';

const experiencePoints = [
  {
    lead: 'Advanced from Associate Developer to Junior ML Engineer to Machine Learning Engineer within two years,',
    detail: 'earning broader ownership across solution design, AI engineering, full-stack delivery, performance optimization, and production releases.',
  },
  {
    lead: 'Owned the AI Companion as the sole engineer,',
    detail: 'translating business requirements into a production-ready React and FastAPI product with RAG, multi-agent orchestration, natural-language analytics, memory, tool integration, evaluations, and Redis caching; deployed the AI services on AWS and reduced repeated-request latency by approximately 80%.',
  },
  {
    lead: 'Delivered Product Match AI independently as the sole engineer,',
    detail: 'building the complete React, FastAPI, PostgreSQL, and pgvector solution with a multi-stage pipeline for filtering, retrieval, reranking, LLM-assisted validation, and explainable results, reducing analyst research time by approximately 50%.',
  },
  {
    lead: 'Built and internally delivered Endava Talent Sphere,',
    detail: 'a full-stack employee-management and workforce-insights platform using React, Spring WebFlux, PostgreSQL, and Caffeine caching; optimized queries, indexing, asynchronous processing, and connection management to reduce response latency by 87%, from 3 seconds to 400 milliseconds.',
  },
  {
    lead: 'Developed the Automated Regression Validator,',
    detail: 'a React, FastAPI, and MongoDB platform that compares new, resolved, and recurring issues at scale. Built an AI-assisted interface that translates natural-language prompts into configurable data-quality rules, enabling large-scale automated validation workflows.',
  },
  {
    lead: 'Contributed across the complete Agile software-delivery lifecycle,',
    detail: 'including requirement refinement, technical design, sprint planning, daily stand-ups, end-to-end implementation, peer code reviews, debugging, integration testing, release coordination, and collaboration with engineers, product stakeholders, and designers.',
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
            <div className={styles.roleTop}><span>Current</span><p>International Technology Park, Bangalore</p></div>
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
          <div className={styles.timelineDate}>Oct 2023 to Feb 2024</div>
          <div className={styles.timelineContent}>
            <div className={styles.roleTop}><span>Internship</span><p>Bangalore, India</p></div>
            <h3>Software Engineering Intern</h3>
            <h4>GalaxE Solutions, Inc.</h4>
            <ul className={`${styles.impactList} ${styles.internshipList}`}>
              <li>
                <span className={styles.pointNumber}>01</span>
                <p><strong>Completed hands-on full-stack engineering training</strong> across Java, Spring Boot, ReactJS, PostgreSQL, Git, REST APIs, testing, and collaborative development practices.</p>
              </li>
              <li>
                <span className={styles.pointNumber}>02</span>
                <p><strong>Independently delivered a complete e-commerce application without AI-generated code</strong> with responsive product experiences, backend workflows, role-based administration, real-time notifications, and relational database design.</p>
              </li>
            </ul>
            <div className={styles.topPerformer}>★ Top performer among 80+ trainees</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
