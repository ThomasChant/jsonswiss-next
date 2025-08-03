import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Properties Converter | Convert JSON to Properties Files - JSON Swiss",
  description: "Free online JSON to Properties converter. Convert JSON data to Java properties file format with key-value pairs, nested path handling, and proper escaping.",
  keywords: [
    "json to properties",
    "json to properties converter",
    "convert json to properties",
    "json to java properties",
    "properties file generator",
    "json to config",
    "properties file converter",
    "java properties",
    "online json converter",
    "data format converter",
    "configuration tools",
    "java tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-properties"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
