import { BarChart3, Building2, Wallet, Users, Package, CreditCard, ClipboardList, TrendingUp, Target, Settings as SettingsIcon, Shield, Sliders } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

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
            { name: 'Settings', path: '/master/settings', icon: <SettingsIcon size={18} /> },
        ]
    }
]

const Settings = () => (
    <DashboardLayout menuItems={menuItems} role="master">
        <div className="page-header"><h1 className="page-title">Settings</h1><p className="page-subtitle">Platform configuration</p></div>

        <div className="page-grid">
            <div className="glass-card">
                <div className="card-header"><div><div className="card-title"><Sliders size={20} style={{ marginRight: 8, display: 'inline' }} /> General</div></div></div>
                <div className="form-group"><label className="form-label">Company Name</label><input className="glass-input" defaultValue="Sarvam Analyser" /></div>
                <div className="form-group"><label className="form-label">Currency</label>
                    <select className="glass-select"><option>₹ INR</option><option>$ USD</option></select>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>Save Changes</button>
            </div>

            <div className="glass-card">
                <div className="card-header"><div><div className="card-title"><Shield size={20} style={{ marginRight: 8, display: 'inline' }} /> Security</div></div></div>
                <div className="form-group"><label className="form-label">Session Timeout (hours)</label><input className="glass-input" type="number" defaultValue={24} /></div>
                <div className="form-group"><label className="form-label">Min Password Length</label><input className="glass-input" type="number" defaultValue={6} /></div>
                <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>Update Security</button>
            </div>
        </div>
    </DashboardLayout>
)

export default Settings
