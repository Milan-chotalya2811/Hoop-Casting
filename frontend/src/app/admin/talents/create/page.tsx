'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

const CATEGORIES = [
    "Actor", "Model", "Anchor", "Makeup Artist", "Stylist", "Art Direction",
    "Photographer", "Videographer", "Video Editor", "Internship in Acting",
    "Internship in Modeling", "Internship in Anchoring", "Props Renting",
    "Studio Renting", "Set Designer"
]

export default function CreateTalent() {
    const { user } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')

    const [formData, setFormData] = useState<any>({
        // User Account Basic Info
        name: '',
        email: '',
        mobile: '',
        password: '', // Optional default

        // Profile Columns
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
        intro_video_url: '',
        social_links: '',
    })

    const [customValues, setCustomValues] = useState<Record<string, any>>({})

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target

        // Admin User Fields
        if (['name', 'email', 'mobile', 'password'].includes(name)) {
            setFormData({ ...formData, [name]: value })
            return
        }

        if (name === 'travel_surat') {
            setFormData({ ...formData, [name]: value })
            return
        }

        if (type === 'checkbox') {
            if (name === 'content_rights_agreed') {
                setFormData({ ...formData, [name]: checked })
                return
            }
            setCustomValues(prev => ({ ...prev, [name]: checked }))
            return
        }

        const columnFields = [
            'category', 'city', 'age', 'dob', 'whatsapp_number', 'emergency_contact',
            'bio', 'skills', 'languages', 'portfolio_links', 'past_brand_work',
            'agency_status', 'pay_rates', 'intro_video_url', 'profile_photo_url',
            'social_links', 'content_rights_agreed',
            'chest_in', 'waist_in', 'hips_in', 'skin_tone', 'hair_color', 'eye_color', 'height_cm', 'weight_kg'
        ]

        if (columnFields.includes(name)) {
            setFormData({ ...formData, [name]: value })
        } else {
            setCustomValues(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleFileUpload = async (e: any, fieldName: string, isCustom = false) => {
        alert("Please set up profile first, then upload images in Edit mode. (File upload requires user ID)")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage('')

        try {
            if (!formData.name || !formData.email || !formData.mobile || !formData.category) {
                throw new Error("Name, Email, Mobile and Category are required.")
            }

            // Prepare Payload
            const payload = {
                ...formData,
                custom_fields: customValues
            }

            const { data } = await api.post('/admin/create_talent.php', payload)

            setMessage('Talent created successfully! Redirecting...')
            router.refresh()
            setTimeout(() => {
                router.push('/admin/talents')
            }, 500)

        } catch (err: any) {
            console.error(err)
            setMessage('Error: ' + (err.response?.data?.message || err.message))
        } finally {
            setSubmitting(false)
        }
    }

    const selectedCategory = formData.category

    return (
        <div className="container section">
            <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to List
            </Link>

            <div className={styles.card} style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '30px' }}>Add New Talent Manually</h1>

                {message && <div style={{
                    padding: '10px',
                    background: message.startsWith('Error') ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)',
                    color: message.startsWith('Error') ? 'red' : 'green',
                    marginBottom: '20px',
                    borderRadius: '4px'
                }}>{message}</div>}

                <form onSubmit={handleSubmit}>

                    {/* Basic Admin Info Header */}
                    <SectionTitle title="User Account Details (Required)" />
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <Field name="name" label="Full Name" value={formData.name} onChange={handleChange} required />
                        <Field name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                        <Field name="mobile" label="Mobile" type="tel" value={formData.mobile} onChange={handleChange} required />
                        <Field name="password" label="Password (Optional - Default: Hoop@123)" type="text" value={formData.password} onChange={handleChange} />
                    </div>

                    {/* 1. CATEGORY SELECTION */}
                    <div className={styles.formGroup} style={{ marginBottom: '30px' }}>
                        <label style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Select Category *</label>
                        <select
                            name="category"
                            className={styles.select}
                            value={formData.category} // Controlled
                            onChange={handleChange}
                            style={{ fontSize: '1.2rem', padding: '15px' }}
                            required
                        >
                            <option value="">-- Click to Select Category --</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. DYNAMIC FORM */}
                    <AnimatePresence mode="wait">
                        {selectedCategory && (
                            <motion.div
                                key={selectedCategory}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* SIMPLIFIED DYNAMIC FIELDS FOR ADMIN - Just show common blocks */}

                                <SectionTitle title="Personal & Contact Details" />
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                    <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+91..." />
                                    <Field name="city" label="Current City / Location" value={formData.city} onChange={handleChange} required />
                                </div>

                                <SectionTitle title="Work & Experience" />
                                <div className={styles.formGroup}>
                                    <label>Relevant Work Links (Drive, Insta, YouTube, Website)</label>
                                    <textarea name="portfolio_links" className={styles.textarea} rows={3} value={formData.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                </div>

                                <Field name="past_brand_work" label="Has worked with brands? (List them)" value={formData.past_brand_work} onChange={handleChange} />

                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                    <div className={styles.formGroup}>
                                        <label>Agency Status</label>
                                        <select name="agency_status" className={styles.select} value={formData.agency_status} onChange={handleChange}>
                                            <option value="">Select...</option>
                                            <option value="Independent">Independent</option>
                                            <option value="Agency">Agency Signed</option>
                                        </select>
                                    </div>
                                    <Field name="pay_rates" label="Charges (per day/project)" value={formData.pay_rates} onChange={handleChange} />
                                    <div className={styles.formGroup}>
                                        <label>Travel to Surat?</label>
                                        <select name="travel_surat" className={styles.select} value={formData.travel_surat} onChange={handleChange}>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                </div>

                                <SectionTitle title="Personal Stats" />
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                    <Field name="emergency_contact" label="Emergency Contact" value={formData.emergency_contact} onChange={handleChange} />
                                    <Field name="age" label="Age" type="number" value={formData.age} onChange={handleChange} />
                                    <Field name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} />
                                </div>

                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginTop: '15px' }}>
                                    <Field name="height_cm" label="Height (cm)" type="number" value={formData.height_cm} onChange={handleChange} />
                                    <Field name="weight_kg" label="Weight (kg)" type="number" value={formData.weight_kg} onChange={handleChange} />
                                    <Field name="chest_in" label="Chest (in)" value={formData.chest_in} onChange={handleChange} />
                                    <Field name="waist_in" label="Waist (in)" value={formData.waist_in} onChange={handleChange} />
                                    <Field name="hips_in" label="Hips (in)" value={formData.hips_in} onChange={handleChange} />
                                    <Field name="skin_tone" label="Skin Tone" value={formData.skin_tone} onChange={handleChange} />
                                    <Field name="eye_color" label="Eye Color" value={formData.eye_color} onChange={handleChange} />
                                    <Field name="hair_color" label="Hair Color" value={formData.hair_color} onChange={handleChange} />
                                </div>

                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
                                    <Field name="languages" label="Languages" value={formData.languages} onChange={handleChange} />
                                    <Field name="social_links" label="Social Link" value={formData.social_links} onChange={handleChange} />
                                    <Field name="intro_video_url" label="Intro Video Link" value={formData.intro_video_url} onChange={handleChange} />
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <Field name="skills" label="Skills" value={formData.skills} onChange={handleChange} />
                                    <Field name="bio" label="Bio" type="textarea" value={formData.bio} onChange={handleChange} fullWidth />
                                </div>

                                <div className={styles.formGroup} style={{ marginTop: '20px' }}>
                                    <label style={{ display: 'flex', gap: '10px' }}>
                                        <input type="checkbox" name="content_rights_agreed" checked={formData.content_rights_agreed} onChange={handleChange} />
                                        <span>Content Rights Agreed (Admin Override)</span>
                                    </label>
                                </div>

                                <div style={{ marginTop: '40px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }} disabled={submitting}>
                                        {submitting ? 'Creating Profile...' : 'Create Talent'} <Save size={20} style={{ marginLeft: '10px' }} />
                                    </button>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
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
