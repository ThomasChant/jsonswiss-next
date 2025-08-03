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
  alternates: {
    canonical: "https://jsonswiss.com/generator/ruby"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
