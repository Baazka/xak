import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

type CompanyScrapeResult = {
  legal_name: string | null;
  founded_date: string | null;
  legal_form: string | null;
  address: string | null;
  activity: string | null;
  lastOwner: string | null;
  manager: string | null;
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

function extractFirstActivity($: cheerio.CheerioAPI): string | null {
  const table = $("table")
    .filter((_, el) => $(el).text().includes("Үйл ажиллагааны код"))
    .first();

  if (!table.length) return null;

  const firstRow = table.find("tbody tr").first();

  // 2 дахь багана (код + тайлбар)
  const cell = firstRow.find("td").eq(1).text();

  return cleanText(cell);
}

function extractLastOwner($: cheerio.CheerioAPI): string | null {
  let owner: string | null = null;

  $("*").each((_, el) => {
    const text = cleanText($(el).text());

    if (text === "Эцсийн өмчлөгч") {
      const section = $(el).closest("div");
      const table = section.find("table").first();

      if (!table.length) return;

      const rows = table.find("tr");

      for (let i = rows.length - 1; i >= 1; i--) {
        const cols = $(rows[i]).find("td");
        if (cols.length >= 3) {
          const name = cleanText(cols.eq(2).text());
          if (name) {
            owner = name;
            return false;
          }
        }
      }
    }
  });

  return owner;
}

function extractManager(pageText: string): string | null {
  const normalized = pageText.replace(/\s+/g, " ").trim();

  const sectionMatch = normalized.match(
    /Удирдах албан тушаалтан(.*?)(?=Үйл ажиллагаа|Эцсийн өмчлөгч|Оролцсон тендер|$)/i
  );

  const section = sectionMatch?.[1];
  if (!section) return null;

  const rowMatch = section.match(
    /Д\/д\s+Албан тушаал\s+Улс\s+Нэр\s+Огноо\s+\d+\s+(.+?)\s+Монгол Улс\s+(.+?)\s+(\d{4}-\d{2}-\d{2})/i
  );

  return cleanText(rowMatch?.[2]);
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
      "Нэр",
      "Регистер",
      "Үүсгэн байгуулагдсан",
      "Хэлбэр",
      "Төрөл",
      "Хаяг",
      "Хувь эзэмшил",
      "Хувь ззэмшил",
      "Үйл ажиллагааны чиглэл",
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

    const activity = extractFirstActivity($);
    const lastOwner = extractLastOwner($);
    const manager = extractManager(pageText);

    const result: CompanyScrapeResult = {
      legal_name: legalName,
      founded_date: foundedDate,
      legal_form: legalForm,
      address: address,
      activity: activity,
      lastOwner: lastOwner,
      manager: manager,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenDataLab scrape error:", error);
    return NextResponse.json({ error: "Failed to scrape OpenDataLab" }, { status: 500 });
  }
}
