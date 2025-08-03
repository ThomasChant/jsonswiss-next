import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Rust Code Generator | Generate Rust Structs from JSON - JSON Swiss",
  description: "Free online JSON to Rust code generator. Convert JSON data to Rust structs, enums, and types with proper naming conventions, derive macros, and serde serialization support.",
  keywords: [
    "json to rust",
    "rust code generator",
    "json to rust struct",
    "json to rust converter",
    "rust code generation",
    "rust struct generator",
    "rust type generator",
    "rust serde",
    "rust tools",
    "programming tools",
    "code generator",
    "systems programming"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/rust"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
