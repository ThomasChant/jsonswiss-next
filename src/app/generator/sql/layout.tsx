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
  alternates: {
    canonical: "https://jsonswiss.com/generator/sql"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
