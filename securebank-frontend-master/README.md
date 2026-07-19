# SecureBank — ML Fraud Detection Banking (Final Year B.E. Project)

A React + Vite frontend for a banking app that scores every transaction with a
machine-learning fraud model, supports blockchain-hashed QR payments, and
hands-free voice transfers — all protected by a PIN step.

This is a full visual and structural rebuild of the original SecureBank
frontend: a dark "control room" theme (ink background, violet accent,
Space Grotesk / Work Sans / IBM Plex Mono type system) replacing the
previous light sage-green design, built from scratch as clean, readable
components suitable for submission and demoing.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

No backend is required to demo — every service call in `src/services/api.js`
falls back to demo-mode data when `http://localhost:5000/api` isn't reachable,
so the app is fully interactive standalone. Client-side fraud scoring
(`src/data/contacts.js` → `analyzeContactTransaction`) uses 100 pre-loaded
contacts seeded with real PaySim dataset transaction patterns (15 fraudulent,
85 legitimate), so risk levels are consistent and explainable without a live
model server.

To connect a real backend (e.g. the FastAPI/Flask service with the trained
LightGBM/XGBoost model), set `VITE_API_URL` in a `.env` file — the same
service layer will start using live calls automatically.

## Screens

- **Dashboard** — spend totals, monthly trend, category breakdown, transaction ledger
- **Payments** — recipient search, live fraud-risk gauge, PIN-gated send, QR generate/scan
- **Voice Pay** — Web Speech API voice commands ("pay 500 to Priya"), quick-pay contacts with risk badges
- **Profile** — account info, 4-digit security PIN setup
- **System** — project overview, feature breakdown, tech stack, team credits

## Structure

```
src/
  App.jsx                     shell, nav, auth modal
  styles.css                  design system (tokens + component classes)
  components/
    Dashboard.jsx
    Payment.jsx
    VoicePayment.jsx
    Profile.jsx
    NotificationCenter.jsx
    About.jsx
    PinModal.jsx               shared PIN entry used by Payment + VoicePayment
  services/
    api.js                     auth/payment/pin REST calls + demo-mode fallback
    fraudDetection.js           ML fraud API client
    websocket.js                real-time notification socket client
  data/
    contacts.js                 100-contact PaySim-seeded dataset + client-side scorer
```

## Tech stack

React 18, Vite 5, Socket.IO client. No CSS framework — a single hand-written
design system in `styles.css`.
