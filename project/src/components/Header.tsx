import React from 'react';
import { Warehouse } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.div 
      className="bg-white shadow-sm py-4 px-6 flex items-center"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center">
        <Warehouse className="h-8 w-8 text-slate-600 mr-3" />
        <h1 className="text-xl font-semibold text-gray-800">3D Warehouse Explorer</h1>
      </div>
      <div className="ml-auto flex space-x-4">
        <motion.button 
          className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          About
        </motion.button>
        <motion.button 
          className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Header;