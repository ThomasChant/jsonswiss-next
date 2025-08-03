import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter & Prettifier | Format JSON Online - JSON Swiss",
  description: "Free online JSON formatter and prettifier. Format, beautify, and validate JSON data with syntax highlighting, tree view, and error detection. Supports minify and compact modes.",
  keywords: [
    "json formatter",
    "json prettifier", 
    "json beautifier",
    "format json online",
    "json pretty print",
    "json minifier",
    "json compact",
    "json syntax highlighting",
    "json tree view",
    "json indentation",
    "online json tools",
    "web development tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/formatter",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
