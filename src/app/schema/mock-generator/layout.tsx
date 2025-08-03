import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Schema Mock Data Generator | Generate Test Data from Schema - JSON Swiss",
  description: "Free online JSON Schema mock data generator. Generate realistic test data, sample JSON objects, and mock responses from JSON Schema definitions with customizable options.",
  keywords: [
    "json schema mock generator",
    "mock data generator",
    "test data generator",
    "json schema faker",
    "sample data generator",
    "json mock data",
    "schema test data",
    "fake data generator",
    "api mock data",
    "json schema testing",
    "data generation",
    "testing tools"
  ],
  openGraph: {
    title: "JSON Schema Mock Data Generator - Generate Test Data",
    description: "Generate realistic test data and mock JSON objects from JSON Schema definitions with customizable options.",
    url: "https://jsonswiss.com/schema/mock-generator",
    images: [
      {
        url: "https://jsonswiss.com/og-schema-mock-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON Schema Mock Data Generator - Generate test data from schema",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema Mock Data Generator",
    description: "Generate realistic test data and mock JSON objects from JSON Schema definitions.",
    images: ["https://jsonswiss.com/twitter-schema-mock-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/schema/mock-generator",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
