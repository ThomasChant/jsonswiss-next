import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to INI Converter | Convert JSON to INI Files Online - JSON Swiss",
  description: "Free online JSON to INI converter. Convert JSON data to INI configuration file format with section organization, key-value pairs, and proper formatting.",
  keywords: [
    "json to ini",
    "json to ini converter",
    "convert json to ini",
    "json to config file",
    "json to configuration",
    "ini file generator",
    "config file converter",
    "json to ini file",
    "online json converter",
    "data format converter",
    "configuration tools",
    "file format converter"
  ],
  openGraph: {
    title: "JSON to INI Converter - Convert JSON to Configuration Files",
    description: "Free JSON to INI converter with section organization and key-value formatting. Convert JSON to configuration files instantly.",
    url: "https://jsonswiss.com/converter/json-to-ini",
    images: [
      {
        url: "https://jsonswiss.com/og-json-to-ini.png",
        width: 1200,
        height: 630,
        alt: "JSON to INI Converter - Convert JSON to INI configuration files",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to INI Converter",
    description: "Convert JSON data to INI configuration file format with proper section and key-value organization.",
    images: ["https://jsonswiss.com/twitter-json-to-ini.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-ini",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
