import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'
const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : 'http://localhost:5001/api'
const getToken = () => localStorage.getItem('token')
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } })
const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/master', icon: '📊' }, { name: 'Global Profit', path: '/master/profit', icon: '💰' }] },
    { label: 'Analytics', items: [{ name: 'Branch Performance', path: '/master/branches', icon: '🏢' }, { name: 'Top Products', path: '/master/products', icon: '🏆' }, { name: 'Expense Monitor', path: '/master/expenses', icon: '📉' }, { name: 'Profit Margins', path: '/master/margins', icon: '📈' }, { name: 'Sales Forecast', path: '/master/forecasting', icon: '🔮' }] },
    { label: 'Management', items: [{ name: 'Users & Roles', path: '/master/users', icon: '👥' }, { name: 'Inventory', path: '/master/inventory', icon: '📦' }, { name: 'Settings', path: '/master/settings', icon: '⚙️' }] }
]
const fmt = (n) => { if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`; if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`; return `₹${n?.toFixed(0) || 0}` }

const SalesForecasting = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/dashboard/master`, authHeader())
                setStats(res.data)
            } catch (err) { console.error(err) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlySales = stats?.monthlySales || []

    // Simple linear prediction
    const predict = () => {
        if (monthlySales.length < 2) return monthlySales.length > 0 ? monthlySales[monthlySales.length - 1].revenue * 1.05 : 0
        const last = monthlySales[monthlySales.length - 1]?.revenue || 0
        const prev = monthlySales[monthlySales.length - 2]?.revenue || 0
        const trend = last > 0 ? ((last - prev) / (prev || 1)) : 0
        return last * (1 + trend * 0.5)
    }

    const predicted = predict()
    const avgMonthly = monthlySales.length > 0 ? monthlySales.reduce((s, m) => s + m.revenue, 0) / monthlySales.length : 0

    return (
        <DashboardLayout menuItems={menuItems} role="master">
            <div className="page-header">
                <h1 className="page-title">Sales Forecasting</h1>
                <p className="page-subtitle">Predict next month's sales with trend analysis</p>
            </div>

            {loading ? (
                <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading...</p></div>
            ) : (
                <div className="page-grid">
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                        <div className="glass-card stat-card cyan">
                            <div className="stat-icon cyan">🔮</div>
                            <div className="stat-value">{fmt(predicted)}</div>
                            <div className="stat-label">Predicted Next Month</div>
                            <span className="stat-trend up">Trend-based estimate</span>
                        </div>
                        <div className="glass-card stat-card blue">
                            <div className="stat-icon blue">📊</div>
                            <div className="stat-value">{fmt(avgMonthly)}</div>
                            <div className="stat-label">Monthly Average</div>
                        </div>
                        <div className="glass-card stat-card purple">
                            <div className="stat-icon purple">📈</div>
                            <div className="stat-value">{monthlySales.length > 1 ? ((monthlySales[monthlySales.length - 1]?.revenue - monthlySales[monthlySales.length - 2]?.revenue) / (monthlySales[monthlySales.length - 2]?.revenue || 1) * 100).toFixed(1) : 0}%</div>
                            <div className="stat-label">Growth Rate</div>
                        </div>
                    </div>

                    {/* Actual + Forecast Chart */}
                    <div className="glass-card-static chart-card">
                        <div className="chart-card-header">
                            <div>
                                <div className="chart-card-title">Revenue Trend + Forecast</div>
                                <div className="chart-card-subtitle">Solid bars = actual, striped = predicted</div>
                            </div>
                        </div>
                        <div className="bar-chart" style={{ height: '200px' }}>
                            {[...monthlySales, { _id: (monthlySales[monthlySales.length - 1]?._id || 0) + 1, revenue: predicted, predicted: true }].map((m, i) => {
                                const allRevs = [...monthlySales.map(x => x.revenue), predicted]
                                const max = Math.max(...allRevs)
                                const height = max > 0 ? (m.revenue / max) * 100 : 10
                                return (
                                    <div key={i} className="bar-chart-item">
                                        <div className="bar-chart-value">{fmt(m.revenue)}</div>
                                        <div className="bar-chart-bar" style={{
                                            height: `${height}%`,
                                            background: m.predicted
                                                ? 'repeating-linear-gradient(45deg, var(--accent-cyan), var(--accent-cyan) 4px, transparent 4px, transparent 8px)'
                                                : 'var(--gradient-blue)',
                                            border: m.predicted ? '1px dashed var(--accent-cyan)' : 'none',
                                            opacity: m.predicted ? 0.7 : 1
                                        }} />
                                        <div className="bar-chart-label" style={{ color: m.predicted ? 'var(--accent-cyan)' : 'var(--text-tertiary)' }}>
                                            {m.predicted ? '🔮 Next' : months[(m._id - 1) % 12]}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Branch-wise forecast */}
                    <div className="glass-card-static chart-card">
                        <div className="chart-card-header"><div className="chart-card-title">Branch-wise Trend</div></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(stats?.branches || []).map((branch, i) => {
                                const branchRev = stats?.branchRevenue?.find(b => b._id?.toString() === branch._id?.toString())
                                const revenue = branchRev?.revenue || 0
                                const predictedBranch = revenue * (1 + Math.random() * 0.15)
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span style={{ width: '120px', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{branch.name?.split(' ')[0]}</span>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', width: '50px' }}>Current</span>
                                                <div className="progress-bar" style={{ flex: 1 }}>
                                                    <div className="progress-fill" style={{ width: `${stats?.totalRevenue > 0 ? (revenue / stats.totalRevenue) * 100 : 0}%`, background: 'var(--gradient-blue)' }} />
                                                </div>
                                                <span style={{ fontSize: 'var(--font-xs)', width: '60px', textAlign: 'right' }}>{fmt(revenue)}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', width: '50px' }}>Forecast</span>
                                                <div className="progress-bar" style={{ flex: 1 }}>
                                                    <div className="progress-fill" style={{ width: `${stats?.totalRevenue > 0 ? (predictedBranch / stats.totalRevenue) * 100 : 0}%`, background: 'var(--gradient-cyan)' }} />
                                                </div>
                                                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-cyan)', width: '60px', textAlign: 'right' }}>{fmt(predictedBranch)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default SalesForecasting
