
import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflinePopup: React.FC = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReconnect = () => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
        setIsOnline(true);
    } else {
        window.location.reload();
    }
  };

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
        <WifiOff className="w-8 h-8 text-gray-400 dark:text-gray-500 relative z-10" />
        <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 z-20"></div>
      </div>
      
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
        No internet / Wi-Fi !
      </h2>
      
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full mb-8 border border-gray-100 dark:border-gray-800 shadow-sm mt-4">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 text-left flex items-center gap-2">
            Try:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-4 text-left font-medium">
              <li className="flex items-start gap-3">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 ring-4 ring-orange-500/20"></span>
                  <span>Checking the network cables, modem, and router</span>
              </li>
              <li className="flex items-start gap-3">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 ring-4 ring-orange-500/20"></span>
                  <span>Reconnecting to Wi-Fi / Mobile data</span>
              </li>
          </ul>
      </div>
      
      <button 
        onClick={handleReconnect}
        className="w-full max-w-xs py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 group"
      >
        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        <span>Reconnect</span>
      </button>
    </div>
  );
};

export default OfflinePopup;
