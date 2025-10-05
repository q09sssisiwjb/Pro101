import { getUncachableGoogleDriveClient } from './google-drive-client';
import type { IStorage } from './storage';
import type {
  User,
  InsertUser,
  Image,
  InsertImage,
  SavedImage,
  InsertSavedImage,
  UserArtStyle,
  InsertUserArtStyle,
  UserProfile,
  InsertUserProfile,
  CustomModel,
  InsertCustomModel,
  Admin,
  InsertAdmin,
} from '@shared/schema';
import { randomUUID } from 'crypto';

const STORAGE_FOLDER_NAME = 'VisionaryAI_Storage';
const DATA_FILE_NAME = 'database.json';

interface StorageData {
  users: Record<string, User>;
  images: Record<string, Image>;
  savedImages: Record<string, SavedImage>;
  userArtStyles: Record<string, UserArtStyle>;
  userProfiles: Record<string, UserProfile>;
  customModels: Record<string, CustomModel>;
  admins: Record<string, Admin>;
}

export class GoogleDriveStorage implements IStorage {
  private folderId: string | null = null;
  private fileId: string | null = null;
  private cache: StorageData | null = null;

  private async ensureStorageFolder(): Promise<string> {
    if (this.folderId) return this.folderId;

    const drive = await getUncachableGoogleDriveClient();

    const response = await drive.files.list({
      q: `name='${STORAGE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      this.folderId = response.data.files[0].id!;
      console.log(`Found existing storage folder: ${this.folderId}`);
    } else {
      const fileMetadata = {
        name: STORAGE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });
      this.folderId = folder.data.id!;
      console.log(`Created storage folder: ${this.folderId}`);
    }

    return this.folderId;
  }

  private async loadData(): Promise<StorageData> {
    if (this.cache) return this.cache;

    const drive = await getUncachableGoogleDriveClient();
    const folderId = await this.ensureStorageFolder();

    const response = await drive.files.list({
      q: `name='${DATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      this.fileId = response.data.files[0].id!;
      
      const file = await drive.files.get({
        fileId: this.fileId,
        alt: 'media',
      });

      this.cache = file.data as any as StorageData;
      console.log('Loaded data from Google Drive');
    } else {
      this.cache = {
        users: {},
        images: {},
        savedImages: {},
        userArtStyles: {},
        userProfiles: {},
        customModels: {},
        admins: {},
      };
      console.log('Initialized new storage data');
    }

    return this.cache;
  }

  private async saveData(): Promise<void> {
    if (!this.cache) return;

    const drive = await getUncachableGoogleDriveClient();
    const folderId = await this.ensureStorageFolder();

    const dataStr = JSON.stringify(this.cache, null, 2);
    const { Readable } = await import('stream');
    const stream = Readable.from([dataStr]);

    if (this.fileId) {
      await drive.files.update({
        fileId: this.fileId,
        media: {
          mimeType: 'application/json',
          body: stream,
        },
      });
      console.log('Updated data in Google Drive');
    } else {
      const fileMetadata = {
        name: DATA_FILE_NAME,
        parents: [folderId],
        mimeType: 'application/json',
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: 'application/json',
          body: stream,
        },
        fields: 'id',
      });

      this.fileId = file.data.id!;
      console.log('Created new data file in Google Drive');
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const data = await this.loadData();
    return data.users[id];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const data = await this.loadData();
    return Object.values(data.users).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const data = await this.loadData();
    const user: User = {
      id: randomUUID(),
      username: insertUser.username,
      password: insertUser.password,
    };
    data.users[user.id] = user;
    await this.saveData();
    return user;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const data = await this.loadData();
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
    data.images[image.id] = image;
    await this.saveData();
    return image;
  }

