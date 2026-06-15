import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, ShoppingCart, Package, CreditCard, Users, FileText, Plus, X } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/admin', icon: <BarChart3 size={18} /> }, { name: 'Sales', path: '/admin/sales', icon: <ShoppingCart size={18} /> }] },
    { label: 'Manage', items: [{ name: 'Products', path: '/admin/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/admin/expenses', icon: <CreditCard size={18} /> }, { name: 'Workers', path: '/admin/workers', icon: <Users size={18} /> }] },
    { label: '', items: [{ name: 'Reports', path: '/admin/reports', icon: <FileText size={18} /> }] }
]

const WorkerPerformance = () => {
    const [workers, setWorkers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '', salesTarget: 0 })
    const [error, setError] = useState('')

    const load = () => {
        axios.get(`${API}/api/users`, getToken()).then(r => setWorkers(r.data.filter(u => u.role === 'worker'))).catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const createWorker = async e => {
        e.preventDefault()
        setError('')
        try {
            await axios.post(`${API}/api/users`, { ...form, role: 'worker' }, getToken())
            setShowModal(false)
            setForm({ name: '', email: '', password: '', salesTarget: 0 })
            load()
        } catch (err) { setError(err.response?.data?.msg || 'Error') }
    }

    const toggleActive = async id => {
        try { await axios.put(`${API}/api/users/${id}/toggle-active`, {}, getToken()); load() } catch (e) { console.error(e) }
    }

    return (
        <DashboardLayout menuItems={menuItems} role="admin">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="page-title">Workers</h1><p className="page-subtitle">Manage your branch team</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} style={{ marginRight: 8 }} /> Add Worker</button>
            </div>

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <div className="glass-card">
                    <div className="glass-table-wrapper">
                        <table className="glass-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Target</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {workers.map(w => (
                                    <tr key={w._id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{w.name}</td>
                                        <td>{w.email}</td>
                                        <td>₹{(w.salesTarget || 0).toLocaleString()}</td>
                                        <td><span className={`badge ${w.isActive ? 'badge-success' : 'badge-danger'}`}>{w.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td>
                                            <button className={`btn btn-sm ${w.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleActive(w._id)}>
                                                {w.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
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
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Add New Worker</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Create account for branch staff</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}
                        <form onSubmit={createWorker} style={{ padding: '0 8px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="glass-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Rahul Verma" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input className="glass-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="worker@sarvam.com" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }}>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input className="glass-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sales Target (₹)</label>
                                    <input className="glass-input" type="number" value={form.salesTarget} onChange={e => setForm({ ...form, salesTarget: +e.target.value })} placeholder="50000" />
                                </div>
                            </div>
                            <div className="modal-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ width: '120px' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default WorkerPerformance
