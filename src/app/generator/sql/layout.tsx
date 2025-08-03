import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to SQL Code Generator | Generate SQL Tables from JSON - JSON Swiss",
  description: "Free online JSON to SQL code generator. Convert JSON data to SQL CREATE TABLE statements, INSERT queries, and database schemas with proper data type mapping and constraints.",
  keywords: [
    "json to sql",
    "sql code generator",
    "json to sql table",
    "json to sql converter",
    "sql code generation",
    "sql table generator",
    "database schema generator",
    "sql create table",
    "database tools",
    "programming tools",
    "code generator",
    "sql tools"
  ],
  openGraph: {
    title: "JSON to SQL Code Generator - Generate SQL Tables",
    description: "Generate SQL CREATE TABLE statements and database schemas from JSON data with proper data type mapping.",
    url: "https://jsonswiss.com/generator/sql",
    images: [
      {
        url: "https://jsonswiss.com/og-sql-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to SQL Code Generator - Generate SQL tables from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to SQL Code Generator",
    description: "Generate SQL tables and database schemas from JSON data with proper type mapping and constraints.",
    images: ["https://jsonswiss.com/twitter-sql-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/sql",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
