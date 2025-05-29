export type WarehouseSection = 'roof' | 'panels' | 'flooring';

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