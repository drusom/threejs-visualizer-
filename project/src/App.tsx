import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { UnitWarehouse } from './components/UnitWarehouse';
import UnitDetailPopup from './components/UnitDetailPopup';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useUnitData } from './hooks/useUnitData';
import * as THREE from 'three';

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

// Camera controller for smooth zoom to selected unit
const CameraController: React.FC<{
  selectedUnit: string | null;
  onCameraMove?: (isMoving: boolean) => void;
}> = ({ selectedUnit, onCameraMove }) => {
  const { camera } = useThree();
  const orbitControlsRef = useRef<any>(null);

  // Default camera position
  const defaultPosition = new THREE.Vector3(0, 15, 25);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  // Target position for selected unit (you can customize these positions)
  const getUnitPosition = (unitName: string): THREE.Vector3 => {
    // These positions should match your actual unit positions in the warehouse
    const positions: { [key: string]: THREE.Vector3 } = {
      'a1': new THREE.Vector3(-15, 2, -10),
      'a2': new THREE.Vector3(-10, 2, -10),
      'a3': new THREE.Vector3(-5, 2, -10),
      'a4': new THREE.Vector3(0, 2, -10),
      'a5': new THREE.Vector3(5, 2, -10),
      'a6': new THREE.Vector3(10, 2, -10),
      'b1': new THREE.Vector3(-8, 2, -5),
      'b2': new THREE.Vector3(8, 2, -5),
      // Add more positions as needed for c1-c13, e1-e3
    };
    return positions[unitName] || new THREE.Vector3(0, 2, 0);
  };

  useFrame(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      
      if (selectedUnit) {
        const unitPosition = getUnitPosition(selectedUnit);
        const zoomPosition = unitPosition.clone().add(new THREE.Vector3(5, 8, 5));
        
        // Smoothly move camera to unit position
        camera.position.lerp(zoomPosition, 0.05);
        controls.target.lerp(unitPosition, 0.05);
      } else {
        // Return to default view
        camera.position.lerp(defaultPosition, 0.03);
        controls.target.lerp(defaultTarget, 0.03);
      }
      
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={8}
      maxDistance={50}
      target={[0, 0, 0]} // Fixed orbit center
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  );
};

// Details sidebar component
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
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 z-10 w-64">
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
        isAvailable ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
      }`}>
        <div className={`w-3 h-3 rounded-full mr-2 ${
          isAvailable ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        {isAvailable ? 'Available' : 'Occupied'}
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Size</p>
        <p className="font-medium">{data?.size || 'N/A'}</p>
      </div>
      
      <button
        onClick={onDetailsClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        View Details
      </button>
    </div>
  );
};

function App() {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading unit data...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-md text-sm z-10">
            Using offline data - Google Sheets unavailable
          </div>
        )}
        
        <Canvas 
          className="flex-1"
          shadows
          camera={{ position: [0, 15, 25], fov: 75 }}
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
          
          {/* Environment */}
          <Environment preset="city" />
          
          {/* Enhanced Camera Controls with fixed orbit center */}
          <CameraController selectedUnit={selectedUnit} />
        </Canvas>
        
        {/* Ground plane */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-200 to-transparent pointer-events-none" />
        
        {/* Details Sidebar */}
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