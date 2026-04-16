
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api, { uploadFile } from '@/lib/api'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft, Camera, Upload, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import GalleryModal from '@/components/GalleryModal'
import { fixUrl, compressImage } from '@/lib/utils'

const CATEGORIES = [
    "Actor", "Anchor", "Model", "Makeup Artist", "Stylist", "Art Direction",
    "Photographer", "Videographer", "Video Editor", "Internship",
    "Props Renting", "Studio Renting", "Set Designer", "Other"
]


export default function EditProfile() {
    const { user, loading, refreshAuth } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [globalMessage, setGlobalMessage] = useState('')
    const [fieldMessages, setFieldMessages] = useState<Record<string, {text: string, type: 'info' | 'error' | 'success'}>>({})
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [profile, setProfile] = useState<any>({
        city: '', age: '', dob: '', whatsapp_number: '', category: '',
        bio: '', skills: '', languages: '', portfolio_links: '',
        past_brand_work: '', agency_status: '', pay_rates: '',
        travel_surat: 'No', chest_in: '', waist_in: '', hips_in: '',
        skin_tone: '', hair_color: '', eye_color: '',
        height_cm: '', weight_kg: '',
        profile_photo_url: '', gallery_urls: [], 
        intro_video_url: '', social_links: '',
        content_rights_agreed: false
    })

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                try {
                    const { data } = await api.get('/profile.php')
                    if (data && data.category) {
                        setProfile({
                            ...data,
                            travel_surat: (data.travel_surat === true || data.travel_surat === '1' || data.travel_surat === 1) ? 'Yes' : 'No',
                            gallery_urls: Array.isArray(data.gallery_urls) ? data.gallery_urls : (typeof data.gallery_urls === 'string' ? JSON.parse(data.gallery_urls) : []),
                            skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills === '[]' ? '' : (data.skills || '')),
                            languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages === '[]' ? '' : (data.languages || '')),
                        })
                    }
                } catch (err) { console.error(err) }
            }
            loadData()
        }
    }, [user])

    const handleFileUpload = async (e: any, fieldName: string) => {
        const files = Array.from(e.target.files as FileList)
        if (!files.length) return
        
        try {
            setSubmitting(true); setIsUploading(true)
            setFieldMessages(prev => ({ ...prev, [fieldName]: { text: `Uploading ${files.length} Item(s)...`, type: 'info' } }))
            
            if (fieldName === 'gallery_urls') {
                const uploadedUrls: string[] = []
                for (const file of files) {
                    const compressedFile = await compressImage(file) as File
                    const response = await uploadFile(compressedFile)
                    uploadedUrls.push(response.url)
                }
                setProfile((prev: any) => ({ ...prev, gallery_urls: [...(prev.gallery_urls || []), ...uploadedUrls] }))
                setFieldMessages(prev => ({ ...prev, [fieldName]: { text: `Successfully Added ${files.length} Item(s)!`, type: 'success' } }))
            } else {
                const file = files[0]
                const compressedFile = await compressImage(file) as File
                const response = await uploadFile(compressedFile)
                const publicUrl = response.url
                setProfile((prev: any) => ({ ...prev, [fieldName]: publicUrl }))
                
                if (fieldName === 'profile_photo_url') {
                   setFieldMessages(prev => ({ ...prev, [fieldName]: { text: 'Syncing DB...', type: 'info' } }))
                   await api.post('/profile.php', { ...profile, profile_photo_url: publicUrl, content_rights_agreed: profile.content_rights_agreed ? 1 : 0 });
                   await refreshAuth()
                }
                setFieldMessages(prev => ({ ...prev, [fieldName]: { text: 'Uploaded!', type: 'success' } }))
            }
        } catch (err: any) {
            setFieldMessages(prev => ({ ...prev, [fieldName]: { text: 'Error: ' + err.message, type: 'error' } }))
        } finally { setSubmitting(false); setIsUploading(false) }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await api.post('/profile.php', {
                ...profile,
                travel_surat: profile.travel_surat === 'Yes',
                content_rights_agreed: profile.content_rights_agreed ? 1 : 0,
                skills: (profile.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                languages: (profile.languages || '').split(',').map((s: string) => s.trim()).filter(Boolean),
            })
            await refreshAuth()
            setGlobalMessage('Profile Saved! Redirecting...')
            setTimeout(() => {
                router.push('/profile')
            }, 1000)
        } catch (err: any) { setGlobalMessage('Error saving.') }
        finally { setSubmitting(false) }
    }

    if (loading) return <div>Loading...</div>
    if (!user) return null

    return (
        <div className="container section" style={{ paddingTop: '140px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <Link href="/profile" className="btn btn-outline"><ArrowLeft size={16} /> Back</Link>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#000' }}>Edit Profile</h1>
            </div>

            <div className={styles.card} style={{ maxWidth: '100%', border: '1px solid #000', padding: '30px', background: '#fff' }}>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup} style={{ marginBottom: '40px' }}>
                        <label style={{ fontSize: '1.1rem', color: '#000', fontWeight: 'bold' }}>Talent Category</label>
                        <select name="category" className={styles.select} value={profile.category} onChange={(e) => setProfile({...profile, category: e.target.value})} style={{ border: '1px solid #000', color: '#000', width: '100%' }}>
                            <option value="">-- Select Category --</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <AnimatePresence mode="wait">
                        {profile.category && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                
                                <SectionTitle title="Personal Details" />
                                <div className="grid">
                                    <Field label="Full Name" value={user.name} disabled />
                                    <Field label="WhatsApp Number" value={profile.whatsapp_number} onChange={(e: any) => setProfile({...profile, whatsapp_number: e.target.value})} required maxLength={10} />
                                    <Field label="City" value={profile.city} onChange={(e: any) => setProfile({...profile, city: e.target.value})} required />
                                </div>

                                <SectionTitle title="Measurements & Physical" />
                                <div className="grid-measure">
                                    <Field label="Age" type="number" value={profile.age} onChange={(e: any) => setProfile({...profile, age: e.target.value})} />
                                    <Field label="Height (cm)" type="number" value={profile.height_cm} onChange={(e: any) => setProfile({...profile, height_cm: e.target.value})} />
                                    <Field label="Weight (kg)" type="number" value={profile.weight_kg} onChange={(e: any) => setProfile({...profile, weight_kg: e.target.value})} />
                                    <Field label="Chest" value={profile.chest_in} onChange={(e: any) => setProfile({...profile, chest_in: e.target.value})} />
                                    <Field label="Waist" value={profile.waist_in} onChange={(e: any) => setProfile({...profile, waist_in: e.target.value})} />
                                    <Field label="Hips" value={profile.hips_in} onChange={(e: any) => setProfile({...profile, hips_in: e.target.value})} />
                                    <Field label="Skin Tone" value={profile.skin_tone} onChange={(e: any) => setProfile({...profile, skin_tone: e.target.value})} />
                                    <Field label="Hair Color" value={profile.hair_color} onChange={(e: any) => setProfile({...profile, hair_color: e.target.value})} />
                                    <Field label="Eye Color" value={profile.eye_color} onChange={(e: any) => setProfile({...profile, eye_color: e.target.value})} />
                                </div>

                                <SectionTitle title="Professional Info" />
                                <div className="grid">
                                    <Field label="Bio / Professional Summary" type="textarea" value={profile.bio} onChange={(e: any) => setProfile({...profile, bio: e.target.value})} />
                                    <Field label="Skills (comma separated)" value={profile.skills} onChange={(e: any) => setProfile({...profile, skills: e.target.value})} />
                                    <Field label="Languages" value={profile.languages} onChange={(e: any) => setProfile({...profile, languages: e.target.value})} />
                                    <Field label="Daily/Project Rate" value={profile.pay_rates} onChange={(e: any) => setProfile({...profile, pay_rates: e.target.value})} />
                                    <div className={styles.formGroup}>
                                        <label style={{color: '#000', fontWeight: 'bold'}}>Travel to Surat?</label>
                                        <select value={profile.travel_surat} onChange={(e) => setProfile({...profile, travel_surat: e.target.value})} style={{width: '100%', padding: '12px', border: '1px solid #000', borderRadius: '12px', color: '#000'}}>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                </div>

                                <SectionTitle title="Social & Links" />
                                <div className="grid">
                                    <Field label="Instagram/Social Link" value={profile.social_links} onChange={(e: any) => setProfile({...profile, social_links: e.target.value})} />
                                    <Field label="Intro Video URL" value={profile.intro_video_url} onChange={(e: any) => setProfile({...profile, intro_video_url: e.target.value})} />
                                    <Field label="Portfolio/Reel Links" type="textarea" value={profile.portfolio_links} onChange={(e: any) => setProfile({...profile, portfolio_links: e.target.value})} />
                                </div>

                                {/* MEDIA SECTION AT THE END */}
                                <SectionTitle title="Media Portfolio" />
                                <ProfilePhotoSection url={profile.profile_photo_url} onUpload={(e: any) => handleFileUpload(e, 'profile_photo_url')} status={fieldMessages.profile_photo_url} />
                                <GalleryUploadSection items={profile.gallery_urls} onUpload={(e: any) => handleFileUpload(e, 'gallery_urls')} onRemove={(i: number) => setProfile({...profile, gallery_urls: profile.gallery_urls.filter((_: any, idx: number) => idx !== i)})} onPreview={setPreviewUrl} status={fieldMessages.gallery_urls} />

                                <div style={{ padding: '24px', background: '#f9f9f9', borderRadius: '16px', border: '1px solid #000', margin: '40px 0' }}>
                                    <label style={{ display: 'flex', gap: '16px', cursor: 'pointer', color: '#000' }}>
                                        <input type="checkbox" checked={profile.content_rights_agreed} onChange={(e) => setProfile({...profile, content_rights_agreed: e.target.checked})} style={{ width: 22, height: 22 }} required />
                                        <div style={{ fontSize: '0.95rem' }}><strong>Agreement:</strong> I acknowledge Monkey Ads holds ownership for produced content.</div>
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '20px', borderRadius: '16px', fontWeight: 'bold' }} disabled={submitting || isUploading}>
                                    Save All Changes
                                </button>
                                {globalMessage && (
                                    <div style={{ marginTop: '20px', padding: '15px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', border: '1px solid currentColor' }}>
                                        {globalMessage}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
            
            <GalleryModal isOpen={!!previewUrl} url={previewUrl} onClose={() => setPreviewUrl(null)} />

            <style jsx global>{` 
                .gallery-grid {
                    display: grid !important;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)) !important;
                    gap: 15px !important;
                    margin-top: 15px;
                }
                .gallery-item {
                    aspect-ratio: 1;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #000;
                    position: relative;
                }
                .gallery-add-item {
                    aspect-ratio: 1;
                    border: 2px dashed #000;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: #fafafa;
                    cursor: pointer;
                }
                @media (max-width: 768px) {
                    .gallery-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 10px !important; }
                }
                @media (max-width: 480px) {
                    .gallery-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
                }
            `}</style>
        </div>
    )
}

