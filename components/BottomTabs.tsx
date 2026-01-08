
import React from 'react';
import { Home, ShoppingBag, Wifi, MessageSquare, Users } from 'lucide-react';
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
    { id: 'agent', icon: Users, label: 'Agent' },
    { id: 'track', icon: MessageSquare, label: 'Complaint' },
  ];

  const handlePress = (id: string) => {
      triggerHaptic();
      onChange(id);
  };

  return (
    <div className="fixed bottom-0 fixed-mobile z-50">
      {/* Gradient Fade to seamless blend content */}
      <div className="h-12 bg-gradient-to-t from-[#f8fafc] to-transparent pointer-events-none" />
      
      <div className="bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 pb-safe pt-2 transition-all duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-end h-[4rem] max-w-md mx-auto px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handlePress(tab.id)}
                className="group relative flex flex-col items-center justify-center w-full h-full pb-1 active:scale-95 transition-transform duration-200"
              >
                <div className={cn(
                    "p-1.5 rounded-xl transition-all duration-300 mb-1",
                    isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-200 -translate-y-1" : "bg-transparent text-slate-400 hover:bg-slate-50"
                  )}>
                    <tab.icon
                      className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive ? "stroke-[2.5px]" : "stroke-[2px]"
                      )}
                    />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-black uppercase tracking-wider transition-all duration-200 block",
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
    </div>
  );
};
