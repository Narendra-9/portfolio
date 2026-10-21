import { FaLinkedinIn } from 'react-icons/fa6';
import { HiArrowUpRight } from 'react-icons/hi2';
import Reveal from '../../components/Reveal/Reveal';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import styles from './Posts.module.css';

const posts = [
  '7506407437516816387',
  '7496314712205393921',
  '7344276246052159488',
];

export default function Posts() {
  return (
    <section className={styles.postsSection} id="posts" aria-labelledby="posts-title">
      <SectionHeading
        number="07"
        kicker="On LinkedIn"
        headingId="posts-title"
        description="A few selected posts from what I have been building and sharing. Explore them here, or open the conversation on LinkedIn."
        dark
      >
        From the <em>build log.</em>
      </SectionHeading>

      <div className={styles.postGrid}>
        {posts.map((postId, index) => (
          <Reveal className={styles.postCard} delay={index * 70} key={postId}>
            <div className={styles.postHeader}>
              <span className={styles.postNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.postSource}><FaLinkedinIn aria-hidden="true" /> LinkedIn post</span>
            </div>
            <iframe
              className={styles.postEmbed}
              src={`https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:${postId}?collapsed=1`}
              title={`Selected LinkedIn post ${index + 1} by Narendra Vanapalli`}
              height={628}
              loading="lazy"
              allowFullScreen
            />
            <a
              className={styles.postLink}
              href={`https://www.linkedin.com/feed/update/urn:li:ugcPost:${postId}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on LinkedIn <HiArrowUpRight aria-hidden="true" />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
