'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import styles from './admin.module.css'
import { Users, EyeOff, Trash2, FilePlus } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        hidden: 0,
        deleted: 0
    })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats.php')
            if (data) {
                setStats(data)
            }
        } catch (e) {
            console.error('Stats Error:', e)
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <Link href="/admin/talents/create">
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>
                        <FilePlus size={16} />
                        Add New Talent
                    </button>
                </Link>
            </div>

            <div className={styles.statsGrid}>
                <Link href="/admin/talents?filter=all" className={styles.card} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={styles.cardLabel}>Total Talents</span>
                        <Users size={20} color="#6b7280" />
                    </div>
                    <span className={styles.cardValue}>{stats.total}</span>
                </Link>

                <Link href="/admin/talents?filter=active" className={styles.card} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={styles.cardLabel}>Active Profiles</span>
                        <Users size={20} color="#10b981" />
                    </div>
                    <span className={styles.cardValue}>{stats.active}</span>
                </Link>

                <Link href="/admin/talents?filter=hidden" className={styles.card} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={styles.cardLabel}>Hidden Profiles</span>
                        <EyeOff size={20} color="#f59e0b" />
                    </div>
                    <span className={styles.cardValue}>{stats.hidden}</span>
                </Link>

                <Link href="/admin/talents?filter=deleted" className={styles.card} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={styles.cardLabel}>Deleted Profiles</span>
                        <Trash2 size={20} color="#ef4444" />
                    </div>
                    <span className={styles.cardValue}>{stats.deleted}</span>
                </Link>
            </div>

            {/* Recent Activity Table */}
            <div className={styles.tableContainer} style={{ marginTop: '2rem' }}>
                <div className={styles.tableHeader} style={{ justifyContent: 'space-between' }}>
                    <h2 className={styles.tableTitle}>Recent Talents</h2>
                    <Link href="/admin/talents" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'underline' }}>View All</Link>
                </div>

                <RecentTalentsTable />
            </div>
        </div>
    )
}

function RecentTalentsTable() {
    const [recent, setRecent] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const { data } = await api.get('/admin/talents.php?limit=5')
                if (data) {
                    const mapped = data.map((t: any) => ({
                        ...t,
                        users: {
                            name: t.name,
                            email: t.email
                        }
                    }))
                    setRecent(mapped)
                }
            } catch (e) { console.error(e) }
            setLoading(false)
        }
        fetchRecent()
    }, [])

    if (loading) return <div style={{ padding: '1rem' }}>Loading recent talents...</div>
    if (recent.length === 0) return <div style={{ padding: '1rem' }}>No talents found.</div>

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {recent.map((t) => (
                        <tr key={t.id}>
                            <td>
                                <div style={{ fontWeight: 500 }}>{t.users?.name || 'Unknown'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{t.users?.email}</div>
                            </td>
                            <td>{t.category}</td>
                            <td>{new Date(t.created_at).toLocaleDateString()}</td>
                            <td>
                                {t.is_hidden ? (
                                    <span className={`${styles.badge} ${styles.badgeHidden}`}>Hidden</span>
                                ) : (
                                    <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                                )}
                            </td>
                            <td>
                                <Link href={`/talent/${t.id}`} target="_blank" className={styles.link}>
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
