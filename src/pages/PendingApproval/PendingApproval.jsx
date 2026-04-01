import { useNavigate } from 'react-router-dom'
import './PendingApproval.scss'

const SUBMITTED_ITEMS = [
  { label: 'Student ID uploaded', done: true },
  { label: 'Manual approval', done: false },
]

const NEXT_STEPS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: 'Wait for approval',
    desc: 'Our team will review your student document within 24 hours.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Account provisioned',
    desc: 'Once approved, your $10,000 simulated account will be activated automatically.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Start trading',
    desc: 'Sign in on April 13 to begin the Qualifier round and compete for the $20K prize pool.',
  },
]

export default function PendingApproval() {
  const navigate = useNavigate()

  return (
    <div className="pa-page">
      <div className="pa-container">

        {/* Logo */}
        <div className="pa-logo">
          <img src="/favicon.png" alt="Alpha Futures" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span>ALPHA FUTURES</span>
        </div>

        {/* Status Icon */}
        <div className="pa-status-icon">
          <div className="pa-icon-ring">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="pa-orbit" />
        </div>

        {/* Heading */}
        <div className="pa-heading">
          <h1>Application Under Review</h1>
          <p>Your documents have been submitted successfully. Our team is reviewing your identity and student verification — this typically takes less than 24 hours.</p>
        </div>

        {/* Submitted checklist */}
        <div className="pa-card">
          <div className="pa-card-title">Submission Summary</div>
          <div className="pa-checklist">
            {SUBMITTED_ITEMS.map((item, i) => (
              <div key={i} className={`pa-check-item ${item.done ? 'done' : 'pending'}`}>
                <div className="pa-check-icon">
                  {item.done ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  )}
                </div>
                <span>{item.label}</span>
                {!item.done && <span className="pa-pending-tag">Pending</span>}
              </div>
            ))}
          </div>
        </div>

        {/* What happens next */}
        <div className="pa-card">
          <div className="pa-card-title">What happens next</div>
          <div className="pa-steps">
            {NEXT_STEPS.map((step, i) => (
              <div key={i} className="pa-step">
                <div className="pa-step-num">{i + 1}</div>
                <div className="pa-step-icon">{step.icon}</div>
                <div className="pa-step-body">
                  <span className="pa-step-title">{step.title}</span>
                  <span className="pa-step-desc">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="pa-info-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          If your documents require corrections, you will be notified by email with instructions to resubmit.
        </div>

        {/* Actions */}
        <div className="pa-actions">
          <button className="pa-btn-secondary" onClick={() => navigate('/auth')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
          <button
            className="pa-btn-primary"
            onClick={() => window.location.href = 'https://app.alpha-futures.com/'}
          >
            Go to Dashboard
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
