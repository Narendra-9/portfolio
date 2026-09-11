import { FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { HiArrowDownTray, HiArrowUpRight, HiOutlineEnvelope } from 'react-icons/hi2';
import Reveal from '../../components/Reveal/Reveal';
import styles from './Contact.module.css';

export default function Contact() {
  return (
    <section className={styles.contactSection} id="contact">
      <div className={styles.contactCopy}>
        <Reveal>
          <div className={styles.sectionKicker}><span>07</span> Get in touch</div>
          <h2>Have a hard problem?<br /><em>Let’s build.</em></h2>
          <p>I enjoy conversations about production AI, intelligent products, and the engineering decisions that make them reliable at scale.</p>
        </Reveal>
      </div>

      <Reveal className={styles.contactCard} delay={100}>
        <div className={styles.cardIntro}>
          <p>Start a conversation</p>
          <span>Choose where you’d like to connect.</span>
        </div>

        <div className={styles.contactLinks}>
          <a href="https://www.linkedin.com/in/narendra-vanapalli-853b15256/" target="_blank" rel="noreferrer">
            <span className={styles.linkIcon}><FaLinkedinIn aria-hidden="true" /></span>
            <span className={styles.linkCopy}><strong>LinkedIn</strong><small>Professional profile</small></span>
            <HiArrowUpRight className={styles.linkArrow} aria-hidden="true" />
          </a>

          <a href="https://github.com/Narendra-9" target="_blank" rel="noreferrer">
            <span className={styles.linkIcon}><FaGithub aria-hidden="true" /></span>
            <span className={styles.linkCopy}><strong>GitHub</strong><small>Narendra-9</small></span>
            <HiArrowUpRight className={styles.linkArrow} aria-hidden="true" />
          </a>

          <a href="mailto:sivanarendravanapalli@gmail.com">
            <span className={styles.linkIcon}><HiOutlineEnvelope aria-hidden="true" /></span>
            <span className={styles.linkCopy}><strong>Email</strong><small>Start a conversation</small></span>
            <HiArrowUpRight className={styles.linkArrow} aria-hidden="true" />
          </a>

          <a href="/Narendra_Vanapalli_Resume.pdf" download>
            <span className={styles.linkIcon}><HiArrowDownTray aria-hidden="true" /></span>
            <span className={styles.linkCopy}><strong>Resume</strong><small>Download PDF</small></span>
            <HiArrowDownTray className={styles.linkArrow} aria-hidden="true" />
          </a>

          <a className={styles.instagramLink} href="https://www.instagram.com/narendra_vanapalli/" target="_blank" rel="noreferrer">
            <span className={styles.linkIcon}><FaInstagram aria-hidden="true" /></span>
            <span className={styles.linkCopy}><strong>Instagram</strong><small>@narendra_vanapalli</small></span>
            <HiArrowUpRight className={styles.linkArrow} aria-hidden="true" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
