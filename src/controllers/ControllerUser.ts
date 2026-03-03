import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/prisma.js";
import { AppError } from "../utils/AppError.js";
import { hash } from "bcrypt";
import { recalculateUserStats, syncLeetifyProfile } from "../api/leetifyProfile.service.js";
import {
  syncLeetifyMatches,
  syncLeetifyMatchesOnProfileFunction,
} from "../api/leetifyMatch.service.js";

export class ControllerUser {
  async create(req: Request, res: Response) {
    const userSchema = z.object({
      name: z
        .string()
        .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),

      email: z.email({ message: "Informe um endereço de e-mail válido." }),

      password: z
        .string()
        .min(8, { message: "A senha deve conter no mínimo 8 caracteres." }),

      steam64Id: z
        .string()
        .min(17, { message: "Informe um Steam64 ID válido." }),
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

    const matches = await syncLeetifyMatches(leetifyProfile.id);

    for (const match of matches) {
      const matchExists = await prisma.match.findUnique({
        where: {
          externalMatchId: match.id,
        },
      });

      if (matchExists) continue; // caso exista, pula a criação

      await prisma.match.create({
        data: {
          externalMatchId: match.id,
          finishedAt: new Date(match.finished_at),
          mapName: match.map_name,
          team1Score: match.team_scores[0]?.score ?? 0,
          team2Score: match.team_scores[1]?.score ?? 0,
        },
      });
    }

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

    try {
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
    } catch (error) {
      throw new AppError(
        "Erro ao atualizar os dados do usuário durante a sincronização.",
        500,
      );
    }
  }

  async syncMatches(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      throw new AppError("Usuário não autenticado.", 401);
    }
    if (!user.leetifyId) {
      throw new AppError("Usuário não sincronizado", 401);
    }

    const matches = await syncLeetifyMatches(user.leetifyId);

    for (const match of matches) {
      const matchExists = await prisma.match.findUnique({
        where: {
          externalMatchId: match.id,
        },
      });

      if (matchExists) continue; // caso exista, pula a criação

      await prisma.match.create({
        data: {
          externalMatchId: match.id,
          finishedAt: new Date(match.finished_at),
          mapName: match.map_name,
          team1Score: match.team_scores[0]?.score ?? 0,
          team2Score: match.team_scores[1]?.score ?? 0,
        },
      });
    }
    return res.status(200).json({
      message: "Partidas sincronizadas com o Leetify com sucesso 🚀",
    });
  }

  async syncLeetifyMatchesOnProfile(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      throw new AppError("Usuário não autenticado.", 401);
    }
    if (!user.leetifyId) {
      throw new AppError("Usuário não sincronizado", 401);
    }

    await syncLeetifyMatchesOnProfileFunction(user.id, user.leetifyId, user.steamId);

    await recalculateUserStats(user.id,user.steamId)

    return res.status(200).json({
      message: "dados da partidas sincronizadas com o Leetify com sucesso 🚀",
    });
  }
}
