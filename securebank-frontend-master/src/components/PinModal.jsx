import React from 'react'

export default function PinModal({ amount, recipientName, pin, onDigit, onBackspace, onCancel }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="modal-overlay">
      <div className="modal-card narrow">
        <div className="modal-title">Enter PIN</div>
        <div className="modal-sub">
          {amount != null
            ? <>Authorize ₹{Number(amount).toFixed(2)} to {recipientName}</>
            : 'Enter your 4-digit security PIN'}
        </div>
        <div className="pin-dots">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}></div>
          ))}
        </div>
        <div className="pin-keypad">
          {keys.map((k, i) => (
            <button
              key={i}
              className={`pin-key ${k === '' ? 'hidden' : ''}`}
              onClick={() => {
                if (k === '⌫') onBackspace()
                else if (k !== '') onDigit(k)
              }}
            >{k}</button>
          ))}
        </div>
        <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
