# Security Audit Items #14 & #15: HTTPS Enforcement & HSTS

## Status: ✅ Implemented

---

## Item #14: HTTPS Enforced Everywhere

### Status: ✅ Implemented

**Implementation:**

1. **HTTP to HTTPS Redirect Middleware**
   - **Location:** `Backend/middleware/security.js` - `enforceHttps()` function
   - **Applied:** Early in middleware chain in `Backend/server.js`
   - **Behavior:** Automatically redirects all HTTP requests to HTTPS with 301 (Permanent Redirect)

2. **Content Security Policy (CSP)**
   - **Location:** `Backend/middleware/security.js` - `securityHeaders` configuration
   - **Fix Applied:** Removed `"http:"` from `imgSrc` directive
   - **Result:** Only HTTPS images allowed, preventing mixed content

3. **URL Validation**
   - **Backend:** `Backend/utils/urlValidation.js` - Validates HTTPS only for website/dealLink URLs
   - **Frontend:** `frontend/src/components/BusinessDetails.js` - Blocks HTTP URLs in website input

**HTTPS Enforcement Points:**
- ✅ Backend redirects HTTP to HTTPS (301 redirect)
- ✅ CSP blocks HTTP resources
- ✅ URL validation rejects HTTP links
- ✅ Frontend validation blocks HTTP input

**Middleware Implementation:**
```javascript
export const enforceHttps = (req, res, next) => {
  // Skip HTTPS enforcement for local development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if request is already HTTPS
  const isHttps = 
    req.secure || 
    req.headers['x-forwarded-proto'] === 'https' ||
    req.protocol === 'https';

  if (!isHttps) {
    // Redirect HTTP to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.originalUrl}`;
    return res.redirect(301, httpsUrl); // 301 Permanent Redirect
  }

  next();
};
```

**Security Benefits:**
- ✅ All traffic encrypted in transit
- ✅ Prevents man-in-the-middle attacks
- ✅ Protects sensitive data (passwords, tokens, payment info)
- ✅ Meets security best practices
- ✅ Prevents protocol downgrade attacks

**Deployment Note:**
- When behind a proxy (Render.com, Cloudflare, etc.), the middleware checks `X-Forwarded-Proto` header
- Local development bypasses HTTPS enforcement for easier testing

---

## Item #15: HSTS Enabled

### Status: ✅ Implemented

**Implementation:**
- **Location:** `Backend/middleware/security.js` - `securityHeaders` configuration
- **Library:** Helmet.js (industry-standard security headers)
- **Applied:** Global middleware in `Backend/server.js`

**HSTS Configuration:**
```javascript
hsts: {
  maxAge: 31536000,        // 1 year (31,536,000 seconds)
  includeSubDomains: true, // Applies to all subdomains
  preload: true            // Eligible for HSTS preload list
}
```

**HSTS Headers Sent:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Configuration Details:**
- **maxAge: 31536000** - Browser enforces HTTPS for 1 year
- **includeSubDomains: true** - Protection applies to all subdomains
- **preload: true** - Allows submission to HSTS preload list

**Security Benefits:**
- ✅ Forces browsers to use HTTPS for all future requests
- ✅ Prevents protocol downgrade attacks
- ✅ Protects against SSL stripping attacks
- ✅ Applies to all subdomains automatically
- ✅ Can be added to browser preload lists for first-visit protection

**How It Works:**
1. First HTTPS visit: Browser receives HSTS header
2. Browser caches: HTTPS-only policy for 1 year
3. Future requests: Browser automatically uses HTTPS even if user types HTTP
4. Protection: Cannot be bypassed by attackers

**Preload List Eligibility:**
- With `preload: true`, the site can be submitted to the HSTS preload list
- This protects users on their very first visit (before HSTS is cached)
- Requirements:
  - Serve HSTS header on base domain
  - Include `preload` directive
  - Have `includeSubDomains` enabled
  - Have valid HTTPS certificate
  - Redirect HTTP to HTTPS

---

## Additional Security Headers

**Full Security Headers Configuration:**

```javascript
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"], // HTTPS only
      connectSrc: ["'self'", "https://api.stripe.com", "https://www.virustotal.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Firebase/Stripe embeds
  hsts: {
    maxAge: 31536000,        // 1 year
    includeSubDomains: true, // All subdomains
    preload: true            // Preload eligible
  }
});
```

**Headers Included:**
- ✅ **HSTS** - Strict Transport Security
- ✅ **CSP** - Content Security Policy (HTTPS only)
- ✅ **X-Content-Type-Options** - Prevents MIME sniffing
- ✅ **X-Frame-Options** - Prevents clickjacking
- ✅ **X-XSS-Protection** - XSS protection
- ✅ **Referrer-Policy** - Controls referrer information

---

## Verification

### Testing HTTPS Enforcement:

1. **HTTP Redirect:**
   ```bash
   curl -I http://clickalinks-backend-2.onrender.com/api/purchases
   # Should return: 301 Moved Permanently
   # Location: https://clickalinks-backend-2.onrender.com/api/purchases
   ```

2. **HTTPS Access:**
   ```bash
   curl -I https://clickalinks-backend-2.onrender.com/api/purchases
   # Should return: 200 OK
   # Headers should include HSTS
   ```

3. **HSTS Header Check:**
   ```bash
   curl -I https://clickalinks-backend-2.onrender.com
   # Look for: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```

### Online Tools:
- **SSL Labs SSL Test:** https://www.ssllabs.com/ssltest/
- **Security Headers Check:** https://securityheaders.com/
- **HSTS Preload Check:** https://hstspreload.org/

---

## Files Modified

1. **`Backend/middleware/security.js`**
   - Added `enforceHttps()` middleware function
   - Fixed CSP to only allow HTTPS (removed `"http:"` from `imgSrc`)
   - HSTS configuration already present (verified)

2. **`Backend/server.js`**
   - Added `enforceHttps` import
   - Applied HTTPS enforcement middleware (early in chain)
   - Added logging for HTTPS enforcement status

---

## Security Checklist

### Item #14: HTTPS Enforced Everywhere
- [x] HTTP to HTTPS redirect middleware implemented
- [x] CSP blocks HTTP resources
- [x] URL validation enforces HTTPS
- [x] Frontend validation blocks HTTP input
- [x] All external links use HTTPS
- [x] No mixed content warnings

### Item #15: HSTS Enabled
- [x] HSTS header configured (1 year max-age)
- [x] includeSubDomains enabled
- [x] preload directive enabled
- [x] Headers applied to all responses
- [x] Tested and verified

---

## Deployment Notes

### Render.com Configuration:
- HTTPS is handled automatically by Render.com's load balancer
- The `enforceHttps` middleware works with Render's proxy setup
- `X-Forwarded-Proto` header is checked for HTTPS detection

### Frontend (Firebase Hosting):
- Firebase Hosting automatically enforces HTTPS
- All frontend requests are HTTPS-only
- No additional configuration needed

### Domain Configuration:
- Ensure SSL certificate is valid and properly configured
- Enable HTTPS redirect at domain/hosting level if available
- Consider submitting to HSTS preload list for maximum protection

---

*Last Updated: January 2026*
*Security Level: High ✅*

