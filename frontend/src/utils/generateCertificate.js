import { jsPDF } from 'jspdf';

export function downloadCertificatePDF(certData) {
  const {
    studentName = 'Student Attendee',
    studentId = 'STU-OFFICIAL',
    department = 'Campus',
    eventTitle = 'Campus Event',
    eventCategory = 'General',
    eventDate = new Date().toLocaleDateString(),
    venue = 'Campus Auditorium',
    certificateId = 'CERT-EVENTORA',
  } = certData;

  // Create landscape A4 PDF (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // 1. Background Fill
  doc.setFillColor(247, 245, 240); // Warm Porcelain #F7F5F0
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. Outer Border (Deep Plum #292331)
  doc.setDrawColor(41, 35, 49);
  doc.setLineWidth(4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // 3. Inner Decorative Border (Soft Citron #D6E59A)
  doc.setDrawColor(214, 229, 154);
  doc.setLineWidth(1.5);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // 4. Subtle Violet Border
  doc.setDrawColor(98, 80, 120);
  doc.setLineWidth(0.5);
  doc.rect(16, 16, pageWidth - 32, pageHeight - 32);

  // 5. Header / Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(41, 35, 49); // Deep Plum
  doc.text('EVENTORA', pageWidth / 2, 34, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(98, 80, 120); // Muted Violet
  doc.text('COLLEGE EVENT HUB · OFFICIAL RECOGNITION', pageWidth / 2, 40, { align: 'center' });

  // 6. Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(41, 35, 49);
  doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 56, { align: 'center' });

  // Divider Line
  doc.setDrawColor(214, 229, 154);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, 61, pageWidth / 2 + 40, 61);

  // 7. Recipient Introduction
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(98, 80, 120);
  doc.text('This is proudly presented to', pageWidth / 2, 73, { align: 'center' });

  // 8. Student Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(41, 35, 49);
  doc.text(studentName.toUpperCase(), pageWidth / 2, 86, { align: 'center' });

  // 9. Student ID & Department
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(98, 80, 120);
  doc.text(`Student ID: ${studentId}   ·   Department: ${department}`, pageWidth / 2, 94, { align: 'center' });

  // 10. Description Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(41, 35, 49);
  const eventDesc = `for active participation in the campus event "${eventTitle}" (${eventCategory}),`;
  doc.text(eventDesc, pageWidth / 2, 110, { align: 'center' });

  const eventSub = `organized and hosted at ${venue} on ${eventDate}.`;
  doc.text(eventSub, pageWidth / 2, 118, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(98, 80, 120);
  doc.text('This certificate recognizes commendable engagement, spirit, and dedication in student campus activities.', pageWidth / 2, 128, { align: 'center' });

  // 11. Signatures & Badges Area
  const sigY = 162;

  // Left: Coordinator Signature
  doc.setDrawColor(98, 80, 120);
  doc.setLineWidth(0.5);
  doc.line(40, sigY, 95, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(41, 35, 49);
  doc.text('Event Coordinator', 67.5, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(98, 80, 120);
  doc.text('Campus Affairs Committee', 67.5, sigY + 9, { align: 'center' });

  // Center: Verified Official Badge
  doc.setDrawColor(41, 35, 49);
  doc.setFillColor(214, 229, 154);
  doc.circle(pageWidth / 2, sigY - 2, 12, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(41, 35, 49);
  doc.text('EVENTORA', pageWidth / 2, sigY - 4, { align: 'center' });
  doc.text('VERIFIED', pageWidth / 2, sigY - 1, { align: 'center' });
  doc.text('★ ★ ★', pageWidth / 2, sigY + 3, { align: 'center' });

  // Right: Dean Signature
  doc.line(pageWidth - 95, sigY, pageWidth - 40, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(41, 35, 49);
  doc.text('Dean of Student Life', pageWidth - 67.5, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(98, 80, 120);
  doc.text('Eventora Central Council', pageWidth - 67.5, sigY + 9, { align: 'center' });

  // 12. Footer Metadata (Certificate Verification ID)
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(98, 80, 120);
  doc.text(`VERIFICATION ID: ${certificateId}`, 20, 194);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`ISSUED: ${new Date().toLocaleDateString()}`, pageWidth - 20, 194, { align: 'right' });

  // Save PDF
  const safeFilename = `${studentName.replace(/\s+/g, '_')}_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
  doc.save(safeFilename);
}

