import React, { useState, useEffect } from 'react'
import { pinAPI, authAPI } from '../services/api'

export default function Profile({ user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [pinStatus, setPinStatus] = useState({ has_pin: false })
  const [setupForm, setSetupForm] = useState({ pin: '', confirmPin: '' })
  const [message, setMessage] = useState(null)
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || 'Demo User',
    email: user?.email || 'demo@securebank.com',
    upi: user?.upi_id || 'demo_user@securebank',
  })

  useEffect(() => {
    pinAPI.getStatus().then(setPinStatus).catch(() => {})
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSetupPin = async (e) => {
    e.preventDefault()
    if (setupForm.pin.length !== 4 || setupForm.pin !== setupForm.confirmPin) {
      showMessage('error', 'PIN must be 4 digits and match confirmation.')
      return
    }
    try {
      await pinAPI.setup(setupForm.pin, setupForm.confirmPin)
      setPinStatus({ has_pin: true })
      setSetupForm({ pin: '', confirmPin: '' })
      showMessage('success', 'Security PIN created successfully.')
    } catch (err) {
      showMessage('error', err.message)
    }
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    onUserUpdate?.({ ...user, ...profileForm })
    showMessage('success', 'Profile updated.')
  }

  return (
    <div>
      <div className="page-title">Profile &amp; Security</div>
      <div className="page-subtitle">Manage your details and the PIN that protects every payment.</div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile Info</button>
        <button className={`tab ${activeTab === 'pin' ? 'active' : ''}`} onClick={() => setActiveTab('pin')}>Security PIN</button>
      </div>

      {message && <div className={`toast ${message.type === 'success' ? 'toast-success' : 'toast-error'}`} style={{ marginBottom: 20, maxWidth: 500 }}>{message.text}</div>}

      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="section-title">Personal Information</div>
          <form className="auth-form" onSubmit={handleSaveProfile}>
            <div>
              <div className="kpi-label" style={{ marginBottom: 6 }}>Full Name</div>
              <input value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} />
            </div>
            <div>
              <div className="kpi-label" style={{ marginBottom: 6 }}>Email</div>
              <input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
            </div>
            <div>
              <div className="kpi-label" style={{ marginBottom: 6 }}>UPI ID</div>
              <input value={profileForm.upi} readOnly />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Save Changes</button>
          </form>
        </div>
      )}

      {activeTab === 'pin' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Security PIN Status</div>
            <span className={`badge ${pinStatus.has_pin ? 'badge-low' : 'badge-high'}`}>
              {pinStatus.has_pin ? 'PIN Active' : 'PIN Not Set'}
            </span>
          </div>
          <div className="fraud-empty" style={{ marginBottom: 20 }}>
            A 4-digit PIN is required to authorize every payment across Send and Voice Pay. Demo PIN: 1234.
          </div>
          {!pinStatus.has_pin && (
            <form className="auth-form" onSubmit={handleSetupPin}>
              <div>
                <div className="kpi-label" style={{ marginBottom: 6 }}>Enter 4-digit PIN</div>
                <input type="password" inputMode="numeric" maxLength={4} value={setupForm.pin}
                  onChange={e => setSetupForm({ ...setupForm, pin: e.target.value.replace(/\D/g, '') })} placeholder="****" />
              </div>
              <div>
                <div className="kpi-label" style={{ marginBottom: 6 }}>Confirm PIN</div>
                <input type="password" inputMode="numeric" maxLength={4} value={setupForm.confirmPin}
                  onChange={e => setSetupForm({ ...setupForm, confirmPin: e.target.value.replace(/\D/g, '') })} placeholder="****" />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={setupForm.pin.length !== 4}>Create PIN</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
