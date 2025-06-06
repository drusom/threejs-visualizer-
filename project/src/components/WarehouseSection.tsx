import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { WarehouseSectionProps } from '../types';
import * as THREE from 'three';

// Smooth easing function for animations
const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

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
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [currentDisplayColor, setCurrentDisplayColor] = useState(color);
  
  // Animation state
  const animationState = useRef({
    targetScale: 1,
    currentScale: 1,
    targetElevation: 0,
    currentElevation: 0,
    pulseFactor: 0,
    glowIntensity: 0,
    currentColor: new THREE.Color(color),
    targetColor: new THREE.Color(color),
  });

  // Get target colors based on state and availability
  const getTargetColor = () => {
    if (isSelected || hovered) {
      // Nice bright green for available, nice bright red for unavailable
      return isAvailable ? '#22c55e' : '#dc2626'; // Brighter green and red
    }
    return color; // Default color when not interacted with
  };

  // Handle click animation
  const handleClick = () => {
    onSelect(name);
    setClicked(true);
    
    // Reset click animation after a short duration
    setTimeout(() => setClicked(false), 300);
  };

  // Update target values based on state
  useEffect(() => {
    const state = animationState.current;
    
    // Update target color
    state.targetColor.set(getTargetColor());
    
    if (clicked) {
      // Bubble effect on click
      state.targetScale = 1.3;
      state.targetElevation = 0.3;
    } else if (isSelected) {
      // Elevated and slightly larger when selected
      state.targetScale = 1.15;
      state.targetElevation = 0.2;
    } else if (hovered) {
      // Gentle hover effect
      state.targetScale = 1.08;
      state.targetElevation = 0.1;
    } else {
      // Reset to normal
      state.targetScale = 1;
      state.targetElevation = 0;
    }
  }, [hovered, isSelected, clicked, getTargetColor]);

  // Smooth animation loop
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const animState = animationState.current;
    const mesh = meshRef.current;
    const material = materialRef.current;
    
    // Smooth color interpolation
    const colorSpeed = 5; // Speed of color transition
    animState.currentColor.lerp(animState.targetColor, delta * colorSpeed);
    
    // Smooth scale interpolation with easing
    const scaleSpeed = clicked ? 8 : 6;
    const scaleDiff = animState.targetScale - animState.currentScale;
    animState.currentScale += scaleDiff * delta * scaleSpeed;
    
    // Smooth elevation interpolation
    const elevationSpeed = clicked ? 10 : 5;
    const elevationDiff = animState.targetElevation - animState.currentElevation;
    animState.currentElevation += elevationDiff * delta * elevationSpeed;
    
    // Apply scale with elastic easing for click
    let finalScale = animState.currentScale;
    if (clicked) {
      const progress = Math.min((Date.now() % 300) / 300, 1);
      const elasticFactor = easeOutElastic(progress);
      finalScale = 1 + (animState.currentScale - 1) * elasticFactor;
    }
    
    // Gentle pulse when selected
    if (isSelected && !clicked) {
      const pulseTime = state.clock.elapsedTime * 2;
      const pulse = Math.sin(pulseTime) * 0.02 + 1;
      finalScale *= pulse;
    }
    
    // Apply transformations
    mesh.scale.set(
      scale[0] * finalScale,
      scale[1] * (1 + animState.currentElevation * 0.1), // Slight height increase
      scale[2] * finalScale
    );
    
    // Elevate the object smoothly
    const baseY = position[1];
    mesh.position.y = baseY + animState.currentElevation;
    
    // Update material properties for glow effect
    const targetGlow = hovered || isSelected ? 1 : 0;
    animState.glowIntensity += (targetGlow - animState.glowIntensity) * delta * 4;
    
    // Enhanced material properties with smooth color transitions
    material.color.copy(animState.currentColor);
    material.emissive.copy(animState.currentColor).multiplyScalar(animState.glowIntensity * 0.15);
    material.roughness = 0.3 - animState.glowIntensity * 0.1;
    material.metalness = 0.2 + animState.glowIntensity * 0.2;
    
    // Update display color for JSX
    setCurrentDisplayColor(`#${animState.currentColor.getHexString()}`);
    
    // Add subtle glow when selected or hovered
    if (hovered || isSelected) {
      const glowPulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
      material.emissiveIntensity = animState.glowIntensity * 0.2 * glowPulse;
    } else {
      material.emissiveIntensity = 0;
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[1, 1, 1]}
      radius={0.05}
      smoothness={4}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial 
        ref={materialRef}
        color={color}
        roughness={0.3}
        metalness={0.2}
        envMapIntensity={1}
        transparent={false}
      />
      
      {/* Add a subtle rim light effect when hovered/selected */}
      {(hovered || isSelected) && (
        <RoundedBox 
          args={[1.02, 1.02, 1.02]} 
          radius={0.05} 
          smoothness={4}
        >
          <meshBasicMaterial
            color={currentDisplayColor}
            transparent={true}
            opacity={0.15}
            side={THREE.BackSide}
          />
        </RoundedBox>
      )}
    </RoundedBox>
  );
};