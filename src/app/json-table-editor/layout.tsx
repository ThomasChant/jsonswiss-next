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
