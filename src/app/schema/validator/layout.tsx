import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'JSON Schema Validator - JSONSwiss',
  description: 'Validate your JSON data against JSON schemas. Ensure data integrity and catch validation errors with comprehensive validation reporting.',
  keywords: [
    'JSON schema validator',
    'validate JSON schema',
    'JSON validation',
    'schema validation',
    'JSON schema compliance',
    'JSON data validation',
    'schema checker',
    'JSON validator tool',
    'schema verification',
    'JSON integrity check'
  ],
  alternates: {
    canonical: 'https://jsonswiss.com/schema/validator'}};

export default function Layout({
  children}: {
  children: React.ReactNode;
}) {
  return children;
}
