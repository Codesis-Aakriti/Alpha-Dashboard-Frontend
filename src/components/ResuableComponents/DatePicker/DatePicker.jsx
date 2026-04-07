import { useState, useRef, useEffect } from 'react'
import './DatePicker.scss'

function DatePicker({
    label,
    value,
    onChange,
    required = false,
    placeholder = 'dd-mm-yyyy',
    minDate,
    maxDate,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
    const [openUpward, setOpenUpward] = useState(false)
    const pickerRef = useRef(null)

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (isOpen && pickerRef.current) {
            const rect = pickerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top
            const menuHeight = 400 // Approximate height of the datepicker menu

            setOpenUpward(spaceBelow < menuHeight && spaceAbove > spaceBelow)
        }
    }, [isOpen])

    const formatDate = (date) => {
        if (!date) return ''
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
    }

    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const daysInPrevMonth = new Date(year, month, 0).getDate()

        const days = []

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, daysInPrevMonth - i)
            })
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            })
        }

        // Next month days - only add enough to complete 5 weeks (35 days total)
        const totalDaysNeeded = 35
        const remainingDays = totalDaysNeeded - days.length
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            })
        }

        return days
    }

    const handleDateSelect = (date) => {
        setSelectedDate(date)
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        onChange(formattedDate)
        setIsOpen(false)
    }

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))
    }

    const handlePrevYear = () => {
        setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth()))
    }

    const handleNextYear = () => {
        setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth()))
    }

    const handleToday = () => {
        const today = new Date()
        setSelectedDate(today)
        setViewDate(today)
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        onChange(formattedDate)
        setIsOpen(false)
    }

    const handleClear = () => {
        setSelectedDate(null)
        onChange('')
    }

    const isToday = (date) => {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    const isSelected = (date) => {
        if (!selectedDate) return false
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
    }

    const days = getDaysInMonth(viewDate)

    return (
        <div className={`custom-datepicker ${className}`}>
            <div className="datepicker-wrapper" ref={pickerRef}>
                {label && (
                    <label className="datepicker-label">
                        {label}
                        {required && <span className="required">*</span>}
                    </label>
                )}

                <div className="datepicker-container">
                    <button
                        type="button"
                        className="datepicker-trigger"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className={selectedDate ? 'selected-text' : 'placeholder-text'}>
                            {selectedDate ? formatDate(selectedDate) : placeholder}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
                            <line x1="9" y1="2" x2="9" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="15" y1="2" x2="15" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    {isOpen && (
                        <div className="datepicker-menu open-upward">
                            <div className="datepicker-header">
                                <div className="nav-group">
                                    <button type="button" onClick={handlePrevYear} className="nav-btn" title="Previous Year">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M18 18L12 12L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 18L6 12L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <button type="button" onClick={handlePrevMonth} className="nav-btn" title="Previous Month">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                                <span className="month-year">
                                    {months[viewDate.getMonth()]}, {viewDate.getFullYear()}
                                </span>
                                <div className="nav-group">
                                    <button type="button" onClick={handleNextMonth} className="nav-btn" title="Next Month">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <button type="button" onClick={handleNextYear} className="nav-btn" title="Next Year">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M6 18L12 12L6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 18L18 12L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="datepicker-calendar">
                                <div className="weekdays">
                                    {daysOfWeek.map(day => (
                                        <div key={day} className="weekday">{day}</div>
                                    ))}
                                </div>

                                <div className="days-grid">
                                    {days.map((dayObj, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`day-cell ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday(dayObj.date) ? 'today' : ''} ${isSelected(dayObj.date) ? 'selected' : ''}`}
                                            onClick={() => dayObj.isCurrentMonth && handleDateSelect(dayObj.date)}
                                        >
                                            {dayObj.day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="datepicker-footer">
                                <button type="button" onClick={handleClear} className="footer-btn clear-btn">
                                    Clear
                                </button>
                                <button type="button" onClick={handleToday} className="footer-btn today-btn">
                                    Today
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DatePicker;