const prisma = require("../config/database");
const { verifyToken } = require("../utils/jwt");
const { AppError } = require("./error.middleware");

const authMiddleware = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      throw new AppError("No token provided", 401);

    const payload = verifyToken(header.split(" ")[1]);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) throw new AppError("User not found", 401);

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError("Invalid token", 401));
  }
};

const requireRole = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
