
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SmartEntryProps {
  onComplete: () => void;
}

export const SmartEntry: React.FC<SmartEntryProps> = ({ onComplete }) => {
  useEffect(() => {
    // 2.5 seconds total entry time
    const timer = setTimeout(onComplete, 2500); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  const MotionDiv = motion.div as any;

  return (
    <MotionDiv 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center justify-center">
        <MotionDiv
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-center"
        >
            <h1 className="text-2xl font-medium text-slate-500 tracking-widest uppercase mb-1">Welcome to</h1>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Sauki Mart</h2>
        </MotionDiv>
        
        <MotionDiv 
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="h-1 bg-blue-600 mt-6 rounded-full"
        />
      </div>
    </MotionDiv>
  );
};
