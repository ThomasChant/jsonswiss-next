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
  openGraph: {
    title: "JSON to XML Converter - Convert JSON to XML Format",
    description: "Free JSON to XML converter with custom root elements and attribute handling. Convert JSON to XML instantly.",
    url: "https://jsonswiss.com/converter/json-to-xml",
    images: [
      {
        url: "https://jsonswiss.com/og-json-to-xml.png",
        width: 1200,
        height: 630,
        alt: "JSON to XML Converter - Convert JSON to XML format",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to XML Converter",
    description: "Convert JSON data to XML format with custom root elements and proper structure formatting.",
    images: ["https://jsonswiss.com/twitter-json-to-xml.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-xml",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
