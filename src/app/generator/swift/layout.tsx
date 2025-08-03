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
  openGraph: {
    title: "JSON to Swift Code Generator - Generate Swift Structs",
    description: "Generate Swift structs, classes, and models from JSON data with Codable protocol and optional handling.",
    url: "https://jsonswiss.com/generator/swift",
    images: [
      {
        url: "https://jsonswiss.com/og-swift-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to Swift Code Generator - Generate Swift structs from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Swift Code Generator",
    description: "Generate Swift structs and models from JSON data with Codable protocol and proper conventions.",
    images: ["https://jsonswiss.com/twitter-swift-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/swift",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
