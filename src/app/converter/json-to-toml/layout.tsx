import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to TOML Converter | Convert JSON to TOML Files Online - JSON Swiss",
  description: "Free online JSON to TOML converter. Convert JSON data to TOML configuration file format with proper syntax, nested tables, and array handling.",
  keywords: [
    "json to toml",
    "json to toml converter",
    "convert json to toml",
    "toml converter",
    "json to config file",
    "toml file generator",
    "configuration converter",
    "toml format",
    "online json converter",
    "data format converter",
    "configuration tools",
    "file format converter"
  ],
  openGraph: {
    title: "JSON to TOML Converter - Convert JSON to TOML Configuration",
    description: "Free JSON to TOML converter with proper syntax and nested table handling. Convert JSON to TOML files instantly.",
    url: "https://jsonswiss.com/converter/json-to-toml",
    images: [
      {
        url: "https://jsonswiss.com/og-json-to-toml.png",
        width: 1200,
        height: 630,
        alt: "JSON to TOML Converter - Convert JSON to TOML configuration files",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to TOML Converter",
    description: "Convert JSON data to TOML configuration file format with proper syntax and structure.",
    images: ["https://jsonswiss.com/twitter-json-to-toml.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-toml",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
