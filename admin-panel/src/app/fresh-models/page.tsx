'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/app/page.module.css' // Reuse grid styles

export default function FreshModels() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfiles = async () => {
            const { data, error } = await supabase
                .from('talent_profiles')
                .select(`
          *,
          users (
            name
          )
        `)
                .order('created_at', { ascending: false })
                .eq('is_hidden', false)
                .is('deleted_at', null)
                .limit(50)

            if (data) setProfiles(data)
            setLoading(false)
        }

        fetchProfiles()
    }, [])

    if (loading) return <div className="container section">Loading Talent...</div>

    return (
        <div className="container section">
            <h1 className="title-gradient" style={{ marginBottom: '10px' }}>Fresh Faces</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Discover the latest talent joining our network.</p>

            {profiles.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px' }}>
                    <h3>No profiles found yet.</h3>
                    <p>Be the first to join!</p>
                    <Link href="/register" className="btn btn-primary" style={{ marginTop: '20px' }}>Register Now</Link>
                </div>
            ) : (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {profiles.map((p) => (
                        <Link href={`/talent/${p.id}`} key={p.id}>
                            <div className={styles.castCard} style={{ height: '400px', width: '100%' }}>
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
