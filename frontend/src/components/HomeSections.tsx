'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Play, Star, Film, MonitorPlay, Users, Camera, Clapperboard, CheckCircle, Video, UserCheck, Heart, ArrowRight, ShieldCheck, Mail, Sparkles, TrendingUp, Globe, Mic } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HomeSections.module.css';

// --- Shared Components ---

const FadeIn = ({ children, delay = 0, className = "", style }: { children: React.ReactNode, delay?: number, className?: string, style?: React.CSSProperties }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        className={`${styles.fadeIn} ${className}`}
        style={style}
    >
        {children}
    </motion.div>
);

const SectionTitle = ({ title, subtitle, align = "center" }: { title: string, subtitle?: string, align?: "left" | "center" | "right" }) => (
    <div className={`${styles.sectionTitle} ${align === "left" ? styles.alignLeft : align === "right" ? styles.alignRight : ""}`}>
        {subtitle && (
            <FadeIn>
                <span className={styles.subtitle}>
                    {subtitle}
                </span>
            </FadeIn>
        )}
        <FadeIn delay={0.2}>
            <h2 className={styles.title}>
                {title}
            </h2>
        </FadeIn>
    </div>
);

// --- Sections ---

export const HeroSection = () => {
    const [currentLine, setCurrentLine] = useState(0);
    const lines = [
        "If you believe your story has dum",
        "If you believe your face can carry emotion",
        "If you believe you were meant for the camera —"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentLine((prev) => (prev < lines.length ? prev + 1 : prev));
        }, 2000);
        return () => clearInterval(timer);
    }, [lines.length]);

    return (
        <section className={styles.heroSection}>
            {/* Background - Cinematic Image + Overlay */}
            <div className={styles.bgOverlay}>
                <Image
                    src="/hero_bg_outdoor.png"
                    alt="Cinematic Camera"
                    fill
                    className={styles.heroImage}
                    priority
                />
            </div>
            <div className={styles.grainOverlay}></div>

            <div className={styles.heroContent}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="mb-8"
                >
                    <h1 className={styles.heroHeadline}>
                        “Keval screen <br />
                        dekhna hai?<br />
                        <br /> {/* Added space for visual separation */}
                        Ya screen par <br />
                        aana hai?”
                    </h1>
                </motion.div>

                <div className={styles.scrollingTextContainer}>
                    <AnimatePresence mode="wait">
                        {currentLine < lines.length ? (
                            <motion.p
                                key={currentLine}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                                className={styles.scrollingText}
                            >
                                {lines[currentLine]}
                            </motion.p>
                        ) : (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                style={{ position: 'absolute', width: '100%', top: '50%', transform: 'translateY(-50%)' }}
                            >
                                <p className={styles.welcomeText}>
                                    Welcome to Hoop Casting.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3, duration: 1 }} /* Delay adjusted since lines logic changed */
                    className={styles.heroFooter}
                >
                    <div className={styles.disclaimer}>
                        <span>Not a talent hunt</span>
                        <span className={styles.highlightText}>•</span>
                        <span>Not a random audition</span>
                        <span className={styles.highlightText}>•</span>
                        <span>This is a casting gateway</span>
                    </div>

                    <Link href="/profile/edit" className={styles.primaryBtn}>
                        <span style={{ marginRight: '0.5rem' }}>Apply for Hoop Casting</span>
                        <Play size={20} fill="currentColor" />
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={styles.heroScrollIndicator}
            >
                <div className={styles.scrollLine}></div>
            </motion.div>
        </section>
    );
};

