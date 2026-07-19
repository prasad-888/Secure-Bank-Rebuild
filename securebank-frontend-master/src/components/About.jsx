import React from 'react'

const FEATURES = [
  { title: 'ML Fraud Detection', desc: 'Gradient-boosted model trained on transaction-pattern data (PaySim dataset) scores every transfer in real time.' },
  { title: 'Blockchain QR', desc: 'Every QR transaction is hashed into an immutable ledger for tamper-proof verification.' },
  { title: 'Voice Payments', desc: 'Natural-language commands turn speech into a fully verified, PIN-protected transfer.' },
  { title: 'PIN Protection', desc: 'A 4-digit PIN gates every payment, independent of the fraud model\'s own verdict.' },
]

const STEPS = [
  ['1', 'Initiate Payment', 'Use voice, QR scan, or manual entry'],
  ['2', 'AI Analysis', 'ML model scores fraud risk in real time'],
  ['3', 'Secure Processing', 'Blockchain records the transaction'],
  ['4', 'Confirmation', 'Instant notification sent'],
]

const TECH = ['React', 'FastAPI', 'LightGBM', 'scikit-learn', 'PaySim Dataset', 'JWT Auth', 'WebSocket', 'Blockchain Hashing', 'SQLite']

const TEAM = [
  ['Team Lead', 'Full-Stack Development'],
  ['ML Engineer', 'Fraud Detection Model'],
  ['Backend Engineer', 'API & Infrastructure'],
]

export default function About() {
  return (
    <div>
      <div className="page-title">System</div>
      <div className="page-subtitle">SecureBank pairs a machine-learning fraud model with blockchain-verified QR payments and hands-free voice transfers.</div>

      <div className="grid grid-3" style={{ marginBottom: 28 }}>
        <div className="card stat-card">
          <div className="stat-number">99.9%</div>
          <div className="stat-label">Fraud Detection</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">0.3s</div>
          <div className="stat-label">Scoring Latency</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Monitoring</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        {FEATURES.map((f, i) => (
          <div key={i} className="card">
            <div className="section-title" style={{ marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-lo)', lineHeight: 1.7 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">How It Works</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {STEPS.map(([n, title, desc], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--ink-800)', borderRadius: 10, border: '1px solid var(--line)' }}>
              <div className="mono" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)', color: 'var(--ink-950)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{n}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="kpi-label" style={{ marginBottom: 14 }}>Technology Stack</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TECH.map(t => <span key={t} className="tech-tag">{t}</span>)}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Team</div>
        <div className="team-row">
          {TEAM.map(([role, desc], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div className="team-avatar">{role[0]}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>{role}</div>
              <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
