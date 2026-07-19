import React, { useState, useEffect, useMemo } from 'react'
import { pinAPI } from '../services/api'
import { analyzeContactTransaction, CONTACTS_DATA } from '../data/contacts'
import PinModal from './PinModal'

const RISK_LABEL = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk', critical: 'Critical' }
const RISK_COLOR = { low: 'var(--risk-low)', medium: 'var(--risk-medium)', high: 'var(--risk-high)', critical: 'var(--risk-critical)' }

export default function Payment({ balance, onBalanceChange, onTransactionAdd }) {
  const [activeTab, setActiveTab] = useState('send')
  const [searchQuery, setSearchQuery] = useState('')
  const [recipient, setRecipient] = useState(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [qrPaymentId, setQrPaymentId] = useState(null)

  useEffect(() => {
    pinAPI.getStatus().catch(() => {})
  }, [])

  const searchResults = useMemo(() => {
    if (searchQuery.length < 1) return []
    const q = searchQuery.toLowerCase()
    return CONTACTS_DATA.filter(c =>
      c.full_name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [searchQuery])

  const fraudResult = useMemo(() => {
    const amt = parseFloat(amount)
    if (!recipient || !amt || amt <= 0) return null
    return analyzeContactTransaction(recipient, amt)
  }, [recipient, amount])

  const selectRecipient = (c) => {
    setRecipient(c)
    setSearchQuery('')
    setError('')
    setToast('')
  }

  const submitSend = () => {
    setError('')
    setToast('')
    const amt = parseFloat(amount)
    if (!recipient || !amt || amt <= 0) { setError('Select a recipient and enter a valid amount.'); return }
    if (amt > balance) { setError('Insufficient balance.'); return }
    if (fraudResult?.shouldBlock) { setShowBlockModal(true); return }
    setShowPinModal(true)
    setPin('')
  }

  const finalizePayment = () => {
    const amt = parseFloat(amount)
    const newTx = {
      id: 'TX' + Date.now(),
      desc: `Payment to ${recipient.full_name}`,
      amount: -amt,
      date: new Date().toISOString().split('T')[0],
      category: 'Transfer',
    }
    onTransactionAdd(newTx)
    setToast(`₹${amt.toFixed(2)} sent to ${recipient.full_name}.`)
    setShowPinModal(false)
    setPin('')
    setAmount('')
    setDescription('')
    setRecipient(null)
  }

  const pressDigit = (d) => {
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) setTimeout(finalizePayment, 250)
  }

  const generateQR = () => {
    setQrPaymentId('PAY-' + Date.now().toString(36).toUpperCase())
  }

  const scanDemoQR = () => {
    const randomContact = CONTACTS_DATA[Math.floor(Math.random() * CONTACTS_DATA.length)]
    selectRecipient(randomContact)
    setActiveTab('send')
  }

  const sendDisabled = !recipient || !amount || parseFloat(amount) <= 0

  return (
    <div>
      <div className="page-title">Payments</div>
      <div className="page-subtitle">Every transfer is scored in real time by the fraud model before it clears.</div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>Send Money</button>
        <button className={`tab ${activeTab === 'receive' ? 'active' : ''}`} onClick={() => setActiveTab('receive')}>Receive (QR)</button>
        <button className={`tab ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>Scan QR</button>
      </div>

      {activeTab === 'send' && (
        <div className="grid grid-form-panel" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="kpi-label" style={{ marginBottom: 14 }}>Recipient</div>
            {recipient ? (
              <div className="contact-chip active" style={{ marginBottom: 22, cursor: 'default' }}>
                <div className="chip-avatar">{recipient.full_name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div className="chip-name">{recipient.full_name}</div>
                  <div className="chip-risk" style={{ color: 'var(--text-lo)' }}>{recipient.upi_id}</div>
                </div>
                <button className="btn btn-ghost" onClick={() => setRecipient(null)}>Change</button>
              </div>
            ) : (
              <div style={{ marginBottom: 22 }}>
                <input placeholder="Search contacts by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                {searchResults.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                    {searchResults.map(c => (
                      <div key={c.id} className="contact-chip" onClick={() => selectRecipient(c)}>
                        <div className="chip-avatar">{c.full_name[0]}</div>
                        <div className="chip-name">{c.full_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="kpi-label" style={{ marginBottom: 10 }}>Amount (₹)</div>
            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, marginBottom: 14 }} />

            <input placeholder="Note (optional)" value={description} onChange={e => setDescription(e.target.value)} style={{ marginBottom: 22 }} />

            <button className="btn btn-primary btn-block" disabled={sendDisabled || fraudResult?.shouldBlock} onClick={submitSend}>
              {fraudResult?.shouldBlock ? 'Blocked by Fraud Model' : 'Send Payment'}
            </button>

            {error && <div className="toast toast-error">{error}</div>}
            {toast && <div className="toast toast-success">{toast}</div>}
          </div>

          <div className="card" style={{ minHeight: 280 }}>
            <div className="section-title">Fraud Analysis</div>
            {fraudResult ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="kpi-label">Risk Level</span>
                  <span className={`badge badge-${fraudResult.riskLevel}`}>{RISK_LABEL[fraudResult.riskLevel]}</span>
                </div>
                <div className="fraud-bar-track">
                  <div className="fraud-bar-fill"
                    style={{ width: `${fraudResult.fraudProbability * 100}%`, background: RISK_COLOR[fraudResult.riskLevel] }}></div>
                </div>
                <div className="fraud-prob mono">{(fraudResult.fraudProbability * 100).toFixed(1)}%</div>
                <div className="kpi-label" style={{ marginBottom: 8 }}>Risk Factors</div>
                {fraudResult.riskFactors.slice(0, 4).map((f, i) => <div key={i} className="risk-factor">{f}</div>)}
              </div>
            ) : (
              <div className="fraud-empty">Select a recipient and enter an amount to see live risk scoring.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'receive' && (
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="section-title">Generate Payment QR</div>
          {!qrPaymentId ? (
            <button className="btn btn-primary btn-block" onClick={generateQR}>Generate QR Code</button>
          ) : (
            <div>
              <div style={{
                width: 200, height: 200, margin: '0 auto 18px', border: '1px dashed var(--line-strong)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-faint)', fontSize: 12,
              }}>QR CODE</div>
              <div className="kpi-label">Payment ID</div>
              <div className="mono" style={{ marginBottom: 12 }}>{qrPaymentId}</div>
              <button className="btn btn-secondary btn-block" onClick={() => setQrPaymentId(null)}>Generate New</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'scan' && (
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="section-title">Scan QR to Pay</div>
          <div className="fraud-empty" style={{ marginBottom: 16 }}>Camera scanning is simulated in this build — pulls a random verified contact.</div>
          <button className="btn btn-primary btn-block" onClick={scanDemoQR}>Simulate Scan</button>
        </div>
      )}

      {showPinModal && (
        <PinModal
          amount={parseFloat(amount)}
          recipientName={recipient?.full_name}
          pin={pin}
          onDigit={pressDigit}
          onBackspace={() => setPin(pin.slice(0, -1))}
          onCancel={() => { setShowPinModal(false); setPin('') }}
        />
      )}

      {showBlockModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
            <div className="modal-title" style={{ color: 'var(--risk-critical)' }}>Transaction Blocked</div>
            <div className="modal-sub">This transfer was flagged as critical risk by the fraud model and cannot proceed.</div>
            <button className="btn btn-secondary btn-block" onClick={() => setShowBlockModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
