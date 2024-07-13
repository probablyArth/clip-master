/*
  Warnings:

  - Added the required column `duration` to the `Videos` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Videos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "path" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Videos" ("id", "name", "path", "size", "userId") SELECT "id", "name", "path", "size", "userId" FROM "Videos";
DROP TABLE "Videos";
ALTER TABLE "new_Videos" RENAME TO "Videos";
CREATE UNIQUE INDEX "Videos_path_key" ON "Videos"("path");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
