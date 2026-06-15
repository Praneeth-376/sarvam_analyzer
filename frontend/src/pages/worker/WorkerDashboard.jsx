import { useState, useEffect } from 'react'
import axios from 'axios'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { BarChart3, ShoppingCart, Package, DollarSign, TrendingUp, Target, Inbox, AlertTriangle } from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import DashboardLayout from '../../components/DashboardLayout'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

const menuItems = [
    {
        label: 'My Work', items: [
            { name: 'Dashboard', path: '/worker', icon: <BarChart3 size={18} /> },
            { name: 'Record Sale', path: '/worker/sale', icon: <ShoppingCart size={18} /> },
            { name: 'Stock Check', path: '/worker/stock', icon: <Package size={18} /> },
        ]
    }
]

const WorkerDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API}/api/dashboard/worker`, getToken())
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const fmt = n => {
        if (n == null) return '₹0'
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
        if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
        return `₹${Math.round(n)}`
    }

    const textColor = () => (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? '#94a3b8' : '#64748b'
    const gridColor = () => (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? 'rgba(56,189,248,0.06)' : 'rgba(15,23,42,0.06)'
    const COLORS = ['#22d3ee', '#0ea5e9', '#8b5cf6', '#f59e0b', '#34d399', '#f87171', '#a78bfa', '#60a5fa', '#fbbf24', '#ec4899']

    if (loading) return <DashboardLayout menuItems={menuItems} role="worker"><div className="loading-state"><div className="loading-spinner"></div>Loading your dashboard...</div></DashboardLayout>
    if (!data) return <DashboardLayout menuItems={menuItems} role="worker"><div className="empty-state"><div className="empty-state-icon"><AlertTriangle size={48} /></div>Failed to load data</div></DashboardLayout>

    const targetPct = data.salesTarget > 0 ? Math.min(100, ((data.mySalesTotal / data.salesTarget) * 100)).toFixed(1) : 0

    // Daily sales line chart
    const dailyChart = {
        labels: data.dailySales?.map(d => { const dt = new Date(d._id); return `${dt.getDate()}/${dt.getMonth() + 1}`; }) || [],
        datasets: [{
            label: 'Daily Sales',
            data: data.dailySales?.map(d => d.total) || [],
            borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.1)',
            fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2.5,
        }]
    }

    const dailyOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8, callbacks: { label: ctx => fmt(ctx.parsed.y) } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: textColor(), font: { size: 10 } } },
            y: { grid: { color: gridColor() }, ticks: { color: textColor(), font: { size: 10 }, callback: v => fmt(v) } }
        },
        interaction: { mode: 'nearest', intersect: false }
    }

    const categoryChart = {
        labels: data.categorySales?.map(c => c._id) || [],
        datasets: [{ data: data.categorySales?.map(c => c.revenue) || [], backgroundColor: COLORS, borderWidth: 0, hoverOffset: 6 }]
    }
    const dOpts = {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: {
            legend: { position: 'bottom', labels: { color: textColor(), font: { size: 11, family: 'Inter' }, padding: 10, usePointStyle: true } },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 10, cornerRadius: 8, callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.parsed)}` } }
        }
    }

    return (
        <DashboardLayout menuItems={menuItems} role="worker">
            <div className="page-header">
                <h1 className="page-title">Welcome, {data.name?.split(' ')[0] || 'Team Member'}</h1>
                <p className="page-subtitle">Your sales performance dashboard</p>
            </div>

            <div className="stats-grid">
                {[
                    { icon: <DollarSign size={24} />, value: fmt(data.mySalesTotal), label: 'Total Sales', color: '#22d3ee' },
                    { icon: <BarChart3 size={24} />, value: data.mySalesCount, label: 'Sales Count', color: '#0ea5e9' },
                    { icon: <TrendingUp size={24} />, value: fmt(data.todaySales), label: 'Today\'s Sales', color: '#34d399' },
                    { icon: <Target size={24} />, value: `${targetPct}%`, label: 'Target Progress', color: parseFloat(targetPct) >= 80 ? '#34d399' : '#f59e0b' },
                    { icon: <Package size={24} />, value: data.productsCount, label: 'Products Available', color: '#a78bfa' },
                    { icon: <Inbox size={24} />, value: data.pendingRequests, label: 'My Stock Requests', color: '#fbbf24' },
                ].map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Target Progress Bar */}
            <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="card-header">
                    <div><div className="card-title">Sales Target</div><div className="card-subtitle">{fmt(data.mySalesTotal)} of {fmt(data.salesTarget)} target</div></div>
                    <span className={`badge ${parseFloat(targetPct) >= 100 ? 'badge-success' : parseFloat(targetPct) >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                        {targetPct}%
                    </span>
                </div>
                <div className="progress-bar" style={{ height: 14, borderRadius: 7 }}>
                    <div className={`progress-fill ${parseFloat(targetPct) >= 100 ? 'success' : parseFloat(targetPct) >= 60 ? 'warning' : 'danger'}`}
                        style={{ width: `${Math.min(100, targetPct)}%`, borderRadius: 7 }}></div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Sales Trend</div><div className="card-subtitle">Last 30 days</div></div>
                    </div>
                    <div className="chart-wrapper">
                        <Line data={dailyChart} options={dailyOpts} />
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">My Sales by Category</div><div className="card-subtitle">Revenue distribution</div></div>
                    </div>
                    <div className="doughnut-wrapper">
                        <Doughnut data={categoryChart} options={dOpts} />
                    </div>
                </div>
            </div>

            {/* Recent Sales */}
            <div className="glass-card">
                <div className="card-header">
                    <div><div className="card-title">Recent Sales</div><div className="card-subtitle">Last 20 transactions</div></div>
                </div>
                <div className="glass-table-wrapper">
                    <table className="glass-table">
                        <thead><tr><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {data.recentSales?.map((s, i) => (
                                <tr key={i}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.productName}</td>
                                    <td>{s.quantity}</td>
                                    <td style={{ color: 'var(--success)' }}>{fmt(s.totalAmount)}</td>
                                    <td><span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{s.status}</span></td>
                                    <td style={{ color: 'var(--text-tertiary)' }}>{new Date(s.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default WorkerDashboard
