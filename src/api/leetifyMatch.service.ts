import axios from "axios";
import type { LeetifyMatchResponse } from "../types/LeetifyMatchResponse.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../../prisma/prisma.js";


export async function syncLeetifyMatches(
  leetifyId: string,
): Promise<LeetifyMatchResponse> {
  try {
    const response = await axios.get<LeetifyMatchResponse>(
      "https://api-public.cs-prod.leetify.com/v3/profile/matches",
      {
        params: { id: leetifyId },
        headers: {
          Authorization: `Bearer ${process.env.LEETIFY_API_KEY}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new AppError("Nenhuma partida encontrada para este perfil.", 404);
    }

    throw new AppError("Erro ao buscar partidas no Leetify.", 502);
  }
}

export async function syncLeetifyMatchesOnProfileFunction(
  userId: string,
  leetifyId: string,
  steamId: string,
) {
  const matches = await syncLeetifyMatches(leetifyId);

  const statsToInsert = [];

  for (const match of matches) {
    const playerStats = match.stats.find(
      (player) => player.steam64_id === steamId,
    );

    if (!playerStats) continue;

    statsToInsert.push({
      assists: playerStats.total_assists,
      kills: playerStats.total_kills,
      deaths: playerStats.total_deaths,
      matchId: match.id,
      ctRating: playerStats.ct_leetify_rating,
      headshotKills: playerStats.total_hs_kills,
      headshotPercentage:
        playerStats.total_kills > 0
          ? (playerStats.total_hs_kills / playerStats.total_kills) * 100
          : 0,
      kdRatio: playerStats.kd_ratio,
      leetifyRating: playerStats.leetify_rating,
      mvps: playerStats.mvps,
      totalDamage: playerStats.total_damage,
      tRating: playerStats.t_leetify_rating,
      userId: userId,
      win: playerStats.rounds_won > playerStats.rounds_lost ? true : false,
    });
  }

  await prisma.playerMatchStats.createMany({
    data: statsToInsert,
    skipDuplicates: true,
  });
}
