import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Dart Code Generator | Generate Dart Classes from JSON - JSON Swiss",
  description: "Free online JSON to Dart code generator. Convert JSON data to Dart classes, models, and objects with proper naming conventions, null safety, and serialization support.",
  keywords: [
    "json to dart",
    "dart code generator",
    "json to dart class",
    "json to dart converter",
    "dart code generation",
    "dart class generator",
    "json to flutter",
    "dart object generator",
    "flutter tools",
    "programming tools",
    "code generator",
    "mobile development"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/dart"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
