import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL to JSON Converter | Convert SQL Results to JSON Online - JSON Swiss",
  description: "Free online SQL to JSON converter. Convert SQL query results, INSERT statements, and database data to JSON format with proper structure and data type mapping.",
  keywords: [
    "sql to json",
    "sql to json converter",
    "convert sql to json",
    "sql results to json",
    "database to json",
    "sql parser",
    "sql query to json",
    "database converter",
    "online sql converter",
    "data format converter",
    "database tools",
    "sql tools"
  ],
  openGraph: {
    title: "SQL to JSON Converter - Convert SQL Results to JSON",
    description: "Free SQL to JSON converter with query result parsing and data type mapping. Convert database data to JSON instantly.",
    url: "https://jsonswiss.com/converter/sql-to-json",
    images: [
      {
        url: "https://jsonswiss.com/og-sql-to-json.png",
        width: 1200,
        height: 630,
        alt: "SQL to JSON Converter - Convert SQL results to JSON format",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL to JSON Converter",
    description: "Convert SQL query results and database data to JSON format with proper structure mapping.",
    images: ["https://jsonswiss.com/twitter-sql-to-json.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/sql-to-json",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
