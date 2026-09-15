import {
  TbBolt,
  TbBrain,
  TbChartHistogram,
  TbDatabaseSearch,
  TbShieldCheck,
  TbStack2,
} from 'react-icons/tb';
import { createElement } from 'react';
import { skillGroups } from '../../data/portfolio';
import styles from './Hero.module.css';

const marqueeItems = [
  ...new Set(skillGroups.flatMap((group) => group.skills)),
];

const expertiseItems = [
  { label: 'AI/ML Engineering', Icon: TbBrain },
  { label: 'Agentic AI Systems', Icon: TbBolt },
  { label: 'Full-Stack Development', Icon: TbStack2 },
  { label: 'RAG Pipelines', Icon: TbDatabaseSearch },
  { label: 'Responsible AI', Icon: TbShieldCheck },
  { label: 'Real-World Impact', Icon: TbChartHistogram },
];

export default function Hero() {
  return (
    <>
      <section className={styles.hero} id="home">
        <div className={styles.heroCopy}>
          <p className={styles.introLine}>Hello, I'm <span aria-hidden="true" /></p>
          <h1>
            <span className={styles.firstName}>Narendra</span>
            <span className={styles.lastName}>Vanapalli</span>
          </h1>
          <p className={styles.roleLine}>Machine Learning Engineer @ Endava</p>
          <p className={styles.lede}>
            I build production-ready AI products that combine RAG, agentic systems,
            and full-stack development to solve complex enterprise challenges with
            reliability, scale, and measurable impact.
          </p>
          <div className={styles.tags} aria-label="Core expertise">
            {expertiseItems.map((item) => (
              <span key={item.label}>{createElement(item.Icon, { 'aria-hidden': true })}{item.label}</span>
            ))}
          </div>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="#projects">Explore my work</a>
            <a className={styles.secondaryButton} href="#contact">Get in touch</a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.portraitStage}>
            <img
              className={styles.portrait}
              src="/hero-editorial-cutout-clean.png"
              alt=""
              width={1391}
              height={1131}
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span className={styles.marqueeItem} key={`${item}-${index}`}>{item}<b>✦</b></span>
          ))}
        </div>
      </div>
    </>
  );
}
