import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

type CompanyScrapeResult = {
  legal_name: string | null;
  founded_date: string | null;
  legal_form: string | null;
  address: string | null;
};

function cleanText(value?: string | null): string | null {
  const v = value?.replace(/\s+/g, " ").trim();
  return v ? v : null;
}

function normalizeCompanyName(value?: string | null): string | null {
  const v = cleanText(value);
  if (!v) return null;

  return v
    .replace(/^Opendatalab\.mn\s*[-|–—]\s*/i, "")
    .replace(/\s*[-|–—]\s*Opendatalab\.mn$/i, "")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFieldByLabels(
  pageText: string,
  targetLabels: string[],
  allLabels: string[]
): string | null {
  const normalized = pageText.replace(/\s+/g, " ").trim();

  for (const label of targetLabels) {
    const escapedLabel = escapeRegExp(label);

    const otherLabels = allLabels.filter((l) => !targetLabels.includes(l)).map(escapeRegExp);

    const nextLabelsPattern = otherLabels.length
      ? `(?=\\s(?:${otherLabels.join("|")})\\s*[:：]?|$)`
      : "$";

    const re = new RegExp(`${escapedLabel}\\s*[:：]?\\s*(.+?)${nextLabelsPattern}`, "i");

    const m = normalized.match(re);
    if (m?.[1]) {
      return cleanText(m[1]);
    }
  }

  return null;
}

function extractDateByLabel(pageText: string, labels: string[]): string | null {
  const normalized = pageText.replace(/\s+/g, " ").trim();

  for (const label of labels) {
    const escaped = escapeRegExp(label);
    const m = normalized.match(new RegExp(`${escaped}\\s*[:：]?\\s*(\\d{4}-\\d{2}-\\d{2})`, "i"));
    if (m?.[1]) return m[1];
  }

  return null;
}

function pickFirstMeaningful(values: Array<string | null | undefined>): string | null {
  for (const v of values) {
    const cleaned = cleanText(v);
    if (cleaned) return cleaned;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const register = req.nextUrl.searchParams.get("register")?.trim();

    if (!register) {
      return NextResponse.json({ error: "register query param required" }, { status: 400 });
    }

    const url = `https://www.opendatalab.mn/search/${encodeURIComponent(register)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        "Accept-Language": "mn,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `OpenDataLab responded ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const pageText = $("body").text().replace(/\s+/g, " ").trim();
    const title = cleanText($("title").text());

    const knownLabels = [
      "Шинэчлэгдсэн огноо",
      "Нэр",
      "Регистер",
      "Үүсгэн байгуулагдсан",
      "Хэлбэр",
      "Хаяг",
    ];

    const legalName = pickFirstMeaningful([
      normalizeCompanyName($("h1").first().text()),
      normalizeCompanyName($("h2").first().text()),
      normalizeCompanyName($(".text-h4").first().text()),
      normalizeCompanyName($(".text-h5").first().text()),
      normalizeCompanyName(title?.split("|")[0]),
    ]);

    const foundedDate = pickFirstMeaningful([
      extractDateByLabel(pageText, ["Үүсгэн байгуулагдсан"]),
    ]);

    const legalForm = extractFieldByLabels(pageText, ["Хэлбэр"], knownLabels);
    const address = extractFieldByLabels(pageText, ["Хаяг"], knownLabels);

    const result: CompanyScrapeResult = {
      legal_name: legalName,
      founded_date: foundedDate,
      legal_form: legalForm,
      address: address,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenDataLab scrape error:", error);
    return NextResponse.json({ error: "Failed to scrape OpenDataLab" }, { status: 500 });
  }
}
