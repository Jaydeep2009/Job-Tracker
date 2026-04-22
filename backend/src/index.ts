import "dotenv/config";
import app from "./app.js";
import healthRoute from "./routes/health.js";
import authRoutes from "./auth/auth.routes.js";
import jobsRoutes from "./jobs/jobs.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 4000;

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Register routes (auth gets stricter rate limiting)
app.use("/api", healthRoute);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/jobs", jobsRoutes);

// 404 handler for undefined routes (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
  });

  // Exit process after logging (let process manager restart)
  process.exit(1);
});

app.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`);
});

