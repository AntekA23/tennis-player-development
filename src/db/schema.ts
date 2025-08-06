import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull(), // 'player', 'parent', 'coach'
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  created_by: integer("created_by").notNull().references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  team_id: integer("team_id").notNull().references(() => teams.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 32 }).notNull(), // 'player', 'parent', 'coach'
  invited_by: integer("invited_by").notNull().references(() => users.id),
  status: varchar("status", { length: 32 }).notNull().default('pending'), // 'pending', 'accepted'
});