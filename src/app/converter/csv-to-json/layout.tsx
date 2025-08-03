import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV to JSON Converter | Convert CSV Files to JSON Online - JSON Swiss",
  description: "Free online CSV to JSON converter. Convert CSV files and data to JSON format with custom delimiters, header options, and data type detection. Fast and accurate conversion.",
  keywords: [
    "csv to json",
    "csv to json converter",
    "convert csv to json",
    "csv json converter",
    "csv file to json",
    "csv data conversion",
    "online csv converter",
    "csv parser",
    "csv to json online"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/converter/csv-to-json",
  },
};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
