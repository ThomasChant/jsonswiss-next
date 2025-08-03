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
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-yaml"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
