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

function App() {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const { isSignedIn, isLoading: isAuthLoading } = useGoogleAuth();
  const { data: unitData, loading: isUnitDataLoading, error, refetch } = useUnitData(
    SPREADSHEET_ID,
    RANGE,
    isSignedIn,
    !isAuthLoading
  );

  // Log unit data for debugging
  useEffect(() => {
    console.log("Unit data:", unitData);
  }, [unitData]);

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
        
        {error && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-red-100 text-red-700 p-4 z-10">
            <p className="mb-4">Error loading unit data: {error}</p>
            <button 
              onClick={refetch} 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
          
        <div className="flex-1">
          <Canvas 
            camera={{ position: [15, 10, 15], fov: 50 }}
            shadows
            gl={{ preserveDrawingBuffer: true }}
          >
            {/* HDRI Environment Lighting - provides realistic lighting and reflections */}
            <Environment 
              preset="warehouse" 
              background={false}
              blur={0.1}
            />
            
            {/* Optional: Add a subtle directional light for shadows */}
            <directionalLight 
              position={[10, 15, 10]} 
              intensity={0.15}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-near={0.1}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            
            {/* Very subtle ambient light to fill dark areas */}
            <ambientLight intensity={0.05} />
            
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={8}
              maxDistance={30}
              dampingFactor={0.05}
              rotateSpeed={0.5}
            />
            <UnitWarehouse 
              unitData={unitData}
              onUnitSelect={setSelectedUnit}
              selectedUnit={selectedUnit}
            />
          </Canvas>
        </div>

        <UnitDetailPopup 
          selectedUnit={selectedUnit}
          unitData={unitData}
          onClose={() => setSelectedUnit(null)}
        />
      </div>
    </div>
  );
}

export default App;