// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();

// Extend IncomingMessage for rawBody
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: false }));

// Middleware to log API requests
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

(async () => {
  try {
    // Connect to MongoDB using .env MONGODB_URI
    await storage.connect();
    log("✅ Database connected successfully");

    // Check for existing packages
    const existingPackages = await storage.getAllPackages();
    if (existingPackages.length === 0) {
      const defaultPackages = [
        {
          name: "Basic",
          description: "Perfect for beginners",
          price: 29.99,
          features: ["Access to gym equipment", "Basic workout plans"],
          videoAccess: false,
          liveSessionsPerMonth: 0,
          dietPlanAccess: false,
          workoutPlanAccess: true,
        },
        {
          name: "Premium",
          description: "Most popular choice",
          price: 59.99,
          features: [
            "All Basic features",
            "Video library access",
            "Diet plans",
            "2 live sessions/month",
          ],
          videoAccess: true,
          liveSessionsPerMonth: 2,
          dietPlanAccess: true,
          workoutPlanAccess: true,
        },
        {
          name: "Elite",
          description: "Complete fitness solution",
          price: 99.99,
          features: [
            "All Premium features",
            "Unlimited live sessions",
            "Personal trainer support",
            "Priority support",
          ],
          videoAccess: true,
          liveSessionsPerMonth: 999,
          dietPlanAccess: true,
          workoutPlanAccess: true,
        },
      ];

      for (const pkg of defaultPackages) {
        await storage.createPackage(pkg);
      }
      log(`📦 Created ${defaultPackages.length} default packages`);
    } else {
      log(`📦 Found ${existingPackages.length} existing packages`);
    }
  } catch (error) {
    log("❌ Failed to connect to database:");
    console.error(error);
    process.exit(1);
  }

  // Register all routes
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup static/Vite
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);

// ✅ Updated: compatible with Windows & Replit
server.listen(port, "127.0.0.1", () => {
  log(`🚀 Server running locally on http://127.0.0.1:${port}`);
});
})();
