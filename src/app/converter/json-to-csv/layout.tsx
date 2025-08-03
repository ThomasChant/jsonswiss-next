import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to CSV Converter | Convert JSON to CSV Files Online - JSON Swiss", 
  description: "Free online JSON to CSV converter. Convert JSON data to CSV format with custom delimiters, nested object flattening, and array handling options. Export to Excel-compatible CSV.",
  keywords: [
    "json to csv",
    "json to csv converter", 
    "convert json to csv",
    "json csv converter",
    "json file to csv",
    "json data export",
    "online json converter",
    "json to spreadsheet",
    "json to excel",
    "data format converter",
    "json flattening",
    "nested json to csv"
  ],
  openGraph: {
    title: "JSON to CSV Converter - Convert JSON to CSV Files",
    description: "Free JSON to CSV converter with nested object flattening and custom delimiter options. Export JSON data to Excel-compatible CSV.",
    url: "https://jsonswiss.com/converter/json-to-csv",
    images: [
      {
        url: "https://jsonswiss.com/og-json-to-csv.png",
        width: 1200,
        height: 630,
        alt: "JSON to CSV Converter - Convert JSON data to CSV format",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to CSV Converter",
    description: "Convert JSON data to CSV format with nested object flattening and custom options.",
    images: ["https://jsonswiss.com/twitter-json-to-csv.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-csv",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
