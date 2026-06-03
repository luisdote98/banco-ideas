-- CreateTable
CREATE TABLE "idea_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "idea_history_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ideas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "nextStep" TEXT,
    "type" TEXT NOT NULL DEFAULT 'IDEA',
    "scorePotential" INTEGER NOT NULL DEFAULT 5,
    "scoreEffort" INTEGER NOT NULL DEFAULT 5,
    "scoreInterest" INTEGER NOT NULL DEFAULT 5,
    "categoryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "aiSummary" TEXT,
    "aiSuggestedTags" TEXT,
    "aiScore" REAL,
    "aiProcessedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ideas_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ideas" ("categoryId", "createdAt", "description", "id", "nextStep", "scoreEffort", "scoreInterest", "scorePotential", "status", "title", "updatedAt") SELECT "categoryId", "createdAt", "description", "id", "nextStep", "scoreEffort", "scoreInterest", "scorePotential", "status", "title", "updatedAt" FROM "ideas";
DROP TABLE "ideas";
ALTER TABLE "new_ideas" RENAME TO "ideas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
