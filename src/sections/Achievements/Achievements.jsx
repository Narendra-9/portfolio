'use client';

import { useState } from 'react';
import { HiArrowUpRight } from 'react-icons/hi2';
import { achievements } from '../../data/portfolio';
import AchievementDetailsModal from '../../components/AchievementDetailsModal/AchievementDetailsModal';
import Reveal from '../../components/Reveal/Reveal';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './Achievements.module.css';

export default function Achievements() {
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  return (
    <section className={styles.achievementsSection} id="achievements">
      <SectionHeading number="06" kicker="Recognition">Learning. Building. <em>Winning.</em></SectionHeading>
      <div className={styles.achievementGrid}>
        {achievements.map((achievement, index) => (
          <Reveal className={styles.achievementCard} delay={index * 70} key={achievement.title}>
            <button
              className={styles.cardButton}
              type="button"
              onClick={() => setSelectedAchievement(achievement)}
              aria-label={`View details for ${achievement.title}`}
            >
              <div className={styles.cardFront}>
                <span className={styles.cardNumber}>{achievement.mark}</span>
                <h3>{achievement.title}</h3>
                <p>{achievement.text}</p>
                <span className={styles.viewHint}>View details <HiArrowUpRight aria-hidden="true" /></span>
              </div>
              <div className={`${styles.imageLayer} ${styles[achievement.fit]}`} aria-hidden="true">
                <img src={achievement.image} alt="" />
                <div className={styles.imageCaption}>
                  <strong>{achievement.detailTitle}</strong>
                  <p>{achievement.detail}</p>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {selectedAchievement && (
        <AchievementDetailsModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </section>
  );
}
