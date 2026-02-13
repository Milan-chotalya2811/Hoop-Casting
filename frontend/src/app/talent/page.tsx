'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, User, MapPin } from 'lucide-react'
import Link from 'next/link'
import GalleryModal from '@/components/GalleryModal'

function TalentProfileContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [modalUrl, setModalUrl] = useState<string | null>(null)

    // Helper to safely parse arrays from various backend formats (JSON string, Array, Comma-separated string)
    const safeParseArray = (value: any): string[] => {
        if (!value) return []
        if (Array.isArray(value)) return value
        if (typeof value === 'string') {
            try {
                // Try strictly parsing JSON first
                const parsed = JSON.parse(value)
                if (Array.isArray(parsed)) return parsed
            } catch (e) {
                // If not JSON, assume comma-separated
                if (value.includes(',')) {
                    return value.split(',').map(s => s.trim()).filter(Boolean)
                }
                // Single string value treated as one-item array
                return [value]
            }
        }
        return []
    }

    // Helper for Object parsing (Custom Fields)
    const safeParseObject = (value: any): Record<string, any> => {
        if (!value) return {}
        if (typeof value === 'object' && value !== null) return value
        if (typeof value === 'string') {
            try {
                return JSON.parse(value) || {}
            } catch (e) {
                return {}
            }
        }
        return {}
    }

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const { data } = await api.get(`/profile.php?id=${id}`)
                    if (data) {
                        // Normalize the data immediately upon receipt
                        const normalized = {
                            ...data,
                            skills: safeParseArray(data.skills),
                            languages: safeParseArray(data.languages),
                            portfolio_links: safeParseArray(data.portfolio_links),
                            social_links: safeParseObject(data.social_links), // Assuming this works best as object or string? Usually links is object or array. Treating as array mostly.
                            // Actually social_links in other parts was just a string field. Let's check usage.
                            // Usage: It's not mapped. It's just displayed? No, it wasn't displayed in the previous code!
                            // Let's keep it safe.
                            gallery_urls: safeParseArray(data.gallery_urls),
                            custom_fields: safeParseObject(data.custom_fields)
                        }

                        setProfile(normalized)
                    }
                } catch (error) {
                    console.error("Error fetching profile", error)
                    setProfile(null)
                }
                setLoading(false)
            }
            fetchData()
        }
    }, [id])

    if (loading) return <div className="container section">Loading Profile...</div>
    if (!profile) return <div className="container section">Profile not found.</div>

    // Safe Date Calculation
    let age = 'N/A'
    if (profile.dob) {
        const birthDate = new Date(profile.dob)
        if (!isNaN(birthDate.getTime())) {
            age = (new Date().getFullYear() - birthDate.getFullYear()).toString()
        }
    }

    const displayName = profile.users?.name || profile.internal_name || 'Talent'

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <Link href="/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back to Talent
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                {/* Left Column: Image & Contact */}
                <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <img
                            src={profile.profile_photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000&auto=format&fit=crop'}
                            alt="Profile"
                            style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '20px', objectFit: 'cover', objectPosition: 'top', aspectRatio: '3/4' }}
                        />

                        <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Contact Info</h3>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <MapPin size={18} /> {profile.city || 'N/A'}, {profile.state}
                            </div>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <User size={18} /> {profile.gender || 'Not specified'}, {age} Years
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                                Contact Talent
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div>
                    <h1 style={{ fontSize: '3rem', lineHeight: 1.1, color: 'var(--secondary)' }}>{displayName}</h1>
                    <p style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '30px' }}>{profile.category || 'Talent'}</p>

                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Physical Stats</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                            {[
                                { label: 'Height', value: profile.height_cm ? `${profile.height_cm} cm` : null },
                                { label: 'Weight', value: profile.weight_kg ? `${profile.weight_kg} kg` : null },
                                { label: 'Hair', value: profile.hair_color },
                                { label: 'Eyes', value: profile.eye_color },
                                { label: 'Skin Tone', value: profile.skin_tone },
                                { label: 'Chest', value: profile.chest_in ? `${profile.chest_in}"` : null },
                                { label: 'Waist', value: profile.waist_in ? `${profile.waist_in}"` : null },
                                { label: 'Hips', value: profile.hips_in ? `${profile.hips_in}"` : null },
                            ].filter(stat => stat.value && stat.value !== '-' && stat.value !== 'null').map((stat, i) => (
                                <div key={i}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat.label}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Professional Details</h3>

                        {profile.years_experience && profile.years_experience > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ color: 'var(--text-muted)' }}>Experience</div>
                                <div style={{ fontSize: '1.1rem' }}>{profile.years_experience} Years</div>
                            </div>
                        )}

                        {profile.skills && profile.skills.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ color: 'var(--text-muted)' }}>Skills</div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {profile.skills.map((s: string, i: number) => (
                                        <span key={i} style={{ background: 'var(--surface-highlight)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>{s.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.languages && profile.languages.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ color: 'var(--text-muted)' }}>Languages</div>
                                <p>{profile.languages.join(', ')}</p>
                            </div>
                        )}

                        {profile.past_work && (
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Past Work</div>
                                <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{profile.past_work}</p>
                            </div>
                        )}
                    </div>

                    {/* Custom Fields (Dynamic) */}
                    {profile.custom_fields && Object.keys(profile.custom_fields).length > 0 && (
                        <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Additional Info</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                                {Object.entries(profile.custom_fields).map(([key, value]: [string, any]) => {
                                    if (!value || value === '' || value === 'null') return null;
                                    return (
                                        <div key={key}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                                {key.replace(/_/g, ' ')}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Gallery Section */}
                    {profile.gallery_urls && profile.gallery_urls.length > 0 && (
                        <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Gallery</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                                {profile.gallery_urls.map((url: string, i: number) => (
                                    <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => setModalUrl(url)}>
                                        {/* Thumbnail Logic */}
                                        {url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                                    <span style={{ fontSize: '2rem', color: '#fff' }}>▶</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={url} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <GalleryModal isOpen={!!modalUrl} url={modalUrl} onClose={() => setModalUrl(null)} />

                    {profile.portfolio_links && profile.portfolio_links.length > 0 && (
                        <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Portfolio</h3>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {profile.portfolio_links.map((link: string, i: number) => (
                                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                        {link}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
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
