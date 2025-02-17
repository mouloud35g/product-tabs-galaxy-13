import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const PromoSection = () => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 h-full flex flex-col justify-center transform transition-all duration-300 hover:shadow-lg"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className="text-3xl font-bold mb-6 text-gray-800 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Ramenez la nature chez vous
      </motion.h2>
      <motion.button 
        className="inline-flex items-center text-primary hover:gap-4 gap-2 transition-all group"
        whileHover={{ x: 10 }}
      >
        Acheter maintenant
        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
      </motion.button>
    </motion.div>
  );
};