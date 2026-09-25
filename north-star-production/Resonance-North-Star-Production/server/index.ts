import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

let consciousnessProcess: ReturnType<typeof spawn> | null = null;
let restartAttempts = 0;
let lastStartTime = 0;
const MAX_RESTART_ATTEMPTS = 3;
const STABLE_RUN_THRESHOLD = 30000;
let consciousnessServiceFailed = false;

function startConsciousnessServer(isRetry = false) {
  if (consciousnessProcess) {
    return consciousnessProcess;
  }
  
  if (consciousnessServiceFailed) {
    log('Consciousness server has failed permanently, not restarting', 'consciousness');
    return null;
  }
  
  if (isRetry) {
    restartAttempts++;
    if (restartAttempts > MAX_RESTART_ATTEMPTS) {
      consciousnessServiceFailed = true;
      log(`Consciousness server exhausted ${MAX_RESTART_ATTEMPTS} restart attempts, giving up`, 'consciousness');
      return null;
    }
  }
  
  const consciousnessDir = path.join(__dirname, 'consciousness');
  lastStartTime = Date.now();
  
  const proc = spawn('python', ['server.py'], {
    cwd: consciousnessDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
    env: { 
      ...process.env, 
      PYTHONUNBUFFERED: '1',
      FLASK_ENV: 'production',
      FLASK_DEBUG: '0'
    },
  });
  
  consciousnessProcess = proc;
  
  proc.stdout?.on('data', (data) => {
    log(data.toString().trim(), 'consciousness');
  });
  
  proc.stderr?.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes('WARNING') && !msg.includes('Address already in use')) {
      log(msg, 'consciousness');
    }
  });
  
  proc.on('error', (err) => {
    log(`Failed to start consciousness server: ${err.message}`, 'consciousness');
    consciousnessProcess = null;
  });
  
  proc.on('close', (code) => {
    const uptime = Date.now() - lastStartTime;
    consciousnessProcess = null;
    
    if (uptime > STABLE_RUN_THRESHOLD) {
      restartAttempts = 0;
    }
    
    if (code !== 0 && code !== null) {
      const delay = Math.min(1000 * Math.pow(2, restartAttempts + 1), 10000);
      log(`Consciousness server exited (code ${code}, uptime ${uptime}ms), will retry in ${delay}ms (attempt ${restartAttempts + 1}/${MAX_RESTART_ATTEMPTS})`, 'consciousness');
      setTimeout(() => startConsciousnessServer(true), delay);
    }
  });
  
  return proc;
}

function setupProcessHandlers() {
  const cleanup = () => {
    if (consciousnessProcess) {
      consciousnessProcess.kill('SIGTERM');
      consciousnessProcess = null;
    }
  };
  
  process.on('exit', cleanup);
  process.on('beforeExit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });
  process.on('uncaughtException', (err) => {
    log(`Uncaught exception: ${err.message}`, 'error');
    cleanup();
    process.exit(1);
  });
}

setupProcessHandlers();

(async () => {
  const externalConsciousness = process.env.CONSCIOUSNESS_SERVER_URL && !process.env.CONSCIOUSNESS_SERVER_URL.includes("localhost");
  if (process.env.START_CONSCIOUSNESS !== "0" && !externalConsciousness) {
    log("Starting local consciousness server...", "startup");
    startConsciousnessServer();
  } else {
    log("Using external/disabled consciousness service; core Resonance Network remains available.", "startup");
  }
  
  if (process.env.REPL_ID && process.env.SESSION_SECRET && process.env.DATABASE_URL) {
    await setupAuth(app);
    registerAuthRoutes(app);
  } else {
    log("Running with local development identity. Configure REPL_ID + SESSION_SECRET + DATABASE_URL for OIDC auth.", "auth");
    app.get("/api/auth/user", (req, res) => res.json({
      id: "local-user",
      email: "local@resonance.network",
      firstName: "Local",
      lastName: "Creator",
      profileImageUrl: null,
    }));
    app.get("/api/login", (_req, res) => res.redirect("/"));
    app.get("/api/logout", (_req, res) => res.redirect("/"));
  }
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
