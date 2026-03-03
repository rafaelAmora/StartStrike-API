import axios from "axios";
import { AppError } from "../utils/AppError.js";
import type { LeetifyProfileResponse } from "../types/LeetifyProfileResponse.js";
import { prisma } from "../../prisma/prisma.js";


export async function syncLeetifyProfile(
  userSteamId: string,
): Promise<LeetifyProfileResponse> {
  try {
    const response = await axios.get<LeetifyProfileResponse>(
      "https://api-public.cs-prod.leetify.com/v3/profile",
      {
        params: { steam64_id: userSteamId },
        headers: {
          Authorization: `Bearer <${process.env.LEETIFY_API_KEY}>`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new AppError(
        "Perfil não encontrado no Leetify. Verifique se o Steam64 ID está correto e se a conta está vinculada.",
        404,
      );
    }

    throw new AppError(
      "Não foi possível conectar com a API do Leetify no momento.",
      502,
    );
  }
}

export async function recalculateUserStats(userId: string, steamId: string) {
  const matches = await prisma.playerMatchStats.findMany({
    where: {
      userId,
    },
  });

  const response = await syncLeetifyProfile(steamId);

  const totalMatches = matches.length;

  const totalKills = matches.reduce((acc, match) => acc + match.kills, 0);

  const totalDeaths = matches.reduce((acc, match) => acc + match.deaths, 0);

  const totalHeadshots = matches.reduce(
    (acc, match) => acc + match.headshotKills,
    0,
  );

  const avgKd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;

  const winVictory = matches.filter((match) => match.win);

  const winRate =
    totalMatches > 0 ? (winVictory.length / totalMatches) * 100 : 0;

  const headshotPercentage =
    totalKills > 0 ? (totalHeadshots / totalKills) * 100 : 0;

  const totalRating = matches.reduce(
    (acc, match) => acc + Number(match.leetifyRating),
    0,
  );

  const avgRating = matches.length > 0 ? totalRating / matches.length : 0;

  await prisma.userStatsCache.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      avgKd,
      avgRating,
      headshotPercentage,
      totalMatches,
      winRate,
      utility: response.rating.utility,
      aim: response.rating.aim,
      clutch: response.rating.clutch,
      positioning: response.rating.positioning,
    },
    update: {
      avgKd,
      avgRating,
      headshotPercentage,
      totalMatches,
      winRate,
      utility: response.rating.utility,
      aim: response.rating.aim,
      clutch: response.rating.clutch,
      positioning: response.rating.positioning,
    },
  });
}
