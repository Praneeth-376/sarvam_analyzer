import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token')
    if (!token) return <Navigate to="/" replace />

    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const user = payload.user

        // Check token expiry
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token')
            return <Navigate to="/" replace />
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to correct dashboard
            const roleRoutes = { master: '/master', admin: '/admin', worker: '/worker' }
            return <Navigate to={roleRoutes[user.role] || '/'} replace />
        }

        return children
    } catch {
        localStorage.removeItem('token')
        return <Navigate to="/" replace />
    }
}

export default ProtectedRoute
