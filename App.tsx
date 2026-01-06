
import React, { useState, useEffect } from 'react';
import { Home } from './components/screens/Home';
import { Store } from './components/screens/Store';
import { Data } from './components/screens/Data';
import { Complaint } from './components/screens/Complaint';
import { AgentHub } from './components/screens/Agent'; 
import { BottomTabs } from './components/BottomTabs';
import { ToastContainer } from './components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartEntry } from './components/SmartEntry';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showEntry, setShowEntry] = useState(true);

  // Helper to go back to home
  const goHome = () => setActiveTab('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigate={setActiveTab} />;
      case 'store': return <Store onBack={goHome} />;
      case 'data': return <Data onBack={goHome} />;
      case 'track': return <Complaint onBack={goHome} />;
      case 'agent': return <AgentHub onBack={goHome} />;
      default: return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-900 dark:text-white font-sans selection:bg-slate-200 transition-colors duration-300">
      <AnimatePresence>
        {showEntry && <SmartEntry onComplete={() => setShowEntry(false)} />}
      </AnimatePresence>

      <ToastContainer />
      
      {!showEntry && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5 }}
          >
              <AnimatePresence mode="wait">
                <motion.main
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="pb-24 max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative"
                >
                  {renderScreen()}
                </motion.main>
              </AnimatePresence>
              <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
          </motion.div>
      )}
    </div>
  );
};

export default App;
