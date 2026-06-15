import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings, TrendingDown } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/master', icon: <BarChart3 size={18} /> }, { name: 'Branches', path: '/master/branches', icon: <Building2 size={18} /> }, { name: 'Profit & Loss', path: '/master/profit', icon: <Wallet size={18} /> }] },
    { label: 'Management', items: [{ name: 'Users', path: '/master/users', icon: <Users size={18} /> }, { name: 'Products', path: '/master/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/master/expenses', icon: <CreditCard size={18} /> }] },
    { label: 'Analytics', items: [{ name: 'Inventory', path: '/master/inventory', icon: <ClipboardList size={18} /> }, { name: 'Forecasting', path: '/master/forecasting', icon: <TrendingUp size={18} /> }, { name: 'Margins', path: '/master/margins', icon: <Target size={18} /> }] },
    { label: 'System', items: [{ name: 'Settings', path: '/master/settings', icon: <Settings size={18} /> }] }
]

const ProfitMargins = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API}/api/products`, getToken()).then(r => setProducts(r.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const sorted = [...products].sort((a, b) => {
        const ma = (1 - a.costPrice / a.sellingPrice) * 100
        const mb = (1 - b.costPrice / b.sellingPrice) * 100
        return mb - ma
    })

    const avgMargin = products.length > 0 ? products.reduce((s, p) => s + (1 - p.costPrice / p.sellingPrice) * 100, 0) / products.length : 0

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header"><h1 className="page-title">Profit Margins</h1><p className="page-subtitle">Product profitability analysis</p></div>

            <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon"><Target size={24} /></div><div className="stat-value">{avgMargin.toFixed(1)}%</div><div className="stat-label">Average Margin</div></div>
                <div className="stat-card"><div className="stat-icon"><TrendingUp size={24} /></div><div className="stat-value" style={{ color: 'var(--success)' }}>{sorted[0] ? `${((1 - sorted[0].costPrice / sorted[0].sellingPrice) * 100).toFixed(0)}%` : '—'}</div><div className="stat-label">Highest Margin</div></div>
                <div className="stat-card"><div className="stat-icon"><TrendingDown size={24} /></div><div className="stat-value" style={{ color: 'var(--danger)' }}>{sorted[sorted.length - 1] ? `${((1 - sorted[sorted.length - 1].costPrice / sorted[sorted.length - 1].sellingPrice) * 100).toFixed(0)}%` : '—'}</div><div className="stat-label">Lowest Margin</div></div>
            </div>

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <div className="glass-card">
                    <div className="card-header"><div><div className="card-title">Product Margins</div><div className="card-subtitle">Sorted by margin</div></div></div>
                    <div className="glass-table-wrapper">
                        <table className="glass-table">
                            <thead><tr><th>Product</th><th>Cost</th><th>Price</th><th>Margin</th><th>Branch</th><th>Visual</th></tr></thead>
                            <tbody>
                                {sorted.map(p => {
                                    const margin = (1 - p.costPrice / p.sellingPrice) * 100
                                    return (
                                        <tr key={p._id}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                                            <td>₹{Number(p.costPrice).toLocaleString()}</td>
                                            <td>₹{Number(p.sellingPrice).toLocaleString()}</td>
                                            <td style={{ color: margin >= 40 ? 'var(--success)' : margin >= 25 ? 'var(--warning)' : 'var(--danger)', fontWeight: 700 }}>{margin.toFixed(1)}%</td>
                                            <td>{p.branchId?.name || '—'}</td>
                                            <td style={{ width: 150 }}>
                                                <div className="progress-bar" style={{ height: 6 }}>
                                                    <div className={`progress-fill ${margin >= 40 ? 'success' : margin >= 25 ? 'warning' : 'danger'}`} style={{ width: `${margin}%` }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default ProfitMargins
