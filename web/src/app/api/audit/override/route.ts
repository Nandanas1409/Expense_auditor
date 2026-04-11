import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "auditor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const submissionId = String(body.submissionId ?? "");
    const status = String(body.status ?? "").toUpperCase();
    const comment = String(body.comment ?? "").trim();

    if (!submissionId || !["APPROVED", "FLAGGED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid override payload" }, { status: 400 });
    }

    if (!comment) {
      return NextResponse.json({ error: "Comment is required for override" }, { status: 400 });
    }

    const submission = await prisma.expenseSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        auditorOverride: true,
        auditorComment: comment,
        auditorOverriddenAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
