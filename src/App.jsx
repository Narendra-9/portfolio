import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import About from './sections/About/About';
import Achievements from './sections/Achievements/Achievements';
import Contact from './sections/Contact/Contact';
import Experience from './sections/Experience/Experience';
import Expertise from './sections/Expertise/Expertise';
import Projects from './sections/Projects/Projects';
import Skills from './sections/Skills/Skills';
import styles from './App.module.css';

export default function Home() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <Header />
      <div id="main-content">
        <Hero />
        <About />
        <Expertise />
        <Experience />
        <Projects />
        <Skills />
        <Achievements />
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
