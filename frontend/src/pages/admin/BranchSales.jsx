import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, ShoppingCart, Package, CreditCard, Users, FileText, DollarSign, TrendingUp, Check, X } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/admin', icon: <BarChart3 size={18} /> }, { name: 'Sales', path: '/admin/sales', icon: <ShoppingCart size={18} /> }] },
    { label: 'Manage', items: [{ name: 'Products', path: '/admin/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/admin/expenses', icon: <CreditCard size={18} /> }, { name: 'Workers', path: '/admin/workers', icon: <Users size={18} /> }] },
    { label: '', items: [{ name: 'Reports', path: '/admin/reports', icon: <FileText size={18} /> }] }
]

const BranchSales = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

    const load = () => {
        axios.get(`${API}/api/sales`, getToken()).then(r => setSales(r.data)).catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const updateStatus = async (id, status) => {
        try { await axios.put(`${API}/api/sales/${id}/status`, { status }, getToken()); load() } catch (e) { alert('Error') }
    }

    const fmt = n => `₹${Number(n).toLocaleString()}`
    const total = sales.reduce((s, x) => s + x.totalAmount, 0)
    const profit = sales.reduce((s, x) => s + x.profit, 0)

    return (
        <DashboardLayout menuItems={menuItems} role="admin">
            <div className="page-header"><h1 className="page-title">Sales</h1><p className="page-subtitle">Transaction history</p></div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card"><div className="stat-icon"><DollarSign size={24} /></div><div className="stat-value">{fmt(total)}</div><div className="stat-label">Total Revenue</div></div>
                <div className="stat-card"><div className="stat-icon"><TrendingUp size={24} /></div><div className="stat-value">{fmt(profit)}</div><div className="stat-label">Total Profit</div></div>
                <div className="stat-card"><div className="stat-icon"><ShoppingCart size={24} /></div><div className="stat-value">{sales.length}</div><div className="stat-label">Transactions</div></div>
            </div>

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <div className="glass-card">
                    <div className="glass-table-wrapper">
                        <table className="glass-table">
                            <thead><tr><th>Product</th><th>Worker</th><th>Qty</th><th>Amount</th><th>Profit</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                            <tbody>
                                {sales.map(s => (
                                    <tr key={s._id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.productName}</td>
                                        <td>{s.workerId?.name || '—'}</td>
                                        <td>{s.quantity}</td>
                                        <td>{fmt(s.totalAmount)}</td>
                                        <td style={{ color: 'var(--success)' }}>{fmt(s.profit)}</td>
                                        <td><span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{s.status}</span></td>
                                        <td>{new Date(s.date).toLocaleDateString()}</td>
                                        <td style={{ display: 'flex', gap: 4 }}>
                                            {s.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-sm btn-success" onClick={() => updateStatus(s._id, 'completed')}><Check size={14} /></button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => updateStatus(s._id, 'cancelled')}><X size={14} /></button>
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
        </DashboardLayout>
    )
}

export default BranchSales
