import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { UnitWarehouse } from './components/UnitWarehouse';
import UnitDetailPopup from './components/UnitDetailPopup';
import { useCsvUnitData } from './hooks/useCsvUnitData';
import * as THREE from 'three';

// Public Google Sheets CSV URL - no authentication needed
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjyYKuMPVRbxLvqW0QnF3KOVYSDQq7534KBphrXIPVvIrtOcWQ0S4_rpN4-mX5anttgLwkrOJV008T/pub?output=csv';

// Fallback unit data when CSV is not available
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

// Camera controller - no movement, just basic orbit controls
const CameraController: React.FC<{
  selectedUnit: string | null;
}> = () => {
  const orbitControlsRef = useRef<any>(null);
  
  // Better initial camera settings - flipped 180 degrees and closer
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  // Simple distance-based approach like Google Maps
  return (
    <OrbitControls
      ref={orbitControlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5} // Increased minimum distance to prevent clipping through objects
      maxDistance={25} // Reduced max distance so users don't get lost
      target={defaultTarget}
      dampingFactor={0.15} // Increased significantly for smooth drag effect
      enableDamping={true}
      rotateSpeed={0.5} // Slightly increased to work better with higher damping
      zoomSpeed={0.5}   // Slightly increased to work better with higher damping
      panSpeed={0.4}    // Keep panning gentle
      minPolarAngle={0} // Allow looking straight down
      maxPolarAngle={Math.PI * 0.48} // Prevent camera from going under ground (slightly less than PI/2)
    />
  );
};

// Details sidebar component with fixed positioning in lower right
const DetailsSidebar: React.FC<{
  selectedUnit: string | null;
  unitData: any;
  onDetailsClick: () => void;
  onClose: () => void;
}> = ({ selectedUnit, unitData, onDetailsClick, onClose }) => {
  if (!selectedUnit) return null;

  const data = unitData[selectedUnit];
  const isAvailable = data?.availability?.toLowerCase().includes('available') || data?.availability?.toLowerCase() === 'true';

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 w-64 border-2 border-slate-600 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Unit {selectedUnit.toUpperCase()}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>
      
      <div className={`mb-3 p-2 rounded flex items-center ${
        isAvailable ? 'bg-sage-50 text-sage-800' : 'bg-red-50 text-red-800'
      }`}>
        <div className={`w-3 h-3 rounded-full mr-2 ${
          isAvailable ? 'bg-sage-500' : 'bg-red-700'
        }`}></div>
        {isAvailable ? 'Available' : 'Occupied'}
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Size</p>
        <p className="font-medium">{data?.size || 'N/A'}</p>
      </div>
      
      <button
        onClick={onDetailsClick}
        className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        View Details
      </button>
    </div>
  );
};

function App() {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  
  // Use new CSV-based data fetching
  const { data: csvUnitData, loading: isUnitDataLoading, error } = useCsvUnitData(CSV_URL);

  // Use CSV data if available, otherwise fallback data
  const hasValidUnitData = csvUnitData && Object.keys(csvUnitData).length > 0;
  const effectiveUnitData = hasValidUnitData ? csvUnitData : FALLBACK_UNIT_DATA;

  // Log unit data for debugging
  useEffect(() => {
    console.log("Raw CSV unitData:", csvUnitData);
    console.log("Has valid unit data:", hasValidUnitData);
    console.log("Using effective unit data:", effectiveUnitData);
    console.log("Number of units available:", Object.keys(effectiveUnitData).length);
    
    if (error) {
      console.log("CSV loading error:", error);
    }
  }, [csvUnitData, hasValidUnitData, effectiveUnitData, error]);

  // Log selected unit when it changes
  useEffect(() => {
    console.log("Selected unit:", selectedUnit);
  }, [selectedUnit]);

  const handleUnitSelect = (unitName: string) => {
    setSelectedUnit(unitName);
    setShowFullDetails(false); // Reset full details when selecting a new unit
  };

  const handleDetailsClick = () => {
    setShowFullDetails(true);
  };

  const handleCloseDetails = () => {
    setShowFullDetails(false);
  };

  const handleCloseSidebar = () => {
    setSelectedUnit(null);
    setShowFullDetails(false);
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }} className="bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex relative">
        {isUnitDataLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
              <p>Loading unit data from CSV...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-md text-sm z-10">
            Using offline data - CSV unavailable: {error}
          </div>
        )}
        
        {hasValidUnitData && (
          <div className="absolute top-4 left-4 bg-sage-100 border border-sage-400 text-sage-700 px-3 py-2 rounded-md text-sm z-10">
            ✓ Live data from Google Sheets CSV
          </div>
        )}
        
        <Canvas 
          className="flex-1"
          shadows
          camera={{ position: [-6, 6, -8], fov: 75 }}
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
            onUnitSelect={handleUnitSelect}
            selectedUnit={selectedUnit}
            unitData={effectiveUnitData}
          />
          
          {/* Environment with custom HDRI */}
          <Environment 
            files="/textures/summer-cloudy-sky_1K_125ff5fe-96ee-4281-9a2c-2a8e690182a9.exr"
            background={true}
            environmentIntensity={1.0}
            backgroundIntensity={1.2} // Increased from 0.5 to brighten the backdrop
          />
          
          {/* Enhanced Camera Controls with proper object framing */}
          <CameraController selectedUnit={selectedUnit} />
        </Canvas>
        
        {/* White vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, 
              transparent 15%, 
              rgba(255, 255, 255, 0.2) 40%, 
              rgba(255, 255, 255, 0.6) 70%, 
              rgba(255, 255, 255, 0.9) 90%, 
              rgba(255, 255, 255, 1) 100%)`
          }}
        />
        
        {/* Ground plane */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-200 to-transparent pointer-events-none" />
        
        {/* Dynamic Details Sidebar */}
        <DetailsSidebar
          selectedUnit={selectedUnit}
          unitData={effectiveUnitData}
          onDetailsClick={handleDetailsClick}
          onClose={handleCloseSidebar}
        />
      </div>
      
      {/* Full Unit Detail Popup */}
      {showFullDetails && (
        <UnitDetailPopup 
          selectedUnit={selectedUnit}
          unitData={effectiveUnitData}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

export default App;