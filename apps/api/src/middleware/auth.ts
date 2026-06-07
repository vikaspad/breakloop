import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ data: null, error: "Unauthorized", meta: {} });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ data: null, error: "Invalid token", meta: {} });
  }
}
