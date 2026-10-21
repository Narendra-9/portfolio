import { createElement, useEffect, useRef, useState } from 'react';
import {
  TbBulb,
  TbCode,
  TbGitMerge,
  TbCloudUpload,
  TbTrendingUp,
} from 'react-icons/tb';
import styles from './ValueJourney.module.css';

const steps = [
  { title: 'Idea', description: 'Understand the need, the people it affects, and what success should look like.', Icon: TbBulb },
  { title: 'Build', description: 'Turn the concept into an AI-enabled product built on strong engineering foundations.', Icon: TbCode },
  { title: 'Integrate', description: 'Bring data, intelligence, and existing systems together with security and clarity.', Icon: TbGitMerge },
  { title: 'Deploy', description: 'Deliver a dependable product through scalable architecture and disciplined releases.', Icon: TbCloudUpload },
  { title: 'Impact', description: 'Measure real-world performance and keep improving quality, trust, and business value.', Icon: TbTrendingUp },
];

const route = 'M 120 100 C 340 100 880 150 880 275 C 880 390 120 330 120 450 C 120 565 880 510 880 625 C 880 750 340 800 120 800';

export default function ValueJourney() {
  const [progress, setProgress] = useState(0);
  const routeRef = useRef(null);

  useEffect(() => {
    const routeElement = routeRef.current;
    if (!routeElement) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        setProgress(1);
        return;
      }

      const bounds = routeElement.getBoundingClientRect();
      const compact = window.matchMedia('(max-width: 1100px)').matches;
      const firstStep = bounds.top + bounds.height * (compact ? 0.08 : 1 / 9);
      const lastStep = bounds.top + bounds.height * (compact ? 0.92 : 8 / 9);
      const marker = window.innerHeight * 0.62;
      const next = Math.max(0, Math.min(1, (marker - firstStep) / (lastStep - firstStep)));
      setProgress(Math.round(next * 1000) / 1000);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <section className={styles.section} id="process" aria-labelledby="process-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}><span aria-hidden="true">✦</span> How I create value</div>
          <h2 id="process-title">From idea to <span>impact.</span></h2>
          <p>Every useful AI product needs more than a model. I carry the work from the first question through delivery and measurable outcomes.</p>
        </div>

        <div className={styles.route} ref={routeRef} style={{ '--progress': progress }}>
          <svg className={styles.road} viewBox="0 0 1000 900" preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.roadEdge} d={route} />
            <path className={styles.roadSurface} d={route} />
            <path className={styles.roadDashes} d={route} />
            <path
              className={styles.routeProgress}
              d={route}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
            />
          </svg>
          {steps.map(({ title, description, Icon }, index) => (
            <div
              className={`${styles.step} ${index % 2 ? styles.right : styles.left} ${progress >= index / (steps.length - 1) ? styles.active : ''}`}
              key={title}
              style={{ '--step-index': index }}
            >
              <div className={styles.icon} aria-hidden="true">{createElement(Icon)}</div>
              <div className={styles.stepCopy}>
                <span className={styles.stepNumber}>0{index + 1} / 05</span>
                <h3>{title}</h3>
                <p className={styles.stepDetail}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
