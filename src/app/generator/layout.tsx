import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Generator Tools",
  description: "Generate code in multiple programming languages from JSON data. Support for JavaScript, TypeScript, Python, Java, and more.",
};

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}