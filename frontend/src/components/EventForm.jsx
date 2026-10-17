import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { CATEGORIES, toInputDate } from '../utils.js';

// Used by the admin page for both "Add event" (event = null) and "Edit event"
export default function EventForm({ event, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event ? toInputDate(event.date) : '',
    time: event?.time || '',
    venue: event?.venue || '',
    category: event?.category || 'Tech',
    capacity: event?.capacity || '',
    imageUrl: event?.imageUrl || '',
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
    if (!form.date) err.date = 'Pick a date';
    if (!form.time.trim()) err.time = 'Enter a time, e.g. 10:00 AM';
    if (!form.venue.trim()) err.venue = 'Venue is required';
    if (!form.capacity || Number(form.capacity) < 1) err.capacity = 'Capacity must be at least 1';
    if (form.imageUrl.trim() && !/^https?:\/\//i.test(form.imageUrl.trim())) err.imageUrl = 'Must start with http:// or https://';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const body = { ...form, capacity: Number(form.capacity) };
      if (event) await api.updateEvent(event._id, body);
      else await api.createEvent(body);
      onSaved(event ? 'Event updated' : 'Event added');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className={props.wrapper || ''}>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={`f-${name}`}>{label}</label>
      <input id={`f-${name}`} name={name} value={form[name]} onChange={handleChange}
        className={`input ${errors[name] ? 'input-error' : ''}`} {...props.input} />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        noValidate
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl animate-pop space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">{event ? 'Edit Event' : 'Add New Event'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-xl text-slate-400 hover:text-slate-700">✕</button>
        </div>

        {field('title', 'Title', { input: { placeholder: 'Event title' } })}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="f-description">Description</label>
          <textarea id="f-description" name="description" rows={3} value={form.description} onChange={handleChange}
            className={`input ${errors.description ? 'input-error' : ''}`} placeholder="What is this event about?" />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {field('date', 'Date', { input: { type: 'date' } })}
          {field('time', 'Time', { input: { placeholder: '10:00 AM' } })}
          {field('venue', 'Venue', { input: { placeholder: 'Main Auditorium' } })}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="f-category">Category</label>
            <select id="f-category" name="category" value={form.category} onChange={handleChange} className="input">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {field('capacity', 'Capacity (seats)', { input: { type: 'number', min: 1, placeholder: '100' } })}
          {field('imageUrl', 'Image URL (optional)', { input: { placeholder: 'https://…' } })}
        </div>

        {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : event ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
