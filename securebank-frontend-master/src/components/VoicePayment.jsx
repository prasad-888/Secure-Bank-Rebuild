import React, { useState, useRef, useEffect, useMemo } from 'react'
import { analyzeContactTransaction, CONTACTS_DATA } from '../data/contacts'
import PinModal from './PinModal'

const RISK_LABEL = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk', critical: 'Critical' }
const RISK_COLOR = { low: 'var(--risk-low)', medium: 'var(--risk-medium)', high: 'var(--risk-high)', critical: 'var(--risk-critical)' }

export default function VoicePayment({ balance, onBalanceChange, onTransactionAdd }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed] = useState(null)
  const [voiceError, setVoiceError] = useState('')
  const [browserSupport, setBrowserSupport] = useState(true)
  const [showPinModal, setShowPinModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [pin, setPin] = useState('')
  const [toast, setToast] = useState('')
  const recognitionRef = useRef(null)

  const quickContacts = useMemo(() => CONTACTS_DATA.slice(0, 8), [])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setBrowserSupport(false); return }
  }, [])

  const parseCommand = (text) => {
    const match = text.match(/(?:pay|send|transfer)\s+(?:rs\.?|₹|rupees?)?\s*(\d+(?:\.\d{1,2})?)\s+(?:to|for)\s+(.+)/i)
    if (!match) {
      setVoiceError('Could not understand. Try "Pay 500 to Priya".')
      setParsed(null)
      return
    }
    const amount = parseFloat(match[1])
    const nameQuery = match[2].trim().toLowerCase()
    const contact = CONTACTS_DATA.find(c =>
      c.full_name.toLowerCase().includes(nameQuery) || nameQuery.includes(c.full_name.split(' ')[0].toLowerCase())
    )
    if (!contact) {
      setVoiceError(`No contact found matching "${match[2].trim()}".`)
      setParsed(null)
      return
    }
    setVoiceError('')
    setParsed({ amount, contact })
  }

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoiceError('Voice recognition is not supported in this browser.'); return }
    setVoiceError(''); setTranscript(''); setParsed(null)
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      setTranscript(result[0].transcript)
      if (result.isFinal) parseCommand(result[0].transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const fraudPreview = useMemo(() => {
    if (!parsed) return null
    return analyzeContactTransaction(parsed.contact, parsed.amount)
  }, [parsed])

  const confirmPayment = () => {
    if (!parsed) return
    if (parsed.amount > balance) { setVoiceError(`Insufficient balance. Current balance is ₹${balance.toFixed(2)}.`); return }
    if (fraudPreview?.shouldBlock) { setShowBlockModal(true); setParsed(null); return }
    setShowPinModal(true)
    setPin('')
  }

  const finalizePayment = () => {
    const newTx = {
      id: 'TX' + Date.now(),
      desc: `Payment to ${parsed.contact.full_name}`,
      amount: -parsed.amount,
      date: new Date().toISOString().split('T')[0],
      category: 'Voice Transfer',
    }
    onTransactionAdd(newTx)
    setToast(`Payment successful! ₹${parsed.amount} sent to ${parsed.contact.full_name}.`)
    setShowPinModal(false)
    setPin('')
    setParsed(null)
    setTranscript('')
  }

  const pressDigit = (d) => {
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) setTimeout(finalizePayment, 250)
  }

  const quickPay = (contact) => {
    setParsed({ amount: 500, contact })
    setVoiceError('')
  }

  return (
    <div>
      <div className="page-title">Voice Pay</div>
      <div className="page-subtitle">Speak a command like "pay 500 to Priya" — uses your browser's native speech recognition.</div>

      {!browserSupport && (
        <div className="toast toast-error" style={{ marginBottom: 20 }}>
          Voice recognition isn't supported in this browser. Try Chrome or Edge, or use the text box below.
        </div>
      )}

      <div className="grid grid-form-panel" style={{ alignItems: 'start' }}>
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          <button className={`mic-button ${listening ? 'listening' : ''}`} onClick={toggleListening}>
            <div className="mic-dot"></div>
          </button>
          <div className="mic-status">{listening ? 'Listening…' : 'Tap to Speak'}</div>

          <div className="transcript-box">
            <div className="transcript-label">Transcript</div>
            <div className="transcript-text">{transcript || '—'}</div>
          </div>

          <form
            style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '16px auto 0' }}
            onSubmit={(e) => { e.preventDefault(); if (transcript.trim()) parseCommand(transcript.trim()) }}
          >
            <input placeholder="Or type a command..." value={transcript} onChange={e => setTranscript(e.target.value)} />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Parse</button>
          </form>

          {parsed && (
            <div className="voice-parsed-card">
              <div className="kpi-label" style={{ marginBottom: 8 }}>Understood</div>
              <div style={{ fontSize: 14.5, marginBottom: 14 }}>
                Send <strong style={{ color: 'var(--brand)' }}>₹{parsed.amount}</strong> to <strong>{parsed.contact.full_name}</strong>
              </div>
              {fraudPreview && (
                <div style={{ marginBottom: 14 }}>
                  <span className={`badge badge-${fraudPreview.riskLevel}`}>{RISK_LABEL[fraudPreview.riskLevel]}</span>
                  <span className="mono" style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-lo)' }}>
                    {(fraudPreview.fraudProbability * 100).toFixed(1)}% fraud probability
                  </span>
                </div>
              )}
              <button className="btn btn-primary btn-block" onClick={confirmPayment}>Confirm Payment</button>
            </div>
          )}
          {voiceError && <div className="toast toast-error" style={{ maxWidth: 460, margin: '16px auto 0' }}>{voiceError}</div>}
          {toast && <div className="toast toast-success" style={{ maxWidth: 460, margin: '16px auto 0' }}>{toast}</div>}
        </div>

        <div className="card">
          <div className="section-title">Quick Contacts</div>
          {quickContacts.map(c => {
            const preview = analyzeContactTransaction(c, 500)
            return (
              <div key={c.id} className="contact-row" style={{ cursor: 'pointer' }} onClick={() => quickPay(c)}>
                <div className="contact-dot" style={{ background: RISK_COLOR[preview.riskLevel] }}></div>
                <div style={{ fontSize: 13 }}>{c.full_name}</div>
                <div className="mono" style={{ marginLeft: 'auto', fontSize: 10.5, color: RISK_COLOR[preview.riskLevel] }}>{RISK_LABEL[preview.riskLevel]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {showPinModal && (
        <PinModal
          amount={parsed?.amount}
          recipientName={parsed?.contact.full_name}
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
