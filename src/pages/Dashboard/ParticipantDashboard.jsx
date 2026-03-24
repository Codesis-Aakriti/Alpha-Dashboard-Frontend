import { useState, useEffect } from 'react'
import './ParticipantDashboard.scss'

// ── Mock Data ─────────────────────────────────────────────
const MOCK = {
  trader: { name: 'Alex Johnson', rank: 14, totalParticipants: 312 },
  account: {
    balance: 12480.50,
    startingBalance: 10000,
    equity: 12480.50,
    dailyPnl: 480.50,
    dailyPnlPct: 4.81,
    netPnl: 2480.50,
    netPnlPct: 24.81,
  },
  dll: { limit: 3744.15, used: 892.30, resetTime: '5:00 PM CT' },
  scaling: { currentPnl: 2480.50, threshold: 3000, tier: 1, contracts: '1 Mini / 10 Micros' },
  violations: { count: 1, max: 3, flags: ['Missing SL — Apr 14, 9:42 AM'] },
  round: { name: 'Qualifier', cutoff: new Date(Date.now() + 1000 * 60 * 60 * 18 + 1000 * 60 * 34 + 1000 * 22), endsDate: 'Apr 15, EOD' },
  resetEligible: true,
  trades: [
    { id: 1, symbol: 'ES',  side: 'Long',  entry: 5210.25, exit: 5224.50, pnl: 712.50,  rr: '2.4R', time: '9:42 AM', status: 'closed' },
    { id: 2, symbol: 'MNQ', side: 'Short', entry: 18840.00, exit: 18792.00, pnl: 480.00, rr: '1.9R', time: '10:15 AM', status: 'closed' },
    { id: 3, symbol: 'ES',  side: 'Long',  entry: 5198.75, exit: 5188.00, pnl: -537.50, rr: '0.8R', time: '11:03 AM', status: 'closed' },
    { id: 4, symbol: 'MGC', side: 'Long',  entry: 3012.40, exit: 3028.10, pnl: 314.00,  rr: '2.1R', time: '1:20 PM', status: 'closed' },
    { id: 5, symbol: 'MES', side: 'Short', entry: 5215.00, exit: null,    pnl: 125.00,  rr: '—',    time: '2:41 PM', status: 'open'   },
  ],
}

// ── Countdown Hook ────────────────────────────────────────
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
  }, [target])
  return time
}

// ── Sparkline (simple SVG path) ───────────────────────────
function Sparkline({ data, color, height = 48 }) {
  const w = 200, h = height
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}

