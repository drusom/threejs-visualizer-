const express = require('express');
const { google } = require('googleapis');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Enable CORS for development
app.use(cors());
app.use(express.json());

/**
 * Securely accesses Google Sheets credentials from Google Cloud Secret Manager
 */
async function getGoogleSheetsCredentials() {
  try {
    const secretName = process.env.GCP_SECRET_NAME || 'google-sheets-credentials';
    const gcpProjectId = process.env.GCP_PROJECT_ID;

    if (!gcpProjectId) {
      console.error('GCP_PROJECT_ID environment variable not set');
      throw new Error('Server configuration error: Missing project ID');
    }
    
    const client = new SecretManagerServiceClient();
    const name = `projects/${gcpProjectId}/secrets/${secretName}/versions/latest`;
    
    console.log(`Accessing secret: ${name}`);
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString('utf8');
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error accessing credentials:', error.message);
    throw error;
  }
}

/**
 * Convert Google Sheets data to your UnitData format
 */
function transformSheetDataToUnits(sheetData) {
  if (!sheetData || sheetData.length < 2) {
    return {};
  }

  const headers = sheetData[0].map(h => h.trim());
  const rows = sheetData.slice(1);
  const unitDataMap = {};

  console.log('Headers found:', headers);

  rows.forEach((row, index) => {
    if (row.length === 0) return; // Skip empty rows

    const rowData = {};
    headers.forEach((header, i) => {
      rowData[header] = row[i] || '';
    });

    // Extract unit name (adapt these field names to match your sheets)
    const unitName = (
      rowData['Product'] ||
      rowData['Unit Name'] || 
      rowData['Building ID'] || 
      rowData['Building'] || 
      rowData['Unit'] || 
      rowData['Name'] ||
      ''
    ).toString().toLowerCase().trim();

    if (unitName) {
      // Handle availability checkbox from Google Sheets
      const availableValue = (
        rowData['Available'] ||
        rowData['Availability'] || 
        rowData['Status'] || 
        'Unknown'
      ).toString().trim();

      let availability = 'Available';
      if (availableValue.toLowerCase() === 'false' || 
          availableValue === '0' || 
          availableValue.toLowerCase() === 'no' ||
          availableValue.toLowerCase().includes('occupied')) {
        availability = 'Occupied';
      }

      unitDataMap[unitName] = {
        name: unitName,
        size: (rowData['Size'] || rowData['Square Feet'] || rowData['Sq Ft'] || 'N/A').toString().trim(),
        availability: availability,
        amenities: (rowData['Amenities'] || rowData['Features'] || rowData['Package'] || 'None listed').toString().trim()
      };

      console.log(`✓ Processed unit: ${unitName} -> ${availability}`);
    }
  });

  console.log(`Processed ${Object.keys(unitDataMap).length} units`);
  return unitDataMap;
}

/**
 * Secure API endpoint for fetching unit data
 */
app.get('/api/unit-data', async (req, res) => {
  try {
    console.log('Fetching unit data from Google Sheets...');
    
    const credentials = await getGoogleSheetsCredentials();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable not set');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:Z', // Adjust range as needed
    });

    const unitData = transformSheetDataToUnits(response.data.values);
    
    console.log('Successfully fetched and transformed unit data');
    res.json({
      success: true,
      data: unitData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching sheet data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unit data',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Serve the built React application
 */
const buildPath = path.join(__dirname, '../dist');
app.use(express.static(buildPath));

// Catch-all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Warehouse API server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Project ID: ${process.env.GCP_PROJECT_ID || 'not set'}`);
}); 