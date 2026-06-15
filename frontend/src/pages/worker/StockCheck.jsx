import { useState, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

import { BarChart3, ShoppingCart, Package, ClipboardList } from 'lucide-react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [{
    label: '', items: [
        { name: 'Dashboard', path: '/worker', icon: <BarChart3 size={18} /> },
        { name: 'Record Sale', path: '/worker/sale', icon: <ShoppingCart size={18} /> },
        { name: 'Stock Check', path: '/worker/stock', icon: <Package size={18} /> }
    ]
}]

const StockCheck = () => {
    const [products, setProducts] = useState([])
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ productId: '', quantity: 10, type: 'refill', reason: '' })
    const [message, setMessage] = useState(null)

    const load = () => {
        Promise.all([
            axios.get(`${API}/api/products`, getToken()),
            axios.get(`${API}/api/stock-requests`, getToken())
        ]).then(([p, r]) => { setProducts(p.data); setRequests(r.data) })
            .catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const submitRequest = async e => {
        e.preventDefault()
        try {
            await axios.post(`${API}/api/stock-requests`, form, getToken())
            setMessage({ type: 'success', text: 'Stock request submitted!' })
            setShowModal(false)
            setForm({ productId: '', quantity: 10, type: 'refill', reason: '' })
            load()
        } catch (err) { setMessage({ type: 'danger', text: err.response?.data?.msg || 'Failed' }) }
    }

    return (
        <DashboardLayout menuItems={menuItems} role="worker">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="page-title">Stock Check</h1><p className="page-subtitle">Inventory levels & refill requests</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={16} /> Request Refill</button>
            </div>

            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <div className="page-grid">
                    <div className="glass-card">
                        <div className="card-header"><div><div className="card-title">Current Stock</div><div className="card-subtitle">{products.length} products</div></div></div>
                        <div className="glass-table-wrapper">
                            <table className="glass-table">
                                <thead><tr><th>Product</th><th>Stock</th><th>Min</th><th>Status</th></tr></thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                                            <td>{p.stock}</td>
                                            <td>{p.minStock}</td>
                                            <td>
                                                {p.stock === 0 ? <span className="badge badge-danger">Out of Stock</span> :
                                                    p.stock <= (p.minStock || 5) ? <span className="badge badge-warning">Low Stock</span> :
                                                        <span className="badge badge-success">In Stock</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-card">
                        <div className="card-header"><div><div className="card-title">My Requests</div></div></div>
                        {requests.length > 0 ? (
                            <div className="glass-table-wrapper">
                                <table className="glass-table">
                                    <thead><tr><th>Product</th><th>Qty</th><th>Type</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {requests.map(r => (
                                            <tr key={r._id}>
                                                <td>{r.productId?.name || '—'}</td>
                                                <td>{r.quantity}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                                                <td><span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <div className="empty-state"><div className="empty-state-icon"><ClipboardList size={48} /></div>No requests yet</div>}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">Stock Request</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={submitRequest}>
                            <div className="form-group"><label className="form-label">Product</label>
                                <select className="glass-select" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required>
                                    <option value="">Select product...</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label className="form-label">Quantity</label><input className="glass-input" type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} required /></div>
                            <div className="form-group"><label className="form-label">Type</label>
                                <select className="glass-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="refill">Refill</option>
                                    <option value="return">Return</option>
                                </select>
                            </div>
                            <div className="form-group"><label className="form-label">Reason</label><input className="glass-input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Optional" /></div>
                            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit</button></div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default StockCheck
