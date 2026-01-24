import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';

interface PINKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (pin: string) => void;
  isLoading?: boolean;
}

export const PINKeyboard: React.FC<PINKeyboardProps> = ({ value, onChange, onComplete, isLoading }) => {
  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (value.length === 4 && onComplete && !isLoading) {
      // Small delay for UX
      const timer = setTimeout(() => {
        onComplete(value);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, onComplete, isLoading]);

  const handleDigitClick = (digit: string) => {
    if (isLoading) return;
    if (value.length < 4) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    if (isLoading) return;
    onChange(value.slice(0, -1));
  };

  const MotionButton = motion.button as any;
  const MotionDiv = motion.div as any;

  const digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <div className="space-y-6">
      {/* PIN Display */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-black text-slate-900 uppercase">Enter Transaction PIN</h3>
        <p className="text-sm text-slate-600 font-semibold">Tap numbers to enter your 4-digit PIN</p>
        
        {/* PIN Input Display */}
        <MotionDiv className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((idx) => (
            <MotionDiv
              key={idx}
              initial={{ scale: 0.8 }}
              animate={{ scale: value[idx] !== undefined ? 1 : 0.9 }}
              className={`w-16 h-16 rounded-2xl font-black text-2xl flex items-center justify-center border-3 transition-all ${
                value[idx] !== undefined
                  ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white shadow-lg'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {value[idx] !== undefined ? '●' : '○'}
            </MotionDiv>
          ))}
        </MotionDiv>

        {/* Auto-submit indicator */}
        {value.length === 4 && !isLoading && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            Auto-submitting...
          </MotionDiv>
        )}
      </div>

      {/* PIN Keyboard Grid */}
      <div className="space-y-3">
        {digits.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-3 gap-3">
            {row.map((digit) => (
              <MotionButton
                key={digit}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                onClick={() => handleDigitClick(digit)}
                disabled={isLoading || value.length >= 4}
                className={`h-16 rounded-2xl font-black text-xl uppercase transition-all border-2 active:scale-95 ${
                  digit === '*' || digit === '#'
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    : isLoading || value.length >= 4
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md'
                }`}
              >
                {digit}
              </MotionButton>
            ))}
          </div>
        ))}

        {/* Backspace Button */}
        <MotionButton
          whileTap={{ scale: 0.95 }}
          onClick={handleBackspace}
          disabled={isLoading || value.length === 0}
          className={`w-full h-14 rounded-2xl font-black uppercase flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
            isLoading || value.length === 0
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 shadow-sm hover:shadow-md'
          }`}
        >
          <Delete className="w-5 h-5" />
          Clear
        </MotionButton>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" />
            Processing...
          </div>
        </div>
      )}
    </div>
  );
};
