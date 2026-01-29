
import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { SmartMessageConfig } from '../contexts/ConfigContext';

interface MessageState {
  headline: string;
  redeemed: boolean;
  timestamps: number[];
}

interface SmartMessagePopupProps {
  config: SmartMessageConfig;
  storageKey: string;
  shouldStart?: boolean;
  onComplete?: () => void;
}

const SmartMessagePopup: React.FC<SmartMessagePopupProps> = ({ 
  config, 
  storageKey, 
  shouldStart = true, 
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep onCompleteRef current to avoid restarting effect when parent re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Destructure config to primitives for stable dependencies
  const { show, headline, delay, showsPerDay, imageUrl, body, buttonText, buttonLink, buttonClass, buttonColor } = config;

  useEffect(() => {
    // If we shouldn't start yet, or if we've already finished this message logic, do nothing
    if (!shouldStart) return;
    if (hasCompletedRef.current) return;

    // If configured to not show or missing data, mark complete immediately
    if (!show || !headline) {
      hasCompletedRef.current = true;
      onCompleteRef.current?.();
      return;
    }

    const checkAndShow = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        let state: MessageState = stored ? JSON.parse(stored) : { headline: '', redeemed: false, timestamps: [] };
        
        // Reset state if headline changed from what's stored
        if (state.headline !== headline) {
          state = { headline: headline, redeemed: false, timestamps: [] };
          localStorage.setItem(storageKey, JSON.stringify(state));
        }

        // If previously redeemed/dismissed permanently, skip
        if (state.redeemed) {
          hasCompletedRef.current = true;
          onCompleteRef.current?.();
          return;
        }

        // Filter timestamps to last 24h
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const activeTimestamps = state.timestamps.filter(t => t > oneDayAgo);
        
        // Check daily frequency limit (0 = unlimited)
        if (showsPerDay !== 0 && activeTimestamps.length >= showsPerDay) {
           hasCompletedRef.current = true;
           onCompleteRef.current?.();
           return;
        }

        // Schedule appearance
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
          setIsVisible(true);
          
          // Record impression at the moment of showing
          const currentStored = localStorage.getItem(storageKey);
          let currentState = currentStored ? JSON.parse(currentStored) : state;
          
          // Ensure we are recording against the correct headline
          if (currentState.headline === headline) {
              currentState.timestamps = [...currentState.timestamps.filter((t: number) => t > oneDayAgo), Date.now()];
              localStorage.setItem(storageKey, JSON.stringify(currentState));
          }
        }, delay);
        
      } catch (e) {
        console.error("Smart popup logic error", e);
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }
    };

    checkAndShow();

    // Cleanup function
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, headline, delay, showsPerDay, storageKey, shouldStart]); 

  const handleClose = (isRedeemed: boolean = false) => {
    setIsVisible(false);
    
    if (isRedeemed) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const state: MessageState = JSON.parse(stored);
        if (state.headline === headline) {
          state.redeemed = true;
          localStorage.setItem(storageKey, JSON.stringify(state));
        }
      }
      
      if (buttonLink) {
        window.open(buttonLink, '_blank');
      }
    }

    // Mark as completed and trigger callback for chaining
    if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-0" role="dialog" aria-modal="true">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-[fadeIn_0.3s]" 
        onClick={() => handleClose(false)}
      />
      
      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.4s_ease-out] border border-gray-500 dark:border-gray-800">
        
        {/* Close Button */}
        <button 
          onClick={() => handleClose(false)}
          className="absolute top-3 right-3 p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-200 dark:text-white rounded-full backdrop-blur-md z-10 transition-colors"
          aria-label="Close message"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {imageUrl && (
          <div className="w-full h-48 sm:h-56 bg-gray-100 dark:bg-gray-800 relative">
            <img 
              src={imageUrl} 
              alt={headline} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLDivElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent opacity-20" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
            {headline}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed whitespace-pre-line">
            {body}
          </p>

          {/* Action Button */}
          {buttonText && (
            <button
              onClick={() => handleClose(true)}
              className={`w-full py-3.5 px-6 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${buttonClass || 'bg-orange-500 hover:bg-orange-600 text-white'}`}
              style={buttonColor ? { color: buttonColor } : {}}
            >
              {buttonText}
              {buttonLink && <ExternalLink className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartMessagePopup;
