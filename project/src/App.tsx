import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Warehouse } from './components/Warehouse';
import InfoPanel from './components/InfoPanel';
import Header from './components/Header';
import { WarehouseSection } from './types';

function App() {
  const [selectedSection, setSelectedSection] = useState<WarehouseSection | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Record<string, boolean>>({
    roof: true,
    panels: false,
    flooring: true
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex relative">
        {/* 3D Warehouse Canvas */}
        <div className="flex-1">
          <Canvas shadows camera={{ position: [10, 8, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow 
              shadow-mapSize-width={1024} 
              shadow-mapSize-height={1024} 
            />
            <Warehouse 
              onSectionSelect={setSelectedSection} 
              selectedSection={selectedSection}
              availabilityData={availabilityData}
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
          </Canvas>
        </div>

        {/* Information Panel */}
        <InfoPanel 
          selectedSection={selectedSection} 
          isAvailable={selectedSection ? availabilityData[selectedSection] : false}
          onClose={() => setSelectedSection(null)} 
        />
      </div>
    </div>
  );
}

export default App;