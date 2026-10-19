import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { YEARS, formatDate, categoryColors } from '../utils.js';
import { useToast } from './Toast.jsx';

const emptyForm = { name: '', email: '', phone: '', department: '', year: '' };

function validate(f) {
  const errors = {};
  if (!f.name.trim() || f.name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters)';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = 'Enter a valid email address';
  if (!/^\d{10}$/.test(f.phone.trim())) errors.phone = 'Phone must be exactly 10 digits';
  if (!f.department.trim()) errors.department = 'Enter your department';
  if (!f.year) errors.year = 'Select your year of study';
  return errors;
}

export default function EventModal({ event, onClose, onRegistered, isFav, onToggleFav }) {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [imgFailed, setImgFailed] = useState(false);

  const capacity = Number(event?.capacity) || 1;
  const registered = Number(event?.registered) || 0;
  const spotsLeft = Math.max(capacity - registered, 0);
  const percentFull = Math.min(Math.round((registered / capacity) * 100), 100);

  const isSoldOut = spotsLeft === 0;
  const isFewSeats = !isSoldOut && (spotsLeft <= 5 || spotsLeft <= Math.ceil(capacity * 0.15));

  // Close with Escape key and lock page scroll
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (isSoldOut) {
      toast.warning('This event is already sold out.');
      return;
    }

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.warning('Please fix the errors in the registration form.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.register({ ...form, event: event._id });
      setConfirmationData({
        registration: response,
        student: { ...form },
        event,
        registeredAt: new Date().toISOString(),
      });
      toast.success(`Registration confirmed for ${event.title}!`);
      onRegistered();
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#292331]" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={form[name]}
        onChange={handleChange}
        disabled={submitting || isSoldOut}
        className={`input ${errors[name] ? 'input-error' : ''}`}
        {...props}
      />
      {errors[name] && <p className="mt-1 text-xs text-[#A34235]">{errors[name]}</p>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#292331]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-event-title"
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl animate-pop overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-[#E7E2E9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Banner / Image Header */}
        <div className="relative h-52 bg-[#292331] sm:h-64 overflow-hidden">
          {event.imageUrl && !imgFailed ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#292331] via-[#625078] to-[#292331] p-8 flex items-end">
              <span className="text-white/40 text-sm font-mono uppercase tracking-widest">Eventora Featured Event</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#292331]/95 via-[#292331]/40 to-transparent" />

          {/* Action buttons top-right: Favourite & Close */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {onToggleFav && (
              <button
                type="button"
                onClick={() => onToggleFav(event)}
                title={isFav ? 'Remove from favourites' : 'Save to favourites'}
                aria-label={isFav ? 'Remove from favourites' : 'Save to favourites'}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-md transition ${
                  isFav
                    ? 'bg-[#292331] text-[#D6E59A] ring-2 ring-[#D6E59A]/60'
                    : 'bg-white/90 text-[#292331] hover:bg-white'
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill={isFav ? '#D6E59A' : 'none'}
                  stroke="currentColor"
                  strokeWidth={isFav ? '1.5' : '2'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span>{isFav ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-sm font-bold text-[#292331] transition hover:bg-white shadow-md"
            >
              ✕
            </button>
          </div>

          {/* Banner bottom info */}
          <div className="absolute bottom-5 left-6 right-6">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-sm ${
                categoryColors[event.category] || categoryColors.Other
              }`}
            >
              {event.category}
            </span>
            <h2 id="modal-event-title" className="mt-2 text-2xl font-extrabold text-white sm:text-3xl tracking-tight leading-tight">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {confirmationData ? (
            /* Registration Success Confirmation Panel (Requirement 3) */
            <div className="animate-pop mx-auto max-w-2xl text-center py-4">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#356548]/15 text-[#356548] ring-4 ring-[#356548]/10">
                <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <span className="inline-block rounded-full bg-[#356548]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#356548]">
                Registration Confirmed
              </span>

              <h3 className="mt-2 text-2xl font-extrabold text-[#292331]">
                You're officially registered!
              </h3>
              <p className="mt-1 text-sm text-[#625078]">
                We've reserved your seat for <span className="font-semibold text-[#292331]">{event.title}</span>.
              </p>

              {/* Confirmation Details Card */}
              <div className="mt-6 rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-6 text-left shadow-sm">
                <div className="border-b border-[#E7E2E9] pb-4 mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#625078]">Event Name</p>
                    <h4 className="text-base font-bold text-[#292331]">{event.title}</h4>
                  </div>
                  <span className="rounded-full bg-[#356548] px-3 py-1 text-xs font-bold text-white shadow-sm">
                    Status: Confirmed
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-sm text-[#292331]">
                  <div>
                    <span className="text-xs font-semibold text-[#625078] block">Date &amp; Time</span>
                    <span className="font-medium">📅 {formatDate(event.date)} at {event.time}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#625078] block">Venue</span>
                    <span className="font-medium">📍 {event.venue}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#625078] block">Registered Attendee</span>
                    <span className="font-medium">👤 {form.name}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#625078] block">Confirmation Email</span>
                    <span className="font-medium">✉️ {form.email}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#625078] block">Department &amp; Year</span>
                    <span className="font-medium">🎓 {form.department} · {form.year}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#625078] block">Category</span>
                    <span className="font-medium">🏷️ {event.category}</span>
                  </div>
                </div>
              </div>

              {/* Return actions */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary px-8 py-3 text-sm"
                >
                  Return to Browsing Events
                </button>
              </div>
            </div>
          ) : (
            /* Standard Event Details + Registration Grid */
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Column: Event Details & Visual Seat Availability */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#625078]">
                    About this event
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#292331]/80">
                    {event.description}
                  </p>

                  <ul className="mt-6 space-y-3.5 text-sm text-[#292331]">
                    <li className="flex items-center gap-3 rounded-xl bg-[#F7F5F0] p-3 border border-[#E7E2E9]">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-xs text-[#625078] font-semibold">Event Date</p>
                        <p className="font-semibold text-[#292331]">{formatDate(event.date)}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 rounded-xl bg-[#F7F5F0] p-3 border border-[#E7E2E9]">
                      <span className="text-lg">🕒</span>
                      <div>
                        <p className="text-xs text-[#625078] font-semibold">Scheduled Time</p>
                        <p className="font-semibold text-[#292331]">{event.time}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 rounded-xl bg-[#F7F5F0] p-3 border border-[#E7E2E9]">
                      <span className="text-lg">📍</span>
                      <div>
                        <p className="text-xs text-[#625078] font-semibold">Campus Venue</p>
                        <p className="font-semibold text-[#292331]">{event.venue}</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Visual Seat Availability Box (Requirement 4) */}
                <div className="mt-6 rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#625078]">
                      Seat Availability
                    </span>
                    {isSoldOut ? (
                      <span className="rounded-full bg-[#A34235] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                        Sold Out
                      </span>
                    ) : isFewSeats ? (
                      <span className="rounded-full bg-[#875B18] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                        Few Seats Left
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#356548] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                        Open
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center my-3 py-2 border-y border-[#E7E2E9]">
                    <div>
                      <p className="text-xs text-[#625078]">Total Capacity</p>
                      <p className="text-base font-bold text-[#292331]">{capacity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#625078]">Seats Filled</p>
                      <p className="text-base font-bold text-[#292331]">{registered}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#625078]">Seats Remaining</p>
                      <p className={`text-base font-bold ${isSoldOut ? 'text-[#A34235]' : isFewSeats ? 'text-[#875B18]' : 'text-[#356548]'}`}>
                        {spotsLeft}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-1">
                    <div className="flex justify-between text-xs text-[#625078] mb-1 font-medium">
                      <span>{percentFull}% capacity filled</span>
                      <span>{spotsLeft} remaining</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E7E2E9]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSoldOut ? 'bg-[#A34235]' : isFewSeats ? 'bg-[#875B18]' : 'bg-[#292331]'
                        }`}
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Registration Form or Sold Out Banner */}
              <div className="rounded-2xl border border-[#E7E2E9] p-5 sm:p-6 bg-white">
                {isSoldOut ? (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#A34235]/10 text-2xl text-[#A34235] ring-2 ring-[#A34235]/20">
                      🚫
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-[#A34235]">This Event is Sold Out</h3>
                    <p className="mt-2 text-sm text-[#625078] max-w-xs">
                      All {capacity} seats have been reserved. Registration is currently closed for this event.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-ghost mt-6"
                    >
                      Browse Other Events
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="border-b border-[#E7E2E9] pb-3">
                      <h3 className="text-base font-bold text-[#292331]">Reserve Your Seat</h3>
                      <p className="text-xs text-[#625078]">Free campus entry. Enter your student information below.</p>
                    </div>

                    {field('name', 'Full Name', { placeholder: 'Aarav Sharma' })}
                    {field('email', 'College Email Address', { type: 'email', placeholder: 'student@college.edu' })}
                    {field('phone', 'Phone Number (10 digits)', { type: 'tel', placeholder: '9876543210', maxLength: 10 })}

                    <div className="grid grid-cols-2 gap-3">
                      {field('department', 'Department', { placeholder: 'Computer Science' })}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#292331]" htmlFor="year">
                          Year of Study
                        </label>
                        <select
                          id="year"
                          name="year"
                          value={form.year}
                          onChange={handleChange}
                          disabled={submitting}
                          className={`input ${errors.year ? 'input-error' : ''}`}
                        >
                          <option value="">Select Year</option>
                          {YEARS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                        {errors.year && <p className="mt-1 text-xs text-[#A34235]">{errors.year}</p>}
                      </div>
                    </div>

                    {serverError && (
                      <div className="rounded-xl border border-[#A34235]/30 bg-[#A34235]/10 p-3 text-xs font-semibold text-[#A34235]">
                        {serverError}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting || isSoldOut}
                        className="btn-primary w-full py-3 text-sm shadow-md"
                      >
                        {submitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Confirming Registration...</span>
                          </>
                        ) : (
                          <span>Complete Registration</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
