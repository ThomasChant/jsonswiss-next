import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Converter Tools",
  description: "Convert JSON to various formats and vice versa. Support for CSV, XML, YAML, INI, TOML, Python Dict, SQL, Excel and more.",
};

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}