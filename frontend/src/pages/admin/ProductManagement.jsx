import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, ShoppingCart, Package, CreditCard, Users, FileText, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import StockUpdateModal from '../../components/StockUpdateModal'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/admin', icon: <BarChart3 size={18} /> }, { name: 'Sales', path: '/admin/sales', icon: <ShoppingCart size={18} /> }] },
    { label: 'Manage', items: [{ name: 'Products', path: '/admin/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/admin/expenses', icon: <CreditCard size={18} /> }, { name: 'Workers', path: '/admin/workers', icon: <Users size={18} /> }] },
    { label: '', items: [{ name: 'Reports', path: '/admin/reports', icon: <FileText size={18} /> }] }
]

const ProductManagement = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showStockModal, setShowStockModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [stockUpdateAmount, setStockUpdateAmount] = useState('')
    const [form, setForm] = useState({ name: '', sku: '', category: 'Electronics', costPrice: '', sellingPrice: '', stock: '', minStock: 5 })

    const load = () => {
        axios.get(`${API}/api/products`, getToken()).then(r => setProducts(r.data)).catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const createProduct = async e => {
        e.preventDefault()
        try {
            await axios.post(`${API}/api/products`, form, getToken())
            setShowModal(false)
            setForm({ name: '', sku: '', category: 'Electronics', costPrice: '', sellingPrice: '', stock: '', minStock: 5 })
            load()
        } catch (err) { alert(err.response?.data?.msg || 'Error') }
    }

    const deleteProduct = async id => {
        if (!confirm('Delete product?')) return
        try { await axios.delete(`${API}/api/products/${id}`, getToken()); load() } catch (e) { alert('Error') }
    }

    const updateStock = async e => {
        e.preventDefault()
        if (!selectedProduct) return
        try {
            // We'll use the update endpoint. Assuming backend handles strict update or we just patch the stock.
            // If there isn't a dedicated add-stock endpoint, we can use PUT /api/products/:id
            // Let's assume we update the whole product for now, or just the stock if backend allows.
            // A safer way often is to fetch, update locally, then PUT.
            const newStock = parseInt(selectedProduct.stock) + parseInt(stockUpdateAmount)
            await axios.put(`${API}/api/products/${selectedProduct._id}`, { ...selectedProduct, stock: newStock }, getToken())
            setShowStockModal(false)
            setStockUpdateAmount('')
            setSelectedProduct(null)
            load()
        } catch (e) { alert('Error updating stock') }
    }

    const openStockModal = (p) => {
        setSelectedProduct(p)
        setStockUpdateAmount('')
        setShowStockModal(true)
    }

    const fmt = n => `₹${Number(n).toLocaleString()}`

    return (
        <DashboardLayout menuItems={menuItems} role="admin">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="page-title">Products</h1><p className="page-subtitle">Manage branch inventory</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} style={{ marginRight: 8 }} /> Add Product</button>
            </div>

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <div className="glass-card">
                    <div className="glass-table-wrapper">
                        <table className="glass-table">
                            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Cost</th><th>Price</th><th>Margin</th><th>Stock</th><th>Actions</th></tr></thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                                        <td><span className="badge badge-secondary">{p.sku}</span></td>
                                        <td>{p.category}</td>
                                        <td>{fmt(p.costPrice)}</td>
                                        <td>{fmt(p.sellingPrice)}</td>
                                        <td style={{ color: 'var(--success)' }}>{((1 - p.costPrice / p.sellingPrice) * 100).toFixed(0)}%</td>
                                        <td><span className={`badge ${p.stock <= (p.minStock || 5) ? 'badge-danger' : p.stock <= 20 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-sm btn-secondary" onClick={() => openStockModal(p)} title="Add Stock"><RefreshCw size={14} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(p._id)} title="Delete"><Trash2 size={14} /></button>
                                            </div>
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
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Add New Product</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Enter product details to track inventory</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={createProduct} style={{ padding: '0 8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Product Name</label>
                                    <input className="glass-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Wireless Mouse" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">SKU Code</label>
                                    <input className="glass-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="Auto-generated if empty" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="glass-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {['Electronics', 'Accessories', 'Storage', 'Software', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cost Price (₹)</label>
                                    <input className="glass-input" type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} required placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Selling Price (₹)</label>
                                    <input className="glass-input" type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} required placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Initial Stock</label>
                                    <input className="glass-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required placeholder="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Low Stock Alert</label>
                                    <input className="glass-input" type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} placeholder="5" />
                                </div>
                            </div>
                            <div className="modal-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ width: '120px' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showStockModal && selectedProduct && (
                <StockUpdateModal
                    product={selectedProduct}
                    onClose={() => setShowStockModal(false)}
                    onSuccess={() => { load(); setShowStockModal(false); }}
                />
            )}
        </DashboardLayout>
    )
}

export default ProductManagement
