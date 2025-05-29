/**
 * Google API Configuration
 * 
 * IMPORTANT: To update the Google API key, simply change the value below.
 * This is the only place you need to modify when switching API keys.
 */

export const GOOGLE_CONFIG = {
  // 🔑 UPDATE THIS API KEY WHEN NEEDED:
  API_KEY: "AIzaSyBKn2f5hU94LyVdMpAdIimaWooPtblONgo",
  
  // Other Google API settings (modify if needed):
  DISCOVERY_DOCS: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  SCOPES: "https://www.googleapis.com/auth/spreadsheets.readonly"
};

// 📋 Instructions for updating the API key:
// 1. Open this file: src/config/googleConfig.ts
// 2. Replace the API_KEY value above with your new key
// 3. Save the file and restart your development server 