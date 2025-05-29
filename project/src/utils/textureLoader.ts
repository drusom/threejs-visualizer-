import * as THREE from 'three';

/**
 * Texture Loading Utilities
 * 
 * This utility helps load and manage textures for 3D models.
 * Place your texture files in the /public/textures/ folder.
 */

// Texture loader instance
const textureLoader = new THREE.TextureLoader();

// Get base URL for proper path resolution in both dev and production
const baseUrl = import.meta.env.BASE_URL;

// Define texture paths
export const TEXTURE_PATHS = {
  // Roof textures
  ROOF_DIFFUSE: `${baseUrl}textures/roof/roof_diffuse.jpg`,
  ROOF_NORMAL: `${baseUrl}textures/roof/roof_normal.jpg`,
  ROOF_ROUGHNESS: `${baseUrl}textures/roof/roof_roughness.jpg`,
  
  // Panel textures
  PANELS_DIFFUSE: `${baseUrl}textures/panels/panels_diffuse.jpg`,
  PANELS_NORMAL: `${baseUrl}textures/panels/panels_normal.jpg`,
  PANELS_ROUGHNESS: `${baseUrl}textures/panels/panels_roughness.jpg`,
  
  // Flooring textures
  FLOORING_DIFFUSE: `${baseUrl}textures/flooring/flooring_diffuse.jpg`,
  FLOORING_NORMAL: `${baseUrl}textures/flooring/flooring_normal.jpg`,
  FLOORING_ROUGHNESS: `${baseUrl}textures/flooring/flooring_roughness.jpg`,
};

// Texture cache to avoid reloading
const textureCache = new Map<string, THREE.Texture>();

/**
 * Load a texture with caching
 */
export const loadTexture = (path: string): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (textureCache.has(path)) {
      resolve(textureCache.get(path)!);
      return;
    }

    textureLoader.load(
      path,
      (texture) => {
        // Configure texture settings
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.flipY = false; // Important for GLB models
        
        // Cache the texture
        textureCache.set(path, texture);
        resolve(texture);
      },
      undefined,
      (error) => {
        console.warn(`Failed to load texture: ${path}`, error);
        reject(error);
      }
    );
  });
};

/**
 * Create a textured material
 */
export const createTexturedMaterial = async (textureSet: {
  diffuse?: string;
  normal?: string;
  roughness?: string;
  metalness?: string;
}) => {
  const material = new THREE.MeshStandardMaterial();

  try {
    // Load diffuse (color) texture
    if (textureSet.diffuse) {
      const diffuseTexture = await loadTexture(textureSet.diffuse);
      material.map = diffuseTexture;
    }

    // Load normal texture
    if (textureSet.normal) {
      const normalTexture = await loadTexture(textureSet.normal);
      material.normalMap = normalTexture;
    }

    // Load roughness texture
    if (textureSet.roughness) {
      const roughnessTexture = await loadTexture(textureSet.roughness);
      material.roughnessMap = roughnessTexture;
    }

    // Load metalness texture
    if (textureSet.metalness) {
      const metalnessTexture = await loadTexture(textureSet.metalness);
      material.metalnessMap = metalnessTexture;
    }

    material.needsUpdate = true;
    return material;
  } catch (error) {
    console.warn('Error creating textured material:', error);
    return material; // Return basic material if textures fail
  }
};

/**
 * Apply textures to a GLB model
 */
export const applyTexturesToModel = async (
  object: THREE.Object3D, 
  sectionType: 'roof' | 'panels' | 'flooring'
) => {
  const textureSet = getTextureSetForSection(sectionType);
  
  object.traverse(async (child) => {
    if (child instanceof THREE.Mesh) {
      try {
        const texturedMaterial = await createTexturedMaterial(textureSet);
        child.material = texturedMaterial;
      } catch (error) {
        console.warn(`Failed to apply texture to ${sectionType}:`, error);
      }
    }
  });
};

/**
 * Get texture set based on section type
 */
const getTextureSetForSection = (sectionType: 'roof' | 'panels' | 'flooring') => {
  switch (sectionType) {
    case 'roof':
      return {
        diffuse: TEXTURE_PATHS.ROOF_DIFFUSE,
        normal: TEXTURE_PATHS.ROOF_NORMAL,
        roughness: TEXTURE_PATHS.ROOF_ROUGHNESS,
      };
    case 'panels':
      return {
        diffuse: TEXTURE_PATHS.PANELS_DIFFUSE,
        normal: TEXTURE_PATHS.PANELS_NORMAL,
        roughness: TEXTURE_PATHS.PANELS_ROUGHNESS,
      };
    case 'flooring':
      return {
        diffuse: TEXTURE_PATHS.FLOORING_DIFFUSE,
        normal: TEXTURE_PATHS.FLOORING_NORMAL,
        roughness: TEXTURE_PATHS.FLOORING_ROUGHNESS,
      };
    default:
      return {};
  }
}; 