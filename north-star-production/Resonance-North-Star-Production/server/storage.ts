import { 
  type NotebookEntry,
  type InsertNotebookEntry,
  type ResonanceProfile,
  type InsertResonanceProfile,
  type OrganismState,
  type InsertOrganismState,
  notebookEntries,
  resonanceProfiles,
  organismState,
  type NorthstarWorkspace,
  northstarWorkspaces
} from "@shared/schema";
import { db, hasDatabase } from "./db";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Notebook Entries
  getNotebookEntries(userId: string): Promise<NotebookEntry[]>;
  getNotebookEntry(id: string): Promise<NotebookEntry | undefined>;
  createNotebookEntry(entry: InsertNotebookEntry): Promise<NotebookEntry>;
  updateNotebookEntry(id: string, entry: Partial<InsertNotebookEntry>): Promise<NotebookEntry | undefined>;
  deleteNotebookEntry(id: string): Promise<boolean>;

  // Resonance Profiles
  getResonanceProfile(userId: string): Promise<ResonanceProfile | undefined>;
  createResonanceProfile(profile: InsertResonanceProfile): Promise<ResonanceProfile>;
  updateResonanceProfile(userId: string, profile: Partial<InsertResonanceProfile>): Promise<ResonanceProfile | undefined>;

  // Organism State
  getOrganismState(): Promise<OrganismState | undefined>;
  updateOrganismState(state: Partial<InsertOrganismState>): Promise<OrganismState>;

  // North Star durable workspace
  getNorthstarWorkspace(userId: string): Promise<NorthstarWorkspace | undefined>;
  saveNorthstarWorkspace(userId: string, state: unknown, version?: number): Promise<NorthstarWorkspace>;
}

export class DatabaseStorage implements IStorage {
  // Notebook Entries
  async getNotebookEntries(userId: string): Promise<NotebookEntry[]> {
    return await db.select()
      .from(notebookEntries)
      .where(eq(notebookEntries.userId, userId))
      .orderBy(desc(notebookEntries.updatedAt));
  }

  async getNotebookEntry(id: string): Promise<NotebookEntry | undefined> {
    const [entry] = await db.select().from(notebookEntries).where(eq(notebookEntries.id, id));
    return entry;
  }

  async createNotebookEntry(entry: InsertNotebookEntry): Promise<NotebookEntry> {
    const [created] = await db.insert(notebookEntries).values(entry).returning();
    return created;
  }

  async updateNotebookEntry(id: string, entry: Partial<InsertNotebookEntry>): Promise<NotebookEntry | undefined> {
    const [updated] = await db.update(notebookEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(notebookEntries.id, id))
      .returning();
    return updated;
  }

