import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    // Skip common ignore patterns
    if (shouldIgnore(entry.name, relativePath)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

function shouldIgnore(name, relativePath) {
  const ignorePatterns = [
    /^\.git$/,
    /^node_modules$/,
    /^dist$/,
    /^\.next$/,
    /^coverage$/,
    /^\.coverage$/,
    /^\.nyc_output$/,
    /^\.DS_Store$/,
    /^Thumbs\.db$/,
    /^\.env$/,
    /^\.env\.local$/,
    /^\.env\.production$/,
    /^\.vscode$/,
    /^\.idea$/,
    /^tmp$/,
    /^logs$/,
    /\.log$/,
    /\.lock$/
  ];
  
  return ignorePatterns.some(pattern => pattern.test(name)) || relativePath.includes('/node_modules/');
}

async function pushToGitHub() {
  try {
    console.log('🚀 Starting GitHub push process...');
    
    const octokit = await getUncachableGitHubClient();
    
    // Get user info
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`👋 Authenticated as: ${user.login}`);
    
    // You'll need to update these with your actual repo details
    const owner = user.login;
    const repo = 'visionary-ai'; // Update this to your actual repo name
    
    try {
      // Try to get the repository
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      console.log(`📁 Found repository: ${repoData.full_name}`);
    } catch (error) {
      if (error.status === 404) {
        console.log('🆕 Repository not found, creating new repository...');
        await octokit.rest.repos.createForAuthenticatedUser({
          name: repo,
          description: 'Visionary AI - AI-powered image generation platform',
          private: false,
          auto_init: true
        });
        console.log(`✅ Created new repository: ${owner}/${repo}`);
      } else {
        throw error;
      }
    }
    
    // Get all files
    console.log('📂 Collecting files to upload...');
    const files = await getAllFiles(rootDir);
    console.log(`📝 Found ${files.length} files to upload`);
    
    // Get the latest commit SHA from main branch
    let parentSha;
    try {
      const { data: ref } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: 'heads/main'
      });
      parentSha = ref.object.sha;
      console.log(`📋 Latest commit SHA: ${parentSha}`);
    } catch (error) {
      // If main branch doesn't exist, we'll create an initial commit
      console.log('🌱 No main branch found, creating initial commit');
      parentSha = null;
    }
    
    // Create blobs for all files
    console.log('⬆️  Uploading files...');
    const tree = [];
    let uploadCount = 0;
    
    for (const filePath of files) {
      const fullPath = path.join(rootDir, filePath);
      
      try {
        const content = fs.readFileSync(fullPath);
        const { data: blob } = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: content.toString('base64'),
          encoding: 'base64'
        });
        
        tree.push({
          path: filePath.replace(/\\/g, '/'), // Normalize path separators
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });
        
        uploadCount++;
        if (uploadCount % 10 === 0) {
          console.log(`   Uploaded ${uploadCount}/${files.length} files...`);
        }
      } catch (error) {
        console.warn(`⚠️  Skipping ${filePath}: ${error.message}`);
      }
    }
    
    // Create tree
    console.log('🌳 Creating tree...');
    const { data: treeData } = await octokit.rest.git.createTree({
      owner,
      repo,
      tree,
      base_tree: parentSha
    });
    
    // Create commit
    console.log('💾 Creating commit...');
    const { data: commit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: 'feat: Add action buttons to generated images\n\n- Add download, regenerate, save, and edit buttons to generated images\n- Fix regenerate functionality to use original image prompt\n- Improve UI with hover overlays and loading states\n- Connect save functionality to favorites system',
      tree: treeData.sha,
      parents: parentSha ? [parentSha] : []
    });
    
    // Update reference
    console.log('🔄 Updating main branch...');
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.sha
    });
    
    console.log('✅ Successfully pushed to GitHub!');
    console.log(`🔗 Repository URL: https://github.com/${owner}/${repo}`);
    console.log(`📊 Commit: ${commit.sha}`);
    console.log(`📁 Files uploaded: ${uploadCount}/${files.length}`);
    
  } catch (error) {
    console.error('❌ Error pushing to GitHub:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  pushToGitHub().catch(console.error);
}