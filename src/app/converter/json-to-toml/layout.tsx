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
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-toml"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
