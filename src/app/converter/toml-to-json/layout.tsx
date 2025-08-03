import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TOML to JSON Converter | Convert TOML Files to JSON Online - JSON Swiss",
  description: "Free online TOML to JSON converter. Convert TOML configuration files to JSON format with table parsing, array handling, and nested structure support.",
  keywords: [
    "toml to json",
    "toml to json converter",
    "convert toml to json",
    "toml converter",
    "toml file to json",
    "configuration converter",
    "toml parser",
    "config file converter",
    "online toml converter",
    "data format converter",
    "configuration tools",
    "file format converter"
  ],
  openGraph: {
    title: "TOML to JSON Converter - Convert TOML Configuration Files",
    description: "Free TOML to JSON converter with table parsing and array handling. Convert TOML files to JSON instantly.",
    url: "https://jsonswiss.com/converter/toml-to-json",
    images: [
      {
        url: "https://jsonswiss.com/og-toml-to-json.png",
        width: 1200,
        height: 630,
        alt: "TOML to JSON Converter - Convert TOML configuration files to JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOML to JSON Converter",
    description: "Convert TOML configuration files to JSON format with table and array parsing.",
    images: ["https://jsonswiss.com/twitter-toml-to-json.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/converter/toml-to-json",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
