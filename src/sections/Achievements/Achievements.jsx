'use client';

import { useEffect, useRef, useState } from 'react';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import { TbAward } from 'react-icons/tb';
import { achievements } from '../../data/portfolio';
import AchievementDetailsModal from '../../components/AchievementDetailsModal/AchievementDetailsModal';
import styles from './Achievements.module.css';

const filters = ['All', 'Hackathons', 'Certifications', 'Academics', 'Professional'];

export default function Achievements() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [canScroll, setCanScroll] = useState(false);
  const sliderRef = useRef(null);
  const visibleAchievements = activeFilter === 'All'
    ? achievements
    : achievements.filter((achievement) => achievement.category === activeFilter);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;
    const update = () => setCanScroll(slider.scrollWidth > slider.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(slider);
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [activeFilter]);

  const changeFilter = (filter) => {
    setActiveFilter(filter);
    sliderRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const scrollSlider = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.scrollBy({ left: direction * Math.max(slider.clientWidth * .72, 320), behavior: 'smooth' });
  };

  return (
    <section className={styles.achievementsSection} id="achievements" aria-labelledby="recognition-title">
      <div className={styles.hero}>
        <div className={styles.headingBlock}>
          <div className={styles.kicker}><span>07</span> Recognition</div>
          <h2 id="recognition-title">Learning.<br />Building.<br /><em>Winning.</em></h2>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <p>A collection of milestones<br />that shaped my journey.</p>
          <img src="/recognition-trophy.png" alt="" />
          <span>More to come...</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters} aria-label="Filter recognition cards">
          {filters.map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? styles.activeFilter : ''}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => changeFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        {canScroll && <div className={styles.arrows}>
          <button type="button" onClick={() => scrollSlider(-1)} aria-label="Show previous recognition cards"><HiArrowLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => scrollSlider(1)} aria-label="Show next recognition cards"><HiArrowRight aria-hidden="true" /></button>
        </div>}
      </div>

      <div className={styles.achievementGrid} ref={sliderRef}>
        {visibleAchievements.map((achievement) => (
          <button
            className={styles.achievementCard}
            type="button"
            key={achievement.mark}
            onClick={() => setSelectedAchievement(achievement)}
            aria-label={`View details for ${achievement.title}`}
          >
            <div className={styles.cardVisual}>
              <span className={styles.cardNumber}>{achievement.mark}</span>
              {achievement.image
                ? <img src={achievement.image} alt="" loading="lazy" />
                : <TbAward className={styles.fallbackIcon} aria-hidden="true" />}
            </div>
            <div className={styles.cardCopy}>
              <span className={styles.cardCategory}>{achievement.category === 'Hackathons' ? 'Hackathon' : achievement.category === 'Certifications' ? 'Certification' : achievement.category}</span>
              <h3>{achievement.title}</h3>
              <p>{achievement.text}</p>
              <span className={styles.cardFooter}><span>View details</span><HiArrowRight aria-hidden="true" /></span>
            </div>
          </button>
        ))}
      </div>

      {selectedAchievement && (
        <AchievementDetailsModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}
    </section>
  );
}
