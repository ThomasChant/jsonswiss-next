import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to PHP Code Generator | Generate PHP Classes from JSON - JSON Swiss",
  description: "Free online JSON to PHP code generator. Convert JSON data to PHP classes, arrays, and objects with proper syntax, type hints, and PSR standards compliance.",
  keywords: [
    "json to php",
    "php code generator",
    "json to php class",
    "json to php converter",
    "php code generation",
    "php class generator",
    "json to php array",
    "php object generator",
    "php tools",
    "programming tools",
    "code generator",
    "web development"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/php"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
