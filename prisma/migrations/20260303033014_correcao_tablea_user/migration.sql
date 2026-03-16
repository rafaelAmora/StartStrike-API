/*
  Warnings:

  - Made the column `leetifyId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "leetifyId" SET NOT NULL;
