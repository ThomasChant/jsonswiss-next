import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel to JSON Converter",
  description: "Convert Excel spreadsheet data to JSON format online. Support for multiple sheets, custom ranges, headers, and all Excel formats. Free Excel to JSON converter tool.",
  keywords: ["excel to json", "xlsx to json", "excel json converter", "convert excel to json", "spreadsheet to json", "excel parser json"],
  openGraph: {
    title: "Excel to JSON Converter - JSON Swiss",
    description: "Convert Excel files (.xlsx, .xls, .xlsm) to JSON format with advanced options. Select sheets, specify ranges, and customize headers.",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
