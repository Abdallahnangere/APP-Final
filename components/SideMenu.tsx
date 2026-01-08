
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Moon, Sun, Info, ShieldCheck, CheckCircle, Volume2, Smartphone, LogIn, History } from 'lucide-react';
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
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-md"
          />
          
          <MotionDiv
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-slate-50 dark:bg-slate-900 z-[70] shadow-2xl flex flex-col rounded-r-[3rem] overflow-hidden"
            style={{ position: 'absolute' }} // Use absolute to stay inside the #root container
          >
            <div className="p-8 bg-slate-900 text-white relative">
              <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2.5 mb-6 shadow-xl shadow-black/20">
                  <img src="/logo.png" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-black tracking-tight uppercase">SAUKI MART</h2>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">v2.5.0 Premium Edition</p>
                 <span className="w-1 h-1 rounded-full bg-white/20"></span>
                 <p className="text-green-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    Certified <CheckCircle className="w-2.5 h-2.5" />
                 </p>
              </div>
            </div>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar">
                <div>
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">App Experience</h3>
                    
                    <div className="space-y-3">
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
                            activeColor="bg-indigo-600"
                        />
                        <ToggleItem 
                            icon={Volume2} 
                            label="Sound FX" 
                            isActive={settings.sounds} 
                            onToggle={() => updateSetting('sounds', !settings.sounds)} 
                            activeColor="bg-purple-600"
                        />
                         <ToggleItem 
                            icon={Smartphone} 
                            label="Haptic Feedback" 
                            isActive={settings.haptics} 
                            onToggle={() => updateSetting('haptics', !settings.haptics)} 
                            activeColor="bg-blue-600"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">Enterprise</h3>
                    <div className="space-y-2">
                         <MenuItem icon={LogIn} label="Agent / Admin Login" subLabel="Partner Access" onClick={() => { onClose(); onAgentLogin?.(); }} />
                         <MenuItem icon={History} label="Transaction History" subLabel="Local Records" onClick={() => { onClose(); onOpenHistory?.(); }} />
                        <MenuItem icon={Info} label="About Sauki Mart" subLabel="Our Vision" onClick={() => { onClose(); onOpenLegal?.(); }} />
                        <MenuItem icon={ShieldCheck} label="Legal & Privacy" subLabel="Compliance" onClick={() => { onClose(); onOpenLegal?.(); }} />
                    </div>
                </div>
            </div>

            <div className="p-10 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">Sauki Data Links</p>
                    <div className="flex gap-8 opacity-40 hover:opacity-100 transition-opacity duration-500">
                        <img src="/smedan.png" className="h-7 w-auto grayscale" />
                        <img src="/coat.png" className="h-7 w-auto grayscale" />
                    </div>
                </div>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

const ToggleItem = ({ icon: Icon, label, isActive, onToggle, activeColor = "bg-blue-600" }: any) => {
    const MotionDiv = motion.div as any;
    return (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-4 rounded-[1.75rem] bg-white border border-slate-100 shadow-sm active:scale-95 transition-all">
        <div className="flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-inner", isActive ? `${activeColor} text-white` : "bg-slate-100 text-slate-400")}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{label}</span>
        </div>
        <div className={cn("w-12 h-7 rounded-full relative transition-colors p-1", isActive ? activeColor : "bg-slate-200")}>
            <MotionDiv animate={{ x: isActive ? 20 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
        </div>
    </button>
    );
};

const MenuItem = ({ icon: Icon, label, subLabel, onClick }: any) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-[1.75rem] bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-left group active:scale-95">
        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-inner">
            <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight block">{label}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{subLabel}</span>
        </div>
    </button>
);
