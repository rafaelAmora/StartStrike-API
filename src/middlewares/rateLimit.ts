import { rateLimit } from "express-rate-limit"



export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,       // Janela de 15 minutos
  limit: 500,                      // Máximo de 100 requisições por janela
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: { error: "Muitas requisições. Tente novamente em 15 minutos." }
})