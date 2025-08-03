"use client";

import Link from "next/link";
import { 
  FileJson, 
  Code, 
  CheckCircle, 
  ArrowRightLeft,
  RepeatIcon,
  Grid,
  Settings,
  FileText,
  Zap,
  RefreshCw,
  ChevronRight,
  Wrench,
  Database,
  FileCode,
  ShieldCheck,
  FileSearch,
  GitCompareArrows,
  WrenchIcon,
  FileSpreadsheet,
  FileBarChart,
  FileCode2,
  Braces,
  Table,
  FileImage,
  Cpu,
  Box,
  Binary,
  Hash,
  Coffee,
  Chrome,
  Globe,
  Flame,
  Terminal,
  Circle,
  Diamond,
  Gem,
  Zap as Lightning,
  ArrowRight,
  FileArchive
} from "lucide-react";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  href: string;
  category: "core" | "converter" | "generator";
  badge?: string;
}

const coreFeatures: FeatureCard[] = [
  {
    id: "table-editor",
    title: "Table Editor",
    description: "Visual table interface with real-time JSON data editing",
    icon: Table,
    color: "blue",
    href: "/json-table-editor",
    category: "core",
    badge: "Popular"
  },
  {
    id: "formatter", 
    title: "JSON Formatter",
    description: "Beautify and minify JSON with custom indentation",
    icon: Braces,
    color: "green", 
    href: "/formatter",
    category: "core"
  },
  {
    id: "validator",
    title: "JSON Validator",
    description: "Validate JSON syntax with detailed error messages",
    icon: ShieldCheck,
    color: "purple",
    href: "/validator", 
    category: "core"
  },
  {
    id: "schema",
    title: "Schema Generator",
    description: "Generate and validate JSON Schema specifications",
    icon: FileSearch,
    color: "orange",
    href: "/schema",
    category: "core"
  },
  {
    id: "compare",
    title: "JSON Compare",
    description: "Compare two JSON files with highlighted differences",
    icon: GitCompareArrows,
    color: "cyan",
    href: "/compare",
    category: "core"
  },
  {
    id: "repair",
    title: "JSON Repair",
    description: "Automatically fix malformed JSON data",
    icon: WrenchIcon,
    color: "red",
    href: "/repair",
    category: "core"
  }
];

const converterFeatures: Array<{
  name: string;
  from: string;
  to: string | null;
  icon: React.ComponentType<any>;
  color: string;
}> = [
  { name: "CSV", from: "csv-to-json", to: "json-to-csv", icon: FileSpreadsheet, color: "emerald" },
  { name: "XML", from: "xml-to-json", to: "json-to-xml", icon: FileCode2, color: "orange" },
  { name: "YAML", from: "yaml-to-json", to: "json-to-yaml", icon: FileText, color: "blue" },
  { name: "Excel", from: "excel-to-json", to: "json-to-excel", icon: FileBarChart, color: "green" },
  { name: "TOML", from: "toml-to-json", to: "json-to-toml", icon: Settings, color: "purple" },
  { name: "INI", from: "ini-to-json", to: "json-to-ini", icon: FileImage, color: "indigo" },
  { name: "Properties", from: "properties-to-json", to: "json-to-properties", icon: Hash, color: "cyan" },
  { name: "SQL", from: "sql-to-json", to: "json-to-sql", icon: Database, color: "blue" },
  { name: "Dict", from: "dict-to-json", to: "json-to-dict", icon: Braces, color: "amber" },
  { name: "JAR", from: "jar-to-json", to: null, icon: FileArchive, color: "red" }
];

const generatorLanguages = [
  { name: "JavaScript", icon: Globe, color: "yellow" },
  { name: "TypeScript", icon: FileCode, color: "blue" },
  { name: "Python", icon: Cpu, color: "green" },
  { name: "Java", icon: Coffee, color: "orange" },
  { name: "C#", icon: Hash, color: "purple" },
  { name: "Go", icon: Box, color: "cyan" },
  { name: "Rust", icon: Flame, color: "orange" },
  { name: "PHP", icon: Code, color: "indigo" },
  { name: "Ruby", icon: Gem, color: "red" },
  { name: "Scala", icon: Diamond, color: "red" },
  { name: "Groovy", icon: Coffee, color: "blue" },
  { name: "Swift", icon: Lightning, color: "orange" },
  { name: "SQL", icon: Database, color: "blue" }
];

