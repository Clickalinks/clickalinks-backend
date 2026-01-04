import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://clickalinks.com';
const SITE_NAME = 'CLICKaLINKS';
const DEFAULT_TITLE = 'CLICKaLINKS - Affordable Grid Advertising Platform | £1 Per Day | UK';
const DEFAULT_DESCRIPTION = 'CLICKaLINKS is the UK\'s most affordable grid advertising platform. Starting at just £1 per day, showcase your business across 2000+ advertising squares on 10 pages. Perfect for small businesses, local shops, online stores, and service providers looking to reach customers with their deals, promotions, and special offers. Join hundreds of UK businesses already advertising. No contracts, no hidden fees, instant activation. Click through to customer deals, discounts, and promotions all year round.';
const DEFAULT_KEYWORDS = 'affordable advertising, grid advertising, advertising platform, UK advertising, business advertising, £1 per day advertising, cheap advertising, digital marketing, online advertising, business promotion, deals platform, promotions advertising, clickalinks, clickalinks.com';
const DEFAULT_IMAGE = `${SITE_URL}/logo.PNG`;

const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  type = 'website',
  article = null,
  noindex = false,
  canonical = null
}) => {
  const location = useLocation();
  const canonicalUrl = canonical || `${SITE_URL}${location.pathname}`;
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;

  // Structured Data - Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CLICKaLINKS",
    "legalName": "Clicado Media UK Ltd",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.PNG`,
    "description": DEFAULT_DESCRIPTION,
    "foundingDate": "2025",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@clickalinks.com",
      "contactType": "Customer Support"
    },
    "sameAs": [
      "https://www.facebook.com",
      "https://www.instagram.com",
      "https://www.linkedin.com",
      "https://www.tiktok.com"
    ]
  };

  // Structured Data - Website
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "description": DEFAULT_DESCRIPTION,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Structured Data - Service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Grid Advertising Platform",
    "description": DEFAULT_DESCRIPTION,
    "provider": {
      "@type": "Organization",
      "name": "CLICKaLINKS"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom"
    },
    "offers": {
      "@type": "Offer",
      "price": "1",
      "priceCurrency": "GBP",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "1",
        "priceCurrency": "GBP",
        "unitText": "per day"
      }
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="CLICKaLINKS - Clicado Media UK Ltd" />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:site" content="@clickalinks" />
      <meta name="twitter:creator" content="@clickalinks" />

      {/* Article Meta (if article) */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          {article.authors && article.authors.map((author, index) => (
            <meta key={index} property="article:author" content={author} />
          ))}
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#667eea" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="GB" />
      <meta name="geo.placename" content="United Kingdom" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;

