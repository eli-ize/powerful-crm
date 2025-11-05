-- CreateTable
CREATE TABLE "user_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dailySpendingLimit" REAL DEFAULT 10.0,
    "monthlySpendingLimit" REAL DEFAULT 100.0,
    "perCallLimit" REAL DEFAULT 2.0,
    "maxCallDuration" INTEGER DEFAULT 300,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "metadata" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "user_config_userId_key" ON "user_config"("userId");
