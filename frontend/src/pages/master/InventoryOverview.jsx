import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings, AlertTriangle, XCircle, DollarSign } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/master', icon: <BarChart3 size={18} /> }, { name: 'Branches', path: '/master/branches', icon: <Building2 size={18} /> }, { name: 'Profit & Loss', path: '/master/profit', icon: <Wallet size={18} /> }] },
    { label: 'Management', items: [{ name: 'Users', path: '/master/users', icon: <Users size={18} /> }, { name: 'Products', path: '/master/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/master/expenses', icon: <CreditCard size={18} /> }] },
    { label: 'Analytics', items: [{ name: 'Inventory', path: '/master/inventory', icon: <ClipboardList size={18} /> }, { name: 'Forecasting', path: '/master/forecasting', icon: <TrendingUp size={18} /> }, { name: 'Margins', path: '/master/margins', icon: <Target size={18} /> }] },
    { label: 'System', items: [{ name: 'Settings', path: '/master/settings', icon: <Settings size={18} /> }] }
]

const InventoryOverview = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API}/api/products`, getToken()).then(r => setProducts(r.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const lowStock = products.filter(p => p.stock <= (p.minStock || 5))
    const outOfStock = products.filter(p => p.stock === 0)
    const totalValue = products.reduce((s, p) => s + (p.costPrice * p.stock), 0)

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header"><h1 className="page-title">Inventory Overview</h1><p className="page-subtitle">Stock levels across all branches</p></div>

            <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon"><Package size={24} /></div><div className="stat-value">{products.length}</div><div className="stat-label">Total Products</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ color: 'var(--warning)', background: 'var(--warning-dim)' }}><AlertTriangle size={24} /></div><div className="stat-value" style={{ color: 'var(--warning)' }}>{lowStock.length}</div><div className="stat-label">Low Stock</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ color: 'var(--danger)', background: 'var(--danger-dim)' }}><XCircle size={24} /></div><div className="stat-value" style={{ color: 'var(--danger)' }}>{outOfStock.length}</div><div className="stat-label">Out of Stock</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ color: 'var(--success)', background: 'var(--success-dim)' }}><DollarSign size={24} /></div><div className="stat-value">₹{(totalValue / 100000).toFixed(1)}L</div><div className="stat-label">Inventory Value</div></div>
            </div>

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <>
                    {lowStock.length > 0 && (
                        <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
                            <div className="card-header"><div><div className="card-title" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={20} /> Low Stock Alerts</div></div></div>
                            <div className="glass-table-wrapper">
                                <table className="glass-table">
                                    <thead><tr><th>Product</th><th>Branch</th><th>Stock</th><th>Min</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {lowStock.map(p => (
                                            <tr key={p._id}>
                                                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                                                <td>{p.branchId?.name || '—'}</td>
                                                <td>{p.stock}</td>
                                                <td>{p.minStock}</td>
                                                <td><span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>{p.stock === 0 ? 'Out of Stock' : 'Low'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="glass-card">
                        <div className="card-header"><div><div className="card-title">Full Inventory</div><div className="card-subtitle">{products.length} items</div></div></div>
                        <div className="glass-table-wrapper">
                            <table className="glass-table">
                                <thead><tr><th>Product</th><th>Category</th><th>Branch</th><th>Stock</th><th>Value</th></tr></thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                                            <td>{p.category}</td>
                                            <td>{p.branchId?.name || '—'}</td>
                                            <td><span className={`badge ${p.stock <= (p.minStock || 5) ? (p.stock === 0 ? 'badge-danger' : 'badge-warning') : 'badge-success'}`}>{p.stock}</span></td>
                                            <td>₹{(p.costPrice * p.stock).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    )
}

export default InventoryOverview
