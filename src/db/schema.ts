import { pgTable, serial, varchar, integer, timestamp, text, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
  invite_code: varchar("invite_code", { length: 32 }),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  team_id: integer("team_id").notNull().references(() => teams.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 32 }).notNull(), // 'player', 'parent', 'coach'
  invited_by: integer("invited_by").notNull().references(() => users.id),
  status: varchar("status", { length: 32 }).notNull().default('pending'), // 'pending', 'accepted'
});

// Relations
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.team_id], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.user_id], references: [users.id] }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
}));

// Activity type enum for calendar events
export const activityTypeEnum = pgEnum('activity_type', [
  'practice',
  'gym',
  'match',
  'tournament',
  'education',
  'sparring_request'
]);

// Calendar events table
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  team_id: integer("team_id").notNull().references(() => teams.id),
  created_by: integer("created_by").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  activity_type: activityTypeEnum("activity_type").notNull(),
  start_time: timestamp("start_time", { withTimezone: true }).notNull(),
  end_time: timestamp("end_time", { withTimezone: true }).notNull(),
  location: varchar("location", { length: 255 }),
  is_recurring: boolean("is_recurring").notNull().default(false),
  recurrence_pattern: varchar("recurrence_pattern", { length: 32 }), // 'weekly', 'monthly', etc.
  original_event_id: integer("original_event_id"), // self-reference for cloned events
  request_status: varchar("request_status", { length: 32 }).default('confirmed'), // 'pending', 'approved', 'declined', 'confirmed'
  approved_by: integer("approved_by").references(() => users.id), // Coach who approved/declined the request
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Parent-child relationship table
export const parentChild = pgTable("parent_child", {
  id: serial("id").primaryKey(),
  parent_id: integer("parent_id").notNull().references(() => users.id),
  child_id: integer("child_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Event participants table for tracking who's in each event
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  event_id: integer("event_id").notNull().references(() => calendarEvents.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 32 }).notNull().default('confirmed'), // 'confirmed', 'tentative', 'declined'
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Calendar events relations
export const calendarEventsRelations = relations(calendarEvents, ({ one, many }) => ({
  team: one(teams, { fields: [calendarEvents.team_id], references: [teams.id] }),
  creator: one(users, { fields: [calendarEvents.created_by], references: [users.id] }),
  participants: many(eventParticipants),
}));

// Parent-child relations
export const parentChildRelations = relations(parentChild, ({ one }) => ({
  parent: one(users, { fields: [parentChild.parent_id], references: [users.id] }),
  child: one(users, { fields: [parentChild.child_id], references: [users.id] }),
}));

// Event participants relations
export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(calendarEvents, { fields: [eventParticipants.event_id], references: [calendarEvents.id] }),
  user: one(users, { fields: [eventParticipants.user_id], references: [users.id] }),
}));