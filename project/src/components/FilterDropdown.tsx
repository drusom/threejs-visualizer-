import React, { useState, useMemo } from 'react';
import { Filter, ChevronDown, Square, Circle } from 'lucide-react';
import { UnitData } from '../types';

interface FilterDropdownProps {
  unitData: Record<string, UnitData>;
  onUnitHover: (unitName: string | null) => void;
  onUnitSelect: (unitName: string) => void;
  selectedUnit: string | null;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  unitData,
  onUnitHover,
  onUnitSelect,
  selectedUnit
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size-asc' | 'size-desc' | 'availability'>('name');

  // Parse size string to number for sorting
  const parseSizeToNumber = (sizeString: string): number => {
    if (!sizeString) return 0;
    const match = sizeString.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''), 10);
    }
    return 0;
  };

  // Filter and sort units
  const filteredAndSortedUnits = useMemo(() => {
    const units = Object.entries(unitData);
    
    // Filter by availability
    const filtered = units.filter(([name, data]) => {
      if (availabilityFilter === 'all') return true;
      const isAvailable = data.availability?.toLowerCase().includes('available') || 
                         data.availability?.toLowerCase() === 'true';
      return availabilityFilter === 'available' ? isAvailable : !isAvailable;
    });

    // Sort units
    const sorted = filtered.sort(([nameA, dataA], [nameB, dataB]) => {
      switch (sortBy) {
        case 'name':
          return nameA.localeCompare(nameB);
        case 'size-asc':
          return parseSizeToNumber(dataA.size) - parseSizeToNumber(dataB.size);
        case 'size-desc':
          return parseSizeToNumber(dataB.size) - parseSizeToNumber(dataA.size);
        case 'availability':
          const aAvailable = dataA.availability?.toLowerCase().includes('available') || 
                           dataA.availability?.toLowerCase() === 'true';
          const bAvailable = dataB.availability?.toLowerCase().includes('available') || 
                           dataB.availability?.toLowerCase() === 'true';
          if (aAvailable === bAvailable) return nameA.localeCompare(nameB);
          return aAvailable ? -1 : 1;
        default:
          return 0;
      }
    });

    return sorted;
  }, [unitData, availabilityFilter, sortBy]);

  const getAvailabilityStatus = (data: UnitData) => {
    return data.availability?.toLowerCase().includes('available') || 
           data.availability?.toLowerCase() === 'true';
  };

  const getFloorplanStatus = (unitName: string) => {
    // Check if unit has floorplan linked (b2 and c13)
    return unitName === 'b2' || unitName === 'c13';
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-lg border border-gray-200 flex items-center space-x-2 transition-colors"
      >
        <Filter size={16} />
        <span>Filter Units</span>
        <ChevronDown 
          size={16} 
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden">
          {/* Filter Controls */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="space-y-3">
              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Availability
                </label>
                <select 
                  value={availabilityFilter} 
                  onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Units</option>
                  <option value="available">Available Only</option>
                  <option value="occupied">Occupied Only</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Unit Name</option>
                  <option value="size-asc">Size (Smallest First)</option>
                  <option value="size-desc">Size (Largest First)</option>
                  <option value="availability">Availability</option>
                </select>
              </div>
            </div>
          </div>

          {/* Units List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredAndSortedUnits.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No units match the current filters
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAndSortedUnits.map(([unitName, unitInfo]) => {
                  const isAvailable = getAvailabilityStatus(unitInfo);
                  const hasFloorplan = getFloorplanStatus(unitName);
                  const isSelected = selectedUnit === unitName;
                  
                  return (
                    <div
                      key={unitName}
                      className={`p-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                      }`}
                      onMouseEnter={() => onUnitHover(unitName)}
                      onMouseLeave={() => onUnitHover(null)}
                      onClick={() => {
                        onUnitSelect(unitName);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 uppercase">
                              Unit {unitName}
                            </span>
                            {hasFloorplan && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Floor Plan
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {unitInfo.size || 'Size not specified'}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            {isAvailable ? (
                              <>
                                <Circle size={8} className="fill-green-500 text-green-500" />
                                <span className="text-xs text-green-700 font-medium">Available</span>
                              </>
                            ) : (
                              <>
                                <Square size={8} className="fill-red-500 text-red-500" />
                                <span className="text-xs text-red-700 font-medium">Occupied</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with count */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              Showing {filteredAndSortedUnits.length} of {Object.keys(unitData).length} units
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 