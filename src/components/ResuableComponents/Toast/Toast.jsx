import { useEffect } from 'react'
import './Toast.scss'

function Toast({ message, type = 'error', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    return (
        <div className="custom-toast">
            <div className={`toast toast-${type}`}>
                <div className="toast-content">
                    <div className="toast-icon">
                        {type === 'error' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="16" r="1" fill="currentColor" />
                            </svg>
                        )}
                        {type === 'success' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        {type === 'warning' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 20h20L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="17" r="1" fill="currentColor" />
                            </svg>
                        )}
                    </div>
                    <p className="toast-message">{message}</p>
                    <button type="button" className="toast-close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Toast;