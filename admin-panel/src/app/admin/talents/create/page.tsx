'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormField } from '@/types'
import { useAuth } from '@/context/AuthContext'

export default function CreateTalent() {
    const { user } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')

    const [formData, setFormData] = useState<any>({
        internal_name: '',
        internal_email: '',
        internal_mobile: '',
        gender: '',
        dob: '',
        city: '',
        state: '',
        country: 'India',
        height_cm: '',
        weight_kg: '',
        chest_in: '',
        waist_in: '',
        hips_in: '',
        skin_tone: '',
        hair_color: '',
        eye_color: '',
        category: 'Actor',
        years_experience: 0,
        languages: '',
        skills: '',
        past_work: '',
        portfolio_links: '',
        interested_in: [],
        willing_to_travel: false,
        profile_photo_url: '',
        intro_video_url: ''
    })

    const [customFieldsSchema, setCustomFieldsSchema] = useState<FormField[]>([])
    const [customValues, setCustomValues] = useState<Record<string, any>>({})

    useEffect(() => {
        const fetchSchema = async () => {
            const { data } = await supabase.from('form_fields').select('*').order('order_index')
            if (data) setCustomFieldsSchema(data as FormField[])
        }
        fetchSchema()
    }, [])

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        if (type === 'checkbox' && name === 'willing_to_travel') {
            setFormData({ ...formData, [name]: checked })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const handleCustomChange = (e: any, fieldName: string, type: string) => {
        const { value, checked } = e.target
        const val = type === 'checkbox' ? checked : value
        setCustomValues(prev => ({ ...prev, [fieldName]: val }))
    }

    const handleFileUpload = async (e: any, field: string) => {
        const file = e.target.files[0]
        if (!file || !user) return

        try {
            setSubmitting(true)
            const fileExt = file.name.split('.').pop()
            // Using user.id to satisfy RLS policy
            const fileName = `${user.id}/${field}_${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('talent-media')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('talent-media').getPublicUrl(fileName)
            setFormData({ ...formData, [field]: data.publicUrl })
            setMessage('File uploaded successfully!')
        } catch (error: any) {
            console.error('Upload error:', error)
            setMessage('Upload failed: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage('')

        try {
            const languagesArray = formData.languages.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            const skillsArray = formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            const portfolioArray = formData.portfolio_links.split('\n').map((s: string) => s.trim()).filter((s: string) => s)

            const payload = {
                ...formData,
                dob: formData.dob || null,
                height_cm: formData.height_cm || null,
                weight_kg: formData.weight_kg || null,
                chest_in: formData.chest_in || null,
                waist_in: formData.waist_in || null,
                hips_in: formData.hips_in || null,
                years_experience: formData.years_experience || 0,
                languages: languagesArray,
                skills: skillsArray,
                portfolio_links: portfolioArray,
                is_hidden: true, // Hidden by default
                custom_fields: customValues
            }

            const { error } = await supabase
                .from('talent_profiles')
                .insert(payload)

            if (error) throw error

            setMessage('Talent profile created successfully (Hidden).')
            setTimeout(() => router.push('/admin/talents'), 1500)
        } catch (error: any) {
            setMessage('Error creating profile: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="container section">
            <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to List
            </Link>

            <div className={styles.card} style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '30px' }}>Add New Talent Manually</h1>

                {message && <div style={{ padding: '10px', background: 'var(--surface-highlight)', marginBottom: '20px', borderRadius: '4px' }}>{message}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>

                    {/* Admin Fields */}
                    <section>
                        <h3 className="gold-text" style={{ marginBottom: '15px' }}>Basic Info</h3>
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label>Full Name *</label>
                                <input type="text" name="internal_name" value={formData.internal_name} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input type="email" name="internal_email" value={formData.internal_email} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mobile</label>
                                <input type="tel" name="internal_mobile" value={formData.internal_mobile} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* Copied Profile Fields (Simplified for brevity) */}
                    <section>
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="Actor">Actor</option>
                                    <option value="Model">Model</option>
                                    <option value="Anchor">Anchor</option>
                                    <option value="Makeup Artist">Makeup Artist</option>
                                    <option value="Stylist">Stylist</option>
                                    <option value="Photographer">Photographer</option>
                                    <option value="Videographer">Videographer</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* Dynamic Fields */}
                    {customFieldsSchema.length > 0 && (
                        <section>
                            <h3 className="gold-text" style={{ marginBottom: '15px' }}>Custom Fields</h3>
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {customFieldsSchema.map((field) => (
                                    <div className={styles.formGroup} key={field.id}>
                                        <label>{field.label} {field.required && '*'}</label>

                                        {field.type === 'dropdown' ? (
                                            <select
                                                onChange={(e) => handleCustomChange(e, field.name, field.type)}
                                                required={field.required}
                                            >
                                                <option value="">Select</option>
                                                {field.options?.map((opt: string) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'checkbox' ? (
                                            <div style={{ marginTop: '5px' }}>
                                                <input
                                                    type="checkbox"
                                                    style={{ width: 'auto', marginRight: '8px' }}
                                                    onChange={(e) => handleCustomChange(e, field.name, field.type)}
                                                />
                                                <span>Yes</span>
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                onChange={(e) => handleCustomChange(e, field.name, field.type)}
                                                required={field.required}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Talent'} <Save size={18} style={{ marginLeft: '8px' }} />
                    </button>
                </form>
            </div>
        </div>
    )
}
