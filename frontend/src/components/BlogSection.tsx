'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BLOGS } from '@/data/blogs'
import styles from './HomeSections.module.css'

export default function BlogSection() {
    return (
        <section className={styles.section} style={{ backgroundColor: '#ffffff', width: '100%', borderTop: '1px solid var(--border)' }}>
            <div className={styles.container}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.title}>Latest Insights</h2>
                    <span className={styles.subtitle}>Casting Tips & Trends</span>
                </div>

                <div className={styles.cardsGrid}>
                    {BLOGS.map((blog) => (
                        <div key={blog.id} className={styles.card} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>
                            </div>
                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.85rem', color: '#D1AE37', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {blog.date}
                                </div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3, color: '#1F2B5C', fontFamily: 'var(--font-heading)' }}>
                                    <Link href={`/blog/view?id=${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {blog.title}
                                    </Link>
                                </h3>
                                <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                                    {blog.excerpt}
                                </p>
                                <Link
                                    href={`/blog/view?id=${blog.id}`}
                                    className="hover-gold"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#1F2B5C',
                                        fontWeight: 600,
                                        marginTop: 'auto',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    Read Article <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
