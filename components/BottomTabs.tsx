
import React from 'react';
import { Home, ShoppingBag, Wifi, History, Users } from 'lucide-react';
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
    { id: 'history', icon: History, label: 'Activity' },
  ];

  const handlePress = (id: string) => {
      triggerHaptic();
      onChange(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-[480px] mx-auto bg-white/80 backdrop-blur-xl border-t border-slate-200/50 pb-safe pt-1">
        <div className="flex justify-between items-end h-[50px] px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handlePress(tab.id)}
                className="group flex flex-col items-center justify-center w-full h-full active:scale-95 transition-transform duration-200"
              >
                <div className={cn(
                    "mb-1 transition-all duration-300",
                    isActive ? "text-blue-600 -translate-y-0.5" : "text-slate-400"
                  )}>
                    <tab.icon
                      className={cn(
                        "w-6 h-6",
                        isActive ? "fill-current stroke-[2.5px]" : "stroke-[2px]"
                      )}
                    />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-tight transition-colors duration-200",
                    isActive ? "text-blue-600" : "text-slate-400"
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
