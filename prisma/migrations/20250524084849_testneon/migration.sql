/*
  Warnings:

  - Changed the type of `loa` on the `LogisticTable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "LogisticTable" DROP COLUMN "loa",
ADD COLUMN     "loa" DOUBLE PRECISION NOT NULL;
