import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'
const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : 'http://localhost:5001/api'
const getToken = () => localStorage.getItem('token')
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/master', icon: '📊' }, { name: 'Global Profit', path: '/master/profit', icon: '💰' }] },
    { label: 'Analytics', items: [{ name: 'Branch Performance', path: '/master/branches', icon: '🏢' }, { name: 'Top Products', path: '/master/products', icon: '🏆' }, { name: 'Expense Monitor', path: '/master/expenses', icon: '📉' }, { name: 'Profit Margins', path: '/master/margins', icon: '📈' }, { name: 'Sales Forecast', path: '/master/forecasting', icon: '🔮' }] },
    { label: 'Management', items: [{ name: 'Users & Roles', path: '/master/users', icon: '👥' }, { name: 'Inventory', path: '/master/inventory', icon: '📦' }, { name: 'Settings', path: '/master/settings', icon: '⚙️' }] }
]

const SystemSettings = () => {
    const [branches, setBranches] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', location: '' })
    const [settings, setSettings] = useState({
        financialYear: 'April - March',
        taxRate: '18',
        currency: 'INR'
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/branches`, authHeader())
                setBranches(res.data)
            } catch (err) { console.error(err) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    const handleAddBranch = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API}/branches`, form, authHeader())
            setShowModal(false)
            setForm({ name: '', location: '' })
            const res = await axios.get(`${API}/branches`, authHeader())
            setBranches(res.data)
        } catch (err) { alert(err.response?.data?.msg || 'Error') }
    }

    const deleteBranch = async (id) => {
        if (!confirm('Delete this branch?')) return
        try {
            await axios.delete(`${API}/branches/${id}`, authHeader())
            setBranches(branches.filter(b => b._id !== id))
        } catch (err) { console.error(err) }
    }

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header">
                <h1 className="page-title">System Settings</h1>
                <p className="page-subtitle">Manage branches, financial year & system configuration</p>
            </div>

            {loading ? (
                <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading...</p></div>
            ) : (
                <div className="page-grid">
                    {/* Financial Settings */}
                    <div className="glass-card">
                        <div className="card-header"><div className="card-title">⚙️ Financial Configuration</div></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Financial Year</label>
                                <select className="glass-input glass-select" value={settings.financialYear} onChange={e => setSettings({ ...settings, financialYear: e.target.value })}>
                                    <option>April - March</option>
                                    <option>January - December</option>
                                    <option>July - June</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tax Rate (%)</label>
                                <input className="glass-input" type="number" value={settings.taxRate} onChange={e => setSettings({ ...settings, taxRate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Currency</label>
                                <select className="glass-input glass-select" value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                                    <option value="INR">₹ INR</option>
                                    <option value="USD">$ USD</option>
                                    <option value="EUR">€ EUR</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <button className="btn btn-primary" onClick={() => alert('Settings saved!')}>Save Settings</button>
                        </div>
                    </div>

                    {/* Branch Management */}
                    <div className="glass-card">
                        <div className="card-header">
                            <div className="card-title">🏢 Branch Management</div>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Branch</button>
                        </div>
                        <div className="glass-table-wrapper">
                            <table className="glass-table">
                                <thead><tr><th>Name</th><th>Location</th><th>Manager</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {branches.map((b, i) => (
                                        <tr key={i}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{b.name}</td>
                                            <td>{b.location}</td>
                                            <td>{b.managerId?.name || b.managerId?.email || '—'}</td>
                                            <td><span className={`badge ${b.isActive ? 'badge-success' : 'badge-danger'}`}>{b.isActive ? 'Active' : 'Inactive'}</span></td>
                                            <td><button className="btn btn-sm btn-danger" onClick={() => deleteBranch(b._id)}>Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Add New Branch</h3>
                        <form onSubmit={handleAddBranch}>
                            <div className="form-group">
                                <label className="form-label">Branch Name</label>
                                <input className="glass-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. South City Branch" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input className="glass-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required placeholder="e.g. Hyderabad" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Branch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default SystemSettings
