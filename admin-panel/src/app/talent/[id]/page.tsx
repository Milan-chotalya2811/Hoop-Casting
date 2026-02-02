'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, User, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function TalentProfile() {
    const params = useParams()
    const id = params.id as string

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                const { data, error } = await supabase
                    .from('talent_profiles')
                    .select(`
                        *,
                        users (
                          name,
                          email
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (data) setProfile(data)
                setLoading(false)
            }
            fetchData()
        }
    }, [id])

    if (loading) return <div className="container section">Loading Profile...</div>
    if (!profile) return <div className="container section">Profile not found.</div>

    const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 'N/A'
    const displayName = profile.users?.name || profile.internal_name || 'Talent'

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <Link href="/fresh-models" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back to Talent
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                {/* Left Column: Image & Contact */}
                <div>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <img
                            src={profile.profile_photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000&auto=format&fit=crop'}
                            alt="Profile"
                            style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '20px', objectFit: 'cover', aspectRatio: '3/4' }}
                        />

                        <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Contact Info</h3>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <MapPin size={18} /> {profile.city}, {profile.state}
                            </div>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <User size={18} /> {profile.gender}, {age} Years
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                                Contact Talent
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div>
                    <h1 className="title-gradient" style={{ fontSize: '3rem', lineHeight: 1.1 }}>{displayName}</h1>
                    <p style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '30px' }}>{profile.category}</p>

                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Physical Stats</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                            {[
                                { label: 'Height', value: profile.height_cm ? `${profile.height_cm} cm` : '-' },
                                { label: 'Weight', value: profile.weight_kg ? `${profile.weight_kg} kg` : '-' },
                                { label: 'Hair', value: profile.hair_color || '-' },
                                { label: 'Eyes', value: profile.eye_color || '-' },
                                { label: 'Skin Tone', value: profile.skin_tone || '-' },
                                { label: 'Chest', value: profile.chest_in ? `${profile.chest_in}"` : '-' },
                                { label: 'Waist', value: profile.waist_in ? `${profile.waist_in}"` : '-' },
                                { label: 'Hips', value: profile.hips_in ? `${profile.hips_in}"` : '-' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat.label}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Professional Details</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Experience</div>
                            <div style={{ fontSize: '1.1rem' }}>{profile.years_experience} Years</div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Skills</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                {profile.skills && profile.skills.length > 0 ? profile.skills.map((s: string, i: number) => (
                                    <span key={i} style={{ background: 'var(--surface-highlight)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>{s}</span>
                                )) : '-'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Languages</div>
                            <p>{profile.languages ? profile.languages.join(', ') : '-'}</p>
                        </div>

                        <div>
                            <div style={{ color: 'var(--text-muted)' }}>Past Work</div>
                            <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{profile.past_work || 'No past work listed.'}</p>
                        </div>
                    </div>

                    {/* Custom Fields (Dynamic) */}
                    {profile.custom_fields && Object.keys(profile.custom_fields).length > 0 && (
                        <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Additional Info</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                                {Object.entries(profile.custom_fields).map(([key, value]: [string, any]) => (
                                    <div key={key}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                            {key.replace(/_/g, ' ')}
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
