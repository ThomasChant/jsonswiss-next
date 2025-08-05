import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Excel Converter Online - Convert JSON to Excel XLSX Free - JSON Swiss",
  description: "Convert JSON to Excel online with live preview. Free JSON to Excel converter with table preview, nested data flattening, and multiple Excel formats. Transform JSON data to XLSX, XLS, CSV instantly.",
  keywords: [
    "json to excel", "convert json to excel", "json to excel converter", "json excel converter", "conversion of json to excel", "import json to excel",
    "textract json to excel",
    "json to xlsx", "json to xls", "json to csv", "json to excel online",
    "json to excel conversion", "json to excel table",  "convert json to excel online"
  ],
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
