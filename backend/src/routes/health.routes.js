const { Router } = require("express");
const prisma = require("../config/database");

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
    });
  } catch {
    res.status(503).json({ status: "unhealthy", database: "disconnected" });
  }
});

module.exports = router;