export const WhatIsHoopCasting = () => {
    return (
        <section className={styles.whatWeDoSection} style={{ padding: '6rem 0' }}>
            <div className={styles.container}>
                <div className={styles.gridSplit}>
                    <div className={styles.visualAbstract}>
                        <Image
                            src="/monkey_studio_intro.png"
                            alt="Film Shooting Set"
                            fill
                            className={styles.imageCover}
                        />
                        <div className={styles.abstractCaption}>
                            <p className={styles.abstractText}>We cast people,<br />not profiles.</p>
                        </div>
                    </div>

                    <div>
                        <SectionTitle title="Not Just Another Casting Platform." subtitle="Who We Are" align="left" />

                        <FadeIn delay={0.2} className="">
                            <p style={{ fontSize: '1.25rem', color: 'black', lineHeight: 1.6, marginBottom: '2rem' }}>
                                Hoop Casting is an open casting platform for: <span style={{ color: 'black', fontWeight: 800 }}>Actors, Models, Performers, Fresh faces</span>, and Real people with real presence.
                            </p>

                            <ul className={styles.listGroup}>
                                {["Talent is not judged by followers.", "Recognized by expression.", "Valued for authenticity.", "Chosen for screen presence."].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className={styles.listItem}
                                    >
                                        <div className={styles.dot} />
                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const WhyDifferent = () => {
    const cards = [
        { icon: Film, title: "Cinematic Films", desc: "Feature length & short films" },
        { icon: Mic, title: "Brand Stories", desc: "Narratives that sell emotion" },
        { icon: Sparkles, title: "Music Videos", desc: "Visual storytelling for sound" },
        { icon: MonitorPlay, title: "Web Series", desc: "Digital narratives & episodic" },
        { icon: Globe, title: "Campaigns", desc: "High-impact commercial ads" },
        { icon: Heart, title: "Social Impact", desc: "Stories that matter" },
    ];

    return (
        <section className={styles.whyDifferentSection}>
            <div className={styles.container}>
                <SectionTitle title="Cinema-Grade Storytelling." subtitle="Why Us" />

                <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 4rem', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '1.125rem' }}>This is not casting for ads alone. This is where your journey doesn't end at one shoot—it begins with visibility.</p>
                </div>

                <div className={styles.cardsGrid}>
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={styles.card}
                        >
                            <card.icon size={40} className={styles.highlightText} style={{ marginBottom: '1.5rem' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1F2B5C' }}>{card.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{card.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const WhoCanApply = () => {
    const checklist = [
        "An aspiring or professional actor",
        "A model with strong screen presence",
        "A performer who can express emotion naturally",
        "A creator transitioning into cinema",
        "Someone with a unique look, voice, or story",
        "A first-timer who believes “mere andar dum hai”"
    ];

    return (
        <section className={styles.whoCanApplySection}>
            <div className={styles.container}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>

                    <div className="order-2 md:order-1">
                        <SectionTitle title="No Barriers. Just Talent." subtitle="Who Can Apply" align="left" />
                        <div className={styles.checklist}>
                            {checklist.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={styles.checkItem}
                                >
                                    <CheckCircle size={24} className={styles.highlightText} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                                    <span style={{ fontSize: '1.125rem', color: 'var(--text-main)' }}>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className={styles.whoCanImageContainer}>
                            <Image
                                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?bf=85&w=800&auto=format&fit=crop"
                                alt="Diverse Talent"
                                fill
                                className={styles.whoCanImage}
                            />
                            {/* Moving box to top (upar) and adding padding */}
                            <div className={styles.highlightBox} style={{
                                position: 'absolute',
                                top: '2rem',
                                left: '2rem',
                                right: '2rem',
                                padding: '2rem',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(10px)',
                                color: 'black',
                                borderRadius: '12px'
                            }}>
                                <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem', color: '#1F2B5C' }}>Talent is Universal</h3>
                                <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>Age, language, city, background — no barriers.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export const WhatWeLookFor = () => {
    const attributes = [
        { icon: UserCheck, label: "Expressive Face" },
        { icon: Heart, label: "Emotional Depth" },
        { icon: Camera, label: "Confidence" },
        { icon: Star, label: "Natural Performance" },
        { icon: Sparkles, label: "Originality" },
        { icon: TrendingUp, label: "Hunger to Grow" },
    ];

    return (
        <section className={styles.whatWeLookForSection}>
            <div className={styles.container}>
                <SectionTitle title="Presence Over Perfection." subtitle="What We Look For" />

                <div className={styles.attributesGrid}>
                    {attributes.map((attr, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={styles.attributeItem}
                        >
                            <div className={styles.iconCircle}>
                                <attr.icon size={32} />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '1rem' }}>{attr.label}</span>
                        </motion.div>
                    ))}
                </div>

                <FadeIn delay={0.5}>
                    <blockquote className={styles.quote}>
                        "Sometimes, the most powerful performers are the ones never discovered yet."
                    </blockquote>
                </FadeIn>
            </div>
        </section>
    );
};

export const CastingProcess = () => {
    const steps = [
        { title: "Submit Profile", desc: "Basic details, photos, and intro video." },
        { title: "Talent Evaluation", desc: "Reviewed by creative team for cinematic suitability." },
        { title: "Shortlisting", desc: "Selected profiles added to Hoop Casting Talent Pool." },
        { title: "Opportunities", desc: "We connect directly when a project matches." },
    ];

    return (
        <section className={styles.castingProcessSection}>
            <div className={styles.container}>
                <SectionTitle title="The Casting Process" subtitle="How It Works" />

                <div className={styles.timeline}>
                    {/* Line */}
                    <div className={styles.timelineLine}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ margin: "-100px" }}
                                className={`${styles.stepRow} ${idx % 2 === 0 ? styles.stepRowReverse : ''}`}
                            >
                                <div className={styles.stepContent}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2B5C', marginBottom: '0.5rem' }}>{step.title}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                                </div>

                                {/* Dot */}
                                <div className={styles.stepNumber}>
                                    {idx + 1}
                                </div>

                                <div className={styles.stepSpacer}></div>
                            </motion.div>
                        ))}
                    </div>

                    <FadeIn delay={0.6} className="" style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <p style={{ color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.875rem' }}>No false promises. Only real opportunities.</p>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

export const WhyTrust = () => {
    return (
        <section className={styles.section} style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className={styles.container} style={{ textAlign: 'center' }}>
                <SectionTitle title="Why Trust Hoop Casting?" />

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                        "Professional Process", "Experienced Creative Team", "Ethical Practices", "Story-First Culture", "Long-term Vision"
                    ].map((badge, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={styles.trustBadge}
                        >
                            <ShieldCheck size={20} className={styles.highlightText} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{badge}</span>
                        </motion.div>
                    ))}
                </div>

                <FadeIn>
                    <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-main)' }}>We don’t chase trends. <span style={{ color: '#1F2B5C' }}>We build stories that last.</span></h3>
                </FadeIn>
            </div>
        </section>
    );
};

export const MessageForDreamers = () => {
    return (
        <section className={styles.dreamersSection}>
            <div className={styles.dreamersBg}>
                <Image
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?bf=85&w=1200&q=70&auto=format&fit=crop"
                    alt="Dreamer Background"
                    fill
                    className={styles.dreamersImage}
                />
            </div>

            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className={styles.dreamersContent}
                >
                    <p className={styles.dreamerHeadline} style={{ fontSize: '1.5rem', color: '#e5e5e5' }}>Everyone dreams of being seen on screen.<br />Very few get the right platform.</p>

                    <div style={{ padding: '2rem 0' }}>
                        <h2 className={styles.question}>Here, we don’t ask —</h2>
                        <p className={styles.answer}>"kitne followers hain?"</p>
                    </div>

                    <div style={{ padding: '2rem 0' }}>
                        <h2 className={styles.question}>We ask —</h2>
                        <p className={`${styles.answer} ${styles.highlightAnswer}`}>"Kya screen tumhe yaad rakhegi?"</p>
                    </div>

                    <div className={styles.divider}></div>

                    <p style={{ fontSize: '1.25rem', color: 'white', fontWeight: 500 }}>If the answer feels like yes — <span className={styles.highlightText} style={{ borderBottom: '1px solid #D1AE37', color: '#D1AE37' }}>don’t overthink.</span></p>
                </motion.div>
            </div>
        </section>
    );
};

export const FinalCTA = () => {
    return (
        <section className={styles.ctaSection}>
            <div className={styles.ctaNoise}></div>

            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className={styles.ctaContent}
                >
                    <h2 className={styles.ctaHeadline}>
                        Your story deserves the right frame.<br />
                        Your talent deserves the right camera.
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}>
                        <Link href="/register" className={styles.blackBtn}>
                            <Play fill="currentColor" size={20} />
                            Apply for Hoop Casting
                        </Link>
                    </div>

                    <p className={styles.linkText} style={{ color: '#1F2B5C' }}>
                        👉 Submit Your Hoop Casting Profile Now
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
