'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabaseClient'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
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

export default function CreateTalent() {
    const { user } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')

    const [formData, setFormData] = useState<any>({
        // Admin specfic
        internal_name: '',
        internal_email: '',
        internal_mobile: '',

        // Profile Columns
        city: '',
        age: '',
        dob: '',
        whatsapp_number: '',
        emergency_contact: '',
        category: '',   // Init empty so they must select
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

        // Handle Admin Internal Fields mapping
        if (['internal_name', 'internal_email', 'internal_mobile'].includes(name)) {
            setFormData({ ...formData, [name]: value })
            return
        }

        // Special handling for checkboxes/travel_surat
        if (name === 'travel_surat') {
            setFormData({ ...formData, [name]: value })
            return
        }

        if (type === 'checkbox') {
            if (name === 'content_rights_agreed') {
                setFormData({ ...formData, [name]: checked })
                return
            }
            // Other checkboxes -> Custom
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
        alert("File upload disabled in PHP migration V1.")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        alert("Manual talent creation is disabled in PHP migration V1. Please register via the public registration page.")
    }

    const selectedCategory = formData.category

    return (
        <div className="container section">
            <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to List
            </Link>

            <div className={styles.card} style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '30px' }}>Add New Talent Manually</h1>

                {message && <div style={{ padding: '10px', background: 'var(--surface-highlight)', marginBottom: '20px', borderRadius: '4px' }}>{message}</div>}

                <form onSubmit={handleSubmit}>

                    {/* Basic Admin Info Header */}
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                        <div className={styles.formGroup}>
                            <label>Full Name *</label>
                            <input type="text" className={styles.input} name="internal_name" value={formData.internal_name} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email (Internal)</label>
                            <input type="email" className={styles.input} name="internal_email" value={formData.internal_email} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Mobile (Internal)</label>
                            <input type="tel" className={styles.input} name="internal_mobile" value={formData.internal_mobile} onChange={handleChange} />
                        </div>
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
                                {/* ACTOR / MODEL / ANCHOR */}
                                {["Actor", "Model", "Anchor"].includes(selectedCategory) && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
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

                                        <h4 style={{ marginTop: '20px', marginBottom: '15px', color: 'var(--text-muted)' }}>Physical Stats</h4>
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                                            <Field name="height_cm" label="Height (cm)" type="number" value={formData.height_cm} onChange={handleChange} />
                                            <Field name="weight_kg" label="Weight (kg)" type="number" value={formData.weight_kg} onChange={handleChange} />
                                            <Field name="chest_in" label="Chest/Bust (in)" value={formData.chest_in} onChange={handleChange} />
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
                                            <Field name="years_experience" label="Experience (Years)" value={formData.years_experience} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="skills" label="Skills" value={formData.skills} onChange={handleChange} />
                                            <Field name="bio" label="Bio" type="textarea" value={formData.bio} onChange={handleChange} fullWidth />
                                        </div>
                                    </>
                                )}

                                {/* Makeup Artist */}
                                {selectedCategory === "Makeup Artist" && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={formData.city} onChange={handleChange} required />
                                        </div>
                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Portfolio Links</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={formData.portfolio_links} onChange={handleChange} />
                                        </div>
                                        <Field name="past_brand_work" label="Past Brands" value={formData.past_brand_work} onChange={handleChange} />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <Field name="pay_rates" label="Charges" value={formData.pay_rates} onChange={handleChange} />
                                            <Select name="travel_surat" label="Travel to Surat?" options={['Yes', 'No']} value={formData.travel_surat} onChange={handleChange} />
                                        </div>
                                        <SectionTitle title="Specific Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="workExperience" label="Experience (Years)" value={customValues.workExperience} onChange={handleChange} />
                                            <Field name="languages" label="Languages" value={formData.languages} onChange={handleChange} />
                                            <Field name="social_links" label="Social Link" value={formData.social_links} onChange={handleChange} />
                                        </div>
                                        <div style={{ marginTop: '20px' }}>
                                            <Select name="indoorOutdoor" label="Comfortable with Indoor & Outdoor?" options={["Yes", "No", "Indoor Only", "Outdoor Only"]} value={customValues.indoorOutdoor} onChange={handleChange} />
                                            <Select name="maleFemaleMakeup" label="Makeup for Male & Female?" options={["Both", "Female Only", "Male Only"]} value={customValues.maleFemaleMakeup} onChange={handleChange} />
                                            <Select name="hairStyling" label="Provide Hair Styling?" options={["Yes", "No", "Basic Only"]} value={customValues.hairStyling} onChange={handleChange} />
                                        </div>
                                        <Field name="bio" label="Bio" type="textarea" value={formData.bio} onChange={handleChange} fullWidth />
                                    </>
                                )}

                                {/* Stylist */}
                                {selectedCategory === "Stylist" && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} required />
                                            <Field name="city" label="City" value={formData.city} onChange={handleChange} required />
                                        </div>
                                        <SectionTitle title="Work" />
                                        <div className={styles.formGroup}>
                                            <label>Portfolio Links</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={formData.portfolio_links} onChange={handleChange} />
                                        </div>
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="pay_rates" label="Charges" value={formData.pay_rates} onChange={handleChange} />
                                            <Select name="travel_surat" label="Travel to Surat?" options={['Yes', 'No']} value={formData.travel_surat} onChange={handleChange} />
                                        </div>
                                        <SectionTitle title="Specifics" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="workExperience" label="Experience (Years)" value={customValues.workExperience} onChange={handleChange} />
                                            <Field name="projectTypes" label="Project Types" value={customValues.projectTypes} onChange={handleChange} />
                                        </div>
                                        <Field name="bio" label="Bio" type="textarea" value={formData.bio} onChange={handleChange} fullWidth />
                                    </>
                                )}

                                {/* Art Director */}
                                {selectedCategory === "Art Direction" && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} required />
                                            <Field name="city" label="City" value={formData.city} onChange={handleChange} required />
                                        </div>
                                        <SectionTitle title="Work" />
                                        <div className={styles.formGroup}>
                                            <label>Portfolio Links</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={formData.portfolio_links} onChange={handleChange} />
                                        </div>
                                        <SectionTitle title="Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="workExperience" label="Experience (Years)" value={customValues.workExperience} onChange={handleChange} />
                                            <Select name="studioLocation" label="Studio & Location?" options={["Yes", "No", "Studio Only", "Location Only"]} value={customValues.studioLocation} onChange={handleChange} />
                                            <Select name="conceptSketches" label="Provide Concept Sketches?" options={["Yes", "No", "Upon Request"]} value={customValues.conceptSketches} onChange={handleChange} />
                                        </div>
                                        <Field name="bio" label="Bio" type="textarea" value={formData.bio} onChange={handleChange} fullWidth />
                                    </>
                                )}

                                {/* Photographer / Videographer / Internships */}
                                {["Photographer", "Videographer", "Internship in Acting", "Internship in Modeling", "Internship in Anchoring"].includes(selectedCategory) && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} required />
                                            <Field name="city" label="City" value={formData.city} onChange={handleChange} required />
                                        </div>
                                        <SectionTitle title="Work" />
                                        <div className={styles.formGroup}>
                                            <label>Portfolio Links</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={formData.portfolio_links} onChange={handleChange} />
                                        </div>
                                        <SectionTitle title="Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="workExperience" label="Experience (Years)" value={customValues.workExperience} onChange={handleChange} />
                                            <Field name="projectTypes" label="Project Types" value={customValues.projectTypes} onChange={handleChange} />
                                            <Field name="skills" label="Skills" value={formData.skills} onChange={handleChange} />
                                        </div>
                                        <Field name="bio" label="Bio" type="textarea" value={formData.bio} onChange={handleChange} fullWidth />
                                    </>
                                )}

                                {/* Video Editor */}
                                {selectedCategory === "Video Editor" && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
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

                                        <SectionTitle title="Specific Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={formData.emergency_contact} onChange={handleChange} />
                                            <Field name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} />
                                            <Field name="social_links" label="Personal Instagram / Social Link" value={formData.social_links} onChange={handleChange} />
                                            <Field name="workExperience" label="Experience (Years)" value={customValues.workExperience} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="projectTypes" label="Project Types" value={customValues.projectTypes} onChange={handleChange} />
                                            <Field name="bio" label="Bio / About Yourself" type="textarea" value={formData.bio} onChange={handleChange} fullWidth />
                                        </div>
                                    </>
                                )}

                                {/* Props Renting */}
                                {selectedCategory === "Props Renting" && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={formData.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links</label>
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
                                            <div className={styles.formGroup}>
                                                <label>Rental Charges</label>
                                                <input className={styles.input} type="text" name="pay_rates" value={formData.pay_rates ?? ''} onChange={handleChange} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Travel to Surat?</label>
                                                <select name="travel_surat" className={styles.select} value={formData.travel_surat} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Prop Details & Services" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact (Optional)" value={formData.emergency_contact} onChange={handleChange} />
                                            <Select name="ownInventory" label="Own Inventory?" options={["Yes", "No", "Partial"]} value={customValues.ownInventory} onChange={handleChange} />
                                            <Select name="propsDelivery" label="Delivery to Location?" options={["Yes", "No", "Chargeable"]} value={customValues.propsDelivery} onChange={handleChange} />
                                            <Select name="setupPickup" label="Setup and Pickup?" options={["Yes", "No", "Extra Charge"]} value={customValues.setupPickup} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Field name="propsTypes" label="Types of Props Provided" type="textarea" value={customValues.propsTypes} onChange={handleChange} placeholder="e.g. Vintage, Modern..." />
                                            <Select name="propsStyles" label="Multiple Styles Available?" options={["Yes", "No", "Depends on Request"]} value={customValues.propsStyles} onChange={handleChange} />
                                            <Select name="propsMaintenance" label="Shoot-ready Maintenance?" options={["Yes", "No"]} value={customValues.propsMaintenance} onChange={handleChange} />
                                        </div>
                                    </>
                                )}

                                {/* Studio Renting */}
                                {selectedCategory === "Studio Renting" && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={formData.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={formData.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Has worked with brands?" value={formData.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Agency Status</label>
                                                <select name="agency_status" className={styles.select} value={formData.agency_status} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Rental Charges</label>
                                                <input className={styles.input} type="text" name="pay_rates" value={formData.pay_rates ?? ''} onChange={handleChange} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Travel to Surat?</label>
                                                <select name="travel_surat" className={styles.select} value={formData.travel_surat} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Studio Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="emergency_contact" label="Emergency Contact" value={formData.emergency_contact} onChange={handleChange} />
                                            <Field name="workExperience" label="Years Renting Out?" value={customValues.workExperience} onChange={handleChange} />
                                            <Field name="studioType" label="Studio Type" value={customValues.studioType} onChange={handleChange} placeholder="e.g. Daylight, Chroma..." />
                                            <Field name="studioSize" label="Studio Size" value={customValues.studioSize} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Select name="studioEquipment" label="Equipment Included?" options={["Yes", "No", "Extra Charge"]} value={customValues.studioEquipment} onChange={handleChange} />
                                            <Select name="studioParking" label="Parking Available?" options={["Yes", "No", "Limited"]} value={customValues.studioParking} onChange={handleChange} />
                                            <Select name="studioFacilities" label="Facilities (AC/Power)?" options={["Yes", "No", "Partial"]} value={customValues.studioFacilities} onChange={handleChange} />
                                            <Select name="studioRules" label="Allow Food/Makeup?" options={["Yes", "No", "Restricted Area"]} value={customValues.studioRules} onChange={handleChange} />
                                            <Select name="studioCustomSetups" label="Open to Custom Setups?" options={["Yes", "No", "Discuss First"]} value={customValues.studioCustomSetups} onChange={handleChange} />
                                        </div>
                                    </>
                                )}

                                {/* Set Designer */}
                                {selectedCategory === "Set Designer" && (
                                    <>
                                        <SectionTitle title="Personal & Contact Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+91..." required />
                                            <Field name="city" label="Current City / Location" value={formData.city} onChange={handleChange} required />
                                        </div>

                                        <SectionTitle title="Work & Experience" />
                                        <div className={styles.formGroup}>
                                            <label>Relevant Work Links</label>
                                            <textarea name="portfolio_links" className={styles.textarea} rows={3} value={formData.portfolio_links} onChange={handleChange} placeholder="Paste links here..." />
                                        </div>

                                        <Field name="past_brand_work" label="Has worked with brands?" value={formData.past_brand_work} onChange={handleChange} />

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                            <div className={styles.formGroup}>
                                                <label>Agency Status</label>
                                                <select name="agency_status" className={styles.select} value={formData.agency_status} onChange={handleChange}>
                                                    <option value="">Select...</option>
                                                    <option value="Independent">Independent</option>
                                                    <option value="Agency">Agency Signed</option>
                                                </select>
                                            </div>
                                            <Field name="pay_rates" label="Charges" value={formData.pay_rates} onChange={handleChange} />
                                            <div className={styles.formGroup}>
                                                <label>Travel to Surat?</label>
                                                <select name="travel_surat" className={styles.select} value={formData.travel_surat} onChange={handleChange}>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <SectionTitle title="Design Expertise" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="workExperience" label="Experience (Years)" value={customValues.workExperience} onChange={handleChange} />
                                            <Select name="setPropsHandler" label="Handle Props/Decor?" options={["Yes", "No", "Partial"]} value={customValues.setPropsHandler} onChange={handleChange} />
                                            <Select name="setIndoorOutdoor" label="Indoor & Outdoor?" options={["Both", "Indoor Only", "Outdoor Only"]} value={customValues.setIndoorOutdoor} onChange={handleChange} />
                                            <Select name="setVisuals" label="Provide Visuals/Sketches?" options={["Yes", "No", "Upon Request"]} value={customValues.setVisuals} onChange={handleChange} />
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Select name="setBudget" label="Work within Budget?" options={["Yes", "No"]} value={customValues.setBudget} onChange={handleChange} />
                                            <Select name="setInstallation" label="Installation?" options={["Use My Team", "Myself", "Coordinate with Production"]} value={customValues.setInstallation} onChange={handleChange} />
                                            <Select name="setCollaboration" label="Collaborate with others?" options={["Yes", "No"]} value={customValues.setCollaboration} onChange={handleChange} />
                                        </div>
                                    </>
                                )}

                                {/* Others/Fallback */}
                                {!["Actor", "Model", "Anchor", "Makeup Artist", "Stylist", "Art Direction", "Photographer", "Video Editor", "Videographer", "Internship in Acting", "Internship in Modeling", "Internship in Anchoring", "Props Renting", "Studio Renting", "Set Designer"].includes(selectedCategory) && (
                                    <>
                                        <SectionTitle title="General Details" />
                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                            <Field name="whatsapp_number" label="WhatsApp Number" value={formData.whatsapp_number} onChange={handleChange} required />
                                            <Field name="city" label="City" value={formData.city} onChange={handleChange} required />
                                        </div>
                                        <Field name="bio" label="Bio / Description" type="textarea" value={formData.bio} onChange={handleChange} fullWidth />
                                    </>
                                )}

                                <SectionTitle title="Profile Photo" />
                                <div className={styles.formGroup}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        {formData.profile_photo_url ? (
                                            <img src={formData.profile_photo_url} style={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover' }} alt="Profile" />
                                        ) : <div style={{ width: 100, height: 100, background: '#333', borderRadius: '12px' }}></div>}
                                        <div>
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
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
