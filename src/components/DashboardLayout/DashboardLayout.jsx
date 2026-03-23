import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import './DashboardLayout.scss'

const MOCK = {
  trader:  { name: 'Alex Johnson', rank: 14, totalParticipants: 312 },
  account: { balance: 12480.50, dailyPnl: 480.50, dailyPnlPct: 4.81 },
  round:   { name: 'Qualifier', cutoff: new Date(Date.now() + 1000 * 60 * 60 * 18 + 1000 * 60 * 34) },
}

function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(0, target - Date.now())
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

const pad = n => String(n).padStart(2, '0')
const fmt = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtSign = n => (n >= 0 ? '+$' : '-$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function DashboardLayout() {
  const countdown = useCountdown(MOCK.round.cutoff)
  const { trader, account, round } = MOCK

  return (
    <div className="dl-root">
      <Sidebar />

      <div className="dl-body">
        {/* ── Shared Header ── */}
        <header className="dl-header">
          <div className="dl-header-left">
            <span className="dl-tournament">UT Longhorns × Alpha Futures</span>
            <span className="dl-round-badge">{round.name}</span>
          </div>

          <div className="dl-header-stats">
            <div className="dl-hstat">
              <span className="dl-hstat-label">Balance</span>
              <span className="dl-hstat-val">{fmt(account.balance)}</span>
            </div>
            <div className="dl-hstat-divider"/>
            <div className="dl-hstat">
              <span className="dl-hstat-label">Daily P&amp;L</span>
              <span
                className="dl-hstat-val"
                style={{ color: account.dailyPnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
              >
                {fmtSign(account.dailyPnl)} ({account.dailyPnlPct > 0 ? '+' : ''}{account.dailyPnlPct}%)
              </span>
            </div>
            <div className="dl-hstat-divider"/>
            <div className="dl-hstat">
              <span className="dl-hstat-label">Round Cutoff</span>
              <span className="dl-hstat-val dl-countdown">
                {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
              </span>
            </div>
          </div>

          <div className="dl-header-right">
            <div className="dl-rank">
              <span className="dl-rank-label">Rank</span>
              <span className="dl-rank-val">
                #{trader.rank}
                <span className="dl-rank-total"> / {trader.totalParticipants}</span>
              </span>
            </div>
            <div className="dl-avatar" title={trader.name}>
              {trader.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="dl-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
