import React, { useState } from 'react'

const INITIAL = [
  { id: 1, type: 'payment_received', title: 'Payment Received', message: 'You received ₹5,000 from Priya Sharma', minsAgo: 5, read: false },
  { id: 2, type: 'security_alert', title: 'Security Alert', message: 'Unusual login attempt blocked from unknown device', minsAgo: 30, read: false },
  { id: 3, type: 'payment_sent', title: 'Payment Sent', message: 'You sent ₹750 to Rahul Patel', minsAgo: 120, read: true },
  { id: 4, type: 'fraud_detected', title: 'Fraud Prevention', message: 'ML model blocked a suspicious transaction attempt', minsAgo: 300, read: true },
]

const TYPE_COLOR = {
  payment_received: 'var(--risk-low)',
  payment_sent: 'var(--brand)',
  security_alert: 'var(--risk-critical)',
  fraud_detected: 'var(--risk-critical)',
}

function timeAgo(mins) {
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  return `${Math.floor(hrs / 24)} day(s) ago`
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(INITIAL)
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="card notif-card" style={{ marginBottom: 24 }}>
      <div className="notif-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Notifications</div>
          {unread > 0 && <span className="badge badge-low">{unread} new</span>}
        </div>
        <button className="btn btn-ghost" onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}>Mark all read</button>
      </div>
      {notifications.slice(0, 4).map(n => (
        <div key={n.id} className="notif-item" onClick={() => setNotifications(list => list.map(x => x.id === n.id ? { ...x, read: true } : x))}>
          <div className="notif-icon-dot" style={{ background: TYPE_COLOR[n.type] || 'var(--text-lo)' }}></div>
          <div style={{ flex: 1 }}>
            <div className="notif-title">{n.title}</div>
            <div className="notif-message">{n.message}</div>
            <div className="notif-time mono">{timeAgo(n.minsAgo)}</div>
          </div>
          {!n.read && <span className="notif-icon-dot" style={{ background: 'var(--brand)' }}></span>}
        </div>
      ))}
    </div>
  )
}
