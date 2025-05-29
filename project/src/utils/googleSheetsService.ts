import { gapi } from 'gapi-script';

// Google Sheets API configuration
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your actual spreadsheet ID
const RANGE = 'Sheet1!A2:B4'; // Adjust based on your sheet structure

// Initialize the Google Sheets API
export const initGoogleSheetsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        console.log('Google Sheets API initialized successfully');
        resolve();
      } catch (error) {
        console.error('Error initializing Google Sheets API:', error);
        reject(error);
      }
    });
  });
};

// Fetch availability data from Google Sheets
export const fetchAvailabilityData = async (): Promise<Record<string, boolean>> => {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.result.values || [];
    const availabilityData: Record<string, boolean> = {};

    // Process the rows from the spreadsheet
    // Example format: [["roof", "true"], ["panels", "false"], ["flooring", "true"]]
    rows.forEach(row => {
      if (row.length >= 2) {
        const section = row[0].toLowerCase();
        const isAvailable = row[1].toLowerCase() === 'true';
        availabilityData[section] = isAvailable;
      }
    });

    return availabilityData;
  } catch (error) {
    console.error('Error fetching availability data:', error);
    // Return default values in case of error
    return {
      roof: true,
      panels: true,
      flooring: true
    };
  }
};