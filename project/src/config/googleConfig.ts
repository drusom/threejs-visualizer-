/**
 * Google API Configuration
 * 
 * IMPORTANT: To update the Google API key, simply change the value below.
 * This is the only place you need to modify when switching API keys.
 */

// Google API Configuration
// ⚠️ IMPORTANT: Never commit real API keys to public repositories
// Use environment variables for production deployments

export const GOOGLE_CONFIG = {
  // Load API key from environment variable
  // For local development: Set VITE_GOOGLE_API_KEY in .env file
  // For production: Set this in your deployment environment
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || "",
  
  // Other Google API settings (modify if needed):
  DISCOVERY_DOCS: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  SCOPES: "https://www.googleapis.com/auth/spreadsheets.readonly"
};

// 📋 Instructions for updating the API key:
// 1. Open this file: src/config/googleConfig.ts
// 2. Replace the API_KEY value above with your new key
// 3. Save the file and restart your development server 

// Instructions for setting up the API key:
// 1. Create a .env file in your project root (don't commit this file!)
// 2. Add: VITE_GOOGLE_API_KEY=your_actual_api_key_here
// 3. For GitHub Pages deployment, you'll need to set this environment variable
//    in your build process or use a different approach for public deployment 