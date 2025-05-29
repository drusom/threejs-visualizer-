import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Warehouse } from './components/Warehouse';
import InfoPanel from './components/InfoPanel';
import Header from './components/Header';
import { WarehouseSection as SectionType } from './types';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useGoogleSheetsData } from './hooks/useGoogleSheetsData';

// Preload models (place this outside the App component function, at the top level of the module)
useGLTF.preload('/models/roof.glb');
useGLTF.preload('/models/panels.glb');
useGLTF.preload('/models/flooring.glb');

// Replace 'YOUR_GOOGLE_SHEET_ID_HERE' with your actual ID
const SPREADSHEET_ID = '1SLKorpilvUgBvH_Yz-fyQdcNdqvvJdAGhV0Uqt9RTFQ';
const RANGE = 'Sheet1!A:B'; // Adjust this range based on your sheet's structure

function App() {
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);
  const { isSignedIn, handleSignIn, handleSignOut, accessToken, isLoading: isAuthLoading } = useGoogleAuth();
  const { data: availabilityDataFromSheet, loading: isSheetDataLoading, error, refetch } = useGoogleSheetsData(
    SPREADSHEET_ID,
    RANGE,
    isSignedIn,
    !isAuthLoading
  );

  // Log the raw data from the hook
  useEffect(() => {
    console.log("Raw availability data from hook:", availabilityDataFromSheet);
  }, [availabilityDataFromSheet]);

  // Transform sheet data (array) into the Record<string, boolean> format expected by InfoPanel and Warehouse (if it still uses it directly for highlighting)
  // Or, Warehouse can also be adapted to use ProductAvailability[] directly as we did.
  // For InfoPanel, it's easier to look up by section name.
  const availabilityData: Record<string, boolean> = React.useMemo(() => {
    const record: Record<string, boolean> = {};
    availabilityDataFromSheet.forEach(item => {
      record[item.productName.toLowerCase()] = item.isAvailable;
    });
    console.log("Processed availabilityData record:", record); // Log the processed record
    return record;
  }, [availabilityDataFromSheet]);

  // Log selectedSection when it changes
  useEffect(() => {
    console.log("Selected section:", selectedSection);
    if (selectedSection) {
      console.log("Availability for selected section:", availabilityData[selectedSection]);
    }
  }, [selectedSection, availabilityData]);

  return (
    <div style={{ height: '100vh', width: '100vw' }} className="bg-gray-50 flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex-1 flex relative">
        {isSheetDataLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-90 z-10">
            Loading availability data...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-red-100 text-red-700 p-4 z-10">
            <p>Error loading sheet data: {error}</p>
            <button onClick={refetch} className="mt-2 px-4 py-1 bg-red-500 text-white rounded">Try Again</button>
          </div>
        )}
          
        <div className="flex-1 flex relative">
            <div className="flex-1">
                <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={1} 
                    castShadow 
                    shadow-mapSize-width={1024} 
                    shadow-mapSize-height={1024} 
                  />
                  <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={5}
                    maxDistance={20}
                    dampingFactor={0.05}
                    rotateSpeed={0.5}
                  />
                  <Warehouse 
                    availabilityData={availabilityDataFromSheet}
                    onSectionSelect={setSelectedSection}
                    selectedSection={selectedSection}
                  />
                </Canvas>
            </div>

            <InfoPanel 
              selectedSection={selectedSection}
              isAvailable={selectedSection ? availabilityData[selectedSection] : false}
              onClose={() => setSelectedSection(null)}
            />
        </div>
      </div>
    </div>
  );
}

export default App;