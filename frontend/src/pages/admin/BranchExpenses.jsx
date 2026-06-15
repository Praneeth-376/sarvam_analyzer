import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, ShoppingCart, Package, CreditCard, Users, FileText, ClipboardList, Plus, Trash2 } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import DashboardLayout from '../../components/DashboardLayout'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/admin', icon: <BarChart3 size={18} /> }, { name: 'Sales', path: '/admin/sales', icon: <ShoppingCart size={18} /> }] },
    { label: 'Manage', items: [{ name: 'Products', path: '/admin/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/admin/expenses', icon: <CreditCard size={18} /> }, { name: 'Workers', path: '/admin/workers', icon: <Users size={18} /> }] },
    { label: '', items: [{ name: 'Reports', path: '/admin/reports', icon: <FileText size={18} /> }] }
]

const BranchExpenses = () => {
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ category: 'supplies', amount: '', description: '' })

    const load = () => {
        axios.get(`${API}/api/expenses`, getToken()).then(r => setExpenses(r.data)).catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const addExpense = async e => {
        e.preventDefault()
        try { await axios.post(`${API}/api/expenses`, form, getToken()); setShowModal(false); setForm({ category: 'supplies', amount: '', description: '' }); load() }
        catch (err) { alert('Error') }
    }

    const deleteExpense = async id => {
        if (!confirm('Delete expense?')) return
        try { await axios.delete(`${API}/api/expenses/${id}`, getToken()); load() } catch (e) { alert('Error') }
    }

    const total = expenses.reduce((s, e) => s + e.amount, 0)
    const byCat = {}
    expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount })

    const chartData = {
        labels: Object.keys(byCat),
        datasets: [{
            label: 'Expenses',
            data: Object.values(byCat),
            backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#22d3ee'],
            borderRadius: 6,
        }]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `₹${ctx.parsed.y.toLocaleString()}` } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b' } },
            y: { grid: { color: 'rgba(15,23,42,0.06)' }, ticks: { color: '#64748b', callback: v => `₹${v / 1000}K` } }
        }
    }

    return (
        <DashboardLayout menuItems={menuItems} role="admin">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="page-title">Expenses</h1><p className="page-subtitle">Branch expense tracking</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} style={{ marginRight: 8 }} /> Add Expense</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card"><div className="stat-icon"><CreditCard size={24} /></div><div className="stat-value">₹{total.toLocaleString()}</div><div className="stat-label">Total Expenses</div></div>
                <div className="stat-card"><div className="stat-icon"><ClipboardList size={24} /></div><div className="stat-value">{Object.keys(byCat).length}</div><div className="stat-label">Categories</div></div>
                <div className="stat-card"><div className="stat-icon"><FileText size={24} /></div><div className="stat-value">{expenses.length}</div><div className="stat-label">Records</div></div>
            </div>

            <div className="chart-grid">
                <div className="glass-card">
                    <div className="card-header"><div><div className="card-title">By Category</div></div></div>
                    <div className="chart-wrapper" style={{ height: 300, padding: 20 }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header"><div><div className="card-title">Recent Expenses</div></div></div>
                    <div className="glass-table-wrapper">
                        <table className="glass-table">
                            <thead><tr><th>Category</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
                            <tbody>
                                {expenses.slice(0, 8).map(e => (
                                    <tr key={e._id}>
                                        <td style={{ textTransform: 'capitalize' }}>{e.category}</td>
                                        <td style={{ color: 'var(--warning)' }}>₹{e.amount.toLocaleString()}</td>
                                        <td>{new Date(e.date).toLocaleDateString()}</td>
                                        <td><button className="btn btn-sm btn-danger" onClick={() => deleteExpense(e._id)}><Trash2 size={14} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">Add Expense</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={addExpense}>
                            <div className="form-group"><label className="form-label">Category</label>
                                <select className="glass-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {['rent', 'salary', 'utilities', 'supplies', 'maintenance', 'marketing'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label className="form-label">Amount (₹)</label><input className="glass-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
                            <div className="form-group"><label className="form-label">Description</label><input className="glass-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default BranchExpenses
