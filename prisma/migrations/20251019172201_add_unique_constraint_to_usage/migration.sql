/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `Usage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Usage_userId_date_key" ON "Usage"("userId", "date");
