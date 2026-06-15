import { useState } from 'react'
import axios from 'axios'
import { BarChart3, ShoppingCart, Package, CreditCard, Users, FileText, TrendingUp, Tag, Activity, Download, ChevronLeft, Calendar, Search, Filter } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import DashboardLayout from '../../components/DashboardLayout'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler)

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

const menuItems = [
    { label: 'Overview', items: [{ name: 'Dashboard', path: '/admin', icon: <BarChart3 size={18} /> }, { name: 'Sales', path: '/admin/sales', icon: <ShoppingCart size={18} /> }] },
    { label: 'Manage', items: [{ name: 'Products', path: '/admin/products', icon: <Package size={18} /> }, { name: 'Expenses', path: '/admin/expenses', icon: <CreditCard size={18} /> }, { name: 'Workers', path: '/admin/workers', icon: <Users size={18} /> }] },
    { label: '', items: [{ name: 'Reports', path: '/admin/reports', icon: <FileText size={18} /> }] }
]

import StockUpdateModal from '../../components/StockUpdateModal'

const BranchReports = () => {
    const [loading, setLoading] = useState(false)
    const [activeReport, setActiveReport] = useState(null)
    const [reportData, setReportData] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [showStockModal, setShowStockModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)

    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) return alert('No data to export')
        const headers = Object.keys(data[0]).filter(k => k !== '_raw').join(',')
        const rows = data.map(row => Object.entries(row).filter(([k]) => k !== '_raw').map(([, v]) => `"${v}"`).join(',')).join('\n')
        const csv = `${headers}\n${rows}`
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
    }

    const fetchReport = async (report) => {
        setLoading(true)
        setActiveReport(report)
        setSearchTerm('')
        try {
            let data = []
            if (report.title === 'Sales Summary' || report.title === 'Performance Trends') {
                const res = await axios.get(`${API}/api/sales`, getToken())
                data = res.data.map(s => ({
                    Date: new Date(s.date).toLocaleDateString(),
                    Product: s.productName,
                    Quantity: s.quantity,
                    Amount: s.totalAmount,
                    Profit: s.profit,
                    Status: s.status,
                    Worker: s.workerId?.name || 'Unknown'
                }))
            } else if (report.title === 'Inventory Status' || report.title === 'Product Margins') {
                const res = await axios.get(`${API}/api/products`, getToken())
                data = res.data.map(p => ({
                    Name: p.name,
                    Category: p.category,
                    Price: p.sellingPrice,
                    Cost: p.costPrice,
                    Stock: p.stock,
                    Value: p.stock * p.sellingPrice,
                    Margin: ((1 - p.costPrice / p.sellingPrice) * 100).toFixed(1) + '%',
                    _raw: p
                }))
            } else if (report.title === 'Expense Analysis') {
                const res = await axios.get(`${API}/api/expenses`, getToken())
                data = res.data.map(e => ({
                    Category: e.category,
                    Amount: e.amount,
                    Description: e.description,
                    Date: new Date(e.date).toLocaleDateString()
                }))
            } else if (report.title === 'Worker Leaderboard') {
                const res = await axios.get(`${API}/api/users`, getToken())
                data = res.data.filter(u => u.role === 'worker').map(u => ({
                    Name: u.name,
                    Email: u.email,
                    Target: u.salesTarget || 0,
                    Status: u.isActive ? 'Active' : 'Inactive'
                }))
            }
            setReportData(data)
        } catch (err) {
            console.error(err)
            alert('Failed to load report data')
            setActiveReport(null)
        } finally {
            setLoading(false)
        }
    }

    const filteredData = reportData.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const renderVisuals = () => {
        if (!reportData.length) return <div className="empty-state">No data available</div>

        if (activeReport.title === 'Sales Summary' || activeReport.title === 'Performance Trends') {
            const chartData = {
                labels: reportData.slice(0, 15).map(d => d.Date),
                datasets: [
                    { label: 'Revenue', data: reportData.slice(0, 15).map(d => d.Amount), borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
                    { label: 'Profit', data: reportData.slice(0, 15).map(d => d.Profit), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }
                ]
            }
            return <div className="glass-card" style={{ marginBottom: 24, height: 350, padding: 24 }}><Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' } } } }} /></div>
        }

        if (activeReport.title === 'Expense Analysis') {
            const byCat = {}
            reportData.forEach(e => byCat[e.Category] = (byCat[e.Category] || 0) + e.Amount)
            const chartData = {
                labels: Object.keys(byCat),
                datasets: [{ data: Object.values(byCat), backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'], borderWidth: 0, hoverOffset: 10 }]
            }
            return <div className="glass-card" style={{ marginBottom: 24, height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 320 }}><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></div></div>
        }

        return null
    }

    return (
        <DashboardLayout menuItems={menuItems} role="admin">
            <div className="page-header">
                {activeReport ? (
                    <div className="fade-in" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button className="btn btn-icon" onClick={() => setActiveReport(null)} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><ChevronLeft size={20} /></button>
                                <div><h1 className="page-title">{activeReport.title}</h1><p className="page-subtitle">Last 30 days performance</p></div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div className="date-picker-mock"><Calendar size={16} /> <span>This Month</span></div>
                                <button className="btn btn-primary" onClick={() => downloadCSV(reportData, `${activeReport.title.replace(/\s+/g, '_').toLowerCase()}.csv`)}>
                                    <Download size={16} style={{ marginRight: 8 }} /> Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Deep dive into your business metrics</p></div>
                )}
            </div>

            {loading && <div className="loading-state"><div className="loading-spinner"></div>Generating Insights...</div>}

            {!loading && !activeReport && (
                <div className="reports-grid fade-in">
                    {[
                        { icon: <Activity size={28} color="#7c3aed" />, title: 'Sales Summary', desc: 'Detailed revenue & profit breakdowns', color: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.05))' },
                        { icon: <TrendingUp size={28} color="#059669" />, title: 'Performance Trends', desc: 'Monthly & weekly sales patterns', color: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(5, 150, 105, 0.05))' },
                        { icon: <Package size={28} color="#d97706" />, title: 'Inventory Status', desc: 'Stock alerts & valuation metrics', color: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(217, 119, 6, 0.05))' },
                        { icon: <CreditCard size={28} color="#dc2626" />, title: 'Expense Analysis', desc: 'Spending patterns by category', color: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(220, 38, 38, 0.05))' },
                        { icon: <Users size={28} color="#2563eb" />, title: 'Worker Leaderboard', desc: 'Top performers & sales targets', color: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.05))' },
                        { icon: <Tag size={28} color="#db2777" />, title: 'Product Margins', desc: 'Profitability analysis per SKU', color: 'linear-gradient(135deg, rgba(219, 39, 119, 0.2), rgba(219, 39, 119, 0.05))' },
                    ].map((r, i) => (
                        <div className="report-card" key={i} onClick={() => fetchReport(r)} style={{ background: r.color }}>
                            <div className="report-card-header">
                                <div className="report-icon-wrapper">{r.icon}</div>
                                <div className="report-arrow">→</div>
                            </div>
                            <h3>{r.title}</h3>
                            <p>{r.desc}</p>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activeReport && (
                <div className="fade-in">
                    {renderVisuals()}

                    <div className="glass-card">
                        <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 0 }}>
                            <div className="card-title">Detailed Records</div>
                            <div className="search-bar" style={{ width: 250 }}>
                                <Search size={16} />
                                <input type="text" placeholder="Search records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="glass-table-wrapper" style={{ maxHeight: 500, overflowY: 'auto' }}>
                            <table className="glass-table">
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-glass)', zIndex: 10 }}>
                                    <tr>
                                        {reportData.length > 0 && Object.keys(reportData[0]).filter(k => k !== '_raw').map(key => <th key={key}>{key}</th>)}
                                        {activeReport.title === 'Inventory Status' && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? filteredData.map((row, i) => (
                                        <tr key={i}>
                                            {Object.entries(row).filter(([k]) => k !== '_raw').map(([key, val], j) => <td key={j}>{val}</td>)}
                                            {activeReport.title === 'Inventory Status' && (
                                                <td>
                                                    <button className="btn btn-sm btn-primary" onClick={() => { setSelectedProduct(row._raw); setShowStockModal(true); }}>
                                                        Add Stock
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="100%" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No matching records found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <span>Showing {filteredData.length} records</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-sm btn-secondary" disabled>Previous</button>
                                <button className="btn btn-sm btn-secondary" disabled>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showStockModal && selectedProduct && (
                <StockUpdateModal
                    product={selectedProduct}
                    onClose={() => setShowStockModal(false)}
                    onSuccess={() => fetchReport(activeReport)}
                />
            )}

            <style>{`
                .reports-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 24px;
                    padding-bottom: 40px;
                }
                @media (min-width: 768px) {
                    .reports-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1200px) {
                    .reports-grid { grid-template-columns: repeat(3, 1fr); }
                }
                
                .report-card { 
                    border-radius: 20px; 
                    padding: 24px; 
                    cursor: pointer; 
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    position: relative; 
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .report-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 4px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.5), rgba(255,255,255,0.1));
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .report-card:hover { 
                    transform: translateY(-8px); 
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border-color: rgba(255,255,255,0.2); 
                }
                .report-card:hover::before { opacity: 1; }

                .report-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .report-icon-wrapper { 
                    width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    background: rgba(255,255,255,0.95);
                    transition: transform 0.3s ease;
                }
                .report-card:hover .report-icon-wrapper { transform: scale(1.1) rotate(5deg); }
                
                .report-arrow { 
                    width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.2rem; color: var(--text-primary); 
                    opacity: 0.7; transition: all 0.3s ease; 
                }
                .report-card:hover .report-arrow { background: var(--primary); color: white; opacity: 1; transform: rotate(-45deg); }
                
                .report-card h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 8px 0; color: var(--text-primary); letter-spacing: -0.025em; }
                .report-card p { font-size: 0.95rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
                
                .date-picker-mock {
                    display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--surface);
                    border: 1px solid var(--border); border-radius: 12px; font-size: 0.95rem; color: var(--text-primary); cursor: pointer;
                    transition: all 0.2s;
                }
                .date-picker-mock:hover { border-color: var(--primary); background: rgba(37,99,235,0.05); }
                
                .search-bar {
                    display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: rgba(0,0,0,0.03);
                    border-radius: 12px; border: 1px solid var(--border); transition: all 0.2s;
                }
                .search-bar:focus-within { background: white; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
                .search-bar input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.95rem; }

                /* Premium Table Styling */
                .glass-table th { 
                    padding: 16px 24px; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; 
                    background: rgba(255,255,255,0.95); backdrop-filter: blur(8px);
                }
                .glass-table td { padding: 16px 24px; font-size: 0.95rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
                .glass-table tr:hover td { background: rgba(37,99,235,0.02); }
                .glass-card { border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; }
            `}</style>
        </DashboardLayout>
    )
}

export default BranchReports
