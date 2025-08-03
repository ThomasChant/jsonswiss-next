
"use client";

import Link from "next/link";
import { 
  FileJson2, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Shield
} from "lucide-react";
import { ToolPageLayoutServer } from "@/components/layout/ToolPageLayoutServer";

export default function SchemaPage() {
  const faqItems = [
    {
      question: "What is a JSON Schema?",
      answer: "JSON Schema is a vocabulary that allows you to annotate and validate JSON documents. It provides a contract for what JSON data is required for a given application and how to interact with it."
    },
    {
      question: "When should I generate a schema vs validate against one?",
      answer: "Generate a schema when you want to create validation rules from existing JSON data. Use validation when you have an existing schema and want to check if your JSON data conforms to it."
    },
    {
      question: "What's the difference between the generator and validator?",
      answer: "The Schema Generator creates a new JSON schema from your data, while the Schema Validator checks if your JSON data follows an existing schema's rules and constraints."
    },
    {
      question: "Can I use schemas from other tools?",
      answer: "Yes! Both tools support standard JSON Schema formats (Draft 4, 6, 7, and 2019-09), so you can import schemas from other applications or export them for use elsewhere."
    }
  ];

  return (
    <ToolPageLayoutServer 
      title="JSON Schema Tools" 
      description="Generate schemas from JSON data or validate JSON against existing schemas"
      faqItems={faqItems}
      showSidebar={false}
    >
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <FileJson2 className="w-16 h-16 mx-auto mb-4 text-blue-500 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              JSON Schema Tools
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Choose the tool that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Schema Generator Card */}
            <Link href="/schema/generator" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 h-full hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 dark:bg-blue-600 rounded-lg p-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Schema Generator
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Automatically generate JSON schemas from your existing JSON data. Perfect for creating validation rules and documentation from sample data.
                </p>
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Auto-detect data types and structures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Generate validation constraints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Export standard JSON Schema format</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Schema Validator Card */}
            <Link href="/schema/validator" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 h-full hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500 dark:bg-purple-600 rounded-lg p-3">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-500 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Schema Validator
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Validate your JSON data against existing schemas. Ensure data integrity and catch validation errors before they cause issues.
                </p>
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Comprehensive validation reporting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Detailed error descriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Support for all schema versions</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Both tools support JSON Schema Draft 4, 6, 7, and 2019-09 specifications
            </p>
          </div>
        </div>
      </div>
    </ToolPageLayoutServer>
  );
}