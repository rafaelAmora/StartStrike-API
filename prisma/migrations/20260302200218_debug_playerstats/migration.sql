-- DropForeignKey
ALTER TABLE "PlayerMatchStats" DROP CONSTRAINT "PlayerMatchStats_matchId_fkey";

-- AddForeignKey
ALTER TABLE "PlayerMatchStats" ADD CONSTRAINT "PlayerMatchStats_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("externalMatchId") ON DELETE CASCADE ON UPDATE CASCADE;
