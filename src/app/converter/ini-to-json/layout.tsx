import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "INI to JSON Converter | Convert INI Files to JSON Online - JSON Swiss",
  description: "Free online INI to JSON converter. Convert INI configuration files to JSON format with section parsing, key-value pair handling, and nested structure support.",
  keywords: [
    "ini to json",
    "ini to json converter",
    "convert ini to json",
    "ini file converter",
    "configuration file converter",
    "ini parser",
    "config to json",
    "ini file to json",
    "online ini converter",
    "data format converter",
    "configuration tools",
    "file format converter"
  ],
  openGraph: {
    title: "INI to JSON Converter - Convert INI Files Online",
    description: "Free INI to JSON converter with section parsing and key-value pair handling. Convert configuration files instantly.",
    url: "https://jsonswiss.com/converter/ini-to-json",
    images: [
      {
        url: "https://jsonswiss.com/og-ini-to-json.png",
        width: 1200,
        height: 630,
        alt: "INI to JSON Converter - Convert INI configuration files to JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "INI to JSON Converter",
    description: "Convert INI configuration files to JSON format with section and key-value parsing.",
    images: ["https://jsonswiss.com/twitter-ini-to-json.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/ini-to-json",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
