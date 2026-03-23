import { useState, useMemo } from 'react'
import './Leaderboard.scss'

// ── Mock Data ─────────────────────────────────────────────
const CURRENT_USER_ID = 14

const generateTraders = () => {
  const names = [
    'Marcus Chen', 'Sofia Reyes', 'Alex Johnson', 'Jordan Blake', 'Priya Patel',
    'Tyler Brooks', 'Aisha Williams', 'Luca Ferrari', 'Emma Davis', 'Noah Kim',
    'Zara Hassan', 'Ryan Murphy', 'Mia Thompson', 'Diego Ruiz', 'Olivia Grant',
    'Ethan Park', 'Isabella Moore', 'Jaylen Scott', 'Ava Martinez', 'Leo Chang',
    'Harper Lewis', 'Kai Anderson', 'Nadia Okonkwo', 'Sam Rivera', 'Chloe Wu',
    'Miles Turner', 'Layla Nguyen', 'Finn O\'Brien', 'Zoe Carter', 'Andre Smith',
    'Simone White', 'Carlos Mendez', 'Lily Zhang', 'Tobias Klein', 'Aria Patel',
    'Owen Jacobs', 'Maya Robinson', 'Dylan Foster', 'Nina Kowalski', 'Chris Lee',
  ]

  return names.map((name, i) => {
    const rank = i + 1
    const balance = parseFloat((10000 + (40 - i) * 420 + Math.random() * 800 - 400).toFixed(2))
    const netPnl = parseFloat((balance - 10000).toFixed(2))
    const netPnlPct = parseFloat(((netPnl / 10000) * 100).toFixed(2))
    const dailyPnl = parseFloat((netPnl * 0.15 + Math.random() * 600 - 200).toFixed(2))
    const slComp = Math.max(60, Math.min(100, 100 - i * 1.2 + Math.random() * 8)).toFixed(0)
    const violations = i < 5 ? 0 : i < 20 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3)
    const tradesDay = Math.floor(4 + Math.random() * 10)
    const winRate = Math.max(35, Math.min(82, 72 - i * 0.8 + Math.random() * 10)).toFixed(0)
    const dllUsed = parseFloat((Math.random() * 0.55 * balance * 0.3).toFixed(2))
    const flagged = violations >= 2
    const disqualified = violations >= 3

    return {
      id: rank,
      name,
      rank,
      balance,
      netPnl,
      netPnlPct,
      dailyPnl,
      slComp: Number(slComp),
      violations,
      tradesDay,
      winRate: Number(winRate),
      dllUsed,
      dllLimit: parseFloat((balance * 0.3).toFixed(2)),
      status: disqualified ? 'disqualified' : flagged ? 'flagged' : 'active',
      avatar: name.split(' ').map(n => n[0]).join(''),
    }
  })
}

const ALL_TRADERS = generateTraders()

const ROUND_TABS = [
  { id: 'all', label: 'All Participants', count: 40 },
  { id: 'top100', label: 'Top 100', count: 40 },
  { id: 'top10', label: 'Top 10', count: 10 },
  { id: 'top5', label: 'Finals (Top 5)', count: 5 },
]

const STATUS_META = {
  active: { label: 'Active', color: 'success' },
  flagged: { label: 'Flagged', color: 'warning' },
  disqualified: { label: 'DQ\'d', color: 'danger' },
}

const fmt = (n, sign = false) => {
  const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (sign) return (n >= 0 ? '+$' : '-$') + s
  return '$' + s
}

// ── Medal ─────────────────────────────────────────────────
function Medal({ rank }) {
  if (rank === 1) return <span className="medal gold">🥇</span>
  if (rank === 2) return <span className="medal silver">🥈</span>
  if (rank === 3) return <span className="medal bronze">🥉</span>
  return <span className="rank-num">#{rank}</span>
}

// ── SL Bar ────────────────────────────────────────────────
function SlBar({ pct }) {
  const color = pct >= 85 ? 'var(--color-success)' : pct >= 65 ? 'var(--color-warning)' : 'var(--color-danger)'
  return (
    <div className="sl-bar-wrap">
      <div className="sl-bar">
        <div className="sl-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="sl-pct" style={{ color }}>{pct}%</span>
    </div>
  )
}

