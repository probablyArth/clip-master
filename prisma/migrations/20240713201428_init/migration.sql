-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api_key" TEXT
);

-- CreateTable
CREATE TABLE "Videos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_api_key_key" ON "Users"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "Videos_path_key" ON "Videos"("path");
