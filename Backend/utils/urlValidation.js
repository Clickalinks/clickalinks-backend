/**
 * URL Validation Utilities
 * Security functions for validating and sanitizing URLs
 */

/**
 * Validate that URL is HTTPS only (blocks HTTP and dangerous protocols)
 * @param {string} url - URL to validate
 * @returns {{valid: boolean, error?: string, sanitized?: string}}
 */
export function validateHttpsOnly(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required and must be a string' };
  }

  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:', 'tel:', 'mailto:'];
  const lowerUrl = trimmedUrl.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return { 
        valid: false, 
        error: `Dangerous protocol detected: ${protocol}. Only HTTPS URLs are allowed.` 
      };
    }
  }

  // Block HTTP (only allow HTTPS)
  if (lowerUrl.startsWith('http://')) {
    return { 
      valid: false, 
      error: 'HTTP is not allowed. Please use HTTPS for security.',
      sanitized: trimmedUrl.replace(/^http:/i, 'https:') // Suggest HTTPS alternative
    };
  }

  // Require HTTPS
  if (!lowerUrl.startsWith('https://')) {
    return { 
      valid: false, 
      error: 'Only HTTPS URLs are allowed. Please include https:// at the beginning.',
      sanitized: `https://${trimmedUrl}` // Suggest adding HTTPS
    };
  }

  // Validate URL format
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Ensure protocol is https
    if (urlObj.protocol !== 'https:') {
      return { 
        valid: false, 
        error: 'Only HTTPS protocol is allowed.',
        sanitized: trimmedUrl.replace(/^[^:]+:/i, 'https:')
      };
    }

    // Additional security: Block localhost and private IPs if needed
    // (For ClickaLinks, we might allow these for testing, but we'll log them)
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      // Allow for development/testing, but log it
      console.warn('⚠️ Local/private IP detected in URL:', hostname);
    }

    return { valid: true, sanitized: trimmedUrl };
  } catch (error) {
    return { 
      valid: false, 
      error: `Invalid URL format: ${error.message}` 
    };
  }
}

/**
 * Sanitize URL - remove dangerous protocols and enforce HTTPS
 * @param {string} url - URL to sanitize
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  const validation = validateHttpsOnly(url);
  
  if (validation.valid) {
    return validation.sanitized || url;
  }
  
  // If there's a suggested sanitized version, return it
  if (validation.sanitized) {
    return validation.sanitized;
  }
  
  return null;
}

/**
 * Check if URL is safe (HTTPS only, no dangerous protocols)
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isUrlSafe(url) {
  return validateHttpsOnly(url).valid;
}

