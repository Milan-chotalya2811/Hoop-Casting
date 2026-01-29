'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/components/Form.module.css'
import api from '@/lib/api'

export default function Register() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [captcha, setCaptcha] = useState('')
    const [userCaptcha, setUserCaptcha] = useState('')

    const generateCaptcha = () => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let captchaResult = ''
        for (let i = 0; i < 6; i++) {
            captchaResult += chars[Math.floor(Math.random() * chars.length)]
        }
        setCaptcha(captchaResult)
    }

    useEffect(() => {
        generateCaptcha()
    }, [])

    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    }

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8 || pwd.length > 12) {
            return "Password must be 8-12 characters long."
        }
        if (!/^[A-Z]/.test(pwd)) {
            return "First letter must be Capital."
        }
        if (!/[a-z]/.test(pwd)) {
            return "Password must contain lowercase letters."
        }
        if (!/[0-9]/.test(pwd)) {
            return "Password must contain at least one number."
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
            return "Password must contain at least one special character."
        }
        return null;
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (userCaptcha.toUpperCase() !== captcha) {
            setError("Incorrect Captcha. Please try again.")
            setLoading(false)
            generateCaptcha()
            setUserCaptcha('')
            return
        }

        const passwordError = validatePassword(formData.password)
        if (passwordError) {
            setError(passwordError)
            setLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            await api.post('/register.php', {
                name: formData.fullName,
                mobile: formData.mobile,
                email: formData.email,
                password: formData.password
            })

            // Success -> Redirect to Login
            router.push('/login?registered=true')

        } catch (err: any) {
            console.error(err)
            const errMsg = err.response?.data?.message || err.message || 'Registration failed';
            const serverError = err.response?.data?.error ? JSON.stringify(err.response.data.error) : '';
            alert(`Error: ${errMsg} \nDetails: ${serverError}`);
            setError(errMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.formContainer}>
            <div className={styles.card}>
                <h1 className={styles.title}>Join the Cast</h1>
                <p className={styles.subtitle}>Create your talent profile today</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="+91 9876543210"
                            required
                            value={formData.mobile}
                            onChange={handleChange}
                            minLength={10}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            title="Mobile number must be exactly 10 digits"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="john@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Captcha</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{
                                background: '#f0f0f0',
                                padding: '10px 15px',
                                letterSpacing: '5px',
                                fontWeight: 'bold',
                                fontSize: '18px',
                                color: '#333',
                                borderRadius: '4px',
                                flexGrow: 1,
                                textAlign: 'center',
                                userSelect: 'none',
                                fontFamily: 'monospace'
                            }}>
                                {captcha}
                            </div>
                            <button
                                type="button"
                                onClick={generateCaptcha}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                                title="Refresh Captcha"
                            >
                                ↻
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter Captcha"
                            value={userCaptcha}
                            onChange={(e) => setUserCaptcha(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register Now'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link href="/login" className={styles.link}>Login</Link>
                </div>
            </div>
        </div>
    )
}
