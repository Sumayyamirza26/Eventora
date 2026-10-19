export const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Workshop', 'Career', 'Other'];
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// Dates are stored as UTC midnight, so we format them in UTC to avoid day shifts
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const toInputDate = (date) => new Date(date).toISOString().slice(0, 10);

export const BRAND_COLORS = {
  plum: '#292331',
  porcelain: '#F7F5F0',
  white: '#FFFFFF',
  violet: '#625078',
  citron: '#D6E59A',
  lilac: '#E7E2E9',
  success: '#356548',
  warning: '#875B18',
  error: '#A34235',
  info: '#485A99',
};

export const categoryColors = {
  Tech: 'bg-[#625078]/10 text-[#625078] border border-[#625078]/25',
  Cultural: 'bg-[#292331]/10 text-[#292331] border border-[#292331]/20',
  Sports: 'bg-[#356548]/10 text-[#356548] border border-[#356548]/25',
  Workshop: 'bg-[#875B18]/10 text-[#875B18] border border-[#875B18]/25',
  Career: 'bg-[#485A99]/10 text-[#485A99] border border-[#485A99]/25',
  Other: 'bg-[#E7E2E9] text-[#292331] border border-[#E7E2E9]',
};
