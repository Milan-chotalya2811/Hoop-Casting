'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import api from '@/lib/api'

function BlogContent() {
    const searchParams = useSearchParams()
    // It could be 'id' or 'slug'. Let's support 'slug' as primary.
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    const [blog, setBlog] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                let url = ''
                if (slug) url = `/blogs.php?slug=${slug}`
                else if (id) url = `/blogs.php?id=${id}`
                else return

                const { data } = await api.get(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`)
                setBlog(data)

                if (data) {
                    // Set page title for user experience and SEO
                    document.title = data.meta_title ? `${data.meta_title} - Hoop Casting` : (data.title ? `${data.title} - Hoop Casting` : 'Hoop Casting Blog');

                    // Set Meta Description
                    let metaDescription = document.querySelector('meta[name="description"]');
                    if (!metaDescription) {
                        metaDescription = document.createElement('meta');
                        metaDescription.setAttribute('name', 'description');
                        document.head.appendChild(metaDescription);
                    }
                    if (data.meta_description) {
                        metaDescription.setAttribute('content', data.meta_description);
                    }

                    // Set Meta Keywords
                    let metaKeywords = document.querySelector('meta[name="keywords"]');
                    if (!metaKeywords) {
                        metaKeywords = document.createElement('meta');
                        metaKeywords.setAttribute('name', 'keywords');
                        document.head.appendChild(metaKeywords);
                    }
                    if (data.keywords) {
                        metaKeywords.setAttribute('content', data.keywords);
                    }
                }
            } catch (error) {
                console.error('Error fetching blog:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBlog()
    }, [slug, id])

    if (!slug && !id) return <div className="container section">Please select a blog post.</div>

    if (loading) return <div className="container section" style={{ paddingTop: '120px' }}>Loading Article...</div>

    if (!blog) return (
        <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', textAlign: 'center' }}>
            <h1>Article Not Found</h1>
            <p>The article you are looking for does not exist or has been moved.</p>
            <Link href="/blog" style={{ marginTop: '20px', display: 'inline-block', color: '#D1AE37' }}>
                &larr; Back to Blog
            </Link>
        </div>
    )

    return (
        <article className="container" style={{ padding: '140px 20px 80px', maxWidth: '900px' }}>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', color: '#1F2B5C', fontWeight: 600, textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Back to Blog
            </Link>

            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#D1AE37', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '15px', letterSpacing: '0.05em' }}>
                    <Calendar size={16} /> {new Date(blog.created_at).toLocaleDateString()}
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, color: '#1F2B5C', marginBottom: '30px', fontFamily: 'var(--font-heading)' }}>
                    {blog.title}
                </h1>

                {blog.image_url && (
                    <div style={{ width: '100%', height: 'auto', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <img
                            src={blog.image_url?.startsWith('http') ? blog.image_url : `https://hoopcasting.com${blog.image_url}`}
                            alt={blog.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}
            </header>

            <div className="blog-wrapper" style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div
                    style={{ fontSize: '1.15rem', lineHeight: 1.8, color: '#444' }}
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    className="blog-content"
                />
            </div>
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
