'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/components/Form.module.css'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormField } from '@/types'
import { useAuth } from '@/context/AuthContext'

export default function EditTalent() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [isLinkedUser, setIsLinkedUser] = useState(false)
    const [linkedUserId, setLinkedUserId] = useState<string | null>(null)

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
        const init = async () => {
            // 1. Fetch Schema
            const { data: schema } = await supabase.from('form_fields').select('*').order('order_index')
            if (schema) setCustomFieldsSchema(schema as FormField[])

            // 2. Fetch Talent Data
            const { data: talent, error } = await supabase
                .from('talent_profiles')
                .select('*, users(name, email, mobile)')
                .eq('id', id)
                .single()

            if (error || !talent) {
                setMessage('Error loading talent: ' + (error?.message || 'Not found'))
                setLoading(false)
                return
            }

            // 3. Pre-fill Form
            let baseData = { ...talent }

            // Handle Linked User vs Internal
            if (talent.user_id && talent.users) {
                setIsLinkedUser(true)
                setLinkedUserId(talent.user_id)
                // Use User table data if available, mapped to internal fields for the form state
                baseData.internal_name = talent.users.name || talent.internal_name || ''
                baseData.internal_email = talent.users.email || talent.internal_email || ''
                baseData.internal_mobile = talent.users.mobile || talent.internal_mobile || ''
            }

            // Helper to safe-string
            const safeStr = (v: any) => v || ''

            setFormData({
                ...baseData,
                languages: Array.isArray(baseData.languages) ? baseData.languages.join(', ') : safeStr(baseData.languages),
                skills: Array.isArray(baseData.skills) ? baseData.skills.join(', ') : safeStr(baseData.skills),
                portfolio_links: Array.isArray(baseData.portfolio_links) ? baseData.portfolio_links.join('\n') : safeStr(baseData.portfolio_links),
                dob: baseData.dob ? baseData.dob.split('T')[0] : '', // Format date for input
            })

            if (talent.custom_fields) {
                setCustomValues(talent.custom_fields)
            }

            setLoading(false)
        }
        init()
    }, [id])

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

    const handleCustomFileUpload = async (e: any, fieldName: string) => {
        const file = e.target.files[0]
        if (!file || !user) return

        try {
            setSubmitting(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `custom/${user.id}/${fieldName}_${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('talent-media')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('talent-media').getPublicUrl(fileName)

            setCustomValues(prev => ({ ...prev, [fieldName]: data.publicUrl }))
            setMessage(`File for ${fieldName} uploaded!`)
        } catch (error: any) {
            console.error('Custom upload error:', error)
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
            const languagesArray = typeof formData.languages === 'string' ? formData.languages.split(',').map((s: string) => s.trim()).filter((s: string) => s) : formData.languages
            const skillsArray = typeof formData.skills === 'string' ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : formData.skills
            const portfolioArray = typeof formData.portfolio_links === 'string' ? formData.portfolio_links.split('\n').map((s: string) => s.trim()).filter((s: string) => s) : formData.portfolio_links

            const commonPayload = {
                gender: formData.gender,
                dob: formData.dob || null,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                height_cm: formData.height_cm || null,
                weight_kg: formData.weight_kg || null,
                chest_in: formData.chest_in || null,
                waist_in: formData.waist_in || null,
                hips_in: formData.hips_in || null,
                skin_tone: formData.skin_tone,
                hair_color: formData.hair_color,
                eye_color: formData.eye_color,
                category: formData.category,
                years_experience: formData.years_experience || 0,
                languages: languagesArray,
                skills: skillsArray,
                past_work: formData.past_work,
                portfolio_links: portfolioArray,
                interested_in: formData.interested_in,
                willing_to_travel: formData.willing_to_travel,
                profile_photo_url: formData.profile_photo_url,
                intro_video_url: formData.intro_video_url,
                custom_fields: customValues
            }

            if (isLinkedUser && linkedUserId) {
                // Update USERS table for basic info
                const { error: userError } = await supabase.from('users').update({
                    name: formData.internal_name,
                    mobile: formData.internal_mobile
                }).eq('id', linkedUserId)

                if (userError) throw new Error('Failed to update Linked User info: ' + userError.message)

                // Update Profile
                const { error: profileError } = await supabase.from('talent_profiles').update(commonPayload).eq('id', id)
                if (profileError) throw profileError

            } else {
                // Update Internal Fields in Profile
                const internalPayload = {
                    ...commonPayload,
                    internal_name: formData.internal_name,
                    internal_email: formData.internal_email,
                    internal_mobile: formData.internal_mobile
                }
                const { error: profileError } = await supabase.from('talent_profiles').update(internalPayload).eq('id', id)
                if (profileError) throw profileError
            }

            setMessage('Talent profile updated successfully!')
            setTimeout(() => router.push('/admin/talents'), 1000)
        } catch (error: any) {
            setMessage('Error updating profile: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="container section">Loading Editor...</div>

    return (
        <div className="container section">
            <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to List
            </Link>

            <div className={styles.card} style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '30px' }}>Edit Talent Profile</h1>

                {message && <div style={{ padding: '10px', background: 'var(--surface-highlight)', marginBottom: '20px', borderRadius: '4px' }}>{message}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>

                    {/* Basic Info */}
                    <section>
                        <h3 className="gold-text" style={{ marginBottom: '15px' }}>Basic Info {isLinkedUser && '(Linked User)'}</h3>
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label>Full Name *</label>
                                <input type="text" name="internal_name" value={formData.internal_name} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email {(isLinkedUser) && '(Display Only)'}</label>
                                <input type="email" name="internal_email" value={formData.internal_email} onChange={handleChange} disabled={isLinkedUser} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mobile</label>
                                <input type="tel" name="internal_mobile" value={formData.internal_mobile} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* Copied Profile Fields */}
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
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Experience (Years)</label>
                                <input type="number" name="years_experience" value={formData.years_experience} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* Media Uploads */}
                    <section>
                        <h3 className="gold-text" style={{ marginBottom: '15px' }}>Media & Uploads</h3>
                        <div className={styles.formGroup}>
                            <label>Profile Photo</label>
                            {formData.profile_photo_url && (
                                <img src={formData.profile_photo_url} alt="Profile" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginBottom: '10px' }} />
                            )}
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Portfolio Links (One per line)</label>
                            <textarea name="portfolio_links" value={formData.portfolio_links} rows={3} placeholder="https://instagram.com/..." onChange={handleChange}></textarea>
                        </div>
                    </section>

                    {/* Physical Stats Section */}
                    <section>
                        <h3 className="gold-text" style={{ marginBottom: '15px' }}>Physical Stats</h3>
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label>Height (cm)</label>
                                <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Weight (kg)</label>
                                <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Hair Color</label>
                                <input type="text" name="hair_color" value={formData.hair_color} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Eye Color</label>
                                <input type="text" name="eye_color" value={formData.eye_color} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Skin Tone</label>
                                <input type="text" name="skin_tone" value={formData.skin_tone} onChange={handleChange} />
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
                                                value={customValues[field.name] || ''}
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
                                                    checked={!!customValues[field.name]}
                                                />
                                                <span>Yes</span>
                                            </div>
                                        ) : field.type === 'file' ? (
                                            <div>
                                                {customValues[field.name] && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '4px' }}>File Uploaded</div>
                                                )}
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleCustomFileUpload(e, field.name)}
                                                    required={field.required && !customValues[field.name]}
                                                />
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                onChange={(e) => handleCustomChange(e, field.name, field.type)}
                                                required={field.required}
                                                value={customValues[field.name] || ''}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save Changes'} <Save size={18} style={{ marginLeft: '8px' }} />
                    </button>
                </form>
            </div>
        </div>
    )
}
