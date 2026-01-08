
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Screens
import { Home } from './components/screens/Home';
import { Store } from './components/screens/Store';
import { Data } from './components/screens/Data';
import { Complaint } from './components/screens/Complaint';
import { AgentHub } from './components/screens/Agent';

// Components
import { BottomTabs } from './components/BottomTabs';
import { ToastContainer } from './components/ui/Toast';
import { SmartEntry } from './components/SmartEntry';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showEntry, setShowEntry] = useState(true);

  // Handle back button navigation with robust History API integration
  useEffect(() => {
    // Initial state setup if needed
    if (!window.history.state) {
        try { window.history.replaceState({ tab: 'home' }, '', null); } catch(e) {}
    }

    const handlePopState = (event: PopStateEvent) => {
      // If we have a state with a tab, use it
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        // Fallback to home if no state (e.g. initial load or deep back)
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (tab: string) => {
    // Only push if it's a different tab to avoid stack pollution
    if (tab !== activeTab) {
        setActiveTab(tab);
        try {
          // Pass null as URL to avoid SecurityError in blob/sandbox environments
          window.history.pushState({ tab }, '', null); 
        } catch (e) {
          console.warn('Navigation history update failed:', e);
        }
    }
  };

  const goHome = () => navigate('home');

  // Defensive rendering to prevent crashes
  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigate={navigate} />;
      case 'store': return <Store onBack={goHome} />;
      case 'data': return <Data onBack={goHome} />;
      case 'track': return <Complaint onBack={goHome} />;
      case 'agent': return <AgentHub onBack={goHome} />;
      default: return <Home onNavigate={navigate} />;
    }
  };

  const MotionDiv = motion.div as any;

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 selection:bg-slate-200">
      <ToastContainer />

      <AnimatePresence>
        {showEntry && <SmartEntry onComplete={() => setShowEntry(false)} />}
      </AnimatePresence>

      {!showEntry && (
        <div className="flex flex-col h-full max-w-[480px] mx-auto bg-white shadow-2xl relative">
          {/* Main Content Area */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <MotionDiv
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="h-full overflow-y-auto no-scrollbar pb-24"
              >
                {renderContent()}
              </MotionDiv>
            </AnimatePresence>
          </div>

          {/* Navigation Bar */}
          <BottomTabs activeTab={activeTab} onChange={navigate} />
        </div>
      )}
    </div>
  );
}
