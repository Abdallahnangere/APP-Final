
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
                  const seen = sessionStorage.getItem('lastPushId');
                  if (seen !== data.id) {
                      setPushNotification(content);
                      sessionStorage.setItem('lastPushId', data.id);
                      playSound('success'); 
                  }
              }
          } catch(e) {}
      }, 10000); 
      return () => clearInterval(interval);
  }, []);

  const MotionDiv = motion.div as any;

  return (
    <>
    <AnimatePresence>
      {/* Standard Toast - Apple Style */}
      {activeToast && (
        <MotionDiv
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-6 left-4 right-4 z-[100] flex justify-center pointer-events-none"
        >
          <div className={cn(
            "backdrop-blur-2xl border shadow-elevation-8 rounded-2xl p-4 flex items-center gap-3 min-w-[280px] max-w-sm pointer-events-auto",
            activeToast.type === 'success' ? 'bg-accent-green/95 border-accent-green/20 text-white' :
            activeToast.type === 'error' ? 'bg-accent-red/95 border-accent-red/20 text-white' :
            'bg-accent-blue/95 border-accent-blue/20 text-white'
          )}>
            <div className="flex-shrink-0">
              {activeToast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {activeToast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {activeToast.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <p className="font-medium text-sm flex-1">{activeToast.message}</p>
            <button onClick={() => setActiveToast(null)} className="text-white/60 hover:text-white transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </MotionDiv>
      )}

      {/* Push Notification Modal - Premium Style */}
      {pushNotification && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
          >
              <div className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-elevation-8 relative overflow-hidden">
                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-blue to-accent-purple"></div>
                  
                  <div className="w-14 h-14 bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 rounded-2xl flex items-center justify-center mb-4 text-accent-blue">
                      <Bell className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{pushNotification.title}</h3>
                  <p className="text-primary-600 leading-relaxed text-sm mb-6">{pushNotification.body}</p>
                  <button 
                    onClick={() => setPushNotification(null)}
                    className="w-full bg-accent-blue text-white font-semibold py-3 rounded-xl transition-all active:scale-95 shadow-elevation-4"
                  >
                      Got It
                  </button>
              </div>
          </MotionDiv>
      )}
    </AnimatePresence>
    </>
  );
};

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
