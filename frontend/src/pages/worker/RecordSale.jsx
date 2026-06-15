import { useState, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BarChart3, ShoppingCart, Package, Download } from 'lucide-react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [{
    label: '', items: [
        { name: 'Dashboard', path: '/worker', icon: <BarChart3 size={18} /> },
        { name: 'Record Sale', path: '/worker/sale', icon: <ShoppingCart size={18} /> },
        { name: 'Stock Check', path: '/worker/stock', icon: <Package size={18} /> }
    ]
}]

const RecordSale = () => {
    const [products, setProducts] = useState([])
    const [selected, setSelected] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState(null)
    const [recentSales, setRecentSales] = useState([])
    const [lastSale, setLastSale] = useState(null)

    const load = () => {
        Promise.all([
            axios.get(`${API}/api/products`, getToken()),
            axios.get(`${API}/api/sales`, getToken())
        ]).then(([p, s]) => {
            setProducts(p.data)
            setRecentSales(s.data.slice(0, 5))
        }).catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const product = products.find(p => p._id === selected)

    const generateBill = (saleData) => {
        try {
            const doc = new jsPDF()

            // Header
            doc.setFontSize(22)
            doc.setTextColor(34, 211, 238) // Cyan accent 
            doc.text('Sarvam Analyser', 14, 20)

            doc.setFontSize(14)
            doc.setTextColor(100, 116, 139)
            doc.text('Invoice / Receipt', 14, 28)

            // Divider
            doc.setDrawColor(226, 232, 240)
            doc.line(14, 32, 196, 32)

            // Meta details
            doc.setFontSize(10)
            doc.setTextColor(71, 85, 105)
            doc.text(`Receipt ID: ${saleData?._id}`, 14, 40)
            doc.text(`Date: ${new Date(saleData?.date || new Date()).toLocaleString()}`, 14, 46)
            doc.text(`Attendant: ${saleData?.workerId?.name || 'Worker'}`, 14, 52)

            // Table
            const tableColumn = ["Item Description", "Qty", "Unit Price", "Total Amount"]
            const tableRows = [
                [
                    saleData?.productName || 'Product',
                    saleData?.quantity || 1,
                    `Rs. ${saleData?.sellingPrice?.toLocaleString() || 0}`,
                    `Rs. ${saleData?.totalAmount?.toLocaleString() || 0}`
                ]
            ]

            autoTable(doc, {
                startY: 60,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42], textColor: 255 },
                styles: { fontSize: 10, cellPadding: 4 },
                alternateRowStyles: { fillColor: [248, 250, 252] }
            })

            // Total summary
            const finalY = doc.lastAutoTable?.finalY || 80
            doc.setFontSize(12)
            doc.setTextColor(15, 23, 42)
            doc.setFont('helvetica', 'bold')
            doc.text(`Grand Total: Rs. ${saleData?.totalAmount?.toLocaleString() || 0}`, 130, finalY + 10)

            // Footer message
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.setTextColor(100, 116, 139)
            doc.text('Thank you for choosing Sarvam! Ensure to keep this receipt safe.', 14, 280)

            doc.save(`Invoice_${saleData?._id || 'receipt'}.pdf`)
        } catch (error) {
            console.error("Error generating PDF:", error)
            alert("Failed to generate PDF. Check console for details.")
        }
    }

    const submit = async e => {
        e.preventDefault()
        if (!selected) return
        setSubmitting(true)
        setMessage(null)
        setLastSale(null)
        try {
            const res = await axios.post(`${API}/api/sales`, { productId: selected, quantity }, getToken())
            setLastSale(res.data)
            setMessage({ type: 'success', text: `Sale recorded: ${quantity}× ${product?.name}` })
            setSelected('')
            setQuantity(1)
            load()
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.msg || 'Failed' })
        } finally { setSubmitting(false) }
    }

    return (
        <DashboardLayout menuItems={menuItems} role="worker">
            <div className="page-header"><h1 className="page-title">Record Sale</h1><p className="page-subtitle">Log a new transaction</p></div>

            {message && (
                <div className={`alert alert-${message.type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{message.text}</span>
                    {message.type === 'success' && lastSale && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => generateBill(lastSale)}
                        >
                            <Download size={14} /> Download Bill
                        </button>
                    )}
                </div>
            )}

            <div className="page-grid">
                <div className="glass-card">
                    <div className="card-header"><div><div className="card-title">New Sale</div></div></div>
                    {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label className="form-label">Product</label>
                                <select className="glass-select" value={selected} onChange={e => setSelected(e.target.value)} required>
                                    <option value="">Select product...</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id} disabled={p.stock === 0}>
                                            {p.name} — ₹{p.sellingPrice} ({p.stock} in stock)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantity</label>
                                <input className="glass-input" type="number" min="1" max={product?.stock || 999} value={quantity} onChange={e => setQuantity(+e.target.value)} required />
                            </div>
                            {product && (
                                <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', background: 'var(--accent-dim)', border: '1px solid rgba(34,211,238,0.15)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>Unit Price</span>
                                        <span>₹{product.sellingPrice.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>Quantity</span>
                                        <span>{quantity}</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 700 }}>Total</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 'var(--font-lg)' }}>₹{(product.sellingPrice * quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting || !selected}>
                                {submitting ? 'Recording...' : 'Record Sale'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="glass-card">
                    <div className="card-header"><div><div className="card-title">Recent Sales</div></div></div>
                    {recentSales.length > 0 ? (
                        <div className="glass-table-wrapper">
                            <table className="glass-table">
                                <thead><tr><th>Product</th><th>Qty</th><th>Total</th><th>Date</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
                                <tbody>
                                    {recentSales.map(s => (
                                        <tr key={s._id}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.productName}</td>
                                            <td>{s.quantity}</td>
                                            <td style={{ color: 'var(--success)' }}>₹{s.totalAmount?.toLocaleString()}</td>
                                            <td>{new Date(s.date).toLocaleDateString()}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => generateBill(s)}
                                                    title="Download Bill"
                                                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <div className="empty-state"><div className="empty-state-icon"><ShoppingCart size={48} /></div>No sales yet</div>}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default RecordSale
