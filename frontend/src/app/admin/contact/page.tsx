'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import styles from '../admin.module.css'
import { Mail, Clock, RefreshCw } from 'lucide-react'

export default function ContactMessages() {
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchMessages = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/contacts.php')
            setMessages(data)
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Contact Messages <span style={{ fontSize: '0.8em', opacity: 0.7 }}>({messages.length})</span></h1>
                <button onClick={fetchMessages} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : messages.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No messages found.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>From</th>
                                <th>Subject</th>
                                <th>Message</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((msg) => (
                                <tr key={msg.id}>
                                    <td style={{ verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 600 }}>{msg.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            <a href={`mailto:${msg.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Mail size={12} /> {msg.email}
                                            </a>
                                        </div>
                                    </td>
                                    <td style={{ verticalAlign: 'top', fontWeight: 500 }}>
                                        {msg.subject || 'No Subject'}
                                    </td>
                                    <td style={{ whiteSpace: 'pre-wrap', maxWidth: '400px', fontSize: '0.9rem', color: '#374151' }}>
                                        {msg.message}
                                    </td>
                                    <td style={{ verticalAlign: 'top', fontSize: '0.85rem', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            <Clock size={12} />
                                            {new Date(msg.created_at).toLocaleDateString()}
                                            <br />
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