const equityCurve = [10000,10240,10180,10520,10390,10780,11020,10840,11240,11600,11420,11880,12100,11960,12480]

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, sub, subColor, spark, sparkColor, badge }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {badge && <span className={`stat-badge ${badge.type}`}>{badge.text}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub" style={{ color: subColor }}>{sub}</div>}
      {spark && (
        <div className="stat-spark">
          <Sparkline data={spark} color={sparkColor || 'var(--accent-primary)'} height={32} />
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function ParticipantDashboard() {
  const countdown = useCountdown(MOCK.round.cutoff)
  const { account, dll, scaling, violations, round, trader, trades, resetEligible } = MOCK

  const dllPct = (dll.used / dll.limit) * 100
  const scalingPct = Math.min((scaling.currentPnl / scaling.threshold) * 100, 100)

  const fmt = (n, sign = false) => {
    const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (sign) return (n >= 0 ? '+$' : '-$') + s
    return '$' + s
  }
  const pad = n => String(n).padStart(2, '0')

  return (
    <div className="pd-content">

          {/* ── Row 1: Stat Cards ── */}
          <div className="stats-row">
            <StatCard
              label="Account Balance"
              value={fmt(account.balance)}
              sub={`${fmt(account.netPnl, true)} (${account.netPnlPct > 0 ? '+' : ''}${account.netPnlPct}%) all-time`}
              subColor="var(--color-success)"
              spark={equityCurve}
              sparkColor="var(--color-success)"
            />
            <StatCard
              label="Daily P&L"
              value={fmt(account.dailyPnl, true)}
              sub={`${account.dailyPnlPct > 0 ? '+' : ''}${account.dailyPnlPct}% today`}
              subColor="var(--color-success)"
              badge={{ text: 'Live', type: 'live' }}
            />
            <StatCard
              label="Tournament Rank"
              value={`#${trader.rank}`}
              sub={`out of ${trader.totalParticipants} participants`}
              subColor="var(--text-secondary)"
              badge={{ text: 'Top 5%', type: 'accent' }}
            />
            <StatCard
              label="DLL Remaining"
              value={fmt(dll.limit - dll.used)}
              sub={`${(100 - dllPct).toFixed(1)}% of daily limit remaining`}
              subColor={dllPct > 70 ? 'var(--color-danger)' : dllPct > 40 ? 'var(--color-warning)' : 'var(--text-secondary)'}
            />
          </div>

          {/* ── Row 2: Main Grid ── */}
          <div className="main-grid">

            {/* ── Left Column ── */}
            <div className="col-left">

              {/* Equity Curve */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Equity Curve</span>
                  <span className="panel-badge success">+{account.netPnlPct}%</span>
                </div>
                <div className="equity-chart">
                  <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{ width: '100%', height: 120 }}>
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.18"/>
                        <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {(() => {
                      const data = equityCurve
                      const w = 400, h = 120
                      const min = Math.min(...data), max = Math.max(...data)
                      const range = max - min || 1
                      const pts = data.map((v, i) => {
                        const x = (i / (data.length - 1)) * w
                        const y = h - ((v - min) / range) * (h - 16) - 8
                        return [x, y]
                      })
                      const line = pts.map(([x, y]) => `${x},${y}`).join(' ')
                      const area = `0,${h} ` + pts.map(([x, y]) => `${x},${y}`).join(' ') + ` ${w},${h}`
                      return (
                        <>
                          <polygon points={area} fill="url(#eqGrad)"/>
                          <polyline points={line} fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinejoin="round"/>
                        </>
                      )
                    })()}
                  </svg>
                </div>
                <div className="equity-footer">
                  <span className="eq-label">Apr 13</span>
                  <span className="eq-label">Today</span>
                </div>
              </div>

              {/* Recent Trades */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Recent Trades</span>
                  <span className="panel-sub">{trades.filter(t => t.status === 'open').length} open</span>
                </div>
                <div className="trades-table-wrap">
                  <div className="trades-table">
                    <div className="trades-head">
                      <span>Symbol</span><span>Side</span><span>Entry</span><span>Exit</span><span>P&L</span><span>R:R</span>
                    </div>
                    {trades.map(t => (
                      <div key={t.id} className={`trade-row ${t.status === 'open' ? 'open' : ''}`}>
                        <span className="trade-symbol">{t.symbol}</span>
                        <span className={`trade-side ${t.side === 'Long' ? 'buy' : 'sell'}`}>{t.side}</span>
                        <span className="trade-num">{t.entry.toFixed(2)}</span>
                        <span className="trade-num">{t.exit ? t.exit.toFixed(2) : <span className="live-dot">●</span>}</span>
                        <span className={`trade-pnl ${t.pnl >= 0 ? 'pos' : 'neg'}`}>{fmt(t.pnl, true)}</span>
                        <span className="trade-rr">{t.rr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="col-right">

              {/* Round Countdown */}
              <div className="panel panel-accent">
                <div className="panel-header">
                  <span className="panel-title">Round Cutoff</span>
                  <span className="panel-badge accent">{round.name}</span>
                </div>
                <div className="countdown-display">
                  <div className="cd-block">
                    <span className="cd-num">{pad(countdown.h)}</span>
                    <span className="cd-unit">HRS</span>
                  </div>
                  <span className="cd-colon">:</span>
                  <div className="cd-block">
                    <span className="cd-num">{pad(countdown.m)}</span>
                    <span className="cd-unit">MIN</span>
                  </div>
                  <span className="cd-colon">:</span>
                  <div className="cd-block">
                    <span className="cd-num">{pad(countdown.s)}</span>
                    <span className="cd-unit">SEC</span>
                  </div>
                </div>
                <p className="countdown-note">Top 100 advance after {round.endsDate}</p>
              </div>

              {/* DLL Gauge */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Daily Loss Limit</span>
                  <span className="panel-sub">Resets {dll.resetTime}</span>
                </div>
                <div className="dll-bar-wrap">
                  <div className="dll-bar">
                    <div
                      className={`dll-fill ${dllPct > 70 ? 'danger' : dllPct > 40 ? 'warning' : 'safe'}`}
                      style={{ width: `${dllPct}%` }}
                    />
                  </div>
                  <div className="dll-labels">
                    <span className="dll-used">Used: {fmt(dll.used)}</span>
                    <span className="dll-limit">Limit: {fmt(dll.limit)}</span>
                  </div>
                </div>
                <div className="dll-remaining">
                  <span>{fmt(dll.limit - dll.used)}</span> remaining today
                </div>
              </div>

              {/* Scaling Tier */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Position Scaling</span>
                  <span className={`panel-badge ${scaling.tier === 2 ? 'success' : 'neutral'}`}>Tier {scaling.tier}</span>
                </div>
                <div className="scaling-contracts">{scaling.contracts}</div>
                <div className="scaling-progress">
                  <div className="scale-bar">
                    <div className="scale-fill" style={{ width: `${scalingPct}%` }}/>
                    <div className="scale-threshold"/>
                  </div>
                  <div className="scale-labels">
                    <span>{fmt(scaling.currentPnl)} profit</span>
                    <span>Unlock Tier 2 at {fmt(scaling.threshold)}</span>
                  </div>
                </div>
              </div>

              {/* Violations */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Violations</span>
                  <span className={`panel-badge ${violations.count >= 2 ? 'danger' : 'warning'}`}>
                    {violations.count} / {violations.max}
                  </span>
                </div>
                <div className="violation-dots">
                  {Array.from({ length: violations.max }).map((_, i) => (
                    <div key={i} className={`vdot ${i < violations.count ? 'triggered' : ''}`}/>
                  ))}
                </div>
                <p className="violation-note">3 violations across separate days = disqualification</p>
                {violations.flags.map((f, i) => (
                  <div key={i} className="violation-flag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>

              {/* Reset Eligibility */}
              {resetEligible && (
                <div className="panel panel-reset">
                  <div className="panel-header">
                    <span className="panel-title">Account Reset</span>
                    <span className="panel-badge accent">Available</span>
                  </div>
                  <p className="reset-note">Complete a challenge to earn a free account reset during the Qualifier round.</p>
                  <div className="reset-options">
                    <div className="reset-option">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                      </svg>
                      Post story tagging @alphafutures
                    </div>
                    <div className="reset-option">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      Photo at UT Tower + tag Alpha Futures
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
  )
}
