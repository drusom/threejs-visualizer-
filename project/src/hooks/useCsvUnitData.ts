import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { UnitData } from '../types';

export const useCsvUnitData = (csvUrl: string) => {
  const [data, setData] = useState<Record<string, UnitData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnitData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching CSV data from:', csvUrl);
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('Raw CSV data:', csvText.substring(0, 200) + '...');
      
      // Parse CSV with headers
      const parseResult = Papa.parse(csvText, { 
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim() // Clean up headers
      });

      if (parseResult.errors.length > 0) {
        console.warn('CSV parsing errors:', parseResult.errors);
      }

      const parsedData = parseResult.data as any[];
      console.log('Parsed CSV data:', parsedData);

      if (parsedData && parsedData.length > 0) {
        const unitDataMap: Record<string, UnitData> = {};
        
        parsedData.forEach((row: any) => {
          // Handle different possible column names
          const unitName = (
            row['Unit Name'] || 
            row['Building ID'] || 
            row['Building'] || 
            row['Unit'] || 
            row['Name'] ||
            ''
          ).toString().toLowerCase().trim();
          
          const size = (
            row['Size'] || 
            row['Square Feet'] || 
            row['Sq Ft'] ||
            'N/A'
          ).toString().trim();
          
          const availability = (
            row['Availability'] || 
            row['Status'] || 
            row['Available'] ||
            'Unknown'
          ).toString().trim();
          
          const amenities = (
            row['Amenities'] || 
            row['Features'] || 
            row['Package'] ||
            'None listed'
          ).toString().trim();

          if (unitName) {
            unitDataMap[unitName] = {
              name: unitName,
              size: size,
              availability: availability,
              amenities: amenities
            };
            console.log(`Mapped unit: ${unitName} -> Available: ${availability}`);
          }
        });
        
        setData(unitDataMap);
        console.log('Final unit data map:', unitDataMap);
        console.log(`Successfully loaded ${Object.keys(unitDataMap).length} units from CSV`);
      } else {
        console.log('No data found in CSV');
        setError('No data found in CSV file');
      }
    } catch (err: any) {
      console.error("Error fetching CSV data:", err);
      setError(err.message || "Failed to fetch CSV data.");
    } finally {
      setLoading(false);
    }
  }, [csvUrl]);

  useEffect(() => {
    if (csvUrl) {
      fetchUnitData();
    }
  }, [csvUrl, fetchUnitData]);

  return { data, loading, error, refetch: fetchUnitData };
}; 