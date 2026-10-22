import { useState } from 'react';
import { Check, CheckCircle2, X } from 'lucide-react';
import { api } from '../api.js';
import { useToast } from './Toast.jsx';
import { formatDate } from '../utils.js';

export default function TicketVerifierModal({ onClose, onCheckInComplete }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const { toast } = useToast();

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!code.trim()) {
      toast.warning('Please enter a ticket code or student pass ID');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setLookupResult(null);

    try {
      const data = await api.getTicket(code.trim());
      setLookupResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Ticket not found');
      toast.error(err.message || 'Ticket not found');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!lookupResult) return;
    setLoading(true);

    try {
      const res = await api.checkIn({ ticketCode: lookupResult.ticketCode });
      toast.success(res.message);
      setLookupResult(res.registration);
      if (onCheckInComplete) onCheckInComplete();
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoCheckIn = async () => {
    if (!lookupResult) return;
    setLoading(true);

    try {
      const res = await api.undoCheckIn({ ticketCode: lookupResult.ticketCode });
      toast.info(res.message);
      setLookupResult(res.registration);
      if (onCheckInComplete) onCheckInComplete();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setLookupResult(null);
    setErrorMsg('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292331]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg animate-pop overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-[#E7E2E9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E2E9] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#292331] text-white font-black text-sm shadow-sm">
              QR
            </span>
            <div>
              <h3 className="font-bold text-base text-[#292331]">Digital Ticket Verifier</h3>
              <p className="text-xs text-[#625078]">Enter ticket code or student pass ID to check in</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-[#F7F5F0] hover:text-[#292331] transition"
            aria-label="Close verifier"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleVerify} className="mt-4 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. EVT-A3B7-XK9Q or STU-C1D2-E3F4"
            className="input font-mono uppercase text-sm"
            autoFocus
          />
          {code && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 rounded-xl border border-[#E7E2E9] px-3 text-xs font-semibold text-[#625078] hover:bg-[#F7F5F0] transition"
            >
              Clear
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary shrink-0 text-xs !py-2.5 !px-5">
            {loading ? 'Verifying…' : 'Verify Pass'}
          </button>
        </form>

        <p className="mt-2 text-[11px] text-[#625078]">
          Accepts: Ticket Code (EVT-… / WTL-…) or Student Pass ID (STU-…)
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-[#A34235]/30 bg-[#A34235]/10 p-3 text-xs text-[#A34235] font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Verification Result Card */}
        {lookupResult && (
          <div className="mt-5 rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-4 text-xs space-y-3 animate-fade-up">
            {/* Code header */}
            <div className="flex items-center justify-between border-b border-[#E7E2E9] pb-2.5 gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {lookupResult.ticketCode && (
                    <span className="font-mono font-bold text-xs text-[#292331] bg-white border border-[#E7E2E9] rounded-lg px-2 py-0.5">
                      {lookupResult.ticketCode}
                    </span>
                  )}
                  {lookupResult.studentId && (
                    <span className="font-mono font-bold text-xs text-white bg-[#292331] rounded-lg px-2 py-0.5">
                      {lookupResult.studentId}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  lookupResult.checkedIn
                    ? 'bg-[#356548] text-white'
                    : lookupResult.status === 'Waitlisted'
                    ? 'bg-[#875B18] text-white'
                    : 'bg-[#D6E59A] text-[#292331]'
                }`}
              >
                {lookupResult.checkedIn ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>Checked In</span>
                  </span>
                ) : lookupResult.status === 'Waitlisted' ? (
                  `Waitlist #${lookupResult.waitlistPosition}`
                ) : (
                  'Confirmed Pass'
                )}
              </span>
            </div>

            {/* Attendee details */}
            <div className="space-y-1.5 text-[#292331]">
              <p><strong>Attendee:</strong> {lookupResult.name} ({lookupResult.email})</p>
              <p><strong>Dept / Year:</strong> {lookupResult.department} · {lookupResult.year}</p>
              <p><strong>Event:</strong> {lookupResult.event?.title || '—'}</p>
              <p><strong>Venue & Time:</strong> {lookupResult.event?.venue} · {lookupResult.event?.time}</p>
              {lookupResult.checkedIn && lookupResult.checkedInAt && (
                <p className="text-[#356548] font-bold pt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Checked in at: {new Date(lookupResult.checkedInAt).toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="border-t border-[#E7E2E9] pt-3 flex justify-end gap-2">
              {lookupResult.checkedIn ? (
                <button
                  type="button"
                  onClick={handleUndoCheckIn}
                  disabled={loading}
                  className="rounded-xl border border-[#A34235]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#A34235] hover:bg-red-50 transition"
                >
                  Undo Check-in
                </button>
              ) : lookupResult.status === 'Confirmed' ? (
                <button
                  type="button"
                  onClick={handleConfirmCheckIn}
                  disabled={loading}
                  className="rounded-xl bg-[#356548] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2b533b] transition"
                >
                  {loading ? (
                    'Confirming…'
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <span>Confirm Check-in</span>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              ) : (
                <span className="text-xs text-[#875B18] font-semibold">
                  Cannot check in: Student is on Waitlist
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 border-t border-[#E7E2E9] pt-3 flex justify-end">
          <button type="button" onClick={onClose} className="btn-ghost text-xs !py-1.5">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
