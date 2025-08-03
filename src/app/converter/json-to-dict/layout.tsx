import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Python Dict Converter | Convert JSON to Dictionary - JSON Swiss",
  description: "Free online JSON to Python dictionary converter. Convert JSON data to Python dict objects with proper syntax, nested structure support, and data type conversion.",
  keywords: [
    "json to python dict",
    "json to dictionary",
    "json to python converter",
    "json to dict converter",
    "json to python object",
    "python data conversion",
    "online json converter",
    "json parser",
    "json to python",
    "data format converter",
    "python tools",
    "programming tools"
  ],
  openGraph: {
    title: "JSON to Python Dict Converter - Convert JSON Online",
    description: "Free JSON to Python dictionary converter with nested structure support and proper syntax formatting. Convert JSON instantly.",
    url: "https://jsonswiss.com/converter/json-to-dict",
    images: [
      {
        url: "https://jsonswiss.com/og-json-to-dict.png",
        width: 1200,
        height: 630,
        alt: "JSON to Python Dict Converter - Convert JSON to dictionary format",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Python Dict Converter",
    description: "Convert JSON data to Python dictionary objects with proper syntax and structure preservation.",
    images: ["https://jsonswiss.com/twitter-json-to-dict.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/json-to-dict",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
