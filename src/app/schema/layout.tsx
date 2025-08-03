import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Schema Tools | Schema Generator, Validator & Library - JSON Swiss",
  description: "Complete JSON Schema toolkit with schema generation, validation, mock data creation, and comprehensive template library. Professional tools for API development and data validation.",
  keywords: [
    "json schema",
    "json schema tools",
    "schema generator",
    "schema validator",
    "json schema library",
    "api schema",
    "data validation",
    "schema creation",
    "json schema editor",
    "schema templates",
    "api development",
    "data structure validation"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/schema"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
