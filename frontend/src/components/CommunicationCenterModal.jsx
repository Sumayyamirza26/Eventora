import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { useToast } from './Toast.jsx';
import { formatDate } from '../utils.js';

export default function CommunicationCenterModal({ event, onClose, isAdmin = false, onUpdated }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'Announcement',
    pinned: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const { toast } = useToast();

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const data = await api.getAnnouncements(event?._id || '');
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.message || 'Could not load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [event]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.warning('Please enter both title and message');
      return;
    }

    if (!event?._id) {
      toast.warning('Target event is required to broadcast an update');
      return;
    }

    setSubmitting(true);
    try {
      await api.createAnnouncement({
        ...form,
        event: event._id,
      });
      toast.success('Announcement broadcast successfully!');
      setForm({ title: '', message: '', type: 'Announcement', pinned: false });
      setShowCompose(false);
      loadAnnouncements();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to send announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      toast.success('Announcement removed');
      loadAnnouncements();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Cancellation':
        return 'bg-[#A34235]/15 text-[#A34235] border border-[#A34235]/30';
      case 'ScheduleChange':
      case 'VenueUpdate':
        return 'bg-[#875B18]/15 text-[#875B18] border border-[#875B18]/30';
      case 'SeatAllocation':
        return 'bg-[#356548]/15 text-[#356548] border border-[#356548]/30';
      case 'Announcement':
      default:
        return 'bg-[#485A99]/15 text-[#485A99] border border-[#485A99]/30';
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
        className="w-full max-w-2xl max-h-[90vh] flex flex-col animate-pop overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#E7E2E9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E2E9] p-5 sm:p-6 bg-[#292331] text-white">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6E59A]">
              Event Communication Centre
            </span>
            <h3 className="text-xl font-bold tracking-tight">
              {event ? event.title : 'Campus Announcements'}
            </h3>
            {event && (
              <p className="text-xs text-[#E7E2E9]/80 mt-0.5">
                📅 {formatDate(event.date)} · 🕒 {event.time} · 📍 {event.venue}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && event && !showCompose && (
              <button
                type="button"
                onClick={() => setShowCompose(true)}
                className="rounded-xl bg-[#D6E59A] px-3 py-1.5 text-xs font-bold text-[#292331] hover:bg-[#c9da88] transition shadow-sm"
              >
                + Broadcast Update
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Admin Compose Form */}
          {showCompose && (
            <form onSubmit={handleCreate} className="rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-4 space-y-3 animate-fade-up">
              <div className="flex items-center justify-between border-b border-[#E7E2E9] pb-2">
                <span className="text-xs font-bold text-[#292331]">Post New Broadcast Announcement</span>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="text-xs text-[#625078] hover:text-[#292331]"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#625078] uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Venue Change or Bring Laptops"
                  className="input !py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#625078] uppercase mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input !py-2 text-xs"
                  >
                    <option value="Announcement">General Announcement</option>
                    <option value="ScheduleChange">Schedule Change</option>
                    <option value="VenueUpdate">Venue Update</option>
                    <option value="Cancellation">Cancellation Notice</option>
                  </select>
                </div>

                <div className="flex items-center pt-5 gap-2">
                  <input
                    type="checkbox"
                    id="pin-check"
                    checked={form.pinned}
                    onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                    className="h-4 w-4 rounded border-[#E7E2E9] text-[#625078] focus:ring-[#625078]"
                  />
                  <label htmlFor="pin-check" className="text-xs font-medium text-[#292331] cursor-pointer">
                    Pin to top of feed
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#625078] uppercase mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Write message details for attendees..."
                  className="input !py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="btn-ghost text-xs !py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs !py-1.5 !px-4"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          )}

          {/* Announcements Feed */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#E7E2E9]/60" />
              ))}
            </div>
          ) : loadError ? (
            <div className="py-8 text-center text-[#A34235] rounded-2xl bg-[#A34235]/10 p-4 border border-[#A34235]/20">
              <p className="text-xs font-bold">{loadError}</p>
              <button
                type="button"
                onClick={loadAnnouncements}
                className="btn-ghost mt-2 text-xs !py-1 !px-3"
              >
                Try Again
              </button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-12 text-center text-[#625078]">
              <span className="text-3xl">📢</span>
              <p className="mt-3 font-semibold text-[#292331]">No announcements yet</p>
              <p className="text-xs mt-1">
                Important updates, schedule modifications, and venue notices will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((item) => (
                <div
                  key={item._id}
                  className={`rounded-2xl border p-4 transition ${
                    item.pinned
                      ? 'border-[#625078]/40 bg-[#F7F5F0]'
                      : 'border-[#E7E2E9] bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                      {item.pinned && (
                        <span className="rounded-full bg-[#D6E59A] text-[#292331] px-2 py-0.5 text-[10px] font-bold">
                          📌 Pinned
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#625078]">
                      <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="text-[#A34235] hover:underline text-[11px] font-semibold ml-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-[#292331]">{item.title}</h4>
                  <p className="mt-1 text-xs text-[#292331]/80 leading-relaxed whitespace-pre-line">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

