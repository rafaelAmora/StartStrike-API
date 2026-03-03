/*
  Warnings:

  - Added the required column `aim` to the `UserStatsCache` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clutch` to the `UserStatsCache` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positioning` to the `UserStatsCache` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utility` to the `UserStatsCache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserStatsCache" ADD COLUMN     "aim" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "clutch" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "positioning" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "utility" DOUBLE PRECISION NOT NULL;