export function FeatureCards() {
  return (
    <div className="space-y-12">
      {/* Core Features Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Core Features
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Powerful JSON processing and analysis tools
            </p>
          </div>
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <Wrench className="w-5 h-5 mr-2" />
            <span className="text-sm">{coreFeatures.length} tools</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className="group relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600"
              >
                {feature.badge && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {feature.badge}
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20`}>
                    <IconComponent className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Format Converters Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Format Converters
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Bidirectional conversion between JSON and various data formats
            </p>
          </div>
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <RepeatIcon className="w-5 h-5 mr-2" />
            <span className="text-sm">{converterFeatures.length * 2} converters</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {converterFeatures.map((converter) => {
            const IconComponent = converter.icon;
            return (
              <div
                key={converter.name}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      converter.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                      converter.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                      converter.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      converter.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                      converter.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                      converter.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/20' :
                      converter.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/20' :
                      converter.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/20' :
                      'bg-slate-100 dark:bg-slate-900/20'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        converter.color === 'emerald' ? 'text-emerald-600' :
                        converter.color === 'orange' ? 'text-orange-600' :
                        converter.color === 'blue' ? 'text-blue-600' :
                        converter.color === 'green' ? 'text-green-600' :
                        converter.color === 'purple' ? 'text-purple-600' :
                        converter.color === 'indigo' ? 'text-indigo-600' :
                        converter.color === 'cyan' ? 'text-cyan-600' :
                        converter.color === 'amber' ? 'text-amber-600' :
                        'text-slate-600'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {converter.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">JSON</span>
                  </div>
                </div>
                
                {converter.to ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/converter/${converter.from}`}
                      className={`text-center py-2 px-3 bg-slate-50 dark:bg-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors ${
                        converter.color === 'emerald' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400' :
                        converter.color === 'orange' ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400' :
                        converter.color === 'blue' ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400' :
                        converter.color === 'green' ? 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400' :
                        converter.color === 'purple' ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400' :
                        converter.color === 'indigo' ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400' :
                        converter.color === 'cyan' ? 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400' :
                        converter.color === 'amber' ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400' :
                        converter.color === 'red' ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400' :
                        'hover:bg-slate-50 dark:hover:bg-slate-900/20 hover:text-slate-600 dark:hover:text-slate-400'
                      }`}
                    >
                      {converter.name} → JSON
                    </Link>
                    <Link
                      href={`/converter/${converter.to}`}
                      className={`text-center py-2 px-3 bg-slate-50 dark:bg-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors ${
                        converter.color === 'emerald' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400' :
                        converter.color === 'orange' ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400' :
                        converter.color === 'blue' ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400' :
                        converter.color === 'green' ? 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400' :
                        converter.color === 'purple' ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400' :
                        converter.color === 'indigo' ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400' :
                        converter.color === 'cyan' ? 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400' :
                        converter.color === 'amber' ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400' :
                        converter.color === 'red' ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400' :
                        'hover:bg-slate-50 dark:hover:bg-slate-900/20 hover:text-slate-600 dark:hover:text-slate-400'
                      }`}
                    >
                      JSON → {converter.name}
                    </Link>
                  </div>
                ) : (
                  // Single direction converter (like JAR to JSON)
                  <div className="grid grid-cols-1">
                    <Link
                      href={`/converter/${converter.from}`}
                      className={`text-center py-2 px-3 bg-slate-50 dark:bg-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors ${
                        converter.color === 'red' ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400' :
                        'hover:bg-slate-50 dark:hover:bg-slate-900/20 hover:text-slate-600 dark:hover:text-slate-400'
                      }`}
                    >
                      {converter.name} → JSON
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Code Generators Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Code Generators
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Generate data structures from JSON in multiple programming languages
            </p>
          </div>
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <FileCode className="w-5 h-5 mr-2" />
            <span className="text-sm">{generatorLanguages.length} languages</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {generatorLanguages.map((language) => {
            const IconComponent = language.icon;
            const href = `/generator/${language.name.toLowerCase().replace('#', 'sharp')}`;
            return (
              <Link
                key={language.name}
                href={href}
                className={`group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center hover:shadow-md transition-all duration-200 ${
                  language.color === 'yellow' ? 'hover:border-yellow-300 dark:hover:border-yellow-600' :
                  language.color === 'blue' ? 'hover:border-blue-300 dark:hover:border-blue-600' :
                  language.color === 'green' ? 'hover:border-green-300 dark:hover:border-green-600' :
                  language.color === 'orange' ? 'hover:border-orange-300 dark:hover:border-orange-600' :
                  language.color === 'purple' ? 'hover:border-purple-300 dark:hover:border-purple-600' :
                  language.color === 'cyan' ? 'hover:border-cyan-300 dark:hover:border-cyan-600' :
                  language.color === 'indigo' ? 'hover:border-indigo-300 dark:hover:border-indigo-600' :
                  language.color === 'red' ? 'hover:border-red-300 dark:hover:border-red-600' :
                  'hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  language.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  language.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  language.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                  language.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                  language.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                  language.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/20' :
                  language.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/20' :
                  language.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                  'bg-slate-100 dark:bg-slate-900/20'
                }`}>
                  <IconComponent className={`w-4 h-4 ${
                    language.color === 'yellow' ? 'text-yellow-600' :
                    language.color === 'blue' ? 'text-blue-600' :
                    language.color === 'green' ? 'text-green-600' :
                    language.color === 'orange' ? 'text-orange-600' :
                    language.color === 'purple' ? 'text-purple-600' :
                    language.color === 'cyan' ? 'text-cyan-600' :
                    language.color === 'indigo' ? 'text-indigo-600' :
                    language.color === 'red' ? 'text-red-600' :
                    'text-slate-600'
                  }`} />
                </div>
                <h3 className={`font-medium text-slate-900 dark:text-slate-100 text-sm transition-colors ${
                  language.color === 'yellow' ? 'group-hover:text-yellow-600' :
                  language.color === 'blue' ? 'group-hover:text-blue-600' :
                  language.color === 'green' ? 'group-hover:text-green-600' :
                  language.color === 'orange' ? 'group-hover:text-orange-600' :
                  language.color === 'purple' ? 'group-hover:text-purple-600' :
                  language.color === 'cyan' ? 'group-hover:text-cyan-600' :
                  language.color === 'indigo' ? 'group-hover:text-indigo-600' :
                  language.color === 'red' ? 'group-hover:text-red-600' :
                  'group-hover:text-slate-600'
                }`}>
                  {language.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-slate-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {coreFeatures.length}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">Core Tools</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <RepeatIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {converterFeatures.length * 2}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">Format Converters</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-3">
              <FileCode className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {generatorLanguages.length}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">Languages</div>
          </div>
        </div>
      </section>
    </div>
  );
}