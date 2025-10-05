import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import { insertImageSchema, insertSavedImageSchema, insertUserArtStyleSchema, insertUserCustomEffectSchema, insertUserProfileSchema, insertCustomModelSchema, updateCustomModelSchema, insertMessageSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { generateImageToImage, generateTextToImage } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Initialize Gemini AI with the provided API key from environment
  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!googleApiKey) {
    console.warn("Warning: No Google API key found in environment variables. AI features will be disabled.");
  }
  
  const ai = googleApiKey ? new GoogleGenAI({ apiKey: googleApiKey }) : null;

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Prompt enhancement endpoint
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt is required and must be a string" });
      }

      if (!ai) {
        return res.status(503).json({ 
          error: "AI service unavailable", 
          details: "Google API key not configured" 
        });
      }

      const enhancementPrompt = `You are an expert AI image prompt engineer. Your task is to enhance and improve image generation prompts to make them more detailed, creative, and effective for AI image generation.

Given the basic prompt: "${prompt}"

Please enhance this prompt by:
1. Adding specific visual details (lighting, colors, composition)
2. Including artistic style information if appropriate
3. Adding technical photography/art terms that improve image quality
4. Maintaining the original intent while making it more descriptive
5. Keeping it concise but detailed (aim for 1-2 sentences)

Return only the enhanced prompt, nothing else.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: enhancementPrompt,
      });

      const enhancedPrompt = response.text?.trim() || prompt;

      res.json({ enhancedPrompt });
      
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to enhance prompt", details: errorMessage });
    }
  });

  // Image to prompt generation endpoint
  app.post("/api/generate-prompt", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: "Image data is required" });
      }

      if (!ai) {
        return res.status(503).json({ 
          error: "AI service unavailable", 
          details: "Google API key not configured. Please add your Gemini API key to use this feature." 
        });
      }

      // Extract base64 data from data URL
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              },
              {
                text: "Analyze this image and create a detailed, descriptive prompt that could be used to generate a similar image with AI. Focus on: visual elements, composition, colors, lighting, style, mood, and any notable details. Return only the prompt, nothing else."
              }
            ]
          }
        ],
      });

      const prompt = response.text?.trim() || "Unable to generate prompt from image";

      res.json({ prompt });
      
    } catch (error) {
      console.error('Error generating prompt from image:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to generate prompt", details: errorMessage });
    }
  });

  // Customer Support Chat endpoint
  app.post("/api/support-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required and must be a string" });
      }

      if (!ai) {
        return res.status(503).json({ 
          error: "AI service unavailable", 
          details: "Google API key not configured" 
        });
      }

      // Build conversation history
      const conversationHistory = history && Array.isArray(history) 
        ? history.map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }))
        : [];

      // Comprehensive system message about Visionary AI
      const systemMessage = `You are a helpful customer support assistant for Visionary AI, a comprehensive AI-powered image generation and manipulation platform. Your role is to assist users with questions, troubleshooting, and guidance.

PLATFORM OVERVIEW:
Visionary AI is a full-stack TypeScript web application offering advanced AI tools for image creation and editing. It features a modern dark-themed UI built with React, Tailwind CSS, and shadcn/ui components.

CORE FEATURES & TOOLS:

1. TEXT-TO-IMAGE GENERATOR
   - Create stunning images from text descriptions
   - Powered by Google Gemini AI (gemini-2.0-flash-exp model)
   - Supports multiple art styles: Realistic, Anime, 3D Render, Abstract, Fantasy, Cartoon
   - Customizable dimensions and quality settings
   - Negative prompts to exclude unwanted elements
   - Prompt enhancement feature to improve descriptions

2. IMAGE-TO-IMAGE TRANSFORMATION
   - Transform existing images based on text prompts
   - Perfect for style transfers and variations
   - Adjustable influence strength (how much to keep from original)
   - Support for JPG and PNG formats
   - Great for creating variations of existing artwork

3. BACKGROUND REMOVER
   - Automatically detect and remove backgrounds using AI
   - Export with transparent background (PNG format)
   - Works best with clear subjects, good contrast, well-lit photos
   - Perfect for product photography and portraits

4. IMAGE UPSCALER
   - Increase image resolution using AI (2x, 4x options)
   - Enhance quality without losing detail
   - Noise reduction and sharpening options
   - Perfect for preparing images for print or high-res displays

5. IMAGE-TO-SKETCH
   - Convert photos to artistic sketches
   - Multiple sketch styles: pencil, pen, charcoal
   - Adjustable detail level and line intensity
   - Great for creating artistic portraits and coloring pages

6. CUSTOM ART STYLES
   - Create and save personal art style presets
   - Define visual characteristics, keywords, and preferences
   - Reusable across multiple generations
   - Browse community art styles created by other users
   - Share your custom styles with the community

