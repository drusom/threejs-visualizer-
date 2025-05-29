import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { WarehouseSection as SectionType } from '../types';
import { WarehouseSection } from './WarehouseSection';
import { Group } from 'three';

interface WarehouseProps {
  onSectionSelect: (section: SectionType) => void;
  selectedSection: SectionType | null;
  availabilityData: Record<string, boolean>;
}

export const Warehouse: React.FC<WarehouseProps> = ({ 
  onSectionSelect,
  selectedSection,
  availabilityData
}) => {
  const groupRef = useRef<Group>(null);

  // Add subtle animation to the warehouse
  useFrame((state) => {
    if (groupRef.current && !selectedSection) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Base - always present */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Warehouse Sections */}
      <WarehouseSection
        position={[0, 3, 0]} // Raised the roof position from 2.5 to 3
        scale={[3, 0.2, 3]}
        color="#8D99AE"
        highlightColor="#2B2D42"
        name="roof"
        onSelect={onSectionSelect}
        isSelected={selectedSection === 'roof'}
        isAvailable={availabilityData['roof']}
      />

      <WarehouseSection
        position={[0, 1.25, 0]}
        scale={[3, 2.5, 3]}
        color="#A8DADC"
        highlightColor="#457B9D"
        name="panels"
        onSelect={onSectionSelect}
        isSelected={selectedSection === 'panels'}
        isAvailable={availabilityData['panels']}
      />

      <WarehouseSection
        position={[0, -0.1, 0]}
        scale={[3.2, 0.2, 3.2]}
        color="#CCD5AE"
        highlightColor="#606C38"
        name="flooring"
        onSelect={onSectionSelect}
        isSelected={selectedSection === 'flooring'}
        isAvailable={availabilityData['flooring']}
      />
    </group>
  );
};