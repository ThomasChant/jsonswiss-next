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
  alternates: {
    canonical: "https://jsonswiss.com/converter/ini-to-json"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
