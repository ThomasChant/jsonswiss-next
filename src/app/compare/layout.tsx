import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Diff & Compare Tool | Compare JSON Files Online - JSON Swiss",
  description: "Free online JSON diff and comparison tool. Compare two JSON files or objects with visual highlighting, structural analysis, and detailed change detection.",
  keywords: [
    "json diff",
    "json compare",
    "json comparison tool",
    "compare json files",
    "json difference",
    "json merge",
    "json change detection",
    "json visual diff",
    "online json compare",
    "json structure compare",
    "json object comparison",
    "web development tools"
  ],
  openGraph: {
    title: "JSON Diff & Compare - Compare JSON Files Online",
    description: "Free JSON comparison tool with visual highlighting and structural analysis. Compare JSON files and detect changes instantly.",
    url: "https://jsonswiss.com/compare",
    images: [
      {
        url: "https://jsonswiss.com/og-compare.png",
        width: 1200,
        height: 630,
        alt: "JSON Compare Tool - Compare JSON files with visual diff",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Diff & Compare Tool",
    description: "Free JSON comparison tool with visual highlighting and change detection.",
    images: ["https://jsonswiss.com/twitter-compare.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/compare",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