// ── Violation Dots ────────────────────────────────────────
function ViolationDots({ count, max = 3 }) {
  return (
    <div className="vdots">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`vdot-sm ${i < count ? 'hit' : ''}`} />
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function Leaderboard() {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('rank')
  const [sortDir, setSortDir] = useState('asc')
  const [expanded, setExpanded] = useState(null)

  const displayed = useMemo(() => {
    let data = [...ALL_TRADERS]
    if (tab === 'top10') data = data.slice(0, 10)
    if (tab === 'top5') data = data.slice(0, 5)
    if (search) data = data.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    data.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (sortDir === 'asc') return av > bv ? 1 : -1
      return av < bv ? 1 : -1
    })
    return data
  }, [tab, search, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'rank' ? 'asc' : 'desc') }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="sort-icon muted">↕</span>
    return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const myEntry = ALL_TRADERS.find(t => t.id === CURRENT_USER_ID)

  return (
    <div className="lb-main">

      {/* ── Header ── */}
      <header className="lb-header">
        <div>
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-sub">UT Longhorns × Alpha Futures Trading Tournament · April 2026</p>
        </div>
        <div className="header-right">
          <div className="live-indicator">
            <span className="live-dot-anim" />
            Live Rankings
          </div>
        </div>
      </header>

      {/* ── My Position Banner ── */}
      {myEntry && (
        <div className="my-position-banner">
          <div className="my-pos-left">
            <span className="my-pos-label">Your Position</span>
            <div className="my-pos-info">
              <span className="my-rank">#{myEntry.rank}</span>
              <span className="my-name">{myEntry.name}</span>
            </div>
          </div>
          <div className="my-pos-stats">
            <div className="my-stat">
              <span className="my-stat-label">Balance</span>
              <span className="my-stat-val">{fmt(myEntry.balance)}</span>
            </div>
            <div className="my-stat">
              <span className="my-stat-label">Net P&L</span>
              <span className="my-stat-val" style={{ color: myEntry.netPnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {fmt(myEntry.netPnl, true)} ({myEntry.netPnlPct > 0 ? '+' : ''}{myEntry.netPnlPct}%)
              </span>
            </div>
            <div className="my-stat">
              <span className="my-stat-label">SL Compliance</span>
              <span className="my-stat-val">{myEntry.slComp}%</span>
            </div>
            <div className="my-stat">
              <span className="my-stat-label">Violations</span>
              <span className="my-stat-val">{myEntry.violations} / 3</span>
            </div>
          </div>
          <div className="my-pos-progress">
            <span className="progress-label">Top 100 cutoff after Apr 15 EOD</span>
            <div className="progress-bar-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((40 - myEntry.rank + 1) / 40) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs + Search ── */}
      <div className="lb-toolbar">
        <div className="lb-tabs">
          {ROUND_TABS.map(t => (
            <button
              key={t.id}
              className={`lb-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="lb-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search trader..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="lb-table-wrap">
        <table className="lb-table">
          <thead>
            <tr>
              <th className="col-rank" onClick={() => toggleSort('rank')}>Rank <SortIcon col="rank" /></th>
              <th className="col-name">Trader</th>
              <th className="col-num" onClick={() => toggleSort('balance')}>Balance <SortIcon col="balance" /></th>
              <th className="col-num" onClick={() => toggleSort('netPnlPct')}>Net P&L <SortIcon col="netPnlPct" /></th>
              <th className="col-num" onClick={() => toggleSort('dailyPnl')}>Daily P&L <SortIcon col="dailyPnl" /></th>
              <th className="col-num" onClick={() => toggleSort('winRate')}>Win Rate <SortIcon col="winRate" /></th>
              <th className="col-sl">SL Compliance <SortIcon col="slComp" /></th>
              <th className="col-v">Violations</th>
              <th className="col-status">Status</th>
              <th className="col-expand" />
            </tr>
          </thead>
          <tbody>
            {displayed.map(t => (
              <>
                <tr
                  key={t.id}
                  className={`lb-row
                      ${t.id === CURRENT_USER_ID ? 'is-me' : ''}
                      ${t.status === 'disqualified' ? 'is-dq' : ''}
                      ${expanded === t.id ? 'is-expanded' : ''}`}
                  onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                >
                  <td className="col-rank">
                    <Medal rank={t.rank} />
                  </td>
                  <td className="col-name">
                    <div className="trader-cell">
                      <div className="trader-avatar">{t.avatar}</div>
                      <div className="trader-info">
                        <span className="trader-name">
                          {t.name}
                          {t.id === CURRENT_USER_ID && <span className="you-tag">You</span>}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="col-num mono">{fmt(t.balance)}</td>
                  <td className="col-num mono" style={{ color: t.netPnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {fmt(t.netPnl, true)}<br />
                    <span className="pct-sub">({t.netPnlPct > 0 ? '+' : ''}{t.netPnlPct}%)</span>
                  </td>
                  <td className="col-num mono" style={{ color: t.dailyPnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {fmt(t.dailyPnl, true)}
                  </td>
                  <td className="col-num mono">{t.winRate}%</td>
                  <td className="col-sl"><SlBar pct={t.slComp} /></td>
                  <td className="col-v"><ViolationDots count={t.violations} /></td>
                  <td className="col-status">
                    <span className={`status-pill ${STATUS_META[t.status].color}`}>
                      {STATUS_META[t.status].label}
                    </span>
                  </td>
                  <td className="col-expand">
                    <span className={`expand-icon ${expanded === t.id ? 'open' : ''}`}>›</span>
                  </td>
                </tr>

                {/* Expanded row */}
                {expanded === t.id && (
                  <tr key={`${t.id}-exp`} className="expanded-row">
                    <td colSpan={10}>
                      <div className="expanded-content">
                        <div className="exp-stat">
                          <span className="exp-label">Trades / Day</span>
                          <span className="exp-val">{t.tradesDay}</span>
                        </div>
                        <div className="exp-stat">
                          <span className="exp-label">DLL Used</span>
                          <span className="exp-val">{fmt(t.dllUsed)} / {fmt(t.dllLimit)}</span>
                        </div>
                        <div className="exp-stat">
                          <span className="exp-label">DLL %</span>
                          <span className="exp-val" style={{ color: (t.dllUsed / t.dllLimit) * 100 > 70 ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                            {((t.dllUsed / t.dllLimit) * 100).toFixed(1)}% used
                          </span>
                        </div>
                        <div className="exp-stat">
                          <span className="exp-label">Starting Balance</span>
                          <span className="exp-val">$10,000.00</span>
                        </div>
                        <div className="exp-stat">
                          <span className="exp-label">Win Rate</span>
                          <span className="exp-val">{t.winRate}%</span>
                        </div>
                        <div className="exp-stat">
                          <span className="exp-label">Violations Left</span>
                          <span className="exp-val" style={{ color: t.violations >= 2 ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                            {3 - t.violations} remaining
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lb-footer">
        Showing {displayed.length} traders · Rankings update end of day · Click any row to expand
      </div>
    </div>
  )
}
