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
  openGraph: {
    title: "JSON to Python Code Generator",
    description: "Generate Python dictionaries, classes, and dataclasses from JSON data with custom formatting options.",
    url: "https://jsonswiss.com/generator/python",
    images: [
      {
        url: "https://jsonswiss.com/og-python-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to Python Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Python Code Generator",
    description: "Generate Python code from JSON data with dictionary and dataclass support.",
    images: ["https://jsonswiss.com/twitter-python-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/python",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
