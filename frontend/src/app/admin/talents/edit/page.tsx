
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api, { uploadFile } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft, Trash2, Camera, Upload } from 'lucide-react'
import Link from 'next/link'
import { fixUrl, compressImage } from '@/lib/utils'
import GalleryModal from '@/components/GalleryModal'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
    "Actor", "Anchor", "Model", "Makeup Artist", "Stylist", "Art Direction",
    "Photographer", "Videographer", "Video Editor", "Internship",
    "Props Renting", "Studio Renting", "Set Designer", "Other"
]


function EditForm() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const router = useRouter()
    const { refreshAuth } = useAuth()
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [user, setUser] = useState<any>({})
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [fieldMessages, setFieldMessages] = useState<Record<string, {text: string, type: 'info' | 'error' | 'success'}>>({})
    
    const [profile, setProfile] = useState<any>({
        city: '', age: '', dob: '', whatsapp_number: '', category: '',
        bio: '', skills: '', languages: '', portfolio_links: '',
        past_brand_work: '', agency_status: '', pay_rates: '',
        travel_surat: 'No', chest_in: '', waist_in: '', hips_in: '',
        skin_tone: '', hair_color: '', eye_color: '',
        height_cm: '', weight_kg: '',
        profile_photo_url: '', gallery_urls: [] as string[],
        travel_surat_bool: false
    })

    useEffect(() => {
        if (id) {
            const loadData = async () => {
                try {
                    const { data } = await api.get(`/profile.php?id=${id}`)
                    if (data) {
                        setUser({ name: data.name, email: data.email })
                        setProfile({
                            ...data,
                            gallery_urls: Array.isArray(data.gallery_urls) ? data.gallery_urls : (typeof data.gallery_urls === 'string' && data.gallery_urls.startsWith('[') ? JSON.parse(data.gallery_urls) : []),
                            skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills === '[]' ? '' : (data.skills || '')),
                            languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages === '[]' ? '' : (data.languages || '')),
                        })
                    }
                } catch (err) { console.error(err) }
            }
            loadData()
        }
    }, [id])

    const handleFileUpload = async (e: any, fieldName: string) => {
        const files = Array.from(e.target.files as FileList)
        if (!files.length) return

        try {
            setSubmitting(true); setIsUploading(true)
            setFieldMessages(prev => ({ ...prev, [fieldName]: { text: `Uploading ${files.length} Item(s)...`, type: 'info' } }))
            
            if (fieldName === 'gallery') {
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
                   setFieldMessages(prev => ({ ...prev, [fieldName]: { text: 'Syncing...', type: 'info' } }))
                   await api.post('/admin/update_profile.php', { id, profile_photo_url: publicUrl, category: profile.category });
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
            await api.post('/admin/update_profile.php', { 
                id, 
                ...profile,
                skills: (profile.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                languages: (profile.languages || '').split(',').map((s: string) => s.trim()).filter(Boolean),
            })
            await refreshAuth()
            setMessage('Profile Saved Successfully! Redirecting...')
            setTimeout(() => {
                router.push('/admin/talents')
            }, 1000)
        } catch (err: any) { setMessage('Error: ' + err.message) }
        finally { setSubmitting(false) }
    }

    return (
        <div className="container section" style={{ paddingTop: '40px' }}>
            <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back
            </Link>

            <div className={styles.card} style={{ maxWidth: '100%', border: '1px solid #000', background: '#fff', padding: '30px' }}>
                <h1 style={{ color: '#000', marginBottom: '5px' }}>Edit Talent Profile (Admin)</h1>
                <p style={{ color: '#000', marginBottom: '25px' }}>Editing: <strong>{user.name}</strong></p>


                <form onSubmit={handleSubmit}>
                    <SectionTitle title="Personal & Core Information" />
                    <div className="grid">
                        <div className={styles.formGroup}>
                            <label style={{color: '#000', fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Category</label>
                            <select name="category" value={profile.category} onChange={(e) => setProfile({...profile, category: e.target.value})} style={{width: '100%', padding: '12px', border: '1px solid #000', borderRadius: '8px', color: '#000', background: '#fff'}}>
                                <option value="">Select Category...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Field label="City" value={profile.city} onChange={(e: any) => setProfile({...profile, city: e.target.value})} />
                        <Field label="WhatsApp" value={profile.whatsapp_number} onChange={(e: any) => setProfile({...profile, whatsapp_number: e.target.value})} />
                        <Field label="Age" type="number" value={profile.age} onChange={(e: any) => setProfile({...profile, age: e.target.value})} />
                    </div>

                    <SectionTitle title="Measurements" />
                    <div className="grid-measure">
                        <Field label="Height (cm)" value={profile.height_cm} onChange={(e: any) => setProfile({...profile, height_cm: e.target.value})} />
                        <Field label="Weight (kg)" value={profile.weight_kg} onChange={(e: any) => setProfile({...profile, weight_kg: e.target.value})} />
                        <Field label="Chest" value={profile.chest_in} onChange={(e: any) => setProfile({...profile, chest_in: e.target.value})} />
                        <Field label="Waist" value={profile.waist_in} onChange={(e: any) => setProfile({...profile, waist_in: e.target.value})} />
                        <Field label="Hips" value={profile.hips_in} onChange={(e: any) => setProfile({...profile, hips_in: e.target.value})} />
                    </div>

                    <SectionTitle title="Professional Details" />
                    <div className="grid">
                        <Field label="Bio" type="textarea" value={profile.bio} onChange={(e: any) => setProfile({...profile, bio: e.target.value})} />
                        <Field label="Skills" value={profile.skills} onChange={(e: any) => setProfile({...profile, skills: e.target.value})} />
                        <Field label="Languages" value={profile.languages} onChange={(e: any) => setProfile({...profile, languages: e.target.value})} />
                        <Field label="Pay Rates" value={profile.pay_rates} onChange={(e: any) => setProfile({...profile, pay_rates: e.target.value})} />
                    </div>

                    {/* MEDIA AT THE END */}
                    <SectionTitle title="Media Portfolio" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #000', borderRadius: '20px', background: '#fafafa', marginBottom: '30px' }}>
                        <img key={profile.profile_photo_url} src={fixUrl(profile.profile_photo_url)} style={{ width: 100, height: 130, borderRadius: '15px', objectFit: 'cover', objectPosition: 'top center', border: '1px solid #000' }} onError={(e: any) => e.target.src = '/default_avatar.png'} />
                        <div>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <button type="button" className="btn btn-primary" style={{ padding: '10px 20px' }}>Change Profile Photo</button>
                                <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} accept="image/*" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                            </div>
                            {fieldMessages.profile_photo_url && <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>{fieldMessages.profile_photo_url.text}</div>}
                        </div>
                    </div>

                    <div className="gallery-grid">
                        {profile.gallery_urls && profile.gallery_urls.map((url: string, i: number) => (
                            <div key={`${url}-${i}`} className="gallery-item-square" onClick={() => setPreviewUrl(url)}>
                                <img src={fixUrl(url)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                                <button type="button" onClick={(e) => { e.stopPropagation(); setProfile({...profile, gallery_urls: profile.gallery_urls.filter((_: any, idx: number) => idx !== i)}); }} style={{ position: 'absolute', top: 5, right: 5, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                        <div className="gallery-add-box-square" style={{ position: 'relative' }}>
                            <Upload size={24} color="#000" />
                            <span style={{color: '#000', fontSize: '0.8rem', marginTop: '5px'}}>+ Add Media</span>
                            <input type="file" multiple onChange={(e) => handleFileUpload(e, 'gallery')} accept="image/*" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                        </div>
                    </div>
                    {fieldMessages.gallery && <div style={{ marginTop: '10px', color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>{fieldMessages.gallery.text}</div>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '50px', width: '100%', padding: '18px', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '16px' }} disabled={submitting || isUploading}>
                        Save All Changes
                    </button>
                    {message && (
                        <div style={{ marginTop: '20px', padding: '16px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', border: '1px solid currentColor', textAlign: 'center', fontWeight: 'bold' }}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
                             <style jsx global>{` 
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; } 
                .grid-measure { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px; } 
                .gallery-grid {
                    display: grid !important;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)) !important;
                    gap: 15px !important;
                }
                .gallery-item-square {
                    aspect-ratio: 1;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #000;
                    position: relative;
                    cursor: pointer;
                }
                .gallery-add-box-square {
                    aspect-ratio: 1;
                    border: 2px dashed #000;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: #fafafa;
                }
                @media (max-width: 768px) {
                    .gallery-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 10px !important; }
                }
                @media (max-width: 480px) {
                    .gallery-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
                }
            `}</style>
            <GalleryModal isOpen={!!previewUrl} url={previewUrl} onClose={() => setPreviewUrl(null)} />
        </div>
    )
}

function SectionTitle({ title }: { title: string }) {
    return <h3 style={{ marginTop: '40px', marginBottom: '20px', color: '#000', borderBottom: '2px solid #000', paddingBottom: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>{title}</h3>
}

function Field({ label, value, onChange, type = "text" }: any) {
    return (
        <div className={styles.formGroup}>
            <label style={{ color: '#000', fontSize: '0.9rem', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>{label}</label>
            {type === 'textarea' ? (
                <textarea value={value || ''} onChange={onChange} style={{ width: '100%', padding: '12px', border: '1px solid #000', borderRadius: '8px', color: '#000', background: '#fff' }} rows={3} />
            ) : (
                <input type={type} value={value || ''} onChange={onChange} style={{ width: '100%', padding: '12px', border: '1px solid #000', borderRadius: '8px', color: '#000', background: '#fff' }} />
            )}
        </div>
    )
}

export default function AdminEditTalent() {
    return <Suspense fallback={<div>Loading...</div>}><EditForm /></Suspense>
}
