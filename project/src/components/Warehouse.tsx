import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { WarehouseSection as SectionType } from '../types';
import { Group, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { ProductAvailability } from '../hooks/useGoogleSheetsData';
import { useSpring, animated, config } from '@react-spring/three';
import { applyTexturesToModel } from '../utils/textureLoader';

interface WarehouseProps {
  onSectionSelect: (section: SectionType) => void;
  selectedSection: SectionType | null;
  availabilityData: ProductAvailability[];
}

export const Warehouse: React.FC<WarehouseProps> = ({ 
  onSectionSelect,
  selectedSection,
  availabilityData
}) => {
  const groupRef = useRef<Group>(null);
  
  // Use BASE_URL to ensure models load from correct path in both dev and production
  const baseUrl = import.meta.env.BASE_URL;
  
  // Load GLTF models with error handling
  const { nodes: roofNodes, materials: roofMaterials } = useGLTF(`${baseUrl}models/roof.glb`);
  const { nodes: panelsNodes, materials: panelsMaterials } = useGLTF(`${baseUrl}models/panels.glb`);
  const { nodes: flooringNodes, materials: flooringMaterials } = useGLTF(`${baseUrl}models/flooring.glb`);

  const [roofHovered, setRoofHovered] = useState(false);
  const [panelsHovered, setPanelsHovered] = useState(false);
  const [flooringHovered, setFlooringHovered] = useState(false);
  const [texturesApplied, setTexturesApplied] = useState(false);

  // Store original materials to revert highlights
  const originalMaterialsRef = useRef<Map<string, MeshStandardMaterial>>(new Map());

  // Apply textures when models are loaded
  useEffect(() => {
    const applyAllTextures = async () => {
      if (!texturesApplied && roofNodes.Scene && panelsNodes.Scene && flooringNodes.Scene) {
        try {
          console.log('Applying textures to models...');
          await Promise.all([
            applyTexturesToModel(roofNodes.Scene, 'roof'),
            applyTexturesToModel(panelsNodes.Scene, 'panels'),
            applyTexturesToModel(flooringNodes.Scene, 'flooring')
          ]);
          setTexturesApplied(true);
          console.log('Textures applied successfully!');
        } catch (error) {
          console.warn('Some textures failed to load, using default materials:', error);
          setTexturesApplied(true); // Mark as applied even if some failed
        }
      }
    };

    applyAllTextures();
  }, [roofNodes.Scene, panelsNodes.Scene, flooringNodes.Scene, texturesApplied]);

  // Helper function to apply/remove highlight
  const applyHighlight = (object: Object3D | undefined, highlight: boolean) => {
    if (!object) return;
    object.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        const originalMaterialKey = child.uuid;
        if (highlight) {
          if (!originalMaterialsRef.current.has(originalMaterialKey)) {
            originalMaterialsRef.current.set(originalMaterialKey, child.material.clone());
          }
          child.material.emissive.setHex(0xcccccc); // Light gray emissive color
          child.material.emissiveIntensity = 0.5;
        } else {
          if (originalMaterialsRef.current.has(originalMaterialKey)) {
            child.material = originalMaterialsRef.current.get(originalMaterialKey)!;
            originalMaterialsRef.current.delete(originalMaterialKey); // Clean up to prevent memory leaks if objects are re-rendered
          } else {
            // Fallback if original somehow not stored - shouldn't happen with current logic
            child.material.emissive.setHex(0x000000);
            child.material.emissiveIntensity = 0;
          }
        }
        child.material.needsUpdate = true;
      }
    });
  };

  // Effects for highlighting
  useEffect(() => {
    applyHighlight(roofNodes.Scene, roofHovered || selectedSection === 'roof');
  }, [roofNodes.Scene, roofHovered, selectedSection]);

  useEffect(() => {
    applyHighlight(panelsNodes.Scene, panelsHovered || selectedSection === 'panels');
  }, [panelsNodes.Scene, panelsHovered, selectedSection]);

  useEffect(() => {
    applyHighlight(flooringNodes.Scene, flooringHovered || selectedSection === 'flooring');
  }, [flooringNodes.Scene, flooringHovered, selectedSection]);

  // Add error handling for WebGL context loss
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost. Attempting to recover...');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, []);

  // Optimize animation performance
  useFrame((state) => {
    if (groupRef.current && !selectedSection) {
      // Reduce animation intensity and use requestAnimationFrame timing
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(time * 0.05) * 0.02;
    }
  });

  // Helper function to find availability, defaults to false if not found
  const getAvailability = (productName: string): boolean => {
    const product = availabilityData.find(p => p.productName.toLowerCase() === productName.toLowerCase());
    return product ? product.isAvailable : false;
  };

  const roofSpring = useSpring({
    scale: selectedSection === 'roof' ? 1.01 : roofHovered ? 1.005 : 1,
    config: selectedSection === 'roof' ? config.wobbly : config.default,
  });

  const panelsSpring = useSpring({
    scale: selectedSection === 'panels' ? 1.01 : panelsHovered ? 1.005 : 1,
    config: selectedSection === 'panels' ? config.wobbly : config.default,
  });

  const flooringSpring = useSpring({
    scale: selectedSection === 'flooring' ? 1.01 : flooringHovered ? 1.005 : 1,
    config: selectedSection === 'flooring' ? config.wobbly : config.default,
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Base - always present - Scaled 10x for horizon effect */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Roof Section */}
      <animated.group
        position={[0, 0.689405772, 0]}
        scale={roofSpring.scale as any} // Cast to any to satisfy AnimatedProps
        visible={true}
        onClick={(e) => { e.stopPropagation(); onSectionSelect('roof'); }}
        onPointerOver={(e) => { e.stopPropagation(); setRoofHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setRoofHovered(false); }}
      >
        <primitive 
          object={roofNodes.Scene} 
        />
      </animated.group>

      {/* Panels Section */}
      <animated.group
        position={[0, 0.6732, 0]}
        scale={panelsSpring.scale as any} // Cast to any
        visible={true}
        onClick={(e) => { e.stopPropagation(); onSectionSelect('panels'); }}
        onPointerOver={(e) => { e.stopPropagation(); setPanelsHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setPanelsHovered(false); }}
      >
        <primitive 
          object={panelsNodes.Scene} 
        />
      </animated.group>

      {/* Flooring Section */}
      <animated.group
        position={[0, 0.71879808, 0]}
        scale={flooringSpring.scale as any} // Cast to any
        visible={true}
        onClick={(e) => { e.stopPropagation(); onSectionSelect('flooring'); }}
        onPointerOver={(e) => { e.stopPropagation(); setFlooringHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setFlooringHovered(false); }}
      >
        <primitive 
          object={flooringNodes.Scene} 
        />
      </animated.group>
    </group>
  );
};