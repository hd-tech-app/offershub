
import { AFFILIATE_TAG } from './constants';
import { Product } from './constants';

/**
 * Appends affiliate tag to Amazon URLs properly
 */
export const getAffiliateUrl = (url: string, tag: string = AFFILIATE_TAG): string => {
  if (!url || url === '#' || url === 'undefined') return '';
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('tag', tag);
    return urlObj.toString();
  } catch (e) {
    if (url.startsWith('http')) {
      const separator = url.includes('?') ? '&' : '?';
      return url.includes(`tag=${tag}`) ? url.replace(/tag=[^&]*/, `tag=${tag}`) : `${url}${separator}tag=${tag}`;
    }
    return '';
  }
};

/**
 * Formats currency (INR)
 */
export const formatPrice = (price: string | number): string => {
  const cleanPrice = typeof price === 'string' ? price.replace(/[^0-9.]/g, '') : price.toString();
  const num = parseFloat(cleanPrice) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Robust sharing utility with feedback and multiple fallbacks
 */
export const performShare = async (data: { title?: string, text?: string, url?: string }) => {
  const title = data.title || 'Offers Hub!';
  const text = data.text || '';
  
  // Ensure we have a valid absolute URL for native sharing
  let validUrl = '';
  if (data.url && (data.url.startsWith('http://') || data.url.startsWith('https://'))) {
    validUrl = data.url;
  }

  // 1. Try Native Share (Mobile/Supported Browsers)
  if (navigator.share) {
    try {
      // Only include URL if it's valid to prevent "Invalid URL" error
      const shareParams: ShareData = { title, text };
      if (validUrl) shareParams.url = validUrl;
      
      await navigator.share(shareParams);
      return; 
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.warn('Native share failed, falling back to clipboard:', err);
    }
  }

  // 2. Fallback: Copy to Clipboard
  // Construct the text to copy
  const clipboardText = [text, validUrl].filter(Boolean).join('\n\n').trim();

  // Method A: Modern Clipboard API (often fails in restricted iframes)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(clipboardText);
      alert('Link copied to clipboard!');
      return;
    } catch (err) {
      console.warn('Clipboard API denied, trying legacy method:', err);
    }
  }

  // Method B: Legacy Textarea Method (Most compatible for "Permission Denied" cases)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = clipboardText;
    // Ensure it's not visible but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      alert('Link copied to clipboard!');
    } else {
      throw new Error('execCommand copy was unsuccessful');
    }
  } catch (err) {
    console.error('All share methods failed:', err);
    alert('Could not copy link. Please manually copy the URL from the browser bar.');
  }
};

/**
 * Specialized share function for products with 5-line format
 */
export const shareProduct = (
  product: Product, 
  tag: string = AFFILIATE_TAG, 
  introText: string = 'Hey, check out this awesome product!'
) => {
  const productLink = getAffiliateUrl(product.url, tag) || product.url || 'View on Amazon';
  const addressBarLink = window.location.href;
  
  const shareText = `${introText}\n\n${productLink}\n\nVisit: ${addressBarLink}\n\nEnjoy!`;
  
  // Primary: Native Web Share API (works on iOS Safari, Chrome Android, etc.)
  if (navigator.share) {
    navigator.share({
      title: 'Great Deals!',
      text: shareText
    })
  } else {
    // Fallback for desktop/non-supported browsers
    fallbackCopy(productLink, shareText);
  }
};

// Fallback: Copies to clipboard with user prompt
const fallbackCopy = (productLink: string, shareText: string) => {
  navigator.clipboard.writeText(shareText).then(() => {
    alert('Product link copied to clipboard! Paste to share anywhere.');
  }).catch(() => {
    // Ultimate fallback for very old devices
    prompt('Copy this link to share:', shareText);
  });
};


/**
 * Normalizes Amazon image URLs
 */
export const fixAmazonThumbnail = (url: string, size: number = 400): string => {
  if (!url || url === 'undefined') return `https://loremflickr.com/${size}/${size}/gadget`;
  const isAmazonMedia = /media-amazon|ssl-images-amazon|amazon-adsystem/.test(url);
  if (!isAmazonMedia) return url;
  const amazonSizePattern = /\._[A-Z0-9,_]+_\./;
  if (amazonSizePattern.test(url)) return url.replace(amazonSizePattern, `._SL${size}_.`);
  const parts = url.split('?');
  const baseUrl = parts[0];
  const query = parts[1] ? `?${parts[1]}` : '';
  const lastDot = baseUrl.lastIndexOf('.');
  const lastSlash = baseUrl.lastIndexOf('/');
  if (lastDot !== -1 && lastDot > lastSlash) {
    const path = baseUrl.substring(0, lastDot);
    const ext = baseUrl.substring(lastDot);
    if (!path.includes('._')) return `${path}._SL${size}_${ext}${query}`;
  }
  return url;
};

export const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++; 
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
        currentRow = [];
        currentVal = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentVal += char;
      }
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }
  return rows;
};
