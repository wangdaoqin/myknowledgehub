-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "recommendedScore" INTEGER NOT NULL,
    "lastVerifiedAt" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false
);
