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
  alternates: {
    canonical: "https://jsonswiss.com/converter/yaml-to-json"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
