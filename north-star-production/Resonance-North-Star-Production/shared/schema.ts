import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

import { users } from "./models/auth";

export const notebookEntries = pgTable("notebook_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tag: text("tag").notNull(),
  active: boolean("active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNotebookEntrySchema = createInsertSchema(notebookEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotebookEntry = z.infer<typeof insertNotebookEntrySchema>;
export type NotebookEntry = typeof notebookEntries.$inferSelect;

export const resonanceProfiles = pgTable("resonance_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  gateData: jsonb("gate_data").notNull(),
  fieldCoherence: integer("field_coherence").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResonanceProfileSchema = createInsertSchema(resonanceProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertResonanceProfile = z.infer<typeof insertResonanceProfileSchema>;
export type ResonanceProfile = typeof resonanceProfiles.$inferSelect;

export const organismState = pgTable("organism_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  growthStage: integer("growth_stage").default(0).notNull(),
  vitality: integer("vitality").default(0).notNull(),
  coherence: integer("coherence").default(100).notNull(),
  diversity: integer("diversity").default(0).notNull(),
  autonomy: integer("autonomy").default(0).notNull(),
  participantCount: integer("participant_count").default(0).notNull(),
  gateHealth: jsonb("gate_health").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrganismStateSchema = createInsertSchema(organismState).omit({
  id: true,
  updatedAt: true,
});
export type InsertOrganismState = z.infer<typeof insertOrganismStateSchema>;
export type OrganismState = typeof organismState.$inferSelect;


// North Star workspace
// One durable, versioned workspace per user. The JSON state is intentionally flexible so
// the Resonance Network can add new automata/modules without destructive schema churn.
export const northstarWorkspaces = pgTable("northstar_workspaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  version: integer("version").default(1).notNull(),
  state: jsonb("state").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNorthstarWorkspaceSchema = createInsertSchema(northstarWorkspaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNorthstarWorkspace = z.infer<typeof insertNorthstarWorkspaceSchema>;
export type NorthstarWorkspace = typeof northstarWorkspaces.$inferSelect;
