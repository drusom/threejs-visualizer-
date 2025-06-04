export type WarehouseSection = 'roof' | 'panels' | 'flooring';

// New types for unit-based system
export type UnitName = string; // e.g., 'a1', 'c10'

export interface UnitData {
  name: string; // Unit identifier (e.g., 'a1')
  size: string; // Size from Google Sheets
  availability: string; // Availability status
  amenities: string; // Amenities list
  floorPlanUrl?: string; // Optional floor plan image
}

export interface LoadedModel {
  name: string;
  object: any; // THREE.Group - using any to avoid THREE import issues
  isUnit: boolean;
  isBridge: boolean;
}

// Keep existing interfaces for backwards compatibility
export interface SectionInfo {
  title: string;
  description: string;
  details: {
    size: string;
    capacity: string;
    features: string[];
  };
  imageUrl: string;
}

export interface WarehouseSectionProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  highlightColor: string;
  name: WarehouseSection;
  onSelect: (name: WarehouseSection) => void;
  isSelected: boolean;
  isAvailable: boolean;
}