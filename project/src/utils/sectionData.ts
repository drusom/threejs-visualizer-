import { SectionInfo, WarehouseSection } from '../types';

const sectionInfoData: Record<WarehouseSection, SectionInfo> = {
  roof: {
    title: 'Warehouse Roof',
    description: 'The roof section of our warehouse features advanced thermal insulation and solar panels, providing energy efficiency and temperature control throughout the building.',
    details: {
      size: '10,000 sq ft',
      capacity: 'Supports up to 50 solar panels',
      features: [
        'Solar panel integration',
        'Thermal insulation',
        'Weatherproof coating',
        'Skylight installations'
      ]
    },
    imageUrl: 'https://images.pexels.com/photos/2138126/pexels-photo-2138126.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  panels: {
    title: 'Wall Panels',
    description: 'Our warehouse wall panels are made from high-quality materials that provide excellent insulation and durability. These modular panels can be reconfigured for different space requirements.',
    details: {
      size: '15,000 sq ft total area',
      capacity: 'Sound insulation rating: STC-52',
      features: [
        'Fire-resistant materials',
        'Soundproofing',
        'Modular design',
        'Easy maintenance'
      ]
    },
    imageUrl: 'https://images.pexels.com/photos/6444379/pexels-photo-6444379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  flooring: {
    title: 'Industrial Flooring',
    description: 'Our heavy-duty industrial flooring is designed to withstand high traffic and heavy equipment. The epoxy-sealed concrete provides durability and easy cleaning for all warehouse operations.',
    details: {
      size: '12,000 sq ft',
      capacity: 'Load capacity: 5,000 lbs/sq ft',
      features: [
        'Impact resistant',
        'Chemical resistant',
        'Anti-slip surface',
        'Heated flooring option'
      ]
    },
    imageUrl: 'https://images.pexels.com/photos/257636/pexels-photo-257636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
};

export const getSectionInfo = (section: WarehouseSection): SectionInfo => {
  return sectionInfoData[section];
};