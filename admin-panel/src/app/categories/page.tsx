'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/app/page.module.css'
import { ArrowLeft } from 'lucide-react'

const ALL_CATEGORIES = [
    "Actor", "Anchor", "Model", "Makeup Artist",
    "Stylist", "Art Direction", "Photographer", "Videographer",
    "Video Editor", "Internship", "Props Renting", "Studio Renting",
    "Set Designer", "Other"
]

function CategoriesContent() {
    const searchParams = useSearchParams()
    const filter = searchParams.get('filter')
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (filter) {
            const fetchProfiles = async () => {
                setLoading(true)
                const { data } = await supabase
                    .from('talent_profiles')
                    .select('*, users(name)')
                    .eq('is_hidden', false)
                    .is('deleted_at', null)
                    .ilike('category', `%${filter}%`)

                setProfiles(data || [])
                setLoading(false)
            }
            fetchProfiles()
        }
    }, [filter])

    if (filter) {
        return (
            <div className="container section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <Link href="/categories" className="btn btn-outline"><ArrowLeft size={16} /></Link>
                    <h1 className="title-gradient">{filter}s</h1>
                </div>

                {loading ? <div>Loading...</div> : (
                    profiles.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '10px' }}>No talent found in this category.</h3>
                            <Link href="/register" className="btn btn-primary">Join as a {filter}</Link>
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
                                            <div style={{ fontSize: '0.8rem', color: '#ddd' }}>
                                                {p.city}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>
        )
    }

    // List View
    return (
        <div className="container section">
            <h1 className="title-gradient" style={{ marginBottom: '40px' }}>Browse by Category</h1>
            <div className={styles.grid}>
                {ALL_CATEGORIES.map((cat, idx) => (
                    <Link href={`/categories?filter=${cat}`} key={idx} className={styles.categoryCard}>
                        <h3 className={styles.categoryTitle}>{cat}</h3>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default function Categories() {
    return (
        <Suspense fallback={<div>Loading categories...</div>}>
            <CategoriesContent />
        </Suspense>
    )
}
