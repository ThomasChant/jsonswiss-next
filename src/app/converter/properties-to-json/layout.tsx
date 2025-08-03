import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties to JSON Converter | Convert Java Properties to JSON - JSON Swiss",
  description: "Free online Properties to JSON converter. Convert Java properties files to JSON format with key-value parsing, nested object creation, and proper data type handling.",
  keywords: [
    "properties to json",
    "properties to json converter",
    "convert properties to json",
    "java properties to json",
    "properties file converter",
    "config to json",
    "properties parser",
    "java properties",
    "online properties converter",
    "data format converter",
    "configuration tools",
    "java tools"
  ],
  alternates: {
      canonical: "https://jsonswiss.com/converter/properties-to-json"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
