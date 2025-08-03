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
  openGraph: {
    title: "JSON to Rust Code Generator - Generate Rust Structs",
    description: "Generate Rust structs, enums, and types from JSON data with derive macros and serde serialization support.",
    url: "https://jsonswiss.com/generator/rust",
    images: [
      {
        url: "https://jsonswiss.com/og-rust-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to Rust Code Generator - Generate Rust structs from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Rust Code Generator",
    description: "Generate Rust structs and types from JSON data with derive macros and serde support.",
    images: ["https://jsonswiss.com/twitter-rust-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/rust",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