7. CUSTOM EFFECTS
   - Create custom visual effects and filters
   - Color grading, lighting adjustments, texture overlays
   - Parameters: intensity, blend mode, color grading, texture, focus
   - Save and reuse effects across different images

8. CUSTOM BACKGROUNDS
   - Create custom backgrounds for images with removed backgrounds
   - Types: Solid colors, gradients, patterns, AI-generated scenes
   - Adjustable blur, brightness, contrast, opacity
   - Shadow integration and perspective matching features

USER FEATURES:
- Firebase Authentication (email/password and Google OAuth)
- User profiles with customizable bio, location, and website
- Save favorite images to personal collection
- Custom model configuration (Hugging Face models, custom API endpoints)
- Message system for admin communications
- Activity tracking and statistics

COMMUNITY FEATURES:
- Community gallery showcasing user-generated images
- Filter by art style and aspect ratio
- Like and interact with community creations
- Share custom art styles with others

ADMIN PANEL (for administrators):
- User management (ban/unban, delete users)
- Image moderation and deletion
- Art style management
- Platform statistics and analytics
- Send messages to users

STORAGE & DATA:
- Primary storage: Google Drive (JSON files)
- Fallback: In-memory storage
- All user data, images, and settings are securely stored

TECHNICAL DETAILS:
- Frontend: React 18 with TypeScript, React Query, Wouter routing
- Backend: Express.js with TypeScript, RESTful API
- AI Integration: Google Gemini API for image generation
- UI: Modern dark theme, mobile-responsive design
- Fonts: Inter and Space Grotesk

NAVIGATION:
- Sidebar menu for accessing all tools
- Pages: Home, Guides, Art Styles, My Art Style, Effects, Favorites, Profile, Settings, Admin (for admins), Messages
- Top bar with quick access to Tools, Guides, and Gallery sections

HOW TO HELP USERS:
1. Answer questions about features, tools, and how to use them
2. Provide step-by-step guidance for tasks
3. Troubleshoot common issues
4. Explain technical concepts in simple terms
5. Direct users to relevant guides and documentation
6. Be friendly, patient, and supportive

COMMON TROUBLESHOOTING:
- Image quality issues: Suggest using detailed prompts, trying different art styles
- Background removal not perfect: Recommend good contrast, well-lit images
- Upscaling blurry: Source image quality matters, some images may not upscale well
- Generation failures: Check internet connection, API availability, try different settings

