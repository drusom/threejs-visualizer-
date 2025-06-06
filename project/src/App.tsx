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
  const isTransitioning = useRef(false);
  const transitionProgress = useRef(0);

  // Default camera settings
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  // Get the actual position of units based on their loaded models
  const getUnitPosition = (unitName: string): THREE.Vector3 => {
    // These positions should roughly match your actual unit layout
    // You can adjust these based on your actual warehouse layout
    const positions: { [key: string]: THREE.Vector3 } = {
      // A-series units (front row)
      'a1': new THREE.Vector3(-12, 0, -8),
      'a2': new THREE.Vector3(-8, 0, -8),
      'a3': new THREE.Vector3(-4, 0, -8),
      'a4': new THREE.Vector3(0, 0, -8),
      'a5': new THREE.Vector3(4, 0, -8),
      'a6': new THREE.Vector3(8, 0, -8),
      
      // B-series units (middle)
      'b1': new THREE.Vector3(-6, 0, -3),
      'b2': new THREE.Vector3(6, 0, -3),
      
      // C-series units (back rows)
      'c1': new THREE.Vector3(-12, 0, 2),
      'c2': new THREE.Vector3(-9, 0, 2),
      'c3': new THREE.Vector3(-6, 0, 2),
      'c4': new THREE.Vector3(-3, 0, 2),
      'c5': new THREE.Vector3(0, 0, 2),
      'c6': new THREE.Vector3(3, 0, 2),
      'c7': new THREE.Vector3(6, 0, 2),
      'c8': new THREE.Vector3(9, 0, 2),
      'c9': new THREE.Vector3(12, 0, 2),
      'c10': new THREE.Vector3(-9, 0, 5),
      'c11': new THREE.Vector3(-6, 0, 5),
      'c12': new THREE.Vector3(-3, 0, 5),
      'c13': new THREE.Vector3(0, 0, 5),
      
      // E-series units (special/executive)
      'e1': new THREE.Vector3(-4, 0, 8),
      'e2': new THREE.Vector3(0, 0, 8),
      'e3': new THREE.Vector3(4, 0, 8),
    };
    return positions[unitName] || new THREE.Vector3(0, 0, 0);
  };

  // Handle target changes when unit selection changes
  useEffect(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      
      if (selectedUnit) {
        // Start transition to unit
        const unitPosition = getUnitPosition(selectedUnit);
        isTransitioning.current = true;
        transitionProgress.current = 0;
        
        // Animate the controls target to the unit position
        const animate = () => {
          if (transitionProgress.current < 1) {
            transitionProgress.current += 0.02; // Adjust speed here
            
            // Lerp the target to the unit position
            const currentTarget = controls.target.clone();
            currentTarget.lerp(unitPosition, transitionProgress.current);
            controls.target.copy(currentTarget);
            
            // Smoothly move camera closer to the unit
            const idealDistance = 12; // Distance from the unit
            const currentDistance = camera.position.distanceTo(unitPosition);
            if (currentDistance > idealDistance + 2) {
              const direction = camera.position.clone().sub(unitPosition).normalize();
              const newPosition = unitPosition.clone().add(direction.multiplyScalar(idealDistance));
              newPosition.y = Math.max(newPosition.y, 3); // Maintain minimum height
              camera.position.lerp(newPosition, 0.02);
            }
            
            controls.update();
            requestAnimationFrame(animate);
          } else {
            isTransitioning.current = false;
          }
        };
        animate();
        
      } else {
        // Return to world center
        isTransitioning.current = true;
        transitionProgress.current = 0;
        
        const animate = () => {
          if (transitionProgress.current < 1) {
            transitionProgress.current += 0.02;
            
            // Lerp back to default target
            const currentTarget = controls.target.clone();
            currentTarget.lerp(defaultTarget, transitionProgress.current);
            controls.target.copy(currentTarget);
            
            controls.update();
            requestAnimationFrame(animate);
          } else {
            isTransitioning.current = false;
          }
        };
        animate();
      }
    }
  }, [selectedUnit, camera]);

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      target={defaultTarget} // Initial target, will be animated
      dampingFactor={0.05}
      enableDamping={true}
      rotateSpeed={0.8}
      zoomSpeed={0.8}
      panSpeed={0.8}
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