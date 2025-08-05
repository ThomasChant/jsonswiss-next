import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JAR to JSON File Converter – Analyze & Export JAR Structure as JSON - JSON Swiss",
  description: "Analyze JAR file structure and convert to JSON format. Extract class information, dependencies, manifest data, and resources from JAR, WAR, and EAR files for analysis and visualization.",
  keywords: "JAR to JSON, Java archive analysis, JAR file structure, decompile JAR, Java class analysis, dependency analysis, JAR metadata, JSON converter",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
