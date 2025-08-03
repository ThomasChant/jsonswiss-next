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
  openGraph: {
    title: "JSON to JavaScript Code Generator",
    description: "Generate JavaScript objects, arrays, and classes from JSON data with ES6+ syntax and TypeScript support.",
    url: "https://jsonswiss.com/generator/javascript",
    images: [
      {
        url: "https://jsonswiss.com/og-js-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to JavaScript Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to JavaScript Code Generator",
    description: "Generate JavaScript code from JSON data with ES6+ syntax and custom formatting.",
    images: ["https://jsonswiss.com/twitter-js-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/javascript",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
