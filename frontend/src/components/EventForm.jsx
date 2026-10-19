import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { CATEGORIES, toInputDate } from '../utils.js';
import { useToast } from './Toast.jsx';

export default function EventForm({ event, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event ? toInputDate(event.date) : '',
    time: event?.time || '',
    venue: event?.venue || '',
    category: event?.category || 'Tech',
    capacity: event?.capacity || '',
    imageUrl: event?.imageUrl || '',
    status: event?.status || 'Published',
    cancellationReason: event?.cancellationReason || '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

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

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = 'Title is required';
    if (!form.description.trim()) err.description = 'Description is required';
    if (!form.date) err.date = 'Pick an event date';
    if (!form.time.trim()) err.time = 'Enter a time, e.g. 10:00 AM';
    if (!form.venue.trim()) err.venue = 'Venue is required';
    if (!form.capacity || Number(form.capacity) < 1) err.capacity = 'Capacity must be at least 1';
    if (form.imageUrl.trim() && !/^https?:\/\//i.test(form.imageUrl.trim())) {
      err.imageUrl = 'Must start with http:// or https://';
    }
    if (form.status === 'Cancelled' && !form.cancellationReason.trim()) {
      err.cancellationReason = 'Cancellation reason is required when marking as Cancelled';
    }
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.warning('Please fix the errors in the event form.');
      return;
    }

    setSaving(true);
    try {
      const body = { ...form, capacity: Number(form.capacity) };
      if (event) {
        await api.updateEvent(event._id, body);
        onSaved('Event updated successfully');
      } else {
        await api.createEvent(body);
        onSaved('Event created successfully');
      }
    } catch (err) {
      const msg = err.message || 'Failed to save event';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className={props.wrapper || ''}>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#625078]" htmlFor={`f-${name}`}>
        {label}
      </label>
      <input
        id={`f-${name}`}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`input ${errors[name] ? 'input-error' : ''}`}
        {...props.input}
      />
      {errors[name] && <p className="mt-1 text-xs text-[#A34235]">{errors[name]}</p>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#292331]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl animate-pop space-y-4 overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E7E2E9]"
      >
        <div className="flex items-center justify-between border-b border-[#E7E2E9] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#625078]">
              {event ? 'Lifecycle Management' : 'New Event Listing'}
            </span>
            <h2 className="text-2xl font-extrabold text-[#292331]">{event ? 'Edit Event' : 'Add New Event'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-[#F7F5F0] hover:text-[#292331] transition"
          >
            ✕
          </button>
        </div>

        {field('title', 'Event Title', { input: { placeholder: 'CodeStorm Hackathon 2026' } })}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#625078]" htmlFor="f-description">
            Event Description
          </label>
          <textarea
            id="f-description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className={`input ${errors.description ? 'input-error' : ''}`}
            placeholder="What is this event about? Detail agenda, speaker info, snacks, prizes..."
          />
          {errors.description && <p className="mt-1 text-xs text-[#A34235]">{errors.description}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {field('date', 'Event Date', { input: { type: 'date' } })}
          {field('time', 'Scheduled Time', { input: { placeholder: '10:00 AM' } })}
          {field('venue', 'Campus Venue', { input: { placeholder: 'Main Auditorium, Block C' } })}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#625078]" htmlFor="f-category">
              Category
            </label>
            <select id="f-category" name="category" value={form.category} onChange={handleChange} className="input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#625078]" htmlFor="f-status">
              Lifecycle Status
            </label>
            <select id="f-status" name="status" value={form.status} onChange={handleChange} className="input">
              <option value="Published">Published (Publicly Visible)</option>
              <option value="Draft">Draft (Admin Only)</option>
              <option value="Completed">Completed (Concluded)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {field('capacity', 'Total Seat Capacity', { input: { type: 'number', min: 1, placeholder: '100' } })}
          {field('imageUrl', 'Cover Image URL (optional)', { input: { placeholder: 'https://images.unsplash.com/…' } })}
        </div>

        {form.status === 'Cancelled' && (
          <div className="rounded-2xl border border-[#A34235]/30 bg-[#A34235]/10 p-3.5 space-y-1.5 animate-fade-up">
            <label className="block text-xs font-bold text-[#A34235] uppercase" htmlFor="f-reason">
              Cancellation Reason (Broadcaster Note)
            </label>
            <textarea
              id="f-reason"
              name="cancellationReason"
              rows={2}
              value={form.cancellationReason}
              onChange={handleChange}
              placeholder="Explain why this event is being cancelled..."
              className="input !border-[#A34235]/40 text-xs"
            />
            {errors.cancellationReason && (
              <p className="text-xs text-[#A34235] font-semibold">{errors.cancellationReason}</p>
            )}
          </div>
        )}

        {serverError && (
          <div className="rounded-xl border border-[#A34235]/30 bg-[#A34235]/10 p-3 text-xs font-medium text-[#A34235]">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-[#E7E2E9]">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : event ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
