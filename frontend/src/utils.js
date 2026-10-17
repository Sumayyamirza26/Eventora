export const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Workshop', 'Career', 'Other'];
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// Dates are stored as UTC midnight, so we format them in UTC to avoid day shifts
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const toInputDate = (date) => new Date(date).toISOString().slice(0, 10);

export const categoryColors = {
  Tech: 'bg-indigo-100 text-indigo-700',
  Cultural: 'bg-pink-100 text-pink-700',
  Sports: 'bg-emerald-100 text-emerald-700',
  Workshop: 'bg-amber-100 text-amber-700',
  Career: 'bg-sky-100 text-sky-700',
  Other: 'bg-slate-100 text-slate-700',
};
