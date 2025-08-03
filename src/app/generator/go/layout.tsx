import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Go Code Generator | Generate Go Structs from JSON - JSON Swiss",
  description: "Free online JSON to Go code generator. Convert JSON data to Go structs, types, and models with proper field tags, naming conventions, and JSON serialization support.",
  keywords: [
    "json to go",
    "json to golang",
    "go code generator",
    "json to go struct",
    "json to go converter",
    "golang code generation",
    "go struct generator",
    "go type generator",
    "golang tools",
    "programming tools",
    "code generator",
    "backend development"
  ],
  openGraph: {
    title: "JSON to Go Code Generator - Generate Go Structs",
    description: "Generate Go structs, types, and models from JSON data with proper field tags and naming conventions.",
    url: "https://jsonswiss.com/generator/go",
    images: [
      {
        url: "https://jsonswiss.com/og-go-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to Go Code Generator - Generate Go structs from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Go Code Generator",
    description: "Generate Go structs and types from JSON data with proper field tags and serialization support.",
    images: ["https://jsonswiss.com/twitter-go-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/go",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
