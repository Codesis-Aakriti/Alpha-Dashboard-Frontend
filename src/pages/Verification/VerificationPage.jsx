import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { uploadStudentDoc, clearError, getStudentDocStatus } from '../../features/auth/authSlice'
import './VerificationPage.scss'

const STEPS = [
  { id: 1, short: 'Student' },
  { id: 2, short: 'Done' },
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
  const { status, error, user } = useSelector((state) => state.auth)

  const [step, setStep] = useState(1)
  const [studentDocType, setStudentDocType] = useState('id_card') // Default to slug
  const [studentFile, setStudentFile] = useState(null)
  const [utEidText, setUtEidText] = useState('')
  const [floatingError, setFloatingError] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const STUDENT_DOC_OPTIONS = [
    { label: 'Student ID Card', value: 'id_card' },
    { label: 'Enrollment Letter', value: 'enrollment_letter' },
    { label: 'UT EID', value: 'ut_eid' },
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

  const { studentDocStatus, id: authId, uid: authUid } = useSelector((state) => state.auth)

  // On mount: check status immediately. If already approved, redirect to dashboard.
  useEffect(() => {
    const userId = authId || authUid
    if (userId) {
      dispatch(getStudentDocStatus(userId))
    }
  }, [authId, authUid, dispatch])



  // Poll status every 40s on step 2 or when pending
  useEffect(() => {
    const userId = authId || authUid
    const status = studentDocStatus?.admin_status?.toLowerCase()

    // Only poll if we are in a pending state
    const isPending = status === 'pending' || !status
    const isFinal = ['approved', 'manual_approved', 'rejected'].includes(status)

    if (userId && (step === 2 || isPending) && !isFinal) {
      const interval = setInterval(() => {
        dispatch(getStudentDocStatus(userId))
      }, 120000)
      return () => clearInterval(interval)
    }
  }, [step, studentDocStatus?.admin_status, authId, authUid, dispatch])

  const totalSteps = 2
  const goNext = () => {
    const next = Math.min(step + 1, totalSteps)
    setStep(next)
    localStorage.setItem('verify-step', next.toString())
  }
  const goPrev = () => {
    if (step === 1) navigate('/auth')
    else setStep(step - 1)
  }

  const canProceed = () => {
    if (step === 1) {
      if (studentDocType === 'ut_eid') return utEidText.trim().length > 0;
      return !!studentFile
    }
    return true
  }


  const handleStudentSubmit = () => {
    if (studentDocType !== 'ut_eid' && !studentFile) return

    dispatch(uploadStudentDoc({
      document_type: studentDocType,
      document: studentFile,
      ut_eid: utEidText
    })).then((res) => {
      if (!res.error) {
        setIsRetrying(false)
        goNext()
      } else {
        const msg = res.payload
        if (msg === 'Document already under review.' || msg === 'Verification already approved. Cannot re-upload.') {
          // If already submitted/approved, we can still proceed to KYC
          goNext()
        }
      }
    })
  }

  if (!studentDocStatus && status === 'loading') {
    return (
      <div className="verify-page">
        <div className="verify-loader-container">
          <div className="verify-loader">
            <div className="loader-ring" />
            <div className="loader-logo">
              <img src="/favicon.png" alt="Logo" />
            </div>
          </div>
          <p>Initializing verification...</p>
        </div>
      </div>
    )
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
          {STEPS.map((s) => {
            const isApproved = studentDocStatus?.admin_status?.toLowerCase() === 'approved' || studentDocStatus?.admin_status?.toLowerCase() === 'manual_approved';
            const isDone = isApproved || step > s.id;
            const isActive = !isApproved && step === s.id;

            return (
              <div key={s.id} className={`step-item ${isDone ? 'line-done' : ''}`}>
                <div className={`step-circle ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : s.id}
                </div>
                <span className={`step-label ${isActive ? 'active' : ''}`}>{s.short}</span>
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="verify-card">

          {/* Step 1 — Student Verification */}
          {step === 1 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={
                  (studentDocStatus?.admin_status?.toLowerCase() === 'approved' || studentDocStatus?.admin_status?.toLowerCase() === 'manual_approved') ? 'var(--color-success)' :
                    (studentDocStatus?.admin_status?.toLowerCase() === 'rejected' && !isRetrying) ? 'var(--color-error, #ff4d4d)' :
                      'var(--accent-primary)'
                } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {(studentDocStatus?.admin_status?.toLowerCase() === 'approved' || studentDocStatus?.admin_status?.toLowerCase() === 'manual_approved') ? (
                    <><circle cx="12" cy="12" r="10" /><polyline points="20 6 9 17 4 12" /></>
                  ) : (studentDocStatus?.admin_status?.toLowerCase() === 'rejected' && !isRetrying) ? (
                    <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
                  ) : studentDocStatus?.admin_status?.toLowerCase() === 'pending' ? (
                    <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
                  ) : (
                    <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>
                  )}
                </svg>
              </div>
              <h2>
                {(studentDocStatus?.admin_status?.toLowerCase() === 'approved' || studentDocStatus?.admin_status?.toLowerCase() === 'manual_approved') ? 'Student Verified' :
                  (studentDocStatus?.admin_status?.toLowerCase() === 'rejected' && !isRetrying) ? 'Verification Rejected' :
                    studentDocStatus?.admin_status?.toLowerCase() === 'pending' ? 'Verification Pending' :
                      'Student verification'}
              </h2>
              {(studentDocStatus?.admin_status?.toLowerCase() === 'approved' || studentDocStatus?.admin_status?.toLowerCase() === 'manual_approved') ? (
                <>
                  <p className="step-desc">Your student verification has been approved. You can now access the dashboard.</p>
                  <button
                    className="btn-kyc-start"
                    onClick={() => window.location.href = 'https://app.alpha-futures.com/'}
                    style={{ marginTop: '24px' }}
                  >
                    Go to Dashboard
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              ) : (studentDocStatus?.admin_status?.toLowerCase() === 'rejected' && !isRetrying) ? (
                <>
                  <p className="step-desc" style={{ color: 'var(--color-error, #ff4d4d)' }}>Your student verification was rejected. Please check your document and try again.</p>
                  <button
                    className="btn-kyc-start"
                    onClick={() => {
                      setStudentFile(null);
                      setIsRetrying(true);
                      // Optionally we could reset the step if we are on step 2, but step 1 is where upload happens
                    }}
                    style={{ marginTop: '24px', background: 'var(--accent-primary)', color: "white" }}
                  >
                    Try Again
                  </button>
                </>
              ) : studentDocStatus?.admin_status?.toLowerCase() === 'pending' ? (
                <>
                  <p className="step-desc">Document already uploaded, approval is pending.</p>
                  <div className="info-note" style={{ marginBottom: '16px', marginTop: 16 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Our team is reviewing your identity and student verification — typically less than 24 hours.
                  </div>
                </>
              ) : (
                <>
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
                  {studentDocType === 'ut_eid' ? (
                    <div className="form-group" style={{ marginTop: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Enter UT EID</label>
                      <input
                        type="text"
                        placeholder="Enter your UT EID"
                        value={utEidText}
                        onChange={(e) => setUtEidText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  ) : (
                    <FileUpload
                      label="Upload your student document"
                      hint="JPG, JPEG, PNG or PDF · max 5MB"
                      file={studentFile}
                      onFile={setStudentFile}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2 — Pending Approval */}
          {step === 2 && (
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
                <div className={`pa-check-item done`}>
                  <div className="pa-check-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Student ID uploaded</span>
                </div>

                <div className={`pa-check-item ${(studentDocStatus?.admin_status?.toLowerCase() === 'approved' || studentDocStatus?.admin_status?.toLowerCase() === 'manual_approved') ? 'done' : studentDocStatus?.admin_status?.toLowerCase() === 'rejected' ? 'failed' : 'pending'}`}>
                  <div className="pa-check-icon">
                    {(studentDocStatus?.admin_status?.toLowerCase() === 'approved' || studentDocStatus?.admin_status?.toLowerCase() === 'manual_approved') ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : studentDocStatus?.admin_status?.toLowerCase() === 'rejected' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                    )}
                  </div>
                  <span>Approved</span>
                  {(studentDocStatus?.admin_status?.toLowerCase() !== 'approved' && studentDocStatus?.admin_status?.toLowerCase() !== 'manual_approved' && studentDocStatus?.admin_status?.toLowerCase() !== 'rejected') && <span className="pa-pending-tag">Pending</span>}
                  {studentDocStatus?.admin_status?.toLowerCase() === 'rejected' && <span className="pa-pending-tag" style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d' }}>Rejected</span>}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="step-actions">
            {step === 1 &&
              studentDocStatus?.admin_status?.toLowerCase() !== 'approved' &&
              studentDocStatus?.admin_status?.toLowerCase() !== 'manual_approved' && (
                <button
                  className="btn-next"
                  onClick={studentDocStatus?.admin_status?.toLowerCase() === 'pending' ? goNext : handleStudentSubmit}
                  disabled={(!canProceed() && studentDocStatus?.admin_status?.toLowerCase() !== 'pending') || status === 'loading'}
                >
                  {status === 'loading' ? 'Uploading...' : 'Continue'}
                  {status !== 'loading' && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </button>
              )}
            {step === 2 && (
              <>
                <button className="btn-back" onClick={() => setStep(1)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to Upload
                </button>
                <div style={{ flex: 1 }} />
                <button
                  className="btn-next"
                  disabled={studentDocStatus?.admin_status?.toLowerCase() !== 'approved' && studentDocStatus?.admin_status?.toLowerCase() !== 'manual_approved'}
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
    </div >
  )
}
