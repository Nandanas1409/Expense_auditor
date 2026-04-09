import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import { buildAuditFacts, runDeterministicAudit } from "@/lib/audit/deterministicEngine";
import { getPolicySnippet, getPolicyText } from "@/lib/policy";
import { SESSION_COOKIE } from "@/lib/auth";

type ExtractionResult = {
  merchant: string;
  totalAmount: number;
  currency: string;
  receiptDate: string;
  isReadable: boolean;
  lineItems: string[];
};

const prisma = new PrismaClient();

function parseNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number.parseFloat(value);
  }
  return Number.NaN;
}

function normalizeDateString(input: string) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().split("T")[0];
}

function extractJson(content: string) {
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();

  try {
    return JSON.parse(cleaned) as Partial<ExtractionResult>;
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new Error("Receipt extraction format was invalid.");
    }
    return JSON.parse(objectMatch[0]) as Partial<ExtractionResult>;
  }
}

function receiptDayOfWeek(dateText: string) {
  const normalized = normalizeDateString(dateText);
  if (!normalized) {
    return "UNKNOWN";
  }
  const day = new Date(normalized).getUTCDay();
  const labels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return labels[day] ?? "UNKNOWN";
}

export async function POST(req: NextRequest) {
  try {
    const role = req.cookies.get(SESSION_COOKIE)?.value;
    if (role !== "employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("file");
    const justification = String(formData.get("justification") ?? "").trim();
    const employeeName = String(formData.get("employeeName") ?? "Unknown Employee").trim();
    const claimedDate = String(formData.get("claimedDate") ?? "").trim();
    const expenseCategory = String(formData.get("expenseCategory") ?? "OTHER").trim().toUpperCase();
    const location = String(formData.get("location") ?? "").trim();
    const seniority = String(formData.get("seniority") ?? "IC").trim().toUpperCase();

    if (!(imageFile instanceof File) || !justification || !claimedDate || !location) {
      return NextResponse.json(
        { error: "Missing file, justification, claimed date, or location" },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    const localImageUrl = `/uploads/${uniqueFileName}`;

    const base64Image = buffer.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is not set.");
    }

    const policyText = await getPolicyText();
    const policySnippet = getPolicySnippet(policyText, expenseCategory.toLowerCase(), justification);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const extractionPrompt = `You are extracting receipt data for expense auditing.
Return ONLY valid JSON in this exact shape:
{
  "merchant": "string",
  "totalAmount": 0,
  "currency": "USD",
  "receiptDate": "YYYY-MM-DD",
  "isReadable": true,
  "lineItems": ["item 1", "item 2"]
}
Rules:
- If unreadable, set isReadable false and provide best-effort values.
- receiptDate must be YYYY-MM-DD if inferable, else empty string.
- totalAmount must be numeric.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: extractionPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `Business purpose: ${justification}` },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No extraction response from Groq.");
    }

    let extracted: Partial<ExtractionResult>;
    try {
      extracted = extractJson(responseContent);
    } catch {
      extracted = {
        merchant: "Unknown Merchant",
        totalAmount: 0,
        currency: "USD",
        receiptDate: "",
        isReadable: false,
        lineItems: [],
      };
    }
    const totalAmount = parseNumber(extracted.totalAmount);
    const normalizedClaimedDate = normalizeDateString(claimedDate);
    const normalizedReceiptDate = normalizeDateString(String(extracted.receiptDate ?? ""));
    const normalizedLineItems = Array.isArray(extracted.lineItems)
      ? extracted.lineItems.map((item) => String(item))
      : [];

    const lineText = `${normalizedLineItems.join(" ")} ${justification}`.toLowerCase();

    const isClientDinner = /client dinner|client entertainment|client meeting/.test(
      justification.toLowerCase()
    );
    const safeAmount = Number.isFinite(totalAmount) ? totalAmount : 0;

    const facts = buildAuditFacts({
      amount: safeAmount,
      category: expenseCategory,
      location,
      seniority,
      receiptReadable: Boolean(extracted.isReadable ?? false),
      dateMatchesClaim:
        Boolean(normalizedClaimedDate) &&
        Boolean(normalizedReceiptDate) &&
        normalizedClaimedDate === normalizedReceiptDate,
      containsAlcohol: /beer|wine|whisky|whiskey|vodka|alcohol|cocktail/.test(lineText),
      containsPremiumTransport: /uber black|lyft lux|black car/.test(lineText),
      isClientDinner,
      businessPurposeContains: justification,
      receiptDayOfWeek: receiptDayOfWeek(normalizedReceiptDate),
      lineItemCount: normalizedLineItems.length,
    });

    const deterministicResult = runDeterministicAudit(facts);

    const failedMessages = deterministicResult.failedRules.map((rule) => `${rule.ruleId}: ${rule.message}`);
    const reasoning =
      failedMessages.length > 0
        ? failedMessages.slice(0, 2).join(" ")
        : "Approved: extracted receipt details comply with applicable policy constraints.";

    const submission = await prisma.expenseSubmission.create({
      data: {
        merchant: String(extracted.merchant ?? "Unknown Merchant"),
        employeeName,
        date: normalizedReceiptDate || null,
        claimedDate: normalizedClaimedDate || claimedDate,
        expenseCategory,
        location,
        seniority,
        totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
        currency: String(extracted.currency ?? "USD"),
        justification,
        status: deterministicResult.status,
        reasoning,
        policySnippet,
        policyRuleResults: JSON.stringify(deterministicResult.ruleResults),
        extractedData: JSON.stringify({
          merchant: String(extracted.merchant ?? ""),
          totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
          currency: String(extracted.currency ?? "USD"),
          receiptDate: normalizedReceiptDate,
          lineItems: normalizedLineItems,
          policyVersion: deterministicResult.policyVersion,
        }),
        receiptReadable: facts.receiptReadable,
        imageUrl: localImageUrl,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
