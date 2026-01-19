
import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Bell, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { GOOGLE_SCRIPT_URL } from '../constants';

const STORAGE_KEY = 'offers_hub_newsletter_status';
const DELAY_MS = 8000; // 8 seconds delay before showing
const REAPPEAR_DAYS = 2; // Show again after 2 days if dismissed

interface StorageState {
  status: 'subscribed' | 'dismissed' | 'idle';
  timestamp: number;
}

const NewsletterPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Smart check on mount
  useEffect(() => {
    const checkVisibility = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { status, timestamp } = JSON.parse(stored) as StorageState;
          
          if (status === 'subscribed') {
            setIsSubscribed(true);
            return; // Never show if subscribed
          }

          if (status === 'dismissed') {
            const daysSinceDismiss = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
            if (daysSinceDismiss < REAPPEAR_DAYS) return; // Don't show yet
          }
        }
        
        // If we get here, show the popup after delay
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, DELAY_MS);
        
        return () => clearTimeout(timer);
      } catch (e) {
        // If storage parsing fails, show popup
        setTimeout(() => setIsVisible(true), DELAY_MS);
      }
    };

    checkVisibility();
  }, []);

  const handleDismiss = (minimize: boolean = false) => {
    setIsVisible(false);
    
    // If subscribed, do not allow minimizing (bell shouldn't show)
    if (isSubscribed) {
        setIsMinimized(false);
        return;
    }

    if (minimize) {
      setIsMinimized(true);
    } else {
      // Full dismiss - save to storage to remind later
      const state: StorageState = { status: 'dismissed', timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  };

  const handleReopen = () => {
    setIsMinimized(false);
    setIsVisible(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    if (GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID_HERE')) {
        setSubmitStatus('error');
        setErrorMessage('API URL not configured.');
        return;
    }

    setSubmitStatus('loading');

    try {
      // Fetch IP address
      let userIp = '';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          userIp = ipData.ip;
        }
      } catch (err) {
        console.warn('Failed to fetch IP:', err);
      }

      const formData = new FormData();
      formData.append('email', email);
      formData.append('ip', userIp);
      formData.append('browser', navigator.userAgent);
      formData.append('location', Intl.DateTimeFormat().resolvedOptions().timeZone);
      formData.append('device', /Mobile|Android|iP(ad|hone)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop');
      
      // We use 'no-cors' mode which makes the response opaque, but Google Apps Script 
      // simple triggers often work best this way from client-side without proxies.
      // However, to read the response (success vs duplicate), we try standard fetch.
      // If the user's script handles CORS correctly (ContentService), this works.
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      
      if (data.result === 'success') {
        setSubmitStatus('success');
        setIsSubscribed(true);
        const state: StorageState = { status: 'subscribed', timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        
        // Auto close after success
        setTimeout(() => {
            setIsVisible(false);
            setIsMinimized(false);
        }, 3000);
      } else if (data.result === 'duplicate') {
        setSubmitStatus('duplicate');
        setIsSubscribed(true);
        const state: StorageState = { status: 'subscribed', timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); // Treat duplicate as subscribed

        // Auto close on duplicate as well
        setTimeout(() => {
            setIsVisible(false);
            setIsMinimized(false);
        }, 3000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (err) {
      console.error('Newsletter submit error:', err);
      // Fallback: assume success for UX if it was a CORS opaque response issue, 
      // but here we caught an actual error.
      setSubmitStatus('error');
      setErrorMessage('Could not subscribe. Please try again.');
    }
  };

  // Minimized Floating Bell - Hide if subscribed
  if (isMinimized && !isVisible && !isSubscribed) {
    return (
      <button 
        onClick={handleReopen}
        className="fixed bottom-6 left-5 z-50 p-3 bg-white dark:bg-gray-800 text-orange-500 rounded-full shadow-lg border border-orange-100 dark:border-gray-700 animate-bounce hover:scale-110 transition-transform"
        aria-label="Subscribe to Newsletter"
      >
        <Bell className="w-4 h-4 fill-current" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </button>
    );
  }

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop for Mobile */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] sm:hidden transition-opacity animate-[fadeIn_0.3s]" onClick={() => handleDismiss(true)} />

      {/* Popup Container */}
      <div className="fixed bottom-0 sm:bottom-6 sm:right-6 z-[100] w-full sm:w-[24rem] animate-[slideUp_0.4s_ease-out]">
        <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
          
          {/* Decorative Header Background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-orange-400 to-pink-500 opacity-10 dark:opacity-20 pointer-events-none" />
          
          {/* Close Button */}
          <button 
            onClick={() => handleDismiss(true)}
            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white/50 dark:bg-black/20 rounded-full backdrop-blur-sm transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 relative">
             <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl shrink-0">
                    <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h3 className="text-lg font-black font-engaging text-gray-900 dark:text-white leading-tight mb-1">
                        Unlock Exclusive Deals!
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        Join 10,000+ shoppers! Get daily price drops and hidden gems delivered to your inbox.
                    </p>
                </div>
             </div>

             {submitStatus === 'success' ? (
                <div className="py-6 flex flex-col items-center justify-center text-center animate-[fadeIn_0.3s]">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">You're on the list!</h4>
                    <p className="text-xs text-gray-500">Watch your inbox for top deals.</p>
                </div>
             ) : (
                <form onSubmit={handleSubmit} className="relative">
                    <div className="relative group">
                        <input
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={submitStatus === 'loading'}
                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm rounded-xl py-3 pl-4 pr-12 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:opacity-70"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitStatus === 'loading' || !email}
                            className="absolute right-1.5 top-1.5 p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group-focus-within:scale-105"
                        >
                           {submitStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                    
                    {submitStatus === 'error' && (
                        <div className="flex items-center gap-1.5 mt-2 text-red-500 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3" />
                            {errorMessage}
                        </div>
                    )}
                    
                    {submitStatus === 'duplicate' && (
                        <div className="flex items-center gap-1.5 mt-2 text-blue-500 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            You're already subscribed!
                        </div>
                    )}

                    <p className="text-[9px] text-gray-400 text-center mt-3">
                        No spam, unsubscribe anytime.
                    </p>
                </form>
             )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsletterPopup;
