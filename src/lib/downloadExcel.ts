import { fetchWithAuth } from "@/lib/fetchWithAuth";

type DownloadExcelOptions = {
  endpoint: string; // ж: "/api/xakorg/export"
  filenamePrefix?: string; // ж: "xakorg"
  params?: Record<string, string | number | boolean | null | undefined>;
};

export async function downloadExcel({
  endpoint,
  filenamePrefix,
  params = {},
}: DownloadExcelOptions) {
  const qs = new URLSearchParams();

  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    qs.set(k, String(v));
  }

  const url = `${endpoint}?${qs.toString()}`;

  const res = await fetchWithAuth(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Excel татах үед алдаа гарлаа123");
  }

  const blob = await res.blob();
  const link = document.createElement("a");
  const objectUrl = window.URL.createObjectURL(blob);

  link.href = objectUrl;
  link.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
