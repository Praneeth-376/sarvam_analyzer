import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings, Plus, MapPin, X, User } from 'lucide-react'
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

const BranchPerformance = () => {
    const [branches, setBranches] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', location: '' })
    const [selectedBranch, setSelectedBranch] = useState(null)
    const [branchWorkers, setBranchWorkers] = useState([])

    const load = () => {
        Promise.all([
            axios.get(`${API}/api/branches`, getToken()),
            axios.get(`${API}/api/dashboard/master`, getToken())
        ]).then(([b, s]) => { setBranches(b.data); setStats(s.data) })
            .catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const openBranchDetails = async (branch) => {
        setSelectedBranch(branch)
        try {
            const res = await axios.get(`${API}/api/users?branchId=${branch._id}`, getToken())
            setBranchWorkers(res.data)
        } catch (err) { console.error(err) }
    }

    const createBranch = async e => {
        e.preventDefault()
        try { await axios.post(`${API}/api/branches`, form, getToken()); setShowModal(false); setForm({ name: '', location: '' }); load() }
        catch (err) { alert(err.response?.data?.msg || 'Error') }
    }

    const deleteBranch = async (e, id) => {
        e.stopPropagation()
        if (!confirm('Delete branch?')) return
        try { await axios.delete(`${API}/api/branches/${id}`, getToken()); load() } catch (e) { alert('Error') }
    }

    const getBranchRevenue = id => stats?.branchRevenue?.find(b => b._id === id)

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="page-title">Branches</h1><p className="page-subtitle">Manage branch network</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} style={{ marginRight: 8 }} /> New Branch</button>
            </div>

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <div className="page-grid">
                    {branches.map(b => {
                        const rev = getBranchRevenue(b._id)
                        return (
                            <div className="glass-card" key={b._id} onClick={() => openBranchDetails(b)} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</div>
                                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {b.location}</div>
                                    </div>
                                    <button className="btn btn-sm btn-danger" onClick={(e) => deleteBranch(e, b._id)}><X size={14} /></button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div><div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Manager</div><div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{b.managerId?.name || 'Unassigned'}</div></div>
                                    <div><div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Revenue</div><div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--success)' }}>₹{((rev?.revenue || 0) / 1000).toFixed(0)}K</div></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ backdropFilter: 'blur(4px)' }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}
                        style={{
                            background: 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            borderRadius: '24px',
                            maxWidth: '450px',
                            padding: '32px'
                        }}
                    >
                        <div className="modal-header" style={{ marginBottom: '24px' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>New Branch</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={createBranch}>
                            <div className="form-group"><label className="form-label">Branch Name</label><input className="glass-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Downtown Hub" /></div>
                            <div className="form-group"><label className="form-label">Location</label><input className="glass-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required placeholder="e.g. 123 Main St" /></div>
                            <div className="modal-actions" style={{ marginTop: '32px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Branch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedBranch && (
                <div className="drawer-overlay" onClick={() => setSelectedBranch(null)}>
                    <div className="drawer-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                            <div>
                                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>{selectedBranch.name}</h2>
                                <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {selectedBranch.location}</p>
                            </div>
                            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedBranch(null)}><X size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', flex: 1 }}>

                            {/* Key Stats Card */}
                            <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 0, background: 'var(--bg-elevated)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                    <span className="stat-label">Total Revenue</span>
                                    <span className="badge badge-success">+12%</span>
                                </div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                    ₹{((stats?.branchRevenue?.find(b => b._id === selectedBranch._id)?.revenue || 0) / 1000).toFixed(1)}k
                                </div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)' }}>
                                    Target: ₹{branchWorkers.reduce((acc, curr) => acc + (curr.salesTarget || 0), 0).toLocaleString()}
                                </div>
                            </div>

                            {/* Manager Info */}
                            <div style={{ padding: 'var(--space-md)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                                <div className="stat-label" style={{ marginBottom: 'var(--space-sm)' }}>Branch Manager</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedBranch.managerId?.name || 'Unassigned'}</div>
                                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{selectedBranch.managerId?.email}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Staff List */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                    <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>Staff Members</h3>
                                    <span className="badge badge-info">{branchWorkers.length} Active</span>
                                </div>

                                <div className="glass-table-wrapper" style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                                    <table className="glass-table">
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
                                            <tr>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th style={{ textAlign: 'right' }}>Target</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {branchWorkers.length > 0 ? branchWorkers.map(u => (
                                                <tr key={u._id}>
                                                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                                                    <td>
                                                        <span className={`badge badge-${u.role === 'admin' ? 'purple' : 'success'}`} style={{ fontSize: '9px' }}>
                                                            {u.role === 'admin' ? 'MGR' : 'SALES'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{u.salesTarget?.toLocaleString()}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-tertiary)' }}>No staff assigned</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelectedBranch(null)}>
                                Close Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default BranchPerformance
