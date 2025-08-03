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
  alternates: {
    canonical: "https://jsonswiss.com/generator/java"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
