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
  alternates: {
    canonical: "https://jsonswiss.com/converter/sql-to-json"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
