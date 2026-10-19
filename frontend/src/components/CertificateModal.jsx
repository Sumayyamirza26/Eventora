import { downloadCertificatePDF } from '../utils/generateCertificate.js';
import { formatDate } from '../utils.js';
import { useToast } from './Toast.jsx';

export default function CertificateModal({ certificate, onClose }) {
  const { toast } = useToast();
  if (!certificate) return null;

  const handleDownload = () => {
    try {
      downloadCertificatePDF({
        studentName: certificate.studentName,
        studentId: certificate.studentId,
        department: certificate.department,
        eventTitle: certificate.event?.title || 'Campus Event',
        eventCategory: certificate.event?.category || 'General',
        eventDate: formatDate(certificate.event?.date),
        venue: certificate.event?.venue || 'Campus Auditorium',
        certificateId: certificate.certificateId,
      });
      toast.success('Certificate downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292331]/75 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl animate-pop overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#E7E2E9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E7E2E9] bg-[#292331] px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#D6E59A] text-xs font-black text-[#292331]">
              ★
            </span>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-white">Official Participation Certificate</h3>
              <p className="text-[11px] text-[#E7E2E9]/80 font-mono">ID: {certificate.certificateId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Certificate Visual Preview Canvas */}
        <div className="p-6 sm:p-8 bg-[#F7F5F0]">
          <div className="relative rounded-2xl border-4 border-[#292331] bg-white p-6 sm:p-10 shadow-lg text-center overflow-hidden">
            {/* Inner Gold Frame */}
            <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#D6E59A]" />
            <div className="pointer-events-none absolute inset-3 rounded-lg border border-[#625078]/20" />

            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#625078]">
                Eventora Campus Recognition
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#292331]">
                CERTIFICATE OF PARTICIPATION
              </h2>
              <div className="mx-auto my-3 h-0.5 w-20 bg-[#D6E59A]" />

              <p className="text-xs italic text-[#625078]">This is proudly presented to</p>

              <h3 className="my-2 text-2xl font-black uppercase text-[#292331] sm:text-3xl tracking-wide">
                {certificate.studentName}
              </h3>

              <p className="font-mono text-xs text-[#625078]">
                Student Pass ID: <strong className="text-[#292331]">{certificate.studentId}</strong> · Dept: {certificate.department}
              </p>

              <p className="mx-auto mt-4 max-w-lg text-xs sm:text-sm text-[#292331]/90 leading-relaxed">
                for active participation and attendance in the campus event{' '}
                <strong className="text-[#292331]">"{certificate.event?.title}"</strong> organized at{' '}
                {certificate.event?.venue} on {formatDate(certificate.event?.date)}.
              </p>

              {/* Signatures & Seal */}
              <div className="mt-8 flex flex-wrap items-end justify-between border-t border-[#E7E2E9] pt-5 text-xs">
                <div className="text-left">
                  <div className="w-32 border-b border-[#292331] pb-1 font-semibold text-[#292331]">
                    Event Coordinator
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#625078]">Campus Affairs Committee</p>
                </div>

                <div className="my-2 sm:my-0 flex flex-col items-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#292331] bg-[#D6E59A] text-[9px] font-black text-[#292331] shadow-xs">
                    VERIFIED
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-32 border-b border-[#292331] pb-1 font-semibold text-[#292331]">
                    Dean of Student Life
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#625078]">Eventora Central Council</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7E2E9] bg-white px-6 py-4">
          <span className="font-mono text-xs text-[#625078]">
            Format: Official Printable PDF (A4 Landscape)
          </span>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn-ghost text-xs !py-2">
              Close Preview
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-[#292331] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#3d3349] transition"
            >
              <span>📥 Download PDF Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

