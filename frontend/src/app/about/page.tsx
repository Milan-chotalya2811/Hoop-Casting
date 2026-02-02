'use client'

import styles from './about.module.css'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Check, Star, Video, Camera, Users, Target, Zap, Film, Music, Globe, Clapperboard, MonitorPlay } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Animation Variants
// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" as const } }
}

export default function About() {
    const { scrollYProgress } = useScroll();
    const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <div className={styles.aboutPage}>

            {/* --- Hero Section --- */}
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay} />
                <motion.div
                    className={styles.heroContent}
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.h1 variants={fadeInUp} className={styles.heroHeadline}>
                        Hoop Casting <br />
                        <span className={styles.highlightText}>Where Talent Meets the Camera</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className={styles.heroSubline}>
                        "Talent deserves the right platform, not just the right luck."
                    </motion.p>
                    <motion.div variants={fadeInUp}>
                        <Link href="/register" className={styles.glowBtn}>
                            Apply Now <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- Introduction Section --- */}
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.gridSplit}>
                        <motion.div
                            className={styles.introText}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>Real Faces. Real Emotions.</h2>
                            <p className={styles.leadText}>
                                We work closely with production teams and creative projects to cast talent for cinematic and commercial storytelling. From ad films to story-driven projects, our work demands <strong>real faces, real emotions, and real screen presence.</strong>
                            </p>
                            <p className={styles.leadText}>
                                That’s where <strong>Hoop Casting</strong> comes in.
                            </p>
                        </motion.div>
                        <motion.div
                            className={styles.introImageWrapper}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <Image
                                src="/about_hero.png"
                                alt="Filming set"
                                width={600}
                                height={400}
                                className={styles.introImage}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Why We Created Section (Gap Analysis) --- */}
            <section className={`${styles.section} ${styles.darkSection}`}>
                <div className="container">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className={styles.centerContent}
                    >
                        <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Why We Created Hoop Casting</h2>
                        <p className={styles.sectionSubtitle} style={{ color: '#e0e0e0' }}>
                            The industry is full of talent — but opportunities often reach only a few.
                        </p>
                    </motion.div>

                    <div className={styles.gapGrid}>
                        {/* The Gap */}
                        <motion.div
                            className={styles.gapCard}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <h3 className={styles.gapTitle}>We noticed a gap:</h3>
                            <ul className={styles.gapList}>
                                <li>Talented actors and models didn’t know where to apply</li>
                                <li>Casting was either unstructured or unreliable</li>
                                <li>Talent was judged by followers, not performance</li>
                            </ul>
                        </motion.div>

                        {/* The Solution */}
                        <motion.div
                            className={`${styles.gapCard} ${styles.solutionCard}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <h3 className={styles.gapTitle} style={{ color: '#D1AE37' }}>So we built a solution:</h3>
                            <p style={{ fontSize: '1.2rem', color: '#e0e0e0' }}>
                                A professional, transparent casting gateway — where aspiring and experienced talent can be discovered based on <strong>screen suitability</strong>, not social validation.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- What We Do (Services) --- */}
            <section className={styles.section}>
                <div className="container">
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        What We Do
                    </motion.h2>
                    <p className={styles.sectionSubtitle}>Hoop Casting acts as a central talent pool for:</p>

                    <motion.div
                        className={styles.servicesGrid}
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            { icon: Clapperboard, text: "Brand films & Ad campaigns" },
                            { icon: Film, text: "Cinematic Storytelling Projects" },
                            { icon: Music, text: "Music Videos & Original Songs" },
                            { icon: Globe, text: "Digital & Web-based Content" },
                            { icon: MonitorPlay, text: "Long-format & Short-format Films" },
                        ].map((item, i) => (
                            <motion.div key={i} variants={scaleIn} className={styles.serviceCard}>
                                <div className={styles.serviceIconBox}>
                                    <item.icon size={32} color="#D1AE37" />
                                </div>
                                <h3 className={styles.serviceText}>{item.text}</h3>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.p
                        className={styles.highlightQuote}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                    >
                        "Every profile submitted is reviewed with a project-first mindset — matching the right face to the right story."
                    </motion.p>
                </div>
            </section>

            {/* --- Philosophy --- */}
            <section className={`${styles.section} ${styles.philosophySection}`}>
                <div className={styles.philosophyBg} />
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className={styles.philosophyContent}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className={styles.sectionTitle} style={{ color: '#D1AE37', textAlign: 'left' }}>Our Casting Philosophy</h2>
                            <h3 className={styles.philosophyHeadline}>We don’t believe in selling dreams.<br />We believe in building readiness.</h3>

                            <div className={styles.checkGrid}>
                                {['No paid auditions', 'No fake guarantees', 'No influencer bias', 'No shortcuts'].map((text, i) => (
                                    <div key={i} className={styles.checkItem}>
                                        <Check size={24} color="#D1AE37" /> <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className={styles.processBox}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h4 className={styles.processTitle}>Casting happens when:</h4>
                            <ul className={styles.processList}>
                                <li>
                                    <span className={styles.stepNum}>01</span>
                                    <span>A project demands a certain presence</span>
                                </li>
                                <li>
                                    <span className={styles.stepNum}>02</span>
                                    <span>A profile fits the role</span>
                                </li>
                                <li>
                                    <span className={styles.stepNum}>03</span>
                                    <span>Talent is ready for the camera</span>
                                </li>
                            </ul>
                            <div className={styles.tagline}>Simple. Honest. Professional.</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Ecosystem --- */}
            <section className={styles.section}>
                <div className="container">
                    <motion.div
                        className={styles.ecosystemCard}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className={styles.sectionTitle}>Part of a Larger Creative Ecosystem</h2>
                        <p className={styles.leadText}>
                            Hoop Casting collaborates with multiple creative and production teams across industries, formats, and storytelling styles.
                        </p>
                        <p>
                            This means talent onboarded through our platform may get exposure across different types of projects and visual narratives — depending on project requirements.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- Our Promise --- */}
            <section className={`${styles.section} ${styles.blueSection}`}>
                <div className="container">
                    <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Our Promise to Talent</h2>
                    <motion.div
                        className={styles.promiseGrid}
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            "Respect for your craft",
                            "Clear communication",
                            "Ethical casting practices",
                            "Opportunity-based outreach",
                            "A long-term creative vision"
                        ].map((item, i) => (
                            <motion.div key={i} variants={scaleIn} className={styles.promiseCard}>
                                <Star size={30} className={styles.promiseIcon} />
                                <p>{item}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.p
                        style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1.2rem', color: '#e0e0e0' }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        We may not cast everyone immediately — but we treat every profile seriously.
                    </motion.p>
                </div>
            </section>

            {/* --- Final Word --- */}
            <section className={styles.finalWordSection}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className={styles.finalHeadline}>You don’t need to be famous to be cast.</h2>
                        <h3 className={styles.finalSubhead}>You need to be prepared, expressive, and authentic.</h3>

                        <p className={styles.finalText}>
                            If you believe the camera understands you,<br />
                            <strong>Hoop Casting</strong> is where your journey can begin.
                        </p>

                        <div className={styles.ctaWrapper}>
                            <Link href="/register" className={styles.finalBtn}>
                                Apply. Get seen. Be ready.
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    )
}
