'use client';

import { useEffect, useRef } from 'react';
import { HiArrowUpRight, HiOutlinePhoto, HiXMark } from 'react-icons/hi2';
import styles from './ProjectDetailsModal.module.css';

export default function ProjectDetailsModal({ project, onClose }) {
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
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="project-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className={styles.modalHeader}>
          <span className={styles.projectIndex}>{project.number}</span>
          <button ref={closeButtonRef} className={styles.closeButton} type="button" onClick={onClose} aria-label="Close project details">
            <HiXMark aria-hidden="true" />
          </button>
        </header>

        <div className={styles.modalScroll}>
          <div className={styles.projectVisual}>
            {project.image ? (
              <img src={project.image} alt={project.imageAlt || `${project.title} project preview`} style={project.imagePosition ? { objectPosition: project.imagePosition } : undefined} />
            ) : (
              <div className={styles.visualPlaceholder}>
                <HiOutlinePhoto aria-hidden="true" />
                <span>Project visual reserved</span>
              </div>
            )}
          </div>

          <div className={styles.modalBody}>
            <p className={styles.projectType}>{project.subtitle}</p>
            <h3 id="project-modal-title">{project.title}</h3>
            <p className={styles.summary}>{project.summary}</p>

            <div className={styles.detailGrid}>
              <section>
                <h4>Engineering highlights</h4>
                <ul>{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
              </section>
              <aside>
                <h4>Technology</h4>
                <div className={styles.stack}>{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
                {(project.link || project.live) && (
                  <div className={styles.actions}>
                    {project.link && <a href={project.link} target="_blank" rel="noreferrer">Git repository <HiArrowUpRight aria-hidden="true" /></a>}
                    {project.live && <a href={project.live} target="_blank" rel="noreferrer">Live project <HiArrowUpRight aria-hidden="true" /></a>}
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
