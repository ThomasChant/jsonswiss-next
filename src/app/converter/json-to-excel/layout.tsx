import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Excel Converter",
  description: "Convert JSON data to Excel spreadsheet format online. Support for multiple sheets, custom formatting, headers, and various Excel formats. Free JSON to Excel converter tool.",
  keywords: ["json to excel", "json to xlsx", "json excel converter", "convert json to excel", "json to spreadsheet", "json parser excel"],
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-excel"
  }
};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
