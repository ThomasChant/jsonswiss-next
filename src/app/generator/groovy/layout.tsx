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
  openGraph: {
    title: "JSON to Groovy Code Generator - Generate Groovy Classes",
    description: "Generate Groovy classes, objects, and data structures from JSON data with proper syntax and dynamic typing.",
    url: "https://jsonswiss.com/generator/groovy",
    images: [
      {
        url: "https://jsonswiss.com/og-groovy-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to Groovy Code Generator - Generate Groovy classes from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Groovy Code Generator",
    description: "Generate Groovy classes and objects from JSON data with dynamic typing and proper syntax.",
    images: ["https://jsonswiss.com/twitter-groovy-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/groovy",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