  async getImages(limit: number = 20, offset: number = 0): Promise<Image[]> {
    const data = await this.loadData();
    return Object.values(data.images)
      .filter(img => img.moderationStatus === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async getImageById(id: string): Promise<Image | undefined> {
    const data = await this.loadData();
    return data.images[id];
  }

  async createSavedImage(insertSavedImage: InsertSavedImage): Promise<SavedImage> {
    const data = await this.loadData();
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
    data.savedImages[savedImage.id] = savedImage;
    await this.saveData();
    return savedImage;
  }

  async getSavedImagesByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<SavedImage[]> {
    const data = await this.loadData();
    return Object.values(data.savedImages)
      .filter(img => img.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async getSavedImageById(id: string): Promise<SavedImage | undefined> {
    const data = await this.loadData();
    return data.savedImages[id];
  }

  async deleteSavedImage(id: string): Promise<boolean> {
    const data = await this.loadData();
    if (data.savedImages[id]) {
      delete data.savedImages[id];
      await this.saveData();
      return true;
    }
    return false;
  }

  async createUserArtStyle(userArtStyle: InsertUserArtStyle): Promise<UserArtStyle> {
    const data = await this.loadData();
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
    data.userArtStyles[artStyle.id] = artStyle;
    await this.saveData();
    return artStyle;
  }

  async getUserArtStylesByUserId(userId: string): Promise<UserArtStyle[]> {
    const data = await this.loadData();
    return Object.values(data.userArtStyles)
      .filter(style => style.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllUserArtStyles(): Promise<UserArtStyle[]> {
    const data = await this.loadData();
    const styles = Object.values(data.userArtStyles)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Enrich with user display names
    return styles.map(style => {
      const profile = Object.values(data.userProfiles).find(p => p.userId === style.userId);
      return {
        ...style,
        userDisplayName: profile?.displayName || 'Anonymous'
      } as any;
    });
  }

  async getUserArtStyleById(id: string): Promise<UserArtStyle | undefined> {
    const data = await this.loadData();
    return data.userArtStyles[id];
  }

  async updateUserArtStyle(id: string, updates: Partial<InsertUserArtStyle>): Promise<UserArtStyle | undefined> {
    const data = await this.loadData();
    const existing = data.userArtStyles[id];
    if (!existing) return undefined;

    const updated: UserArtStyle = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    data.userArtStyles[id] = updated;
    await this.saveData();
    return updated;
  }

  async deleteUserArtStyle(id: string): Promise<boolean> {
    const data = await this.loadData();
    if (data.userArtStyles[id]) {
      delete data.userArtStyles[id];
      await this.saveData();
      return true;
    }
    return false;
  }

  async getUserProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    const data = await this.loadData();
    return Object.values(data.userProfiles).find(profile => profile.userId === userId);
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const data = await this.loadData();
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
      isBanned: insertProfile.isBanned ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.userProfiles[profile.id] = profile;
    await this.saveData();
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const data = await this.loadData();
    const existing = Object.values(data.userProfiles).find(p => p.userId === userId);
    if (!existing) return undefined;

    const updated: UserProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    data.userProfiles[existing.id] = updated;
    await this.saveData();
    return updated;
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    const data = await this.loadData();
    try {
      Object.keys(data.savedImages).forEach(id => {
        if (data.savedImages[id].userId === userId) delete data.savedImages[id];
      });
      Object.keys(data.userArtStyles).forEach(id => {
        if (data.userArtStyles[id].userId === userId) delete data.userArtStyles[id];
      });
      Object.keys(data.customModels).forEach(id => {
        if (data.customModels[id].userId === userId) delete data.customModels[id];
      });
      Object.keys(data.userProfiles).forEach(id => {
        if (data.userProfiles[id].userId === userId) delete data.userProfiles[id];
      });
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      return false;
    }
  }

  async createCustomModel(insertModel: InsertCustomModel): Promise<CustomModel> {
    const data = await this.loadData();
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
    data.customModels[model.id] = model;
    await this.saveData();
    return model;
  }

  async getCustomModelsByUserId(userId: string): Promise<CustomModel[]> {
    const data = await this.loadData();
    return Object.values(data.customModels)
      .filter(model => model.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCustomModelById(id: string): Promise<CustomModel | undefined> {
    const data = await this.loadData();
    return data.customModels[id];
  }

  async updateCustomModel(id: string, updates: Partial<InsertCustomModel>): Promise<CustomModel | undefined> {
    const data = await this.loadData();
    const existing = data.customModels[id];
    if (!existing) return undefined;

    const updated: CustomModel = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    data.customModels[id] = updated;
    await this.saveData();
    return updated;
  }

  async deleteCustomModel(id: string): Promise<boolean> {
    const data = await this.loadData();
    if (data.customModels[id]) {
      delete data.customModels[id];
      await this.saveData();
      return true;
    }
    return false;
  }

  async isAdmin(email: string): Promise<boolean> {
    const data = await this.loadData();
    return Object.values(data.admins).some(admin => admin.email === email);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const data = await this.loadData();
    
    const existing = Object.values(data.admins).find(admin => admin.email === insertAdmin.email);
    if (existing) return existing;

    const admin: Admin = {
      id: randomUUID(),
      email: insertAdmin.email,
      firebaseUid: insertAdmin.firebaseUid || null,
      createdAt: new Date(),
    };
    data.admins[admin.id] = admin;
    await this.saveData();
    return admin;
  }

  async getAllImages(limit: number = 50, offset: number = 0): Promise<Image[]> {
    const data = await this.loadData();
    return Object.values(data.images)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async updateImageModerationStatus(id: string, status: string): Promise<Image | undefined> {
    const data = await this.loadData();
    const existing = data.images[id];
    if (!existing) return undefined;

    const updated: Image = {
      ...existing,
      moderationStatus: status,
    };
    data.images[id] = updated;
    await this.saveData();
    return updated;
  }

  async deleteImage(id: string): Promise<boolean> {
    const data = await this.loadData();
    if (!data.images[id]) return false;
    delete data.images[id];
    await this.saveData();
    return true;
  }

  async getAllUserProfiles(limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    const data = await this.loadData();
    return Object.values(data.userProfiles)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async deleteUserProfile(userId: string): Promise<boolean> {
    const data = await this.loadData();
    const profile = Object.values(data.userProfiles).find(p => p.userId === userId);
    if (!profile) return false;
    delete data.userProfiles[profile.id];
    await this.saveData();
    return true;
  }

  async banUser(userId: string): Promise<UserProfile | undefined> {
    const data = await this.loadData();
    const profile = Object.values(data.userProfiles).find(p => p.userId === userId);
    if (!profile) return undefined;

    const updated: UserProfile = {
      ...profile,
      isBanned: true,
    };
    data.userProfiles[profile.id] = updated;
    await this.saveData();
    return updated;
  }

  async unbanUser(userId: string): Promise<UserProfile | undefined> {
    const data = await this.loadData();
    const profile = Object.values(data.userProfiles).find(p => p.userId === userId);
    if (!profile) return undefined;

    const updated: UserProfile = {
      ...profile,
      isBanned: false,
    };
    data.userProfiles[profile.id] = updated;
    await this.saveData();
    return updated;
  }

  async getStatistics(): Promise<{
    totalImages: number;
    totalUsers: number;
    totalArtStyles: number;
    pendingModeration: number;
  }> {
    const data = await this.loadData();
    const totalImages = Object.keys(data.images).length;
    const totalUsers = Object.keys(data.userProfiles).length;
    const totalArtStyles = Object.keys(data.userArtStyles).length;
    const pendingModeration = Object.values(data.images)
      .filter(img => img.moderationStatus === 'pending').length;

    return {
      totalImages,
      totalUsers,
      totalArtStyles,
      pendingModeration,
    };
  }

  async getUserStatistics(userId: string): Promise<{
    userId: string;
    profile: UserProfile | undefined;
    totalImagesGenerated: number;
    totalImagesSaved: number;
    totalArtStylesCreated: number;
    totalCustomModels: number;
    recentImages: Image[];
    recentArtStyles: UserArtStyle[];
  }> {
    const data = await this.loadData();
    const profile = await this.getUserProfileByUserId(userId);
    
    const generatedImages = Object.values(data.images)
      .filter(img => img.userDisplayName === (profile?.displayName || userId));
    
    const savedImages = Object.values(data.savedImages)
      .filter(img => img.userId === userId);
    
    const artStyles = Object.values(data.userArtStyles)
      .filter(style => style.userId === userId);
    
    const models = Object.values(data.customModels)
      .filter(model => model.userId === userId);
    
    const recentImages = generatedImages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    const recentArtStyles = artStyles
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      userId,
      profile,
      totalImagesGenerated: generatedImages.length,
      totalImagesSaved: savedImages.length,
      totalArtStylesCreated: artStyles.length,
      totalCustomModels: models.length,
      recentImages,
      recentArtStyles,
    };
  }
}
