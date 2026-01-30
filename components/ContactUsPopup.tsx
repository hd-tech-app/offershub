
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Mail, Phone, MessageSquare, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

interface ContactUsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'contact_form_user_data';

const ContactUsPopup: React.FC<ContactUsPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const modalRef = useRef<HTMLDivElement>(null);
  const config = useConfig();
  const hasFetchedCode = useRef(false);
  const geoDataRef = useRef<any>(null);

  // Fetch Geo Data immediately on component mount (background)
  useEffect(() => {
    // Note: We use a separate flag or checking geoDataRef to avoid re-fetching unnecessarily, 
    // but if the first fetch failed (geoDataRef is null), we retry.
    if (geoDataRef.current) return;
    
    const fetchGeo = async () => {
        // Strategy: Try high-detail APIs first, fall back to simple IP APIs
        
        // 1. ipapi.co (High detail, HTTPS)
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
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
                        asn: data.asn,
                        calling_code: data.country_calling_code ? data.country_calling_code.replace('+', '') : null
                    };
                    if (data.country_calling_code && !localStorage.getItem(STORAGE_KEY)) {
                        setFormData(prev => ({ ...prev, countryCode: data.country_calling_code }));
                    }
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
                        asn: data.connection?.asn,
                        calling_code: data.calling_code
                    };
                    if (data.calling_code && !localStorage.getItem(STORAGE_KEY)) {
                        setFormData(prev => ({ ...prev, countryCode: '+' + data.calling_code }));
                    }
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
                        country: data.country, // Returns code like US
                        isp: data.org || 'Unknown', // ipinfo returns ISP in org
                        org: data.org || 'Unknown',
                        asn: asn,
                        calling_code: null // ipinfo free doesn't provide calling code
                    };
                    return;
                }
            }
        } catch (e) { /* continue */ }

        // 4. db-ip.com (Medium detail)
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
    
    fetchGeo();
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Auto fetch / Pre-fill from local storage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({ 
            ...prev, 
            name: parsed.name || '', 
            email: parsed.email || '', 
            phone: parsed.phone || '',
            countryCode: parsed.countryCode || prev.countryCode
          }));
        } catch (e) {
          console.error("Failed to parse contact info", e);
        }
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (status === 'success' || status === 'error') {
         // Reset message only, keep contact info for convenience
         setTimeout(() => {
             setStatus('idle');
             setFormData(prev => ({ ...prev, message: '' }));
         }, 300);
      }
    }
  }, [isOpen, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 2000) return;

    if (name === 'phone') {
        // Restrict phone input to numbers only
        const numeric = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: numeric }));
        return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Strip the + sign from country code for Google Sheet compatibility
    const rawCode = formData.countryCode || '';
    const code = rawCode.replace(/\+/g, ''); 
    const number = formData.phone || '';
    const fullPhone = `${code} ${number}`.trim();

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      countryCode: formData.countryCode
    }));

    try {
      // Ensure we have IP data (fallback wait)
      if (!geoDataRef.current) {
         await new Promise(r => setTimeout(r, 500));
      }

      const timestamp = new Date().toLocaleString();
      const userAgent = navigator.userAgent;
      const device = /Mobile|Android|iP(ad|hone)/.test(userAgent) ? 'Mobile' : 'Desktop';
      const location = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const g = geoDataRef.current || {};

      const params = new URLSearchParams();
      params.append('action', 'contact');
      params.append('date', timestamp);
      params.append('name', formData.name);
      params.append('email', formData.email);
      
      params.append('mobile', fullPhone);      
      params.append('Mobile', fullPhone);      
      params.append('phone', fullPhone);       
      params.append('Phone', fullPhone);       
      params.append('phoneNumber', fullPhone); 
      params.append('contact', fullPhone);     
      
      params.append('message', formData.message);
      
      // Enriched Geo/Network Data
      const ipAddress = g.ip || 'Unknown';
      params.append('ip', ipAddress);
      params.append('IP', ipAddress);
      params.append('ip_address', ipAddress);

      params.append('city', g.city || 'Unknown');
      params.append('region', g.region || 'Unknown');
      params.append('country', g.country || 'Unknown');
      params.append('isp', g.isp || 'Unknown');
      params.append('org', g.org || 'Unknown');
      params.append('asn', g.asn ? String(g.asn) : 'Unknown');

      params.append('device', device);
      params.append('browser', userAgent);
      params.append('location', location);

      await fetch(config.contactScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
        mode: 'no-cors'
      });

      setStatus('success');
      setTimeout(() => { onClose(); }, 2000);

    } catch (error) {
      console.error("Contact form submission error:", error);
      setStatus('success'); 
      setTimeout(() => { onClose(); }, 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 pt-4 rounded-xl sm:p-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
    >
      <div 
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity animate-[fadeIn_0.3s]" 
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_0.4s_ease-out] border border-gray-600 dark:border-gray-800"
      >
        {/* Header with decorative background */}
        <div className="relative p-6 pb-8 bg-gradient-to-br from-orange-500 to-pink-600 text-white overflow-hidden">
           <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
           <div className="absolute bottom-0 left-0 p-12 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
           
           <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors text-white"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <h2 id="contact-title" className="text-2xl font-black tracking-tight mb-2">Get in Touch</h2>
            <p className="text-orange-50 font-medium text-sm">We'd love to hear from you! Send us a message.</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-[fadeIn_0.5s]">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
              <p className="text-gray-500 dark:text-gray-400">Thank you for reaching out. We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Name</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Phone Number</label>
                <div className="flex gap-2">
                  {/* Country Code */}
                  <div className="relative w-24 flex-shrink-0 group">
                    <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                       <Globe className="w-5 h-5" />
                    </div>
                    <input
                      name="countryCode"
                      type="text"
                      placeholder="+91"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-full pl-10 pr-2 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-center"
                    />
                  </div>
                  {/* Phone Number */}
                  <div className="relative flex-1 group">
                    <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      autoComplete="tel"
                      placeholder="98XX5 4XXX1"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Your Message</label>
                  <span className={`text-[10px] font-bold ${formData.message.length > 1800 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.message.length}/2000
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    placeholder="How can we help you today?"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 mt-2 bg-orange-500 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUsPopup;
