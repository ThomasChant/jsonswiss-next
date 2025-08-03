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
  openGraph: {
    title: "JSON Schema Library - Browse Templates & Examples",
    description: "Comprehensive collection of JSON Schema templates and examples for common data structures and API patterns.",
    url: "https://jsonswiss.com/schema/library",
    images: [
      {
        url: "https://jsonswiss.com/og-schema-library.png",
        width: 1200,
        height: 630,
        alt: "JSON Schema Library - Browse schema templates and examples",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema Library",
    description: "Browse comprehensive collection of JSON Schema templates and examples for common data structures.",
    images: ["https://jsonswiss.com/twitter-schema-library.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/schema/library",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
