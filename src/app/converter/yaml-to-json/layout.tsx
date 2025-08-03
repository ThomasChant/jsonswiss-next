import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAML to JSON Converter | Convert YAML Files to JSON Online - JSON Swiss",
  description: "Free online YAML to JSON converter. Convert YAML files and data to JSON format with proper parsing, nested structure support, and data type preservation.",
  keywords: [
    "yaml to json",
    "yaml to json converter",
    "convert yaml to json",
    "yml to json",
    "yaml converter",
    "yaml file to json",
    "yaml parser",
    "configuration converter",
    "online yaml converter",
    "data format converter",
    "yaml tools",
    "file format converter"
  ],
  openGraph: {
    title: "YAML to JSON Converter - Convert YAML Files Online",
    description: "Free YAML to JSON converter with proper parsing and nested structure support. Convert YAML files to JSON instantly.",
    url: "https://jsonswiss.com/converter/yaml-to-json",
    images: [
      {
        url: "https://jsonswiss.com/og-yaml-to-json.png",
        width: 1200,
        height: 630,
        alt: "YAML to JSON Converter - Convert YAML files to JSON format",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAML to JSON Converter",
    description: "Convert YAML files to JSON format with proper parsing and structure preservation.",
    images: ["https://jsonswiss.com/twitter-yaml-to-json.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/yaml-to-json",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
