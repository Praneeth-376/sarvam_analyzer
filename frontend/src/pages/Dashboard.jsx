import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/')
            return
        }

        try {
            // Decode the JWT payload (base64)
            const payload = JSON.parse(atob(token.split('.')[1]))
            setUser(payload.user)
        } catch {
            navigate('/')
        }
    }, [navigate])

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'master': return { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' }
            case 'admin': return { bg: '#ede9fe', text: '#5b21b6', border: '#a78bfa' }
            case 'worker': return { bg: '#dbeafe', text: '#1e40af', border: '#60a5fa' }
            default: return { bg: '#f1f5f9', text: '#475569', border: '#94a3b8' }
        }
    }

    if (!user) return null

    const badgeColors = getRoleBadgeColor(user.role)

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.heading}>Welcome to Sarvam Analyser</h1>
                <p style={styles.subtext}>Working on other features</p>

                <div style={styles.userInfo}>
                    <p style={styles.email}>{user.email}</p>
                    <span style={{
                        ...styles.roleBadge,
                        backgroundColor: badgeColors.bg,
                        color: badgeColors.text,
                        border: `1.5px solid ${badgeColors.border}`
                    }}>
                        Signed in as: {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(-45deg, #e0f2fe, #bae6fd, #7dd3fc, #e0f2fe)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 15s ease infinite',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        padding: '20px'
    },
    card: {
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        borderRadius: '24px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '480px',
        width: '100%'
    },
    heading: {
        color: '#0284c7',
        fontSize: '2rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        letterSpacing: '-0.5px'
    },
    subtext: {
        color: '#64748b',
        fontSize: '1rem',
        marginBottom: '2rem'
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.6)'
    },
    email: {
        color: '#334155',
        fontSize: '1rem',
        fontWeight: 600,
        margin: 0
    },
    roleBadge: {
        padding: '0.4rem 1.2rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 700,
        letterSpacing: '0.3px'
    }
}

export default Dashboard
