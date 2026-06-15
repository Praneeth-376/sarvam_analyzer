import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

    const onSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await axios.post(`${API}/api/auth/login`, formData)
            localStorage.setItem('token', res.data.token)
            const payload = JSON.parse(atob(res.data.token.split('.')[1]))
            const routes = { master: '/master', admin: '/admin', worker: '/worker' }
            navigate(routes[payload.user.role] || '/worker')
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-window">
                <div className="login-header">
                    <h1 className="brand-title">Sarvam Analyser</h1>
                    <p className="brand-owner">Praneeth</p>
                    <p className="brand-tagline">Business Analytics Platform</p>
                    <h2 className="auth-mode-title">Sign In</h2>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="login-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            required
                            className="form-input"
                            placeholder="you@sarvam.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            required
                            className="form-input"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

            </div>
        </div>
    )
}

export default Login
