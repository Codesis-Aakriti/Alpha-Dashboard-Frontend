import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getKycLink, uploadStudentDoc, clearError } from '../../features/auth/authSlice'
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

  const validateFile = (file) => {
    if (!file) return false
    const ext = file.name.split('.').pop().toLowerCase()
    const isAllowedExt = ['jpg', 'jpeg', 'png', 'pdf'].includes(ext)
    const isAllowedSize = file.size <= 5 * 1024 * 1024 // 5MB
    return isAllowedExt && isAllowedSize
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && validateFile(f)) {
      onFile(f)
    } else if (f) {
      alert('File must be .jpg, .jpeg, .png, or .pdf and under 5MB.')
    }
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
        accept=".jpg,.jpeg,.png,.pdf"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files[0]
          if (f && validateFile(f)) {
            onFile(f)
          } else if (f) {
            alert('File must be .jpg, .jpeg, .png, or .pdf and under 5MB.')
          }
        }}
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
  const { status, error, user, registrationMessage } = useSelector((state) => state.auth)

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('verify-step')
    return saved ? parseInt(saved) : 1
  })
  const [studentDocType, setStudentDocType] = useState('id_card') // Default to slug
  const [studentFile, setStudentFile] = useState(null)
  const [floatingError, setFloatingError] = useState(null)
  const [kycVerifiedLocally, setKycVerifiedLocally] = useState(() => {
    return localStorage.getItem('kyc-verified-locally') === 'true'
  })

  const STUDENT_DOC_OPTIONS = [
    { label: 'ID Card', value: 'id_card' },
    { label: 'Bonafide Certificate', value: 'bonafide' },
    { label: 'Enrollment Letter', value: 'enrollment_letter' },
  ]

  useEffect(() => {
    if (error) {
      setFloatingError(error)
      const timer = setTimeout(() => {
        dispatch(clearError())
        setFloatingError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  useEffect(() => {
    // 1. If we have a kyb_id, it means Step 2 is definitely done. Go to 3.
    if (user?.kyb_id && step < 3) {
      setStep(3)
    }
    // 2. If no registration message, they are already verified (email). Skip Step 1.
    else if (!registrationMessage && step === 1) {
      setStep(2)
    }
  }, [registrationMessage, step, user?.kyb_id])

  const totalSteps = 4
  const goNext = () => {
    const next = Math.min(step + 1, totalSteps)
    setStep(next)
    localStorage.setItem('verify-step', next.toString())
  }
  const goPrev = () => {
    if (step <= 2) navigate('/auth')
    else if (step === 3) {
      setStep(1) // Cannot go back to step 2 after submission
      localStorage.setItem('verify-step', '1')
    } else {
      const prev = step - 1
      setStep(prev)
      localStorage.setItem('verify-step', prev.toString())
    }
  }

  const canProceed = () => {
    if (step === 1) return true
    if (step === 2) return !!studentFile
    if (step === 3) return false // Cannot proceed until KYC is done? Or maybe we let them click next after they open link?
    return true
  }

  const handleKycStart = () => {
    // Open a blank tab immediately to avoid mobile popup blockers
    const kycWindow = window.open('', '_blank')

    dispatch(getKycLink()).then((res) => {
      const msg = res.payload?.detail || res.payload
      if (!res.error && res.payload?.verification?.url) {
        if (kycWindow) {
          kycWindow.location.href = res.payload.verification.url
        } else {
          // Fallback if window couldn't be opened
          window.location.href = res.payload.verification.url
        }
      } else {
        // Close the blank tab if there's an error or handled elsewhere
        if (kycWindow) kycWindow.close()

        if (typeof msg === 'string' && msg.toLowerCase().includes('already verified')) {
          // If already verified, move to final step
          setKycVerifiedLocally(true)
          localStorage.setItem('kyc-verified-locally', 'true')
          if (msg) {
            setFloatingError(msg)
            setTimeout(() => setFloatingError(null), 5000)
          }
          goNext()
        }
      }
    })
  }

  const handleStudentSubmit = () => {
    if (!studentFile) return

    dispatch(uploadStudentDoc({
      document_type: studentDocType,
      document: studentFile
    })).then((res) => {
      if (!res.error) {
        goNext()
      } else if (res.payload === 'Document already under review.') {
        // If already under review, we can still proceed to KYC
        // Let the floating error (5s timer) show it
        goNext()
      }
    })
  }

  return (
    <div className="verify-page">
      <div className="verify-container">

        {/* Floating Error Notification */}
        {floatingError && (
          <div className="floating-error-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{floatingError}</span>
          </div>
        )}

        {/* Logo */}
        {/* <div className="verify-logo">
          <img src="/favicon.png" alt="Alpha Futures" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span>ALPHA FUTURES</span>
        </div> */}

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
              <p className="step-desc">
                {registrationMessage ? (
                  registrationMessage
                ) : (
                  <>We sent a verification link to <strong>{user?.email || 'your email'}</strong>. Please check your inbox and click the link to continue.</>
                )}
              </p>
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
                {STUDENT_DOC_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    className={`doc-option ${studentDocType === opt.value ? 'selected' : ''}`}
                    onClick={() => setStudentDocType(opt.value)}
                  >
                    <div className="radio-circle">
                      {studentDocType === opt.value && <div className="radio-fill" />}
                    </div>
                    {opt.label}
                  </div>
                ))}
              </div>
              <FileUpload
                label="Upload your student document"
                hint="JPG, JPEG, PNG or PDF · max 5MB"
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



              <button
                className="resend-link"
                style={{ marginTop: '20px', fontSize: '0.9rem' }}
                onClick={() => {
                  setStep(4)
                  localStorage.setItem('verify-step', '4')
                }}
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
                <div className={`pa-check-item ${kycVerifiedLocally ? 'done' : 'pending'}`}>
                  <div className="pa-check-icon">
                    {kycVerifiedLocally ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                    )}
                  </div>
                  <span>{kycVerifiedLocally ? 'Identity (KYC) verified' : 'Identity (KYC) pending'}</span>
                  {!kycVerifiedLocally && <span className="pa-pending-tag">Pending</span>}
                </div>
                {[
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
            {step === 1 && (
              <button className="btn-back" onClick={goPrev}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Sign In
              </button>
            )}
            {step < 4 && (
              <button
                className="btn-next"
                onClick={step === 2 ? handleStudentSubmit : goNext}
                disabled={!canProceed() || status === 'loading'}
              >
                {status === 'loading' && step === 2 ? 'Uploading...' : step === 3 ? 'Submit Application' : 'Continue'}
                {status !== 'loading' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            )}
            {step === 4 && (
              <>
                <button className="btn-back" onClick={() => setStep(3)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to Identity Verification
                </button>
                <div style={{ flex: 1 }} />
                <button
                  className="btn-next"
                  disabled
                  title="Available once your application is approved"
                  onClick={() => window.location.href = 'https://app.alpha-futures.com/'}
                >
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
