"use client";

import {
  Box,
  Braces,
  Code,
  Coffee,
  Cpu,
  Database,
  Diamond,
  FileArchive,
  FileBarChart,
  FileCode,
  FileCode2,
  FileImage,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Flame,
  Gem,
  GitCompareArrows,
  Globe,
  Hash,
  Zap as Lightning,
  Settings,
  ShieldCheck,
  Table,
  WrenchIcon
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  href: string;
  category: "core" | "converter" | "generator" | "schema";
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

const schemaFeatures: FeatureCard[] = [
  {
    id: "schema-generator",
    title: "JSON Schema Generator",
    description: "Generate JSON Schema from sample JSON data",
    icon: FileSearch,
    color: "blue",
    href: "/schema-generator",
    category: "schema",
    badge: "New"
  },
  {
    id: "schema-validator",
    title: "Schema Validator",
    description: "Validate JSON data against JSON Schema",
    icon: ShieldCheck,
    color: "green",
    href: "/schema-validator",
    category: "schema"
  },
  {
    id: "schema-editor",
    title: "Schema Editor",
    description: "Visual JSON Schema editor with live preview",
    icon: Braces,
    color: "purple",
    href: "/schema-editor",
    category: "schema"
  },
  {
    id: "schema-faker",
    title: "Schema Faker",
    description: "Generate fake data from JSON Schema",
    icon: WrenchIcon,
    color: "orange",
    href: "/schema-faker",
    category: "schema"
  }
];

export function FeatureCards() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const allTools: FeatureCard[] = [
    ...coreFeatures,
    ...schemaFeatures,
    ...converterFeatures.flatMap(converter => [
      {
        id: converter.from,
        title: `${converter.name} to JSON`,
        description: `Convert ${converter.name} files into JSON format`,
        icon: converter.icon,
        color: converter.color,
        href: `/converter/${converter.from}`,
        category: 'converter' as const
      },
      ...(converter.to ? [{
        id: converter.to,
        title: `JSON to ${converter.name}`,
        description: `Convert JSON into ${converter.name} format`,
        icon: converter.icon,
        color: converter.color,
        href: `/converter/${converter.to}`,
        category: 'converter' as const
      }] : [])
    ]),
    ...generatorLanguages.map(lang => ({
      id: `generator-${lang.name.toLowerCase()}`,
      title: `${lang.name} Generator`,
      description: `Generate ${lang.name} data structures from JSON`,
      icon: lang.icon,
      color: lang.color,
      href: `/generator/${lang.name.toLowerCase().replace('#', 'sharp')}`,
      category: 'generator' as const
    }))
  ];
  
  const filteredTools = activeCategory === 'all' ? allTools : allTools.filter(tool => tool.category === activeCategory);
  
  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { id: 'all', label: 'All', count: allTools.length },
          { id: 'core', label: 'Core Tools', count: coreFeatures.length },
          { id: 'schema', label: 'JSON Schema', count: schemaFeatures.length },
          { id: 'converter', label: 'Converters', count: converterFeatures.length * 2 },
          { id: 'generator', label: 'Generators', count: generatorLanguages.length }
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === category.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      {/* Tools Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3">
        {filteredTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-lg transition-all duration-200 hover:border-blue-300"
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                tool.color === 'blue' ? 'bg-blue-100' :
                tool.color === 'green' ? 'bg-green-100' :
                tool.color === 'purple' ? 'bg-purple-100' :
                tool.color === 'orange' ? 'bg-orange-100' :
                tool.color === 'cyan' ? 'bg-cyan-100' :
                tool.color === 'red' ? 'bg-red-100' :
                tool.color === 'emerald' ? 'bg-emerald-100' :
                tool.color === 'indigo' ? 'bg-indigo-100' :
                tool.color === 'amber' ? 'bg-amber-100' :
                tool.color === 'yellow' ? 'bg-yellow-100' :
                'bg-gray-100'
              }`}>
                <IconComponent className={`w-8 h-8 ${
                  tool.color === 'blue' ? 'text-blue-600' :
                  tool.color === 'green' ? 'text-green-600' :
                  tool.color === 'purple' ? 'text-purple-600' :
                  tool.color === 'orange' ? 'text-orange-600' :
                  tool.color === 'cyan' ? 'text-cyan-600' :
                  tool.color === 'red' ? 'text-red-600' :
                  tool.color === 'emerald' ? 'text-emerald-600' :
                  tool.color === 'indigo' ? 'text-indigo-600' :
                  tool.color === 'amber' ? 'text-amber-600' :
                  tool.color === 'yellow' ? 'text-yellow-600' :
                  'text-gray-600'
                }`} />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm">
                {tool.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {tool.description}
              </p>
              
              {tool.badge && (
                <div className="mt-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {tool.badge}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Quick Stats */}
      {/* <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {coreFeatures.length}
            </div>
            <div className="text-gray-600 text-sm">Core Tools</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <RepeatIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {converterFeatures.length * 2}
            </div>
            <div className="text-gray-600 text-sm">Format Converters</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-3">
              <FileCode className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {generatorLanguages.length}
            </div>
            <div className="text-gray-600 text-sm">Languages</div>
          </div>
        </div>
      </section> */}
    </div>
  );
}