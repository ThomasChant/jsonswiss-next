import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Repair Tool | Fix Invalid JSON Online with AI - JSON Swiss",
  description: "Free AI-powered JSON repair tool. Fix malformed JSON, missing quotes, trailing commas, and syntax errors automatically. Smart JSON error correction and recovery.",
  keywords: [
    "json repair",
    "fix json",
    "json error fix",
    "repair malformed json",
    "json syntax repair",
    "ai json repair",
    "json recovery",
    "fix invalid json",
    "json auto repair", 
    "json error correction",
    "broken json fix",
    "online json repair"
  ],
  openGraph: {
    title: "JSON Repair Tool - Fix Invalid JSON with AI",
    description: "AI-powered JSON repair tool that fixes malformed JSON, syntax errors, and formatting issues automatically.",
    url: "https://jsonswiss.com/repair",
    images: [
      {
        url: "https://jsonswiss.com/og-repair.png",
        width: 1200,
        height: 630,
        alt: "JSON Repair Tool - Fix invalid JSON with AI assistance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Repair Tool - AI-Powered JSON Fix",
    description: "Fix malformed JSON and syntax errors automatically with AI assistance.",
    images: ["https://jsonswiss.com/twitter-repair.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/repair",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
