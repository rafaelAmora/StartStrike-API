import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/prisma.js";
import { AppError } from "../utils/AppError.js";
import { compare } from "bcrypt";
import Jwt from "jsonwebtoken";

export interface TokenPayLoad {
  id: string;
  steamId: string;
  leetifyId: string | null;
}

export class ControllerLogin {
  async create(req: Request, res: Response) {
    const user = z.object({
      email: z.email({ message: "Informe um endereço de e-mail válido." }),

      password: z.string().min(1, { message: "A senha é obrigatória." }),
    });

    const { email, password } = user.parse(req.body);

    const userExists = await prisma.user.findFirst({
      where: { email },
    });

    if (!userExists) {
      throw new AppError(
        "Credenciais inválidas. Verifique seu e-mail e senha.",
        401,
      );
    }

    const UserPasswordValidated = await compare(password, userExists.password);

    if (!UserPasswordValidated) {
      throw new AppError(
        "Credenciais inválidas. Verifique seu e-mail e senha.",
        401,
      );
    }

    const userForToken: TokenPayLoad = {
      id: userExists.id,
      steamId: userExists.steam64Id,
      leetifyId: userExists.leetifyId,
    };

    if (!process.env.SECRET_KEY_TOKEN) {
      throw new AppError(
        "Erro interno de autenticação. Contate o suporte.",
        500,
      );
    }

    const token = Jwt.sign(userForToken, process.env.SECRET_KEY_TOKEN, {
      expiresIn: "10m",
    });

    return res.status(200).json({ token });
  }
}
