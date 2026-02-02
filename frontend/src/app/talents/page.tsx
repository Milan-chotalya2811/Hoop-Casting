'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import styles from '@/app/page.module.css'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft } from 'lucide-react'

export default function TalentsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/register?redirect=/talents')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (!user) return;

        const fetchProfiles = async () => {
            try {
                const { data } = await api.get('/talents.php?limit=50')
                if (data) {
                    const mapped = data.map((t: any) => ({
                        ...t,
                        users: { name: t.name }
                    }))
                    setProfiles(mapped)
                }
            } catch (e) {
                console.error(e)
            }
            setLoading(false)
        }
        fetchProfiles()
    }, [user])

    if (authLoading) return <div className="container section" style={{ marginTop: '100px' }}>Loading...</div>
    if (!user) return null;

    if (loading) return <div className="container section" style={{ marginTop: '100px' }}>Loading Talent...</div>

    return (
        <div className="container" style={{ paddingBottom: '80px', paddingTop: '120px' }}>

            <div style={{ marginBottom: '20px' }}>
                <Link href="/dashboard" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>

            <h1 className={styles.mainCategoryTitle}>Our Talents</h1>
            <p className={styles.freshModelsPageSubtitle} style={{ color: 'var(--text-muted)', marginBottom: '40px', textAlign: 'center' }}>Discover the latest talent joining our network.</p>

            {profiles.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px' }}>
                    <h3>No profiles found yet.</h3>
                    <p>Be the first to join!</p>
                    <Link href="/profile/edit" className="btn btn-primary" style={{ marginTop: '20px' }}>Create Profile</Link>
                </div>
            ) : (
                <div className={styles.freshModelsGrid}>
                    {profiles.map((p) => (
                        <Link href={`/talent?id=${p.id}`} key={p.id}>
                            <div className={styles.castCard} style={{ height: 'auto', aspectRatio: '1/1', width: '100%' }}>
                                <img
                                    src={p.profile_photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000&auto=format&fit=crop'}
                                    alt="Profile"
                                    className={styles.castImg}
                                />
                                <div className={styles.castOverlay}>
                                    <div className={styles.castName}>{p.users?.name || 'Unknown'}</div>
                                    <div className={styles.castRole}>{p.category}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#ddd', marginTop: '4px' }}>
                                        {p.city}, {p.state} • {p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 'N/A'} yrs
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#ddd' }}>
                                        {p.height_cm ? `${p.height_cm}cm` : ''}
                                        {p.weight_kg ? ` • ${p.weight_kg}kg` : ''}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
