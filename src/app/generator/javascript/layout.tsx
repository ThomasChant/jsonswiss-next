import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to JavaScript Code Generator | Generate JS Objects - JSON Swiss",
  description: "Free online JSON to JavaScript code generator. Convert JSON data to JavaScript objects, arrays, and classes with ES6+ syntax, TypeScript support, and custom formatting options.",
  keywords: [
    "json to javascript",
    "json to js",
    "javascript code generator",
    "json to js object",
    "json to javascript converter",
    "js code generation",
    "javascript object generator",
    "json to es6",
    "json to typescript",
    "web development tools",
    "code generator",
    "javascript tools"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/generator/javascript"}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
