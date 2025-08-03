import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'JSON Schema Generator - JSONSwiss',
  description: 'Generate JSON schemas from your JSON data automatically. Create validation rules and documentation from sample data with our intelligent schema generator.',
  keywords: [
    'JSON schema generator',
    'generate JSON schema',
    'JSON validation',
    'schema from JSON',
    'JSON schema creation',
    'JSON schema builder',
    'automatic schema generation',
    'JSON schema draft',
    'schema inference',
    'JSON structure analysis'
  ],
  alternates: {
    canonical: 'https://jsonswiss.com/schema/generator'}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
