
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, User, MapPin } from 'lucide-react'
import Link from 'next/link'
import GalleryModal from '@/components/GalleryModal'
import { fixUrl } from '@/lib/utils'

function TalentProfileContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [modalUrl, setModalUrl] = useState<string | null>(null)

    const safeParseArray = (value: any): string[] => {
        if (!value) return []
        let target = value;
        if (Array.isArray(target)) {
            if (target.length === 1 && typeof target[0] === 'string' && (target[0].startsWith('[') || target[0].startsWith('{'))) {
                try {
                    const inner = JSON.parse(target[0]);
                    if (Array.isArray(inner)) return inner;
                } catch (e) {}
            }
            return target.filter(item => item !== null && item !== undefined).map(String);
        }
        if (typeof target === 'string') {
            target = target.trim();
            if (target.startsWith('[') || target.startsWith('{')) {
                try {
                    const parsed = JSON.parse(target);
                    if (Array.isArray(parsed)) return safeParseArray(parsed);
                    return [String(parsed)];
                } catch (e) {}
            }
            if (target.includes(',')) {
                return target.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
            if (target) return [target];
        }
        return []
    }

    const safeParseObject = (value: any): Record<string, any> => {
        if (!value) return {}
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value
        let target = value;
        if (Array.isArray(target) && target.length === 1 && typeof target[0] === 'string') { target = target[0]; }
        if (typeof target === 'string') {
            try {
                const parsed = JSON.parse(target);
                if (typeof parsed === 'object' && parsed !== null) return parsed;
            } catch (e) { return {} }
        }
        return {}
    }

    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '#';
        const fixed = fixUrl(url);
        if (fixed.startsWith('http')) return fixed;
        return `https://${fixed}`;
    }

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const { data } = await api.get(`/profile.php?id=${id}`)
                    if (data) {
                        const normalized = {
                            ...data,
                            skills: safeParseArray(data.skills),
                            languages: safeParseArray(data.languages),
                            portfolio_links: safeParseArray(data.portfolio_links),
                            gallery_urls: safeParseArray(data.gallery_urls),
                            custom_fields: safeParseObject(data.custom_fields)
                        }
                        setProfile(normalized)
                    }
                } catch (error) { console.error(error) }
                setLoading(false)
            }
            fetchData()
        }
    }, [id])

    if (loading) return <div className="container section">Loading Profile...</div>
    if (!profile) return <div className="container section">Profile not found.</div>

    let age = 'N/A'
    if (profile.dob) {
        const birthDate = new Date(profile.dob)
        if (!isNaN(birthDate.getTime())) {
            age = (new Date().getFullYear() - birthDate.getFullYear()).toString()
        }
    }

    const displayName = profile.name || profile.users?.name || profile.internal_name || 'Talent'

    return (
        <div className="container" style={{ paddingBottom: '80px', paddingTop: '100px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link href="/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back
                </Link>
            </div>

            {/* RESPONSIVE PROFILE HEADER */}
            <div className="profile-header-card">
                <div className="profile-photo-container">
                    <img
                        src={fixUrl(profile.profile_photo_url)}
                        alt="Profile"
                        className="profile-photo-img"
                        onError={(e: any) => e.target.src = '/default_avatar.png'}
                    />
                </div>
                <div className="profile-info-container">
                    <h1 className="profile-display-name">{displayName}</h1>
                    <p className="profile-category-tag">{profile.category || 'Talent'}</p>
                    <div className="quick-info-box">
                        <div className="info-item"><MapPin size={16} /> {profile.city}, {profile.state}</div>
                        <div className="info-item"><User size={16} /> {profile.gender}, {age} Years</div>
                    </div>
                </div>
            </div>

            {/* DETAILS SECTION BELOW */}
            <div style={{ marginTop: '40px' }}>
                <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Professional Bio</h3>
                    <p style={{ lineHeight: 1.6 }}>{profile.bio || 'No bio provided.'}</p>
                </div>

                <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Physical Stats</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '20px' }}>
                        {[
                            { label: 'Height', value: profile.height_cm ? `${profile.height_cm} cm` : '-' },
                            { label: 'Weight', value: profile.weight_kg ? `${profile.weight_kg} kg` : '-' },
                            { label: 'Hair', value: profile.hair_color || '-' },
                            { label: 'Eyes', value: profile.eye_color || '-' },
                            { label: 'Skin', value: profile.skin_tone || '-' },
                            { label: 'Chest', value: profile.chest_in ? `${profile.chest_in}"` : '-' },
                            { label: 'Waist', value: profile.waist_in ? `${profile.waist_in}"` : '-' },
                            { label: 'Hips', value: profile.hips_in ? `${profile.hips_in}"` : '-' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stat.label}</div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {profile.gallery_urls?.length > 0 && (
                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Gallery</h3>
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
            
            <GalleryModal isOpen={!!modalUrl} url={modalUrl} onClose={() => setModalUrl(null)} />

            <style jsx>{`
                .profile-header-card {
                    display: flex;
                    gap: 30px;
                    align-items: flex-start;
                    background: #fff;
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 30px;
                }
                .profile-photo-container {
                    width: 250px;
                    flex-shrink: 0;
                    border-radius: 16px;
                    overflow: hidden;
                    aspect-ratio: 3/4;
                    border: 1px solid var(--border);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .profile-photo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: top center;
                }
                .profile-info-container {
                    flex: 1;
                }
                .profile-display-name {
                    font-size: 2.8rem;
                    color: var(--secondary);
                    margin-bottom: 5px;
                    line-height: 1.1;
                }
                .profile-category-tag {
                    font-size: 1.4rem;
                    color: var(--primary);
                    font-weight: 500;
                    margin-bottom: 20px;
                }
                .quick-info-box {
                    display: grid;
                    gap: 12px;
                    color: var(--text-muted);
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1.1rem;
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

                @media (max-width: 768px) {
                    .profile-header-card {
                        gap: 20px;
                        padding: 20px;
                    }
                    .profile-photo-container {
                        width: 130px; /* Smaller for mobile to stay on side */
                    }
                    .profile-display-name {
                        font-size: 1.6rem;
                    }
                    .profile-category-tag {
                        font-size: 1.1rem;
                        margin-bottom: 10px;
                    }
                    .info-item {
                        font-size: 0.9rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .profile-header-card {
                        gap: 15px;
                        padding: 15px;
                    }
                    .profile-photo-container {
                        width: 100px;
                    }
                    .profile-display-name {
                        font-size: 1.3rem;
                    }
                }
            `}</style>
        </div>
    )
}

export default function TalentProfile() {
    return (
        <Suspense fallback={<div className="container section">Loading...</div>}>
            <TalentProfileContent />
        </Suspense>
    )
}
