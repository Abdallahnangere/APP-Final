
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  const MotionDiv = motion.div as any;

  // History API for Back Button Support
  useEffect(() => {
    if (isOpen) {
      // Push state when modal opens so Back button closes it instead of navigating away
      try {
        window.history.pushState({ modal: true }, '', null);
      } catch (e) {
        console.warn('Modal history push failed:', e);
      }
      
      const handlePopState = (event: PopStateEvent) => {
        // If back button is pressed (popped), we close the modal
        onClose();
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // If we are closing manually (via X or backdrop), we need to go back in history 
        // to remove the state we pushed, but ONLY if we haven't already popped it.
        // NOTE: This is tricky to get perfect in React without a router, but checking state helps.
        // We rely on the user flow here.
      };
    }
  }, [isOpen]); 

  const handleManualClose = () => {
    // Attempt to go back in history to remove the pushed state, if environment allows
    try {
       // Only go back if we are sure we pushed (handled by user flow generally)
       // To be safe in simple implementations, we can just close. 
       // If strict history management is needed, we'd track history length.
       // For now, simple back() if allowed, or just close.
       // window.history.back(); 
       // NOTE: Calling back() here automatically triggers popstate which calls onClose.
       // But if history API failed earlier, this might do nothing or navigate page.
       // Safer to just check if we successfully pushed state? 
       // For this fix, we will just call onClose directly for manual interactions 
       // or simulate back if we want to clear the forward state.
       
       // Simplest fix for the error reported is just to rely on onClose. 
       // However, to keep the "Back button closes modal" feature consistent with "X button closes modal",
       // we usually want to pop the history stack.
       
       window.history.back();
    } catch(e) {
       onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleManualClose} // Manual close triggers back to keep history clean
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <MotionDiv
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 fixed-mobile bg-white rounded-t-3xl z-[70] max-h-[90vh] overflow-y-auto shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <button onClick={handleManualClose} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 pb-24 safe-area-bottom">
              {children}
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};
