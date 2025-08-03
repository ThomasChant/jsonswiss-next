// 导航菜单数据 - 用于服务器端预渲染
export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  description?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

// Editor 下拉菜单
export const editorMenuItems: NavigationItem[] = [
  {
    title: "Format JSON",
    href: "/formatter",
    icon: "FileText",
    description: "Format and prettify JSON"
  },
  {
    title: "Validate JSON",
    href: "/validator",
    icon: "CheckCircle",
    description: "Validate JSON syntax and structure"
  },
  {
    title: "Repair JSON",
    href: "/repair",
    icon: "Wrench",
    description: "Fix broken JSON with AI"
  },
  {
    title: "Compare JSON",
    href: "/compare",
    icon: "GitCompare",
    description: "Compare two JSON files"
  }
];

// Converter 下拉菜单 - 两列布局
export const converterMenuSections: NavigationSection[] = [
  {
    title: "Convert To JSON",
    items: [
      {
        title: "CSV to JSON",
        href: "/converter/csv-to-json",
        icon: "FileSpreadsheet",
        description: "Convert CSV to JSON format"
      },
      {
        title: "XML to JSON",
        href: "/converter/xml-to-json",
        icon: "FileCode",
        description: "Convert XML to JSON format"
      },
      {
        title: "YAML to JSON",
        href: "/converter/yaml-to-json",
        icon: "FileOutput",
        description: "Convert YAML to JSON format"
      },
      {
        title: "Excel to JSON",
        href: "/converter/excel-to-json",
        icon: "FileSpreadsheet",
        description: "Convert Excel to JSON format"
      },
      {
        title: "Properties to JSON",
        href: "/converter/properties-to-json",
        icon: "FileText",
        description: "Convert Properties to JSON format"
      },
      {
        title: "TOML to JSON",
        href: "/converter/toml-to-json",
        icon: "FileCode",
        description: "Convert TOML to JSON format"
      },
      {
        title: "INI to JSON",
        href: "/converter/ini-to-json",
        icon: "FileText",
        description: "Convert INI to JSON format"
      },
      {
        title: "Dict to JSON",
        href: "/converter/dict-to-json",
        icon: "Database",
        description: "Convert Dictionary to JSON format"
      },
      {
        title: "SQL to JSON",
        href: "/converter/sql-to-json",
        icon: "Database",
        description: "Convert SQL to JSON format"
      },
      {
        title: "JAR to JSON",
        href: "/converter/jar-to-json",
        icon: "FileArchive",
        description: "Convert JAR to JSON format"
      }
    ]
  },
  {
    title: "Convert From JSON",
    items: [
      {
        title: "JSON to CSV",
        href: "/converter/json-to-csv",
        icon: "FileSpreadsheet",
        description: "Convert JSON to CSV format"
      },
      {
        title: "JSON to XML",
        href: "/converter/json-to-xml",
        icon: "FileCode",
        description: "Convert JSON to XML format"
      },
      {
        title: "JSON to YAML",
        href: "/converter/json-to-yaml",
        icon: "FileOutput",
        description: "Convert JSON to YAML format"
      },
      {
        title: "JSON to Excel",
        href: "/converter/json-to-excel",
        icon: "FileSpreadsheet",
        description: "Convert JSON to Excel format"
      },
      {
        title: "JSON to Properties",
        href: "/converter/json-to-properties",
        icon: "FileText",
        description: "Convert JSON to Properties format"
      },
      {
        title: "JSON to TOML",
        href: "/converter/json-to-toml",
        icon: "FileCode",
        description: "Convert JSON to TOML format"
      },
      {
        title: "JSON to INI",
        href: "/converter/json-to-ini",
        icon: "FileText",
        description: "Convert JSON to INI format"
      },
      {
        title: "JSON to Dict",
        href: "/converter/json-to-dict",
        icon: "Database",
        description: "Convert JSON to Dictionary format"
      },
      {
        title: "JSON to SQL",
        href: "/converter/json-to-sql",
        icon: "Database",
        description: "Convert JSON to SQL format"
      }
    ]
  }
];

// 保持向后兼容性的导出
export const toJsonMenuItems: NavigationItem[] = converterMenuSections[0].items;
export const fromJsonMenuItems: NavigationItem[] = converterMenuSections[1].items;

// Code Generator 下拉菜单
export const generatorMenuSections: NavigationSection[] = [
  
  {
    title: "Backend",
    items: [
      {
        title: "Python",
        href: "/generator/python",
        icon: "FileCode",
        description: "Generate Python classes"
      },
      {
        title: "Java",
        href: "/generator/java",
        icon: "Coffee",
        description: "Generate Java POJOs"
      },
      {
        title: "C#",
        href: "/generator/csharp",
        icon: "Hash",
        description: "Generate C# classes"
      },
      {
        title: "Go",
        href: "/generator/go",
        icon: "Code2",
        description: "Generate Go structs"
      },
      {
        title: "Rust",
        href: "/generator/rust",
        icon: "Wrench",
        description: "Generate Rust structs"
      }
    ]
  },
  {
    title: "Others",
    items: [
      {
        title: "Swift",
        href: "/generator/swift",
        icon: "Smartphone",
        description: "Generate Swift structs"
      },
      {
        title: "Kotlin",
        href: "/generator/kotlin",
        icon: "Layers",
        description: "Generate Kotlin data classes"
      },
      {
        title: "Dart",
        href: "/generator/dart",
        icon: "Zap",
        description: "Generate Dart classes"
      },
      {
        title: "Ruby",
        href: "/generator/ruby",
        icon: "Gem",
        description: "Generate Ruby classes"
      }
    ]
  },
  {
    title: "Web",
    items: [
      {
        title: "JavaScript",
        href: "/generator/javascript",
        icon: "Code2",
        description: "Generate JavaScript objects"
      },
      {
        title: "TypeScript",
        href: "/generator/typescript",
        icon: "Braces",
        description: "Generate TypeScript interfaces"
      },
      {
        title: "PHP",
        href: "/generator/php",
        icon: "Code",
        description: "Generate PHP classes"
      }
    ]
  }
];

// Schema 下拉菜单
export const schemaMenuItems: NavigationItem[] = [
  {
    title: "Schema Generator",
    href: "/schema/generator",
    icon: "FileJson2",
    description: "Generate JSON Schema from JSON"
  },
  {
    title: "Schema Validator",
    href: "/schema/validator",
    icon: "CheckCircle",
    description: "Validate JSON against schema"
  },
  {
    title: "Mock Generator",
    href: "/schema/mock-generator",
    icon: "Zap",
    description: "Generate mock data from schema"
  },
  {
    title: "Schema Library",
    href: "/schema/library",
    icon: "List",
    description: "Common schema templates"
  }
];