function SectionTitle({ title }: { title: string }) {
    return <h3 style={{ marginTop: '50px', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px', fontSize: '1.4rem', fontWeight: 'bold', color: '#000' }}>{title}</h3>
}

function Field({ label, value, onChange, disabled, type = "text", ...props }: any) {
    return (
        <div className={styles.formGroup}>
            <label style={{ color: '#000', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>{label}</label>
            {type === 'textarea' ? (
                <textarea value={value ?? ''} onChange={onChange} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #000', color: '#000' }} rows={3} {...props} />
            ) : (
                <input type={type} value={value ?? ''} onChange={onChange} disabled={disabled} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: disabled ? '#f5f5f5' : '#fff', border: '1px solid #000', color: '#000' }} {...props} />
            )}
        </div>
    )
}

function ProfilePhotoSection({ url, onUpload, status }: any) {
    return (
        <div style={{ margin: '30px 0', padding: '25px', background: '#fdfdfd', border: '1px solid #000', borderRadius: '20px', display: 'flex', gap: '25px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
                <img key={url} src={fixUrl(url)} onError={(e: any) => e.target.src = '/default_avatar.png'} style={{ width: 110, height: 140, borderRadius: '15px', objectFit: 'cover', objectPosition: 'top center', border: '2px solid var(--primary)' }} />
                <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--primary)', padding: '5px', borderRadius: '50%' }}><Camera size={14} /></div>
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ color: '#000', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Profile Picture</label>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button type="button" className="btn btn-primary" style={{ padding: '10px 20px' }}><Upload size={16} /> Select Photo</button>
                    <input type="file" onChange={onUpload} accept="image/*" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                </div>
                {status && <div style={{ marginTop: '10px', color: status.type === 'error' ? '#ef4444' : '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>{status.text}</div>}
            </div>
        </div>
    )
}

function GalleryUploadSection({ items, onUpload, onRemove, onPreview, status }: any) {
    return (
        <div style={{ marginBottom: '40px' }}>
            <label style={{ color: '#000', fontWeight: 'bold', display: 'block', marginBottom: '15px' }}>Portfolio Gallery</label>
            <div className="gallery-grid">
                {items && items.map((url: string, i: number) => (
                    <div key={i} className="gallery-item" onClick={() => onPreview(url)} style={{ cursor: 'pointer' }}>
                        <img src={fixUrl(url)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(i); }} style={{ position: 'absolute', top: 5, right: 5, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', zIndex: 10 }}><Trash2 size={12} /></button>
                    </div>
                ))}
                <div className="gallery-add-item" style={{ position: 'relative' }}>
                    <Upload size={24} color="#000" />
                    <span style={{ fontSize: '0.8rem', color: '#000', marginTop: '5px' }}>Add</span>
                    <input type="file" multiple onChange={onUpload} accept="image/*" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                </div>
            </div>
            {status && <div style={{ marginTop: '10px', color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>{status.text}</div>}
        </div>
    )
}
