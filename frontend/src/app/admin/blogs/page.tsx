'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import styles from '../admin.module.css'
import { FilePlus, Edit, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function BlogManagement() {
    const [blogs, setBlogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/blogs.php')
            if (Array.isArray(data)) {
                setBlogs(data)
            } else {
                setBlogs([])
            }
        } catch (error) {
            console.error('Error fetching blogs:', error)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this blog?')) return

        try {
            await api.delete(`/admin/blogs.php?id=${id}`)
            setBlogs(current => current.filter(b => b.id != id)) // Loose equality for number/string id
        } catch (e) {
            alert('Error deleting blog')
            fetchBlogs()
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Blog Management</h1>
                <Link href="/admin/blogs/create">
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>
                        <FilePlus size={16} />
                        Create Blog
                    </button>
                </Link>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <button onClick={fetchBlogs} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <div style={{ flex: 1 }}></div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                                </tr>
                            ) : blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No blogs found.</td>
                                </tr>
                            ) : (
                                blogs.map((blog) => (
                                    <tr key={blog.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{blog.title}</div>
                                        </td>
                                        <td>{blog.slug}</td>
                                        <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {/* Edit */}
                                                <Link href={`/admin/blogs/edit?id=${blog.id}`}>
                                                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} title="Edit Blog">
                                                        <Edit size={14} />
                                                    </button>
                                                </Link>

                                                {/* Preview */}
                                                <Link href={`/blog/${blog.slug}`} target="_blank">
                                                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} title="Preview">
                                                        <ExternalLink size={14} />
                                                    </button>
                                                </Link>

                                                {/* Delete */}
                                                <button
                                                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                    onClick={() => handleDelete(blog.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
