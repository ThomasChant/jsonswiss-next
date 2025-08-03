import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Swift Code Generator | Generate Swift Structs from JSON - JSON Swiss",
  description: "Free online JSON to Swift code generator. Convert JSON data to Swift structs, classes, and models with proper naming conventions, Codable protocol, and optional handling.",
  keywords: [
    "json to swift",
    "swift code generator",
    "json to swift struct",
    "json to swift converter",
    "swift code generation",
    "swift struct generator",
    "swift class generator",
    "swift codable",
    "ios development",
    "programming tools",
    "code generator",
    "mobile development"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/swift"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
