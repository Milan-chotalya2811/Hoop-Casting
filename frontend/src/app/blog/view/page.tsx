'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { BLOGS } from '@/data/blogs'

function BlogContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const blog = BLOGS.find(b => b.id === id)

    if (!id) return <div className="container section">Please select a blog post.</div>
    if (!blog) return <div className="container section">Blog post not found.</div>

    return (
        <article className="container" style={{ padding: '120px 20px 80px', maxWidth: '900px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', color: '#1F2B5C', fontWeight: 600, textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Back to Home
            </Link>

            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#D1AE37', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '15px', letterSpacing: '0.05em' }}>
                    <Calendar size={16} /> {blog.date}
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, color: '#1F2B5C', marginBottom: '30px', fontFamily: 'var(--font-heading)' }}>
                    {blog.title}
                </h1>

                <div style={{ width: '100%', height: 'auto', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                    <img
                        src={blog.image}
                        alt={blog.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </header>

            <div className="blog-wrapper" style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <div
                    style={{ fontSize: '1.15rem', lineHeight: 1.8, color: '#444' }}
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    className="blog-content"
                />
            </div>

            <style jsx global>{`
                .blog-content h3 {
                    font-size: 1.6rem;
                    color: #1F2B5C;
                    margin-top: 3rem;
                    margin-bottom: 1.2rem;
                    font-weight: 800;
                    font-family: var(--font-heading);
                }
                .blog-content h4 {
                    font-size: 1.3rem;
                    color: #1F2B5C;
                    margin-top: 2rem;
                    margin-bottom: 0.8rem;
                    font-weight: 700;
                }
                .blog-content p {
                    margin-bottom: 1.5rem;
                }
                .blog-content ul {
                    margin-bottom: 1.5rem;
                    padding-left: 1.5rem;
                }
                .blog-content li {
                    margin-bottom: 0.8rem;
                    padding-left: 0.5rem;
                }
                .blog-content strong {
                    color: #1F2B5C;
                    font-weight: 700;
                }
                
                @media (max-width: 768px) {
                    .blog-wrapper {
                        padding: 20px !important;
                    }
                }
            `}</style>
        </article>
    )
}

export default function BlogPage() {
    return (
        <Suspense fallback={<div className="container section" style={{ paddingTop: '120px' }}>Loading Article...</div>}>
            <BlogContent />
        </Suspense>
    )
}
