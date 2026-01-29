'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, User, MapPin, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import styles from '../../../admin.module.css'

export default function EditTalent() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const { data } = await api.get(`/profile.php?id=${id}`)
                    if (data) {
                        // Parse JSON fields
                        ['languages', 'skills', 'portfolio_links', 'custom_fields', 'social_links', 'gallery_urls'].forEach(field => {
                            if (data[field] && typeof data[field] === 'string') {
                                try {
                                    data[field] = JSON.parse(data[field])
                                } catch (e) {
                                    // Keep as string
                                }
                            }
                        })
                        setProfile(data)
                    }
                } catch (error) {
                    console.error("Error fetching profile", error)
                }
                setLoading(false)
            }
            fetchData()
        }
    }, [id])

    if (loading) return <div className="container section">Loading Profile...</div>
    if (!profile) return <div className="container section">Profile not found.</div>

    const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : (profile.age || 'N/A')
    const displayName = profile.users?.name || profile.internal_name || 'Talent'

    return (
        <div className="container section">
            <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to List
            </Link>

            <div style={{ padding: '30px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>

                    {/* Header Info */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <img
                            src={profile.profile_photo_url || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #ccc' }}
                        />
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>{displayName}</h1>
                            <div className={`${styles.badge} ${styles.badgeActive}`} style={{ display: 'inline-block', marginBottom: '10px' }}>
                                {profile.category}
                            </div>
                            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14} /> {profile.city}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={14} /> {profile.gender}, {age} Years</div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Widget */}
                    <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb', minWidth: '250px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '10px' }}>Contact Details</div>
                        {profile.users?.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.9rem' }}><Mail size={14} /> {profile.users.email}</div>}
                        {profile.users?.mobile && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}><Phone size={14} /> {profile.users.mobile}</div>}
                        {profile.whatsapp_number && <div style={{ marginTop: '5px', fontSize: '0.85rem', color: '#16a34a' }}>WA: {profile.whatsapp_number}</div>}
                    </div>
                </div>

                <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

                {/* Gallery Section - ADMIN VIEW */}
                {profile.gallery_urls && profile.gallery_urls.length > 0 ? (
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#1f295c' }}>Gallery</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
                            {profile.gallery_urls.map((url: string, i: number) => (
                                <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #ddd', background: '#000' }} onClick={() => window.open(url, '_blank')}>
                                    {url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                                <span style={{ fontSize: '1.5rem', color: '#fff' }}>▶</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={url} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: '30px', padding: '20px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
                        No gallery items uploaded.
                    </div>
                )}

                {/* Main Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>

                    {/* Physical Stats */}
                    <div>
                        <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#1f295c' }}>Physical Stats</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95rem' }}>
                            <div>Height: <b>{profile.height_cm || '-'} cm</b></div>
                            <div>Weight: <b>{profile.weight_kg || '-'} kg</b></div>
                            <div>Hair: <b>{profile.hair_color || '-'}</b></div>
                            <div>Eyes: <b>{profile.eye_color || '-'}</b></div>
                            <div>Chest: <b>{profile.chest_in || '-'}</b></div>
                            <div>Waist: <b>{profile.waist_in || '-'}</b></div>
                            <div>Hips: <b>{profile.hips_in || '-'}</b></div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div>
                        <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#1f295c' }}>Professional Info</h3>
                        <div style={{ marginBottom: '10px' }}>Experience: <b>{profile.years_experience} Years</b></div>
                        <div style={{ marginBottom: '10px' }}>
                            <div>Skills:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                {profile.skills && (Array.isArray(profile.skills) ? profile.skills : [profile.skills]).map((s: string, i: number) => (
                                    <span key={i} style={{ background: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: '10px' }}>Languages: <b>{Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages}</b></div>
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', color: '#1f295c' }}>Bio / Past Work</h3>
                    <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                        <p style={{ whiteSpace: 'pre-wrap', color: '#4b5563' }}>{profile.bio || profile.past_work || 'No bio available.'}</p>
                    </div>
                </div>

                {profile.portfolio_links && profile.portfolio_links.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', color: '#1f295c' }}>Links</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {profile.portfolio_links.map((link: string, i: number) => (
                                <a key={i} href={link} target="_blank" className="text-blue-600 hover:underline">{link}</a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
