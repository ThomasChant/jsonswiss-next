import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML to JSON Converter | Convert XML Files to JSON Online - JSON Swiss",
  description: "Free online XML to JSON converter. Convert XML documents and data to JSON format with attribute handling, namespace support, and custom conversion options.",
  keywords: [
    "xml to json",
    "xml to json converter",
    "convert xml to json", 
    "xml json converter",
    "xml file to json",
    "xml parser",
    "xml transformation",
    "xml data conversion",
    "online xml converter",
    "xml to json parser",
    "xml document converter",
    "data format converter"
  ],
  openGraph: {
    title: "XML to JSON Converter - Convert XML Files Online", 
    description: "Free XML to JSON converter with attribute handling, namespace support, and custom conversion options. Convert XML documents to JSON instantly.",
    url: "https://jsonswiss.com/converter/xml-to-json",
    images: [
      {
        url: "https://jsonswiss.com/og-xml-to-json.png",
        width: 1200,
        height: 630,
        alt: "XML to JSON Converter - Convert XML files to JSON format",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XML to JSON Converter",
    description: "Convert XML documents to JSON format with attribute handling and namespace support.",
    images: ["https://jsonswiss.com/twitter-xml-to-json.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/xml-to-json",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
