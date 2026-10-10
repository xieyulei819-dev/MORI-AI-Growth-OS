import { describe, expect, it } from "vitest";

import {
  CsvValidationError,
  parseCampaignCsv,
  parseCsv,
  parseNumber,
  rowsToCsv,
} from "@/lib/csv";

const HEADER = "date,platform,campaign,creative,spend,impressions,clicks,conversions,revenue";

describe("CSV parser", () => {
  it("parses quoted fields, escaped quotes, CRLF and a BOM", () => {
    const raw =
      '\uFEFFdate,platform,campaign,creative,spend,impressions,clicks,conversions,revenue\r\n2026-09-01,抖音,"计划, A","素材 ""A""",100,1000,10,1,320\r\n';
    const table = parseCsv(raw);
    expect(table).toHaveLength(2);
    expect(table[1][2]).toBe("计划, A");
    expect(table[1][3]).toBe('素材 "A"');
    expect(table[1][4]).toBe("100");
  });

  it("normalises currency, thousands separators and percentages in numbers", () => {
    expect(parseNumber("¥1,234.50")).toBe(1234.5);
    expect(parseNumber(" 12 ")).toBe(12);
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
});

describe("campaign CSV validation", () => {
  it("maps valid rows and computes the date range", () => {
    const csv = `${HEADER}\n2026-09-01,抖音,计划A,素材A,1000,100000,2000,80,3200\n2026-09-05,小红书,计划B,素材B,500,50000,900,27,1200`;
    const result = parseCampaignCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.dateRange).toEqual({ start: "2026-09-01", end: "2026-09-05" });
    expect(result.platforms).toEqual(["抖音", "小红书"]);
    expect(result.creatives).toEqual(["素材A", "素材B"]);
    expect(result.issues).toHaveLength(0);
  });

  it("accepts Chinese headers and alternative column names", () => {
    const csv = '日期,平台,广告计划,素材名称,花费,曝光,点击,转化,收入\n2026/09/01,抖音,中文计划,中文素材,"¥1,200",50000,900,30,3600';
    const result = parseCampaignCsv(csv);
    expect(result.rows[0].platform).toBe("抖音");
    expect(result.rows[0].spend).toBe(1200);
    expect(result.rows[0].impressions).toBe(50_000);
    expect(result.rows[0].date).toBeInstanceOf(Date);
  });

  it("throws EMPTY_FILE for empty input", () => {
    expect(() => parseCampaignCsv("   ")).toThrowError(CsvValidationError);
    try {
      parseCampaignCsv("");
    } catch (error) {
      expect((error as CsvValidationError).code).toBe("EMPTY_FILE");
    }
  });

  it("throws MISSING_COLUMNS and lists every missing field", () => {
    try {
      parseCampaignCsv("date,platform,campaign,creative\n2026-09-01,抖音,计划,素材");
      throw new Error("should have thrown");
    } catch (error) {
      const csvError = error as CsvValidationError;
      expect(csvError.code).toBe("MISSING_COLUMNS");
      expect(csvError.message).toContain("spend");
      expect(csvError.issues).toHaveLength(5);
    }
  });

  it("throws NO_DATA_ROWS when every row fails to parse", () => {
    try {
      parseCampaignCsv(`${HEADER}\nnot-a-date,抖音,计划,素材,1000,1000,10,1,100`);
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as CsvValidationError).code).toBe("NO_DATA_ROWS");
    }
  });

  it("treats missing numbers as 0 with a warning and skips broken rows", () => {
    const csv = `${HEADER}\n2026-09-01,抖音,计划A,素材A,,30000,500,20,2400\n2026-09-02,抖音,计划B,,300,30000,500,20,2400`;
    const result = parseCampaignCsv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].spend).toBe(0);
    expect(result.skippedRows).toBe(1);
    expect(result.issues.some((issue) => issue.column === "spend" && issue.severity === "warning")).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes("creative"))).toBe(true);
  });

  it("warns on impossible funnel relationships without crashing", () => {
    const csv = `${HEADER}\n2026-09-01,抖音,计划A,素材A,100,1000,10,1,320\n2026-09-02,抖音,计划A,素材A2,100,0,50,60,320\n2026-09-03,抖音,计划A,素材A3,100,30,50,60,320`;
    const result = parseCampaignCsv(csv);
    const messages = result.issues.map((issue) => issue.message).join(" | ");
    expect(messages).toContain("曝光为 0");
    expect(messages).toContain("点击数大于曝光数");
    expect(messages).toContain("转化数大于点击数");
    expect(result.rows).toHaveLength(3);
  });

  it("round-trips rows back to CSV", () => {
    const rows = [
      {
        date: "2026-09-01",
        platform: "抖音",
        campaign: "计划, A",
        creative: '素材 "B"',
        spend: 100,
        impressions: 1000,
        clicks: 10,
        conversions: 1,
        revenue: 320,
      },
    ];
    const csv = rowsToCsv(rows);
    const parsed = parseCampaignCsv(csv);
    expect(parsed.rows[0].campaign).toBe("计划, A");
    expect(parsed.rows[0].creative).toBe('素材 "B"');
  });
});
