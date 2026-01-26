
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Moon, Sun, Info, ShieldCheck, CheckCircle, Volume2, Smartphone, LogIn, History, Settings as SettingsIcon } from 'lucide-react';
import { toast } from '../lib/toast';
import { cn } from '../lib/utils';
import { playSound, triggerHaptic } from '../lib/sounds';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal?: () => void;
  onOpenHistory?: () => void;
  onAgentLogin?: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onOpenLegal, onOpenHistory, onAgentLogin }) => {
  const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      sounds: true,
      haptics: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      
      if (key === 'sounds' && value) playSound('success');
      if (key === 'haptics' && value) triggerHaptic();
      
      if (key === 'darkMode') {
          if (value) document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
      }
  };

  const MotionDiv = motion.div as any;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />
          
          <MotionDiv
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 z-[70] shadow-xl flex flex-col overflow-hidden"
            style={{ position: 'absolute' }}
          >
            {/* Header */}
            <div className="px-6 pt-14 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center p-2">
                  <img src="/logo.png" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sauki Mart</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">v2.5.0 Premium</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {/* Settings Section */}
              <div className="px-4 py-6 space-y-4">
                <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide px-2">Settings</h3>
                
                <div className="space-y-2">
                  <ToggleItem 
                    icon={Bell} 
                    label="Notifications" 
                    isActive={settings.notifications} 
                    onToggle={() => updateSetting('notifications', !settings.notifications)} 
                  />
                  <ToggleItem 
                    icon={settings.darkMode ? Moon : Sun} 
                    label="Dark Mode" 
                    isActive={settings.darkMode} 
                    onToggle={() => updateSetting('darkMode', !settings.darkMode)} 
                  />
                  <ToggleItem 
                    icon={Volume2} 
                    label="Sound Effects" 
                    isActive={settings.sounds} 
                    onToggle={() => updateSetting('sounds', !settings.sounds)} 
                  />
                  <ToggleItem 
                    icon={Smartphone} 
                    label="Haptic Feedback" 
                    isActive={settings.haptics} 
                    onToggle={() => updateSetting('haptics', !settings.haptics)} 
                  />
                </div>
              </div>

              {/* Navigation Section */}
              <div className="px-4 py-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide px-2">Navigation</h3>
                
                <div className="space-y-2">
                  <MenuItem 
                    icon={LogIn} 
                    label="Agent / Admin" 
                    subLabel="Partner access" 
                    onClick={() => { onClose(); onAgentLogin?.(); }} 
                  />
                  <MenuItem 
                    icon={History} 
                    label="Transaction History" 
                    subLabel="Your purchases" 
                    onClick={() => { onClose(); onOpenHistory?.(); }} 
                  />
                  <MenuItem 
                    icon={Info} 
                    label="About" 
                    subLabel="Our mission" 
                    onClick={() => { onClose(); onOpenLegal?.(); }} 
                  />
                  <MenuItem 
                    icon={ShieldCheck} 
                    label="Privacy & Legal" 
                    subLabel="Your rights" 
                    onClick={() => { onClose(); onOpenLegal?.(); }} 
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">Sauki Data Links © 2024</p>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

const ToggleItem = ({ icon: Icon, label, isActive, onToggle }: any) => {
    const MotionDiv = motion.div as any;
    return (
    <button 
      onClick={onToggle} 
      className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
    >
        <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
              isActive 
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-white">{label}</span>
        </div>
        <div className={cn(
          "w-11 h-6 rounded-full relative p-0.5 transition-colors",
          isActive ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-600"
        )}>
            <MotionDiv 
              animate={{ x: isActive ? 20 : 2 }} 
              className="w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-sm" 
            />
        </div>
    </button>
    );
};

const MenuItem = ({ icon: Icon, label, subLabel, onClick }: any) => (
    <button 
      onClick={onClick} 
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left active:scale-95"
    >
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-slate-400">
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subLabel}</p>
        </div>
        <div className="text-slate-400 dark:text-slate-600 flex-shrink-0">
          →
        </div>
    </button>
);
