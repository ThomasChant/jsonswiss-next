import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to YAML Converter | Convert JSON to YAML Online - JSON Swiss",
  description: "Free online JSON to YAML converter. Convert JSON data to YAML format with proper indentation, flow style options, and nested structure preservation.",
  keywords: [
    "json to yaml",
    "json to yaml converter",
    "convert json to yaml",
    "yaml converter",
    "json yaml conversion",
    "yaml generator",
    "json to yml",
    "yaml format",
    "online json converter",
    "data format converter",
    "yaml tools",
    "configuration converter"
  ],
  openGraph: {
    title: "JSON to YAML Converter - Convert JSON to YAML Format",
    description: "Free JSON to YAML converter with proper indentation and flow style options. Convert JSON to YAML instantly.",
    url: "https://jsonswiss.com/converter/json-to-yaml",
    images: [
      {
        url: "https://jsonswiss.com/og-json-to-yaml.png",
        width: 1200,
        height: 630,
        alt: "JSON to YAML Converter - Convert JSON to YAML format",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to YAML Converter",
    description: "Convert JSON data to YAML format with proper indentation and structure preservation.",
    images: ["https://jsonswiss.com/twitter-json-to-yaml.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-yaml",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
