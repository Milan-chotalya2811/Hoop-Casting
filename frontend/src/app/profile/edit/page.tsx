
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api, { uploadFile } from '@/lib/api'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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

export default function EditProfile() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')

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
        skills: '',       // stored as array in DB but string in form temporarily? Or manage as string input
        languages: '',    // same
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

        // Legacy/Specific Columns that might still be used
        profile_photo_url: '',
        intro_video_url: '',
        social_links: '', // "Personal Instagram"

        // We'll stick to mapping Registration Form fields to these if they exist, else Custom
    })

    const [customValues, setCustomValues] = useState<Record<string, any>>({})

    // Load Data
    useEffect(() => {
        if (user) {
            const loadData = async () => {
                const { data } = await api.get('/profile.php')

                if (data && data.category) { // Check if we actually got a profile, not just user info
                    // Populate Profile State (Columns)
                    setProfile({
                        ...data,
                        skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
                        languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || ''),
                        portfolio_links: Array.isArray(data.portfolio_links) ? data.portfolio_links.join('\n') : (data.portfolio_links || ''),
                        travel_surat: data.travel_surat ? 'Yes' : 'No', // Convert bool to Yes/No for select
                        // Ensure defaults
                        category: data.category || '',
                    })

                    // Populate Custom Values
                    // If custom_fields saved as JSON string in DB, parse it.
                    if (data.custom_fields) {
                        try {
                            setCustomValues(typeof data.custom_fields === 'string' ? JSON.parse(data.custom_fields) : data.custom_fields)
                        } catch (e) {
                            setCustomValues({})
                        }
                    }
                }
            }
            loadData()
        }
    }, [user])

    // Unified Change Handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target

        // Define which fields map to ACTUAL Columns in talent_profiles
        // Note: 'height', 'weight' from Reg form are often text (5'10), but DB might have numeric height_cm. 
        // For simplicity/robustness, I will map Reg Form specific names to columns if they match, else Custom.

        const columnFields = [
            'category', 'city', 'age', 'dob', 'whatsapp_number', 'emergency_contact',
            'bio', 'skills', 'languages', 'portfolio_links', 'past_brand_work',
            'agency_status', 'pay_rates', 'intro_video_url', 'profile_photo_url',
            'social_links', 'content_rights_agreed',
            'chest_in', 'waist_in', 'hips_in', 'skin_tone', 'hair_color', 'eye_color', 'height_cm', 'weight_kg'
        ]

        // Special handling for checkboxes/travel_surat
        if (name === 'travel_surat') {
            setProfile((prev: any) => ({ ...prev, [name]: value }))
            return
        }

        // Checkboxes in custom fields?
        if (type === 'checkbox') {
            // Handle rights agreement specifically
            if (name === 'content_rights_agreed') {
                setProfile((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
                return
            }
            // Other checkboxes -> Custom
            setCustomValues(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
            return
        }

        if (columnFields.includes(name)) {
            setProfile((prev: any) => ({ ...prev, [name]: value }))
        } else {
            // It's a custom field (like 'studioType', 'height' if treated as text, etc)
            setCustomValues(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleFileUpload = async (e: any, fieldName: string, isCustom = false) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setSubmitting(true)
            setMessage('Starting upload...')

            // Face Detection & Cropping for Profile Photos
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

            const response = await uploadFile(fileToUpload)

            // Construct full URL if response is relative
            // Assuming BACKEND is same host as API but without /api
            // Ideally we need an env var for ASSET_URL. 
            // For now, let's use the API_BASE_URL logic or just store what is returned if it's full path.
            // If upload.php returns "/uploads/file.jpg", we need to prepend the domain.
            // Let's assume standard PHP setup: http://localhost/php_backend/uploads/...

            let publicUrl = response.url
            if (publicUrl.startsWith('/')) {
                // HACK: Hardcoded for localhost testing, user should configure this.
                // If API path is http://localhost/php_backend/api, then root is http://localhost/php_backend
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
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage('')

        try {
            if (!profile.category) throw new Error("Please select a category")
            if (!profile.content_rights_agreed) throw new Error("Please agree to the content rights.")

            // Prepare Payload
            // Data to send to PHP API
            // Note: DB structure in PHP uses different handling for arrays (expecting strings or handled JSON)
            // But we can send JSON and PHP will handle it or we stringify here.
            // My PHP profile.php expects JSON body and maps fields.

            const payload: any = {
                // user_id is handled by token in backend

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
                content_rights_agreed: profile.content_rights_agreed ? 1 : 0, // PHP boolean often tinyint

                // Conversions
                age: profile.age ? parseInt(profile.age) : null,
                dob: profile.dob || null,
                // PHP API expects arrays as JSON or strings? 
                // profile.php: if (is_array($val)) $val = json_encode($val);
                // So we can send arrays naturally.
                skills: (profile.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                languages: (profile.languages || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                portfolio_links: (profile.portfolio_links || '').split('\n').map((s: string) => s.trim()).filter(Boolean),

                // Media
                profile_photo_url: profile.profile_photo_url,
                intro_video_url: profile.intro_video_url,
                social_links: profile.social_links || customValues.socialProfile,

                // Custom fields
                custom_fields: customValues
            }

            // Sync certain Custom fields to Columns if missed
            if (customValues.socialProfile) payload.social_links = customValues.socialProfile
            if (customValues.videoProfile) payload.intro_video_url = customValues.videoProfile

            // Map physical stats
            payload.height_cm = profile.height_cm ? parseFloat(profile.height_cm) : null
            payload.weight_kg = profile.weight_kg ? parseFloat(profile.weight_kg) : null
            payload.chest_in = profile.chest_in ? parseFloat(profile.chest_in) : null
            payload.waist_in = profile.waist_in ? parseFloat(profile.waist_in) : null
            payload.hips_in = profile.hips_in ? parseFloat(profile.hips_in) : null
            payload.skin_tone = profile.skin_tone
            payload.hair_color = profile.hair_color
            payload.eye_color = profile.eye_color

            await api.post('/profile.php', payload)

            setMessage('Profile updated successfully!')
            // Optional: Redirect
            setTimeout(() => router.push('/profile'), 1000)

        } catch (err: any) {
            console.error(err)
            setMessage('Error: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const selectedCategory = profile.category

    if (loading) return <div className="container section">Loading...</div>
    if (!user) { router.push('/login'); return null }

    return (
        <div className="container section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <Link href="/profile" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ArrowLeft size={16} /> Back
                </Link>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>Edit Profile</h1>
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

                    {/* 1. CATEGORY SELECTION FIRST */}
                    <div className={styles.formGroup} style={{ marginBottom: '30px' }}>
                        <label style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Select Your Category</label>
                        <select
                            name="category"
                            className={styles.select}
                            value={profile.category ?? ''}
                            onChange={handleChange}
                            style={{ fontSize: '1.2rem', padding: '15px' }}
                        >
                            <option value="">-- Click to Select Category --</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. DYNAMIC FORM BASED ON CATEGORY */}
                    <AnimatePresence mode="wait">
                        {selectedCategory && (
                            <motion.div
                                key={selectedCategory}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* ACTOR / MODEL / ANCHOR FORM */}
                                {["Actor", "Model", "Anchor"].includes(selectedCategory) && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <Field name="pay_rates" label="Charges (per day/project/reel)" value={profile.pay_rates} onChange={handleChange} />
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Personal Stats & Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={profile.emergency_contact} onChange={handleChange} />
                                            <Field name="age" label="Age" type="number" value={profile.age} onChange={handleChange} />
                                            <Field name="dob" label="Date of Birth" type="date" value={profile.dob} onChange={handleChange} />
                                        </div>

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

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
                                            <Field name="languages" label="Languages you know" value={profile.languages} onChange={handleChange} />
                                            <Field name="social_links" label="Personal Instagram / Social Link" value={profile.social_links} onChange={handleChange} />
                                            <Field name="intro_video_url" label="Your Video Profile Link" value={profile.intro_video_url} onChange={handleChange} />
                                            <Field name="years_experience" label="Work Experience (Years)" value={profile.years_experience} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="projectTypes" label="Preferred Project Types" value={customValues.projectTypes} onChange={handleChange} />
                                            <Field name="skills" label="Skills (Dancing, Singing, etc.)" value={profile.skills} onChange={handleChange} />
                                            <Field name="bio" label="Bio / About Yourself" type="textarea" value={profile.bio} onChange={handleChange} fullWidth />
                                        </div>

                                        <SectionTitle title="Profile Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '5px' }}>Upload a clear face picture.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>
                                    </>
                                )}

                                {/* Makeup Artist */}
                                {selectedCategory === "Makeup Artist" && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <Field name="pay_rates" label="Charges (per day/project)" value={profile.pay_rates} onChange={handleChange} />
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Specific Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={profile.emergency_contact} onChange={handleChange} />
                                            <Field name="age" label="Age" type="number" value={profile.age} onChange={handleChange} />
                                            <Field name="social_links" label="Personal Instagram / Social Link" value={profile.social_links} onChange={handleChange} />
                                            <Field name="workExperience" label="Work Experience (in years)" value={customValues.workExperience} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Select name="indoorOutdoor" label="Are you comfortable with both indoor and outdoor shoots?" options={["Yes", "No", "Indoor Only", "Outdoor Only"]} value={customValues.indoorOutdoor} onChange={handleChange} />
                                            <Select name="maleFemaleMakeup" label="Are you comfortable doing makeup for both male and female artists?" options={["Both", "Female Only", "Male Only"]} value={customValues.maleFemaleMakeup} onChange={handleChange} />
                                            <Select name="hairStyling" label="Do you provide hair styling along with makeup?" options={["Yes", "No", "Basic Only"]} value={customValues.hairStyling} onChange={handleChange} />
                                        </div>

                                        <Field name="bio" label="Bio / About Yourself" type="textarea" value={profile.bio} onChange={handleChange} fullWidth />

                                        <SectionTitle title="Profile Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>
                                    </>
                                )}

                                {/* Stylist */}
                                {selectedCategory === "Stylist" && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <Field name="pay_rates" label="Charges (per day/project)" value={profile.pay_rates} onChange={handleChange} />
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Specific Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={profile.emergency_contact} onChange={handleChange} />
                                            <Field name="age" label="Age" type="number" value={profile.age} onChange={handleChange} />
                                            <Field name="weight_kg" label="Weight (kg)" type="number" value={profile.weight_kg} onChange={handleChange} />
                                            <Field name="languages" label="Languages you know" value={profile.languages} onChange={handleChange} />
                                            <Field name="social_links" label="Personal Instagram / Social Link" value={profile.social_links} onChange={handleChange} />
                                            <Field name="workExperience" label="Work Experience (Years)" value={customValues.workExperience} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="projectTypes" label="Project Types" value={customValues.projectTypes} onChange={handleChange} />
                                            <Field name="skills" label="Skills (Dancing, Singing, etc.)" value={profile.skills} onChange={handleChange} />
                                            <Field name="bio" label="Bio / About Yourself" type="textarea" value={profile.bio} onChange={handleChange} fullWidth />
                                        </div>

                                        {/* Disclaimer at bottom as per pattern */}
                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>

                                        <SectionTitle title="Profile Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Art Director */}
                                {selectedCategory === "Art Direction" && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <Field name="pay_rates" label="Charges (per day/project)" value={profile.pay_rates} onChange={handleChange} />
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Specific Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={profile.emergency_contact} onChange={handleChange} />
                                            <Field name="age" label="Age" type="number" value={profile.age} onChange={handleChange} />
                                            <Field name="languages" label="Languages you know" value={profile.languages} onChange={handleChange} />
                                            <Field name="social_links" label="Personal Instagram / Social Link" value={profile.social_links} onChange={handleChange} />
                                            <Field name="workExperience" label="Work Experience (Years)" value={customValues.workExperience} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="projectTypes" label="Project Types" value={customValues.projectTypes} onChange={handleChange} />
                                            <Select name="studioLocation" label="Are you comfortable working with both studio and on-location shoots?" options={["Yes", "No", "Studio Only", "Location Only"]} value={customValues.studioLocation} onChange={handleChange} />
                                            <Select name="conceptSketches" label="Do you provide visual concept sketches or mood boards before the shoot?" options={["Yes", "No", "Upon Request"]} value={customValues.conceptSketches} onChange={handleChange} />
                                            <Field name="lastMinuteChanges" label="How do you manage last-minute changes on set?" type="textarea" value={customValues.lastMinuteChanges} onChange={handleChange} />
                                        </div>

                                        <Field name="bio" label="Bio / About Yourself" type="textarea" value={profile.bio} onChange={handleChange} fullWidth />

                                        {/* Disclaimer */}
                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>

                                        <SectionTitle title="Profile Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Photographer / Videographer / Internships */}
                                {["Photographer", "Videographer", "Internship in Acting", "Internship in Modeling", "Internship in Anchoring"].includes(selectedCategory) && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <Field name="pay_rates" label="Charges (per day/project)" value={profile.pay_rates} onChange={handleChange} />
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Specific Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={profile.emergency_contact} onChange={handleChange} />
                                            <Field name="age" label="Age" type="number" value={profile.age} onChange={handleChange} />
                                            <Field name="dob" label="Date of Birth" type="date" value={profile.dob} onChange={handleChange} />
                                            <Field name="languages" label="Languages you know" value={profile.languages} onChange={handleChange} />
                                            <Field name="social_links" label="Personal Instagram / Social Link" value={profile.social_links} onChange={handleChange} />
                                            <Field name="workExperience" label="Work Experience (in years)" value={customValues.workExperience} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="projectTypes" label="Project Types" value={customValues.projectTypes} onChange={handleChange} />
                                            <Field name="skills" label="Skills" value={profile.skills} onChange={handleChange} />
                                            <Field name="bio" label="Bio / About Yourself" type="textarea" value={profile.bio} onChange={handleChange} fullWidth />
                                        </div>

                                        {/* Disclaimer */}
                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>

                                        <SectionTitle title="Profile Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Video Editor (Specific subset) */}
                                {selectedCategory === "Video Editor" && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <Field name="pay_rates" label="Charges (per day/project)" value={profile.pay_rates} onChange={handleChange} />
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Specific Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={profile.emergency_contact} onChange={handleChange} />
                                            {/* Age Removed */}
                                            <Field name="dob" label="Date of Birth" type="date" value={profile.dob} onChange={handleChange} />
                                            {/* Languages Removed */}
                                            <Field name="social_links" label="Personal Instagram / Social Link" value={profile.social_links} onChange={handleChange} />
                                            <Field name="workExperience" label="Work Experience (in years)" value={customValues.workExperience} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="projectTypes" label="Project Types" value={customValues.projectTypes} onChange={handleChange} />
                                            {/* Skills Removed */}
                                            <Field name="bio" label="Bio / About Yourself" type="textarea" value={profile.bio} onChange={handleChange} fullWidth />
                                        </div>

                                        {/* Disclaimer */}
                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>

                                        <SectionTitle title="Profile Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Props Renting */}
                                {selectedCategory === "Props Renting" && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>What are your rental charges per day or per item?</label>
                                                <input className={styles.input} type="text" name="pay_rates" value={profile.pay_rates ?? ''} onChange={handleChange} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Prop Details & Services" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={profile.emergency_contact} onChange={handleChange} />
                                            <Select name="ownInventory" label="Do you have your own inventory of props?" options={["Yes", "No", "Partial"]} value={customValues.ownInventory} onChange={handleChange} />
                                            <Select name="propsDelivery" label="Do you deliver props to the shoot location?" options={["Yes", "No", "Chargeable"]} value={customValues.propsDelivery} onChange={handleChange} />
                                            <Select name="setupPickup" label="Do you provide setup and pick-up services?" options={["Yes", "No", "Extra Charge"]} value={customValues.setupPickup} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="propsTypes" label="What types of props do you usually provide?" type="textarea" value={customValues.propsTypes} onChange={handleChange} placeholder="e.g. Vintage furniture, Modern decor, Electronics..." />
                                            <Select name="propsStyles" label="Are your props available in multiple styles or themes?" options={["Yes", "No", "Depends on Request"]} value={customValues.propsStyles} onChange={handleChange} />
                                            <Select name="propsMaintenance" label="Do you maintain props in shoot-ready condition (cleaning/repairs)?" options={["Yes", "No"]} value={customValues.propsMaintenance} onChange={handleChange} />
                                        </div>

                                        {/* Disclaimer */}
                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>

                                        <SectionTitle title="Profile / Inventory Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Studio Renting */}
                                {selectedCategory === "Studio Renting" && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>What are your rental charges per day or per hour?</label>
                                                <input className={styles.input} type="text" name="pay_rates" value={profile.pay_rates ?? ''} onChange={handleChange} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Studio Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={profile.emergency_contact} onChange={handleChange} />
                                            <Field name="workExperience" label="How many years have you been renting out studios?" value={customValues.workExperience} onChange={handleChange} />
                                            <Field name="studioType" label="What type of studio do you provide?" value={customValues.studioType} onChange={handleChange} placeholder="e.g. Daylight, Chroma, Soundproof..." />
                                            <Field name="studioSize" label="What is the usual studio area / size?" value={customValues.studioSize} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Select name="studioEquipment" label="Do you provide lighting, props, and equipment along with the studio?" options={["Yes", "No", "Extra Charge"]} value={customValues.studioEquipment} onChange={handleChange} />
                                            <Select name="studioParking" label="Do you provide parking and easy access for crew and equipment?" options={["Yes", "No", "Limited"]} value={customValues.studioParking} onChange={handleChange} />
                                            <Select name="studioFacilities" label="Do you have air conditioning, power backup, and other essential facilities?" options={["Yes", "No", "Partial"]} value={customValues.studioFacilities} onChange={handleChange} />
                                            <Select name="studioRules" label="Do you allow food, makeup, and prop setup inside the studio?" options={["Yes", "No", "Restricted Area"]} value={customValues.studioRules} onChange={handleChange} />
                                            <Select name="studioCustomSetups" label="Are you open to customized setups or themed shoots?" options={["Yes", "No", "Discuss First"]} value={customValues.studioCustomSetups} onChange={handleChange} />
                                        </div>

                                        {/* Disclaimer */}
                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>

                                        <SectionTitle title="Profile / Studio Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Set Designer */}
                                {selectedCategory === "Set Designer" && (
                                    <>
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
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={profile.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={profile.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={profile.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Have you worked with any brands/agencies? (List them)" value={profile.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Do you work independently or through an agency?</label>
                                                <select name="agency_status" className={styles.select} value={profile.agency_status ?? ''} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <Field name="pay_rates" label="Charges (per day/project)" value={profile.pay_rates} onChange={handleChange} />
                                            <div className={styles.formGroup}>
                                                <label>Can you travel to Surat for shoots?</label>
                                                <select name="travel_surat" className={styles.select} value={profile.travel_surat ?? ''} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Design Expertise" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="workExperience" label="How many years of experience do you have in set designing?" value={customValues.workExperience} onChange={handleChange} />
                                            <Select name="setPropsHandler" label="Do you handle props, furniture, and decor as part of your set design?" options={["Yes", "No", "Partial"]} value={customValues.setPropsHandler} onChange={handleChange} />
                                            <Select name="setIndoorOutdoor" label="Are you comfortable designing sets for indoor and outdoor shoots?" options={["Both", "Indoor Only", "Outdoor Only"]} value={customValues.setIndoorOutdoor} onChange={handleChange} />
                                            <Select name="setVisuals" label="Do you provide 3D sketches, mood boards, or visual concepts before execution?" options={["Yes", "No", "Upon Request"]} value={customValues.setVisuals} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Select name="setBudget" label="Can you work within a budget and source materials accordingly?" options={["Yes", "No"]} value={customValues.setBudget} onChange={handleChange} />
                                            <Select name="setInstallation" label="Do you handle set installation and dismantling yourself or coordinate a team?" options={["Use My Team", "Myself", "Coordinate with Production"]} value={customValues.setInstallation} onChange={handleChange} />
                                            <Select name="setCollaboration" label="Are you comfortable collaborating with photographers, stylists, and art directors?" options={["Yes", "No"]} value={customValues.setCollaboration} onChange={handleChange} />
                                        </div>

                                        {/* Disclaimer */}
                                        <div style={{ padding: '20px', background: 'rgba(255, 190, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)', margin: '30px 0' }}>
                                            <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                    style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                                    <strong>Important:</strong> I acknowledge that <strong>Monkey Ads</strong> holds exclusive, perpetual ownership and usage rights for all content produced during our collaboration, across all media and platforms.
                                                </span>
                                            </label>
                                        </div>

                                        <SectionTitle title="Profile / Work Photo" />
                                        <div className={styles.formGroup}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {profile.profile_photo_url ? (
                                                    <img src={profile.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                                ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                                <div>
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Other Categories (Remainder) */}
                                {!["Actor", "Model", "Anchor", "Makeup Artist", "Stylist", "Art Direction", "Photographer", "Video Editor", "Videographer", "Internship in Acting", "Internship in Modeling", "Internship in Anchoring", "Props Renting", "Studio Renting", "Set Designer"].includes(selectedCategory) && (
                                    <>
                                        <Field name="bio" label="Bio / Description" type="textarea" value={profile.bio} onChange={handleChange} fullWidth />
                                        <SectionTitle title="Photos & Media" />
                                        <div className={styles.formGroup}>
                                            <label>Profile Photo</label>
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                        </div>
                                        <div style={{ marginTop: '20px' }}>
                                            <label style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    name="content_rights_agreed"
                                                    checked={profile.content_rights_agreed}
                                                    onChange={handleChange}
                                                />
                                                <span>I acknowledge that Monkey Ads holds exclusive rights for content produced.</span>
                                            </label>
                                        </div>
                                    </>
                                )}
                                <div style={{ marginTop: '40px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }} disabled={submitting}>
                                        {submitting ? 'Saving Profile...' : 'Save Profile'} <Save size={20} style={{ marginLeft: '10px' }} />
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

function Field({ label, name, value, onChange, type = "text", placeholder, required, fullWidth }: any) {
    return (
        <div className={styles.formGroup} style={fullWidth ? { gridColumn: '1 / -1' } : {}}>
            <label>{label}</label>
            {type === 'textarea' ? (
                <textarea className={styles.textarea} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={4} required={required} />
            ) : (
                <input className={styles.input} type={type} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} required={required} />
            )}
        </div>
    )
}

function Select({ label, name, value, onChange, options }: any) {
    return (
        <div className={styles.formGroup}>
            <label>{label}</label>
            <select className={styles.select} name={name} value={value ?? ''} onChange={onChange}>
                <option value="">Select...</option>
                {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    )
}
