import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Validator & Schema Validation | Validate JSON Online - JSON Swiss",
  description: "Free online JSON validator with detailed error reporting, schema validation, and syntax checking. Validate JSON structure, format, and compliance with real-time feedback.",
  keywords: [
    "json validator",
    "json validation",
    "validate json online", 
    "json schema validation",
    "json syntax checker",
    "json error detection",
    "json structure validation",
    "json compliance check",
    "online json validator",
    "json verification",
    "json format checker",
    "web development tools"
  ],
  openGraph: {
    title: "JSON Validator - Validate JSON Online with Schema Support",
    description: "Free JSON validator with detailed error reporting and schema validation. Check JSON syntax, structure, and compliance instantly.",
    url: "https://jsonswiss.com/validator",
    images: [
      {
        url: "https://jsonswiss.com/og-validator.png",
        width: 1200,
        height: 630,
        alt: "JSON Validator - Validate JSON syntax and schema online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Validator & Schema Validation",
    description: "Free JSON validator with detailed error reporting and schema validation.",
    images: ["https://jsonswiss.com/twitter-validator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/validator",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
