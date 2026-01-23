'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/app/page.module.css'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const CATEGORY_DATA = [
    { name: "Actor", image: "/categories/actor_human_happy.png" },
    { name: "Anchor", image: "/categories/anchor_human.png" },
    { name: "Model", image: "/categories/model_human.png" },
    { name: "Makeup Artist", image: "/categories/makeup_artist_human.png" },
    { name: "Stylist", image: "/categories/stylist.png" },
    { name: "Art Direction", image: "/categories/art_direction_human.png" },
    { name: "Photographer", image: "/categories/photographer_human.png" },
    { name: "Videographer", image: "/categories/videographer_human.png" },
    { name: "Video Editor", image: "/categories/video_editor_human.png" },
    { name: "Internship", image: "/categories/internship_human.png" },
    { name: "Props Renting", image: "/categories/props-renting.png" },
    { name: "Studio Renting", image: "/categories/studio_renting_human.png" },
    { name: "Set Designer", image: "/categories/set_designer_human.png" },
    { name: "Other", image: "/categories/other_category_human.png" }
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
                        <div style={{ padding: '60px', textAlign: 'center', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #eee' }}>
                            <h3 style={{ marginBottom: '15px', color: '#1f295c' }}>No talent found in this category.</h3>
                            <Link href="/register" className="btn btn-primary" style={{ background: '#ffbe0b', color: '#000', border: 'none' }}>Join as a {filter}</Link>
                        </div>
                    ) : (
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {profiles.map((p) => (
                                <Link href={`/talent/${p.id}`} key={p.id}>
                                    <div className={styles.castCard} style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                                        <img
                                            src={p.profile_photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000&auto=format&fit=crop'}
                                            alt="Profile"
                                            className={styles.castImg}
                                        />
                                        <div className={styles.castOverlay}>
                                            <div className={styles.castName}>{p.users?.name || 'Unknown'}</div>
                                            <div className={styles.castRole}>{p.category}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#ffbe0b' }}>
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

    // List View with Images
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="container section" style={{ paddingBottom: '100px' }}>
            <h1 className={styles.mainCategoryTitle}>Category</h1>
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}
            >
                {CATEGORY_DATA.map((cat, idx) => (
                    <motion.div key={idx} variants={item}>
                        <Link href="#" className="category-card" style={{ position: 'relative', height: '250px', borderRadius: '20px', overflow: 'hidden', textDecoration: 'none', display: 'block', cursor: 'default' }}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: `url('${cat.image}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'top',
                                transition: 'transform 0.5s ease'
                            }} className="hover-zoom" />

                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2))',
                                display: 'flex', alignItems: 'flex-end', padding: '30px'
                            }}>
                                <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>{cat.name}</h3>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick in-file style for hover zoom since we can't easily append global css right now */}
            <style jsx global>{`
                .category-card:hover .hover-zoom {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    )
}

export default function Categories() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CategoriesContent />
        </Suspense>
    )
}
