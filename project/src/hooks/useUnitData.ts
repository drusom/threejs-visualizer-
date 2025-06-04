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
        setData({});
      }
    } catch (err: any) {
      console.error("Error fetching unit data:", err);
      setError(err.message || "Failed to fetch unit data.");
      setData({});
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId, range, isSignedIn, isGapiReady]);

  useEffect(() => {
    if (isSignedIn && isGapiReady) {
      fetchUnitData();
    } else {
      setData({});
      setLoading(false);
    }
  }, [isSignedIn, isGapiReady, fetchUnitData]);

  return { data, loading, error, refetch: fetchUnitData };
}; 