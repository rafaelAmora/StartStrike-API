/*
  Warnings:

  - You are about to alter the column `totalDamage` on the `PlayerMatchStats` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `kdRatio` on the `PlayerMatchStats` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `leetifyRating` on the `PlayerMatchStats` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `ctRating` on the `PlayerMatchStats` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `tRating` on the `PlayerMatchStats` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `headshotPercentage` on the `PlayerMatchStats` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `avgKd` on the `UserStatsCache` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `avgRating` on the `UserStatsCache` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `winRate` on the `UserStatsCache` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `headshotPercentage` on the `UserStatsCache` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "PlayerMatchStats" ALTER COLUMN "totalDamage" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "kdRatio" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "leetifyRating" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "ctRating" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "tRating" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "headshotPercentage" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UserStatsCache" ALTER COLUMN "avgKd" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "avgRating" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "winRate" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "headshotPercentage" SET DATA TYPE DOUBLE PRECISION;
