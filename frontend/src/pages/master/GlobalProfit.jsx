import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings, DollarSign, Activity, AlertTriangle } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/master', icon: <BarChart3 size={18} /> }, { name: 'Branches', path: '/master/branches', icon: <Building2 size={18} /> }, { name: 'Profit & Loss', path: '/master/profit', icon: <Wallet size={18} /> }] },
    { label: 'Management', items: [{ name: 'Users', path: '/master/users', icon: <Users size={18} /> }, { name: 'Products', path: '/master/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/master/expenses', icon: <CreditCard size={18} /> }] },
    { label: 'Analytics', items: [{ name: 'Inventory', path: '/master/inventory', icon: <ClipboardList size={18} /> }, { name: 'Forecasting', path: '/master/forecasting', icon: <TrendingUp size={18} /> }, { name: 'Margins', path: '/master/margins', icon: <Target size={18} /> }] },
    { label: 'System', items: [{ name: 'Settings', path: '/master/settings', icon: <Settings size={18} /> }] }
]

const GlobalProfit = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API}/api/dashboard/master`, getToken()).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Number(n || 0).toLocaleString()}`

    if (loading) return <DashboardLayout menuItems={menuItems} role="master"><div className="loading-state"><div className="loading-spinner"></div></div></DashboardLayout>
    if (!data) return <DashboardLayout menuItems={menuItems} role="master"><div className="empty-state"><div className="empty-state-icon"><AlertTriangle size={48} /></div>Failed to load</div></DashboardLayout>

    const netProfit = data.netProfit || 0
    const margin = data.totalRevenue > 0 ? (netProfit / data.totalRevenue * 100) : 0

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header"><h1 className="page-title">Profit & Loss</h1><p className="page-subtitle">Company financial overview</p></div>

            <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon"><DollarSign size={24} /></div><div className="stat-value">{fmt(data.totalRevenue)}</div><div className="stat-label">Total Revenue</div></div>
                <div className="stat-card"><div className="stat-icon"><Package size={24} /></div><div className="stat-value">{fmt(data.totalRevenue - data.totalProfit)}</div><div className="stat-label">Cost of Goods</div></div>
                <div className="stat-card"><div className="stat-icon"><TrendingUp size={24} /></div><div className="stat-value" style={{ color: 'var(--success)' }}>{fmt(data.totalProfit)}</div><div className="stat-label">Gross Profit</div></div>
                <div className="stat-card"><div className="stat-icon"><CreditCard size={24} /></div><div className="stat-value" style={{ color: 'var(--warning)' }}>{fmt(data.totalExpenses)}</div><div className="stat-label">Operating Expenses</div></div>
                <div className="stat-card"><div className="stat-icon"><Activity size={24} /></div><div className="stat-value" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fmt(netProfit)}</div><div className="stat-label">Net Profit</div></div>
                <div className="stat-card"><div className="stat-icon"><Target size={24} /></div><div className="stat-value">{margin.toFixed(1)}%</div><div className="stat-label">Net Margin</div></div>
            </div>

            <div className="chart-grid">
                <div className="glass-card">
                    <div className="card-header"><div><div className="card-title">Revenue vs Expenses by Branch</div></div></div>
                    <div className="chart-container">
                        {data.branchRevenue?.map((b, i) => {
                            const branch = data.branches?.find(br => br._id === b._id)
                            const maxVal = Math.max(...data.branchRevenue.map(x => x.revenue), 1)
                            return (
                                <div className="chart-bar-group" key={i}>
                                    <div className="chart-value">{fmt(b.revenue)}</div>
                                    <div className="chart-bar success" style={{ height: `${(b.revenue / maxVal) * 100}%` }}></div>
                                    <div className="chart-label">{branch?.name?.split(' ')[0] || `B${i + 1}`}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header"><div><div className="card-title">P&L Breakdown</div></div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', padding: 'var(--space-lg) 0' }}>
                        {[
                            { label: 'Revenue', val: data.totalRevenue, color: 'var(--accent)', pct: 100 },
                            { label: 'COGS', val: data.totalRevenue - data.totalProfit, color: 'var(--info)', pct: ((data.totalRevenue - data.totalProfit) / data.totalRevenue * 100) },
                            { label: 'Gross Profit', val: data.totalProfit, color: 'var(--success)', pct: (data.totalProfit / data.totalRevenue * 100) },
                            { label: 'Expenses', val: data.totalExpenses, color: 'var(--warning)', pct: (data.totalExpenses / data.totalRevenue * 100) },
                            { label: 'Net Profit', val: netProfit, color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', pct: Math.abs(margin) },
                        ].map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{item.label}</span>
                                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: item.color }}>{fmt(item.val)}</span>
                                </div>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(item.pct, 100)}%`, background: item.color }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default GlobalProfit
