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
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-sql"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
