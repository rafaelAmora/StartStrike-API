import { nodeCron } from "node-cron";
import { prisma } from "../../prisma/prisma.js";
import { recalculateUserStats } from "../api/leetifyProfile.service.js";
import {
  syncLeetifyMatches,
  syncLeetifyMatchesOnProfileFunction,
} from "../api/leetifyMatch.service.js";

nodeCron.schedule("* * * * *", async () => {
  console.log("Executando sync automática...");

  const users = await prisma.user.findMany();

  for (const user of users) {
    await syncLeetifyMatches(user.leetifyId);

    await syncLeetifyMatchesOnProfileFunction(
      user.id,
      user.leetifyId,
      user.steam64Id,
    );

    await recalculateUserStats(user.id, user.steam64Id);
  }

  console.log("Sync finalizada.");
});
