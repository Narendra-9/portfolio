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
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './Skills.module.css';

const skillIcons = {
  Frontend: HiOutlineComputerDesktop,
  Backend: HiOutlineCommandLine,
  'Data & caching': HiOutlineCircleStack,
  'Cloud & delivery': HiOutlineCloud,
  'AI engineering': HiOutlineCpuChip,
  'Quality & workflow': HiOutlineClipboardDocumentCheck,
};

export default function Skills() {
  return (
    <section className={styles.skillsSection} id="skills">
      <SectionHeading number="05" kicker="Toolbox">Built with a <em>practical stack.</em></SectionHeading>
      <div className={styles.skillsGrid}>
        {skillGroups.map((group, index) => {
          const Icon = skillIcons[group.title];

          return (
            <Reveal className={styles.skillGroup} delay={(index % 3) * 45} key={group.title}>
              <div className={styles.titleRow}>
                <span className={styles.iconBox} aria-hidden="true"><Icon /></span>
                <h3>{group.title}</h3>
              </div>
              <div className={styles.skillList}>{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
