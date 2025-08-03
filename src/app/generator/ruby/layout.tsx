import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate Ruby Classes from JSON | Online JSON to Ruby Code Generator - JSON Swiss",
  description: "Free online JSON to Ruby code generator. Convert JSON data to Ruby classes, hashes, and objects with proper naming conventions, attr_accessor, and serialization support.",
  keywords: [
    "json to ruby",
    "ruby code generator",
    "json to ruby class",
    "json to ruby converter",
    "ruby code generation",
    "ruby class generator",
    "json to ruby hash",
    "ruby object generator",
    "ruby tools",
    "programming tools",
    "code generator",
    "web development"
  ],
  openGraph: {
    title: "JSON to Ruby Code Generator - Generate Ruby Classes",
    description: "Generate Ruby classes, hashes, and objects from JSON data with proper naming conventions and serialization support.",
    url: "https://jsonswiss.com/generator/ruby",
    images: [
      {
        url: "https://jsonswiss.com/og-ruby-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to Ruby Code Generator - Generate Ruby classes from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Ruby Code Generator",
    description: "Generate Ruby classes and objects from JSON data with proper conventions and attr_accessor.",
    images: ["https://jsonswiss.com/twitter-ruby-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/ruby",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
