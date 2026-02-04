'use client'

import { useEffect, useState, Suspense } from 'react'
import api from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from '../../admin.module.css'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

function EditBlogContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        slug: '',
        content: '',
        image_url: '',
        meta_title: '',
        meta_description: '',
        keywords: ''
    })

    useEffect(() => {
        if (id) {
            const fetchBlog = async () => {
                try {
                    // Use public API to get blog details
                    const { data } = await api.get(`/blogs.php?id=${id}`)
                    if (data) {
                        setFormData({
                            id: data.id,
                            title: data.title,
                            slug: data.slug,
                            content: data.content,
                            image_url: data.image_url || '',
                            meta_title: data.meta_title || '',
                            meta_description: data.meta_description || '',
                            keywords: data.keywords || ''
                        })
                    }
                } catch (error) {
                    console.error('Error fetching blog:', error)
                    alert('Blog not found.')
                    router.push('/admin/blogs')
                }
                setLoading(false)
            }
            fetchBlog()
        }
    }, [id, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            await api.put('/admin/blogs.php', formData)
            alert('Blog updated successfully!')
            router.push('/admin/blogs')
        } catch (error: any) {
            alert('Error updating blog: ' + (error.response?.data?.message || error.message))
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

    return (
        <div>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link href="/admin/blogs">
                        <button className={`${styles.btn} ${styles.btnSecondary}`}>
                            <ArrowLeft size={16} /> Back
                        </button>
                    </Link>
                    <h1 className={styles.title}>Edit Blog</h1>
                </div>
            </div>

            <div className={styles.formContainer} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Title <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Thumbnail Image URL</label>
                        <input
                            type="text"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Content (HTML) <span style={{ color: 'red' }}>*</span></label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows={15}
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', fontFamily: 'monospace' }}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }}></div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>SEO Settings</h3>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Meta Title</label>
                        <input
                            type="text"
                            name="meta_title"
                            value={formData.meta_title}
                            onChange={handleChange}
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Meta Description</label>
                        <textarea
                            name="meta_description"
                            value={formData.meta_description}
                            onChange={handleChange}
                            rows={3}
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Keywords</label>
                        <input
                            type="text"
                            name="keywords"
                            value={formData.keywords}
                            onChange={handleChange}
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                        >
                            {submitting ? 'Updating...' : (
                                <>
                                    <Save size={18} style={{ marginRight: '8px' }} /> Update Blog
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function EditBlog() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditBlogContent />
        </Suspense>
    )
}
