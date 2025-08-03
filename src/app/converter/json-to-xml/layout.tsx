import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to XML Converter | Convert JSON to XML Online - JSON Swiss",
  description: "Free online JSON to XML converter. Convert JSON data to XML format with custom root elements, attribute handling, and proper XML structure formatting.",
  keywords: [
    "json to xml",
    "json to xml converter",
    "convert json to xml",
    "xml converter",
    "json xml conversion",
    "xml generator",
    "json to markup",
    "xml format",
    "online json converter",
    "data format converter",
    "xml tools",
    "markup converter"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-xml"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
