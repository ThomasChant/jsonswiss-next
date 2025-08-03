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
  alternates: {
    canonical: "https://jsonswiss.com/generator/scala"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
