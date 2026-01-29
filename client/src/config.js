// Configuration file for the application
// GitHub Personal Access Token for accessing GitHub Gist API
// You can get one from: https://github.com/settings/tokens
// Make sure it has the 'gist' scope enabled
// 
// IMPORTANT: For production, the token should be set via environment variable
// (REACT_APP_GITHUB_TOKEN) during the build process using GitHub Secrets.
// For local development, create a .env file with REACT_APP_GITHUB_TOKEN=your_token

// GitHub Personal Access Token - use environment variable or URL parameter
// This is a placeholder - the actual token comes from process.env.REACT_APP_GITHUB_TOKEN
// or can be passed via URL parameter (?token=...) or sessionStorage
export const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN || '';

