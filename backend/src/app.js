const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { errorMiddleware } = require("./middleware/error.middleware");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/documents.routes");
const extractionRoutes = require("./routes/extraction.routes");
const reviewRoutes = require("./routes/review.routes");
const pocRoutes = require("./routes/poc.routes");
const riskRoutes = require("./routes/risk.routes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/v1", healthRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", documentRoutes);
app.use("/api/v1", extractionRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1", pocRoutes);
app.use("/api/v1", riskRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Healthcare Document API v1.0", docs: "/api/v1/health" });
});

app.use(errorMiddleware);

module.exports = app;
