'use client';

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { submitConsultation } from '@/app/actions/submitConsultation';
import countryCodes, { type CountryCode } from '@/data/countryCodes';

export default function ConsultationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    startupIdea: '',
  });
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find((c) => c.code === 'IN')!
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneWarning, setPhoneWarning] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [dropdownOpen]);

  const filteredCountries = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Only allow digits and spaces
    const cleaned = rawValue.replace(/[^\d\s]/g, '');
    const digitsOnly = cleaned.replace(/\s/g, '');

    if (digitsOnly.length > selectedCountry.maxDigits) {
      setPhoneWarning(
        `Phone numbers in ${selectedCountry.name} should be ${selectedCountry.minDigits === selectedCountry.maxDigits
          ? `${selectedCountry.maxDigits} digits`
          : `${selectedCountry.minDigits}–${selectedCountry.maxDigits} digits`
        }. You've entered ${digitsOnly.length} digits.`
      );
      // Don't update — cap the input
      return;
    }

    if (digitsOnly.length > 0 && digitsOnly.length < selectedCountry.minDigits) {
      setPhoneWarning(
        `Phone numbers in ${selectedCountry.name} should be at least ${selectedCountry.minDigits} digits.`
      );
    } else {
      setPhoneWarning(null);
    }

    setFormData({ ...formData, phone: cleaned });
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearchQuery('');

    // Re-validate current phone against new country rules
    const digitsOnly = formData.phone.replace(/\s/g, '');
    if (digitsOnly.length > country.maxDigits) {
      setPhoneWarning(
        `Phone numbers in ${country.name} should be ${country.minDigits === country.maxDigits
          ? `${country.maxDigits} digits`
          : `${country.minDigits}–${country.maxDigits} digits`
        }. You've entered ${digitsOnly.length} digits.`
      );
      // Trim phone to max digits
      setFormData({ ...formData, phone: digitsOnly.slice(0, country.maxDigits) });
    } else if (digitsOnly.length > 0 && digitsOnly.length < country.minDigits) {
      setPhoneWarning(
        `Phone numbers in ${country.name} should be at least ${country.minDigits} digits.`
      );
    } else {
      setPhoneWarning(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Honeypot spam check
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    // Validate phone digits
    const digitsOnly = formData.phone.replace(/\s/g, '');
    if (digitsOnly.length < selectedCountry.minDigits) {
      setPhoneWarning(
        `Phone numbers in ${selectedCountry.name} must be at least ${selectedCountry.minDigits} digits.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPhone = `${selectedCountry.dialCode} ${formData.phone}`;
      const result = await submitConsultation({
        ...formData,
        phone: fullPhone,
      });

      if (result.success) {
        setSubmitted(true);
        setFormData({ fullName: '', email: '', phone: '', startupIdea: '' });
        setPhoneWarning(null);
      } else {
        setError(result.error || 'Failed to submit form');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M26 11L13 24L6 17" />
          </svg>
        </div>
        <h3 className="font-heading font-bold text-xl mb-3 text-[var(--color-text-primary)]">
          Thank You for Reaching Out
        </h3>
        <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-[400px] mx-auto">
          Thank you for reaching out to Larsva. We have received your startup idea and will contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Honeypot field — hidden from users, visible to bots */}
      <div className="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="fullName" className="block font-display font-semibold text-sm mb-2 text-[var(--color-text-primary)]">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          required
          placeholder="Your full name"
          className="form-input"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-display font-semibold text-sm mb-2 text-[var(--color-text-primary)]">
          Email Address <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          className="form-input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      {/* Phone with Country Code Dropdown */}
      <div>
        <label htmlFor="phone" className="block font-display font-semibold text-sm mb-2 text-[var(--color-text-primary)]">
          Phone Number <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          {/* Country Code Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isSubmitting}
              className="form-input flex items-center gap-1.5 px-3 min-w-[110px] cursor-pointer hover:border-[var(--color-accent)]/40 transition-colors whitespace-nowrap"
              aria-label="Select country code"
              aria-expanded={dropdownOpen}
            >
              <span className="text-lg leading-none">{selectedCountry.flag}</span>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{selectedCountry.dialCode}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`ml-auto transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown List */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-[280px] bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Search */}
                <div className="p-2 border-b border-gray-100">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-100 outline-none focus:border-[var(--color-accent)]/40 focus:bg-white transition-colors placeholder:text-gray-400"
                  />
                </div>
                {/* Country List */}
                <div className="max-h-[220px] overflow-y-auto overscroll-contain">
                  {filteredCountries.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">No countries found</div>
                  ) : (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-accent-light)] transition-colors text-sm ${
                          selectedCountry.code === country.code
                            ? 'bg-[var(--color-accent-light)] font-medium'
                            : ''
                        }`}
                      >
                        <span className="text-lg leading-none">{country.flag}</span>
                        <span className="flex-1 text-[var(--color-text-primary)] truncate">{country.name}</span>
                        <span className="text-[var(--color-text-muted)] text-xs font-mono">{country.dialCode}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Input */}
          <input
            id="phone"
            type="tel"
            required
            placeholder={`${selectedCountry.minDigits === selectedCountry.maxDigits
              ? `${selectedCountry.maxDigits} digit number`
              : `${selectedCountry.minDigits}–${selectedCountry.maxDigits} digit number`
            }`}
            className={`form-input flex-1 ${phoneWarning ? 'border-amber-400 focus:border-amber-500' : ''}`}
            value={formData.phone}
            onChange={handlePhoneChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Phone Validation Warning */}
        {phoneWarning && (
          <div className="mt-2 flex items-start gap-2 text-amber-600 text-xs">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
              <path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M7 5.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="7" cy="9.75" r="0.5" fill="currentColor" />
            </svg>
            <span>{phoneWarning}</span>
          </div>
        )}

        {!phoneWarning && (
          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
            Enter digits only, without country code.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="startupIdea" className="block font-display font-semibold text-sm mb-2 text-[var(--color-text-primary)]">
          Startup Idea Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="startupIdea"
          required
          placeholder="Describe your startup idea in 3-5 sentences. What problem does it solve? Who is the target audience?"
          className="form-input"
          rows={5}
          value={formData.startupIdea}
          onChange={(e) => setFormData({ ...formData, startupIdea: e.target.value })}
          disabled={isSubmitting}
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          Minimum 3-5 sentences. Your idea is kept confidential.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !!phoneWarning}
        className="btn-primary w-full justify-center text-lg py-4 mt-2 disabled:opacity-70 rounded-xl"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          <>
            Request Founder Consultation
            <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
