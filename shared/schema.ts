import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  gamesPlayed: integer("games_played").default(0),
  currentStreak: integer("current_streak").default(0),
  bestTime: integer("best_time"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game rooms
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  creatorId: varchar("creator_id").notNull(),
  isPrivate: boolean("is_private").default(false),
  maxPlayers: integer("max_players").default(2),
  currentPlayers: integer("current_players").default(1),
  status: varchar("status", { length: 20 }).default("waiting"), // waiting, active, finished
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Games
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  player1Id: varchar("player1_id").notNull(),
  player2Id: varchar("player2_id"),
  currentPlayerId: varchar("current_player_id"),
  board: jsonb("board").default([["","",""],["","",""],["","",""]]),
  status: varchar("status", { length: 20 }).default("waiting"), // waiting, active, finished, draw
  winnerId: varchar("winner_id"),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  gameId: integer("game_id"),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).default("message"), // message, system, reaction
  createdAt: timestamp("created_at").defaultNow(),
});

// Room participants
export const roomParticipants = pgTable("room_participants", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdRooms: many(rooms, { relationName: "creator" }),
  roomParticipants: many(roomParticipants),
  messages: many(messages),
  gamesAsPlayer1: many(games, { relationName: "player1" }),
  gamesAsPlayer2: many(games, { relationName: "player2" }),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [rooms.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  participants: many(roomParticipants),
  games: many(games),
  messages: many(messages),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  room: one(rooms, {
    fields: [games.roomId],
    references: [rooms.id],
  }),
  player1: one(users, {
    fields: [games.player1Id],
    references: [users.id],
    relationName: "player1",
  }),
  player2: one(users, {
    fields: [games.player2Id],
    references: [users.id],
    relationName: "player2",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
  game: one(games, {
    fields: [messages.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const roomParticipantsRelations = relations(roomParticipants, ({ one }) => ({
  room: one(rooms, {
    fields: [roomParticipants.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomParticipants.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertRoomParticipantSchema = createInsertSchema(roomParticipants).omit({ id: true, joinedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type RoomParticipant = typeof roomParticipants.$inferSelect;
export type InsertRoomParticipant = z.infer<typeof insertRoomParticipantSchema>;
