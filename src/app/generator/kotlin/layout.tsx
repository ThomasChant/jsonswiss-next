import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Kotlin Code Generator | Generate Kotlin Data Classes from JSON - JSON Swiss",
  description: "Free online JSON to Kotlin code generator. Convert JSON data to Kotlin data classes and models with kotlinx.serialization, Gson, or Jackson annotations and null safety.",
  keywords: [
    "json to kotlin",
    "kotlin code generator",
    "json to kotlin class",
    "json to kotlin converter",
    "kotlin code generation",
    "kotlin data class generator",
    "json to kotlin data class",
    "kotlin object generator",
    "kotlin tools",
    "programming tools",
    "code generator",
    "android development",
    "kotlinx serialization",
    "kotlin multiplatform"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/kotlin"
  }
};

export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}