'use client';

import { useEffect, useState } from 'react';
import { TbBriefcase, TbBulb, TbFolder, TbHome, TbMail, TbTools, TbUser } from 'react-icons/tb';
import styles from './Nav.module.css';

const navItems = [
  { id: 'home', label: 'Home', icon: TbHome },
  { id: 'about', label: 'About', icon: TbUser },
  { id: 'expertise', label: 'Expertise', icon: TbBulb },
  { id: 'experience', label: 'Experience', icon: TbBriefcase },
  { id: 'projects', label: 'Projects', icon: TbFolder },
  { id: 'skills', label: 'Skills', icon: TbTools },
  { id: 'contact', label: 'Contact', icon: TbMail },
];

export default function Nav() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveSection = () => {
      const marker = window.scrollY + Math.min(window.innerHeight * 0.34, 320);
      let currentSection = 'home';

      for (const item of navItems) {
        const section = document.getElementById(item.id);
        if (section && section.offsetTop <= marker) currentSection = item.id;
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        currentSection = 'contact';
      }

      setActiveSection((current) => current === currentSection ? current : currentSection);
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-label={item.label}
          data-tooltip={item.label}
          aria-current={activeSection === item.id ? 'location' : undefined}
          onClick={() => setActiveSection(item.id)}
        >
          <item.icon aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
