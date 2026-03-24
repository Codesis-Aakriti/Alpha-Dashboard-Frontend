import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getKycLink } from '../../features/auth/authSlice'
import './VerificationPage.scss'

const STEPS = [
  { id: 1, short: 'Email' },
  { id: 2, short: 'Student' },
  { id: 3, short: 'KYC' },
  { id: 4, short: 'Done' },
]

// ── File Upload ───────────────────────────────────────────
function FileUpload({ label, hint, file, onFile }) {
  const ref = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div
      className={`file-upload ${file ? 'has-file' : ''}`}
      onClick={() => ref.current.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />
      {file ? (
        <div className="file-preview">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="file-name">{file.name}</span>
          <button className="file-remove" onClick={e => { e.stopPropagation(); onFile(null) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="file-prompt">
          <div className="upload-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="upload-label">{label}</p>
          <p className="upload-hint">{hint}</p>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function VerificationPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { status, error } = useSelector((state) => state.auth)

  const [step, setStep] = useState(1)
  const [studentDocType, setStudentDocType] = useState('Student ID card')
  const [studentFile, setStudentFile] = useState(null)

  const totalSteps = 4
  const goNext = () => setStep(s => Math.min(s + 1, totalSteps))
  const goPrev = () => {
    if (step === 1) navigate('/auth')
    else setStep(s => s - 1)
  }

  const canProceed = () => {
    if (step === 1) return true
    if (step === 2) return !!studentFile
    if (step === 3) return false // Cannot proceed until KYC is done? Or maybe we let them click next after they open link?
    return true
  }

  const handleKycStart = () => {
    dispatch(getKycLink()).then((res) => {
      if (!res.error && res.payload?.url) {
        window.open(res.payload.url, '_blank')
      }
    })
  }

  return (
    <div className="verify-page">
      <div className="verify-container">

        {/* Logo */}
        <div className="verify-logo">
          <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
            <polygon points="15,3 27,25 3,25" stroke="var(--accent-primary)" strokeWidth="2" fill="none" strokeLinejoin="round" />
            <polygon points="15,9 23,23 7,23" fill="var(--accent-primary)" opacity="0.2" />
          </svg>
          <span>ALPHA FUTURES</span>
        </div>

        {/* Step Tracker */}
        <div className="step-track">
          {STEPS.map((s) => (
            <div key={s.id} className={`step-item ${step > s.id ? 'line-done' : ''}`}>
              <div className={`step-circle ${step > s.id ? 'done' : step === s.id ? 'active' : ''}`}>
                {step > s.id ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : s.id}
              </div>
              <span className={`step-label ${step === s.id ? 'active' : ''}`}>{s.short}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="verify-card">

          {/* Step 1 — Email Link */}
          {step === 1 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2>Verify your email</h2>
              <p className="step-desc">We sent a verification link to <strong>you@utexas.edu</strong>. Please check your inbox and click the link to continue.</p>
              <button className="resend-link" style={{ marginTop: '24px' }}>Didn&apos;t receive it? <span>Resend email</span></button>
            </div>
          )}

          {/* Step 2 — Student Verification */}
          {step === 2 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h2>Student verification</h2>
              <p className="step-desc">Confirm your active enrollment at <strong>University of Texas at Austin</strong>.</p>
              <div className="info-note" style={{ marginBottom: '16px', marginTop: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Select and upload any one document from the list below
              </div>
              <div className="doc-options">
                {['Student ID card', 'Enrollment letter', 'University portal screenshot with name visible'].map(opt => (
                  <div
                    key={opt}
                    className={`doc-option ${studentDocType === opt ? 'selected' : ''}`}
                    onClick={() => setStudentDocType(opt)}
                  >
                    <div className="radio-circle">
                      {studentDocType === opt && <div className="radio-fill" />}
                    </div>
                    {opt}
                  </div>
                ))}
              </div>
              <FileUpload
                label="Upload your student document"
                hint="JPG, PNG or PDF · max 10MB"
                file={studentFile}
                onFile={setStudentFile}
              />
            </div>
          )}

          {/* Step 3 — KYC */}
          {step === 3 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <circle cx="8" cy="12" r="2" />
                  <path d="M14 9h4M14 12h4M14 15h2" />
                </svg>
              </div>
              <h2>Identity verification</h2>
              <p className="step-desc">We use <strong>Veriff</strong> for secure, instant identity verification. Please have your government ID ready.</p>

              <button
                className="btn-kyc-start"
                onClick={handleKycStart}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Generating Link...' : 'Start Identity Verification'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </button>

              <div className="info-note" style={{ marginTop: '24px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                This will open a secure window to verify your identity.
              </div>

              {error && (
                <div style={{ color: '#ff4c4c', fontSize: '0.85rem', marginTop: '12px' }}>
                  {error}
                </div>
              )}

              <button
                className="resend-link"
                style={{ marginTop: '20px', fontSize: '0.9rem' }}
                onClick={() => setStep(4)}
              >
                Already completed? <span>Continue to final step</span>
              </button>
            </div>
          )}

          {/* Step 4 — Pending Approval */}
          {step === 4 && (
            <div className="step-content pending-approval">

              {/* Status icon */}
              <div className="pa-status-icon">
                <div className="pa-icon-ring">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="pa-orbit" />
              </div>

              <h2>Application Under Review</h2>
              <p className="step-desc">Your documents have been submitted. Our team is reviewing your identity and student verification — typically less than 24 hours.</p>

              {/* Checklist */}
              <div className="pa-checklist">
                {[
                  { label: 'Email verified', done: true },
                  { label: 'Student ID uploaded', done: true },
                  { label: 'Identity (KYC) pending', done: false },
                  { label: 'Manual approval', done: false },
                ].map((item, i) => (
                  <div key={i} className={`pa-check-item ${item.done ? 'done' : 'pending'}`}>
                    <div className="pa-check-icon">
                      {item.done ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                    </div>
                    <span>{item.label}</span>
                    {!item.done && <span className="pa-pending-tag">Pending</span>}
                  </div>
                ))}
              </div>

              {/* Info note */}
              {/* <div className="info-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                You&apos;ll receive an approval or follow-up email within 24 hours.
              </div> */}

            </div>
          )}

          {/* Actions */}
          <div className="step-actions">
            {step < 4 && (
              <button className="btn-back" onClick={goPrev}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {step === 1 ? 'Back to Sign In' : 'Back'}
              </button>
            )}
            {step < 4 && (
              <button className="btn-next" onClick={goNext} disabled={!canProceed()}>
                {step === 3 ? 'Submit Application' : 'Continue'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
            {step === 4 && (
              <>
                <button className="btn-back" onClick={() => navigate('/auth')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
                <button className="btn-next" disabled title="Available once your application is approved">
                  Go to Dashboard
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
