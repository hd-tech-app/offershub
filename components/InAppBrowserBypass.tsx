
import React, { useEffect, useState } from 'react';
import { ExternalLink, ArrowRight, Chrome } from 'lucide-react';

const InAppBrowserBypass: React.FC = () => {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroidCheck = /android/i.test(ua);
    setIsAndroid(isAndroidCheck);

    // Common In-App Browser User Agents
    const rules = [
      'Instagram',
      'FBAN',   // Facebook
      'FBAV',   // Facebook
      'FB_IAB', // Facebook Messenger
      'LinkedInApp',
      'Line',
      'Twitter',
      'Snapchat',
    ];

    const detected = rules.some((rule) => ua.includes(rule));
    
    // We primarily target Android for the intent:// hack as iOS handles links differently
    if (detected && isAndroidCheck) {
      setIsInAppBrowser(true);
    }
  }, []);

  const handleOpenBrowser = () => {
    const currentUrl = window.location.href;
    const urlNoProtocol = currentUrl.replace(/^https?:\/\//, '');
    
    // Construct Android Intent to force open in Chrome
    // This breaks out of the WebView
    const intentUrl = `intent://${urlNoProtocol}#Intent;scheme=https;package=com.android.chrome;end`;
    
    window.location.href = intentUrl;
  };

  useEffect(() => {
    if (isInAppBrowser && isAndroid) {
       // Attempt automatic redirect after short delay
       const timer = setTimeout(() => {
         handleOpenBrowser();
       }, 1500);
       return () => clearTimeout(timer);
    }
  }, [isInAppBrowser, isAndroid]);

  if (!isInAppBrowser) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="w-24 h-24 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-3xl shadow-2xl flex items-center justify-center mb-8 animate-bounce">
        <Chrome className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
        Open in Chrome
      </h1>
      
      <p className="text-base text-gray-600 dark:text-gray-300 mb-8 max-w-xs mx-auto leading-relaxed">
        For the best experience, secure payments, and to ensure offers track correctly, please open this page in your system browser.
      </p>
      
      <button 
        onClick={handleOpenBrowser}
        className="w-full max-w-xs flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-lg shadow-xl shadow-gray-900/10 active:scale-95 transition-all"
      >
        <span>Open Browser</span>
        <ArrowRight className="w-5 h-5" />
      </button>
      
      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 w-full max-w-xs">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
          Alternative Method
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Tap the <span className="font-bold text-gray-900 dark:text-gray-200">three dots (⋮)</span> at the top right corner and select <span className="font-bold text-gray-900 dark:text-gray-200">"Open in Chrome"</span>
        </div>
      </div>
    </div>
  );
};

export default InAppBrowserBypass;
