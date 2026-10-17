import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { YEARS, formatDate, categoryColors } from '../utils.js';

const emptyForm = { name: '', email: '', phone: '', department: '', year: '' };

// Client-side validation (the server validates again)
function validate(f) {
  const errors = {};
  if (f.name.trim().length < 2) errors.name = 'Enter your full name';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = 'Enter a valid email address';
  if (!/^\d{10}$/.test(f.phone.trim())) errors.phone = 'Phone must be exactly 10 digits';
  if (!f.department.trim()) errors.department = 'Enter your department';
  if (!f.year) errors.year = 'Select your year';
  return errors;
}

export default function EventModal({ event, onClose, onRegistered }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const spotsLeft = Math.max(event.capacity - event.registered, 0);

  // Close with Escape key and stop the page behind from scrolling
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
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await api.register({ ...form, event: event._id });
      setSuccess(true);
      onRegistered();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`input ${errors[name] ? 'input-error' : ''}`}
        {...props}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl animate-pop overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-fuchsia-500 sm:h-60">
          {event.imageUrl && !imgFailed && (
            <img src={event.imageUrl} alt={event.title} onError={() => setImgFailed(true)} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg font-bold text-slate-700 transition hover:bg-white"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[event.category]}`}>{event.category}</span>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{event.title}</h2>
          </div>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-2">
          {/* Event details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-600">Event Details</h3>
            <p className="mt-3 text-slate-600">{event.description}</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex gap-3"><span>📅</span><span><b>Date:</b> {formatDate(event.date)}</span></li>
              <li className="flex gap-3"><span>🕒</span><span><b>Time:</b> {event.time}</span></li>
              <li className="flex gap-3"><span>📍</span><span><b>Venue:</b> {event.venue}</span></li>
              <li className="flex gap-3"><span>🎟️</span><span><b>Seats:</b> {spotsLeft} of {event.capacity} left</span></li>
            </ul>
          </div>

          {/* Registration form or success message */}
          <div>
            {success ? (
              <div className="animate-pop rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-2xl text-white">✓</div>
                <h3 className="mt-4 text-xl font-bold text-emerald-800">You're registered!</h3>
                <p className="mt-1 text-sm text-emerald-700">See you at {event.title}, {form.name.split(' ')[0]}.</p>
                <button onClick={onClose} className="btn-primary mt-5">Done</button>
              </div>
            ) : spotsLeft === 0 ? (
              <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700 ring-1 ring-red-200">
                <p className="font-bold">This event is full</p>
                <p className="mt-1 text-sm">Please check out our other events.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-600">Register Now</h3>
                {field('name', 'Full Name', { placeholder: 'Aarav Sharma' })}
                {field('email', 'Email', { type: 'email', placeholder: 'aarav@college.edu' })}
                {field('phone', 'Phone (10 digits)', { type: 'tel', placeholder: '9876543210', maxLength: 10 })}
                <div className="grid grid-cols-2 gap-3">
                  {field('department', 'Department', { placeholder: 'Computer Science' })}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="year">Year</label>
                    <select id="year" name="year" value={form.year} onChange={handleChange} className={`input ${errors.year ? 'input-error' : ''}`}>
                      <option value="">Select</option>
                      {YEARS.map((y) => <option key={y}>{y}</option>)}
                    </select>
                    {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year}</p>}
                  </div>
                </div>
                {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Registering…' : 'Confirm Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
