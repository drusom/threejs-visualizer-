/// <reference types="google.accounts" />

import { useEffect, useState, useCallback } from 'react';
import { GOOGLE_CONFIG } from '../config/googleConfig';

// After running `npm install --save-dev @types/google.accounts`
// TypeScript should recognize the `google` global from the GIS library.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string; // Not used for auth, but might be for API key if named similarly
const SCOPES = GOOGLE_CONFIG.SCOPES;
const DISCOVERY_DOCS = GOOGLE_CONFIG.DISCOVERY_DOCS;

export const useGoogleAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [gapiLoaded, setGapiLoaded] = useState(false); // Will be set true once gapi.client is loaded
  const [gisLoaded, setGisLoaded] = useState(true); // GIS part is bypassed, so keep true or remove
  const [isLoading, setIsLoading] = useState(true); // Start true until GAPI is loaded/failed
  const [accessToken, setAccessToken] = useState<string | null>("dummy_access_token"); // Dummy
  const [tokenClient, setTokenClient] = useState<google.accounts.oauth2.TokenClient | null>(null); // Not used

  const initGapiClient = useCallback(() => {
    console.log("DEBUG: All env variables seen by Vite:", JSON.stringify(import.meta.env));
    console.log("useGoogleAuth: Initializing GAPI client for Sheets API discovery.");
    if (typeof gapi !== 'undefined' && gapi.client) {
      // 🔑 API KEY: To change this, edit src/config/googleConfig.ts
      const apiKey = GOOGLE_CONFIG.API_KEY;
      const initParams: { apiKey?: string; discoveryDocs: string[] } = {
        discoveryDocs: DISCOVERY_DOCS,
      };

      if (apiKey) {
        console.log("useGoogleAuth: Using API key from config file for GAPI client init.");
        initParams.apiKey = apiKey;
      } else {
        console.warn("useGoogleAuth: No API key available. Attempting to initialize GAPI client without an API key for public sheet access.");
      }

      (gapi.client as any).init(initParams)
      .then(() => {
        console.log(`useGoogleAuth: GAPI client initialized for Sheets API discovery ${apiKey ? 'with API Key' : 'without API Key (for public sheet)'}.`);
        setGapiLoaded(true);
        setIsLoading(false);
      })
      .catch((error: any) => {
        console.error("Error initializing GAPI client for discovery:", error);
        setGapiLoaded(false);
        setIsLoading(false);
      });
    } else {
      console.warn("useGoogleAuth: gapi or gapi.client not available for initGapiClient at the time of call.");
      setGapiLoaded(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("useGoogleAuth useEffect: Attempting to load gapi.js and initialize GAPI client.");
    setIsLoading(true);

    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => {
      console.log("useGoogleAuth: gapi.js script loaded.");
      if (typeof gapi !== 'undefined' && typeof gapi.load === 'function') {
        gapi.load('client', () => { // Load the 'client' library
          console.log("useGoogleAuth: gapi.client loaded via gapi.load.");
          initGapiClient(); // Initialize for Sheets API
        });
      } else {
        console.error("useGoogleAuth: gapi.load is not a function after gapi.js loaded. This is unexpected.");
        setGapiLoaded(false);
        setIsLoading(false);
      }
    };
    gapiScript.onerror = () => {
        console.error("useGoogleAuth: Failed to load gapi.js script.");
        setGapiLoaded(false);
        setIsLoading(false);
    };
    document.body.appendChild(gapiScript);

    // GIS script loading is intentionally omitted.

    return () => {
      if (gapiScript.parentNode) {
        document.body.removeChild(gapiScript);
      }
    };
  }, [initGapiClient]); // initGapiClient is stable

  useEffect(() => {
    // This effect remains for logging or future use, but not for auth token setting
    // console.log("useGoogleAuth: accessToken or gapiLoaded state changed.", { accessToken, gapiLoaded });
  }, [accessToken, gapiLoaded]);

  const handleSignIn = useCallback(() => {
    console.log("useGoogleAuth handleSignIn: Called, but sign-in is bypassed.");
    // No action needed as isSignedIn is true by default and no OAuth flow.
    setIsLoading(false); // Ensure loading is false if ever set true by this path
  }, []); // Removed dependencies like tokenClient, gisLoaded, CLIENT_ID

  const handleSignOut = useCallback(() => {
    console.log("useGoogleAuth handleSignOut: Called, sign-out is effectively dummy.");
    // setAccessToken(null); // Can clear dummy token if desired
    // setIsSignedIn(false); // Could set to false, but app logic assumes true
    // If gapi.client was used with a token, it would be cleared here.
    console.log("useGoogleAuth: User signed out (bypassed).");
  }, []); // Removed accessToken, gapiLoaded from dependencies for this dummy version

  return {
    isSignedIn,
    isLoading: isLoading,
    handleSignIn,
    handleSignOut,
    accessToken // Still returning dummy token
  };
}; 