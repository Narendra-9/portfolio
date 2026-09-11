'use client';

import { useState } from 'react';
import { HiArrowRight, HiOutlinePhoto } from 'react-icons/hi2';
import { projects } from '../../data/portfolio';
import ProjectDetailsModal from '../../components/ProjectDetailsModal/ProjectDetailsModal';
import Reveal from '../../components/Reveal/Reveal';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './Projects.module.css';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section className={styles.projectsSection} id="projects" aria-labelledby="projects-title">
      <SectionHeading
        number="04"
        kicker="Selected work"
        headingId="projects-title"
        description="A focused collection of AI and full-stack products. Open a project to explore the engineering decisions, architecture, and outcomes behind it."
        dark
      >
        Products with <em>depth.</em>
      </SectionHeading>
      <div className={styles.projectList}>
        {[...projects].sort((first, second) => first.number.localeCompare(second.number)).map((project, index) => (
          <Reveal className={`${styles.projectCard} ${styles[project.tone]}`} delay={(index % 3) * 45} key={project.title}>
            <article>
              <div className={styles.projectVisual}>
                {project.image ? (
                  <img src={project.image} alt={project.imageAlt || `${project.title} project preview`} style={project.imagePosition ? { objectPosition: project.imagePosition } : undefined} />
                ) : (
                  <div className={styles.visualPlaceholder}>
                    <HiOutlinePhoto aria-hidden="true" />
                    <span>Visual coming later</span>
                  </div>
                )}
              </div>
              <div className={styles.projectContent}>
                <div className={styles.projectMeta}>
                  <span>{project.number}</span>
                </div>
                <p className={styles.projectType}>{project.subtitle}</p>
                <h3>{project.title}</h3>
                <p className={styles.projectSummary}>{project.summary}</p>
                <button className={styles.detailsButton} type="button" onClick={() => setSelectedProject(project)}>
                  View details <HiArrowRight aria-hidden="true" />
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      {selectedProject && <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}
