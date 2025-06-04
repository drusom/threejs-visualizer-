import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Home, Wrench } from 'lucide-react';
import { UnitData } from '../types';

interface UnitDetailPopupProps {
  selectedUnit: string | null;
  unitData: Record<string, UnitData>;
  onClose: () => void;
}

const UnitDetailPopup: React.FC<UnitDetailPopupProps> = ({ 
  selectedUnit, 
  unitData,
  onClose 
}) => {
  if (!selectedUnit) return null;
  
  const data = unitData[selectedUnit];
  const floorPlanUrl = `/floorplans/${selectedUnit.toLowerCase()}.png`;

  // Handle cases where unit data might not be available
  const size = data?.size || 'N/A';
  const availability = data?.availability || 'Unknown';
  const amenities = data?.amenities || 'None listed';
  const isAvailable = availability.toLowerCase().includes('available') || availability.toLowerCase() === 'true';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Unit {selectedUnit.toUpperCase()}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Availability Status */}
            <div className={`mb-4 p-3 rounded-lg flex items-center ${
              isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {isAvailable ? (
                <>
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Available for Rent</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">Currently Unavailable</span>
                </>
              )}
            </div>

            {/* Unit Details */}
            <div className="space-y-4 mb-4">
              <div className="flex items-center">
                <Home className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <span className="text-gray-600">Size: </span>
                  <span className="font-medium text-gray-800">{size}</span>
                </div>
              </div>

              <div className="flex items-start">
                <Wrench className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <span className="text-gray-600">Amenities: </span>
                  <span className="font-medium text-gray-800">{amenities}</span>
                </div>
              </div>
            </div>

            {/* Floor Plan */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Floor Plan</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={floorPlanUrl}
                  alt={`Floor plan for Unit ${selectedUnit}`}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZsb29yIFBsYW4gTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                    e.currentTarget.alt = 'Floor plan not available';
                  }}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnitDetailPopup; 