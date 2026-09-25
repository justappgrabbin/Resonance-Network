import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNotebookEntrySchema, insertResonanceProfileSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { isAuthenticated } from "./replit_integrations/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { hasDatabase } from "./db";

const CONSCIOUSNESS_SERVER_URL = process.env.CONSCIOUSNESS_SERVER_URL || 'http://localhost:5001';

// Helper to sanitize user input for consciousness queries
function sanitizeInput(input: string): string {
  return input
    .replace(/[`$(){}[\]\\;|&<>'"]/g, '')
    .substring(0, 500)
    .trim();
}

// Helper to call the persistent Flask consciousness server via HTTP
async function queryConsciousnessServer(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${CONSCIOUSNESS_SERVER_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "resonance-north-star",
      storage: hasDatabase ? "postgres" : "local-file",
      consciousness: process.env.CONSCIOUSNESS_SERVER_URL || "http://localhost:5001",
      timestamp: new Date().toISOString(),
    });
  });

  // Notebook Entries
  app.get("/api/notebook/entries", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const entries = await storage.getNotebookEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching notebook entries:", error);
      res.status(500).json({ error: "Failed to fetch notebook entries" });
    }
  });

  app.post("/api/notebook/entries", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;

    try {
      const validation = insertNotebookEntrySchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          error: fromError(validation.error).toString() 
        });
      }

      const entry = await storage.createNotebookEntry(validation.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating notebook entry:", error);
      res.status(500).json({ error: "Failed to create notebook entry" });
    }
  });

  app.patch("/api/notebook/entries/:id", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;

    try {
      const { id } = req.params;
      const entry = await storage.getNotebookEntry(id);

      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      if (entry.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await storage.updateNotebookEntry(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating notebook entry:", error);
      res.status(500).json({ error: "Failed to update notebook entry" });
    }
  });

  app.delete("/api/notebook/entries/:id", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;

    try {
      const { id } = req.params;
      const entry = await storage.getNotebookEntry(id);

      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      if (entry.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteNotebookEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notebook entry:", error);
      res.status(500).json({ error: "Failed to delete notebook entry" });
    }
  });

  // Resonance Profile
  app.get("/api/resonance/profile", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;

    try {
      const profile = await storage.getResonanceProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching resonance profile:", error);
      res.status(500).json({ error: "Failed to fetch resonance profile" });
    }
  });

  app.post("/api/resonance/profile", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;

    try {
      const validation = insertResonanceProfileSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          error: fromError(validation.error).toString() 
        });
      }

      const profile = await storage.createResonanceProfile(validation.data);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating resonance profile:", error);
      res.status(500).json({ error: "Failed to create resonance profile" });
    }
  });

  app.patch("/api/resonance/profile", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;

    try {
      const updated = await storage.updateResonanceProfile(userId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating resonance profile:", error);
      res.status(500).json({ error: "Failed to update resonance profile" });
    }
  });

  // Virtual Consciousness Engine API (calls persistent Flask server)
  app.post("/api/consciousness/query", async (req, res) => {
    try {
      const question = sanitizeInput(req.body?.question || "What resonates?");
      const result = await queryConsciousnessServer('/api/consciousness/query', 'POST', { question });
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Consciousness query error:", error);
      res.status(500).json({ success: false, error: error.message || "Consciousness query failed" });
    }
  });

  app.get("/api/consciousness/gates", async (req, res) => {
    try {
      const result = await queryConsciousnessServer('/api/consciousness/gates', 'GET');
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Gate query error:", error);
      res.status(500).json({ success: false, error: error.message || "Gate query failed" });
    }
  });

  app.get("/api/consciousness/awareness", async (req, res) => {
    try {
      const result = await queryConsciousnessServer('/api/consciousness/awareness', 'GET');
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Awareness query error:", error);
      res.status(500).json({ success: false, error: error.message || "Awareness query failed" });
    }
  });

  // North Star workspace: durable user state for purpose, projects, missions, matches,
  // science, enterprise, worlds, builder runs, and Synthia context.
  app.get("/api/northstar/workspace", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspace = await storage.getNorthstarWorkspace(userId);
      res.json(workspace ? { version: workspace.version, state: workspace.state, updatedAt: workspace.updatedAt } : null);
    } catch (error) {
      console.error("Error fetching North Star workspace:", error);
      res.status(500).json({ error: "Failed to fetch North Star workspace" });
    }
  });

  app.put("/api/northstar/workspace", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const state = req.body?.state;
      const version = Number(req.body?.version || 1);
      if (!state || typeof state !== "object" || Array.isArray(state)) {
        return res.status(400).json({ error: "state must be an object" });
      }
      const serialized = JSON.stringify(state);
      if (serialized.length > 2_000_000) {
        return res.status(413).json({ error: "Workspace state exceeds 2 MB" });
      }
      const workspace = await storage.saveNorthstarWorkspace(userId, state, Number.isFinite(version) ? version : 1);
      res.json({ version: workspace.version, state: workspace.state, updatedAt: workspace.updatedAt });
    } catch (error) {
      console.error("Error saving North Star workspace:", error);
      res.status(500).json({ error: "Failed to save North Star workspace" });
    }
  });

  // Real archive intake without a multipart dependency. The browser sends the ZIP as raw bytes.
  // The returned asset id is stored inside the user's workspace/project metadata.
  app.post(
    "/api/northstar/assets",
    isAuthenticated,
    express.raw({ type: ["application/zip", "application/x-zip-compressed", "application/octet-stream"], limit: "100mb" }),
    async (req: any, res) => {
      try {
        const userId = String(req.user.claims.sub).replace(/[^a-zA-Z0-9_-]/g, "_");
        const encodedName = String(req.header("x-file-name") || "project.zip");
        const originalName = decodeURIComponent(encodedName).slice(0, 180);
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
        if (!body.length) return res.status(400).json({ error: "Archive body is empty" });
        const sha256 = crypto.createHash("sha256").update(body).digest("hex");
        const assetId = `${Date.now()}-${sha256.slice(0, 12)}`;
        const dir = path.resolve(process.cwd(), "data", "northstar-assets", userId);
        await fs.mkdir(dir, { recursive: true });
        const storedName = `${assetId}-${safeName}`;
        await fs.writeFile(path.join(dir, storedName), body);
        res.status(201).json({
          id: assetId,
          name: originalName,
          storedName,
          size: body.length,
          sha256,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("North Star asset upload error:", error);
        res.status(500).json({ error: "Failed to store archive" });
      }
    },
  );

  // Organism State
  app.get("/api/organism/state", async (req, res) => {
    try {
      const state = await storage.getOrganismState();
      res.json(state || null);
    } catch (error) {
      console.error("Error fetching organism state:", error);
      res.status(500).json({ error: "Failed to fetch organism state" });
    }
  });

  app.patch("/api/organism/state", isAuthenticated, async (req: any, res) => {
    try {
      const updated = await storage.updateOrganismState(req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating organism state:", error);
      res.status(500).json({ error: "Failed to update organism state" });
    }
  });

  return httpServer;
}
