import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Properties Converter | Convert JSON to Properties Files - JSON Swiss",
  description: "Free online JSON to Properties converter. Convert JSON data to Java properties file format with key-value pairs, nested path handling, and proper escaping.",
  keywords: [
    "json to properties",
    "json to properties converter",
    "convert json to properties",
    "json to java properties",
    "properties file generator",
    "json to config",
    "properties file converter",
    "java properties",
    "online json converter",
    "data format converter",
    "configuration tools",
    "java tools"
  ],
  openGraph: {
    title: "JSON to Properties Converter - Convert JSON to Java Properties",
    description: "Free JSON to Properties converter with nested path handling and proper escaping. Convert JSON to Java properties files instantly.",
    url: "https://jsonswiss.com/converter/json-to-properties",
    images: [
      {
        url: "https://jsonswiss.com/og-json-to-properties.png",
        width: 1200,
        height: 630,
        alt: "JSON to Properties Converter - Convert JSON to Java properties files",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Properties Converter",
    description: "Convert JSON data to Java properties file format with key-value pairs and nested path handling.",
    images: ["https://jsonswiss.com/twitter-json-to-properties.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-properties",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
