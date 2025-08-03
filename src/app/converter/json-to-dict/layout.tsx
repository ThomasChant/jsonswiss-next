import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Python Dict Converter | Convert JSON to Dictionary - JSON Swiss",
  description: "Free online JSON to Python dictionary converter. Convert JSON data to Python dict objects with proper syntax, nested structure support, and data type conversion.",
  keywords: [
    "json to python dict",
    "json to dictionary",
    "json to python converter",
    "json to dict converter",
    "json to python object",
    "python data conversion",
    "online json converter",
    "json parser",
    "json to python",
    "data format converter",
    "python tools",
    "programming tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-dict"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
