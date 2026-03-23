import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tournamentPoster from '../../assets/tournament-poster.png'
import './AuthPage.scss'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="auth-page">
      <div className="auth-container">

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
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); navigate('/verify') }}>

            {mode === 'signup' && (
              <div className="form-row two-col">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="John" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Doe" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@utexas.edu" />
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            )}

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                {mode === 'signin' && <a href="#" className="forgot-link">Forgot Password?</a>}
              </div>
              <div className="input-wrapper">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
            )}

            <button type="submit" className="auth-submit">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
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
