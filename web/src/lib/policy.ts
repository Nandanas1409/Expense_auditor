import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";

let cachedPolicyText = "";

export async function getPolicyText() {
  if (cachedPolicyText) {
    return cachedPolicyText;
  }

  const policyPath = path.resolve(process.cwd(), "../dummy_policy.pdf");
  if (!fs.existsSync(policyPath)) {
    return "";
  }

  const dataBuffer = fs.readFileSync(policyPath);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  await parser.destroy();
  cachedPolicyText = data.text;
  return cachedPolicyText;
}

export function getPolicySnippet(policyText: string, category: string, context = "") {
  if (!policyText) {
    return "Policy snippet unavailable.";
  }

  const normalizedCategory = category.toLowerCase();
  const keywordsByCategory: Record<string, string[]> = {
    meals: ["meal", "breakfast", "lunch", "dinner", "entertainment", "alcohol"],
    transport: ["transport", "uber", "lyft", "flight", "ground"],
    lodging: ["lodging", "hotel", "night"],
    software: ["software", "subscription", "approval"],
  };

  const contextKeywords = context
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4)
    .slice(0, 6);

  const keywords = [...(keywordsByCategory[normalizedCategory] || [normalizedCategory]), ...contextKeywords];
  const lines = policyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const scoredLines = lines
    .map((line, index) => {
      const lowerLine = line.toLowerCase();
      const matchedKeywords = keywords.filter((keyword) => lowerLine.includes(keyword));
      const score = matchedKeywords.length;
      return { line, index, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.index - b.index;
    });

  if (scoredLines.length === 0) {
    return lines.slice(0, 4).join(" ");
  }

  return scoredLines.slice(0, 4).map((entry) => entry.line).join(" ");
}
