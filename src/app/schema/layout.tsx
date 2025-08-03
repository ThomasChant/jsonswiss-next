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
  openGraph: {
    title: "JSON Schema Tools - Complete Schema Toolkit",
    description: "Professional JSON Schema tools including generator, validator, mock data creator, and comprehensive template library.",
    url: "https://jsonswiss.com/schema",
    images: [
      {
        url: "https://jsonswiss.com/og-schema-tools.png",
        width: 1200,
        height: 630,
        alt: "JSON Schema Tools - Complete schema toolkit for developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema Tools",
    description: "Complete JSON Schema toolkit with generator, validator, and template library for API development.",
    images: ["https://jsonswiss.com/twitter-schema-tools.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/schema",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
