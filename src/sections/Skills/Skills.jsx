import { useState } from 'react';
import { skillGroups } from '../../data/portfolio';
import {
  HiOutlineCircleStack,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCloud,
  HiOutlineCommandLine,
  HiOutlineComputerDesktop,
  HiOutlineCpuChip,
} from 'react-icons/hi2';
import Reveal from '../../components/Reveal/Reveal';
import styles from './Skills.module.css';

const skillIcons = {
  Frontend: HiOutlineComputerDesktop,
  Backend: HiOutlineCommandLine,
  'Data & caching': HiOutlineCircleStack,
  'Cloud & delivery': HiOutlineCloud,
  'AI engineering': HiOutlineCpuChip,
  'Quality & workflow': HiOutlineClipboardDocumentCheck,
};

const groupNames = {
  'Data & caching': 'Data & Caching',
  'Cloud & delivery': 'Cloud & Delivery',
  'AI engineering': 'AI Engineering',
  'Quality & workflow': 'Quality & Workflow',
};

const tileColors = [
  ['#ffc7be', '#ff675d', '#e95650'],
  ['#c0c8ff', '#7892ff', '#5c70d9'],
  ['#fff3ad', '#ffd84d', '#edbc29'],
  ['#efffa8', '#d7ff3f', '#accd30'],
  ['#fffdf7', '#e4eaff', '#bbc7ee'],
  ['#a6caff', '#7892ff', '#5476e6'],
];

const platePath = 'M 134 12 Q 150 3 166 12 L 282 79 Q 297 88 282 97 L 166 164 Q 150 173 134 164 L 18 97 Q 3 88 18 79 Z';

function StackIllustration({ activeGroup }) {
  return (
    <div className={styles.stackArtwork} aria-hidden="true">
      <svg className={styles.stackSvg} viewBox="-80 -25 460 770" fill="none">
        <defs>
          {tileColors.map(([light, color], index) => (
            <linearGradient id={`skills-tile-${index}`} x1="70" y1="10" x2="230" y2="165" gradientUnits="userSpaceOnUse" key={index}>
              <stop stopColor={light} />
              <stop offset="1" stopColor={color} />
            </linearGradient>
          ))}
          <marker id="skills-arrow-tip" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
            <path d="M 2 1 L 10 6 L 2 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        <ellipse cx="150" cy="727" rx="116" ry="15" fill="currentColor" opacity=".06" />
        <g className={styles.connectors} markerEnd="url(#skills-arrow-tip)">
          <path className={activeGroup === 0 ? styles.activeConnector : ''} d="M -7 80 C -33 51 -56 49 -77 65" />
          <path className={activeGroup === 1 ? styles.activeConnector : ''} d="M 307 192 C 340 194 352 139 378 145" />
          <path className={activeGroup === 2 ? styles.activeConnector : ''} d="M -9 301 C -41 283 -60 300 -79 326" />
          <path className={activeGroup === 3 ? styles.activeConnector : ''} d="M 308 409 C 334 450 367 427 353 412 C 333 396 326 451 378 416" />
          <path className={activeGroup === 4 ? styles.activeConnector : ''} d="M -8 518 C -40 529 -65 568 -65 539 C -65 512 -17 532 -77 581" />
          <path className={activeGroup === 5 ? styles.activeConnector : ''} d="M 308 625 C 332 655 356 660 378 647" />
        </g>
        {[...skillGroups].reverse().map((group, reverseIndex) => {
          const index = skillGroups.length - 1 - reverseIndex;
          const Icon = skillIcons[group.title];
          return (
            <g transform={`translate(0 ${index * 108})`} key={group.title}>
              <g className={`${styles.stackLayer} ${activeGroup === index ? styles.activeLayer : ''}`}>
                <path d={platePath} transform="translate(0 15)" fill={tileColors[index][2]} stroke={tileColors[index][2]} strokeWidth="1.5" />
                <path d={platePath} fill={`url(#skills-tile-${index})`} stroke={tileColors[index][1]} strokeWidth="1.5" />
                <path d="M 17 88 L 134 155 Q 150 164 166 155 L 283 88" stroke="white" strokeOpacity=".7" strokeWidth="1.5" />
                <Icon className={styles.layerIcon} x="130" y="66" size={40} />
              </g>
            </g>
          );
        })}
        <g className={styles.stackDoodle}>
          <path d="M 257 10 L 260 -10 M 279 21 L 294 6 M 290 41 L 313 35" />
        </g>
      </svg>
    </div>
  );
}

export default function Skills() {
  const [activeGroup, setActiveGroup] = useState(null);

  return (
    <section className={styles.skillsSection} id="skills" aria-labelledby="skills-heading">
      <div className={styles.sectionInner}>
        <Reveal className={styles.sectionHeader}>
          <div className={styles.headingBlock}>
            <div className={styles.kicker}><span>05</span>Toolbox</div>
            <h2 id="skills-heading">
              Built with a<br />
              <span className={styles.headingAccent}>
                practical stack.
                <svg viewBox="0 0 600 26" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M 4 20 C 140 5 300 9 586 5 L 410 18 C 238 15 112 23 4 20 Z" />
                </svg>
              </span>
            </h2>
          </div>
        </Reveal>
        <div className={styles.skillsLayout}>
          <Reveal className={styles.stackColumn}>
            <StackIllustration activeGroup={activeGroup} />
          </Reveal>
          {skillGroups.map((group, index) => {
            const Icon = skillIcons[group.title];

            return (
              <Reveal
                className={`${styles.skillGroup} ${styles[`group${index}`]}`}
                delay={(index % 2) * 70}
                onMouseEnter={() => setActiveGroup(index)}
                onMouseLeave={() => setActiveGroup(null)}
                role="group"
                aria-labelledby={`skill-category-${index}`}
                key={group.title}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.iconBox} aria-hidden="true"><Icon /></span>
                  <div>
                    <span className={styles.groupNumber}>{String(index + 1).padStart(2, '0')}</span>
                    <h3 id={`skill-category-${index}`}>{groupNames[group.title] || group.title}</h3>
                  </div>
                </div>
                <ul className={styles.skillList}>
                  {group.skills.map((skill) => <li key={skill}>{skill}</li>)}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
