import React, { useState, useMemo, useEffect, useRef } from 'react'

const CATEGORIES = ['Shopping', 'Food & Dining', 'Bills', 'Transport', 'Entertainment', 'Healthcare', 'Other']

const INITIAL_TX = [
  { id: 'TX1001', desc: 'Amazon Purchase', amount: -1899.00, date: '2026-07-05', category: 'Shopping' },
  { id: 'TX1002', desc: 'Salary Credit', amount: 68000.00, date: '2026-07-01', category: 'Income' },
  { id: 'TX1003', desc: 'Coffee Shop', amount: -240.00, date: '2026-06-29', category: 'Food & Dining' },
  { id: 'TX1004', desc: 'Electricity Bill', amount: -2150.00, date: '2026-06-27', category: 'Bills' },
  { id: 'TX1005', desc: 'Grocery Store', amount: -3420.00, date: '2026-06-24', category: 'Food & Dining' },
  { id: 'TX1006', desc: 'Cab Ride', amount: -560.00, date: '2026-06-22', category: 'Transport' },
]

const MONTHLY = [
  { month: 'Feb', amount: 18200 },
  { month: 'Mar', amount: 24600 },
  { month: 'Apr', amount: 19800 },
  { month: 'May', amount: 27300 },
  { month: 'Jun', amount: 22100 },
  { month: 'Jul', amount: 7660 },
]

function AddTransactionForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ desc: '', amount: '', category: 'Shopping', date: new Date().toISOString().split('T')[0] })

  if (!open) {
    return <button className="btn btn-primary btn-block" onClick={() => setOpen(true)}>+ Add Transaction</button>
  }

  return (
    <div style={{ marginTop: 4 }}>
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.desc || !form.amount) return
          onAdd({ id: 'TX' + Date.now(), desc: form.desc, amount: parseFloat(form.amount), date: form.date, category: form.category })
          setForm({ desc: '', amount: '', category: 'Shopping', date: new Date().toISOString().split('T')[0] })
          setOpen(false)
        }}
      >
        <input placeholder="Description" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Amount (negative for expenses)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="Income">Income</option>
        </select>
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function Dashboard({ newTransaction, onTransactionProcessed }) {
  const [transactions, setTransactions] = useState(INITIAL_TX)
  const processedRef = useRef(new Set())

  useEffect(() => {
    if (newTransaction?.id && !processedRef.current.has(newTransaction.id)) {
      processedRef.current.add(newTransaction.id)
      setTransactions(prev => prev.some(t => t.id === newTransaction.id) ? prev : [newTransaction, ...prev])
      if (onTransactionProcessed) onTransactionProcessed(newTransaction.id)
    }
  }, [newTransaction, onTransactionProcessed])

  const totalSpent = useMemo(() => transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [transactions])
  const weeklyAvg = Math.round((totalSpent / Math.max(1, transactions.length)) * 7 * 100) / 100

  const categoryData = useMemo(() => {
    const totals = {}
    transactions.filter(t => t.amount < 0).forEach(t => { totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount) })
    return Object.entries(totals).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5)
  }, [transactions])

  const maxCat = Math.max(...categoryData.map(c => c.amount), 1)
  const maxMonthly = Math.max(...MONTHLY.map(m => m.amount), 1)

  return (
    <div>
      <div className="page-title">Dashboard</div>
      <div className="page-subtitle">Spend patterns, live balance, and transaction ledger at a glance.</div>

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="kpi-label">Total Spent</div>
          <div className="kpi-value mono">₹{totalSpent.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Weekly Avg</div>
          <div className="kpi-value mono">₹{weeklyAvg.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Transactions</div>
          <div className="kpi-value mono">{transactions.length}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Categories</div>
          <div className="kpi-value mono">{categoryData.length}</div>
        </div>
      </div>

      <div className="grid grid-main-side" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="section-title">Monthly Spend</div>
          <div className="bar-chart-row">
            {MONTHLY.map((m, i) => (
              <div key={i} className="bar-col">
                <div className="bar-fill" style={{ height: `${Math.max(6, (m.amount / maxMonthly) * 100)}%` }}></div>
                <div className="bar-label mono">{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Top Categories</div>
          {categoryData.length ? categoryData.map((c, i) => (
            <div key={i} className="hbar-row">
              <div className="hbar-head">
                <span>{c.name}</span>
                <span className="mono" style={{ color: 'var(--text-lo)' }}>₹{c.amount.toFixed(2)}</span>
              </div>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: `${(c.amount / maxCat) * 100}%` }}></div>
              </div>
            </div>
          )) : <div className="fraud-empty">No expense data yet.</div>}
        </div>
      </div>

      <div className="grid grid-main-side">
        <div className="card">
          <div className="section-title">Recent Transactions</div>
          {transactions.slice(0, 8).map(tx => (
            <div key={tx.id} className="tx-row">
              <div>
                <div className="tx-desc">{tx.desc}</div>
                <div className="tx-meta mono">{tx.date} · {tx.category}</div>
              </div>
              <div className={`tx-amount mono ${tx.amount < 0 ? 'neg' : 'pos'}`}>
                {tx.amount < 0 ? '-' : '+'}₹{Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">Add Transaction</div>
          <AddTransactionForm onAdd={(tx) => setTransactions(prev => [tx, ...prev])} />
        </div>
      </div>
    </div>
  )
}
