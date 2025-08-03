import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Groovy Code Generator | Generate Groovy Classes from JSON - JSON Swiss",
  description: "Free online JSON to Groovy code generator. Convert JSON data to Groovy classes, objects, and data structures with proper syntax and dynamic typing support.",
  keywords: [
    "json to groovy",
    "groovy code generator",
    "json to groovy class",
    "json to groovy converter",
    "groovy code generation",
    "groovy class generator",
    "groovy object generator",
    "jvm languages",
    "programming tools",
    "code generator",
    "backend development",
    "groovy tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/groovy"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
