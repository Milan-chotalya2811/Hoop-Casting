'use client'

import React, { useState } from 'react'
import api from '@/lib/api'
import styles from '@/app/page.module.css'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

// Define categories (can be imported if shared, but copying for now)
const CATEGORIES = [
    "Actor", "Anchor", "Model", "Makeup Artist", "Stylist",
    "Art Direction", "Photographer", "Videographer", "Video Editor",
    "Internship", "Props Renting", "Studio Renting", "Set Designer", "Other"
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        category: '',
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<null | 'success' | 'error'>(null)
    const [errorMessage, setErrorMessage] = useState<string>('')

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)
        setErrorMessage('')

        if (formData.mobile.length !== 10) {
            alert("Mobile number must be exactly 10 digits.");
            setLoading(false);
            return;
        }

        try {
            await api.post('/contact.php', formData)
            setStatus('success')
            setFormData({ name: '', mobile: '', email: '', category: '', subject: '', message: '' })
        } catch (error: any) {
            console.error(error)
            setStatus('error')
            setErrorMessage(error.response?.data?.message || error.message || "Failed to send message.")
        }
        setLoading(false)
    }

    return (
        <div className="container section">
            <h1 className={styles.mainCategoryTitle}>Get in Touch</h1>
            <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 50px auto', color: 'var(--text-muted)' }}>
                Have questions or want to collaborate? Reach out to us directly or fill out the form below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'start' }}>
                <div className="glass" style={{ padding: '40px', borderRadius: '16px' }}>
                    <h3 style={{ marginBottom: '30px' }}>Contact Information</h3>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, background: 'var(--surface-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mail size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Email</div>
                            <div style={{ color: 'var(--text-muted)' }}>contact@monkeycasting.com</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, background: 'var(--surface-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Phone</div>
                            <div style={{ color: 'var(--text-muted)' }}>+91 98765 43210</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ width: 40, height: 40, background: 'var(--surface-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Address</div>
                            <div style={{ color: 'var(--text-muted)' }}>Surat, Gujarat, India</div>
                        </div>
                    </div>

                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119066.4126407767!2d72.74872322312675!3d21.170240108753238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e59411d1563%3A0xfe4558290938b042!2sSurat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1706500000000!5m2!1sen!2sin"
                            width="100%"
                            height="250"
                            style={{ border: 0, display: 'block' }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                <div className="glass" style={{ padding: '40px', borderRadius: '16px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Send us a Message</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Your Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{10}"
                                maxLength={10}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                placeholder="10-digit mobile number"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)' }}
                            >
                                <option value="" disabled>Select a Category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                placeholder="Inquiry about casting..."
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', resize: 'vertical' }}
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? 'Sending...' : <>Send Message <Send size={16} /></>}
                        </button>
                        {status === 'success' && <p style={{ color: '#10b981', marginTop: '10px' }}>Message sent successfully!</p>}
                        {status === 'error' && <p style={{ color: '#ef4444', marginTop: '10px' }}>{errorMessage || 'Failed to send message. Please try again.'}</p>}
                    </form>
                </div>
            </div>
        </div>
    )
}
