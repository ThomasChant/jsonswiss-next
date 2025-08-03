import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Scala Code Generator | Generate Scala Classes from JSON - JSON Swiss",
  description: "Free online JSON to Scala code generator. Convert JSON data to Scala case classes, objects, and types with proper naming conventions, immutability, and pattern matching support.",
  keywords: [
    "json to scala",
    "scala code generator",
    "json to scala class",
    "json to scala converter",
    "scala code generation",
    "scala case class generator",
    "scala object generator",
    "functional programming",
    "scala tools",
    "programming tools",
    "code generator",
    "jvm languages"
  ],
  openGraph: {
    title: "JSON to Scala Code Generator - Generate Scala Case Classes",
    description: "Generate Scala case classes, objects, and types from JSON data with immutability and pattern matching support.",
    url: "https://jsonswiss.com/generator/scala",
    images: [
      {
        url: "https://jsonswiss.com/og-scala-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to Scala Code Generator - Generate Scala case classes from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Scala Code Generator",
    description: "Generate Scala case classes and objects from JSON data with functional programming principles.",
    images: ["https://jsonswiss.com/twitter-scala-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/scala",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
