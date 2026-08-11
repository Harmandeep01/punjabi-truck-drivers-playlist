import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Configured Admin Password (from env or default)
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  // Active Admin Auth Sessions (tokens)
  const validAdminTokens = new Set<string>();

  // Rate Limiting for Login Attempts (IP -> { count, lockUntil })
  const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

  // In-memory telemetry & listener tracker
  const serverStartTime = Date.now();
  let totalHeartbeatPings = 0;
  let peakListenersToday = 1;
  let totalUniqueSessionsAllTime = 0;
  let totalListeningSecondsAllTime = 0;

  interface ClientSession {
    clientId: string;
    joinedAt: number;
    lastSeen: number;
    pings: number;
    userAgent?: string;
    deviceCategory: "Mobile" | "Tablet" | "Desktop" | "Other";
  }

  interface CompletedSession {
    clientId: string;
    joinedAt: number;
    leftAt: number;
    durationSec: number;
    totalPings: number;
    deviceCategory: string;
  }

  const activeClients = new Map<string, ClientSession>();
  const sessionHistory: CompletedSession[] = []; // Stores recent completed sessions (max 200)

  // Hourly stats tracker for today (00:00 - 23:00)
  const hourlyTrafficMap = new Array(24).fill(0);

  // Device category parser
  const getDeviceCategory = (ua?: string): "Mobile" | "Tablet" | "Desktop" | "Other" => {
    if (!ua) return "Other";
    const lower = ua.toLowerCase();
    if (lower.includes("ipad") || lower.includes("tablet")) return "Tablet";
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) return "Mobile";
    if (lower.includes("windows") || lower.includes("macintosh") || lower.includes("linux")) return "Desktop";
    return "Other";
  };

  // Base random simulated offset between 30 and 100
  let baseSimulatedOffset = Math.floor(Math.random() * 71) + 30; // 30..100
  let lastOffsetFluctuation = Date.now();

  // Helper to get active clients and current offset
  const getListenerStats = () => {
    const now = Date.now();
    
    // Purge stale sessions older than 25 seconds & log completed session
    activeClients.forEach((session, id) => {
      if (now - session.lastSeen > 25000) {
        const durationSec = Math.floor((now - session.joinedAt) / 1000);
        totalListeningSecondsAllTime += durationSec;
        sessionHistory.unshift({
          clientId: session.clientId,
          joinedAt: session.joinedAt,
          leftAt: now,
          durationSec,
          totalPings: session.pings,
          deviceCategory: session.deviceCategory,
        });

        // Keep history capped at 200 items
        if (sessionHistory.length > 200) {
          sessionHistory.pop();
        }

        activeClients.delete(id);
      }
    });

    // Update hourly stats for current hour
    const currentHour = new Date().getHours();
    hourlyTrafficMap[currentHour] = Math.max(hourlyTrafficMap[currentHour], activeClients.size);

    // Track peak listeners
    if (activeClients.size > peakListenersToday) {
      peakListenersToday = activeClients.size;
    }

    // Slightly fluctuate simulated offset every 15 seconds by ±1..3 to mimic natural radio listeners
    if (now - lastOffsetFluctuation > 15000) {
      const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
      baseSimulatedOffset = Math.max(30, Math.min(100, baseSimulatedOffset + delta));
      lastOffsetFluctuation = now;
    }

    const actualCount = activeClients.size;
    const totalDisplayed = actualCount + baseSimulatedOffset;

    return {
      actualCount,
      simulatedOffset: baseSimulatedOffset,
      totalDisplayed,
    };
  };

  // Middleware: Require Admin Authentication
  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing authentication token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!validAdminTokens.has(token)) {
      res.status(401).json({ error: "Unauthorized: Invalid or expired session token" });
      return;
    }

    next();
  };

  // 1. PUBLIC API: Heartbeat ping from frontend
  app.post("/api/heartbeat", (req, res) => {
    totalHeartbeatPings++;
    const { clientId } = req.body;

    if (!clientId || typeof clientId !== "string") {
      res.status(400).json({ error: "Missing valid clientId" });
      return;
    }

    const now = Date.now();
    const existing = activeClients.get(clientId);

    if (existing) {
      existing.lastSeen = now;
      existing.pings += 1;
    } else {
      totalUniqueSessionsAllTime++;
      const userAgent = req.headers["user-agent"] || "Unknown";
      activeClients.set(clientId, {
        clientId,
        joinedAt: now,
        lastSeen: now,
        pings: 1,
        userAgent,
        deviceCategory: getDeviceCategory(userAgent),
      });
    }

    const stats = getListenerStats();

    res.json({
      status: "ok",
      actualCount: stats.actualCount,
      simulatedOffset: stats.simulatedOffset,
      displayCount: stats.totalDisplayed,
      serverUptimeSec: Math.floor((now - serverStartTime) / 1000),
    });
  });

  // 2. PUBLIC API: Current public listener stats
  app.get("/api/listeners", (req, res) => {
    const stats = getListenerStats();
    res.json(stats);
  });

  // ----------------------------------------------------
  // PROTECTED ADMIN ENDPOINTS (OPTION A)
  // ----------------------------------------------------

  // Admin Login Endpoint (with rate-limiting)
  app.post("/api/admin/login", (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    // Check rate limit status
    const attempt = loginAttempts.get(clientIp) || { count: 0, lockUntil: 0 };
    if (attempt.lockUntil > now) {
      const waitSec = Math.ceil((attempt.lockUntil - now) / 1000);
      res.status(429).json({ error: `Too many failed attempts. Locked out for ${waitSec}s.` });
      return;
    }

    const { password } = req.body;
    if (typeof password !== "string") {
      res.status(400).json({ error: "Password must be provided" });
      return;
    }

    // Timing-safe comparison to prevent side-channel timing attacks
    const passwordBuffer = Buffer.from(password);
    const adminBuffer = Buffer.from(ADMIN_PASSWORD);

    let isValid = false;
    if (passwordBuffer.length === adminBuffer.length) {
      isValid = crypto.timingSafeEqual(passwordBuffer, adminBuffer);
    }

    if (!isValid) {
      attempt.count += 1;
      if (attempt.count >= 5) {
        attempt.lockUntil = now + 15 * 60 * 1000; // Lock for 15 minutes after 5 failures
      }
      loginAttempts.set(clientIp, attempt);

      res.status(401).json({
        error: "Invalid admin password",
        attemptsRemaining: Math.max(0, 5 - attempt.count),
      });
      return;
    }

    // Reset login attempts on success
    loginAttempts.delete(clientIp);

    // Generate secure admin token
    const token = crypto.randomBytes(32).toString("hex");
    validAdminTokens.add(token);

    res.json({
      status: "authenticated",
      token,
      message: "Admin session granted",
    });
  });

  // Admin Verify Session Token
  app.get("/api/admin/verify", requireAdminAuth, (req, res) => {
    res.json({ status: "valid", authenticated: true });
  });

  // Admin Logout Endpoint
  app.post("/api/admin/logout", requireAdminAuth, (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      validAdminTokens.delete(token);
    }
    res.json({ status: "logged_out" });
  });

  // Admin Analytics & Insights Dashboard API (PROTECTED)
  app.get("/api/admin/analytics", requireAdminAuth, (req, res) => {
    const now = Date.now();
    const stats = getListenerStats();

    // Device breakdown
    const deviceBreakdown = { Mobile: 0, Tablet: 0, Desktop: 0, Other: 0 };
    activeClients.forEach((s) => {
      deviceBreakdown[s.deviceCategory] = (deviceBreakdown[s.deviceCategory] || 0) + 1;
    });

    // Active session list
    const activeList = Array.from(activeClients.values()).map((s) => ({
      clientId: s.clientId,
      joinedAt: s.joinedAt,
      onlineDurationSec: Math.floor((now - s.joinedAt) / 1000),
      lastPingAgoSec: Math.floor((now - s.lastSeen) / 1000),
      pingsCount: s.pings,
      deviceCategory: s.deviceCategory,
      userAgent: s.userAgent,
    }));

    // Format hourly traffic array into [{ hour: "00:00", count: 5 }, ...]
    const hourlyGraphData = hourlyTrafficMap.map((count, hr) => ({
      hour: `${hr.toString().padStart(2, "0")}:00`,
      listeners: count,
    }));

    // Compute average session duration
    const completedCount = sessionHistory.length;
    const totalCompletedDuration = sessionHistory.reduce((sum, item) => sum + item.durationSec, 0);
    const avgSessionDurationSec = completedCount > 0 ? Math.round(totalCompletedDuration / completedCount) : 0;

    res.json({
      analytics: {
        serverUptimeSec: Math.floor((now - serverStartTime) / 1000),
        totalPingsReceived: totalHeartbeatPings,
        currentActiveListeners: stats.actualCount,
        peakListenersToday,
        simulatedBoostOffset: stats.simulatedOffset,
        totalDisplayedListeners: stats.totalDisplayed,
        totalUniqueSessionsAllTime,
        totalListeningHoursAllTime: (totalListeningSecondsAllTime / 3600).toFixed(2),
        avgSessionDurationSec,
        deviceBreakdown,
        hourlyGraphData,
        activeSessions: activeList,
        recentCompletedHistory: sessionHistory.slice(0, 50),
      },
    });
  });

  // Admin Config Endpoint (Update simulated boost offset)
  app.post("/api/admin/config", requireAdminAuth, (req, res) => {
    const { offset } = req.body;
    if (typeof offset === "number" && offset >= 0 && offset <= 500) {
      baseSimulatedOffset = Math.round(offset);
      res.json({ status: "updated", newOffset: baseSimulatedOffset });
    } else {
      res.status(400).json({ error: "Invalid offset. Must be a number between 0 and 500." });
    }
  });

  // Vite middleware for development vs static serve in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Highway Radio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

