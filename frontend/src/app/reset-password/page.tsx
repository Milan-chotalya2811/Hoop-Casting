'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle } from 'lucide-react';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ color: '#ef4444' }}>Invalid Link</h2>
                <p>Missing reset token. Please check your email link again.</p>
                <Link href="/forgot-password" style={{ color: '#4f46e5', textDecoration: 'underline' }}>Request new link</Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Production URL always relative or specific domain if dealing with cross-domain (which we are likely not if served from same origin)
            // But we used full url in forgot password, so let's stick to consistent logic
            const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
            const baseUrl = isLocal ? 'https://hoopcasting.com' : '';
            const apiUrl = `${baseUrl}/php_backend/api`;

            const res = await fetch(`${apiUrl}/reset_password.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ margin: '0 auto 1.5rem', width: '60px', height: '60px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={32} color="#059669" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Success!</h2>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Your password has been reset.</p>
                    <Link href="/login" style={{ display: 'inline-block', padding: '10px 20px', background: '#4f46e5', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Reset Password</h1>

                {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }}
                                placeholder="Min 6 chars"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }}
                                placeholder="Re-enter password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Reseting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
