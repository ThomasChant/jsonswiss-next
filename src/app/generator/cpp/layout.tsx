import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to C++ Code Generator | Generate C++ Classes from JSON - JSON Swiss",
  description: "Free online JSON to C++ code generator. Convert JSON data to C++ classes, structs, and objects with modern C++ features, smart pointers, STL containers, and serialization support.",
  keywords: [
    "json to c++",
    "json to cpp",
    "c++ code generator",
    "json to c++ class",
    "json to c++ converter",
    "cpp code generation",
    "c++ class generator",
    "c++ struct generator",
    "modern c++",
    "c++ tools",
    "programming tools",
    "code generator",
    "systems programming",
    "c++ development",
    "object oriented programming"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/cpp"
  }
};

export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}