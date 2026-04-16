

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { ArrowLeft, User, MapPin, Edit, Shield } from 'lucide-react'
import Link from 'next/link'
import GalleryModal from '@/components/GalleryModal'
import { fixUrl } from '@/lib/utils'

export default function MyProfile() {
    const { user, profile: authProfile, loading } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [fetching, setFetching] = useState(true)
    const [modalUrl, setModalUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!loading) {
            if (!user) { router.push('/login'); return }

            const fetchMyProfile = async () => {
                try {
                    const { data } = await api.get('/profile.php')
                    if (data && data.category) {
                        ['languages', 'skills', 'portfolio_links', 'custom_fields', 'social_links', 'gallery_urls'].forEach((field: string) => {
                            if (data[field] && typeof data[field] === 'string') {
                                try { data[field] = JSON.parse(data[field]) } catch (e) {}
                            }
                        })
                        setProfile(data)
                    } else { router.push('/profile/edit') }
                } catch (e) { router.push('/profile/edit') }
                setFetching(false)
            }
            fetchMyProfile()
        }
    }, [user, loading, router])

    if (loading || fetching) return <div className="container section">Loading Profile...</div>
    if (!profile) return null

    const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : (profile.age || 'N/A')
    const displayName = authProfile?.name || user?.name || 'Talent'

    return (
        <div className="container" style={{ paddingBottom: '80px', paddingTop: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <Link href="/dashboard" className="btn btn-outline"><ArrowLeft size={16} /> Dashboard</Link>
                <Link href="/profile/edit" className="btn btn-primary"><Edit size={16} /> Edit Profile</Link>
            </div>

            {/* RESPONSIVE HEADER CONTAINER */}
            <div className="profile-header-card">
                <div className="profile-photo-container">
                    <img
                        src={fixUrl(profile.profile_photo_url)}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectPosition: 'top center', objectFit: 'cover' }}
                        onError={(e: any) => e.target.src = '/default_avatar.png'}
                    />
                </div>
                <div className="profile-info-container">
                    <h1 className="display-name">{displayName}</h1>
                    <p className="category-text">{profile.category}</p>
                    <div className="quick-info">
                        <div className="info-item"><MapPin size={16} /> {profile.city || 'N/A'}</div>
                        <div className="info-item"><User size={16} /> {age} Years</div>
                    </div>
                </div>
            </div>

            {/* DETAILED CONTENT BELOW */}
            <div style={{ marginTop: '40px' }}>
                <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>About Me</h3>
                    <p style={{ lineHeight: 1.6 }}>{profile.bio || 'No bio yet.'}</p>
                </div>

                <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Physical Stats</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '20px' }}>
                        <div><div className="label">Height</div><div className="val">{profile.height_cm || '-'} cm</div></div>
                        <div><div className="label">Weight</div><div className="val">{profile.weight_kg || '-'} kg</div></div>
                        <div><div className="label">Chest</div><div className="val">{profile.chest_in || '-'} "</div></div>
                        <div><div className="label">Waist</div><div className="val">{profile.waist_in || '-'} "</div></div>
                    </div>
                </div>

                {profile.gallery_urls?.length > 0 && (
                    <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>My Gallery</h3>
                        <div className="gallery-grid">
                            {profile.gallery_urls.map((url: string, i: number) => (
                                <div key={i} className="gallery-item" onClick={() => setModalUrl(url)}>
                                    <img src={fixUrl(url)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .profile-header-card {
                    display: flex;
                    gap: 30px;
                    background: #fff;
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 30px;
                    align-items: flex-start;
                }
                .profile-photo-container {
                    width: 250px;
                    flex-shrink: 0;
                    aspect-ratio: 3/4;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #000;
                }
                .profile-info-container {
                    flex: 1;
                }
                .display-name {
                    font-size: 2.5rem;
                    color: var(--secondary);
                    margin: 0 0 5px 0;
                }
                .category-text {
                    font-size: 1.4rem;
                    color: var(--primary);
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .label { font-size: 0.8rem; color: #666; }
                .val { font-weight: 600; font-size: 1.1rem; }

                @media (max-width: 768px) {
                    .profile-header-card { gap: 20px; padding: 20px; }
                    .profile-photo-container { width: 130px; }
                    .display-name { font-size: 1.6rem; }
                    .category-text { font-size: 1.1rem; }
                }

                @media (max-width: 480px) {
                    .profile-header-card { gap: 15px; padding: 15px; }
                    .profile-photo-container { width: 100px; }
                    .display-name { font-size: 1.3rem; }
                }

                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 15px;
                }
                .gallery-item {
                    aspect-ratio: 1;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid var(--border);
                    cursor: pointer;
                }
                @media (max-width: 768px) {
                    .gallery-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
                }
            `}</style>
            <GalleryModal isOpen={!!modalUrl} url={modalUrl} onClose={() => setModalUrl(null)} />
        </div>
    )
}
