import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to C Code Generator | Generate C Structs from JSON - JSON Swiss",
  description: "Free online JSON to C code generator. Convert JSON data to C structs, types, and data structures with proper naming conventions, memory management, and serialization support.",
  keywords: [
    "json to c",
    "c code generator",
    "json to c struct",
    "json to c converter",
    "c code generation",
    "c struct generator",
    "c type generator",
    "c programming",
    "c tools",
    "programming tools",
    "code generator",
    "systems programming",
    "embedded development",
    "c language"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/c"
  }
};

export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}