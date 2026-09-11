import { expertise } from '../../data/portfolio';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineCircleStack,
  HiOutlineCodeBracketSquare,
  HiOutlineCpuChip,
  HiOutlineRocketLaunch,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import Reveal from '../../components/Reveal/Reveal';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './Expertise.module.css';

const expertiseIcons = {
  llm: HiOutlineChatBubbleLeftRight,
  agents: HiOutlineCpuChip,
  rag: HiOutlineCircleStack,
  safety: HiOutlineShieldCheck,
  mlops: HiOutlineRocketLaunch,
  fullstack: HiOutlineCodeBracketSquare,
};

export default function Expertise() {
  return (
    <section className={styles.expertiseSection} id="expertise" aria-labelledby="expertise-title">
      <SectionHeading number="02" kicker="Core expertise" headingId="expertise-title">From intelligence to <em>production.</em></SectionHeading>
      <div className={styles.expertiseGrid}>
        {expertise.map((item, index) => {
          const Icon = expertiseIcons[item.icon];

          return (
            <Reveal className={styles.expertiseCard} delay={(index % 3) * 45} key={item.title}>
              <div className={styles.cardIcon} aria-hidden="true"><Icon /></div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
