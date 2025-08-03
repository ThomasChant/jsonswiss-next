import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TOML to JSON Converter | Convert TOML Files to JSON Online - JSON Swiss",
  description: "Free online TOML to JSON converter. Convert TOML configuration files to JSON format with table parsing, array handling, and nested structure support.",
  keywords: [
    "toml to json",
    "toml to json converter",
    "convert toml to json",
    "toml converter",
    "toml file to json",
    "configuration converter",
    "toml parser",
    "config file converter",
    "online toml converter",
    "data format converter",
    "configuration tools",
    "file format converter"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/converter/toml-to-json"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
