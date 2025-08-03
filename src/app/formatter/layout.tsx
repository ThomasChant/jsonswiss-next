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
  openGraph: {
    title: "JSON Formatter & Prettifier - Format JSON Online",
    description: "Free JSON formatter with syntax highlighting, tree view, and validation. Format, beautify, minify, and validate JSON data instantly.",
    url: "https://jsonswiss.com/formatter",
    images: [
      {
        url: "https://jsonswiss.com/og-formatter.png",
        width: 1200,
        height: 630,
        alt: "JSON Formatter - Format and beautify JSON online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatter & Prettifier",
    description: "Free JSON formatter with syntax highlighting and validation. Format JSON data instantly.",
    images: ["https://jsonswiss.com/twitter-formatter.png"],
  },
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
