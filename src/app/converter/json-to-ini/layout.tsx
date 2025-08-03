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
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-ini"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
