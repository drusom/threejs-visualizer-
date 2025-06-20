import { useState, useEffect, useCallback } from 'react';
import { UnitData } from '../types';

interface ApiResponse {
  success: boolean;
  data: Record<string, UnitData>;
  lastUpdated: string;
  error?: string;
  message?: string;
}

export const useSecureUnitData = () => {
  const [data, setData] = useState<Record<string, UnitData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchUnitData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching unit data from secure API...');
      
      const response = await fetch('/api/unit-data');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(result.lastUpdated);
        console.log(`✓ Successfully loaded ${Object.keys(result.data).length} units from secure API`);
        
        // Show summary
        const availableCount = Object.values(result.data).filter(unit => unit.availability === 'Available').length;
        const occupiedCount = Object.values(result.data).filter(unit => unit.availability === 'Occupied').length;
        console.log(`📊 Summary: ${availableCount} Available, ${occupiedCount} Occupied`);
      } else {
        throw new Error(result.message || 'API returned error');
      }
    } catch (err: any) {
      console.error("Error fetching secure unit data:", err);
      setError(err.message || "Failed to fetch unit data from secure API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnitData();
  }, [fetchUnitData]);

  return { 
    data, 
    loading, 
    error, 
    lastUpdated,
    refetch: fetchUnitData 
  };
}; 