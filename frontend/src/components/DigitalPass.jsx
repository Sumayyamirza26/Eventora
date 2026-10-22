import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Calendar, Check, Clock, MapPin, Printer, X } from 'lucide-react';
import { formatDate } from '../utils.js';

export default function DigitalPass({ registration, event, onClose }) {
  const [qrUrl, setQrUrl] = useState('');

  const targetEvent = event || registration?.event || {};
  const ticketCode = registration?.ticketCode || '';
  const studentId = registration?.studentId || '';
  const isWaitlisted = registration?.status === 'Waitlisted';
  const isCheckedIn = registration?.checkedIn;

  // QR encodes a JSON payload containing both IDs so scanners get full context
  const qrPayload = JSON.stringify({
    ticketCode,
    studentId,
    name: registration?.name || '',
    event: targetEvent?.title || '',
  });

  useEffect(() => {
    if (ticketCode || studentId) {
      QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 220,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#292331',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [qrPayload]);

  const handlePrint = () => window.print();

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // silently ignore clipboard errors
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292331]/70 p-4 backdrop-blur-sm print:p-0 print:bg-white"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Digital Event Pass"
    >
      <div
        className="relative w-full max-w-md animate-pop overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#E7E2E9] print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pass Header Banner */}
        <div className="bg-[#292331] p-6 text-white relative overflow-hidden">
          {/* Decorative background rings */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/5" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 overflow-hidden place-items-center rounded-xl bg-[#292331] p-1 shadow-xs border border-white/10">
                <img src="/eventora-icon.png" alt="Eventora" className="h-full w-full object-contain rounded-lg" />
              </span>
              <span className="font-bold text-sm tracking-tight text-[#E7E2E9]">
                EVENTORA DIGITAL PASS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isCheckedIn
                    ? 'bg-[#356548] text-white'
                    : isWaitlisted
                    ? 'bg-[#875B18] text-white'
                    : 'bg-[#D6E59A] text-[#292331]'
                }`}
              >
                {isCheckedIn ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Checked In</span>
                  </>
                ) : isWaitlisted ? (
                  `Waitlist #${registration.waitlistPosition}`
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Confirmed</span>
                  </>
                )}
              </span>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-xs font-bold text-white hover:bg-white/30 transition print:hidden"
                  aria-label="Close pass"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <h3 className="mt-4 text-xl font-extrabold leading-snug line-clamp-2 text-white">
            {targetEvent.title || 'Campus Event'}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#E7E2E9]/90">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(targetEvent.date)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{targetEvent.time}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{targetEvent.venue}</span>
            </span>
          </div>
        </div>

        {/* Ticket Surface */}
        <div className="p-6">
          {/* Dashed divider (torn-ticket effect) */}
          <div className="flex items-center gap-2 -mx-6 px-6 mb-5">
            <div className="h-px flex-1 border-t border-dashed border-[#E7E2E9]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#625078]">
              Your Pass
            </span>
            <div className="h-px flex-1 border-t border-dashed border-[#E7E2E9]" />
          </div>

          {/* QR Code */}
          <div className="text-center mb-5">
            <div className="mx-auto inline-block rounded-2xl border-2 border-[#E7E2E9] bg-white p-3 shadow-sm">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR code for ticket ${ticketCode}`}
                  className="h-44 w-44 object-contain mx-auto"
                />
              ) : (
                <div className="h-44 w-44 animate-pulse bg-slate-100 rounded-xl" />
              )}
            </div>
            <p className="mt-2 text-[10px] font-medium text-[#625078]">
              Scan to verify at the entrance
            </p>
          </div>

          {/* ID Codes — prominently displayed */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Ticket Code */}
            <div className="rounded-xl border border-[#E7E2E9] bg-[#F7F5F0] p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#625078] mb-1">
                Ticket Code
              </p>
              <p className="font-mono text-xs font-bold text-[#292331] break-all">{ticketCode || '—'}</p>
              {ticketCode && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(ticketCode, 'Ticket Code')}
                  className="mt-1.5 text-[10px] text-[#625078] hover:text-[#292331] underline underline-offset-2 print:hidden"
                >
                  Copy
                </button>
              )}
            </div>

            {/* Student Pass ID */}
            <div className="rounded-xl border-2 border-[#292331]/20 bg-[#292331] p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6E59A] mb-1">
                Student Pass ID
              </p>
              <p className="font-mono text-xs font-bold text-white break-all">{studentId || '—'}</p>
              {studentId && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(studentId, 'Student ID')}
                  className="mt-1.5 text-[10px] text-[#D6E59A]/80 hover:text-[#D6E59A] underline underline-offset-2 print:hidden"
                >
                  Copy
                </button>
              )}
            </div>
          </div>

          {/* Attendee Info */}
          <div className="rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-4 text-xs space-y-2">
            <div className="flex justify-between border-b border-[#E7E2E9] pb-2">
              <span className="text-[#625078]">Attendee</span>
              <strong className="text-[#292331]">{registration?.name}</strong>
            </div>
            <div className="flex justify-between border-b border-[#E7E2E9] pb-2">
              <span className="text-[#625078]">Email</span>
              <span className="text-[#292331] font-mono text-[10px] text-right max-w-[55%] truncate">
                {registration?.email}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E7E2E9] pb-2">
              <span className="text-[#625078]">Department / Year</span>
              <span className="text-[#292331]">
                {registration?.department} · {registration?.year}
              </span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-[#625078]">Entry Status</span>
              <span className={`font-semibold ${isCheckedIn ? 'text-[#356548]' : 'text-[#625078]'}`}>
                {isCheckedIn ? (
                  `Checked in at ${new Date(registration.checkedInAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                ) : isWaitlisted ? (
                  'Pending seat release'
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-[#356548]" />
                    <span>Valid — Present at entrance</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          {isWaitlisted && (
            <div className="mt-3 rounded-xl border border-[#875B18]/30 bg-[#875B18]/10 p-3 text-xs text-[#875B18] text-left">
              <strong>Waitlist Notice:</strong> You are currently{' '}
              <strong>#{registration.waitlistPosition}</strong> in line. When a confirmed seat is
              released, this pass will automatically upgrade to Confirmed status.
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center justify-center gap-3 print:hidden">
            <button type="button" onClick={handlePrint} className="btn-ghost inline-flex items-center gap-1.5 text-xs !py-2">
              <Printer className="h-3.5 w-3.5" />
              <span>Print Pass</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-xs !py-2 !px-5"
              >
                Close Pass
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
