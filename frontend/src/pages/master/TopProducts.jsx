import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/master', icon: <BarChart3 size={18} /> }, { name: 'Branches', path: '/master/branches', icon: <Building2 size={18} /> }, { name: 'Profit & Loss', path: '/master/profit', icon: <Wallet size={18} /> }] },
    { label: 'Management', items: [{ name: 'Users', path: '/master/users', icon: <Users size={18} /> }, { name: 'Products', path: '/master/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/master/expenses', icon: <CreditCard size={18} /> }] },
    { label: 'Analytics', items: [{ name: 'Inventory', path: '/master/inventory', icon: <ClipboardList size={18} /> }, { name: 'Forecasting', path: '/master/forecasting', icon: <TrendingUp size={18} /> }, { name: 'Margins', path: '/master/margins', icon: <Target size={18} /> }] },
    { label: 'System', items: [{ name: 'Settings', path: '/master/settings', icon: <Settings size={18} /> }] }
]

const TopProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [branches, setBranches] = useState([])
    const [filter, setFilter] = useState('')

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/api/products`, getToken()),
            axios.get(`${API}/api/branches`, getToken())
        ]).then(([p, b]) => { setProducts(p.data); setBranches(b.data) })
            .catch(console.error).finally(() => setLoading(false))
    }, [])

    const filtered = filter ? products.filter(p => (p.branchId?._id || p.branchId) === filter) : products

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header"><h1 className="page-title">Products</h1><p className="page-subtitle">Global product catalog</p></div>

            <div className="search-bar">
                <select className="glass-select" style={{ maxWidth: 250 }} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
            </div>

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <div className="glass-card">
                    <div className="glass-table-wrapper">
                        <table className="glass-table">
                            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Cost</th><th>Price</th><th>Margin</th><th>Stock</th><th>Branch</th></tr></thead>
                            <tbody>
                                {filtered.map(p => (
                                    <tr key={p._id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                                        <td><span className="badge badge-secondary">{p.sku}</span></td>
                                        <td>{p.category}</td>
                                        <td>₹{Number(p.costPrice).toLocaleString()}</td>
                                        <td>₹{Number(p.sellingPrice).toLocaleString()}</td>
                                        <td style={{ color: 'var(--success)' }}>{((1 - p.costPrice / p.sellingPrice) * 100).toFixed(0)}%</td>
                                        <td><span className={`badge ${p.stock <= (p.minStock || 5) ? 'badge-danger' : 'badge-success'}`}>{p.stock}</span></td>
                                        <td>{p.branchId?.name || '—'}</td>
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

export default TopProducts
