export type DateFormatType = "date" | "datetime" | "time" | "iso" | "short" | "full";

function parseDate(v?: string | number | Date): Date | null {
  if (!v) return null;

  if (v instanceof Date) {
    return isNaN(v.getTime()) ? null : v;
  }

  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  const s = v.trim();
  if (!s) return null;

  // 2026.05.05 10:22:48
  let m = s.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (m) {
    const [, y, mo, d, h = "0", mi = "0", sec = "0"] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(sec));
  }

  // 21/05/2026
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d));
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDate(v?: string | number | Date, type: DateFormatType = "date") {
  const date = parseDate(v);
  if (!date) return "";

  switch (type) {
    case "datetime":
    case "full":
      return date.toLocaleString("mn-MN");

    case "time":
      return date.toLocaleTimeString("mn-MN", {
        hour: "2-digit",
        minute: "2-digit",
      });

    case "iso":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;

    case "short":
      return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(
        2,
        "0"
      )}`;

    case "date":
    default:
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
        date.getDate()
      ).padStart(2, "0")}`;
  }
}
