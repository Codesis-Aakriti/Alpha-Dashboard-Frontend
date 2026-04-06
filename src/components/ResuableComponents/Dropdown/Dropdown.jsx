import { useState, useRef, useEffect } from 'react'
import './Dropdown.scss'

function Dropdown({
    options = [],
    value,
    onChange,
    placeholder = 'Select...',
    label,
    required = false,
    searchable = true,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef(null)

    const filteredOptions = searchable && searchTerm
        ? options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (option) => {
        onChange(option.value)
        setIsOpen(false)
        setSearchTerm('')
    }

    return (
        <div className={`dropdown-wrapper ${className}`} ref={dropdownRef}>
            {label && (
                <label className="dropdown-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}

            <div className={`dropdown-container ${isOpen ? 'open' : ''}`}>
                <button
                    type="button"
                    className="dropdown-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <svg
                        className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                    >
                        <path
                            d="M3 4.5L6 7.5L9 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {isOpen && (
                    <div className="dropdown-menu">
                        {searchable && (
                            <div className="dropdown-search">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="dropdown-options">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`dropdown-option ${option.value === value ? 'selected' : ''}`}
                                        onClick={() => handleSelect(option)}
                                    >
                                        {option.label}
                                        {option.value === value && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="dropdown-empty">No results found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dropdown;