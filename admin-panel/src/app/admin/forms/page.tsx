'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '../admin.module.css'
import { Plus, Trash2, Save, X, GripVertical } from 'lucide-react'
import { FormField } from '@/types'

export default function FormBuilder() {
    const [fields, setFields] = useState<FormField[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newField, setNewField] = useState<Partial<FormField>>({
        label: '',
        name: '', // generated from label usually
        type: 'text',
        required: false,
        options: [],
        order_index: 0
    })
    const [optionInput, setOptionInput] = useState('')

    useEffect(() => {
        fetchFields()
    }, [])

    const fetchFields = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('form_fields')
            .select('*')
            .order('order_index', { ascending: true })

        if (data) setFields(data)
        setLoading(false)
    }

    const handleCreate = async () => {
        if (!newField.label || !newField.type) return

        // Auto-generate name key from label if not set
        const nameKey = newField.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

        const fieldToSave = {
            ...newField,
            name: nameKey,
            order_index: fields.length
        }

        const { error } = await supabase
            .from('form_fields')
            .insert(fieldToSave)

        if (error) {
            alert('Error creating field: ' + error.message)
        } else {
            setIsModalOpen(false)
            setNewField({ label: '', type: 'text', required: false, options: [] })
            setOptionInput('')
            fetchFields()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this field?')) return
        const { error } = await supabase.from('form_fields').delete().eq('id', id)
        if (!error) fetchFields()
    }

    const addOption = () => {
        if (!optionInput.trim()) return
        setNewField(prev => ({
            ...prev,
            options: [...(prev.options || []), optionInput.trim()]
        }))
        setOptionInput('')
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Dynamic Form Builder</h1>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={16} /> Add Field
                </button>
            </div>

            <div className={styles.fbContainer}>
                {loading ? <p>Loading Schema...</p> : fields.length === 0 ? <p>No custom fields yet.</p> : (
                    fields.map((field) => (
                        <div key={field.id} className={styles.fbFieldItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <GripVertical size={20} color="#9ca3af" style={{ cursor: 'move' }} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{field.label}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        Key: {field.name} | Type: {field.type} | {field.required ? 'Required' : 'Optional'}
                                    </div>
                                </div>
                            </div>
                            <button
                                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                onClick={() => handleDelete(field.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add New Field</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className={styles.cardLabel}>Field Label</label>
                                <input
                                    type="text"
                                    className={styles.searchBar}
                                    style={{ width: '100%' }}
                                    value={newField.label}
                                    onChange={e => setNewField({ ...newField, label: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className={styles.cardLabel}>Type</label>
                                <select
                                    className={styles.searchBar}
                                    style={{ width: '100%' }}
                                    value={newField.type}
                                    onChange={e => setNewField({ ...newField, type: e.target.value as any })}
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="dropdown">Dropdown</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="file">File Upload</option>
                                </select>
                            </div>

                            {newField.type === 'dropdown' && (
                                <div>
                                    <label className={styles.cardLabel}>Options</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className={styles.searchBar}
                                            value={optionInput}
                                            onChange={e => setOptionInput(e.target.value)}
                                            placeholder="Option value"
                                        />
                                        <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={addOption}>Add</button>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {newField.options?.map((opt, i) => (
                                            <span key={i} className={styles.badge}>{opt}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={newField.required}
                                    onChange={e => setNewField({ ...newField, required: e.target.checked })}
                                />
                                Required Field
                            </label>

                            <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                style={{ width: '100%', marginTop: '1rem' }}
                                onClick={handleCreate}
                            >
                                Create Field
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
