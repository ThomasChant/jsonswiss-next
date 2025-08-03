import { CsvToJsonConverter } from "@/components/converters/CsvToJsonConverter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV to JSON Converter | Convert CSV Files to JSON Online - JSON Swiss",
  description: "Free online CSV to JSON converter. Convert CSV files and data to JSON format with custom delimiters, header options, and data type detection. Fast and accurate conversion.",
  keywords: [
    "csv to json",
    "csv to json converter",
    "convert csv to json",
    "csv json converter",
    "csv file to json",
    "csv data conversion",
    "online csv converter",
    "csv parser",
    "csv transformation",
    "data format converter",
    "spreadsheet to json",
    "tabular data converter"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/converter/csv-to-json",
  },
};

const faqItems = [
  {
    question: "What CSV formats are supported?",
    answer: "This tool supports standard CSV files with customizable delimiters including comma, semicolon, pipe, and tab. You can also specify if the first row contains headers."
  },
  {
    question: "How does the header detection work?",
    answer: "When 'First row contains headers' is enabled, the first row values become JSON object keys. When disabled, generic keys like 'column1', 'column2' are used."
  },
  {
    question: "Can I customize the conversion settings?",
    answer: "Yes! Click the Settings button to configure delimiter type, header detection, and whether to skip empty lines during conversion."
  },
  {
    question: "What happens with empty CSV rows?",
    answer: "Empty rows are skipped by default to produce cleaner JSON output. You can disable this in settings if you need to preserve empty entries."
  }
];

export default function CsvToJsonPage() {
  return (
    <CsvToJsonConverter faqItems={faqItems} />
  );
}