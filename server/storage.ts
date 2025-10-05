import { 
  type User, 
  type InsertUser, 
  type Image, 
  type InsertImage, 
  type SavedImage, 
  type InsertSavedImage,
  type UserArtStyle,
  type InsertUserArtStyle,
  type UserCustomEffect,
  type InsertUserCustomEffect,
  type UserProfile,
  type InsertUserProfile,
  type CustomModel,
  type InsertCustomModel,
  type Admin,
  type InsertAdmin,
  type Message,
  type InsertMessage,
  users,
  images,
  savedImages,
  userArtStyles,
  userCustomEffects,
  userProfiles,
  customModels,
  admins,
  messages
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image operations
  createImage(image: InsertImage): Promise<Image>;
  getImages(limit?: number, offset?: number): Promise<Image[]>;
  getImageById(id: string): Promise<Image | undefined>;
  
  // Saved image operations
  createSavedImage(savedImage: InsertSavedImage): Promise<SavedImage>;
  getSavedImagesByUserId(userId: string, limit?: number, offset?: number): Promise<SavedImage[]>;
  getSavedImageById(id: string): Promise<SavedImage | undefined>;
  deleteSavedImage(id: string): Promise<boolean>;
  
  // User Art Style operations
  createUserArtStyle(userArtStyle: InsertUserArtStyle): Promise<UserArtStyle>;
  getUserArtStylesByUserId(userId: string): Promise<UserArtStyle[]>;
  getAllUserArtStyles(): Promise<UserArtStyle[]>;
  getUserArtStyleById(id: string): Promise<UserArtStyle | undefined>;
  updateUserArtStyle(id: string, updates: Partial<InsertUserArtStyle>): Promise<UserArtStyle | undefined>;
  deleteUserArtStyle(id: string): Promise<boolean>;
  
  // User Custom Effect operations
  createUserCustomEffect(userCustomEffect: InsertUserCustomEffect): Promise<UserCustomEffect>;
  getUserCustomEffectsByUserId(userId: string): Promise<UserCustomEffect[]>;
  getAllUserCustomEffects(): Promise<UserCustomEffect[]>;
  getUserCustomEffectById(id: string): Promise<UserCustomEffect | undefined>;
  updateUserCustomEffect(id: string, updates: Partial<InsertUserCustomEffect>): Promise<UserCustomEffect | undefined>;
  deleteUserCustomEffect(id: string): Promise<boolean>;
  
  // User Profile operations
  getUserProfileByUserId(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(userProfile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  deleteUserAccount(userId: string): Promise<boolean>;
  
  // Custom Model operations
  createCustomModel(customModel: InsertCustomModel): Promise<CustomModel>;
  getCustomModelsByUserId(userId: string): Promise<CustomModel[]>;
  getCustomModelById(id: string): Promise<CustomModel | undefined>;
  updateCustomModel(id: string, updates: Partial<InsertCustomModel>): Promise<CustomModel | undefined>;
  deleteCustomModel(id: string): Promise<boolean>;
  
  // Admin operations
  isAdmin(email: string): Promise<boolean>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAllImages(limit?: number, offset?: number): Promise<Image[]>;
  updateImageModerationStatus(id: string, status: string): Promise<Image | undefined>;
  deleteImage(id: string): Promise<boolean>;
  getAllUserProfiles(limit?: number, offset?: number): Promise<UserProfile[]>;
  deleteUserProfile(userId: string): Promise<boolean>;
  banUser(userId: string): Promise<UserProfile | undefined>;
  unbanUser(userId: string): Promise<UserProfile | undefined>;
  getStatistics(): Promise<{
    totalImages: number;
    totalUsers: number;
    totalArtStyles: number;
    totalCustomEffects: number;
    pendingModeration: number;
  }>;
  getUserStatistics(userId: string): Promise<{
    userId: string;
    profile: UserProfile | undefined;
    totalImagesGenerated: number;
    totalImagesSaved: number;
    totalArtStylesCreated: number;
    totalCustomEffectsCreated: number;
    totalCustomModels: number;
    recentImages: Image[];
    recentArtStyles: UserArtStyle[];
    recentCustomEffects: UserCustomEffect[];
  }>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUserId(userId: string): Promise<Message[]>;
  getMessageById(id: string): Promise<Message | undefined>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values({
        ...insertImage,
        negativePrompt: insertImage.negativePrompt || null,
        userDisplayName: insertImage.userDisplayName || null,
        moderationStatus: 'approved', // Auto-approve for now
        likeCount: 0
      })
      .returning();
    return image;
  }

  async getImages(limit: number = 20, offset: number = 0): Promise<Image[]> {
    const result = await db
      .select()
      .from(images)
      .where(eq(images.moderationStatus, 'approved'))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  async getImageById(id: string): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }

  async createSavedImage(insertSavedImage: InsertSavedImage): Promise<SavedImage> {
    const [savedImage] = await db
      .insert(savedImages)
      .values({
        ...insertSavedImage,
        negativePrompt: insertSavedImage.negativePrompt || null,
        originalImageId: insertSavedImage.originalImageId || null
      })
      .returning();
    return savedImage;
  }

  async getSavedImagesByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<SavedImage[]> {
    const result = await db
      .select()
      .from(savedImages)
      .where(eq(savedImages.userId, userId))
      .orderBy(desc(savedImages.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  async getSavedImageById(id: string): Promise<SavedImage | undefined> {
    const [savedImage] = await db.select().from(savedImages).where(eq(savedImages.id, id));
    return savedImage || undefined;
  }

  async deleteSavedImage(id: string): Promise<boolean> {
    const result = await db.delete(savedImages).where(eq(savedImages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // User Art Style operations
  async createUserArtStyle(userArtStyle: InsertUserArtStyle): Promise<UserArtStyle> {
    const [artStyle] = await db
      .insert(userArtStyles)
      .values({
        ...userArtStyle,
        description: userArtStyle.description || null,
        keywords: userArtStyle.keywords || null,
        inspiration: userArtStyle.inspiration || null,
        characteristics: userArtStyle.characteristics || null
      })
      .returning();
    return artStyle;
  }

  async getUserArtStylesByUserId(userId: string): Promise<UserArtStyle[]> {
    const result = await db
      .select()
      .from(userArtStyles)
      .where(eq(userArtStyles.userId, userId))
      .orderBy(desc(userArtStyles.createdAt));
    return result;
  }

  async getAllUserArtStyles(): Promise<UserArtStyle[]> {
    const result = await db
      .select({
        id: userArtStyles.id,
        userId: userArtStyles.userId,
        name: userArtStyles.name,
        description: userArtStyles.description,
        keywords: userArtStyles.keywords,
        inspiration: userArtStyles.inspiration,
        characteristics: userArtStyles.characteristics,
        createdAt: userArtStyles.createdAt,
        updatedAt: userArtStyles.updatedAt,
        userDisplayName: userProfiles.displayName,
      })
      .from(userArtStyles)
      .leftJoin(userProfiles, eq(userArtStyles.userId, userProfiles.userId))
      .orderBy(desc(userArtStyles.createdAt));
    
    // Map to include userDisplayName with fallback
    return result.map(style => ({
      ...style,
      userDisplayName: style.userDisplayName || 'Anonymous'
    })) as any;
  }

  async getUserArtStyleById(id: string): Promise<UserArtStyle | undefined> {
    const [artStyle] = await db.select().from(userArtStyles).where(eq(userArtStyles.id, id));
    return artStyle || undefined;
  }

  async updateUserArtStyle(id: string, updates: Partial<InsertUserArtStyle>): Promise<UserArtStyle | undefined> {
    const [artStyle] = await db
      .update(userArtStyles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userArtStyles.id, id))
      .returning();
    return artStyle || undefined;
  }

  async deleteUserArtStyle(id: string): Promise<boolean> {
    const result = await db.delete(userArtStyles).where(eq(userArtStyles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // User Custom Effect operations
  async createUserCustomEffect(userCustomEffect: InsertUserCustomEffect): Promise<UserCustomEffect> {
    const [customEffect] = await db
      .insert(userCustomEffects)
      .values({
        ...userCustomEffect,
        description: userCustomEffect.description || null,
        visualImpact: userCustomEffect.visualImpact || null,
        technicalDetails: userCustomEffect.technicalDetails || null,
        useCases: userCustomEffect.useCases || null
      })
      .returning();
    return customEffect;
  }

  async getUserCustomEffectsByUserId(userId: string): Promise<UserCustomEffect[]> {
    const result = await db
      .select()
      .from(userCustomEffects)
      .where(eq(userCustomEffects.userId, userId))
      .orderBy(desc(userCustomEffects.createdAt));
    return result;
  }

  async getAllUserCustomEffects(): Promise<UserCustomEffect[]> {
    const result = await db
      .select({
        id: userCustomEffects.id,
        userId: userCustomEffects.userId,
        name: userCustomEffects.name,
        description: userCustomEffects.description,
        visualImpact: userCustomEffects.visualImpact,
        technicalDetails: userCustomEffects.technicalDetails,
        useCases: userCustomEffects.useCases,
        createdAt: userCustomEffects.createdAt,
        updatedAt: userCustomEffects.updatedAt,
        userDisplayName: userProfiles.displayName,
      })
      .from(userCustomEffects)
      .leftJoin(userProfiles, eq(userCustomEffects.userId, userProfiles.userId))
      .orderBy(desc(userCustomEffects.createdAt));
    
    return result.map(effect => ({
      ...effect,
      userDisplayName: effect.userDisplayName || 'Anonymous'
    })) as any;
  }

  async getUserCustomEffectById(id: string): Promise<UserCustomEffect | undefined> {
    const [customEffect] = await db.select().from(userCustomEffects).where(eq(userCustomEffects.id, id));
    return customEffect || undefined;
  }

  async updateUserCustomEffect(id: string, updates: Partial<InsertUserCustomEffect>): Promise<UserCustomEffect | undefined> {
    const [customEffect] = await db
      .update(userCustomEffects)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userCustomEffects.id, id))
      .returning();
    return customEffect || undefined;
  }

  async deleteUserCustomEffect(id: string): Promise<boolean> {
    const result = await db.delete(userCustomEffects).where(eq(userCustomEffects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // User Profile operations
  async getUserProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfiles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile || undefined;
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      await db.delete(savedImages).where(eq(savedImages.userId, userId));
      await db.delete(userArtStyles).where(eq(userArtStyles.userId, userId));
      await db.delete(userCustomEffects).where(eq(userCustomEffects.userId, userId));
      await db.delete(customModels).where(eq(customModels.userId, userId));
      await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      return false;
    }
  }

  // Custom Model operations
  async createCustomModel(insertModel: InsertCustomModel): Promise<CustomModel> {
    const [model] = await db
      .insert(customModels)
      .values(insertModel)
      .returning();
    return model;
  }

  async getCustomModelsByUserId(userId: string): Promise<CustomModel[]> {
    const result = await db
      .select()
      .from(customModels)
      .where(eq(customModels.userId, userId))
      .orderBy(desc(customModels.createdAt));
    return result;
  }

  async getCustomModelById(id: string): Promise<CustomModel | undefined> {
    const [model] = await db.select().from(customModels).where(eq(customModels.id, id));
    return model || undefined;
  }

  async updateCustomModel(id: string, updates: Partial<InsertCustomModel>): Promise<CustomModel | undefined> {
    const [model] = await db
      .update(customModels)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(customModels.id, id))
      .returning();
    return model || undefined;
  }

  async deleteCustomModel(id: string): Promise<boolean> {
    const result = await db.delete(customModels).where(eq(customModels.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async isAdmin(email: string): Promise<boolean> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return !!admin;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async getAllImages(limit: number = 50, offset: number = 0): Promise<Image[]> {
    const result = await db
      .select()
      .from(images)
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  async updateImageModerationStatus(id: string, status: string): Promise<Image | undefined> {
    const [image] = await db
      .update(images)
      .set({ moderationStatus: status })
      .where(eq(images.id, id))
      .returning();
    return image || undefined;
  }

  async deleteImage(id: string): Promise<boolean> {
    const result = await db
      .delete(images)
      .where(eq(images.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllUserProfiles(limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    const result = await db
      .select()
      .from(userProfiles)
      .orderBy(desc(userProfiles.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  async deleteUserProfile(userId: string): Promise<boolean> {
    const result = await db
      .delete(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return result.length > 0;
  }

  async banUser(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfiles)
      .set({ isBanned: true })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile || undefined;
  }

  async unbanUser(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfiles)
      .set({ isBanned: false })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile || undefined;
  }

  async getStatistics(): Promise<{
    totalImages: number;
    totalUsers: number;
    totalArtStyles: number;
    totalCustomEffects: number;
    pendingModeration: number;
  }> {
    const [imagesCount] = await db.select({ count: sql<number>`count(*)` }).from(images);
    const [profilesCount] = await db.select({ count: sql<number>`count(*)` }).from(userProfiles);
    const [artStylesCount] = await db.select({ count: sql<number>`count(*)` }).from(userArtStyles);
    const [customEffectsCount] = await db.select({ count: sql<number>`count(*)` }).from(userCustomEffects);
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(images).where(eq(images.moderationStatus, 'pending'));

    return {
      totalImages: Number(imagesCount?.count ?? 0),
      totalUsers: Number(profilesCount?.count ?? 0),
      totalArtStyles: Number(artStylesCount?.count ?? 0),
      totalCustomEffects: Number(customEffectsCount?.count ?? 0),
      pendingModeration: Number(pendingCount?.count ?? 0),
    };
  }

  async getUserStatistics(userId: string): Promise<{
    userId: string;
    profile: UserProfile | undefined;
    totalImagesGenerated: number;
    totalImagesSaved: number;
    totalArtStylesCreated: number;
    totalCustomEffectsCreated: number;
    totalCustomModels: number;
    recentImages: Image[];
    recentArtStyles: UserArtStyle[];
    recentCustomEffects: UserCustomEffect[];
  }> {
    const profile = await this.getUserProfileByUserId(userId);
    
    const [generatedCount] = await db.select({ count: sql<number>`count(*)` })
      .from(images)
      .where(eq(images.userDisplayName, profile?.displayName || userId));
    
    const [savedCount] = await db.select({ count: sql<number>`count(*)` })
      .from(savedImages)
      .where(eq(savedImages.userId, userId));
    
    const [artStylesCount] = await db.select({ count: sql<number>`count(*)` })
      .from(userArtStyles)
      .where(eq(userArtStyles.userId, userId));
    
    const [customEffectsCount] = await db.select({ count: sql<number>`count(*)` })
      .from(userCustomEffects)
      .where(eq(userCustomEffects.userId, userId));
    
    const [modelsCount] = await db.select({ count: sql<number>`count(*)` })
      .from(customModels)
      .where(eq(customModels.userId, userId));
    
    const recentImages = await db.select()
      .from(images)
      .where(eq(images.userDisplayName, profile?.displayName || userId))
      .orderBy(desc(images.createdAt))
      .limit(5);
    
    const recentArtStyles = await db.select()
      .from(userArtStyles)
      .where(eq(userArtStyles.userId, userId))
      .orderBy(desc(userArtStyles.createdAt))
      .limit(5);

    const recentCustomEffects = await db.select()
      .from(userCustomEffects)
      .where(eq(userCustomEffects.userId, userId))
      .orderBy(desc(userCustomEffects.createdAt))
      .limit(5);

    return {
      userId,
      profile,
      totalImagesGenerated: Number(generatedCount?.count ?? 0),
      totalImagesSaved: Number(savedCount?.count ?? 0),
      totalArtStylesCreated: Number(artStylesCount?.count ?? 0),
      totalCustomEffectsCreated: Number(customEffectsCount?.count ?? 0),
      totalCustomModels: Number(modelsCount?.count ?? 0),
      recentImages,
      recentArtStyles,
      recentCustomEffects,
    };
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        senderAdminEmail: insertMessage.senderAdminEmail || null,
      })
      .returning();
    return message;
  }

  async getMessagesByUserId(userId: string): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.recipientUserId, userId))
      .orderBy(desc(messages.createdAt));
    return result;
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message || undefined;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

// In-memory storage implementation for when database is not available
class InMemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private images = new Map<string, Image>();
  private savedImages = new Map<string, SavedImage>();
  private userArtStyles = new Map<string, UserArtStyle>();
  private userCustomEffects = new Map<string, UserCustomEffect>();
  private userProfiles = new Map<string, UserProfile>();
  private customModels = new Map<string, CustomModel>();
  private admins = new Map<string, Admin>();
  private messages = new Map<string, Message>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const usersArray = Array.from(this.users.values());
    return usersArray.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: randomUUID(),
      username: insertUser.username,
      password: insertUser.password,
    };
    this.users.set(user.id, user);
    return user;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const image: Image = {
      id: randomUUID(),
      prompt: insertImage.prompt,
      negativePrompt: insertImage.negativePrompt || null,
      model: insertImage.model,
      width: insertImage.width,
      height: insertImage.height,
      imageData: insertImage.imageData,
      artStyle: insertImage.artStyle,
      userDisplayName: insertImage.userDisplayName || null,
      createdAt: new Date(),
      moderationStatus: 'approved',
      likeCount: 0,
    };
    this.images.set(image.id, image);
    return image;
  }

  async getImages(limit: number = 20, offset: number = 0): Promise<Image[]> {
    const allImages = Array.from(this.images.values())
      .filter(img => img.moderationStatus === 'approved')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    return allImages;
  }

  async getImageById(id: string): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async createSavedImage(insertSavedImage: InsertSavedImage): Promise<SavedImage> {
    const savedImage: SavedImage = {
      id: randomUUID(),
      userId: insertSavedImage.userId,
      prompt: insertSavedImage.prompt,
      negativePrompt: insertSavedImage.negativePrompt || null,
      model: insertSavedImage.model,
      width: insertSavedImage.width,
      height: insertSavedImage.height,
      imageData: insertSavedImage.imageData,
      artStyle: insertSavedImage.artStyle,
      originalImageId: insertSavedImage.originalImageId || null,
      createdAt: new Date(),
    };
    this.savedImages.set(savedImage.id, savedImage);
    return savedImage;
  }

  async getSavedImagesByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<SavedImage[]> {
    const userImages = Array.from(this.savedImages.values())
      .filter(img => img.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    return userImages;
  }

  async getSavedImageById(id: string): Promise<SavedImage | undefined> {
    return this.savedImages.get(id);
  }

  async deleteSavedImage(id: string): Promise<boolean> {
    return this.savedImages.delete(id);
  }

  async createUserArtStyle(userArtStyle: InsertUserArtStyle): Promise<UserArtStyle> {
    const artStyle: UserArtStyle = {
      id: randomUUID(),
      userId: userArtStyle.userId,
      name: userArtStyle.name,
      description: userArtStyle.description || null,
      keywords: userArtStyle.keywords || null,
      inspiration: userArtStyle.inspiration || null,
      characteristics: userArtStyle.characteristics || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userArtStyles.set(artStyle.id, artStyle);
    return artStyle;
  }

  async getUserArtStylesByUserId(userId: string): Promise<UserArtStyle[]> {
    return Array.from(this.userArtStyles.values())
      .filter(style => style.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllUserArtStyles(): Promise<UserArtStyle[]> {
    const styles = Array.from(this.userArtStyles.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Enrich with user display names
    return styles.map(style => {
      const profile = Array.from(this.userProfiles.values()).find(p => p.userId === style.userId);
      return {
        ...style,
        userDisplayName: profile?.displayName || 'Anonymous'
      } as any;
    });
  }

  async getUserArtStyleById(id: string): Promise<UserArtStyle | undefined> {
    return this.userArtStyles.get(id);
  }

  async updateUserArtStyle(id: string, updates: Partial<InsertUserArtStyle>): Promise<UserArtStyle | undefined> {
    const existing = this.userArtStyles.get(id);
    if (!existing) return undefined;
    
    const updated: UserArtStyle = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.userArtStyles.set(id, updated);
    return updated;
  }

  async deleteUserArtStyle(id: string): Promise<boolean> {
    return this.userArtStyles.delete(id);
  }

  // User Custom Effect operations
  async createUserCustomEffect(userCustomEffect: InsertUserCustomEffect): Promise<UserCustomEffect> {
    const customEffect: UserCustomEffect = {
      id: randomUUID(),
      userId: userCustomEffect.userId,
      name: userCustomEffect.name,
      description: userCustomEffect.description || null,
      visualImpact: userCustomEffect.visualImpact || null,
      technicalDetails: userCustomEffect.technicalDetails || null,
      useCases: userCustomEffect.useCases || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userCustomEffects.set(customEffect.id, customEffect);
    return customEffect;
  }

  async getUserCustomEffectsByUserId(userId: string): Promise<UserCustomEffect[]> {
    return Array.from(this.userCustomEffects.values())
      .filter(effect => effect.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllUserCustomEffects(): Promise<UserCustomEffect[]> {
    const effects = Array.from(this.userCustomEffects.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Enrich with user display names
    return effects.map(effect => {
      const profile = Array.from(this.userProfiles.values()).find(p => p.userId === effect.userId);
      return {
        ...effect,
        userDisplayName: profile?.displayName || 'Anonymous'
      } as any;
    });
  }

  async getUserCustomEffectById(id: string): Promise<UserCustomEffect | undefined> {
    return this.userCustomEffects.get(id);
  }

  async updateUserCustomEffect(id: string, updates: Partial<InsertUserCustomEffect>): Promise<UserCustomEffect | undefined> {
    const existing = this.userCustomEffects.get(id);
    if (!existing) return undefined;
    
    const updated: UserCustomEffect = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.userCustomEffects.set(id, updated);
    return updated;
  }

  async deleteUserCustomEffect(id: string): Promise<boolean> {
    return this.userCustomEffects.delete(id);
  }

  // User Profile operations
  async getUserProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(profile => profile.userId === userId);
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const profile: UserProfile = {
      id: randomUUID(),
      ...insertProfile,
      displayName: insertProfile.displayName || null,
      bio: insertProfile.bio || null,
      location: insertProfile.location || null,
      website: insertProfile.website || null,
      phone: insertProfile.phone || null,
      company: insertProfile.company || null,
      jobTitle: insertProfile.jobTitle || null,
      language: insertProfile.language || 'en',
      timezone: insertProfile.timezone || 'UTC',
      dateFormat: insertProfile.dateFormat || 'MM/DD/YYYY',
      timeFormat: insertProfile.timeFormat || '12h',
      emailNotifications: insertProfile.emailNotifications ?? true,
      pushNotifications: insertProfile.pushNotifications ?? true,
      marketingEmails: insertProfile.marketingEmails ?? false,
      profileVisibility: insertProfile.profileVisibility || 'public',
      showEmail: insertProfile.showEmail ?? false,
      showLocation: insertProfile.showLocation ?? true,
      dataSharing: insertProfile.dataSharing ?? false,
      defaultImageModel: insertProfile.defaultImageModel || 'gemini-2.5-flash',
      defaultImageQuality: insertProfile.defaultImageQuality || 'standard',
      defaultImageSize: insertProfile.defaultImageSize || '1024x1024',
      useOriginalModelsOnly: insertProfile.useOriginalModelsOnly ?? false,
      autoSaveGenerations: insertProfile.autoSaveGenerations ?? true,
      twitterHandle: insertProfile.twitterHandle || null,
      instagramHandle: insertProfile.instagramHandle || null,
      linkedinUrl: insertProfile.linkedinUrl || null,
      githubHandle: insertProfile.githubHandle || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userProfiles.set(profile.id, profile);
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existing = Array.from(this.userProfiles.values()).find(p => p.userId === userId);
    if (!existing) return undefined;
    
    const updated: UserProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.userProfiles.set(existing.id, updated);
    return updated;
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      Array.from(this.savedImages.entries()).forEach(([id, img]) => {
        if (img.userId === userId) this.savedImages.delete(id);
      });
      Array.from(this.userArtStyles.entries()).forEach(([id, style]) => {
        if (style.userId === userId) this.userArtStyles.delete(id);
      });
      Array.from(this.userCustomEffects.entries()).forEach(([id, effect]) => {
        if (effect.userId === userId) this.userCustomEffects.delete(id);
      });
      Array.from(this.customModels.entries()).forEach(([id, model]) => {
        if (model.userId === userId) this.customModels.delete(id);
      });
      Array.from(this.userProfiles.entries()).forEach(([id, profile]) => {
        if (profile.userId === userId) this.userProfiles.delete(id);
      });
      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      return false;
    }
  }

  // Custom Model operations
  async createCustomModel(insertModel: InsertCustomModel): Promise<CustomModel> {
    const model: CustomModel = {
      id: randomUUID(),
      ...insertModel,
      modelType: insertModel.modelType || 'custom_api',
      apiKey: insertModel.apiKey || null,
      requestFormat: insertModel.requestFormat || 'standard',
      isActive: insertModel.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customModels.set(model.id, model);
    return model;
  }

  async getCustomModelsByUserId(userId: string): Promise<CustomModel[]> {
    return Array.from(this.customModels.values())
      .filter(model => model.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCustomModelById(id: string): Promise<CustomModel | undefined> {
    return this.customModels.get(id);
  }

  async updateCustomModel(id: string, updates: Partial<InsertCustomModel>): Promise<CustomModel | undefined> {
    const existing = this.customModels.get(id);
    if (!existing) return undefined;
    
    const updated: CustomModel = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.customModels.set(id, updated);
    return updated;
  }

  async deleteCustomModel(id: string): Promise<boolean> {
    return this.customModels.delete(id);
  }

  async isAdmin(email: string): Promise<boolean> {
    return Array.from(this.admins.values()).some(admin => admin.email === email);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const admin: Admin = {
      id: randomUUID(),
      email: insertAdmin.email,
      firebaseUid: insertAdmin.firebaseUid || null,
      createdAt: new Date(),
    };
    this.admins.set(admin.id, admin);
    return admin;
  }

  async getAllImages(limit: number = 50, offset: number = 0): Promise<Image[]> {
    return Array.from(this.images.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async updateImageModerationStatus(id: string, status: string): Promise<Image | undefined> {
    const existing = this.images.get(id);
    if (!existing) return undefined;
    
    const updated: Image = {
      ...existing,
      moderationStatus: status,
    };
    this.images.set(id, updated);
    return updated;
  }

  async deleteImage(id: string): Promise<boolean> {
    return this.images.delete(id);
  }

  async getAllUserProfiles(limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    return Array.from(this.userProfiles.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async deleteUserProfile(userId: string): Promise<boolean> {
    const profile = Array.from(this.userProfiles.values()).find(p => p.userId === userId);
    if (!profile) return false;
    return this.userProfiles.delete(profile.id);
  }

  async banUser(userId: string): Promise<UserProfile | undefined> {
    const profile = Array.from(this.userProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updated: UserProfile = {
      ...profile,
      isBanned: true,
    };
    this.userProfiles.set(profile.id, updated);
    return updated;
  }

  async unbanUser(userId: string): Promise<UserProfile | undefined> {
    const profile = Array.from(this.userProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updated: UserProfile = {
      ...profile,
      isBanned: false,
    };
    this.userProfiles.set(profile.id, updated);
    return updated;
  }

  async getStatistics(): Promise<{
    totalImages: number;
    totalUsers: number;
    totalArtStyles: number;
    totalCustomEffects: number;
    pendingModeration: number;
  }> {
    const totalImages = this.images.size;
    const totalUsers = this.userProfiles.size;
    const totalArtStyles = this.userArtStyles.size;
    const totalCustomEffects = this.userCustomEffects.size;
    const pendingModeration = Array.from(this.images.values())
      .filter(img => img.moderationStatus === 'pending').length;

    return {
      totalImages,
      totalUsers,
      totalArtStyles,
      totalCustomEffects,
      pendingModeration,
    };
  }

  async getUserStatistics(userId: string): Promise<{
    userId: string;
    profile: UserProfile | undefined;
    totalImagesGenerated: number;
    totalImagesSaved: number;
    totalArtStylesCreated: number;
    totalCustomEffectsCreated: number;
    totalCustomModels: number;
    recentImages: Image[];
    recentArtStyles: UserArtStyle[];
    recentCustomEffects: UserCustomEffect[];
  }> {
    const profile = await this.getUserProfileByUserId(userId);
    
    const generatedImages = Array.from(this.images.values())
      .filter(img => img.userDisplayName === (profile?.displayName || userId));
    
    const savedImages = Array.from(this.savedImages.values())
      .filter(img => img.userId === userId);
    
    const artStyles = Array.from(this.userArtStyles.values())
      .filter(style => style.userId === userId);
    
    const customEffects = Array.from(this.userCustomEffects.values())
      .filter(effect => effect.userId === userId);
    
    const models = Array.from(this.customModels.values())
      .filter(model => model.userId === userId);
    
    const recentImages = generatedImages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    const recentArtStyles = artStyles
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentCustomEffects = customEffects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      userId,
      profile,
      totalImagesGenerated: generatedImages.length,
      totalImagesSaved: savedImages.length,
      totalArtStylesCreated: artStyles.length,
      totalCustomEffectsCreated: customEffects.length,
      totalCustomModels: models.length,
      recentImages,
      recentArtStyles,
      recentCustomEffects,
    };
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: randomUUID(),
      recipientUserId: insertMessage.recipientUserId,
      senderAdminEmail: insertMessage.senderAdminEmail || null,
      type: insertMessage.type || 'notification',
      title: insertMessage.title,
      content: insertMessage.content,
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async getMessagesByUserId(userId: string): Promise<Message[]> {
    const messagesArray = Array.from(this.messages.values());
    return messagesArray
      .filter(msg => msg.recipientUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (message) {
      const updatedMessage = { ...message, isRead: true };
      this.messages.set(id, updatedMessage);
      return updatedMessage;
    }
    return undefined;
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.messages.delete(id);
  }
}

// Function to test if the database is actually accessible
async function isDatabaseAccessible(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    await db.select().from(users).limit(1);
    return true;
  } catch (error) {
    console.log('Database not accessible, using in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Initialize storage - will use database if accessible, otherwise in-memory
let storageInstance: IStorage | undefined = undefined;

export const getStorage = async (): Promise<IStorage> => {
  if (!storageInstance) {
    try {
      const { GoogleDriveStorage } = await import('./google-drive-storage');
      storageInstance = new GoogleDriveStorage();
      console.log('Using Google Drive storage');
      
      await storageInstance.createAdmin({
        email: 'eeweed27ai@admin.com',
      });
      console.log('Default admin user created: eeweed27ai@admin.com');
    } catch (error) {
      console.error('Failed to initialize Google Drive storage, falling back to in-memory:', error);
      storageInstance = new InMemoryStorage();
      console.log('Using in-memory storage (fallback)');
      
      await storageInstance.createAdmin({
        email: 'eeweed27ai@admin.com',
      });
      console.log('Default admin user created: eeweed27ai@admin.com');
    }
  }
  return storageInstance;
};

const initStorage = async () => {
  try {
    const { GoogleDriveStorage } = await import('./google-drive-storage');
    const storage = new GoogleDriveStorage();
    console.log('Using Google Drive storage');
    
    await storage.createAdmin({
      email: 'eeweed27ai@admin.com',
    });
    console.log('Default admin user created: eeweed27ai@admin.com');
    
    return storage;
  } catch (error) {
    console.error('Failed to initialize Google Drive storage, falling back to in-memory:', error);
    const storage = new InMemoryStorage();
    console.log('Using in-memory storage (fallback)');
    
    await storage.createAdmin({
      email: 'eeweed27ai@admin.com',
    });
    console.log('Default admin user created: eeweed27ai@admin.com');
    
    return storage;
  }
};

// Export a promise-based storage that will be resolved on first use
let storagePromise: Promise<IStorage> | null = null;
const getStorageInstance = async (): Promise<IStorage> => {
  if (!storagePromise) {
    storagePromise = initStorage();
  }
  return storagePromise;
};

// For backward compatibility, create a proxy that lazily initializes storage
export const storage: IStorage = new Proxy({} as IStorage, {
  get: (_target, prop: string) => {
    return async (...args: any[]) => {
      const instance = await getStorageInstance();
      return (instance as any)[prop](...args);
    };
  }
});
