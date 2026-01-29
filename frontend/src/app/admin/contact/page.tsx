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

    const parseMessage = (fullMessage: string) => {
        const lines = fullMessage.split('\n');
        let mobile = 'N/A';
        let category = 'N/A';
        let body = fullMessage;

        // Simple parsing based on the PHP format
        // Mobile: <number>
        // Category: <category>
        // <empty>
        // Message:
        // <actual message>

        const mobileLine = lines.find(line => line.startsWith('Mobile: '));
        const categoryLine = lines.find(line => line.startsWith('Category: '));

        if (mobileLine) mobile = mobileLine.replace('Mobile: ', '').trim();
        if (categoryLine) category = categoryLine.replace('Category: ', '').trim();

        // Attempt to extract the clean message content
        const msgIndex = lines.findIndex(line => line.trim() === 'Message:');
        if (msgIndex !== -1 && msgIndex + 1 < lines.length) {
            body = lines.slice(msgIndex + 1).join('\n').trim();
        }

        return { mobile, category, body };
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Contact Messages <span style={{ fontSize: '0.8em', opacity: 0.7 }}>({messages.length})</span></h1>
                <button onClick={fetchMessages} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : messages.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No messages found.</div>
                ) : (
                    <table className={styles.table} style={{ minWidth: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ whiteSpace: 'nowrap' }}>From</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Subject / Category</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Contact Info</th>
                                <th style={{ minWidth: '300px' }}>Message</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((msg) => {
                                const { mobile, category, body } = parseMessage(msg.message || '');
                                return (
                                    <tr key={msg.id}>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{msg.name}</div>
                                        </td>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <div style={{ fontWeight: 500 }}>{msg.subject || 'No Subject'}</div>
                                            <div className="badge" style={{
                                                display: 'inline-block',
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                background: '#e5e7eb',
                                                color: '#374151',
                                                marginTop: '4px'
                                            }}>
                                                {category}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <a href={`mailto:${msg.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                    <Mail size={14} /> {msg.email}
                                                </a>
                                                {mobile !== 'N/A' && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                        <span style={{ fontSize: '14px' }}>📞</span> {mobile}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'top', fontSize: '0.9rem', color: '#374151' }}>
                                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                {body}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'top', fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: ' center' }}>
                                                <Clock size={14} />
                                                <div>
                                                    <div>{new Date(msg.created_at).toLocaleDateString()}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
