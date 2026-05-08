import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { verifyToken } from '../utils/jwt';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authMiddleware = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new AppError('No token provided', 401);

    const payload = verifyToken(header.split(' ')[1]);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    if (!user) throw new AppError('User not found', 401);

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Invalid token', 401));
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};
