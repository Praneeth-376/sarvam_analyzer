import { useState, useEffect } from 'react'
import axios from 'axios'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings, DollarSign, Activity, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import DashboardLayout from '../../components/DashboardLayout'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

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
const CHART_COLORS = ['#22d3ee', '#0ea5e9', '#8b5cf6', '#f59e0b', '#34d399', '#f87171', '#a78bfa', '#60a5fa', '#fbbf24', '#ec4899']

const MasterDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API}/api/dashboard/master`, getToken())
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

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark'
    const textColor = () => getTheme() === 'dark' ? '#94a3b8' : '#64748b'
    const gridColor = () => getTheme() === 'dark' ? 'rgba(56,189,248,0.06)' : 'rgba(15,23,42,0.06)'

    if (loading) return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="loading-state"><div className="loading-spinner"></div>Loading enterprise dashboard...</div>
        </DashboardLayout>
    )

    if (!data) return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="empty-state"><div className="empty-state-icon"><AlertTriangle size={48} /></div>Failed to load data. Check backend connection.</div>
        </DashboardLayout>
    )

    // ─── Chart Configs ───
    const chartOptions = (title, showLegend = false) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: showLegend, position: 'bottom', labels: { color: textColor(), font: { size: 11, family: 'Inter' }, padding: 16, usePointStyle: true } },
            title: { display: false },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Inter', size: 12 }, bodyFont: { family: 'Inter', size: 11 }, padding: 12, cornerRadius: 8 }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: textColor(), font: { size: 11, family: 'Inter' } } },
            y: { grid: { color: gridColor() }, ticks: { color: textColor(), font: { size: 11, family: 'Inter' }, callback: v => fmt(v) } }
        }
    })

    const branchRevenueChart = {
        labels: data.branchRevenue?.map(b => b.branchName?.split(' ')[0]) || [],
        datasets: [{
            label: 'Revenue',
            data: data.branchRevenue?.map(b => b.revenue) || [],
            backgroundColor: CHART_COLORS.slice(0, data.branchRevenue?.length),
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 40,
        }]
    }

    const monthlyTrendChart = {
        labels: data.monthlySales?.map(m => `${MONTHS[m._id.month - 1]} '${String(m._id.year).slice(-2)}`) || [],
        datasets: [
            {
                label: 'Revenue',
                data: data.monthlySales?.map(m => m.revenue) || [],
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34,211,238,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7,
                borderWidth: 2.5,
            },
            {
                label: 'Profit',
                data: data.monthlySales?.map(m => m.profit) || [],
                borderColor: '#34d399',
                backgroundColor: 'rgba(52,211,153,0.05)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                borderWidth: 2,
            }
        ]
    }

    const categoryDoughnut = {
        labels: data.categorySales?.map(c => c._id) || [],
        datasets: [{
            data: data.categorySales?.map(c => c.revenue) || [],
            backgroundColor: CHART_COLORS,
            borderWidth: 0,
            hoverOffset: 8,
        }]
    }

    const expenseDoughnut = {
        labels: data.expenseCategories?.map(c => c._id?.charAt(0).toUpperCase() + c._id?.slice(1)) || [],
        datasets: [{
            data: data.expenseCategories?.map(c => c.total) || [],
            backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#22d3ee'],
            borderWidth: 0,
            hoverOffset: 8,
        }]
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: textColor(), font: { size: 11, family: 'Inter' }, padding: 12, usePointStyle: true } },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }, padding: 12, cornerRadius: 8,
                callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.parsed)}` }
            }
        },
        cutout: '65%'
    }

    const lineOptions = {
        ...chartOptions('', true),
        interaction: { mode: 'index', intersect: false },
    }

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header">
                <h1 className="page-title">Enterprise Overview</h1>
                <p className="page-subtitle">Real-time business analytics across all {data.totalBranches} branches</p>
            </div>

            {/* ─── KPI Stats ─── */}
            <div className="stats-grid">
                {[
                    { icon: <DollarSign size={24} />, value: fmt(data.totalRevenue), label: 'Total Revenue', color: '#22d3ee' },
                    { icon: <TrendingUp size={24} />, value: fmt(data.totalProfit), label: 'Gross Profit', color: '#34d399' },
                    { icon: <CreditCard size={24} />, value: fmt(data.totalExpenses), label: 'Total Expenses', color: '#f87171' },
                    { icon: <Activity size={24} />, value: fmt(data.netProfit), label: 'Net Profit', color: data.netProfit >= 0 ? '#34d399' : '#f87171' },
                    { icon: <Building2 size={24} />, value: data.totalBranches, label: 'Active Branches', color: '#60a5fa' },
                    { icon: <Users size={24} />, value: data.totalWorkers + data.totalAdmins, label: 'Team Size', color: '#a78bfa' },
                    { icon: <Package size={24} />, value: data.totalProducts, label: 'Products', color: '#fbbf24' },
                    { icon: <ShoppingCart size={24} />, value: data.totalSalesCount?.toLocaleString(), label: 'Total Sales', color: '#22d3ee' },
                ].map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ─── Charts Row 1: Revenue + Trend ─── */}
            <div className="chart-grid">
                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Branch Revenue</div><div className="card-subtitle">Revenue by branch</div></div>
                    </div>
                    <div className="chart-wrapper">
                        <Bar data={branchRevenueChart} options={chartOptions('Branch Revenue')} />
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Monthly Trend</div><div className="card-subtitle">Revenue & profit · last 12 months</div></div>
                    </div>
                    <div className="chart-wrapper">
                        <Line data={monthlyTrendChart} options={lineOptions} />
                    </div>
                </div>
            </div>

            {/* ─── Charts Row 2: Category + Expense Doughnuts ─── */}
            <div className="chart-grid">
                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Sales by Category</div><div className="card-subtitle">Revenue distribution</div></div>
                    </div>
                    <div className="doughnut-wrapper">
                        <Doughnut data={categoryDoughnut} options={doughnutOptions} />
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header">
                        <div><div className="card-title">Expense Breakdown</div><div className="card-subtitle">By category</div></div>
                    </div>
                    <div className="doughnut-wrapper">
                        <Doughnut data={expenseDoughnut} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* ─── Top Products Table ─── */}
            <div className="glass-card">
                <div className="card-header">
                    <div><div className="card-title">Top Products</div><div className="card-subtitle">By revenue</div></div>
                </div>
                <div className="glass-table-wrapper">
                    <table className="glass-table">
                        <thead><tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Profit</th><th>Margin</th></tr></thead>
                        <tbody>
                            {data.topProducts?.slice(0, 10).map((p, i) => {
                                const margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : 0
                                return (
                                    <tr key={i}>
                                        <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{i + 1}</td>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p._id}</td>
                                        <td>{p.totalSold}</td>
                                        <td style={{ color: 'var(--success)' }}>{fmt(p.revenue)}</td>
                                        <td style={{ color: 'var(--info)' }}>{fmt(p.profit)}</td>
                                        <td><span className={`badge ${margin > 30 ? 'badge-success' : margin > 15 ? 'badge-warning' : 'badge-danger'}`}>{margin}%</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default MasterDashboard
