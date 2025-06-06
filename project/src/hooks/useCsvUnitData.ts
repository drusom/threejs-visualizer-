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
      console.log('Raw CSV data:', csvText.substring(0, 500) + '...');
      
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
      console.log('CSV Headers found:', Object.keys(parsedData[0] || {}));

      if (parsedData && parsedData.length > 0) {
        const unitDataMap: Record<string, UnitData> = {};
        
        parsedData.forEach((row: any, index: number) => {
          console.log(`Processing row ${index}:`, row);
          
          // Handle different possible column names for unit name
          const unitName = (
            row['Product'] ||        // Your column name
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
          
          // Handle checkbox values from Google Sheets
          const availableValue = (
            row['Available'] ||     // Your column name  
            row['Availability'] || 
            row['Status'] || 
            'Unknown'
          ).toString().trim();
          
          console.log(`Unit ${unitName} - Raw available value: "${availableValue}" (type: ${typeof availableValue})`);
          
          // Convert checkbox TRUE/FALSE to Available/Occupied
          let availability: string;
          if (availableValue.toLowerCase() === 'true' || availableValue === '1' || availableValue.toLowerCase() === 'yes') {
            availability = 'Available';
          } else if (availableValue.toLowerCase() === 'false' || availableValue === '0' || availableValue.toLowerCase() === 'no') {
            availability = 'Occupied';
          } else if (availableValue.toLowerCase().includes('available')) {
            availability = 'Available';
          } else if (availableValue.toLowerCase().includes('occupied') || availableValue.toLowerCase().includes('unavailable')) {
            availability = 'Occupied';
          } else {
            // Default to Available for unknown values
            availability = 'Available';
            console.warn(`Unknown availability value for ${unitName}: "${availableValue}", defaulting to Available`);
          }
          
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
            console.log(`✓ Mapped unit: ${unitName} -> Available: ${availability} (from: "${availableValue}")`);
          } else {
            console.log(`⚠️ Skipping row ${index} - no unit name found`);
          }
        });
        
        setData(unitDataMap);
        console.log('Final unit data map:', unitDataMap);
        console.log(`Successfully loaded ${Object.keys(unitDataMap).length} units from CSV`);
        
        // Show summary of availability status
        const availableCount = Object.values(unitDataMap).filter(unit => unit.availability === 'Available').length;
        const occupiedCount = Object.values(unitDataMap).filter(unit => unit.availability === 'Occupied').length;
        console.log(`📊 Summary: ${availableCount} Available, ${occupiedCount} Occupied`);
        
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