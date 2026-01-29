'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api, { uploadFile } from '@/lib/api'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import GalleryModal from '@/components/GalleryModal'

const CATEGORIES = [
    "Actor",
    "Model",
    "Anchor",
    "Makeup Artist",
    "Stylist",
    "Art Direction",
    "Photographer",
    "Videographer",
    "Video Editor",
    "Internship in Acting",
    "Internship in Modeling",
    "Internship in Anchoring",
    "Props Renting",
    "Studio Renting",
    "Set Designer"
]

export default function AdminEditTalent() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()

    // Admin specific: We don't use useAuth for the profile data
    const [user, setUser] = useState<any>({})

    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [modalUrl, setModalUrl] = useState<string | null>(null)

    // Profile State maps to DB columns
    const [profile, setProfile] = useState<any>({
        // Standard Columns
        city: '',
        age: '',
        dob: '',
        whatsapp_number: '',
        emergency_contact: '',
        category: '',
        bio: '',
        skills: '',
        languages: '',
        portfolio_links: '',
        past_brand_work: '',
        agency_status: '',
        pay_rates: '',
        travel_surat: 'No',
        content_rights_agreed: false,
        chest_in: '',
        waist_in: '',
        hips_in: '',
        skin_tone: '',
        hair_color: '',
        eye_color: '',
        height_cm: '',
        weight_kg: '',

        // Legacy/Specific Columns
        profile_photo_url: '',
        gallery_urls: [] as string[],
        intro_video_url: '',
        social_links: '',

        // Conversions for Admin View
        deleted_at: null
    })

    const [customValues, setCustomValues] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)

    // Load Data
    useEffect(() => {
        if (id) {
            const loadData = async () => {
                try {
                    const { data } = await api.get(`/profile.php?id=${id}`)

                    if (data) {
                        // Populate User Info (Read Only)
                        setUser({
                            name: data.name,
                            email: data.email,
                            mobile: data.mobile
                        })

                        // Populate Profile State
                        setProfile({
                            ...data,
                            skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
                            languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || ''),
                            portfolio_links: Array.isArray(data.portfolio_links) ? data.portfolio_links.join('\n') : (data.portfolio_links || ''),
                            travel_surat: data.travel_surat ? 'Yes' : 'No',
                            category: data.category || '',
                            gallery_urls: Array.isArray(data.gallery_urls) ? data.gallery_urls : (data.gallery_urls ? JSON.parse(data.gallery_urls) : [])
                        })

                        // Populate Custom Values
                        if (data.custom_fields) {
                            try {
                                setCustomValues(typeof data.custom_fields === 'string' ? JSON.parse(data.custom_fields) : data.custom_fields)
                            } catch (e) {
                                setCustomValues({})
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error loading profile", err)
                    setMessage("Error loading profile data.")
                } finally {
                    setLoading(false)
                }
            }
            loadData()
        }
    }, [id])

    // Unified Change Handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, type } = e.target
        let { value } = e.target

        if (name === 'whatsapp_number') {
            value = value.replace(/[^0-9]/g, '').slice(0, 10);
        }

        const columnFields = [
            'category', 'city', 'age', 'dob', 'whatsapp_number', 'emergency_contact',
            'bio', 'skills', 'languages', 'portfolio_links', 'past_brand_work',
            'agency_status', 'pay_rates', 'intro_video_url', 'profile_photo_url',
            'social_links', 'content_rights_agreed', 'years_experience', 'gallery_urls',
            'chest_in', 'waist_in', 'hips_in', 'skin_tone', 'hair_color', 'eye_color', 'height_cm', 'weight_kg'
        ]

        if (name === 'travel_surat') {
            setProfile((prev: any) => ({ ...prev, [name]: value }))
            return
        }

        if (type === 'checkbox') {
            if (name === 'content_rights_agreed') {
                setProfile((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
                return
            }
            setCustomValues(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
            return
        }

        if (columnFields.includes(name)) {
            setProfile((prev: any) => ({ ...prev, [name]: value }))
        } else {
            setCustomValues(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleFileUpload = async (e: any, fieldName: string, isCustom = false) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setSubmitting(true)
            setIsUploading(true)
            setMessage('Starting upload...')
            setUploadProgress(0)

            let fileToUpload = file
            if (fieldName === 'profile_photo_url') {
                setMessage('Detecting face and optimizing image...')
                try {
                    const { cropToFace } = await import('@/utils/faceCrop')
                    const croppedBlob = await cropToFace(file)
                    fileToUpload = new File([croppedBlob], file.name, { type: file.type })
                    setMessage('Face detected. Uploading optimized image...')
                } catch (cropError) {
                    console.error('Face detection error:', cropError)
                    setMessage('Face detection warning: proceeding with original image...')
                }
            }

            const response = await uploadFile(fileToUpload, (percent) => {
                setUploadProgress(percent)
                setMessage(`Uploading: ${percent}%`)
            })

            let publicUrl = response.url
            if (publicUrl.startsWith('/')) {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/php_backend/api';
                const root = apiBase.replace('/api', '');
                publicUrl = root + publicUrl;
            }

            if (isCustom) {
                setCustomValues(prev => ({ ...prev, [fieldName]: publicUrl }))
            } else {
                setProfile((prev: any) => ({ ...prev, [fieldName]: publicUrl }))
            }

            setMessage('File uploaded successfully')
        } catch (err: any) {
            console.error(err)
            setMessage('Upload error: ' + (err.response?.data?.message || err.message))
        } finally {
            setSubmitting(false)
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const handleGalleryUpload = async (e: any) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setSubmitting(true)
            setIsUploading(true)
            setMessage('Uploading gallery item...')
            setUploadProgress(0)

            const response = await uploadFile(file, (percent) => {
                setUploadProgress(percent)
                setMessage(`Uploading Gallery Item: ${percent}%`)
            })

            let publicUrl = response.url
            if (publicUrl.startsWith('/')) {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/php_backend/api';
                const root = apiBase.replace('/api', '');
                publicUrl = root + publicUrl;
            }

            setProfile((prev: any) => ({
                ...prev,
                gallery_urls: [...(prev.gallery_urls || []), publicUrl]
            }))

            setMessage('Item added to gallery')
        } catch (err: any) {
            console.error(err)
            setMessage('Upload error: ' + (err.response?.data?.message || err.message))
        } finally {
            setSubmitting(false)
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const removeGalleryItem = (index: number) => {
        setProfile((prev: any) => ({
            ...prev,
            gallery_urls: prev.gallery_urls.filter((_: any, i: number) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isUploading) {
            alert('Please wait for file uploads to complete.')
            return
        }
        setSubmitting(true)
        setMessage('')

        try {
            if (!profile.category) throw new Error("Please select a category")
            // Admin might override rights agreement, but let's keep it required or lax?
            // if (!profile.content_rights_agreed) throw new Error("Please agree to the content rights.")

            const payload: any = {
                id: id, // Admin Update ID

                // Mapped Columns
                city: profile.city,
                category: profile.category,
                whatsapp_number: profile.whatsapp_number,
                emergency_contact: profile.emergency_contact,
                bio: profile.bio,
                past_brand_work: profile.past_brand_work,
                agency_status: profile.agency_status,
                pay_rates: profile.pay_rates,
                travel_surat: profile.travel_surat === 'Yes',
                content_rights_agreed: profile.content_rights_agreed ? 1 : 0,

                // Conversions
                age: profile.age ? parseInt(profile.age) : null,
                dob: profile.dob || null,
                skills: (profile.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                languages: (profile.languages || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                portfolio_links: (profile.portfolio_links || '').split('\n').map((s: string) => s.trim()).filter(Boolean),

                // Media
                profile_photo_url: profile.profile_photo_url,
                gallery_urls: profile.gallery_urls || [],
                intro_video_url: profile.intro_video_url,
                social_links: profile.social_links || customValues.socialProfile,

                // Custom fields
                custom_fields: customValues
            }

            if (customValues.socialProfile) payload.social_links = customValues.socialProfile
            if (customValues.videoProfile) payload.intro_video_url = customValues.videoProfile

            payload.height_cm = profile.height_cm ? parseFloat(profile.height_cm) : null
            payload.weight_kg = profile.weight_kg ? parseFloat(profile.weight_kg) : null
            payload.chest_in = profile.chest_in ? parseFloat(profile.chest_in) : null
            payload.waist_in = profile.waist_in ? parseFloat(profile.waist_in) : null
            payload.hips_in = profile.hips_in ? parseFloat(profile.hips_in) : null
            payload.skin_tone = profile.skin_tone
            payload.hair_color = profile.hair_color
            payload.eye_color = profile.eye_color

            await api.post('/admin/update_profile.php', payload)

            setMessage('Profile updated successfully!')
            window.scrollTo(0, 0)
        } catch (err: any) {
            console.error(err)
            setMessage('Error: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const selectedCategory = profile.category

    if (loading) return <div className="container section">Loading...</div>

    const GallerySection = () => (
        <>
            <SectionTitle title="Gallery (Photos & Videos)" />
            <div className={styles.formGroup}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                    {profile.gallery_urls && profile.gallery_urls.map((url: string, i: number) => (
                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', background: '#000', cursor: 'pointer' }} onClick={() => setModalUrl(url)}>
                            {url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                        <span style={{ fontSize: '1.5rem', color: '#fff' }}>▶</span>
                                    </div>
                                </div>
                            ) : (
                                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery Item" />
                            )}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeGalleryItem(i); }}
                                style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '50%', width: 24, height: 24, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    <div style={{ aspectRatio: '1', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', background: 'var(--surface)' }}>
                        <span style={{ fontSize: '2rem', color: 'var(--primary)' }}>+</span>
                        <input type="file" onChange={handleGalleryUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} accept="image/*,video/*" />
                    </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Upload photos and videos to showcase your work.</p>
            </div>
            <GalleryModal isOpen={!!modalUrl} url={modalUrl} onClose={() => setModalUrl(null)} />
        </>
    )

    return (
        <div className="container section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ArrowLeft size={16} /> Back to List
                </Link>
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '5px' }}>Edit Talent Profile</h1>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Editing: {user.name} ({user.email})</div>
                </div>
            </div>

            <div className={styles.card} style={{ maxWidth: '100%' }}>
                {message && (
                    <div style={{
                        padding: '15px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        background: message.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: message.startsWith('Error') ? 'var(--error)' : 'var(--success)',
                        border: `1px solid ${message.startsWith('Error') ? 'var(--error)' : 'var(--success)'}`
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* CATEGORY & STATUS */}
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Talent Category</label>
                            <select
                                name="category"
                                className={styles.select}
                                value={profile.category ?? ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedCategory && (
                            <motion.div
                                key={selectedCategory}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Common Fields mostly */}
                                <SectionTitle title="Personal & Contact Details" />
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                    <div className={styles.formGroup}>
                                        <label>Email Address</label>
                                        <input type="text" value={user.email || ''} disabled style={{ opacity: 0.7, background: 'var(--surface)' }} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Full Name</label>
                                        <input type="text" value={user.name || ''} disabled style={{ opacity: 0.7, background: 'var(--surface)' }} />
                                    </div>
                                    <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required maxLength={10} minLength={10} pattern="[0-9]{10}" />
                                    <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                </div>

                                <SectionTitle title="Work & Experience" />
                                <div className={styles.formGroup}>
                                    <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                    <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Use new line for multiple links" />
                                </div>

                                <Field name="past_brand_work" label="Have you worked with any brands/agencies?" value={profile.past_brand_work} onChange={handleChange} />

                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                    <div className={styles.formGroup}>
                                        <label>Agency Status</label>
                                        <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                            <option value="">Select...</option>
                                            <option value="Independent">Independent</option>
                                            <option value="Agency">Agency Signed</option>
                                        </select>
                                    </div>
                                    <Field name="pay_rates" label="Charges/Rates" value={profile.pay_rates} onChange={handleChange} />
                                    <div className={styles.formGroup}>
                                        <label>Can travel to Surat?</label>
                                        <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Dynamic Sections based on type roughly */}
                                {/* Simplify logic for Admin: Just show most fields, or use the mapped logic */}

                                <SectionTitle title="Specific Details" />
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    <Field name="emergency_contact" label="Emergency Contact" value={profile.emergency_contact} onChange={handleChange} />
                                    <Field name="dob" label="Date of Birth" type="date" value={profile.dob} onChange={handleChange} />
                                    <Field name="age" label="Age" type="number" value={profile.age} onChange={handleChange} />
                                    <Field name="languages" label="Languages" value={profile.languages} onChange={handleChange} />
                                    <Field name="social_links" label="Social Link" value={profile.social_links} onChange={handleChange} />
                                    <Field name="workExperience" label="Experience (Years)" type="number" value={profile.years_experience} onChange={handleChange} nameOverride="years_experience" />
                                </div>

                                {/* Physical Stats - Only for applicable categories ideally, but showing for all is okay for Admin */}
                                {["Actor", "Model", "Anchor"].includes(selectedCategory) && (
                                    <>
                                        <h4 style={{ marginTop: '20px', marginBottom: '15px', color: 'var(--text-muted)' }}>Physical Stats</h4>
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                                            <Field name="height_cm" label="Height (cm)" type="number" value={profile.height_cm} onChange={handleChange} />
                                            <Field name="weight_kg" label="Weight (kg)" type="number" value={profile.weight_kg} onChange={handleChange} />
                                            <Field name="chest_in" label="Chest/Bust (in)" value={profile.chest_in} onChange={handleChange} />
                                            <Field name="waist_in" label="Waist (in)" value={profile.waist_in} onChange={handleChange} />
                                            <Field name="hips_in" label="Hips (in)" value={profile.hips_in} onChange={handleChange} />
                                            <Field name="skin_tone" label="Skin Tone" value={profile.skin_tone} onChange={handleChange} />
                                            <Field name="eye_color" label="Eye Color" value={profile.eye_color} onChange={handleChange} />
                                            <Field name="hair_color" label="Hair Color" value={profile.hair_color} onChange={handleChange} />
                                        </div>
                                    </>
                                )}

                                <div style={{ marginTop: '20px' }}>
                                    <Field name="skills" label="Skills" value={profile.skills} onChange={handleChange} />
                                    <Field name="bio" label="Bio / About" type="textarea" value={profile.bio} onChange={handleChange} fullWidth />
                                </div>

                                {/* Custom Fields Dumping Ground - for fields not in main UI */}
                                {Object.keys(customValues).length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <SectionTitle title="Custom Fields" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                            {Object.entries(customValues).map(([k, v]) => (
                                                <Field key={k} name={k} label={k} value={v} onChange={handleChange} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <SectionTitle title="Profile Photo" />
                                <div className={styles.formGroup}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        {profile.profile_photo_url ? (
                                            <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover', objectPosition: 'top' }} alt="Profile" />
                                        ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                        <div>
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                        </div>
                                    </div>
                                </div>

                                <GallerySection />

                                <div style={{ marginTop: '40px' }}>
                                    {isUploading && (
                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                <span>Uploading...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: 'var(--surface-highlight)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }}></div>
                                            </div>
                                        </div>
                                    )}
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }} disabled={submitting || isUploading}>
                                        {isUploading ? `Uploading... (${uploadProgress}%)` : (submitting ? 'Saving Changes...' : 'Update Talent Profile')} <Save size={20} style={{ marginLeft: '10px' }} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div >
    )
}

function SectionTitle({ title }: { title: string }) {
    return <h3 className="gold-text" style={{
        marginTop: '30px',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border)',
        fontSize: '1.2rem'
    }}>{title}</h3>
}

function Field({ label, name, value, onChange, type = "text", placeholder, required, fullWidth, nameOverride, ...props }: any) {
    return (
        <div className={styles.formGroup} style={fullWidth ? { gridColumn: '1 / -1' } : {}}>
            <label>{label}</label>
            {type === 'textarea' ? (
                <textarea className={styles.textarea} name={nameOverride || name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={4} required={required} {...props} />
            ) : (
                <input className={styles.input} type={type} name={nameOverride || name} value={value ?? ''} onChange={onChange} placeholder={placeholder} required={required} {...props} />
            )}
        </div>
    )
}
