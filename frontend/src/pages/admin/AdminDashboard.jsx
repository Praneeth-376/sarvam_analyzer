import { useState, useEffect } from 'react'
import axios from 'axios'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { BarChart3, ShoppingCart, Package, CreditCard, Users, FileText, DollarSign, TrendingUp, Activity, Inbox, AlertTriangle } from 'lucide-react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import DashboardLayout from '../../components/DashboardLayout'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

const menuItems = [
    {
        label: 'Overview', items: [
            { name: 'Dashboard', path: '/admin', icon: <BarChart3 size={18} /> },
            { name: 'Sales', path: '/admin/sales', icon: <ShoppingCart size={18} /> },
        ]
    },
    {
        label: 'Manage', items: [
            { name: 'Products', path: '/admin/products', icon: <Package size={18} /> },
            { name: 'Expenses', path: '/admin/expenses', icon: <CreditCard size={18} /> },
            { name: 'Workers', path: '/admin/workers', icon: <Users size={18} /> },
        ]
    },
    {
        label: '', items: [
            { name: 'Reports', path: '/admin/reports', icon: <FileText size={18} /> },
        ]
    }
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COLORS = ['#22d3ee', '#0ea5e9', '#8b5cf6', '#f59e0b', '#34d399', '#f87171', '#a78bfa', '#60a5fa', '#fbbf24', '#ec4899']

const AdminDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API}/api/dashboard/admin`, getToken())
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

    if (loading) return <DashboardLayout menuItems={menuItems} role="admin"><div className="loading-state"><div className="loading-spinner"></div>Loading branch dashboard...</div></DashboardLayout>
    if (!data) return <DashboardLayout menuItems={menuItems} role="admin"><div className="empty-state"><div className="empty-state-icon"><AlertTriangle size={48} /></div>Failed to load data</div></DashboardLayout>

    const barOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }, padding: 12, cornerRadius: 8 }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: textColor(), font: { size: 11 } } },
            y: { grid: { color: gridColor() }, ticks: { color: textColor(), font: { size: 11 }, callback: v => fmt(v) } }
        }
    }

    const workerChart = {
        labels: data.topWorkers?.map(w => w.workerName?.split(' ')[0]) || [],
        datasets: [{
            label: 'Sales',
            data: data.topWorkers?.map(w => w.totalSales) || [],
            backgroundColor: COLORS.slice(0, data.topWorkers?.length),
            borderRadius: 8, borderSkipped: false, barThickness: 36,
        }]
    }

    const monthlySalesChart = {
        labels: data.monthlySales?.map(m => `${MONTHS[m._id.month - 1]}`) || [],
        datasets: [{
            label: 'Revenue',
            data: data.monthlySales?.map(m => m.revenue) || [],
            borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.08)',
            fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2.5,
        }, {
            label: 'Profit',
            data: data.monthlySales?.map(m => m.profit) || [],
            borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.05)',
            fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2,
        }]
    }

    const categoryDoughnut = {
        labels: data.categorySales?.map(c => c._id) || [],
        datasets: [{ data: data.categorySales?.map(c => c.revenue) || [], backgroundColor: COLORS, borderWidth: 0, hoverOffset: 6 }]
    }

    const expDoughnut = {
        labels: data.expenseCategories?.map(c => c._id?.charAt(0).toUpperCase() + c._id?.slice(1)) || [],
        datasets: [{ data: data.expenseCategories?.map(c => c.total) || [], backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#22d3ee'], borderWidth: 0, hoverOffset: 6 }]
    }

    const dOpts = {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: {
            legend: { position: 'bottom', labels: { color: textColor(), font: { size: 11, family: 'Inter' }, padding: 12, usePointStyle: true } },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.parsed)}` } }
        }
    }

    const lineOpts = { ...barOpts, plugins: { ...barOpts.plugins, legend: { display: true, position: 'bottom', labels: { color: textColor(), font: { size: 11, family: 'Inter' }, usePointStyle: true } } }, interaction: { mode: 'index', intersect: false } }

    return (
        <DashboardLayout menuItems={menuItems} role="admin">
            <div className="page-header">
                <h1 className="page-title">Branch Dashboard</h1>
                <p className="page-subtitle">Your branch performance at a glance</p>
            </div>

            <div className="stats-grid">
                {[
                    { icon: <DollarSign size={24} />, value: fmt(data.branchRevenue), label: 'Revenue', color: '#22d3ee' },
                    { icon: <TrendingUp size={24} />, value: fmt(data.branchProfit), label: 'Gross Profit', color: '#34d399' },
                    { icon: <CreditCard size={24} />, value: fmt(data.branchExpenses), label: 'Expenses', color: '#f87171' },
                    { icon: <Activity size={24} />, value: fmt(data.netProfit), label: 'Net Profit', color: data.netProfit >= 0 ? '#34d399' : '#f87171' },
                    { icon: <Package size={24} />, value: data.productCount, label: 'Products', color: '#fbbf24' },
                    { icon: <Users size={24} />, value: data.workerCount, label: 'Workers', color: '#a78bfa' },
                    { icon: <ShoppingCart size={24} />, value: data.salesCount, label: 'Sales', color: '#0ea5e9' },
                    { icon: <Inbox size={24} />, value: data.pendingRequests, label: 'Pending Requests', color: '#f59e0b' },
                ].map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {data.pendingRequests > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--space-xl)' }}>
                    ⚠️ You have {data.pendingRequests} pending stock request(s) to review
                </div>
            )}

            <div className="chart-grid">
                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Top Workers</div><div className="card-subtitle">By total sales revenue</div></div>
                    </div>
                    <div className="chart-wrapper">
                        <Bar data={workerChart} options={barOpts} />
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Monthly Trend</div><div className="card-subtitle">Revenue & profit</div></div>
                    </div>
                    <div className="chart-wrapper">
                        <Line data={monthlySalesChart} options={lineOpts} />
                    </div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Sales by Category</div><div className="card-subtitle">Revenue split</div></div>
                    </div>
                    <div className="doughnut-wrapper">
                        <Doughnut data={categoryDoughnut} options={dOpts} />
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Expense Breakdown</div><div className="card-subtitle">By category</div></div>
                    </div>
                    <div className="doughnut-wrapper">
                        <Doughnut data={expDoughnut} options={dOpts} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default AdminDashboard
