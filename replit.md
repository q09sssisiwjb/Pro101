# Overview

Visionary AI is a comprehensive AI tools platform offering a suite of AI-powered image generation and manipulation capabilities. Built as a full-stack TypeScript application with a React frontend and Express.js backend, it provides features such as text-to-image generation, background removal, image upscaling, sketching, and image-to-image transformation. The platform aims to deliver a modern user experience with a dark-themed UI, community gallery, and efficient access to AI tools. The project's ambition is to provide a robust, scalable, and user-friendly platform for AI image creation and modification.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
The platform features a modern dark-themed UI built with React 18, Tailwind CSS, and shadcn/ui components. It adopts a mobile-first approach with responsive design, utilizes Inter and Space Grotesk fonts, and includes a comprehensive UI component library based on Radix UI primitives. A dedicated `/guides` page provides documentation for all AI tools and features with a tabbed interface. An admin panel is also implemented for user and image management.

## Technical Implementations
The frontend uses React 18 with TypeScript, React Query for server state management, and Wouter for routing. Vite handles frontend development and builds. The backend is an Express.js server with TypeScript, following a RESTful API design, operating on Node.js 18+ with ESM modules. It includes centralized route registration, global error handling, and custom logging middleware.

## Feature Specifications
Key features include:
- **AI Image Tools**: Text-to-Image, Image-to-Image, Background Remover, Upscaler, Image-to-Sketch, and Custom Art Styles.
- **User Management**: Firebase Authentication for email/password and Google OAuth, user profiles, image saving, and custom model configuration.
- **Admin Panel**: Comprehensive management of users (ban/unban, delete), images (moderate, delete), art styles, and platform statistics.
- **Community Gallery**: Display of generated images with filters.
- **Storage Flexibility**: Abstracted storage with primary use of Google Drive for persistence, with fallback to in-memory storage.

## System Design Choices
The application uses a flexible storage abstraction layer. While PostgreSQL with Drizzle ORM is provisioned, the primary persistent storage is configured to use Google Drive, storing data as JSON files. Firebase Authentication manages user sessions and authentication states. The build process uses Vite for the frontend and ESBuild for the backend. The Express server serves both the API and frontend on a single port.

# External Dependencies

## Database and Storage
- **Google Drive**: Primary persistent storage for application data (users, images, art styles, profiles, custom models, admins).
- **PostgreSQL**: Provisioned but not actively used for primary storage.
- **Drizzle ORM**: For type-safe database queries (if PostgreSQL were to be used).

## Authentication Services
- **Firebase Authentication**: User authentication and management (email/password, Google OAuth).
- **Firebase SDK**: Client-side authentication handling.

## AI/ML Integrations
- **Google Gemini API**: Requires `GOOGLE_API_KEY` or `GEMINI_API_KEY` environment variable for AI image generation features (e.g., Gemini 2.0 Flash Experimental model).
- **Hugging Face**: Support for custom models via Hugging Face APIs.

## UI and Frontend Libraries
- **React**: Frontend framework.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: UI component library built on Radix UI.
- **Radix UI**: Headless UI primitives.
- **Lucide React**: Icon library.
- **React Query**: Server state management.
- **Wouter**: Lightweight client-side routing.
- **React Hook Form**: Form management and validation.

## Development and Build Tools
- **TypeScript**: Language for type safety.
- **Vite**: Frontend build tool.
- **ESBuild**: Backend bundling.

## Third-party Integrations
- **Google Fonts**: Web font loading.
- **Unsplash/Pixabay**: Placeholder content for image galleries.

# Replit Environment Setup

## Current Status (Last Updated: October 4, 2025 - Import Completed)

The application has been successfully imported from GitHub and configured to run in the Replit environment. The setup is complete and the application is fully functional.

### Completed Setup
✅ Node.js 20 installed and configured
✅ All npm dependencies installed and working
✅ Workflow configured for port 5000 with webview output
✅ Frontend server running on 0.0.0.0:5000
✅ Host configuration (`allowedHosts: true`) properly set for Replit proxy
✅ Deployment configuration set for autoscale (build + run commands configured)
✅ Application successfully loads and displays UI
✅ Backend API responding correctly (health check verified)
✅ Vite HMR (Hot Module Replacement) connected and working
✅ .gitignore file created for Node.js project
✅ Storage system initialized (using in-memory storage with Google Drive fallback)
✅ Default admin account created (eeweed27ai@admin.com)

### Required Environment Variables

To enable full functionality, the following environment variables need to be configured in Replit Secrets:

1. **Google Gemini API** (Required for AI image generation):
   - `GOOGLE_API_KEY` or `GEMINI_API_KEY`
   - Get from: https://aistudio.google.com/apikey

2. **Firebase Authentication** (Required for user login/signup):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` (optional)
   - Get from: Firebase Console (https://console.firebase.google.com)

3. **Google Drive Integration** (Optional, for persistent storage):
   - The app includes Google Drive integration code for persistent storage
   - **Current Status**: Using in-memory storage (data is not persisted across restarts)
   - To enable persistent storage via Google Drive:
     * Use the Replit integrations search to find and set up the "google-drive" connector
     * The connector will automatically handle authentication and provide necessary environment variables
     * Once connected, the app will automatically use Google Drive storage instead of in-memory storage
   
4. **Database** (Optional):
   - `DATABASE_URL` - PostgreSQL connection string
   - Not currently required - app uses in-memory storage by default
   - Can be enabled for persistent storage instead of Google Drive

### Running the Project

The project is configured with a single workflow:
- **Workflow Name**: "Start application"
- **Command**: `npm run dev`
- **Port**: 5000
- **Output**: webview

The workflow starts automatically and serves both the frontend and backend API on the same port.

### Development Notes

- The Vite dev server is configured to accept all hosts (required for Replit proxy)
- Frontend runs on 0.0.0.0:5000 with HMR (Hot Module Replacement)
- Backend API routes are prefixed with `/api`
- The server handles both development (Vite middleware) and production (static files)
- No separate backend server needed - Express serves everything on port 5000

### Security Considerations

**Admin Message System Authentication:**
- The admin message system verifies admin status by checking the provided email against the admin list
- **Limitation**: The current implementation relies on client-provided credentials without server-side session verification
- **Recommended Enhancement**: For production deployments, implement Firebase Admin SDK middleware to verify authentication tokens server-side
- This limitation also applies to other admin routes in the application
- The frontend authentication (Firebase) is separate from backend authorization checks

### Deployment

Deployment is configured for Replit Autoscale:
- **Build**: `npm run build`
- **Run**: `npm run start`
- **Target**: autoscale (stateless web app)

The build process compiles both frontend (Vite) and backend (ESBuild) for production.