import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings, Plus, Search, Trash2, Power, UserPlus, X, AlertCircle } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

const menuItems = [
    {
        label: 'Overview', items: [
            { name: 'Dashboard', path: '/master', icon: <BarChart3 size={18} /> },
            { name: 'Branches', path: '/master/branches', icon: <Building2 size={18} /> },
            { name: 'Profit & Loss', path: '/master/profit', icon: <Wallet size={18} /> },
        ]
    },
    {
        label: 'Management', items: [
            { name: 'Users', path: '/master/users', icon: <Users size={18} /> },
            { name: 'Products', path: '/master/products', icon: <Package size={18} /> },
            { name: 'Expenses', path: '/master/expenses', icon: <CreditCard size={18} /> },
        ]
    },
    {
        label: 'Analytics', items: [
            { name: 'Inventory', path: '/master/inventory', icon: <ClipboardList size={18} /> },
            { name: 'Forecasting', path: '/master/forecasting', icon: <TrendingUp size={18} /> },
            { name: 'Margins', path: '/master/margins', icon: <Target size={18} /> },
        ]
    },
    {
        label: 'System', items: [
            { name: 'Settings', path: '/master/settings', icon: <Settings size={18} /> },
        ]
    }
]

const UserManagement = () => {
    const [users, setUsers] = useState([])
    const [branches, setBranches] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', branchId: '', salesTarget: 0 })
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const load = async () => {
        try {
            const [u, b] = await Promise.all([
                axios.get(`${API}/api/users`, getToken()),
                axios.get(`${API}/api/branches`, getToken())
            ])
            setUsers(u.data)
            setBranches(b.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const createUser = async e => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters')
            setSubmitting(false)
            return
        }
        try {
            await axios.post(`${API}/api/users`, {
                ...form,
                salesTarget: form.role === 'worker' ? Number(form.salesTarget) : 0
            }, getToken())
            setShowModal(false)
            setForm({ name: '', email: '', password: '', role: 'admin', branchId: '', salesTarget: 0 })
            load()
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create user. Please check all fields.')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleActive = async (id) => {
        try {
            await axios.put(`${API}/api/users/${id}/toggle-active`, {}, getToken())
            load()
        } catch (err) { console.error(err) }
    }

    const deleteUser = async (id) => {
        if (!confirm('Delete this user?')) return
        try {
            await axios.delete(`${API}/api/users/${id}`, getToken())
            load()
        } catch (err) { alert(err.response?.data?.msg || 'Failed') }
    }

    const getBranch = (u) => u.branchId?.name || '—'
    const getRoleBadge = (r) => {
        const cls = { master: 'badge-info', admin: 'badge-warning', worker: 'badge-success' }
        return <span className={`badge ${cls[r] || 'badge-secondary'}`}>{r.toUpperCase()}</span>
    }

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Create admins and workers • Manage access</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><UserPlus size={18} style={{ marginRight: 8 }} /> New User</button>
            </div>

            {loading ? (
                <div className="loading-state"><div className="loading-spinner"></div>Loading...</div>
            ) : (
                <div className="glass-card">
                    <div className="glass-table-wrapper">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Branch</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{getRoleBadge(u.role)}</td>
                                        <td>{getBranch(u)}</td>
                                        <td>
                                            <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                            {u.role !== 'master' && (
                                                <>
                                                    <button className={`btn btn-sm ${u.isActive ? 'btn-ghost-danger' : 'btn-ghost-success'}`} onClick={() => toggleActive(u._id)} title={u.isActive ? "Deactivate" : "Activate"}>
                                                        <Power size={16} color={u.isActive ? '#ef4444' : '#22c55e'} />
                                                    </button>
                                                    <button className="btn btn-sm btn-ghost-danger" onClick={() => deleteUser(u._id)} title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}
                        style={{
                            background: 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            borderRadius: '24px',
                            maxWidth: '500px',
                            padding: '32px'
                        }}
                    >
                        <div className="modal-header" style={{ marginBottom: '24px' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create User</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>

                        {error && (
                            <div className="alert alert-danger" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <form onSubmit={createUser}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="glass-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. John Doe" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="glass-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input className="glass-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="Min 6 characters" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select className="glass-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                        <option value="admin">Branch Manager</option>
                                        <option value="worker">Sales Staff</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Branch</label>
                                    <select className="glass-select" value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} required>
                                        <option value="">Select branch...</option>
                                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {form.role === 'worker' && (
                                <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
                                    <label className="form-label">Sales Target (₹)</label>
                                    <input className="glass-input" type="number" value={form.salesTarget} onChange={e => setForm({ ...form, salesTarget: e.target.value })} placeholder="0" min="0" />
                                </div>
                            )}

                            <div className="modal-actions" style={{ marginTop: '32px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default UserManagement
