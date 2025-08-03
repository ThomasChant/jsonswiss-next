import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to TypeScript Code Generator | Generate TS Interfaces - JSON Swiss",
  description: "Free online JSON to TypeScript code generator. Convert JSON data to TypeScript interfaces, types, classes, and objects with strict typing and custom formatting options.",
  keywords: [
    "json to typescript",
    "json to ts",
    "typescript code generator",
    "json to typescript interface",
    "json to ts interface",
    "typescript interface generator",
    "json to typescript types",
    "ts code generation",
    "typescript object generator",
    "typescript development tools",
    "code generator",
    "typescript tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/typescript"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
