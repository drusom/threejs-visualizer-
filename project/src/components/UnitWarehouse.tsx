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

// List of all GLB files to load
const GLB_FILES = [
  'a bridge.glb', 'a1.glb', 'a2.glb', 'a3.glb', 'a4.glb', 'a5.glb', 'a6.glb',
  'b bridge.glb', 'b1.glb', 'b2.glb',
  'c bridge 1.glb', 'c bridge 2.glb', 'c1.glb', 'c2.glb', 'c3.glb', 'c4.glb', 
  'c5.glb', 'c6.glb', 'c7.glb', 'c8.glb', 'c9.glb', 'c10.glb', 'c11.glb', 'c12.glb', 'c13.glb',
  'e1.glb', 'e2.glb', 'e3.glb'
];

export const UnitWarehouse: React.FC<UnitWarehouseProps> = ({ 
  onUnitSelect,
  selectedUnit,
  unitData
}) => {
  const groupRef = useRef<Group>(null);
  const [loadedModels, setLoadedModels] = useState<LoadedModel[]>([]);
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  
  const baseUrl = import.meta.env.BASE_URL;

  // Load all GLB models
  useEffect(() => {
    const loadAllModels = async () => {
      const models: LoadedModel[] = [];
      
      for (const fileName of GLB_FILES) {
        try {
          // Use the useGLTF hook result directly
          const result = useGLTF(`${baseUrl}models/${fileName}`);
          if (!result || !result.scene) {
            console.warn(`Failed to load ${fileName}: missing scene`);
            continue;
          }
          
          const clonedScene = result.scene.clone();
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
          
          models.push({
            name: modelName,
            object: clonedScene,
            isUnit,
            isBridge
          });
          
        } catch (error) {
          console.error(`Error loading GLB file: ${fileName}`, error);
        }
      }
      
      setLoadedModels(models);
      console.log('All models loaded:', models);
    };

    loadAllModels();
  }, [baseUrl]);

  // Handle highlighting
  const applyHighlight = useCallback((object: Object3D, highlight: boolean, isSelected: boolean = false) => {
    object.traverse((child) => {
      if (child instanceof Mesh && child.userData.originalMaterial) {
        if (highlight || isSelected) {
          const color = isSelected ? 0xffd700 : 0xffaa00; // Gold for selected, orange for hover
          child.material = new MeshStandardMaterial({ 
            color, 
            metalness: 0.3, 
            roughness: 0.5 
          });
        } else {
          child.material = child.userData.originalMaterial.clone();
        }
        child.material.needsUpdate = true;
      }
    });
  }, []);

  // Apply highlighting when hover or selection changes
  useEffect(() => {
    loadedModels.forEach((model) => {
      if (model.isUnit) {
        const isHovered = hoveredUnit === model.name;
        const isSelected = selectedUnit === model.name;
        applyHighlight(model.object, isHovered, isSelected);
        
        // Scale effect
        const scale = isSelected ? 1.05 : isHovered ? 1.02 : 1;
        model.object.scale.setScalar(scale);
      }
    });
  }, [hoveredUnit, selectedUnit, loadedModels, applyHighlight]);

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

// Preload all models with correct base URL for GitHub Pages
GLB_FILES.forEach(fileName => {
  useGLTF.preload(`${import.meta.env.BASE_URL}models/${fileName}`);
}); 