Remember to be helpful, concise, and friendly. If you don't know something specific, acknowledge it and suggest checking the Guides page or contacting an administrator.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: systemMessage }]
          },
          ...conversationHistory,
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
      });
      
      let assistantResponse = "";
      
      // Try to get response text from different possible structures
      if (response.text) {
        assistantResponse = response.text.trim();
      } else if (response.candidates && response.candidates.length > 0) {
        const firstCandidate = response.candidates[0];
        if (firstCandidate.content && firstCandidate.content.parts) {
          assistantResponse = firstCandidate.content.parts
            .map((part: any) => part.text || '')
            .join('')
            .trim();
        }
      }
      
      if (!assistantResponse) {
        assistantResponse = "I apologize, but I'm having trouble generating a response. Please try again.";
      }

      res.json({ response: assistantResponse });
      
    } catch (error) {
      console.error('Error in support chat:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to get response", details: errorMessage });
    }
  });

  // Image endpoints
  app.post("/api/images", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validation = insertImageSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      const { prompt, negativePrompt, model, width, height, imageData, artStyle, userDisplayName } = validation.data;
      
      const newImage = await storage.createImage({
        prompt: prompt.trim(),
        negativePrompt: negativePrompt?.trim() || null,
        model,
        width,
        height,
        imageData,
        artStyle,
        userDisplayName: userDisplayName || null
      });
      
      res.json(newImage);
    } catch (error) {
      console.error('Error saving image:', error);
      res.status(500).json({ error: "Failed to save image" });
    }
  });

  app.get("/api/images", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const images = await storage.getImages(limit, offset);
      res.json(images);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.get("/api/images/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const image = await storage.getImageById(id);
      
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.json(image);
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  });

  // Saved images endpoints
  app.post("/api/saved-images", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validation = insertSavedImageSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      const { userId, prompt, negativePrompt, model, width, height, imageData, artStyle, originalImageId } = validation.data;
      
      const savedImage = await storage.createSavedImage({
        userId,
        prompt: prompt.trim(),
        negativePrompt: negativePrompt?.trim() || null,
        model,
        width,
        height,
        imageData,
        artStyle,
        originalImageId: originalImageId || null
      });
      
      res.json(savedImage);
    } catch (error) {
      console.error('Error saving image to favorites:', error);
      res.status(500).json({ error: "Failed to save image to favorites" });
    }
  });

  app.get("/api/saved-images", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const savedImages = await storage.getSavedImagesByUserId(userId, limit, offset);
      res.json(savedImages);
    } catch (error) {
      console.error('Error fetching saved images:', error);
      res.status(500).json({ error: "Failed to fetch saved images" });
    }
  });

  app.delete("/api/saved-images/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSavedImage(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Saved image not found" });
      }
      
      res.json({ success: true, message: "Image removed from favorites" });
    } catch (error) {
      console.error('Error deleting saved image:', error);
      res.status(500).json({ error: "Failed to remove image from favorites" });
    }
  });

  // User Art Style endpoints
  app.post("/api/user-art-styles", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validation = insertUserArtStyleSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      const { userId, name, description, keywords, inspiration, characteristics } = validation.data;
      
      const newArtStyle = await storage.createUserArtStyle({
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        keywords: keywords?.trim() || null,
        inspiration: inspiration?.trim() || null,
        characteristics: characteristics?.trim() || null
      });
      
      res.json(newArtStyle);
    } catch (error) {
      console.error('Error creating user art style:', error);
      res.status(500).json({ error: "Failed to create art style" });
    }
  });

  app.get("/api/user-art-styles", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const artStyles = await storage.getUserArtStylesByUserId(userId);
      res.json(artStyles);
    } catch (error) {
      console.error('Error fetching user art styles:', error);
      res.status(500).json({ error: "Failed to fetch art styles" });
    }
  });

  app.get("/api/user-art-styles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const artStyle = await storage.getUserArtStyleById(id);
      
      if (!artStyle) {
        return res.status(404).json({ error: "Art style not found" });
      }
      
      res.json(artStyle);
    } catch (error) {
      console.error('Error fetching art style:', error);
      res.status(500).json({ error: "Failed to fetch art style" });
    }
  });

  app.put("/api/user-art-styles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body using Zod schema (partial update)
      const validation = insertUserArtStyleSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      const updates = validation.data;
      const updatedArtStyle = await storage.updateUserArtStyle(id, updates);
      
      if (!updatedArtStyle) {
        return res.status(404).json({ error: "Art style not found" });
      }
      
      res.json(updatedArtStyle);
    } catch (error) {
      console.error('Error updating art style:', error);
      res.status(500).json({ error: "Failed to update art style" });
    }
  });

  app.delete("/api/user-art-styles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUserArtStyle(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Art style not found" });
      }
      
      res.json({ success: true, message: "Art style deleted successfully" });
    } catch (error) {
      console.error('Error deleting art style:', error);
      res.status(500).json({ error: "Failed to delete art style" });
    }
  });

  // Global art styles endpoint (shows all user-created art styles)
  app.get("/api/art-styles", async (req, res) => {
    try {
      const artStyles = await storage.getAllUserArtStyles();
      res.json(artStyles);
    } catch (error) {
      console.error('Error fetching all art styles:', error);
      res.status(500).json({ error: "Failed to fetch art styles" });
    }
  });

  // User Custom Effects endpoints
  app.post("/api/user-custom-effects", async (req, res) => {
    try {
      const validation = insertUserCustomEffectSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      const { userId, name, description, visualImpact, technicalDetails, useCases } = validation.data;
      
      const newCustomEffect = await storage.createUserCustomEffect({
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        visualImpact: visualImpact?.trim() || null,
        technicalDetails: technicalDetails?.trim() || null,
        useCases: useCases?.trim() || null
      });
      
      res.json(newCustomEffect);
    } catch (error) {
      console.error('Error creating custom effect:', error);
      res.status(500).json({ error: "Failed to create custom effect" });
    }
  });

  app.get("/api/user-custom-effects", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const customEffects = await storage.getUserCustomEffectsByUserId(userId);
      res.json(customEffects);
    } catch (error) {
      console.error('Error fetching user custom effects:', error);
      res.status(500).json({ error: "Failed to fetch custom effects" });
    }
  });

  app.get("/api/user-custom-effects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customEffect = await storage.getUserCustomEffectById(id);
      
      if (!customEffect) {
        return res.status(404).json({ error: "Custom effect not found" });
      }
      
      res.json(customEffect);
    } catch (error) {
      console.error('Error fetching custom effect:', error);
      res.status(500).json({ error: "Failed to fetch custom effect" });
    }
  });

  app.put("/api/user-custom-effects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const validation = insertUserCustomEffectSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      const updatedCustomEffect = await storage.updateUserCustomEffect(id, validation.data);
      
      if (!updatedCustomEffect) {
        return res.status(404).json({ error: "Custom effect not found" });
      }
      
      res.json(updatedCustomEffect);
    } catch (error) {
      console.error('Error updating custom effect:', error);
      res.status(500).json({ error: "Failed to update custom effect" });
    }
  });

  app.delete("/api/user-custom-effects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUserCustomEffect(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Custom effect not found" });
      }
      
      res.json({ success: true, message: "Custom effect deleted successfully" });
    } catch (error) {
      console.error('Error deleting custom effect:', error);
      res.status(500).json({ error: "Failed to delete custom effect" });
    }
  });

  // Global custom effects endpoint (shows all user-created custom effects)
  app.get("/api/custom-effects", async (req, res) => {
    try {
      const customEffects = await storage.getAllUserCustomEffects();
      res.json(customEffects);
    } catch (error) {
      console.error('Error fetching all custom effects:', error);
      res.status(500).json({ error: "Failed to fetch custom effects" });
    }
  });

  // Text-to-image generation endpoint
  app.post("/api/text-to-image", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({
          error: "Missing required field",
          details: "prompt is required"
        });
      }

      if (!googleApiKey) {
        return res.status(503).json({
          error: "AI service unavailable",
          details: "Gemini API key not configured"
        });
      }

      const result = await generateTextToImage(prompt);

      res.json({
        success: true,
        generatedImage: `data:image/png;base64,${result.imageData}`,
        description: result.description
      });

    } catch (error) {
      console.error('Error in text-to-image generation:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: "Failed to generate text-to-image",
        details: errorMessage
      });
    }
  });

  // Image-to-image generation endpoint using gemini-2.0-flash-exp
  app.post("/api/image-to-image", async (req, res) => {
    try {
      const { images, transformPrompt } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0 || !transformPrompt) {
        return res.status(400).json({
          error: "Missing required fields",
          details: "images array and transformPrompt are required"
        });
      }

      if (images.length > 5) {
        return res.status(400).json({
          error: "Too many images",
          details: "Maximum 5 images allowed"
        });
      }

      if (!googleApiKey) {
        return res.status(503).json({
          error: "AI service unavailable",
          details: "Gemini API key not configured"
        });
      }

      // Process all images to remove data URL prefix if present
      const processedImages = images.map(img => ({
        data: img.data.includes(',') ? img.data.split(',')[1] : img.data,
        type: img.type
      }));

      const result = await generateImageToImage(
        processedImages,
        transformPrompt
      );

      res.json({
        success: true,
        generatedImage: `data:image/png;base64,${result.imageData}`,
        description: result.description
      });

    } catch (error) {
      console.error('Error in image-to-image generation:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: "Failed to generate image-to-image transformation",
        details: errorMessage
      });
    }
  });

  // User Profile endpoints
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let profile = await storage.getUserProfileByUserId(userId);
      
      // If profile doesn't exist, create a default one
      if (!profile) {
        profile = await storage.createUserProfile({
          userId,
          displayName: null,
          bio: null,
          location: null,
          website: null,
          phone: null,
          company: null,
          jobTitle: null,
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          profileVisibility: 'public',
          showEmail: false,
          showLocation: true,
          dataSharing: false,
          defaultImageModel: 'gemini-2.5-flash',
          defaultImageQuality: 'standard',
          defaultImageSize: '1024x1024',
          autoSaveGenerations: true,
          twitterHandle: null,
          instagramHandle: null,
          linkedinUrl: null,
          githubHandle: null,
        });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      const { userId, ...updates } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Check if profile exists
      let profile = await storage.getUserProfileByUserId(userId);
      
      if (!profile) {
        // Create new profile with the updates
        profile = await storage.createUserProfile({
          userId,
          ...updates,
        });
      } else {
        // Update existing profile
        profile = await storage.updateUserProfile(userId, updates);
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // Initialize user profile on registration
  app.post("/api/auth/init-profile", async (req, res) => {
    try {
      const { userId, displayName, email } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Check if profile already exists
      const existingProfile = await storage.getUserProfileByUserId(userId);
      
      if (existingProfile) {
        return res.json(existingProfile);
      }

      // Create new user profile with default settings
      const profile = await storage.createUserProfile({
        userId,
        email: email || null,
        displayName: displayName || null,
        bio: null,
        location: null,
        website: null,
        phone: null,
        company: null,
        jobTitle: null,
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        profileVisibility: 'public',
        showEmail: false,
        showLocation: true,
        dataSharing: false,
        defaultImageModel: 'gemini-2.5-flash',
        defaultImageQuality: 'standard',
        defaultImageSize: '1024x1024',
        autoSaveGenerations: true,
        twitterHandle: null,
        instagramHandle: null,
        linkedinUrl: null,
        githubHandle: null,
      });
      
      res.json(profile);
    } catch (error) {
      console.error('Error initializing user profile:', error);
      res.status(500).json({ error: "Failed to initialize user profile" });
    }
  });

  // Custom Model endpoints
  app.post("/api/custom-models", async (req, res) => {
    try {
      const validation = insertCustomModelSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      const newModel = await storage.createCustomModel(validation.data);
      res.json(newModel);
    } catch (error) {
      console.error('Error creating custom model:', error);
      res.status(500).json({ error: "Failed to create custom model" });
    }
  });

  app.get("/api/custom-models", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const models = await storage.getCustomModelsByUserId(userId);
      // Remove API keys before sending to client for security
      const modelsWithoutKeys = models.map(({ apiKey, ...model }) => model);
      res.json(modelsWithoutKeys);
    } catch (error) {
      console.error('Error fetching custom models:', error);
      res.status(500).json({ error: "Failed to fetch custom models" });
    }
  });

  app.get("/api/custom-models/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const model = await storage.getCustomModelById(id);
      
      if (!model) {
        return res.status(404).json({ error: "Custom model not found" });
      }
      
      // Remove API key before sending to client for security
      const { apiKey, ...modelWithoutKey } = model;
      res.json(modelWithoutKey);
    } catch (error) {
      console.error('Error fetching custom model:', error);
      res.status(500).json({ error: "Failed to fetch custom model" });
    }
  });

  app.put("/api/custom-models/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validation = updateCustomModelSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      const updatedModel = await storage.updateCustomModel(id, validation.data);
      
      if (!updatedModel) {
        return res.status(404).json({ error: "Custom model not found" });
      }
      
      res.json(updatedModel);
    } catch (error) {
      console.error('Error updating custom model:', error);
      res.status(500).json({ error: "Failed to update custom model" });
    }
  });

  app.delete("/api/custom-models/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomModel(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Custom model not found" });
      }
      
      res.json({ success: true, message: "Custom model deleted successfully" });
    } catch (error) {
      console.error('Error deleting custom model:', error);
      res.status(500).json({ error: "Failed to delete custom model" });
    }
  });

  // Generate image using custom model endpoint
  app.post("/api/generate-with-custom-model", async (req, res) => {
    try {
      const { modelId, prompt } = req.body;

      if (!modelId || !prompt) {
        return res.status(400).json({
          error: "Missing required fields",
          details: "modelId and prompt are required"
        });
      }

      const customModel = await storage.getCustomModelById(modelId);
      
      if (!customModel) {
        return res.status(404).json({
          error: "Custom model not found",
          details: "The specified model ID does not exist"
        });
      }

      if (!customModel.isActive) {
        return res.status(400).json({
          error: "Model inactive",
          details: "This custom model is currently inactive"
        });
      }

      // Handle Hugging Face models
      if (customModel.modelType === 'huggingface') {
        try {
          const hfModelId = customModel.apiUrl; // For HF, apiUrl stores the model ID
          const hfApiUrl = `https://api-inference.huggingface.co/models/${hfModelId}`;
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          // Add Authorization header if API key is provided
          if (customModel.apiKey) {
            headers['Authorization'] = `Bearer ${customModel.apiKey}`;
          }
          
          // Build request body for Hugging Face API
          const hfRequestBody: Record<string, any> = {
            inputs: prompt,
          };
          
          // Add parameters that Hugging Face text-to-image models typically support
          const hfParameters: Record<string, any> = {};
          
          if (req.body.options) {
            const opts = req.body.options;
            
            // Hugging Face uses 'negative_prompt' parameter
            if (opts.negative_prompt) {
              hfParameters.negative_prompt = opts.negative_prompt;
            }
            
            // Width and height for models that support it
            if (opts.width) hfParameters.width = opts.width;
            if (opts.height) hfParameters.height = opts.height;
            
            // Seed for reproducibility
            if (opts.seed !== undefined) {
              hfParameters.seed = opts.seed;
            }
            
            // Guidance scale (common parameter)
            if (opts.guidance_scale) {
              hfParameters.guidance_scale = opts.guidance_scale;
            }
            
            // Number of inference steps
            if (opts.num_inference_steps) {
              hfParameters.num_inference_steps = opts.num_inference_steps;
            }
          }
          
          // Only add parameters object if we have any parameters
          if (Object.keys(hfParameters).length > 0) {
            hfRequestBody.parameters = hfParameters;
          }
          
          const response = await fetch(hfApiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(hfRequestBody),
          });

          const contentType = response.headers.get('content-type') || '';

          if (!response.ok) {
            const errorText = await response.text();
            let errorDetails = errorText;
            try {
              const errorJson = JSON.parse(errorText);
              errorDetails = errorJson.error || errorText;
              
              // Handle model loading or queue scenarios
              if (response.status === 503 && errorJson.estimated_time) {
                return res.status(503).json({
                  error: "Model is loading",
                  details: `The model is currently loading. Please try again in ${errorJson.estimated_time} seconds.`,
                  estimatedTime: errorJson.estimated_time
                });
              }
            } catch {
              // If not JSON, use as is
            }
            throw new Error(`Hugging Face API error: ${response.status} - ${errorDetails}`);
          }

          // Check if response is JSON (model loading or error)
          if (contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            if (jsonResponse.estimated_time) {
              return res.status(503).json({
                error: "Model is loading",
                details: `The model is currently loading. Please try again in ${jsonResponse.estimated_time} seconds.`,
                estimatedTime: jsonResponse.estimated_time
              });
            }
            throw new Error('Unexpected JSON response from Hugging Face API');
          }

          // Hugging Face returns binary image data
          const imageBuffer = await response.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          
          // Determine image format from content-type
          let imageFormat = 'png';
          if (contentType.includes('image/jpeg')) {
            imageFormat = 'jpeg';
          } else if (contentType.includes('image/webp')) {
            imageFormat = 'webp';
          } else if (contentType.includes('image/png')) {
            imageFormat = 'png';
          }
          
          res.json({
            success: true,
            generatedImage: `data:image/${imageFormat};base64,${base64Image}`
          });

        } catch (fetchError) {
          console.error('Error calling Hugging Face API:', fetchError);
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          res.status(502).json({
            error: "Failed to generate image with Hugging Face model",
            details: errorMessage
          });
        }
      } 
      // Handle custom API models
      else {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          // Add Authorization header only if API key is provided
          if (customModel.apiKey) {
            headers['Authorization'] = `Bearer ${customModel.apiKey}`;
          }

          // Build request body with common parameter names that most APIs understand
          const requestBody: Record<string, any> = {
            prompt: prompt,
            inputs: prompt, // Some APIs use 'inputs' instead of 'prompt'
          };
          
          // Add options with flexible parameter naming for compatibility
          if (req.body.options) {
            const opts = req.body.options;
            
            // Dimensions - most APIs understand these
            if (opts.width) requestBody.width = opts.width;
            if (opts.height) requestBody.height = opts.height;
            
            // Negative prompt - try multiple common names
            if (opts.negative_prompt) {
              requestBody.negative_prompt = opts.negative_prompt;
              requestBody.negativePrompt = opts.negative_prompt;
            }
            
            // Seed - for reproducibility
            if (opts.seed !== undefined) {
              requestBody.seed = opts.seed;
            }
            
            // Pass through any other options that might be API-specific
            // Art style and place can be used by APIs that support them
            if (opts.art_style) requestBody.art_style = opts.art_style;
            if (opts.place) requestBody.place = opts.place;
            if (opts.aspect_ratio) requestBody.aspect_ratio = opts.aspect_ratio;
          }

          const response = await fetch(customModel.apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorDetails = errorText;
            try {
              const errorJson = JSON.parse(errorText);
              // Try to extract meaningful error message from various formats
              errorDetails = errorJson.error || 
                            errorJson.message || 
                            errorJson.detail || 
                            errorJson.details ||
                            JSON.stringify(errorJson);
            } catch {
              // If not JSON, use as is
            }
            throw new Error(`Custom model API error: ${response.status} - ${errorDetails}`);
          }

          const contentType = response.headers.get('content-type') || '';
          let generatedImage: string | null = null;

          // Handle different response types based on content-type
          if (contentType.includes('image/')) {
            // Binary image response - convert to base64
            const imageBuffer = await response.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            
            let imageFormat = 'png';
            if (contentType.includes('image/jpeg')) {
              imageFormat = 'jpeg';
            } else if (contentType.includes('image/webp')) {
              imageFormat = 'webp';
            } else if (contentType.includes('image/png')) {
              imageFormat = 'png';
            }
            
            generatedImage = `data:image/${imageFormat};base64,${base64Image}`;
          } else if (contentType.includes('text/plain')) {
            // Plain text response - could be URL or base64
            generatedImage = await response.text();
          } else {
            // Assume JSON response - extract image from various possible formats
            const data = await response.json();
            
            // Helper function to recursively search for image data
            const extractImage = (obj: any): string | null => {
              if (!obj) return null;
              
              // Direct string
              if (typeof obj === 'string') {
                if (obj.startsWith('data:image/') || obj.startsWith('http') || obj.length > 100) {
                  return obj;
                }
              }
              
              // Common field names
              const imageFields = ['image', 'url', 'generatedImage', 'output', 'b64_json', 'artifact'];
              for (const field of imageFields) {
                if (obj[field]) {
                  const extracted = extractImage(obj[field]);
                  if (extracted) return extracted;
                }
              }
              
              // Check 'data' field (could be nested)
              if (obj.data) {
                // Handle arrays like data[0].b64_json, data[0].url, etc.
                if (Array.isArray(obj.data) && obj.data.length > 0) {
                  const extracted = extractImage(obj.data[0]);
                  if (extracted) return extracted;
                }
                // Handle nested objects like data.image, data.url
                else if (typeof obj.data === 'object') {
                  const extracted = extractImage(obj.data);
                  if (extracted) return extracted;
                }
                // Handle direct string
                else if (typeof obj.data === 'string') {
                  return obj.data;
                }
              }
              
              // Handle arrays at top level (images[0], output[0])
              if (Array.isArray(obj) && obj.length > 0) {
                return extractImage(obj[0]);
              }
              
              return null;
            };
            
            generatedImage = extractImage(data);
          }
          
          if (!generatedImage) {
            throw new Error('No image data found in custom model response');
          }
          
          // Normalize base64 strings to data URLs if they're not already
          if (typeof generatedImage === 'string' && 
              !generatedImage.startsWith('data:') && 
              !generatedImage.startsWith('http')) {
            // Detect format from base64 signature
            let format = 'png';
            if (generatedImage.startsWith('/9j/')) {
              format = 'jpeg';
            } else if (generatedImage.startsWith('iVBOR')) {
              format = 'png';
            } else if (generatedImage.startsWith('UklGR')) {
              format = 'webp';
            }
            generatedImage = `data:image/${format};base64,${generatedImage}`;
          }
          
          res.json({
            success: true,
            generatedImage: generatedImage
          });

        } catch (fetchError) {
          console.error('Error calling custom model API:', fetchError);
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          res.status(502).json({
            error: "Failed to generate image with custom model",
            details: errorMessage
          });
        }
      }

    } catch (error) {
      console.error('Error in custom model generation:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: "Failed to process custom model request",
        details: errorMessage
      });
    }
  });

  // User Profile endpoints
  app.get("/api/user-profiles/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      let profile = await storage.getUserProfileByUserId(userId);
      
      // If profile doesn't exist, create a default one
      if (!profile) {
        profile = await storage.createUserProfile({
          userId,
          displayName: null,
          bio: null,
          location: null,
          website: null,
          phone: null,
          company: null,
          jobTitle: null,
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          profileVisibility: 'public',
          showEmail: false,
          showLocation: true,
          dataSharing: false,
          defaultImageModel: 'gemini-2.5-flash',
          defaultImageQuality: 'standard',
          defaultImageSize: '1024x1024',
          useOriginalModelsOnly: false,
          autoSaveGenerations: true,
          twitterHandle: null,
          instagramHandle: null,
          linkedinUrl: null,
          githubHandle: null,
        });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user-profiles/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate request body using Zod schema
      const validation = insertUserProfileSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      // Check if profile exists
      let profile = await storage.getUserProfileByUserId(userId);
      
      if (!profile) {
        // Create new profile
        profile = await storage.createUserProfile({
          userId,
          ...validation.data
        });
      } else {
        // Update existing profile
        profile = await storage.updateUserProfile(userId, validation.data);
      }
      
      if (!profile) {
        return res.status(404).json({ error: "Failed to update profile" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  app.delete("/api/user-profiles/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // TODO: CRITICAL SECURITY ISSUE - Add Firebase authentication verification
      // This endpoint should verify the Firebase ID token and ensure the requesting
      // user matches the userId being deleted. Without this, anyone can delete any user's data.
      // Implementation should use Firebase Admin SDK to verify the token:
      // const token = req.headers.authorization?.replace('Bearer ', '');
      // const decodedToken = await admin.auth().verifyIdToken(token);
      // if (decodedToken.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
      
      const success = await storage.deleteUserAccount(userId);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete account" });
      }
      
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error('Error deleting user account:', error);
      res.status(500).json({ error: "Failed to delete user account" });
    }
  });

  // Admin routes
  app.get("/api/admin/check/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const isAdmin = await storage.isAdmin(email);
      res.json({ isAdmin });
    } catch (error) {
      console.error('Error checking admin status:', error);
      res.status(500).json({ error: "Failed to check admin status" });
    }
  });

  app.get("/api/admin/images", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const images = await storage.getAllImages(limit, offset);
      
      console.log(`[Admin] Fetched ${images.length} images for admin panel`);
      images.forEach(img => {
        console.log(`[Admin] Image ${img.id}: userDisplayName="${img.userDisplayName || 'NOT SET'}"`);
      });
      
      res.json(images);
    } catch (error) {
      console.error('Error fetching admin images:', error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.patch("/api/admin/images/:id/moderation", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid moderation status" });
      }
      
      const image = await storage.updateImageModerationStatus(id, status);
      
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.json(image);
    } catch (error) {
      console.error('Error updating image moderation status:', error);
      res.status(500).json({ error: "Failed to update moderation status" });
    }
  });

  app.get("/api/admin/user-profiles", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const profiles = await storage.getAllUserProfiles(limit, offset);
      
      // Enrich profiles with statistics and calculate online status
      const enrichedProfiles = await Promise.all(
        profiles.map(async (profile) => {
          const stats = await storage.getUserStatistics(profile.userId);
          
          // Calculate online status: user is online if last active within 5 minutes
          const now = new Date();
          const lastActive = profile.lastActive ? new Date(profile.lastActive) : null;
          const isOnline = lastActive 
            ? (now.getTime() - lastActive.getTime()) < 5 * 60 * 1000 
            : false;
          
          return {
            ...profile,
            email: profile.email || null,
            isOnline,
            lastActiveAt: profile.lastActive,
            totalImagesGenerated: stats.totalImagesGenerated,
            totalImagesSaved: stats.totalImagesSaved,
            totalArtStylesCreated: stats.totalArtStylesCreated,
            totalCustomModels: stats.totalCustomModels,
          };
        })
      );
      
      res.json(enrichedProfiles);
    } catch (error) {
      console.error('Error fetching admin user profiles:', error);
      res.status(500).json({ error: "Failed to fetch user profiles" });
    }
  });

  app.get("/api/admin/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  app.get("/api/admin/art-styles", async (req, res) => {
    try {
      const artStyles = await storage.getAllUserArtStyles();
      res.json(artStyles);
    } catch (error) {
      console.error('Error fetching art styles:', error);
      res.status(500).json({ error: "Failed to fetch art styles" });
    }
  });

  app.delete("/api/admin/art-styles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[Admin] Deleting art style: ${id}`);
      const success = await storage.deleteUserArtStyle(id);
      
      if (!success) {
        console.log(`[Admin] Art style not found: ${id}`);
        return res.status(404).json({ error: "Art style not found" });
      }
      
      console.log(`[Admin] Art style deleted successfully: ${id}`);
      res.json({ success: true, message: "Art style deleted successfully" });
    } catch (error) {
      console.error('[Admin] Error deleting art style:', error);
      res.status(500).json({ error: "Failed to delete art style" });
    }
  });

  app.delete("/api/admin/images/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[Admin] Deleting image: ${id}`);
      const success = await storage.deleteImage(id);
      
      if (!success) {
        console.log(`[Admin] Image not found: ${id}`);
        return res.status(404).json({ error: "Image not found" });
      }
      
      console.log(`[Admin] Image deleted successfully: ${id}`);
      res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
      console.error('[Admin] Error deleting image:', error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  app.delete("/api/admin/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[Admin] Deleting user: ${userId}`);
      const success = await storage.deleteUserProfile(userId);
      
      if (!success) {
        console.log(`[Admin] User not found: ${userId}`);
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`[Admin] User deleted successfully: ${userId}`);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error('[Admin] Error deleting user:', error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:userId/ban", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[Admin] Banning user: ${userId}`);
      const profile = await storage.banUser(userId);
      
      if (!profile) {
        console.log(`[Admin] User not found for ban: ${userId}`);
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`[Admin] User banned successfully: ${userId}`);
      res.json(profile);
    } catch (error) {
      console.error('[Admin] Error banning user:', error);
      res.status(500).json({ error: "Failed to ban user" });
    }
  });

  app.patch("/api/admin/users/:userId/unban", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[Admin] Unbanning user: ${userId}`);
      const profile = await storage.unbanUser(userId);
      
      if (!profile) {
        console.log(`[Admin] User not found for unban: ${userId}`);
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`[Admin] User unbanned successfully: ${userId}`);
      res.json(profile);
    } catch (error) {
      console.error('[Admin] Error unbanning user:', error);
      res.status(500).json({ error: "Failed to unban user" });
    }
  });

  app.get("/api/admin/users/:userId/statistics", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserStatistics(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      res.status(500).json({ error: "Failed to fetch user statistics" });
    }
  });

  // Admin: Send message to user
  app.post("/api/admin/messages", async (req, res) => {
    try {
      console.log('[Admin] Message send request received:', JSON.stringify(req.body, null, 2));
      
      // Verify admin status
      const { senderAdminEmail } = req.body;
      
      if (!senderAdminEmail) {
        console.log('[Admin] Error: No sender admin email provided');
        return res.status(400).json({ error: "Admin email is required" });
      }
      
      console.log('[Admin] Checking admin status for:', senderAdminEmail);
      const isAdmin = await storage.isAdmin(senderAdminEmail);
      console.log('[Admin] Is admin?', isAdmin);
      
      if (!isAdmin) {
        console.log('[Admin] Error: User is not an admin');
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }
      
      console.log('[Admin] Validating message data...');
      const validation = insertMessageSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error);
        console.log('[Admin] Validation failed:', errorMessage.toString());
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: errorMessage.toString()
        });
      }
      
      console.log('[Admin] Creating message with validated data:', validation.data);
      const message = await storage.createMessage(validation.data);
      console.log('[Admin] Message created successfully:', message.id);
      res.json(message);
    } catch (error) {
      console.error('[Admin] Error creating message:', error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Get user messages
  app.get("/api/messages", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const messages = await storage.getMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const message = await storage.markMessageAsRead(id);
      
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Delete message
  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMessage(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
