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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#FDFAF4] via-white to-[#FFF8F0]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Subtle Islamic geometric pattern background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l7.5 7.5L30 15l-7.5-7.5L30 0zm0 30l7.5 7.5L30 45l-7.5-7.5L30 30zM0 30l7.5 7.5L0 45l-7.5-7.5L0 30zm30 0l7.5 7.5L30 45l-7.5-7.5L30 30zm30 0l7.5 7.5L60 45l-7.5-7.5L60 30zM30 30l7.5-7.5L45 30l-7.5 7.5L30 30z' fill='%23D4AF37' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}></div>

      <div className="flex flex-col items-center justify-center relative z-10">
        {/* Crescent moon decorative element */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="mb-8"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C24 4 14 8 14 20C14 32 24 36 24 36C24 36 18 32 18 20C18 8 24 4 24 4Z" fill="#D4AF37" opacity="0.6"/>
            <circle cx="32" cy="12" r="3" fill="#D4AF37" opacity="0.8"/>
          </svg>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="text-center"
        >
          {/* Arabic calligraphy style "Ramadan Kareem" */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-4"
          >
            <h1 className="text-[11px] font-semibold text-[#8B7355] tracking-[0.3em] uppercase mb-3">
              Ramadan Kareem
            </h1>
          </MotionDiv>

          <h2 className="text-5xl font-semibold text-[#1A1A1A] tracking-[-0.03em] mb-2">
            Sauki Mart
          </h2>
          
          <p className="text-sm font-normal text-[#6B6B6B] tracking-wide">
            Your trusted marketplace
          </p>
        </MotionDiv>
        
        {/* Elegant loading indicator */}
        <MotionDiv 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 80 }}
          transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
          className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-12 rounded-full"
        />

        {/* Optional ornamental dots */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex gap-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-1 h-1 rounded-full bg-[#D4AF37]" 
              style={{ 
                opacity: 0.3 + (i * 0.2),
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </MotionDiv>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </MotionDiv>
  );
};
