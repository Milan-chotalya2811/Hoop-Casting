import Link from 'next/link'
import styles from './page.module.css'
import { Clapperboard, Video, Camera, Mic, Palette, Scissors } from 'lucide-react'

export default function Home() {
  const castMembers = [
    { name: 'Sarah J.', age: 24, role: 'Model', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop' },
    { name: 'David M.', age: 29, role: 'Actor', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop' },
    { name: 'Elena R.', age: 22, role: 'Anchor', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
    { name: 'James L.', age: 31, role: 'Actor', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop' },
    { name: 'Priya K.', age: 26, role: 'Model', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop' },
    { name: 'Michael T.', age: 25, role: 'Voice Over', img: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=600&auto=format&fit=crop' },
  ]

  const categories = [
    { name: 'Actor', icon: <Clapperboard /> },
    { name: 'Model', icon: <Camera /> },
    { name: 'Anchor', icon: <Mic /> },
    { name: 'Videographer', icon: <Video /> },
    { name: 'Makeup Artist', icon: <Palette /> },
    { name: 'Stylist', icon: <Scissors /> },
    { name: 'Art Direction', icon: <Palette /> },
    { name: 'Set Designer', icon: <Clapperboard /> },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent} animate-fade-in`}>
          <h1 className={styles.heroTitle}>Discover the <span className="gold-text">Stars</span> of Tomorrow</h1>
          <p className={styles.heroSubtitle}>CastingNet is the premier platform connecting top production houses with exceptional talent across the globe.</p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/register" className="btn btn-primary">Join Casting Network</Link>
            <Link href="/about" className="btn btn-outline">Learn More</Link>
          </div>

          <div className={styles.counters}>
            <div className={styles.counterItem}>
              <span className={styles.counterNumber}>150+</span>
              <span className={styles.counterLabel}>Successful Castings</span>
            </div>
            <div className={styles.counterItem}>
              <span className={styles.counterNumber}>55+</span>
              <span className={styles.counterLabel}>Brands</span>
            </div>
            <div className={styles.counterItem}>
              <span className={styles.counterNumber}>63+</span>
              <span className={styles.counterLabel}>Productions</span>
            </div>
            <div className={styles.counterItem}>
              <span className={styles.counterNumber}>22+</span>
              <span className={styles.counterLabel}>Projects</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Brief */}
      <section className={`${styles.aboutSection} section`}>
        <div className={`container ${styles.aboutContent}`}>
          <div className={styles.aboutText}>
            <h2>Where Talent Meets Opportunity</h2>
            <p>At CastingNet, we believe every face tells a story. We bridge the gap between aspiring artists and industry giants. Our curated platform ensures that authentic talent finds the right spotlight.</p>
            <Link href="/about" className="btn btn-primary">Read More About Us</Link>
          </div>
          <div className="glass" style={{ height: '300px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Placeholder for About Image/Video */}
            <h3 style={{ color: 'var(--primary)' }}>Showreel / Image Grid</h3>
          </div>
        </div>
      </section>

      {/* Our Cast Slider */}
      <section className={`${styles.castSection} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className="title-gradient">Our Featured Cast</h2>
            <p style={{ color: 'var(--text-muted)' }}>Fresh faces making waves in the industry</p>
          </div>

          <div className={styles.castSlider}>
            {castMembers.map((member, idx) => (
              <div key={idx} className={styles.castCard}>
                <img src={member.img} alt={member.name} className={styles.castImg} />
                <div className={styles.castOverlay}>
                  <div className={styles.castName}>{member.name}</div>
                  <div className={styles.castRole}>{member.role}</div>
                  <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Age: {member.age}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Casting Banner */}
      <section className={styles.bannerSection}>
        <div className={`container ${styles.bannerContent}`}>
          <h2>Ready to be the Next Big Star?</h2>
          <p>Don't wait for opportunity to knock. Build your profile, showcase your portfolio, and get discovered by top directors today.</p>
          <Link href="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }}>Start Your Journey</Link>
        </div>
      </section>

      {/* Categories */}
      <section className="section container">
        <div className={styles.sectionHeader}>
          <h2 style={{ color: 'var(--primary)' }}>Explore Categories</h2>
        </div>
        <div className={styles.grid}>
          {categories.map((cat, idx) => (
            <Link href={`/categories?filter=${cat.name}`} key={idx} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <h3 className={styles.categoryTitle}>{cat.name}</h3>
            </Link>
          ))}
          <Link href="/categories" className={styles.categoryCard} style={{ background: 'var(--surface)' }}>
            <span className={styles.categoryIcon} style={{ visibility: 'hidden' }}>.</span>
            <h3 className={styles.categoryTitle}>View All +</h3>
          </Link>
        </div>
      </section>
    </div>
  )
}
