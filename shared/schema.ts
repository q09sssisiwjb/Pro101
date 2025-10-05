import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firebaseUid: text("firebase_uid").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  email: true,
  firebaseUid: true,
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  model: text("model").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  imageData: text("image_data").notNull(), // base64 encoded image data
  artStyle: text("art_style").notNull(),
  userDisplayName: text("user_display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  moderationStatus: text("moderation_status").default('approved').notNull(), // 'approved' | 'pending' | 'rejected'
  likeCount: integer("like_count").default(0).notNull(),
});

export const insertImageSchema = createInsertSchema(images).pick({
  prompt: true,
  negativePrompt: true,
  model: true,
  width: true,
  height: true,
  imageData: true,
  artStyle: true,
  userDisplayName: true,
}).extend({
  negativePrompt: z.string().optional().nullable().default(null),
});

export const savedImages = pgTable("saved_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // For now just use string, could reference users table later
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  model: text("model").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  imageData: text("image_data").notNull(), // base64 encoded image data
  artStyle: text("art_style").notNull(),
  originalImageId: varchar("original_image_id"), // Optional reference to community gallery image
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedImageSchema = createInsertSchema(savedImages).pick({
  userId: true,
  prompt: true,
  negativePrompt: true,
  model: true,
  width: true,
  height: true,
  imageData: true,
  artStyle: true,
  originalImageId: true,
}).extend({
  negativePrompt: z.string().optional().nullable().default(null),
});

// User Art Styles table
export const userArtStyles = pgTable("user_art_styles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Firebase user ID
  name: text("name").notNull(),
  description: text("description"),
  keywords: text("keywords"),
  inspiration: text("inspiration"),
  characteristics: text("characteristics"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserArtStyleSchema = createInsertSchema(userArtStyles).pick({
  userId: true,
  name: true,
  description: true,
  keywords: true,
  inspiration: true,
  characteristics: true,
}).extend({
  description: z.string().optional().nullable().default(null),
  keywords: z.string().optional().nullable().default(null),
  inspiration: z.string().optional().nullable().default(null),
  characteristics: z.string().optional().nullable().default(null),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertSavedImage = z.infer<typeof insertSavedImageSchema>;
export type SavedImage = typeof savedImages.$inferSelect;
export type InsertUserArtStyle = z.infer<typeof insertUserArtStyleSchema>;
export type UserArtStyle = typeof userArtStyles.$inferSelect;

// User Custom Effects table
export const userCustomEffects = pgTable("user_custom_effects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Firebase user ID
  name: text("name").notNull(),
  description: text("description"),
  visualImpact: text("visual_impact"),
  technicalDetails: text("technical_details"),
  useCases: text("use_cases"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserCustomEffectSchema = createInsertSchema(userCustomEffects).pick({
  userId: true,
  name: true,
  description: true,
  visualImpact: true,
  technicalDetails: true,
  useCases: true,
}).extend({
  description: z.string().optional().nullable().default(null),
  visualImpact: z.string().optional().nullable().default(null),
  technicalDetails: z.string().optional().nullable().default(null),
  useCases: z.string().optional().nullable().default(null),
});

export type InsertUserCustomEffect = z.infer<typeof insertUserCustomEffectSchema>;
export type UserCustomEffect = typeof userCustomEffects.$inferSelect;

// User Profile table
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(), // Firebase user ID
  email: text("email"),
  displayName: text("display_name"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  phone: text("phone"),
  company: text("company"),
  jobTitle: text("job_title"),
  language: text("language").default('en'),
  timezone: text("timezone").default('UTC'),
  dateFormat: text("date_format").default('MM/DD/YYYY'),
  timeFormat: text("time_format").default('12h'),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  profileVisibility: text("profile_visibility").default('public'), // 'public' | 'private' | 'friends'
  showEmail: boolean("show_email").default(false),
  showLocation: boolean("show_location").default(true),
  dataSharing: boolean("data_sharing").default(false),
  defaultImageModel: text("default_image_model").default('gemini-2.5-flash'),
  defaultImageQuality: text("default_image_quality").default('standard'), // 'standard' | 'hd'
  defaultImageSize: text("default_image_size").default('1024x1024'),
  useOriginalModelsOnly: boolean("use_original_models_only").default(false),
  autoSaveGenerations: boolean("auto_save_generations").default(true),
  twitterHandle: text("twitter_handle"),
  instagramHandle: text("instagram_handle"),
  linkedinUrl: text("linkedin_url"),
  githubHandle: text("github_handle"),
  isBanned: boolean("is_banned").default(false).notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email().optional().nullable(),
  displayName: z.string().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  location: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  twitterHandle: z.string().optional().nullable(),
  instagramHandle: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal('')),
  githubHandle: z.string().optional().nullable(),
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Custom Models table for user-defined image generation endpoints
export const customModels = pgTable("custom_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Firebase user ID
  name: text("name").notNull(),
  modelType: text("model_type").default('custom_api').notNull(), // 'custom_api' | 'huggingface'
  apiUrl: text("api_url").notNull(), // For HF: model ID, For custom: API endpoint
  apiKey: text("api_key"), // Optional for HF public API
  requestFormat: text("request_format").default('standard'), // 'standard' | 'openai' | 'custom'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Discriminated union for custom model validation
const customApiModelSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "Model name is required"),
  modelType: z.literal('custom_api'),
  apiUrl: z.string().url("Must be a valid URL"),
  apiKey: z.string().min(1, "API key is required for custom API"),
  requestFormat: z.enum(['standard', 'openai', 'custom']).default('standard'),
  isActive: z.boolean().default(true),
});

const huggingfaceModelSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "Model name is required"),
  modelType: z.literal('huggingface'),
  apiUrl: z.string().min(1, "Model ID is required"), // Actually the model ID
  apiKey: z.string().optional().nullable(),
  requestFormat: z.enum(['standard', 'openai', 'custom']).default('standard'),
  isActive: z.boolean().default(true),
});

export const insertCustomModelSchema = z.discriminatedUnion('modelType', [
  customApiModelSchema,
  huggingfaceModelSchema,
]);

// For updates, we need partial schemas that still validate per-type rules
const customApiModelUpdateSchema = customApiModelSchema.partial().extend({
  modelType: z.literal('custom_api').optional(),
});

const huggingfaceModelUpdateSchema = huggingfaceModelSchema.partial().extend({
  modelType: z.literal('huggingface').optional(),
});

export const updateCustomModelSchema = z.union([
  customApiModelUpdateSchema,
  huggingfaceModelUpdateSchema,
  z.object({}).passthrough(), // Allow empty updates or updates without modelType
]);

export type InsertCustomModel = z.infer<typeof insertCustomModelSchema>;
export type UpdateCustomModel = z.infer<typeof updateCustomModelSchema>;
export type CustomModel = typeof customModels.$inferSelect;

// Messages table for admin-to-user notifications
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientUserId: text("recipient_user_id").notNull(), // Firebase user ID
  senderAdminEmail: text("sender_admin_email"), // Admin who sent the message
  type: text("type").default('notification').notNull(), // 'welcome' | 'info' | 'notification' | 'admin'
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  recipientUserId: true,
  senderAdminEmail: true,
  type: true,
  title: true,
  content: true,
}).extend({
  senderAdminEmail: z.string().optional().nullable(),
  type: z.enum(['welcome', 'info', 'notification', 'admin']).default('notification'),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
