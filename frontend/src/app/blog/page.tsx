'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import api from '@/lib/api'

// Simple helper to strip HTML for excerpt
const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

export default function BlogList() {
    const [blogs, setBlogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data } = await api.get('/blogs.php')
                if (data) {
                    setBlogs(data)
                }
            } catch (error) {
                console.error('Error fetching blogs:', error)
            }
            setLoading(false)
        }
        fetchBlogs()
    }, [])

    return (
        <div style={{ paddingTop: '120px', paddingBottom: '80px' }}>
            <div className="container">
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#1F2B5C', marginBottom: '20px', fontWeight: 800 }}>
                        Our Blog
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                        Latest news, casting tips, and industry trends.
                    </p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#666' }}>
                        Loading articles...
                    </div>
                ) : blogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#666' }}>
                        No articles found.
                    </div>
                ) : (

                    <div className="blogs-grid">
                        {blogs.map((blog) => (
                            <Link href={`/blog/view?slug=${blog.slug}`} key={blog.id} style={{ textDecoration: 'none' }}>
                                <article style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer'
                                }}
                                    className="blog-card"
                                >
                                    <div style={{ position: 'relative', height: '240px', background: '#f0f0f0' }}>
                                        {blog.image_url ? (
                                            <img
                                                src={blog.image_url}
                                                alt={blog.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#D1AE37', fontWeight: 700, textTransform: 'uppercase' }}>
                                                <Calendar size={14} />
                                                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                                <span style={{ color: '#ccc' }}>|</span>
                                                <span>{new Date(blog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3, color: '#1F2B5C', marginBottom: '1rem' }}>
                                            {blog.title}
                                        </h2>

                                        <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                                            {blog.meta_description || 'Click to read more...'}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: 'auto' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1F2B5C', fontWeight: 600, fontSize: '0.95rem' }}>
                                                Read More <ArrowRight size={16} />
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 500 }}>
                                                By {blog.author_name || 'Admin'}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .blogs-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 30px;
                }
                @media (min-width: 768px) {
                    .blogs-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .blogs-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                .blog-card:hover {
                    transform: translateY(-5px);
                }
            `}</style>
        </div >
    )
}
