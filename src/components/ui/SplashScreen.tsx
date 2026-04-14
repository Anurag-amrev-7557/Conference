import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center p-6"
        >
          <div className="absolute inset-0 bg-grid-studio opacity-10" />
          
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-20 h-20 bg-text rounded-full flex items-center justify-center text-white font-serif italic text-4xl mb-12 shadow-2xl shadow-text/20"
            >
              S
            </motion.div>
            
            <div className="flex flex-col items-center gap-4">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-monograph text-accent tracking-[0.4em]"
              >
                Superhumanly AI
              </motion.span>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-3xl font-serif italic text-text"
              >
                Archival Record 2024
              </motion.h2>
            </div>

            {/* Loading Bar */}
            <div className="absolute bottom-[-100px] w-64 h-[1px] bg-border/40 overflow-hidden">
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "0%" }}
                 transition={{ duration: 1.8, ease: "easeInOut" }}
                 className="w-full h-full bg-accent shadow-[0_0_10px_rgba(0,82,204,0.5)]"
               />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
