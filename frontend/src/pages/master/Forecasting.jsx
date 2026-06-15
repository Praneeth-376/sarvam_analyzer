import { useState, useEffect } from 'react'
import axios from 'axios'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { TrendingUp, TrendingDown, Minus, HelpCircle, BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, Target, Settings, ArrowUpRight, DollarSign, Calendar } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

const menuItems = [
    {
        label: 'Overview', items: [
            { name: 'Dashboard', path: '/master', icon: <BarChart3 size={18} /> },
            { name: 'Branches', path: '/master/branches', icon: <Building2 size={18} /> },
            { name: 'Profit & Loss', path: '/master/profit', icon: <Wallet size={18} /> },
        ]
    },
    {
        label: 'Management', items: [
            { name: 'Users', path: '/master/users', icon: <Users size={18} /> },
            { name: 'Products', path: '/master/products', icon: <Package size={18} /> },
            { name: 'Expenses', path: '/master/expenses', icon: <CreditCard size={18} /> },
        ]
    },
    {
        label: 'Analytics', items: [
            { name: 'Inventory', path: '/master/inventory', icon: <ClipboardList size={18} /> },
            { name: 'Forecasting', path: '/master/forecasting', icon: <TrendingUp size={18} /> },
            { name: 'Margins', path: '/master/margins', icon: <Target size={18} /> },
        ]
    },
    {
        label: 'System', items: [
            { name: 'Settings', path: '/master/settings', icon: <Settings size={18} /> },
        ]
    }
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const Forecasting = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API}/api/dashboard/forecast`, getToken())
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const fmt = n => {
        if (n == null) return '₹0'
        if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
        if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
        return `₹${Math.round(n)}`
    }

    const textColor = () => (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? '#94a3b8' : '#64748b'
    const gridColor = () => (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? 'rgba(56,189,248,0.06)' : 'rgba(15,23,42,0.06)'

    if (loading) return <DashboardLayout menuItems={menuItems} role="master"><div className="loading-state"><div className="loading-spinner"></div>Running ML predictions...</div></DashboardLayout>
    if (!data) return <DashboardLayout menuItems={menuItems} role="master"><div className="empty-state"><div className="empty-state-icon"><HelpCircle size={48} /></div>Failed to load forecast data</div></DashboardLayout>

    const trendInfo = {
        growing: { label: 'Growing', color: '#34d399', icon: <TrendingUp size={20} /> },
        declining: { label: 'Declining', color: '#f87171', icon: <TrendingDown size={20} /> },
        stable: { label: 'Stable', color: '#fbbf24', icon: <Minus size={20} /> },
        insufficient_data: { label: 'Insufficient Data', color: '#64748b', icon: <HelpCircle size={20} /> }
    }
    const trend = trendInfo[data.trend] || trendInfo.stable

    // Build combined chart: Historical + Predicted
    const allLabels = [
        ...(data.historical?.map(m => `${MONTHS[m._id.month - 1]} '${String(m._id.year).slice(-2)}`) || []),
        ...(data.predictions?.map(m => `${MONTHS[m._id.month - 1]} '${String(m._id.year).slice(-2)}`) || [])
    ]

    const historicalRevenue = data.historical?.map(m => m.revenue) || []
    const predRevenue = data.predictions?.map(m => m.revenue) || []

    const revenueActual = [...historicalRevenue, ...Array(predRevenue.length).fill(null)]
    const revenuePredicted = [...Array(historicalRevenue.length - 1).fill(null), historicalRevenue[historicalRevenue.length - 1], ...predRevenue]

    const movingAvgLine = data.movingAvg ? [
        ...Array(2).fill(null),
        ...data.movingAvg.map(m => m.avg),
        ...Array(predRevenue.length).fill(null)
    ] : null

    const forecastChart = {
        labels: allLabels,
        datasets: [
            {
                label: 'Actual Revenue',
                data: revenueActual,
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34,211,238,0.08)',
                fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 8, borderWidth: 3,
                pointBackgroundColor: '#22d3ee',
            },
            {
                label: 'Predicted Revenue',
                data: revenuePredicted,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245,158,11,0.06)',
                fill: true, tension: 0.4, borderWidth: 3, borderDash: [8, 4],
                pointRadius: 6, pointHoverRadius: 9,
                pointBackgroundColor: '#f59e0b', pointBorderColor: '#f59e0b',
                pointStyle: 'rectRounded',
            },
            ...(movingAvgLine ? [{
                label: '3-Month Moving Avg',
                data: movingAvgLine,
                borderColor: '#a78bfa',
                backgroundColor: 'transparent',
                fill: false, tension: 0.4, borderWidth: 2, borderDash: [4, 4],
                pointRadius: 0,
            }] : [])
        ]
    }

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: textColor(), font: { size: 12, family: 'Inter' }, padding: 20, usePointStyle: true } },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.95)', titleFont: { family: 'Inter', size: 13 }, bodyFont: { family: 'Inter', size: 12 },
                padding: 16, cornerRadius: 10, callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: textColor(), font: { size: 11, family: 'Inter' } } },
            y: { grid: { color: gridColor() }, ticks: { color: textColor(), font: { size: 11, family: 'Inter' }, callback: v => fmt(v) } }
        },
        interaction: { mode: 'index', intersect: false }
    }

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header">
                <h1 className="page-title">ML Sales Forecasting</h1>
                <p className="page-subtitle">AI-powered predictions using linear regression & seasonal analysis</p>
            </div>

            {/* Prediction Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: `${trend.color}18`, color: trend.color }}>{trend.icon}</div>
                    <div className="stat-value" style={{ color: trend.color }}>{trend.label}</div>
                    <div className="stat-label">Revenue Trend</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#22d3ee18', color: '#22d3ee' }}><ArrowUpRight size={24} /></div>
                    <div className="stat-value">{data.growthRate > 0 ? '+' : ''}{data.growthRate}%</div>
                    <div className="stat-label">Growth Rate</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#34d39918', color: '#34d399' }}><DollarSign size={24} /></div>
                    <div className="stat-value">{fmt(data.avgMonthlyRevenue)}</div>
                    <div className="stat-label">Avg Monthly Revenue</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f59e0b18', color: '#f59e0b' }}><Calendar size={24} /></div>
                    <div className="stat-value">{fmt(data.predictions?.[0]?.revenue)}</div>
                    <div className="stat-label">Next Month Forecast</div>
                </div>
            </div>

            {/* Main Forecast Chart */}
            <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">Revenue Forecast</div>
                        <div className="card-subtitle">{data.totalDataPoints} months historical · 3 months predicted</div>
                    </div>
                    <span className={`badge ${data.trend === 'growing' ? 'badge-success' : data.trend === 'declining' ? 'badge-danger' : 'badge-warning'}`}>
                        {trend.icon} {trend.label}
                    </span>
                </div>
                <div className="chart-wrapper" style={{ height: 380 }}>
                    <Line data={forecastChart} options={chartOpts} />
                </div>
            </div>

            {/* Predictions Table */}
            <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="card-header">
                    <div><div className="card-title">Predicted Revenue</div><div className="card-subtitle">Next 3 months forecast</div></div>
                </div>
                <div className="glass-table-wrapper">
                    <table className="glass-table">
                        <thead><tr><th>Month</th><th>Predicted Revenue</th><th>Confidence</th></tr></thead>
                        <tbody>
                            {data.predictions?.map((p, i) => (
                                <tr key={i}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{MONTHS[p._id.month - 1]} {p._id.year}</td>
                                    <td style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1em' }}>{fmt(p.revenue)}</td>
                                    <td><span className={`badge ${i === 0 ? 'badge-success' : i === 1 ? 'badge-warning' : 'badge-info'}`}>{['High', 'Medium', 'Low'][i]}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Forecasting
