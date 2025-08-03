import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python Dict to JSON Converter | Convert Dictionary to JSON - JSON Swiss",
  description: "Free online Python dictionary to JSON converter. Convert Python dict objects to JSON format with proper formatting, nested structure support, and data type preservation.",
  keywords: [
    "python dict to json",
    "dictionary to json",
    "python dictionary converter",
    "dict to json converter",
    "python object to json",
    "python data conversion",
    "online python converter",
    "dict parser",
    "python to json",
    "data format converter",
    "python tools",
    "programming tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/converter/dict-to-json"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
