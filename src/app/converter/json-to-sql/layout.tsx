import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to SQL Converter | Convert JSON to SQL INSERT Statements - JSON Swiss",
  description: "Free online JSON to SQL converter. Convert JSON data to SQL INSERT statements, CREATE TABLE scripts, and database queries with custom table names and data type mapping.",
  keywords: [
    "json to sql",
    "json to sql converter",
    "convert json to sql",
    "json to insert statements",
    "json to database",
    "sql generator",
    "json to create table",
    "database converter",
    "online json converter",
    "data format converter",
    "database tools",
    "sql tools"
  ],
  openGraph: {
    title: "JSON to SQL Converter - Convert JSON to Database Queries",
    description: "Free JSON to SQL converter with INSERT statements and CREATE TABLE generation. Convert JSON to database queries instantly.",
    url: "https://jsonswiss.com/converter/json-to-sql",
    images: [
      {
        url: "https://jsonswiss.com/og-json-to-sql.png",
        width: 1200,
        height: 630,
        alt: "JSON to SQL Converter - Convert JSON to SQL INSERT statements",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to SQL Converter",
    description: "Convert JSON data to SQL INSERT statements and CREATE TABLE scripts with custom mapping.",
    images: ["https://jsonswiss.com/twitter-json-to-sql.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-sql",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
