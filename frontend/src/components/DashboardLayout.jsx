import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Sun, Moon, LogOut } from 'lucide-react'
import './DashboardLayout.css'

const DashboardLayout = ({ children, menuItems, role }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/'); return }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            setUser(payload.user)
        } catch { navigate('/') }
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

    const getRoleLabel = (r) => {
        const labels = { master: 'CEO · Head Office', admin: 'Branch Manager', worker: 'Sales Staff' }
        return labels[r] || r
    }

    const getAvatarColor = (r) => {
        const colors = {
            master: 'linear-gradient(135deg, #f59e0b, #d97706)',
            admin: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            worker: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        }
        return colors[r] || colors.worker
    }

    const getInitials = () => {
        if (user?.name) return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        if (user?.email) return user.email[0].toUpperCase()
        return '?'
    }

    const getGreeting = () => {
        const hr = new Date().getHours()
        if (hr < 12) return 'Good Morning'
        if (hr < 17) return 'Good Afternoon'
        return 'Good Evening'
    }

    if (!user) return null

    return (
        <div className="dashboard-layout">
            <div className="app-background" />

            {/* Sidebar Overlay (mobile) */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="sidebar-brand-title">Sarvam</div>
                    <div className="sidebar-brand-owner">Praneeth</div>
                    <div className="sidebar-brand-role">{getRoleLabel(role)}</div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((section, si) => (
                        <React.Fragment key={si}>
                            {section.label && (
                                <div className="sidebar-section-label">{section.label}</div>
                            )}
                            {section.items.map((item, ii) => (
                                <button
                                    key={ii}
                                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                                >
                                    <span className="sidebar-link-icon">{item.icon}</span>
                                    {item.name}
                                </button>
                            ))}
                        </React.Fragment>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar" style={{ background: getAvatarColor(role) }}>
                            {getInitials()}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user.name || user.email}</div>
                            <div className="sidebar-user-email">{user.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
                        <span className="topbar-greeting">
                            {getGreeting()}, <strong>{user.name?.split(' ')[0] || user.email.split('@')[0]}</strong>
                        </span>
                    </div>
                    <div className="topbar-right">
                        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} style={{ marginRight: 8 }} /> Logout
                        </button>
                    </div>
                </header>

                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default DashboardLayout
