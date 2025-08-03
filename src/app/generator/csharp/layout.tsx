import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to C# Code Generator | Generate C# Classes from JSON - JSON Swiss",
  description: "Free online JSON to C# code generator. Convert JSON data to C# classes, objects, and data models with proper naming conventions, nullable types, and attribute support.",
  keywords: [
    "json to c#",
    "json to csharp",
    "c# code generator",
    "json to c# class",
    "json to c# converter",
    "csharp code generation",
    "c# class generator",
    "json to dotnet",
    "c# object generator",
    "programming tools",
    "code generator",
    "dotnet tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/csharp"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
