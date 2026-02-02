'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/components/Form.module.css'
// Importing specific extra styles locally or reusing globals
import { Save, Upload, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormField } from '@/types'

export default function EditProfile() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')

    const [profile, setProfile] = useState<any>({
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

    // Load existing data
    useEffect(() => {
        if (user) {
            const loadData = async () => {
                // Fetch Profile
                const { data, error } = await supabase
                    .from('talent_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                // Fetch Form Schema
                const { data: schemaData } = await supabase
                    .from('form_fields')
                    .select('*')
                    .order('order_index')

                if (schemaData) setCustomFieldsSchema(schemaData as FormField[])

                if (data) {
                    // Format arrays/dates for form inputs if needed
                    setProfile({
                        ...data,
                        languages: data.languages ? data.languages.join(', ') : '',
                        skills: data.skills ? data.skills.join(', ') : '',
                        portfolio_links: data.portfolio_links ? data.portfolio_links.join('\n') : '',
                        interested_in: data.interested_in || []
                    })
                    // Load custom fields
                    if (data.custom_fields) {
                        setCustomValues(data.custom_fields)
                    }
                }
            }
            loadData()
        }
    }, [user])

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        if (type === 'checkbox' && name === 'willing_to_travel') {
            setProfile({ ...profile, [name]: checked })
        } else {
            setProfile({ ...profile, [name]: value })
        }
    }

    const handleCustomChange = (e: any, fieldName: string, type: string) => {
        const { value, checked } = e.target
        const val = type === 'checkbox' ? checked : value
        setCustomValues(prev => ({ ...prev, [fieldName]: val }))
    }

    const handleCustomFileUpload = async (e: any, fieldName: string) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setSubmitting(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `custom/${user!.id}/${fieldName}_${Math.random()}.${fileExt}`

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

    const handleInterestChange = (e: any) => {
        const { value, checked } = e.target
        let newInterests = [...profile.interested_in]
        if (checked) {
            newInterests.push(value)
        } else {
            newInterests = newInterests.filter((i: any) => i !== value)
        }
        setProfile({ ...profile, interested_in: newInterests })
    }

    const handleFileUpload = async (e: any, field: string) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setSubmitting(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${user!.id}/${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('talent-media')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('talent-media').getPublicUrl(filePath)

            setProfile({ ...profile, [field]: data.publicUrl })
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
            // Process array fields
            const languagesArray = profile.languages.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            const skillsArray = profile.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            const portfolioArray = profile.portfolio_links.split('\n').map((s: string) => s.trim()).filter((s: string) => s)

            const payload = {
                user_id: user!.id,
                gender: profile.gender,
                dob: profile.dob || null,
                city: profile.city,
                state: profile.state,
                country: profile.country,
                height_cm: profile.height_cm || null,
                weight_kg: profile.weight_kg || null,
                chest_in: profile.chest_in || null,
                waist_in: profile.waist_in || null,
                hips_in: profile.hips_in || null,
                skin_tone: profile.skin_tone,
                hair_color: profile.hair_color,
                eye_color: profile.eye_color,
                category: profile.category,
                years_experience: profile.years_experience || 0,
                languages: languagesArray,
                skills: skillsArray,
                past_work: profile.past_work,
                portfolio_links: portfolioArray,
                interested_in: profile.interested_in,
                willing_to_travel: profile.willing_to_travel,
                profile_photo_url: profile.profile_photo_url,
                intro_video_url: profile.intro_video_url,
                custom_fields: customValues
            }

            // Self-repair: Ensure user exists in public.users table to avoid FK error
            const { error: userCheckError } = await supabase.from('users').upsert({
                id: user!.id,
                email: user!.email
            }, { onConflict: 'id', ignoreDuplicates: true })

            if (userCheckError) console.warn('User sync check warning:', userCheckError)

            // Upsert Profile
            const { error } = await supabase
                .from('talent_profiles')
                .upsert(payload, { onConflict: 'user_id' })

            if (error) throw error

            setMessage('Profile saved successfully!')
            router.push('/profile')
        } catch (error: any) {
            setMessage('Error saving profile: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div>Loading...</div>
    if (!user) { router.push('/login'); return null; }

    return (
        <div className="container section">
            <Link href="/dashboard" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div className={styles.card} style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '30px' }}>Edit Talent Profile</h1>

                {message && <div style={{ padding: '10px', background: 'var(--surface-highlight)', marginBottom: '20px', borderRadius: '4px' }}>{message}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>

                    {/* Section 1: Personal */}
                    <section>
                        <h3 className="gold-text" style={{ marginBottom: '15px' }}>Personal Details</h3>
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label>Gender</label>
                                <select name="gender" value={profile.gender} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-Binary">Non-Binary</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Date of Birth</label>
                                <input type="date" name="dob" value={profile.dob} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>City</label>
                                <input type="text" name="city" value={profile.city} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <input type="text" name="state" value={profile.state} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* Custom Fields Section (Dynamic) */}
                    {customFieldsSchema.length > 0 && (
                        <section>
                            <h3 className="gold-text" style={{ marginBottom: '15px' }}>Additional Details</h3>
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {customFieldsSchema.map((field) => (
                                    <div className={styles.formGroup} key={field.id} style={{ gridColumn: field.type === 'file' ? 'span 2' : 'auto' }}>
                                        <label>{field.label} {field.required && '*'}</label>

                                        {field.type === 'dropdown' ? (
                                            <select
                                                name={field.name}
                                                value={customValues[field.name] || ''}
                                                onChange={(e) => handleCustomChange(e, field.name, field.type)}
                                                required={field.required}
                                            >
                                                <option value="">Select</option>
                                                {field.options?.map((opt: string) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
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
                                        ) : field.type === 'checkbox' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!customValues[field.name]}
                                                    onChange={(e) => handleCustomChange(e, field.name, field.type)}
                                                    style={{ width: 'auto', marginRight: '8px' }}
                                                />
                                                <span>Yes</span>
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={customValues[field.name] || ''}
                                                onChange={(e) => handleCustomChange(e, field.name, field.type)}
                                                required={field.required}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Section 2: Physical */}
                    <section>
                        <h3 className="gold-text" style={{ marginBottom: '15px' }}>Physical Stats</h3>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label>Height (cm)</label>
                                <input type="number" name="height_cm" value={profile.height_cm} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Weight (kg)</label>
                                <input type="number" name="weight_kg" value={profile.weight_kg} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Chest (in)</label>
                                <input type="number" name="chest_in" value={profile.chest_in} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Waist (in)</label>
                                <input type="number" name="waist_in" value={profile.waist_in} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Hips (in)</label>
                                <input type="number" name="hips_in" value={profile.hips_in} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '10px' }}>
                            <div className={styles.formGroup}>
                                <label>Skin Tone</label>
                                <input type="text" name="skin_tone" value={profile.skin_tone} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Hair Color</label>
                                <input type="text" name="hair_color" value={profile.hair_color} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Eye Color</label>
                                <input type="text" name="eye_color" value={profile.eye_color} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Professional */}
                    <section>
                        <h3 className="gold-text" style={{ marginBottom: '15px' }}>Professional Info</h3>
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label>Primary Category</label>
                                <select name="category" value={profile.category} onChange={handleChange}>
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
                                <label>Years of Experience</label>
                                <input type="number" name="years_experience" value={profile.years_experience} onChange={handleChange} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Languages (comma separated)</label>
                            <input type="text" name="languages" value={profile.languages} placeholder="English, Hindi, etc." onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Skills (comma separated)</label>
                            <input type="text" name="skills" value={profile.skills} placeholder="Dancing, Driving, Swimming" onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Past Work</label>
                            <textarea name="past_work" value={profile.past_work} onChange={handleChange} rows={4}></textarea>
                        </div>
                    </section>

                    {/* Section 4: Media */}
                    <section>
                        <h3 className="gold-text" style={{ marginBottom: '15px' }}>Media & Uploads</h3>
                        <div className={styles.formGroup}>
                            <label>Profile Photo</label>
                            {profile.profile_photo_url && (
                                <img src={profile.profile_photo_url} alt="Profile" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginBottom: '10px' }} />
                            )}
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile_photo_url')} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Portfolio Links (One per line)</label>
                            <textarea name="portfolio_links" value={profile.portfolio_links} rows={3} placeholder="https://instagram.com/..." onChange={handleChange}></textarea>
                        </div>
                    </section>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save Profile'} <Save size={18} style={{ marginLeft: '8px' }} />
                    </button>

                </form>
            </div>
        </div>
    )
}

