import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Java Code Generator | Generate Java Classes from JSON - JSON Swiss",
  description: "Free online JSON to Java code generator. Convert JSON data to Java classes, POJOs, and data models with proper naming conventions, annotations, and getter/setter methods.",
  keywords: [
    "json to java",
    "java code generator",
    "json to java class",
    "json to java converter",
    "java code generation",
    "java class generator",
    "json to pojo",
    "java object generator",
    "java tools",
    "programming tools",
    "code generator",
    "backend development"
  ],
  openGraph: {
    title: "JSON to Java Code Generator - Generate Java Classes",
    description: "Generate Java classes, POJOs, and data models from JSON data with proper naming conventions and annotations.",
    url: "https://jsonswiss.com/generator/java",
    images: [
      {
        url: "https://jsonswiss.com/og-java-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to Java Code Generator - Generate Java classes from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Java Code Generator",
    description: "Generate Java classes and POJOs from JSON data with proper conventions and annotations.",
    images: ["https://jsonswiss.com/twitter-java-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/java",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
