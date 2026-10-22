import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api.js';
import { YEARS } from '../utils.js';
import { useToast } from './Toast.jsx';

export default function StudentProfileModal({ student, onClose, onUpdated }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: student?.name || '',
    phone: student?.phone || '',
    department: student?.department || 'Computer Science',
    year: student?.year || '1st Year',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.warning('Name must be at least 2 characters');
      return;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) {
      toast.warning('Phone number must be exactly 10 digits');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.updateStudentProfile(form);
      toast.success('Profile updated successfully!');
      if (onUpdated) onUpdated(res.student);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292331]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md animate-pop overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-[#E7E2E9]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E7E2E9] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#292331]">Edit Student Profile</h3>
            <p className="text-xs text-[#625078]">Update your personal and campus details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-[#F7F5F0] hover:text-[#292331] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Read-only IDs */}
          <div className="rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#625078]">Student Pass ID:</span>
              <span className="font-mono font-bold text-[#292331]">{student?.studentId || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#625078]">Email:</span>
              <span className="font-mono text-[#292331]">{student?.email || '—'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292331] mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292331] mb-1">Phone Number (10 digits)</label>
            <input
              type="tel"
              maxLength={10}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input text-xs"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292331] mb-1">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292331] mb-1">Year of Study</label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="input text-xs"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-[#A34235]/30 bg-[#A34235]/10 p-2.5 text-xs text-[#A34235]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E2E9]">
            <button type="button" onClick={onClose} className="btn-ghost text-xs !py-2">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs !py-2 !px-5">
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

