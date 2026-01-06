
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';
import { toast } from '../../lib/toast';
import { playSound } from '../../lib/sounds';

export const ToastContainer: React.FC = () => {
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);
  const [pushNotification, setPushNotification] = useState<{ title: string; body: string } | null>(null);

  // 1. Regular Toasts
  useEffect(() => {
    return toast.subscribe((message, type) => {
      const id = Date.now();
      setActiveToast({ message, type, id });
      setTimeout(() => {
        setActiveToast((current) => (current?.id === id ? null : current));
      }, 3000);
    });
  }, []);

  // 2. Poll for Admin "Push" Notifications
  useEffect(() => {
      const interval = setInterval(async () => {
          try {
              const res = await fetch('/api/system/message');
              const data = await res.json();
              if (data && data.type === 'PUSH' && data.isActive) {
                  const content = JSON.parse(data.content);
                  // Check if we already showed this one (simple localstorage check or just session state)
                  const seen = sessionStorage.getItem('lastPushId');
                  if (seen !== data.id) {
                      setPushNotification(content);
                      sessionStorage.setItem('lastPushId', data.id);
                      playSound('success'); // Use notification sound
                  }
              }
          } catch(e) {}
      }, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
  }, []);

  const MotionDiv = motion.div as any;

  return (
    <>
    <AnimatePresence>
      {/* Standard Toast */}
      {activeToast && (
        <MotionDiv
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-6 left-4 right-4 z-[100] flex justify-center pointer-events-none"
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[300px] max-w-md pointer-events-auto">
            <div className={`p-2 rounded-full ${
              activeToast.type === 'success' ? 'bg-green-100 text-green-600' :
              activeToast.type === 'error' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {activeToast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {activeToast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {activeToast.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">
                {activeToast.type === 'success' ? 'Success' : activeToast.type === 'error' ? 'Error' : 'Notice'}
              </p>
              <p className="text-slate-500 text-xs">{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </MotionDiv>
      )}

      {/* Push Notification Modal (High Priority) */}
      {pushNotification && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          >
              <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                      <Bell className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{pushNotification.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm mb-6">{pushNotification.body}</p>
                  <button 
                    onClick={() => setPushNotification(null)}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs active:scale-95 transition-transform"
                  >
                      Dismiss
                  </button>
              </div>
          </MotionDiv>
      )}
    </AnimatePresence>
    </>
  );
};
