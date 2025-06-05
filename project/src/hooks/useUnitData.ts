import { useState, useEffect, useCallback } from 'react';
import { UnitData } from '../types';

export const useUnitData = (
  spreadsheetId: string,
  range: string,
  isSignedIn: boolean,
  isGapiReady: boolean
) => {
  const [data, setData] = useState<Record<string, UnitData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnitData = useCallback(async () => {
    if (!isSignedIn || !isGapiReady || typeof gapi === 'undefined' || !(gapi.client as any).sheets) {
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
      if (values && values.length > 1) {
        // Assuming columns: Unit Name | Size | Availability | Amenities
        const unitDataMap: Record<string, UnitData> = {};
        
        values.slice(1).forEach((row: any[]) => {
          const unitName = String(row[0] || '').toLowerCase().trim();
          if (unitName) {
            unitDataMap[unitName] = {
              name: unitName,
              size: String(row[1] || 'N/A'),
              availability: String(row[2] || 'Unknown'),
              amenities: String(row[3] || 'None listed')
            };
          }
        });
        
        setData(unitDataMap);
        console.log('Unit data fetched:', unitDataMap);
      } else {
        // Don't clear data if no values - let App component handle fallback
        console.log('No data values found in Google Sheets response');
      }
    } catch (err: any) {
      console.error("Error fetching unit data:", err);
      setError(err.message || "Failed to fetch unit data.");
      // Don't clear data on error - let App component handle fallback
      console.log('Using fallback data due to Google Sheets error');
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId, range, isSignedIn, isGapiReady]);

  useEffect(() => {
    if (isSignedIn && isGapiReady) {
      fetchUnitData();
    } else {
      // Don't clear data when not ready - let App component handle fallback
      setLoading(false);
    }
  }, [isSignedIn, isGapiReady, fetchUnitData]);

  return { data, loading, error, refetch: fetchUnitData };
}; 