import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

type CompanyScrapeResult = {
  // url: string;
  register_no: string | null;
  legal_name: string | null;
  // founded_at: string | null;
  // address: string | null;
  // raw_text?: string;
};

function cleanText(value?: string | null): string | null {
  const v = value?.replace(/\s+/g, " ").trim();
  return v ? v : null;
}

function extractByLabel($: cheerio.CheerioAPI, labelVariants: string[]): string | null {
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  for (const label of labelVariants) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      `${escaped}\\s*[:：]?\\s*(.{1,200}?)\\s(?=[A-ZА-ЯӨҮЁ][^\\s]{1,40}\\s*[:：]|$)`,
      "i"
    );
    const m = bodyText.match(re);
    if (m?.[1]) return cleanText(m[1]);
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

    // 1. legal name
    const legalName = pickFirstMeaningful([
      $("h1").first().text(),
      $("h2").first().text(),
      $(".text-h4").first().text(),
      $(".text-h5").first().text(),
      title?.split("|")[0],
      pageText.match(/^(.{2,120}?)\s+2672138/)?.[1], // loose fallback
    ]);

    // 2. register no
    const registerNo = pickFirstMeaningful([
      extractByLabel($, ["Регистр", "Регистрийн дугаар"]),
      pageText.match(/\b\d{7,10}\b/)?.[0],
      register,
    ]);

    // 3. founded date
    const foundedAt = pickFirstMeaningful([
      extractByLabel($, ["Үүсгэн байгуулагдсан", "Бүртгүүлсэн огноо"]),
      pageText.match(/\b(19|20)\d{2}-\d{2}-\d{2}\b/)?.[0],
    ]);

    // 4. address
    const address = pickFirstMeaningful([
      extractByLabel($, ["Хаяг", "Албан ёсны хаяг"]),
      undefined,
    ]);

    const result: CompanyScrapeResult = {
      // url,
      register_no: registerNo,
      legal_name: legalName,
      // founded_at: foundedAt,
      // address,
      // raw_text: pageText.slice(0, 4000),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenDataLab scrape error:", error);
    return NextResponse.json({ error: "Failed to scrape OpenDataLab" }, { status: 500 });
  }
}
