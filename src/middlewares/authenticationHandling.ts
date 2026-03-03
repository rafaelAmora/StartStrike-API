import type { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import type { TokenPayLoad } from "../controllers/controllerLogin.js";



export function authenticationHandling(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token não informado.", 401);
  }

  if (!process.env.SECRET_KEY_TOKEN) {
    throw new AppError("Erro interno de autenticação.", 500);
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    throw new AppError("Token não informado.", 401);
  }

  try {
    const decoded = Jwt.verify(
      token,
      process.env.SECRET_KEY_TOKEN,
    ) as TokenPayLoad;

    req.user = {
      id: decoded.id,
      steamId: decoded.steamId,
      leetifyId : decoded.leetifyId
    };

    return next();
  } catch {
    throw new AppError("Token inválido ou expirado.", 401);
  }
}
