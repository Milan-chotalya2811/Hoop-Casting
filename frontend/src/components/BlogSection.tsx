'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import api from '@/lib/api'
import styles from './HomeSections.module.css'

export default function BlogSection() {
    const [blogs, setBlogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data } = await api.get('/blogs.php')
                if (data && Array.isArray(data)) {
                    setBlogs(data.slice(0, 3))
                }
            } catch (error) {
                console.error('Error fetching blogs:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBlogs()
    }, [])

    const getImageUrl = (url: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        // If it's a relative path from the backend, prepend the domain
        return `https://hoopcasting.com${url}`;
    }

    if (loading) return null; // Or a loading spinner

    return (
        <section className={styles.section} style={{ backgroundColor: '#ffffff', width: '100%', borderTop: '1px solid var(--border)' }}>
            <div className={styles.container}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.title}>Latest Insights</h2>
                    <span className={styles.subtitle}>Casting Tips & Trends</span>
                </div>

                <div className={styles.cardsGrid}>
                    {blogs.map((blog) => (
                        <div key={blog.id} className={styles.card} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ position: 'relative', height: '220px', width: '100%', background: '#f0f0f0' }}>
                                {blog.image_url ? (
                                    <img
                                        src={getImageUrl(blog.image_url) || ''}
                                        alt={blog.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>No Image</div>
                                )}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>
                            </div>
                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.85rem', color: '#D1AE37', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} />
                                    {new Date(blog.created_at).toLocaleDateString()}
                                </div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3, color: '#1F2B5C', fontFamily: 'var(--font-heading)' }}>
                                    <Link href={`/blog/view?slug=${blog.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {blog.title}
                                    </Link>
                                </h3>
                                <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                                    {blog.meta_description}
                                </p>
                                <Link
                                    href={`/blog/view?slug=${blog.slug}`}
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

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link href="/blog">
                        <button style={{
                            padding: '12px 30px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'white',
                            backgroundColor: '#1F2B5C',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            More Blogs <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
