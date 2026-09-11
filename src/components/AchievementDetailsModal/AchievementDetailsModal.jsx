'use client';

import { useEffect, useRef } from 'react';
import { HiXMark } from 'react-icons/hi2';
import styles from './AchievementDetailsModal.module.css';

export default function AchievementDetailsModal({ achievement, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <span className={styles.achievementNumber}>{achievement.mark}</span>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close achievement details"
          >
            <HiXMark aria-hidden="true" />
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={`${styles.imageFrame} ${styles[achievement.fit]}`}>
            <img src={achievement.image} alt={achievement.imageAlt} />
          </div>

          <div className={styles.achievementCopy}>
            <span className={styles.eyebrow}>Achievement highlight</span>
            <h3 id="achievement-modal-title">{achievement.title}</h3>
            <strong>{achievement.detailTitle}</strong>
            <p>{achievement.detail}</p>
            <div className={styles.summaryBox}>
              <span>Summary</span>
              <p>{achievement.text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
