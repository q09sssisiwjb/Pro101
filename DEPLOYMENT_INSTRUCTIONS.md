# Deployment Instructions

## Files Included
- **client/**: React frontend with TypeScript
- **server/**: Express.js backend with TypeScript
- **shared/**: Shared TypeScript schemas
- **Configuration files**: package.json, vite.config.ts, tailwind.config.ts, etc.

## Deployment Steps

1. **Extract the archive**:
   ```bash
   tar -xzf website-deployment.tar.gz
   cd extracted-folder
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Start the production server**:
   ```bash
   npm start
   ```

## Server Requirements
- Node.js 18+ 
- npm or yarn package manager
- Port 5000 (or configure your preferred port)

## Important Notes
- The application serves both frontend and backend on the same port (5000)
- No database setup required (uses in-memory storage)
- No authentication required - removed for immediate access
- Ready for immediate deployment

## Production Configuration
- Update any environment variables as needed
- Configure reverse proxy if using nginx/apache
- Set up SSL certificates for HTTPS
- Configure domain settings

The application is production-ready and includes all necessary build configurations.