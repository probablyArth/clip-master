/*
  Warnings:

  - Added the required column `name` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "api_key" TEXT,
    "limit" INTEGER NOT NULL
);
INSERT INTO "new_Users" ("api_key", "id", "limit") SELECT "api_key", "id", "limit" FROM "Users";
DROP TABLE "Users";
ALTER TABLE "new_Users" RENAME TO "Users";
CREATE UNIQUE INDEX "Users_api_key_key" ON "Users"("api_key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