  async deleteNotebookEntry(id: string): Promise<boolean> {
    const result = await db.delete(notebookEntries).where(eq(notebookEntries.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Resonance Profiles
  async getResonanceProfile(userId: string): Promise<ResonanceProfile | undefined> {
    const [profile] = await db.select()
      .from(resonanceProfiles)
      .where(eq(resonanceProfiles.userId, userId));
    return profile;
  }

  async createResonanceProfile(profile: InsertResonanceProfile): Promise<ResonanceProfile> {
    const [created] = await db.insert(resonanceProfiles).values(profile).returning();
    return created;
  }

  async updateResonanceProfile(userId: string, profile: Partial<InsertResonanceProfile>): Promise<ResonanceProfile | undefined> {
    const [updated] = await db.update(resonanceProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(resonanceProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Organism State
  async getOrganismState(): Promise<OrganismState | undefined> {
    const [state] = await db.select().from(organismState).limit(1);
    return state;
  }

  async updateOrganismState(state: Partial<InsertOrganismState>): Promise<OrganismState> {
    // Get existing state or create initial one
    const existing = await this.getOrganismState();
    
    if (existing) {
      const [updated] = await db.update(organismState)
        .set({ ...state, updatedAt: new Date() })
        .where(eq(organismState.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create initial state
      const initialState: InsertOrganismState = {
        growthStage: 0,
        vitality: 0,
        coherence: 100,
        diversity: 0,
        autonomy: 0,
        participantCount: 0,
        gateHealth: {},
        ...state
      };
      const [created] = await db.insert(organismState).values(initialState).returning();
      return created;
    }
  }

  // North Star durable workspace
  async getNorthstarWorkspace(userId: string): Promise<NorthstarWorkspace | undefined> {
    const [workspace] = await db.select()
      .from(northstarWorkspaces)
      .where(eq(northstarWorkspaces.userId, userId));
    return workspace;
  }

  async saveNorthstarWorkspace(userId: string, state: unknown, version = 1): Promise<NorthstarWorkspace> {
    const [workspace] = await db.insert(northstarWorkspaces)
      .values({ userId, state, version })
      .onConflictDoUpdate({
        target: northstarWorkspaces.userId,
        set: { state, version, updatedAt: new Date() },
      })
      .returning();
    return workspace;
  }

}


type LocalState = {
  notebookEntries: any[];
  resonanceProfiles: any[];
  organismState: any | null;
  northstarWorkspaces: any[];
};

class FileStorage implements IStorage {
  private file = path.resolve(process.cwd(), "data", "local-state.json");

  private async load(): Promise<LocalState> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      return { notebookEntries: [], resonanceProfiles: [], organismState: null, northstarWorkspaces: [] };
    }
  }

  private async save(state: LocalState) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const temp = `${this.file}.tmp`;
    await fs.writeFile(temp, JSON.stringify(state, null, 2));
    await fs.rename(temp, this.file);
  }

  async getNotebookEntries(userId: string): Promise<NotebookEntry[]> {
    const state = await this.load();
    return state.notebookEntries.filter((x) => x.userId === userId).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))) as NotebookEntry[];
  }

  async getNotebookEntry(id: string): Promise<NotebookEntry | undefined> {
    return (await this.load()).notebookEntries.find((x) => x.id === id) as NotebookEntry | undefined;
  }

  async createNotebookEntry(entry: InsertNotebookEntry): Promise<NotebookEntry> {
    const state = await this.load();
    const now = new Date();
    const created = { ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as NotebookEntry;
    state.notebookEntries.push(created);
    await this.save(state);
    return created;
  }

  async updateNotebookEntry(id: string, entry: Partial<InsertNotebookEntry>): Promise<NotebookEntry | undefined> {
    const state = await this.load();
    const index = state.notebookEntries.findIndex((x) => x.id === id);
    if (index < 0) return undefined;
    state.notebookEntries[index] = { ...state.notebookEntries[index], ...entry, updatedAt: new Date() };
    await this.save(state);
    return state.notebookEntries[index] as NotebookEntry;
  }

  async deleteNotebookEntry(id: string): Promise<boolean> {
    const state = await this.load();
    const before = state.notebookEntries.length;
    state.notebookEntries = state.notebookEntries.filter((x) => x.id !== id);
    await this.save(state);
    return state.notebookEntries.length < before;
  }

  async getResonanceProfile(userId: string): Promise<ResonanceProfile | undefined> {
    return (await this.load()).resonanceProfiles.find((x) => x.userId === userId) as ResonanceProfile | undefined;
  }

  async createResonanceProfile(profile: InsertResonanceProfile): Promise<ResonanceProfile> {
    const state = await this.load();
    const now = new Date();
    const created = { ...profile, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as ResonanceProfile;
    state.resonanceProfiles = state.resonanceProfiles.filter((x) => x.userId !== profile.userId);
    state.resonanceProfiles.push(created);
    await this.save(state);
    return created;
  }

  async updateResonanceProfile(userId: string, profile: Partial<InsertResonanceProfile>): Promise<ResonanceProfile | undefined> {
    const state = await this.load();
    const index = state.resonanceProfiles.findIndex((x) => x.userId === userId);
    if (index < 0) return undefined;
    state.resonanceProfiles[index] = { ...state.resonanceProfiles[index], ...profile, updatedAt: new Date() };
    await this.save(state);
    return state.resonanceProfiles[index] as ResonanceProfile;
  }

  async getOrganismState(): Promise<OrganismState | undefined> {
    return (await this.load()).organismState || undefined;
  }

  async updateOrganismState(next: Partial<InsertOrganismState>): Promise<OrganismState> {
    const state = await this.load();
    const existing = state.organismState || {
      id: crypto.randomUUID(), growthStage: 0, vitality: 0, coherence: 100,
      diversity: 0, autonomy: 0, participantCount: 0, gateHealth: {}, updatedAt: new Date(),
    };
    state.organismState = { ...existing, ...next, updatedAt: new Date() };
    await this.save(state);
    return state.organismState as OrganismState;
  }

  async getNorthstarWorkspace(userId: string): Promise<NorthstarWorkspace | undefined> {
    return (await this.load()).northstarWorkspaces.find((x) => x.userId === userId) as NorthstarWorkspace | undefined;
  }

  async saveNorthstarWorkspace(userId: string, workspaceState: unknown, version = 1): Promise<NorthstarWorkspace> {
    const state = await this.load();
    const index = state.northstarWorkspaces.findIndex((x) => x.userId === userId);
    const existing = index >= 0 ? state.northstarWorkspaces[index] : null;
    const now = new Date();
    const workspace = {
      id: existing?.id || crypto.randomUUID(), userId, version, state: workspaceState,
      createdAt: existing?.createdAt || now, updatedAt: now,
    } as NorthstarWorkspace;
    if (index >= 0) state.northstarWorkspaces[index] = workspace;
    else state.northstarWorkspaces.push(workspace);
    await this.save(state);
    return workspace;
  }
}

export const storage: IStorage = hasDatabase ? new DatabaseStorage() : new FileStorage();
