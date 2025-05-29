import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { WarehouseSectionProps } from '../types';
import * as THREE from 'three';

export const WarehouseSection: React.FC<WarehouseSectionProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color,
  highlightColor,
  name,
  onSelect,
  isSelected,
  isAvailable
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Determine color based on state
  const getColor = () => {
    if (isSelected) {
      return isAvailable ? '#4ade80' : '#ef4444';
    }
    return hovered ? highlightColor : color;
  };

  // Animation effect for selected or hovered state
  useFrame(() => {
    if (!meshRef.current) return;
    
    if (isSelected || hovered) {
      // Pulse effect when selected or hovered
      const pulseFactor = Math.sin(Date.now() * 0.005) * 0.05 + 1;
      meshRef.current.scale.set(
        scale[0] * pulseFactor,
        scale[1],
        scale[2] * pulseFactor
      );
    } else {
      // Reset scale when not selected or hovered
      meshRef.current.scale.set(scale[0], scale[1], scale[2]);
    }
    
    // Update material color
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.color.set(getColor());
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
      onClick={() => onSelect(name)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={getColor()} 
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
};