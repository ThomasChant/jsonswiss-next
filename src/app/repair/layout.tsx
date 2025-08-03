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
