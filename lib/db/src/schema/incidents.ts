import { pgTable, text, timestamp, uuid, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const incidentsTable = pgTable("incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // 'critical' | 'moderate' | 'low' | 'resolved'
  type: varchar("type", { length: 20 }).notNull(), // 'medical' | 'fire' | 'traffic' | 'crime'
  status: varchar("status", { length: 20 }).notNull(), // 'active' | 'dispatched' | 'resolved'
  location: json("location").notNull(), // { lat: number, lng: number, address?: string }
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  assignedNodeId: text("assigned_node_id"),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
  resolutionNote: text("resolution_note"),
});

export const insertIncidentSchema = createInsertSchema(incidentsTable)
  .omit({ id: true, createdAt: true });

export type Incident = typeof incidentsTable.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
