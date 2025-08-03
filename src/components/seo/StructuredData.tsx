"use client";

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}

// Predefined structured data for common pages
export const homePageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "JSON Swiss",
  "description": "Professional JSON toolkit with formatting, validation, conversion, and code generation. Features AI-powered repair, tree/table views, search, and support for 12+ programming languages.",
  "url": "https://jsonswiss.com",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "creator": {
    "@type": "Organization",
    "name": "JSON Swiss Team",
    "url": "https://jsonswiss.com"
  },
  "featureList": [
    "JSON Formatting and Prettifying",
    "JSON Validation and Error Detection", 
    "JSON to CSV/XML/YAML Conversion",
    "Code Generation for 12+ Languages",
    "AI-Powered JSON Repair",
    "JSON Comparison and Diff",
    "Interactive Table View",
    "Schema Generation and Validation"
  ],
  "browserRequirements": "Requires JavaScript. Compatible with Chrome, Firefox, Safari, Edge.",
  "permissions": "No special permissions required"
};

export const toolPageStructuredData = (toolName: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": toolName,
  "description": description,
  "url": url,
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "isPartOf": {
    "@type": "WebApplication",
    "name": "JSON Swiss",
    "url": "https://jsonswiss.com"
  }
});

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "JSON Swiss",
  "url": "https://jsonswiss.com",
  "logo": "https://jsonswiss.com/logo.png",
  "description": "Provider of professional JSON processing tools and utilities for developers and data analysts.",
  "foundingDate": "2024",
  "sameAs": [
    "https://github.com/jsonswiss",
    "https://twitter.com/jsonswiss"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": ["English"]
  }
};