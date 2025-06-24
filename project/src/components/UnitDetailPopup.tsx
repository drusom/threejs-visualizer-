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
  
  // Custom floorplan mapping for specific units
  const getFloorPlanUrl = (unitName: string): string => {
    // Special case: b2 unit uses the f280.png floorplan
    if (unitName.toLowerCase() === 'b2') {
      return '/floorplans/f280.png';
    }
    // Default naming convention for other units
    return `/floorplans/${unitName.toLowerCase()}.png`;
  };
  
  const floorPlanUrl = getFloorPlanUrl(selectedUnit);

  // Handle cases where unit data might not be available
  const size = data?.size || 'N/A';
  const availability = data?.availability || 'Unknown';
  const amenities = data?.amenities || 'None listed';
  const isAvailable = availability.toLowerCase().includes('available') || availability.toLowerCase() === 'true';

  return (
    <AnimatePresence>
      {/* Dimming Background */}
      <motion.div
        className="fixed inset-0 bg-black z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onClick={onClose}
      />
      
      {/* Popup Content - In front of dimming */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 md:justify-end md:pr-8 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <motion.div
          className="bg-white bg-opacity-100 backdrop-blur-sm rounded-xl shadow-2xl 
                     w-full max-w-md md:max-w-lg lg:max-w-xl
                     max-h-[85vh] md:max-h-[90vh] 
                     overflow-hidden flex flex-col
                     border border-white border-opacity-60 pointer-events-auto"
          initial={{ 
            scale: 0.8, 
            opacity: 0, 
            x: 100,
            y: 20
          }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            x: 0,
            y: 0
          }}
          exit={{ 
            scale: 0.8, 
            opacity: 0, 
            x: 100,
            y: 20
          }}
          transition={{ 
            duration: 0.4, 
            ease: [0.23, 1, 0.32, 1], // Custom easing for smooth feel
            opacity: { duration: 0.3 }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable content area */}
          <div className="overflow-y-auto flex-1 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Unit {selectedUnit.toUpperCase()}
              </h2>
              <motion.button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 hover:bg-opacity-70 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
              </motion.button>
            </div>

            {/* Availability Status */}
            <motion.div 
              className={`mb-6 p-4 rounded-lg flex items-center shadow-sm ${
                isAvailable 
                  ? 'bg-sage-50 bg-opacity-100 border border-sage-200 border-opacity-90' 
                  : 'bg-red-50 bg-opacity-100 border border-red-300 border-opacity-90'
              }`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {isAvailable ? (
                <>
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-sage-700 mr-3" />
                  <span className="text-sage-800 font-medium text-sm md:text-base">Available for Rent</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-700 mr-3" />
                  <span className="text-red-800 font-medium text-sm md:text-base">Currently Unavailable</span>
                </>
              )}
            </motion.div>

            {/* Unit Details */}
            <motion.div 
              className="space-y-4 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="flex items-center">
                <Home className="w-5 h-5 md:w-6 md:h-6 text-sage-700 mr-3 flex-shrink-0" />
                <div>
                  <span className="text-gray-600 text-sm md:text-base">Size: </span>
                  <span className="font-medium text-gray-800 text-sm md:text-base">{size}</span>
                </div>
              </div>

              <div className="flex items-start">
                <Wrench className="w-5 h-5 md:w-6 md:h-6 text-sage-700 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-600 text-sm md:text-base">Amenities: </span>
                  <span className="font-medium text-gray-800 text-sm md:text-base">{amenities}</span>
                </div>
              </div>
            </motion.div>

            {/* Floor Plan */}
            <motion.div 
              className="mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <h3 className="text-lg md:text-xl font-medium text-gray-800 mb-3">Floor Plan</h3>
              <div className="border border-gray-200 border-opacity-90 rounded-lg overflow-hidden shadow-sm bg-white bg-opacity-100">
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
            </motion.div>
          </div>

          {/* Fixed Action Button at bottom */}
          <motion.div 
            className="p-6 pt-0 bg-gradient-to-t from-white to-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <motion.button
              onClick={onClose}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close Details
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnitDetailPopup; 