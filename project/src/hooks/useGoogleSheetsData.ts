import { useState, useEffect, useCallback } from 'react';
// Removed direct import of fetchSheetData and parseSheetData as the logic will be inlined or adapted

// Define the structure of your data from the Google Sheet
export interface ProductAvailability {
  productName: string; // "Roof", "Walls", "Floor"
  isAvailable: boolean; // TRUE/FALSE converted to boolean
}

export const useGoogleSheetsData = (
  spreadsheetId: string,
  range: string,
  isSignedIn: boolean,
  isGapiReady: boolean
) => {
  const [data, setData] = useState<ProductAvailability[]>([]);
  const [loading, setLoading] = useState(false); // Start with loading false
  const [error, setError] = useState<string | null>(null);

  const fetchSheetDataCallback = useCallback(async () => {
    if (!isSignedIn || !isGapiReady || typeof gapi === 'undefined' || !(gapi.client as any).sheets) {
      if (isGapiReady && isSignedIn) {
        console.log("useGoogleSheetsData: Aborting fetch. isSignedIn or isGapiReady is false, or gapi.client.sheets not ready.", 
                    { isSignedIn, isGapiReady, gapiDefined: typeof gapi !== 'undefined', sheetsAvailable: typeof gapi !== 'undefined' && (gapi.client as any).sheets !== undefined });
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await (gapi.client as any).sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      });

      const values = response.result.values;
      if (values && values.length > 1) { // Check for header + at least one data row
        const parsedData: ProductAvailability[] = values.slice(1) // Skip header row
          .map((row: any[]) => { // Use any[] for row initially for flexibility
            const productName = String(row[0] || ''); // First column is 'Product'
            const isAvailable = String(row[1] || 'false').toLowerCase() === 'true'; // Second column is 'Available'
            return { productName, isAvailable };
          })
          // Explicitly type item for the filter method
          .filter((item: ProductAvailability) => item.productName !== ''); // Filter out rows with no product name
        setData(parsedData);
      } else {
        setData([]); // No data rows found or only header
      }
    } catch (err: any) {
      console.error("Error fetching Google Sheet data:", err);
      setError(err.message || "Failed to fetch data.");
      setData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId, range, isSignedIn, isGapiReady]);

  useEffect(() => {
    if (isSignedIn && isGapiReady) {
      fetchSheetDataCallback();
    } else {
      setData([]);
      setLoading(false);
      if (!isGapiReady && isSignedIn) {
        console.log("useGoogleSheetsData: Waiting for GAPI to be ready...");
      }
    }

    return () => {
    };
  }, [isSignedIn, isGapiReady, fetchSheetDataCallback]);

  return { data, loading, error, refetch: fetchSheetDataCallback };
}; 