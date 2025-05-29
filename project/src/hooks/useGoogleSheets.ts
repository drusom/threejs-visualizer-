import { useState, useEffect } from 'react';
import { initGoogleSheetsAPI, fetchAvailabilityData } from '../utils/googleSheetsService';

export const useGoogleSheets = () => {
  const [availabilityData, setAvailabilityData] = useState<Record<string, boolean>>({
    roof: true,
    panels: false,
    flooring: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Initialize the Google Sheets API
        await initGoogleSheetsAPI();
        
        // Fetch the availability data
        const data = await fetchAvailabilityData();
        setAvailabilityData(data);
      } catch (err) {
        console.error('Error fetching data from Google Sheets:', err);
        setError('Failed to fetch availability data. Using default values.');
        
        // Use default values in case of error
        setAvailabilityData({
          roof: true,
          panels: false,
          flooring: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Uncomment to enable actual Google Sheets integration
    // fetchData();
    
    // For now, we'll just use the default values
    
  }, []);

  return { availabilityData, isLoading, error };
};