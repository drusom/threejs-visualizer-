import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle } from 'lucide-react';
import { WarehouseSection } from '../types';
import { getSectionInfo } from '../utils/sectionData';

interface InfoPanelProps {
  selectedSection: WarehouseSection | null;
  isAvailable: boolean;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  selectedSection, 
  isAvailable,
  onClose 
}) => {
  if (!selectedSection) return null;
  
  const sectionInfo = getSectionInfo(selectedSection);

  return (
    <AnimatePresence>
      {selectedSection && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-lg overflow-auto z-10"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">{sectionInfo.title}</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className={`mb-4 p-2 rounded-md flex items-center ${isAvailable ? 'bg-green-50' : 'bg-red-50'}`}>
              {isAvailable ? (
                <>
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">Available</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">Not Available</span>
                </>
              )}
            </div>
            
            <div className="mb-4">
              <img 
                src={sectionInfo.imageUrl} 
                alt={sectionInfo.title} 
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
            
            <p className="text-gray-600 mb-4">{sectionInfo.description}</p>
            
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-2">Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span className="text-gray-800">{sectionInfo.details.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacity:</span>
                  <span className="text-gray-800">{sectionInfo.details.capacity}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Features:</span>
                  <ul className="list-disc list-inside text-gray-800 pl-2">
                    {sectionInfo.details.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoPanel;