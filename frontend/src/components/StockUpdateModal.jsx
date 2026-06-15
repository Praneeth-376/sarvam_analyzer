import { useState } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

const StockUpdateModal = ({ product, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!amount) return
        setLoading(true)
        try {
            const newStock = parseInt(product.stock) + parseInt(amount)
            await axios.put(`${API}/api/products/${product._id || product.id}`, { ...product, stock: newStock }, getToken())
            if (onSuccess) onSuccess()
            onClose()
        } catch (err) {
            console.error(err)
            alert('Failed to update stock')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Update Stock</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <strong>{product.name || product.Name}</strong>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Stock: {product.stock || product.Stock}</div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Add Quantity</label>
                        <input
                            className="glass-input"
                            type="number"
                            autoFocus
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            placeholder="Enter amount to add"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default StockUpdateModal
