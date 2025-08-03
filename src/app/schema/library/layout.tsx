import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Schema Library | Browse Schema Templates & Examples - JSON Swiss",
  description: "Comprehensive JSON Schema library with templates, examples, and patterns for common data structures. Browse schemas for APIs, configurations, user management, e-commerce, and more.",
  keywords: [
    "json schema library",
    "json schema templates",
    "json schema examples",
    "schema patterns",
    "json schema collection",
    "api schema",
    "data validation",
    "schema repository",
    "json schema catalog",
    "schema browser",
    "json validation",
    "data structure templates"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/schema/library"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
