import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Python Code Generator | Generate Python Objects - JSON Swiss",
  description: "Free online JSON to Python code generator. Convert JSON data to Python dictionaries, classes, and data structures with custom formatting and dataclass support.",
  keywords: [
    "json to python",
    "python code generator",
    "json to python dict",
    "json to python converter",
    "python dictionary generator",
    "json to dataclass",
    "python object generator",
    "python code generation",
    "json to pydantic",
    "python development tools",
    "code generator",
    "python tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/python"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
