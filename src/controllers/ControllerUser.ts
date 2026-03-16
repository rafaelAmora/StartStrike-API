import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/prisma.js";
import { AppError } from "../utils/AppError.js";
import { hash } from "bcrypt";

import {
  recalculateUserStats,
  syncLeetifyProfile,
} from "../api/leetifyProfile.service.js";

import {
  syncLeetifyMatches,
  syncLeetifyMatchesOnProfileFunction,
} from "../api/leetifyMatch.service.js";

interface MapsPerformance {
  map: string;
  winRate: number;
  matches: number;
}

export class ControllerUser {
  async create(req: Request, res: Response) {
    const userSchema = z.object({
      name: z.string().min(3, {
        message: "O nome deve ter pelo menos 3 caracteres.",
      }),

      email: z.email({
        message: "Informe um endereço de e-mail válido.",
      }),

      password: z.string().min(8, {
        message: "A senha deve conter no mínimo 8 caracteres.",
      }),

      steam64Id: z.string().min(17, {
        message: "Informe um Steam64 ID válido.",
      }),
    });

    const { name, email, password, steam64Id } = userSchema.parse(req.body);

    const existsUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { steam64Id }],
      },
    });

    if (existsUser) {
      throw new AppError(
        "Já existe uma conta cadastrada com este e-mail ou Steam ID.",
        409,
      );
    }

    const leetifyProfile = await syncLeetifyProfile(steam64Id);

    const passwordHashed = await hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        steam64Id,
        password: passwordHashed,
        leetifyId: leetifyProfile.id,
      },
    });

    await syncLeetifyMatches(leetifyProfile.id);

    return res.status(201).json({
      message: "Conta criada com sucesso! 🎉",
    });
  }

  async syncProfile(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const leetifyProfile = await syncLeetifyProfile(user.steamId);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        leetifyId: leetifyProfile.id,
      },
    });

    return res.status(200).json({
      message: "Perfil sincronizado com o Leetify com sucesso 🚀",
    });
  }

  async syncMatches(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    if (!user.leetifyId) {
      throw new AppError(
        "O usuário ainda não está sincronizado com o Leetify.",
        400,
      );
    }

    await syncLeetifyMatches(user.leetifyId);

    return res.status(200).json({
      message: "Partidas sincronizadas com sucesso 🚀",
    });
  }

  async syncLeetifyMatchesOnProfile(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    if (!user.leetifyId) {
      throw new AppError(
        "O usuário ainda não está sincronizado com o Leetify.",
        400,
      );
    }

    await syncLeetifyMatchesOnProfileFunction(
      user.id,
      user.leetifyId,
      user.steamId,
    );

    await recalculateUserStats(user.id, user.steamId);

    return res.status(200).json({
      message: "Dados das partidas sincronizados com sucesso 🚀",
    });
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const bodySchema = z.object({
      email: z.email().optional(),
      name: z.string().optional(),
      password: z.string().min(8).optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const { email, name, password } = bodySchema.parse(req.body);

    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (userId !== user.id) {
      throw new AppError(
        "Você não tem permissão para atualizar outro usuário.",
        403,
      );
    }

    if (email) {
      const userExistsWithEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (userExistsWithEmail && userExistsWithEmail.id !== user.id) {
        throw new AppError(
          "Já existe uma conta cadastrada com este e-mail.",
          409,
        );
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        ...(email !== undefined && { email }),
        ...(name !== undefined && { name }),
        ...(password !== undefined && {
          password: await hash(password, 10),
        }),
      },
    });

    return res.status(200).json({
      message: "Dados do usuário atualizados com sucesso.",
    });
  }

  async getMe(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        steam64Id: true,
        leetifyId: true,
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return res.json(user);
  }

  async getMeStats(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const userStats = await prisma.userStatsCache.findUnique({
      where: { userId },
      select: {
        userId: true,
        aim: true,
        avgKd: true,
        avgRating: true,
        clutch: true,
        headshotPercentage: true,
        positioning: true,
        totalMatches: true,
        utility: true,
        winRate: true,
      },
    });

    if (!userStats) {
      throw new AppError(
        "Estatísticas ainda não foram geradas para este usuário.",
        404,
      );
    }

    return res.json(userStats);
  }

  async getMeMatches(req: Request, res: Response) {
    const userId = req.user?.id;

    const page = Number(req.query.page) || 1;

    const limit = 5;

    if (!userId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const countMatches = await prisma.playerMatchStats.count({
      where: {
        userId,
      },
    });

    if (countMatches === 0) {
      throw new AppError("Nenhuma partida encontrada");
    }

    const userMatches = await prisma.playerMatchStats.findMany({
      where: { userId },
      include: {
        match: true,
      },
      orderBy: {
        match: {
          finishedAt: "desc",
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.json({
      data: userMatches,
      pagination: {
        currentPage: page,
        lastPage: page - 1,
        total: countMatches,
        perPage: limit,
      },
    });
  }

  async getMeMatch(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramsSchema.parse(req.params);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const userMatch = await prisma.playerMatchStats.findFirst({
      where: {
        userId,
        matchId: id,
      },
      include: {
        match: true,
      },
    });

    if (!userMatch) {
      throw new AppError(
        "A partida não foi encontrada ou não pertence a este usuário.",
        404,
      );
    }

    return res.json(userMatch);
  }

  async getMeMapsPerformance(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    // Busca todas as partidas do usuário com o mapa
    const playerMatches = await prisma.playerMatchStats.findMany({
      where: { userId },
      select: {
        win: true,
        match: {
          select: { mapName: true },
        },
      },
    });

    // Agrupa por mapa e calcula winRate
    const mapsMap = new Map<string, { wins: number; matches: number }>();

    for (const playerMatch of playerMatches) {
      const mapName = playerMatch.match.mapName;
      const current = mapsMap.get(mapName) ?? { wins: 0, matches: 0 };

      mapsMap.set(mapName, {
        wins: current.wins + (playerMatch.win ? 1 : 0),
        matches: current.matches + 1,
      });
    }

    // Formata a resposta
    const mapsPerformance = Array.from(mapsMap.entries()).map(
      ([map, data]) => ({
        map,
        matches: data.matches,
        winRate: parseFloat(((data.wins / data.matches) * 100).toFixed(2)),
      }),
    );

    return res.json(mapsPerformance);
  }

  async getUsersStats(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const usersStats = await prisma.userStatsCache.findMany({
      select: {
        userId: true,
        aim: true,
        avgKd: true,
        avgRating: true,
        clutch: true,
        headshotPercentage: true,
        positioning: true,
        totalMatches: true,
        utility: true,
        winRate: true,
      },
    });

    return res.json(usersStats);
  }
}
