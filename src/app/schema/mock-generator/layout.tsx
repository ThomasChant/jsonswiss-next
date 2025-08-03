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
  alternates: {
    canonical: "https://jsonswiss.com/schema/mock-generator"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
