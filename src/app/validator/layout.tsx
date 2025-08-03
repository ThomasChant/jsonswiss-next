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
