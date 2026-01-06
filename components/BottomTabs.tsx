
import React from 'react';
import { Home, ShoppingBag, Wifi, MessageSquareWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { triggerHaptic } from '../lib/sounds';

interface BottomTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, onChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'store', icon: ShoppingBag, label: 'Store' },
    { id: 'data', icon: Wifi, label: 'Data' },
    { id: 'track', icon: MessageSquareWarning, label: 'Complaint' },
  ];

  const handlePress = (id: string) => {
      triggerHaptic();
      onChange(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 pb-safe z-30 transition-all duration-300">
      <div className="flex justify-around items-center h-[5.5rem] max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handlePress(tab.id)}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1.5 active:scale-90 transition-transform duration-200"
            >
              <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-slate-900/5" : "bg-transparent"
              )}>
                  <tab.icon
                    className={cn(
                      "w-6 h-6 transition-all duration-300",
                      isActive ? "text-slate-900 fill-slate-900 stroke-[2.5px]" : "text-slate-400 stroke-[2px]"
                    )}
                  />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold transition-colors duration-200 tracking-tight",
                  isActive ? "text-slate-900" : "text-slate-400"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
