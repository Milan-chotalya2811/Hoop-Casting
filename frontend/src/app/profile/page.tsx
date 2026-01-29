
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { ArrowLeft, User, MapPin, Edit, Shield } from 'lucide-react'
import Link from 'next/link'

export default function MyProfile() {
    const { user, profile: authProfile, loading } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
                return
            }

            const fetchMyProfile = async () => {
                try {
                    const { data } = await api.get('/profile.php')
                    if (data && data.category) {
                        // Parse JSON fields
                        ['languages', 'skills', 'portfolio_links', 'custom_fields', 'social_links', 'gallery_urls'].forEach((field: string) => {
                            if (data[field] && typeof data[field] === 'string') {
                                try {
                                    data[field] = JSON.parse(data[field])
                                } catch (e) {
                                    // Keep as string if parse fails
                                }
                            }
                        })
                        setProfile(data)
                    } else {
                        // IF NO PROFILE -> Redirect to Edit (Create) Form
                        router.push('/profile/edit')
                    }
                } catch (e) {
                    router.push('/profile/edit')
                }
                setFetching(false)
            }
            fetchMyProfile()
        }
    }, [user, loading, router])

    if (loading || fetching) return <div className="container section">Loading Profile...</div>
    if (!profile) return null

    if (profile.deleted_at) {
        return (
            <div className="container section">
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid #ef4444' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Account Suspended</h2>
                    <p>Your profile has been deleted by an administrator.</p>
                </div>
            </div>
        )
    }

    const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : (profile.age || 'N/A')
    const displayName = authProfile?.name || user?.name || 'Talent'

    // Helper to check if physical stats exist
    const hasPhysicalStats = profile.height_cm || profile.weight_kg || profile.hair_color || profile.eye_color || profile.skin_tone || profile.chest_in || profile.waist_in || profile.hips_in

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div className="action-bar">
                <Link href="/dashboard" className="btn btn-outline dashboard-btn">
                    <ArrowLeft size={16} /> <span className="btn-text">Dashboard</span>
                </Link>

                <div className="action-buttons">
                    <Link href="/change-password" className="btn btn-outline action-btn">
                        <Shield size={16} /> <span className="btn-text">Change Password</span>
                    </Link>
                    <Link href="/profile/edit" className="btn btn-primary action-btn">
                        <Edit size={16} /> <span className="btn-text">Edit Profile</span>
                    </Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>

                {/* Left Column: Image & Quick Info */}
                <div>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={profile.profile_photo_url || 'https://via.placeholder.com/400x500?text=No+Photo'}
                                alt="Profile"
                                style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '20px', objectFit: 'cover', aspectRatio: '3/4' }}
                            />
                        </div>

                        <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Quick Info</h3>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <MapPin size={18} /> {profile.city || 'Location N/A'}
                            </div>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <User size={18} /> {profile.gender ? profile.gender + ', ' : ''} {age !== 'N/A' ? `${age} Years` : ''}
                            </div>
                        </div>

                        {/* Contact Info (Only for User/Admin) */}
                        <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginTop: '20px' }}>
                            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', fontSize: '1.1rem' }}>Contact Details</h3>
                            <div style={{ marginBottom: '12px' }}>
                                <div className="label-sm">Email</div>
                                <div style={{ wordBreak: 'break-all' }}>{authProfile?.email || user?.email}</div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <div className="label-sm">WhatsApp</div>
                                <div>{profile.whatsapp_number || '-'}</div>
                            </div>
                            {profile.emergency_contact && (
                                <div>
                                    <div className="label-sm">Emergency Contact</div>
                                    <div>{profile.emergency_contact}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Dynamic Data */}
                <div>
                    <h1 style={{ fontSize: '3rem', lineHeight: 1.1, color: '#1f295c' }}>{displayName}</h1>
                    <p style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '30px' }}>{profile.category}</p>

                    {/* Show Physical Stats ONLY if relevant data exists */}
                    {hasPhysicalStats && (
                        <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Physical Stats</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                                {profile.height_cm && <div><div className="label-sm">Height</div><div className="value-lg">{profile.height_cm}</div></div>}
                                {profile.weight_kg && <div><div className="label-sm">Weight</div><div className="value-lg">{profile.weight_kg}</div></div>}
                                {profile.hair_color && <div><div className="label-sm">Hair</div><div className="value-lg">{profile.hair_color}</div></div>}
                                {profile.eye_color && <div><div className="label-sm">Eyes</div><div className="value-lg">{profile.eye_color}</div></div>}
                                {profile.skin_tone && <div><div className="label-sm">Skin</div><div className="value-lg">{profile.skin_tone}</div></div>}
                                {profile.chest_in && <div><div className="label-sm">Chest</div><div className="value-lg">{profile.chest_in}"</div></div>}
                                {profile.waist_in && <div><div className="label-sm">Waist</div><div className="value-lg">{profile.waist_in}"</div></div>}
                                {profile.hips_in && <div><div className="label-sm">Hips</div><div className="value-lg">{profile.hips_in}"</div></div>}
                            </div>
                        </div>
                    )}

                    {/* Professional Details (Conditional) */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Professional Details</h3>

                        {profile.years_experience > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div className="label-sm">Experience</div>
                                <div style={{ fontSize: '1.1rem' }}>{profile.years_experience} Years</div>
                            </div>
                        )}

                        {profile.skills && profile.skills.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div className="label-sm">Skills</div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {Array.isArray(profile.skills) ? profile.skills.map((s: string, i: number) => (
                                        <span key={i} style={{ background: 'var(--surface-highlight)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>{s}</span>
                                    )) : profile.skills}
                                </div>
                            </div>
                        )}

                        {profile.languages && profile.languages.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div className="label-sm">Languages</div>
                                <p>{Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages}</p>
                            </div>
                        )}

                        {profile.pay_rates && (
                            <div style={{ marginBottom: '20px' }}>
                                <div className="label-sm">Charges</div>
                                <div>{profile.pay_rates}</div>
                            </div>
                        )}

                        {profile.past_work && (
                            <div>
                                <div className="label-sm">Past Work</div>
                                <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{profile.past_work}</p>
                            </div>
                        )}
                        {profile.past_brand_work && (
                            <div style={{ marginTop: '20px' }}>
                                <div className="label-sm">Brand Work</div>
                                <p style={{ lineHeight: 1.6 }}>{profile.past_brand_work}</p>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                            <div>
                                <div className="label-sm">Agency Status</div>
                                <div>{profile.agency_status || 'Independent'}</div>
                            </div>
                            <div>
                                <div className="label-sm">Travel to Surat?</div>
                                <div>{profile.travel_surat ? 'Yes' : 'No'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Fields - Category Specific Data */}
                    {profile.custom_fields && Object.keys(profile.custom_fields).length > 0 && (
                        <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Additional Info</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                                {Object.entries(profile.custom_fields).map(([key, value]: [string, any]) => (
                                    <div key={key}>
                                        <div className="label-sm" style={{ textTransform: 'capitalize' }}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem', wordBreak: 'break-word' }}>
                                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value?.toString() || '-')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social & Portfolio */}
                    {(
                        (profile.portfolio_links && profile.portfolio_links.length > 0) ||
                        profile.social_links ||
                        profile.intro_video_url
                    ) && (
                            <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
                                <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Links</h3>

                                {profile.intro_video_url && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <div className="label-sm">Video Profile / Intro</div>
                                        <a href={profile.intro_video_url} target="_blank" className="link-primary">{profile.intro_video_url}</a>
                                    </div>
                                )}

                                {profile.social_links && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <div className="label-sm">Social Profile</div>
                                        <a href={profile.social_links} target="_blank" className="link-primary">{profile.social_links}</a>
                                    </div>
                                )}

                                {profile.portfolio_links && profile.portfolio_links.length > 0 && (
                                    <div>
                                        <div className="label-sm">Portfolio Links</div>
                                        <div style={{ display: 'grid', gap: '5px' }}>
                                            {(Array.isArray(profile.portfolio_links) ? profile.portfolio_links : [profile.portfolio_links]).map((link: string, i: number) => (
                                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="link-primary">
                                                    {link}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                </div>
            </div>

            <style jsx>{`
                .label-sm {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 4px;
                }
                .value-lg {
                    font-weight: 600;
                    font-size: 1.1rem;
                }
                .link-primary {
                    color: var(--primary);
                    text-decoration: underline;
                }

                /* Action Bar Styles */
                .action-bar {
                    margin-top: 20px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dashboard-btn, .action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .action-buttons {
                    display: flex;
                    gap: 10px;
                }

                @media (max-width: 768px) {
                    .action-bar {
                        display: block; /* Stack vertically, but we will control internal flow */
                    }
                    .dashboard-btn {
                        width: 100%;
                        margin-bottom: 12px;
                        justify-content: center;
                        padding: 10px 16px !important; /* Smaller size */
                        font-size: 0.9rem !important;
                    }
                    .action-buttons {
                        display: flex; /* keep flex for row */
                        width: 100%;
                        justify-content: space-between;
                        gap: 10px;
                    }
                    .action-btn {
                        width: 48%; /* Slightly less than 50% to account for gap */
                        justify-content: center;
                        padding: 8px 12px !important; /* SIGNIFICANTLY SMALLER */
                        font-size: 0.8rem !important; /* Small font */
                        white-space: nowrap;
                        height: 36px; /* fixed height for consistency */
                    }
                    .btn-text {
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    )
}
