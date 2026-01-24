import React from 'react';
import { motion } from 'framer-motion';
import { Delete, ArrowRight } from 'lucide-react';

interface PINKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (pin: string) => void;
  isLoading?: boolean;
}

export const PINKeyboard: React.FC<PINKeyboardProps> = ({ value, onChange, onComplete, isLoading }) => {
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

  const handleSubmit = () => {
    if (value.length === 4 && onComplete) {
      onComplete(value);
    }
  };

  const MotionButton = motion.button as any;
  const MotionDiv = motion.div as any;

  const digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '']
  ];

  return (
    <div className="space-y-3">
      {/* PIN Display - Compact */}
      <div className="text-center mb-2">
        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Enter PIN</h3>
        
        {/* PIN Input Display - Smaller */}
        <div className="flex justify-center gap-2 mb-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center border-2 transition-all ${
                value[idx] !== undefined
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {value[idx] !== undefined ? '●' : '○'}
            </div>
          ))}
        </div>
      </div>

      {/* PIN Keyboard Grid - Compact */}
      <div className="grid grid-cols-3 gap-2">
        {digits.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {row.map((digit, colIdx) => {
              if (!digit) {
                return <div key={`empty-${rowIdx}-${colIdx}`} />;
              }
              
              return (
                <MotionButton
                  key={digit}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleDigitClick(digit)}
                  disabled={isLoading || value.length >= 4}
                  className={`h-12 rounded-lg font-bold text-base uppercase transition-all border border-slate-300 active:scale-95 ${
                    isLoading || value.length >= 4
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-900 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  {digit}
                </MotionButton>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <MotionButton
          whileTap={{ scale: 0.92 }}
          onClick={handleBackspace}
          disabled={isLoading || value.length === 0}
          className={`h-12 rounded-lg font-bold uppercase flex items-center justify-center gap-1.5 border transition-all text-sm ${
            isLoading || value.length === 0
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          }`}
        >
          <Delete className="w-4 h-4" />
          Clear
        </MotionButton>

        <MotionButton
          whileTap={{ scale: 0.92 }}
          onClick={handleSubmit}
          disabled={isLoading || value.length !== 4}
          className={`h-12 rounded-lg font-bold uppercase flex items-center justify-center gap-1.5 border transition-all text-sm ${
            isLoading || value.length !== 4
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
          Submit
        </MotionButton>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce" />
            Processing...
          </div>
        </div>
      )}
    </div>
  );
};
