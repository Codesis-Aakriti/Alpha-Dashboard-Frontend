import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, loginUser } from '../../features/auth/authSlice'
import tournamentPoster from '../../assets/tournament-poster.png'
import './AuthPage.scss'

export default function AuthPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { status, error } = useSelector((state) => state.auth)
  const [mode, setMode] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    country_code: '',
    contact: '',
    city: '',
    country: '',
    referal_code: '',
    password: '',
    confirm_password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (mode === 'signin') {
      dispatch(loginUser({ email: formData.email, password: formData.password })).then((res) => {
        if (!res.error) navigate('/dashboard') // adjust route as needed
      })
    } else {
      if (formData.password !== formData.confirm_password) {
        alert('Passwords do not match!')
        return
      }
      const { confirm_password, ...payload } = formData
      dispatch(registerUser(payload)).then((res) => {
        if (!res.error) navigate('/verify')
      })
    }
  }

  return (
    <div className="auth-page">
      <div className={`auth-container ${mode}`}>

        {/* ── LEFT: Image Card ── */}
        <div className="auth-image-card">
          <img src={tournamentPoster} alt="UT Longhorns x Alpha Futures Trading Tournament" />
          <div className="auth-image-overlay">
            <div className="overlay-badge">April 13–17, 2026 · Austin, TX</div>
            <h2>UT Longhorns × Alpha Futures</h2>
            <p>Compete in a live simulated trading tournament. Top 5 advance to in-person finals.</p>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="auth-form-side">

          {/* Logo */}
          <div className="auth-logo">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <polygon
                points="15,3 27,25 3,25"
                stroke="var(--accent-primary)"
                strokeWidth="2"
                fill="none"
                strokeLinejoin="round"
              />
              <polygon
                points="15,9 23,23 7,23"
                fill="var(--accent-primary)"
                opacity="0.2"
              />
            </svg>
            <span>ALPHA FUTURES</span>
          </div>

          {/* Title */}
          <div className="auth-title">
            <h1>{mode === 'signin' ? 'Welcome back' : 'Join the Tournament'}</h1>
            <p>
              {mode === 'signin'
                ? 'Sign in to access your tournament dashboard'
                : 'Create your account to compete for $20K'}
            </p>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>

            {mode === 'signup' && (
              <>
                <div className="form-row two-col">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="first_name" placeholder="John" value={formData.first_name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="last_name" placeholder="Doe" value={formData.last_name} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="you@utexas.edu" value={formData.email} onChange={handleChange} />
            </div>

            {mode === 'signup' && (
              <>
                <div className="form-row code-phone">
                  <div className="form-group">
                    <label>Code</label>
                    <input type="text" name="country_code" placeholder="+1" value={formData.country_code} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="contact" placeholder="(555) 000-0000" value={formData.contact} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row two-col">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="city" placeholder="Austin" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input type="text" name="country" placeholder="USA" value={formData.country} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Referral Code</label>
                  <input type="text" name="referal_code" placeholder="XYZ123 (Optional)" value={formData.referal_code} onChange={handleChange} />
                </div>
              </>
            )}

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                {mode === 'signin' && <a href="#" className="forgot-link">Forgot Password?</a>}
              </div>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
              </div>
            )}

            {error && (
              <div className="auth-error" style={{ color: '#ff4c4c', fontSize: '0.86rem', marginTop: '8px', fontWeight: '500' }}>
                {error}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Switch */}
          <p className="auth-switch">
            {mode === 'signin' ? (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => setMode('signup')}>Register</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setMode('signin')}>Sign In</button>
              </>
            )}
          </p>
        </div>

      </div>
    </div>
  )
}
