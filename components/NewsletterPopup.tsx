
import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Send, Bell, Loader2, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { ALL_ICONS } from '../constants';
import { useConfig } from '../contexts/ConfigContext';

const STORAGE_KEY = 'offers_hub_newsletter_status';
const DELAY_MS = 30000;
const REAPPEAR_DAYS = 2;

interface StorageState {
  status: 'subscribed' | 'dismissed' | 'idle';
  timestamp: number;
}

interface NewsletterPopupProps {
  onOpenContact?: () => void;
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ onOpenContact }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Use a ref for geoData to ensure we always read the latest value in handleSubmit without dependency issues
  const geoDataRef = useRef<any>(null);
  
  const config = useConfig();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkVisibility = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { status, timestamp } = JSON.parse(stored) as StorageState;
          if (status === 'subscribed') {
            setIsSubscribed(true);
            return;
          }
          if (status === 'dismissed') {
            const daysSinceDismiss = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
            if (daysSinceDismiss < REAPPEAR_DAYS) return;
          }
        }
        const timer = setTimeout(() => setIsVisible(true), DELAY_MS);
        return () => clearTimeout(timer);
      } catch (e) {
        setTimeout(() => setIsVisible(true), DELAY_MS);
      }
    };
    checkVisibility();
  }, []);

  // Robust Geo Data Fetching
  useEffect(() => {
    if (isSubscribed) return;
    
    const fetchGeoData = async () => {
        // Strategy: Try high-detail APIs first, fall back to simple IP APIs
        
        // 1. ipapi.co (High detail, HTTPS)
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000); // 3s timeout
            const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(id);
            if (res.ok) {
                const data = await res.json();
                if (data.ip) {
                    geoDataRef.current = {
                        ip: data.ip,
                        city: data.city,
                        region: data.region,
                        country: data.country_name,
                        isp: data.org,
                        org: data.org,
                        asn: data.asn
                    };
                    return;
                }
            }
        } catch (e) { /* continue */ }

        // 2. ipwho.is (High detail)
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            const res = await fetch('https://ipwho.is/', { signal: controller.signal });
            clearTimeout(id);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    geoDataRef.current = {
                        ip: data.ip,
                        city: data.city,
                        region: data.region,
                        country: data.country,
                        isp: data.connection?.isp,
                        org: data.connection?.org,
                        asn: data.connection?.asn
                    };
                    return;
                }
            }
        } catch (e) { /* continue */ }

        // 3. ipinfo.io (New High Detail Fallback for ISP/Org)
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            const res = await fetch('https://ipinfo.io/json', { signal: controller.signal });
            clearTimeout(id);
            if (res.ok) {
                const data = await res.json();
                if (data.ip) {
                    // Extract ASN from Org if possible (e.g. "AS12345 Name")
                    let asn = 'Unknown';
                    if (data.org && data.org.startsWith('AS')) {
                        const match = data.org.match(/^AS\d+/);
                        if (match) asn = match[0];
                    }

                    geoDataRef.current = {
                        ip: data.ip,
                        city: data.city,
                        region: data.region,
                        country: data.country, // Returns code (e.g. US)
                        isp: data.org || 'Unknown', // ipinfo returns ISP info in org field
                        org: data.org || 'Unknown',
                        asn: asn
                    };
                    return;
                }
            }
        } catch (e) { /* continue */ }

        // 4. db-ip.com (Medium detail - Location only, NO ISP in free tier)
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            const res = await fetch('https://api.db-ip.com/v2/free/self', { signal: controller.signal });
            clearTimeout(id);
            if (res.ok) {
                const data = await res.json();
                if (data.ipAddress) {
                    geoDataRef.current = {
                        ip: data.ipAddress,
                        city: data.city,
                        region: data.stateProv,
                        country: data.countryName,
                        isp: 'Unknown',
                        org: 'Unknown',
                        asn: 'Unknown'
                    };
                    return;
                }
            }
        } catch (e) { /* continue */ }

        // 5. ipify (IP Only - Ultimate Fallback)
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            if (res.ok) {
                const data = await res.json();
                if (data.ip) {
                    geoDataRef.current = {
                        ip: data.ip,
                        city: 'Unknown',
                        region: 'Unknown',
                        country: 'Unknown',
                        isp: 'Unknown',
                        org: 'Unknown',
                        asn: 'Unknown'
                    };
                }
            }
        } catch (e) { /* All failed */ }
    };

    fetchGeoData();
  }, [isSubscribed]);

  useEffect(() => {
    if (isVisible && !isSubscribed) {
      setTimeout(() => emailInputRef.current?.focus(), 500);
    }
  }, [isVisible, isMinimized, isSubscribed]);

  const handleDismiss = (minimize: boolean = false) => {
    setIsVisible(false);
    if (isSubscribed) {
        setIsMinimized(false);
        return;
    }
    if (minimize) {
      setIsMinimized(true);
    } else {
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

    if (!config.newsletterScriptUrl) {
        setSubmitStatus('error');
        setErrorMessage('API URL not configured.');
        return;
    }

    setSubmitStatus('loading');

    try {
      // Force a tiny wait if geoData isn't ready yet, though it should be by now
      if (!geoDataRef.current) {
         await new Promise(r => setTimeout(r, 500));
      }

      const params = new URLSearchParams();
      params.append('action', 'subscribe');
      params.append('email', email);
      
      const geo = geoDataRef.current || {};
      const ipAddress = geo.ip || 'Unknown';
      
      params.append('ip', ipAddress);
      params.append('IP', ipAddress);
      params.append('ip_address', ipAddress);

      params.append('city', geo.city || 'Unknown');
      params.append('region', geo.region || 'Unknown');
      params.append('country', geo.country || 'Unknown');
      
      params.append('isp', geo.isp || 'Unknown');
      params.append('org', geo.org || 'Unknown');
      params.append('asn', geo.asn ? String(geo.asn) : 'Unknown');
      
      params.append('browser', navigator.userAgent);
      params.append('location', Intl.DateTimeFormat().resolvedOptions().timeZone);
      params.append('device', /Mobile|Android|iP(ad|hone)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop');
      
      await fetch(config.newsletterScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
        mode: 'no-cors'
      });

      setSubmitStatus('success');
      setIsSubscribed(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: 'subscribed', timestamp: Date.now() }));
      
      setTimeout(() => { setIsVisible(false); setIsMinimized(false); }, 2000);

    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
      setErrorMessage('Could not subscribe. Please try again.');
    }
  };

  if (isMinimized && !isVisible && !isSubscribed) {
    return (
      <button 
        onClick={handleReopen}
        className="fixed bottom-6 left-5 z-50 p-3 bg-white dark:bg-gray-800 text-orange-500 rounded-full shadow-lg border border-orange-100 dark:border-gray-700 animate-bounce hover:scale-110 transition-transform"
        aria-label="Open newsletter subscription popup"
      >
        <Bell className="w-4 h-4 fill-current" aria-hidden="true" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </button>
    );
  }

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] sm:hidden transition-opacity animate-[fadeIn_0.3s]" onClick={() => handleDismiss(true)} aria-hidden="true" />

      <div className="fixed bottom-0 sm:bottom-6 sm:right-6 z-[100] w-full sm:w-[24rem] animate-[slideUp_0.4s_ease-out]" role="dialog" aria-labelledby="newsletter-title" aria-describedby="newsletter-desc">
        <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-orange-400 to-pink-500 opacity-10 dark:opacity-30 pointer-events-none" aria-hidden="true" />
          
          <button 
            onClick={() => handleDismiss(true)}
            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white/50 dark:bg-black/20 rounded-full backdrop-blur-sm transition-colors z-10"
            aria-label="Close newsletter popup"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="p-6 relative">
             <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl shrink-0" aria-hidden="true">
                    <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h3 id="newsletter-title" className="text-lg font-black font-engaging text-gray-900 dark:text-white leading-tight mb-1">
                        {config.newsletterTitle}
                    </h3>
                    <p id="newsletter-desc" className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        {config.newsletterSubtitle}
                    </p>
                </div>
             </div>

             {submitStatus === 'success' ? (
                <div className="py-6 flex flex-col items-center justify-center text-center animate-[fadeIn_0.3s]" aria-live="polite">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">You're on the list!</h4>
                    <p className="text-xs text-gray-500">Watch your inbox for top deals.</p>
                </div>
             ) : (
                <>
                  <form onSubmit={handleSubmit} className="relative mb-4">
                      <div className="relative group">
                          <label htmlFor="newsletter-email" className="sr-only">Email Address</label>
                          <input
                              ref={emailInputRef}
                              id="newsletter-email"
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
                              className="absolute right-1.5 top-1.5 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group-focus-within:scale-105"
                              aria-label="Subscribe"
                          >
                             {submitStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                      </div>
                      
                      <div aria-live="assertive">
                        {submitStatus === 'error' && (
                            <div className="flex items-center gap-1.5 mt-2 text-red-500 text-[10px] font-bold">
                                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                                {errorMessage}
                            </div>
                        )}
                      </div>
                  </form>

                  {(config.socialLinks.length > 0 || onOpenContact) && (
                    <div className="flex flex-col items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        {config.socialLinks.length > 0 ? 'Follow Our Updates' : 'Get in Touch'}
                      </span>
                      <div className="flex items-center gap-4">
                        {config.socialLinks.map((link, idx) => {
                          const exactMatch = ALL_ICONS[link.icon.trim()];
                          const pascalMatch = ALL_ICONS[link.icon.trim().charAt(0).toUpperCase() + link.icon.trim().slice(1)];
                          const Icon = exactMatch || pascalMatch || ALL_ICONS.Globe;
                          return (
                            <a 
                              key={idx} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`p-2 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-800 transition-all group ${link.color}`} 
                              title={link.name}
                            >
                              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </a>
                          );
                        })}
                        
                        {onOpenContact && (
                           <button 
                             onClick={(e) => {
                               e.preventDefault();
                               handleDismiss(true);
                               onOpenContact();
                             }}
                             className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-800 transition-all group text-orange-500 hover:text-orange-500"
                             title="Contact Us"
                           >
                             <Mail className="w-5 h-5 transition-transform group-hover:scale-110" />
                           </button>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-400 text-center mt-4" aria-hidden="true">
                      {config.newsletterFooter}
                  </p>
                </>
             )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsletterPopup;
