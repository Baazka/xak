export function formatDate(v?: string | number | Date) {
  if (!v) return "";

  const date = new Date(v);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleString("mn-MN");
}
