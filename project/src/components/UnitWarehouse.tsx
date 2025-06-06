import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { UnitData, LoadedModel } from '../types';

interface UnitWarehouseProps {
  onUnitSelect: (unitName: string) => void;
  selectedUnit: string | null;
  unitData: Record<string, UnitData>;
}

// Helper functions to categorize models
const isUnitFile = (fileName: string): boolean => {
  return /^[a-z]\d+\.glb$/i.test(fileName);
};

const isBridgeFile = (fileName: string): boolean => {
  return /bridge\.glb$/i.test(fileName);
};

// Simple test component for loading one model
const SingleModel: React.FC<{ fileName: string; onLoad: (model: LoadedModel) => void }> = ({ fileName, onLoad }) => {
  const baseUrl = import.meta.env.BASE_URL;
  const modelUrl = `${baseUrl}models/${fileName}`;
  const { scene } = useGLTF(modelUrl);
  
  useEffect(() => {
    if (scene) {
      const clonedScene = scene.clone();
      const modelName = fileName.replace('.glb', '');
      
      clonedScene.name = modelName;
      
      const isUnit = isUnitFile(fileName);
      const isBridge = isBridgeFile(fileName);
      
      // Set initial materials
      clonedScene.traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          if (isBridge) {
            // Bridges: neutral gray, non-interactive
            child.material = new MeshStandardMaterial({ 
              color: 0x888888, 
              metalness: 0.2, 
              roughness: 0.8 
            });
          } else if (isUnit) {
            // Units: blue default color
            child.material = new MeshStandardMaterial({ 
              color: 0x007bff, 
              metalness: 0.1, 
              roughness: 0.7 
            });
          }
          // Store original material for highlighting
          child.userData.originalMaterial = child.material.clone();
        }
      });
      
      onLoad({
        name: modelName,
        object: clonedScene,
        isUnit,
        isBridge
      });
    }
  }, [scene, fileName, onLoad]);
  
  return null; // This component doesn't render anything directly
};

