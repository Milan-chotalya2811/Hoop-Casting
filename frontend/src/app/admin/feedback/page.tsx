'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import styles from '../admin.module.css'
import { Star, MessageSquare, RefreshCw, User } from 'lucide-react'

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFeedback = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/feedbacks.php')
            setFeedbacks(data)
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchFeedback()
    }, [])

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>User Feedback <span style={{ fontSize: '0.8em', opacity: 0.7 }}>({feedbacks.length})</span></h1>
                <button onClick={fetchFeedback} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : feedbacks.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No feedback received yet.</div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px', padding: '20px' }}>
                        {feedbacks.map((item) => (
                            <div key={item.id} style={{
                                padding: '15px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                background: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <User size={20} color="#6b7280" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.name || 'Anonymous User'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                {item.email || 'No Email'} • {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={16}
                                                fill={star <= item.rating ? "#fbbf24" : "none"}
                                                color={star <= item.rating ? "#fbbf24" : "#d1d5db"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px', fontSize: '0.95rem', color: '#374151' }}>
                                    <MessageSquare size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', opacity: 0.5 }} />
                                    {item.comment}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
