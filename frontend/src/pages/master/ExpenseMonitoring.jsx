import { useState, useEffect } from 'react'
import axios from 'axios'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings, Layers, FileText } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/master', icon: <BarChart3 size={18} /> }, { name: 'Branches', path: '/master/branches', icon: <Building2 size={18} /> }, { name: 'Profit & Loss', path: '/master/profit', icon: <Wallet size={18} /> }] },
    { label: 'Management', items: [{ name: 'Users', path: '/master/users', icon: <Users size={18} /> }, { name: 'Products', path: '/master/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/master/expenses', icon: <CreditCard size={18} /> }] },
    { label: 'Analytics', items: [{ name: 'Inventory', path: '/master/inventory', icon: <ClipboardList size={18} /> }, { name: 'Forecasting', path: '/master/forecasting', icon: <TrendingUp size={18} /> }, { name: 'Margins', path: '/master/margins', icon: <Target size={18} /> }] },
    { label: 'System', items: [{ name: 'Settings', path: '/master/settings', icon: <Settings size={18} /> }] }
]

const COLORS = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#22d3ee', '#e879f9']

const ExpenseMonitoring = () => {
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [branches, setBranches] = useState([])

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/api/expenses`, getToken()),
            axios.get(`${API}/api/branches`, getToken())
        ]).then(([e, b]) => { setExpenses(e.data); setBranches(b.data) })
            .catch(console.error).finally(() => setLoading(false))
    }, [])

    const total = expenses.reduce((s, e) => s + e.amount, 0)

    // Process Data
    const byCat = {}
    expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount })

    const byBranch = {}
    expenses.forEach(e => {
        const bn = branches.find(b => b._id === (e.branchId?._id || e.branchId))?.name || 'Unknown'
        byBranch[bn] = (byBranch[bn] || 0) + e.amount
    })

    // Chart Configs
    const categoryData = {
        labels: Object.keys(byCat).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        datasets: [{
            data: Object.values(byCat),
            backgroundColor: COLORS,
            borderWidth: 0,
            hoverOffset: 10
        }]
    }

    const branchData = {
        labels: Object.keys(byBranch),
        datasets: [{
            label: 'Total Expenses',
            data: Object.values(byBranch),
            backgroundColor: '#f87171', // Red for expenses
            borderRadius: 6,
            barThickness: 40
        }]
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, padding: 20, usePointStyle: true } }
        },
        cutout: '70%',
        layout: { padding: 10 }
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8 }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => '₹' + (v / 1000) + 'k' } }
        }
    }

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header"><h1 className="page-title">Expense Monitoring</h1><p className="page-subtitle">Company-wide expense analytics</p></div>

            <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}><CreditCard size={24} /></div><div className="stat-value">₹{(total / 100000).toFixed(1)}L</div><div className="stat-label">Total Expenses</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.1)' }}><Layers size={24} /></div><div className="stat-value">{Object.keys(byCat).length}</div><div className="stat-label">Categories</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)' }}><FileText size={24} /></div><div className="stat-value">{expenses.length}</div><div className="stat-label">Records</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)' }}><BarChart3 size={24} /></div><div className="stat-value">₹{(total / Math.max(Object.keys(byBranch).length, 1) / 1000).toFixed(0)}K</div><div className="stat-label">Avg per Branch</div></div>
            </div>

            {loading ? <div className="loading-state"><div className="loading-spinner"></div></div> : (
                <div className="chart-grid">
                    <div className="glass-card">
                        <div className="card-header"><div><div className="card-title">Expense Distribution</div><div className="card-subtitle">By Category</div></div></div>
                        <div className="doughnut-wrapper" style={{ height: '320px' }}>
                            {Object.keys(byCat).length > 0 ? (
                                <Doughnut data={categoryData} options={doughnutOptions} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No expense data available</div>
                            )}
                        </div>
                    </div>
                    <div className="glass-card">
                        <div className="card-header"><div><div className="card-title">Branch Usage</div><div className="card-subtitle">Expenses by Branch</div></div></div>
                        <div className="chart-wrapper" style={{ height: '320px' }}>
                            {Object.keys(byBranch).length > 0 ? (
                                <Bar data={branchData} options={barOptions} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No expense data available</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default ExpenseMonitoring
