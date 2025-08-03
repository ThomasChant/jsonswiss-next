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
