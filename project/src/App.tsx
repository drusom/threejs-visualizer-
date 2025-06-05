import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { UnitWarehouse } from './components/UnitWarehouse';
import UnitDetailPopup from './components/UnitDetailPopup';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useUnitData } from './hooks/useUnitData';

// Replace with your actual Google Sheet ID
const SPREADSHEET_ID = '1SLKorpilvUgBvH_Yz-fyQdcNdqvvJdAGhV0Uqt9RTFQ';
const RANGE = 'Sheet1!A:D'; // Unit Name | Size | Availability | Amenities

// Fallback unit data when Google Sheets is not available
const FALLBACK_UNIT_DATA = {
  'a1': { name: 'a1', size: '1,200 sq ft', availability: 'Available', amenities: 'Standard package' },
  'a2': { name: 'a2', size: '1,200 sq ft', availability: 'Available', amenities: 'Standard package' },
  'a3': { name: 'a3', size: '1,200 sq ft', availability: 'Occupied', amenities: 'Standard package' },
  'a4': { name: 'a4', size: '1,200 sq ft', availability: 'Available', amenities: 'Standard package' },
  'a5': { name: 'a5', size: '1,200 sq ft', availability: 'Available', amenities: 'Standard package' },
  'a6': { name: 'a6', size: '1,200 sq ft', availability: 'Occupied', amenities: 'Standard package' },
  'b1': { name: 'b1', size: '1,500 sq ft', availability: 'Available', amenities: 'Premium package' },
  'b2': { name: 'b2', size: '1,500 sq ft', availability: 'Available', amenities: 'Premium package' },
  'c1': { name: 'c1', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c2': { name: 'c2', size: '900 sq ft', availability: 'Occupied', amenities: 'Basic package' },
  'c3': { name: 'c3', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c4': { name: 'c4', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c5': { name: 'c5', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c6': { name: 'c6', size: '900 sq ft', availability: 'Occupied', amenities: 'Basic package' },
  'c7': { name: 'c7', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c8': { name: 'c8', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c9': { name: 'c9', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c10': { name: 'c10', size: '900 sq ft', availability: 'Occupied', amenities: 'Basic package' },
  'c11': { name: 'c11', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c12': { name: 'c12', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'c13': { name: 'c13', size: '900 sq ft', availability: 'Available', amenities: 'Basic package' },
  'e1': { name: 'e1', size: '2,000 sq ft', availability: 'Available', amenities: 'Executive package' },
  'e2': { name: 'e2', size: '2,000 sq ft', availability: 'Available', amenities: 'Executive package' },
  'e3': { name: 'e3', size: '2,000 sq ft', availability: 'Occupied', amenities: 'Executive package' },
};

function App() {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const { isSignedIn, isLoading: isAuthLoading } = useGoogleAuth();
  const { data: unitData, loading: isUnitDataLoading, error, refetch } = useUnitData(
    SPREADSHEET_ID,
    RANGE,
    isSignedIn,
    !isAuthLoading
  );

  // Use fallback data if Google Sheets fails or is empty
  const hasValidUnitData = unitData && Object.keys(unitData).length > 0;
  const effectiveUnitData = hasValidUnitData ? unitData : FALLBACK_UNIT_DATA;

  // Log unit data for debugging
  useEffect(() => {
    console.log("Raw unitData from Google Sheets:", unitData);
    console.log("Has valid unit data:", hasValidUnitData);
    console.log("Using effective unit data:", effectiveUnitData);
    console.log("Number of units available:", Object.keys(effectiveUnitData).length);
  }, [unitData, hasValidUnitData, effectiveUnitData]);

  // Log selected unit when it changes
  useEffect(() => {
    console.log("Selected unit:", selectedUnit);
  }, [selectedUnit]);

  return (
    <div style={{ height: '100vh', width: '100vw' }} className="bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex relative">
        {isUnitDataLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading unit data...</p>
            </div>
          </div>
        )}
        
        {/* Removed the error overlay - will use fallback data instead */}
        {error && (
          <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-md text-sm z-10">
            Using offline data - Google Sheets unavailable
          </div>
        )}
        
        <Canvas 
          className="flex-1"
          shadows
          camera={{ position: [0, 10, 20], fov: 75 }}
        >
          {/* Lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          {/* 3D Scene */}
          <UnitWarehouse 
            onUnitSelect={setSelectedUnit}
            selectedUnit={selectedUnit}
            unitData={effectiveUnitData}
          />
          
          {/* Environment */}
          <Environment preset="city" />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Canvas>
        
        {/* Ground plane */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-200 to-transparent pointer-events-none" />
      </div>
      
      {/* Unit Detail Popup */}
      <UnitDetailPopup 
        selectedUnit={selectedUnit}
        unitData={effectiveUnitData}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  );
}

export default App;