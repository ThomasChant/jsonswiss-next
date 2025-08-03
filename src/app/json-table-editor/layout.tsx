import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Table Editor | Edit JSON as Table View Online - JSON Swiss",
  description: "Interactive JSON table editor with spreadsheet-like interface. Edit JSON data in table format, add/remove rows and columns, and export to various formats.",
  keywords: [
    "json table editor",
    "json table view",
    "json spreadsheet editor",
    "edit json as table",
    "json grid editor",
    "json tabular editor",
    "json data editor",
    "json table interface",
    "interactive json editor",
    "json visual editor",
    "json row column editor",
    "online json table"
  ],
  openGraph: {
    title: "JSON Table Editor - Edit JSON in Spreadsheet Format",
    description: "Interactive JSON table editor with spreadsheet interface. Edit JSON data visually with add/remove rows and columns functionality.",
    url: "https://jsonswiss.com/json-table-editor",
    images: [
      {
        url: "https://jsonswiss.com/og-table-editor.png",
        width: 1200,
        height: 630,
        alt: "JSON Table Editor - Edit JSON data in table format",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Table Editor",
    description: "Edit JSON data in spreadsheet format with interactive table interface.",
    images: ["https://jsonswiss.com/twitter-table-editor.png"],
  },
  alternates: {
    canonical: "https://jsonswiss.com/json-table-editor",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
