import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import './DashboardLayout.scss'

const MOBILE_NAV = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/leaderboard', label: 'Leaderboard',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    to: '/rules', label: 'Rules',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    to: '/profile', label: 'Profile',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
]

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

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottom-nav">
        {MOBILE_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mbn-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
