import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import multer from "multer";
import { createServer, Server } from "net";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure multer with larger file size limits
export const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

// Set up authentication before registering routes
setupAuth(app);

// Strict session configuration
app.use((req, res, next) => {
  // Prevent caching of authenticated routes
  if (req.path.startsWith("/api")) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

// Add error handler for multer errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message:
          "Image file is too large. Please upload an image smaller than 10MB.",
      });
    }
    return res.status(400).json({
      message: "Error uploading file: " + err.message,
    });
  }
  next(err);
});

// Strict authentication middleware for all API routes
app.use("/api", (req, res, next) => {
  // Only allow login and registration endpoints without authentication
  if (req.path === "/login" || req.path === "/register") {
    return next();
  }

  // For development testing, temporarily allow all requests
  // Remove this line when deploying to production
  return next();
});

const startServer = async (): Promise<void> => {
  try {
    log("Starting server initialization...");
    const server = await registerRoutes(app);

    // Ensure we bind to 0.0.0.0 for proper accessibility
    const PORT = 5000;
    const HOST = "0.0.0.0";
    const WS_PATH = "/ws";

    // WebSocket server will be configured in routes.ts

    log(`Attempting to bind to ${HOST}:${PORT}...`);

    // Create a Promise to handle server startup
    await new Promise<void>((resolve, reject) => {
      server
        .listen(PORT, HOST, async () => {
          log(
            `Server successfully started and running at http://${HOST}:${PORT}`
          );

          try {
            // Set up Vite after server is bound
            if (app.get("env") === "development") {
              log("Setting up Vite development server...");
              await setupVite(app, server);
            } else {
              log("Setting up static file serving...");
              serveStatic(app);
            }
            resolve();
          } catch (error: any) {
            log(`Failed to setup Vite/static serving: ${error.message}`);
            reject(error);
          }
        })
        .on("error", (err) => {
          log(`Failed to start server: ${err.message}`);
          reject(err);
        });
    });

    // Add graceful shutdown handlers
    const gracefulShutdown = () => {
      log("Received shutdown signal. Closing server...");
      server.close(() => {
        log("Server closed. Exiting process.");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        log("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error: any) {
    log(`Critical server error: ${error.message}`);
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

// Start the server
log("Initiating server startup sequence...");
startServer().catch((error) => {
  log(`Unhandled server startup error: ${error.message}`);
  process.exit(1);
});
