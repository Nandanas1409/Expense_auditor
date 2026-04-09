-- CreateTable
CREATE TABLE "ExpenseSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchant" TEXT,
    "date" TEXT,
    "totalAmount" REAL,
    "currency" TEXT,
    "justification" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reasoning" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
