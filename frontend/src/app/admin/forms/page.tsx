'use client'

import React from 'react'
import styles from '../admin.module.css'
import { Plus, Copy, Trash2, Edit } from 'lucide-react'

export default function FormsPage() {
    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Form Builder</h1>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={() => alert("Form Builder is coming in v2.0")}>
                    <Plus size={16} /> Create New Form
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Form Name</th>
                            <th>Status</th>
                            <th>Responses</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div style={{ fontWeight: 600 }}>Main Registration Form</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>/register</div>
                            </td>
                            <td>
                                <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Active</span>
                            </td>
                            <td>View in "Users"</td>
                            <td>System Default</td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className={styles.actionBtn} title="Edit" disabled style={{ opacity: 0.5 }}>
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style={{ fontWeight: 600 }}>Contact Us Form</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>/contact</div>
                            </td>
                            <td>
                                <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Active</span>
                            </td>
                            <td>View in "Contact Messages"</td>
                            <td>System Default</td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className={styles.actionBtn} title="Edit" disabled style={{ opacity: 0.5 }}>
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', marginTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                    <p>Custom Form Builder will be available in the next update.</p>
                </div>
            </div>
        </div>
    )
}
