import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import Payment from './components/Payment'
import VoicePayment from './components/VoicePayment'
import Profile from './components/Profile'
import About from './components/About'
import NotificationCenter from './components/NotificationCenter'
import { authAPI, getAuthToken, setAuthToken, clearAuthToken } from './services/api'

const NAV = [
  ['dashboard', 'Dashboard'],
  ['payments', 'Payments'],
  ['voice', 'Voice Pay'],
  ['profile', 'Profile'],
  ['system', 'System'],
]

export default function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(!getAuthToken())
  const [isRegistering, setIsRegistering] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', full_name: '' })
  const [authError, setAuthError] = useState('')
  const [balance, setBalance] = useState(24500)
  const [pendingTransaction, setPendingTransaction] = useState(null)

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user-1',
      username: 'demo_user',
      email: 'demo@securebank.com',
      full_name: 'Demo User',
      upi_id: 'demo_user@securebank',
    }
    setUser(demoUser)
    setIsLoggedIn(true)
    setShowLogin(false)
    setAuthToken('demo-' + Date.now())
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    try {
      const data = await authAPI.login(loginForm)
      setUser(data.user)
      setIsLoggedIn(true)
      setShowLogin(false)
      if (data.accounts?.length) setBalance(data.accounts[0].balance)
    } catch (err) {
      setAuthError(err.message || 'Login failed')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthError('')
    try {
      const data = await authAPI.register(registerForm)
      setUser(data.user)
      setAuthToken(data.token)
      setIsLoggedIn(true)
      setShowLogin(false)
    } catch (err) {
      setAuthError(err.message || 'Registration failed')
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    clearAuthToken()
    setUser(null)
    setIsLoggedIn(false)
    setShowLogin(true)
    setActiveScreen('dashboard')
  }

  const handleTransactionAdd = (tx) => {
    setPendingTransaction(tx)
    setBalance(b => b + tx.amount)
  }

  const handleTransactionProcessed = (id) => {
    setPendingTransaction(p => (p?.id === id ? null : p))
  }

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <div className="sidebar-logo mono">SB</div>
            <div className="sidebar-title">SecureBank</div>
          </div>
          <div className="shield-status">
            <span className="status-dot"></span>
            <span className="shield-label">Fraud Shield Active</span>
          </div>
        </div>

        {NAV.map(([key, label], i) => (
          <button
            key={key}
            className={`nav-item ${activeScreen === key ? 'active' : ''}`}
            onClick={() => setActiveScreen(key)}
          >
            <span className="nav-item-index mono">{String(i + 1).padStart(2, '0')}</span>
            <span>{label}</span>
          </button>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-footer-label">Available Balance</div>
          <div className="sidebar-balance mono">₹{balance.toFixed(2)}</div>
          {isLoggedIn ? (
            <button className="sidebar-logout" onClick={handleLogout}>Logout ({user?.full_name || user?.username})</button>
          ) : (
            <button className="sidebar-logout" onClick={() => setShowLogin(true)}>Login</button>
          )}
        </div>
      </div>

      <div className="main">
        {activeScreen === 'dashboard' && (
          <>
            {isLoggedIn && <NotificationCenter />}
            <Dashboard
              newTransaction={pendingTransaction}
              onTransactionProcessed={handleTransactionProcessed}
            />
          </>
        )}
        {activeScreen === 'payments' && (
          <Payment balance={balance} onBalanceChange={setBalance} onTransactionAdd={handleTransactionAdd} />
        )}
        {activeScreen === 'voice' && (
          <VoicePayment balance={balance} onBalanceChange={setBalance} onTransactionAdd={handleTransactionAdd} />
        )}
        {activeScreen === 'profile' && <Profile user={user} onUserUpdate={setUser} />}
        {activeScreen === 'system' && <About />}
      </div>

      {showLogin && (
        <div className="modal-overlay" onClick={() => isLoggedIn && setShowLogin(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: 20 }}>
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            {authError && <div className="toast toast-error" style={{ marginBottom: 14 }}>{authError}</div>}

            {!isRegistering ? (
              <form onSubmit={handleLogin} className="auth-form">
                <input placeholder="Username" value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required />
                <input type="password" placeholder="Password" value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
                <button type="submit" className="btn btn-primary btn-block">Login</button>
                <button type="button" className="btn btn-secondary btn-block" onClick={handleDemoLogin}>Try Demo Mode</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-form">
                <input placeholder="Full Name" value={registerForm.full_name}
                  onChange={e => setRegisterForm({ ...registerForm, full_name: e.target.value })} required />
                <input placeholder="Username" value={registerForm.username}
                  onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} required />
                <input type="email" placeholder="Email" value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} required />
                <input type="password" placeholder="Password" value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} required />
                <button type="submit" className="btn btn-primary btn-block">Register</button>
              </form>
            )}

            <p className="auth-switch">
              {isRegistering ? (
                <>Already have an account? <button onClick={() => setIsRegistering(false)}>Login</button></>
              ) : (
                <>Don't have an account? <button onClick={() => setIsRegistering(true)}>Register</button></>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
