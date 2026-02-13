'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api, { uploadFile } from '@/lib/api'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import GalleryModal from '@/components/GalleryModal'

const CATEGORIES = [
    "Actor", "Model", "Anchor", "Makeup Artist", "Stylist", "Art Direction",
    "Photographer", "Videographer", "Video Editor", "Internship in Acting",
    "Internship in Modeling", "Internship in Anchoring", "Props Renting",
    "Studio Renting", "Set Designer"
]

function EditForm() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const router = useRouter()

    const [user, setUser] = useState<any>({})
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [modalUrl, setModalUrl] = useState<string | null>(null)

    const [profile, setProfile] = useState<any>({
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
        profile_photo_url: '',
        gallery_urls: [] as string[],
        intro_video_url: '',
        social_links: '',
        deleted_at: null
    })

    const [customValues, setCustomValues] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)

    // Safe Parsing Helpers
    const safeParseArray = (value: any): any[] => {
        if (!value) return []
        if (Array.isArray(value)) return value
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value)
                if (Array.isArray(parsed)) return parsed
            } catch (e) {
                // If it looks like a comma-separated list, split it
                if (value.includes(',')) return value.split(',').map(s => s.trim())
                // Otherwise treat as single item array
                return [value]
            }
        }
        return []
    }

    const safeParseObject = (value: any) => {
        if (typeof value === 'object' && value !== null) return value
        if (typeof value === 'string') {
            try { return JSON.parse(value) } catch (e) { return {} }
        }
        return {}
    }

    useEffect(() => {
        if (id) {
            const loadData = async () => {
                try {
                    const { data } = await api.get(`/profile.php?id=${id}`)

                    if (data) {
                        setUser({
                            name: data.name,
                            email: data.email,
                            mobile: data.mobile
                        })

                        setProfile({
                            ...data,
                            // Ensure these are strings for the text areas/inputs
                            skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
                            languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || ''),
                            portfolio_links: Array.isArray(data.portfolio_links) ? data.portfolio_links.join('\n') : (data.portfolio_links || ''),

                            travel_surat: data.travel_surat ? 'Yes' : 'No',
                            category: data.category || '',

                            // Gallery should be an array
                            gallery_urls: safeParseArray(data.gallery_urls)
                        })

                        setCustomValues(safeParseObject(data.custom_fields))
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

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        const val = type === 'checkbox' ? checked : value

        if (name === 'whatsapp_number') {
            // numeric only
            const v = value.replace(/[^0-9]/g, '').slice(0, 10);
            setProfile((prev: any) => ({ ...prev, [name]: v }))
            return
        }

        const columnFields = Object.keys(profile)
        if (columnFields.includes(name)) {
            setProfile((prev: any) => ({ ...prev, [name]: val }))
        } else {
            setCustomValues(prev => ({ ...prev, [name]: val }))
        }
    }

    const handleFileUpload = async (e: any, fieldName: string) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setSubmitting(true)
            setIsUploading(true)
            setMessage('Uploading...')

            const response = await uploadFile(file, (percent) => setUploadProgress(percent))

            let publicUrl = response.url
            if (publicUrl.startsWith('/')) {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://hoopcasting.com/php_backend/api';
                // Adjust if needed, or rely on relative
                // Usually backend returns full path or relative to domain
            }

            setProfile((prev: any) => ({ ...prev, [fieldName]: publicUrl }))
            setMessage('Upload successful')
        } catch (err: any) {
            setMessage('Upload error: ' + err.message)
        } finally {
            setSubmitting(false)
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                id: id,
                ...profile,
                skills: profile.skills, // Send as string to avoid JSON encoding issues
                languages: profile.languages,
                portfolio_links: profile.portfolio_links,
                travel_surat: profile.travel_surat === 'Yes',
                custom_fields: customValues
            }

            await api.post('/admin/update_profile.php', payload)
            setMessage('Profile updated successfully!')
            window.scrollTo(0, 0)

        } catch (err: any) {
            setMessage('Error: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="container section">Loading...</div>

    return (
        <div className="container section">
            <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Back to List
            </Link>

            <div className={styles.card}>
                <h1 className="title-gradient" style={{ marginBottom: '5px' }}>Edit Talent Profile</h1>
                <p style={{ marginBottom: '20px', color: '#666' }}>Editing: {user.name} ({user.email})</p>

                {message && <div style={{ padding: '10px', background: '#eee', marginBottom: '20px', borderRadius: '4px' }}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    <SectionTitle title="Core Info" />
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select className={styles.select} name="category" value={profile.category} onChange={handleChange}>
                                <option value="">Select...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Field name="city" label="City" value={profile.city} onChange={handleChange} />
                        <Field name="whatsapp_number" label="WhatsApp" value={profile.whatsapp_number} onChange={handleChange} />
                    </div>

                    <SectionTitle title="Details" />
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                        <Field name="age" label="Age" type="number" value={profile.age} onChange={handleChange} />
                        <Field name="height_cm" label="Height (cm)" type="number" value={profile.height_cm} onChange={handleChange} />
                        <Field name="weight_kg" label="Weight (kg)" type="number" value={profile.weight_kg} onChange={handleChange} />
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <Field name="bio" label="Bio" type="textarea" value={profile.bio} onChange={handleChange} />
                        <Field name="portfolio_links" label="Portfolio Links (One per line)" type="textarea" value={profile.portfolio_links} onChange={handleChange} />
                    </div>

                    <SectionTitle title="Media" />
                    <div className={styles.formGroup}>
                        <label>Profile Photo</label>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            {profile.profile_photo_url && <img src={profile.profile_photo_url} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }} />}
                            <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                        </div>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <button className="btn btn-primary" type="submit" disabled={submitting || isUploading}>
                            {submitting ? 'Saving...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function SectionTitle({ title }: { title: string }) {
    return <h3 className="gold-text" style={{ marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #ddd' }}>{title}</h3>
}

function Field({ label, name, value, onChange, type = "text", ...props }: any) {
    return (
        <div className={styles.formGroup}>
            <label>{label}</label>
            {type === 'textarea' ?
                <textarea className={styles.textarea} name={name} value={value || ''} onChange={onChange} rows={4} {...props} /> :
                <input className={styles.input} type={type} name={name} value={value || ''} onChange={onChange} {...props} />
            }
        </div>
    )
}

export default function AdminEditTalent() {
    return <Suspense fallback={<div>Loading...</div>}><EditForm /></Suspense>
}
