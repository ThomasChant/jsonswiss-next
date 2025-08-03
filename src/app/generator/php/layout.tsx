import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to PHP Code Generator | Generate PHP Classes from JSON - JSON Swiss",
  description: "Free online JSON to PHP code generator. Convert JSON data to PHP classes, arrays, and objects with proper syntax, type hints, and PSR standards compliance.",
  keywords: [
    "json to php",
    "php code generator",
    "json to php class",
    "json to php converter",
    "php code generation",
    "php class generator",
    "json to php array",
    "php object generator",
    "php tools",
    "programming tools",
    "code generator",
    "web development"
  ],
  openGraph: {
    title: "JSON to PHP Code Generator - Generate PHP Classes",
    description: "Generate PHP classes, arrays, and objects from JSON data with proper syntax and PSR standards compliance.",
    url: "https://jsonswiss.com/generator/php",
    images: [
      {
        url: "https://jsonswiss.com/og-php-generator.png",
        width: 1200,
        height: 630,
        alt: "JSON to PHP Code Generator - Generate PHP classes from JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to PHP Code Generator",
    description: "Generate PHP classes and objects from JSON data with proper syntax and type hints.",
    images: ["https://jsonswiss.com/twitter-php-generator.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/generator/php",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
