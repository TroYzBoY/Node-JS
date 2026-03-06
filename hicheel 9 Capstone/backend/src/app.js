const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const passport = require("./config/passport");
const swaggerSpec = require("./docs/swagger");
const logger = require("./utils/logger");
const { requestContext } = require("./middleware/requestContext");
const { sanitizeInput } = require("./middleware/sanitize");
const { apiRateLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const categoryRoutes = require("./routes/categories.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/orders.routes");
const adminRoutes = require("./routes/admin.routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  }),
);
app.use(requestContext);
app.use(apiRateLimiter);
app.use(express.json());
app.use(sanitizeInput);
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);
app.use(passport.initialize());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    uptimeSeconds: Math.floor(process.uptime()),
    requestId: req.requestId,
  });
});

app.get("/api/v1/metrics", (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    success: true,
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryRss: memory.rss,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
    },
    requestId: req.requestId,
  });
});

app.get("/api/v1/security/csrf-info", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "CSRF mainly affects cookie-based sessions. This API uses Bearer JWT, so CSRF risk is lower; if cookies are introduced, add CSRF token middleware.",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