export const UnitWarehouse: React.FC<UnitWarehouseProps> = ({ 
  onUnitSelect,
  selectedUnit,
  unitData
}) => {
  const groupRef = useRef<Group>(null);
  const [loadedModels, setLoadedModels] = useState<LoadedModel[]>([]);
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  
  // Animation state for each model
  const animationState = useRef<Record<string, {
    currentScale: number;
    targetScale: number;
    animationProgress: number;
    isAnimating: boolean;
    startScale: number;
  }>>({});
  
  // List of models to load - now including all available models
  const modelsToLoad = [
    'a1.glb', 'a2.glb', 'a3.glb', 'a4.glb', 'a5.glb', 'a6.glb',
    'b1.glb', 'b2.glb',
    'c1.glb', 'c2.glb', 'c3.glb', 'c4.glb', 'c5.glb', 'c6.glb', 'c7.glb', 'c8.glb', 'c9.glb', 'c10.glb', 'c11.glb', 'c12.glb', 'c13.glb',
    'e1.glb', 'e2.glb', 'e3.glb',
    'a bridge.glb', 'b bridge.glb', 'c bridge 1.glb', 'c bridge 2.glb'
  ];
  
  const handleModelLoad = useCallback((model: LoadedModel) => {
    console.log('Model loaded:', model.name);
    setLoadedModels(prev => {
      // Check if model already exists
      if (prev.some(m => m.name === model.name)) {
        return prev;
      }
      
      // Initialize animation state for new model
      if (model.isUnit && !animationState.current[model.name]) {
        animationState.current[model.name] = {
          currentScale: 1,
          targetScale: 1,
          animationProgress: 1,
          isAnimating: false,
          startScale: 1
        };
      }
      
      return [...prev, model];
    });
  }, []);

  // Handle highlighting with availability-based colors
  const applyHighlight = useCallback((object: Object3D, highlight: boolean, isSelected: boolean = false, unitName: string) => {
    const unitInfo = unitData[unitName];
    const isAvailable = unitInfo?.availability?.toLowerCase().includes('available') || unitInfo?.availability?.toLowerCase() === 'true';
    
    object.traverse((child) => {
      if (child instanceof Mesh && child.userData.originalMaterial) {
        if (highlight || isSelected) {
          // Use green for available units, red for unavailable units
          const color = isAvailable ? 0x22c55e : 0xdc2626; // Bright green or bright red
          child.material = new MeshStandardMaterial({ 
            color, 
            metalness: 0.3, 
            roughness: 0.4,
            emissive: color,
            emissiveIntensity: isSelected ? 0.15 : 0.08 // Glow effect
          });
        } else {
          // Reset to original material
          child.material = child.userData.originalMaterial.clone();
        }
        child.material.needsUpdate = true;
      }
    });
  }, [unitData]);

  // Update target scales when hover or selection changes
  useEffect(() => {
    loadedModels.forEach((model) => {
      if (model.isUnit) {
        const isHovered = hoveredUnit === model.name;
        const isSelected = selectedUnit === model.name;
        applyHighlight(model.object, isHovered, isSelected, model.name);
        
        // Enhanced scale effect with time-based transitions (more subtle)
        const baseScale = 1;
        const hoverScale = 1.02;  // Reduced from 1.05 to 1.02 (2% increase)
        const selectedScale = 1.04; // Reduced from 1.08 to 1.04 (4% increase)
        
        let targetScale = baseScale;
        if (isSelected) targetScale = selectedScale;
        else if (isHovered) targetScale = hoverScale;
        
        // Update animation state for this model
        const animState = animationState.current[model.name];
        if (animState && animState.targetScale !== targetScale) {
          animState.startScale = animState.currentScale;
          animState.targetScale = targetScale;
          animState.animationProgress = 0;
          animState.isAnimating = true;
        }
      }
    });
  }, [hoveredUnit, selectedUnit, loadedModels, applyHighlight]);

  // Smooth time-based animations using useFrame
  useFrame((state, delta) => {
    const animationDuration = 0.75; // 0.75 seconds for transitions
    
    loadedModels.forEach((model) => {
      if (model.isUnit) {
        const animState = animationState.current[model.name];
        if (animState && animState.isAnimating) {
          // Update animation progress
          animState.animationProgress += delta / animationDuration;
          
          if (animState.animationProgress >= 1) {
            // Animation complete
            animState.animationProgress = 1;
            animState.isAnimating = false;
            animState.currentScale = animState.targetScale;
          } else {
            // Smooth easing function (ease-out cubic)
            const easeProgress = 1 - Math.pow(1 - animState.animationProgress, 3);
            animState.currentScale = animState.startScale + (animState.targetScale - animState.startScale) * easeProgress;
          }
          
          // Apply the smooth scale
          model.object.scale.setScalar(animState.currentScale);
        }
      }
    });
  });

  // Handle click interactions
  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    
    // Find which model was clicked
    let clickedObject = event.object;
    while (clickedObject && !loadedModels.some(m => m.object === clickedObject)) {
      clickedObject = clickedObject.parent;
    }
    
    if (clickedObject) {
      const modelData = loadedModels.find(m => m.object === clickedObject);
      if (modelData && modelData.isUnit) {
        onUnitSelect(modelData.name);
      }
    }
  }, [loadedModels, onUnitSelect]);

  // Handle hover interactions
  const handlePointerOver = useCallback((event: any) => {
    event.stopPropagation();
    
    let hoveredObject = event.object;
    while (hoveredObject && !loadedModels.some(m => m.object === hoveredObject)) {
      hoveredObject = hoveredObject.parent;
    }
    
    if (hoveredObject) {
      const modelData = loadedModels.find(m => m.object === hoveredObject);
      if (modelData && modelData.isUnit) {
        setHoveredUnit(modelData.name);
        document.body.style.cursor = 'pointer';
      }
    }
  }, [loadedModels]);

  const handlePointerOut = useCallback((event: any) => {
    event.stopPropagation();
    setHoveredUnit(null);
    document.body.style.cursor = 'default';
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Load multiple models */}
      {modelsToLoad.map((fileName) => (
        <SingleModel 
          key={fileName}
          fileName={fileName} 
          onLoad={handleModelLoad} 
        />
      ))}
      
      {/* Base plane */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Render all loaded models */}
      {loadedModels.map((model) => (
        <primitive
          key={model.name}
          object={model.object}
          onClick={model.isUnit ? handleClick : undefined}
          onPointerOver={model.isUnit ? handlePointerOver : undefined}
          onPointerOut={model.isUnit ? handlePointerOut : undefined}
        />
      ))}
    </group>
  );
}; 