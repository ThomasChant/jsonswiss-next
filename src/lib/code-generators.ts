export interface CodeGenOptions {
  useInterfaces: boolean;
  useOptional: boolean;
  rootName: string;
  exportType: 'export' | 'declare' | 'none';
  nullHandling: 'optional' | 'union' | 'ignore';
  sqlDialect?: 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver';
  tableName?: string;
  packageName?: string;
  namespace?: string;
  framework?: string;
  generateConstraints?: boolean;
}

// 默认缩进大小
const DEFAULT_INDENT_SIZE = 2;

export class JavaScriptGenerator {
  generate(data: any, options: CodeGenOptions): string {
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      let code = '';
      if (options.useInterfaces) {
        code += `class ${options.rootName} {\n  constructor() {\n    // 空对象，可以根据需要添加属性\n  }\n}\n\n`;
      }
      
      if (options.exportType === 'export') {
        code += `export const ${options.rootName} = {};`;
      } else {
        code += `const ${options.rootName} = {};`;
      }
      return code;
    }
    
    const indent = ' '.repeat(DEFAULT_INDENT_SIZE);
    let code = '';

    if (options.exportType === 'export') {
      code += `export const ${options.rootName} = `;
    } else if (options.exportType === 'declare') {
      code += `const ${options.rootName} = `;
    } else {
      code += `const ${options.rootName} = `;
    }

    code += this.generateValue(data, 0, options) + ';';

    if (options.useInterfaces) {
      const classDefinition = this.generateClass(data, options.rootName, options);
      code = classDefinition + '\n\n' + code;
    }

    return code;
  }

  private generateValue(value: any, depth: number, options: CodeGenOptions): string {
    const indent = ' '.repeat(DEFAULT_INDENT_SIZE * depth);
    const nextIndent = ' '.repeat(DEFAULT_INDENT_SIZE * (depth + 1));

    if (value === null) {
      return 'null';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
      
      const items = value.map(item => 
        nextIndent + this.generateValue(item, depth + 1, options)
      );
      
      return '[\n' + items.join(',\n') + '\n' + indent + ']';
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return '{}';
      }

      const props = entries.map(([key, val]) => {
        const quotedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
        return nextIndent + quotedKey + ': ' + this.generateValue(val, depth + 1, options);
      });

      return '{\n' + props.join(',\n') + '\n' + indent + '}';
    }

    if (typeof value === 'string') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private generateClass(data: any, className: string, options: CodeGenOptions): string {
    const properties = this.extractProperties(data);
    const indent = ' '.repeat(DEFAULT_INDENT_SIZE);
    
    let code = `class ${className} {\n`;
    
    // Constructor
    code += `${indent}constructor(data) {\n`;
    properties.forEach(prop => {
      code += `${indent}${indent}this.${prop.name} = data.${prop.name};\n`;
    });
    code += `${indent}}\n\n`;

    // Getters/Setters
    properties.forEach(prop => {
      code += `${indent}get ${prop.name}() {\n`;
      code += `${indent}${indent}return this._${prop.name};\n`;
      code += `${indent}}\n\n`;
      
      code += `${indent}set ${prop.name}(value) {\n`;
      code += `${indent}${indent}this._${prop.name} = value;\n`;
      code += `${indent}}\n\n`;
    });

    code += '}';
    
    if (options.exportType === 'export') {
      code = 'export ' + code;
    }

    return code;
  }

  private extractProperties(obj: any): Array<{name: string, type: string}> {
    const props: Array<{name: string, type: string}> = [];
    
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        props.push({
          name: key,
          type: this.getJSType(value)
        });
      }
    }
    
    return props;
  }

  private getJSType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'Array';
    return typeof value;
  }
}

export class TypeScriptGenerator {
  generate(data: any, options: CodeGenOptions): string {
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      let code = '';
      
      // 生成接口定义
      code += `interface ${options.rootName} {\n  // 空对象，可以根据需要添加属性\n}\n\n`;
      
      // 生成常量声明
      if (options.exportType === 'export') {
        code += `export const ${options.rootName.toLowerCase()}: ${options.rootName} = {};`;
      } else {
        code += `const ${options.rootName.toLowerCase()}: ${options.rootName} = {};`;
      }
      
      return code;
    }
    
    const interfaces = this.generateInterfaces(data, options.rootName, options);
    const constDeclaration = this.generateConstDeclaration(data, options);
    
    return interfaces + '\n\n' + constDeclaration;
  }

  private generateInterfaces(data: any, rootName: string, options: CodeGenOptions): string {
    const interfaces = new Set<string>();
    const processed = new Set<string>();
    
    this.collectInterfaces(data, rootName, interfaces, processed, options);
    
    return Array.from(interfaces).join('\n\n');
  }

  private collectInterfaces(
    data: any, 
    typeName: string, 
    interfaces: Set<string>, 
    processed: Set<string>,
    options: CodeGenOptions
  ): string {
    if (processed.has(typeName)) {
      return typeName;
    }
    
    processed.add(typeName);
    
    if (data === null) return 'null';
    if (Array.isArray(data)) {
      if (data.length === 0) return 'unknown[]';
      
      const itemType = this.collectInterfaces(
        data[0], 
        typeName.replace(/s$/, ''), 
        interfaces, 
        processed, 
        options
      );
      return `${itemType}[]`;
    }
    
    if (typeof data === 'object' && data !== null) {
      const indent = ' '.repeat(DEFAULT_INDENT_SIZE);
      let interfaceCode = '';
      
      if (options.exportType === 'export') {
        interfaceCode += 'export ';
      }
      
      interfaceCode += `interface ${typeName} {\n`;
      
      for (const [key, value] of Object.entries(data)) {
        const propType = this.collectInterfaces(
          value,
          this.capitalize(key),
          interfaces,
          processed,
          options
        );
        
        const optional = options.useOptional && (value === null || value === undefined) ? '?' : '';
        interfaceCode += `${indent}${key}${optional}: ${propType};\n`;
      }
      
      interfaceCode += '}';
      interfaces.add(interfaceCode);
      
      return typeName;
    }
    
    return this.getTSType(data);
  }

  private generateConstDeclaration(data: any, options: CodeGenOptions): string {
    const typeName = options.rootName;
    let code = '';
    
    if (options.exportType === 'export') {
      code += `export const ${options.rootName.toLowerCase()}: ${typeName} = `;
    } else if (options.exportType === 'declare') {
      code += `declare const ${options.rootName.toLowerCase()}: ${typeName};\n\n`;
      code += `const ${options.rootName.toLowerCase()}: ${typeName} = `;
    } else {
      code += `const ${options.rootName.toLowerCase()}: ${typeName} = `;
    }
    
    code += this.generateValue(data, 0, options) + ';';
    
    return code;
  }

  private generateValue(value: any, depth: number, options: CodeGenOptions): string {
    const indent = ' '.repeat(DEFAULT_INDENT_SIZE * depth);
    const nextIndent = ' '.repeat(DEFAULT_INDENT_SIZE * (depth + 1));

    if (value === null) {
      return 'null';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
      
      const items = value.map(item => 
        nextIndent + this.generateValue(item, depth + 1, options)
      );
      
      return '[\n' + items.join(',\n') + '\n' + indent + ']';
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return '{}';
      }

      const props = entries.map(([key, val]) => {
        return nextIndent + key + ': ' + this.generateValue(val, depth + 1, options);
      });

      return '{\n' + props.join(',\n') + '\n' + indent + '}';
    }

    if (typeof value === 'string') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private getTSType(value: any): string {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) return 'unknown[]';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export class PythonGenerator {
  generate(data: any, options: CodeGenOptions): string {
    let code = '';
    
    if (options.useInterfaces) {
      code += this.generateDataClass(data, options.rootName, options) + '\n\n';
    }
    
    code += `${options.rootName.toLowerCase()} = ${this.generateValue(data, 0, options)}`;
    
    return code;
  }

  private generateDataClass(data: any, className: string, options: CodeGenOptions): string {
    const indent = ' '.repeat(DEFAULT_INDENT_SIZE);
    let code = 'from dataclasses import dataclass\n';
    code += 'from typing import Optional, List, Dict, Any\n\n';
    
    code += '@dataclass\n';
    code += `class ${className}:\n`;
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        const pythonType = this.getPythonType(value, options);
        code += `${indent}${this.toPythonName(key)}: ${pythonType}\n`;
      }
    } else {
      code += `${indent}value: ${this.getPythonType(data, options)}\n`;
    }
    
    return code;
  }

  private generateValue(value: any, depth: number, options: CodeGenOptions): string {
    const indent = ' '.repeat(DEFAULT_INDENT_SIZE * depth);
    const nextIndent = ' '.repeat(DEFAULT_INDENT_SIZE * (depth + 1));

    if (value === null) {
      return 'None';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
      
      const items = value.map(item => 
        nextIndent + this.generateValue(item, depth + 1, options)
      );
      
      return '[\n' + items.join(',\n') + '\n' + indent + ']';
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return '{}';
      }

      const props = entries.map(([key, val]) => {
        return nextIndent + `"${key}": ` + this.generateValue(val, depth + 1, options);
      });

      return '{\n' + props.join(',\n') + '\n' + indent + '}';
    }

    if (typeof value === 'string') {
      return JSON.stringify(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }

    return String(value);
  }

  private getPythonType(value: any, options: CodeGenOptions): string {
    if (value === null) {
      return options.nullHandling === 'optional' ? 'Optional[Any]' : 'None';
    }
    
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'float';
    }
    if (typeof value === 'string') return 'str';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'List[Any]';
      const itemType = this.getPythonType(value[0], options);
      return `List[${itemType}]`;
    }
    if (typeof value === 'object') return 'Dict[str, Any]';
    return 'Any';
  }

  private toPythonName(name: string): string {
    // Convert camelCase to snake_case
    return name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
}

export class SQLGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const tableName = options.tableName || options.rootName.toLowerCase();
    const dialect = options.sqlDialect || 'mysql';
    
    let sql = '';
    
    if (Array.isArray(data) && data.length > 0) {
      sql += this.generateCreateTable(data[0], tableName, dialect, options);
      sql += '\n\n';
      sql += this.generateInserts(data, tableName, dialect);
    } else if (typeof data === 'object' && data !== null) {
      sql += this.generateCreateTable(data, tableName, dialect, options);
      sql += '\n\n';
      sql += this.generateInserts([data], tableName, dialect);
    }
    
    return sql;
  }

  private generateCreateTable(schema: any, tableName: string, dialect: string, options: CodeGenOptions): string {
    let sql = `CREATE TABLE ${tableName} (\n`;
    const columns = [];
    
    if (options.generateConstraints && dialect !== 'sqlite') {
      columns.push('  id INT PRIMARY KEY AUTO_INCREMENT');
    }
    
    for (const [key, value] of Object.entries(schema)) {
      const columnType = this.getSQLType(value, dialect);
      const nullable = value === null ? '' : ' NOT NULL';
      columns.push(`  ${key} ${columnType}${nullable}`);
    }
    
    sql += columns.join(',\n');
    sql += '\n);';
    
    return sql;
  }

  private generateInserts(data: any[], tableName: string, dialect: string): string {
    const inserts = data.map(row => {
      const keys = Object.keys(row);
      const values = keys.map(key => this.formatSQLValue(row[key], dialect));
      return `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${values.join(', ')});`;
    });
    
    return inserts.join('\n');
  }

  private getSQLType(value: any, dialect: string): string {
    if (value === null) return 'TEXT';
    
    if (typeof value === 'boolean') {
      return dialect === 'mysql' ? 'BOOLEAN' : dialect === 'postgresql' ? 'BOOLEAN' : 'INTEGER';
    }
    
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'INTEGER' : 'DECIMAL(10,2)';
    }
    
    if (typeof value === 'string') {
      return value.length > 255 ? 'TEXT' : 'VARCHAR(255)';
    }
    
    if (Array.isArray(value) || typeof value === 'object') {
      return dialect === 'postgresql' ? 'JSON' : 'TEXT';
    }
    
    return 'TEXT';
  }

  private formatSQLValue(value: any, dialect: string): string {
    if (value === null) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
}

export class PHPGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const className = options.rootName;
    const namespace = options.namespace || '';
    const framework = options.framework || 'plain';
    
    let code = '<?php\n\n';
    
    if (namespace) {
      code += `namespace ${namespace};\n\n`;
    }
    
    if (framework === 'laravel') {
      code += "use Illuminate\\Database\\Eloquent\\Model;\n\n";
    }
    
    code += `class ${className}`;
    
    if (framework === 'laravel') {
      code += ' extends Model';
    }
    
    code += '\n{\n';
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      code += '    // 空类，可以根据需要添加属性\n';
      code += '}';
      return code;
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      // Properties
      for (const [key, value] of Object.entries(data)) {
        const type = this.getPHPType(value);
        code += `    private ${type}$${key};\n`;
      }
      
      code += '\n';
      
      // Constructor
      code += '    public function __construct(array $data = [])\n    {\n';
      for (const key of Object.keys(data)) {
        code += `        $this->${key} = $data['${key}'] ?? null;\n`;
      }
      code += '    }\n\n';
      
      // Getters and Setters
      for (const [key, value] of Object.entries(data)) {
        const type = this.getPHPType(value);
        const capitalizedKey = this.capitalize(key);
        
        // Getter
        code += `    public function get${capitalizedKey}(): ${type}\n    {\n`;
        code += `        return $this->${key};\n    }\n\n`;
        
        // Setter
        code += `    public function set${capitalizedKey}(${type}$${key}): void\n    {\n`;
        code += `        $this->${key} = $${key};\n    }\n\n`;
      }
    }
    
    code += '}';
    
    return code;
  }

  private getPHPType(value: any): string {
    if (value === null) return '';
    if (typeof value === 'boolean') return 'bool ';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int ' : 'float ';
    if (typeof value === 'string') return 'string ';
    if (Array.isArray(value)) return 'array ';
    if (typeof value === 'object') return 'array ';
    return '';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export class GoGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const packageName = options.packageName || 'main';
    const structName = options.rootName;
    
    let code = `package ${packageName}\n\n`;
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      code += `type ${structName} struct {\n`;
      code += '\t// 空结构体，可以根据需要添加字段\n';
      code += '}';
      return code;
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      code += `type ${structName} struct {\n`;
      
      for (const [key, value] of Object.entries(data)) {
        const goType = this.getGoType(value);
        const fieldName = this.toGoFieldName(key);
        const jsonTag = options.framework?.includes('json') !== false ? ` \`json:"${key}"\`` : '';
        code += `\t${fieldName} ${goType}${jsonTag}\n`;
      }
      
      code += '}';
    }
    
    return code;
  }

  private getGoType(value: any): string {
    if (value === null) return '*interface{}';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'float64';
    }
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]interface{}';
      const itemType = this.getGoType(value[0]);
      return `[]${itemType}`;
    }
    if (typeof value === 'object') return 'map[string]interface{}';
    return 'interface{}';
  }

  private toGoFieldName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}

export class JavaGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const className = options.rootName;
    const packageName = options.packageName || 'com.example';
    const framework = options.framework || 'plain';
    
    let code = `package ${packageName};\n\n`;
    
    if (framework === 'jackson') {
      code += 'import com.fasterxml.jackson.annotation.*;\n\n';
    } else if (framework === 'lombok') {
      code += 'import lombok.*;\n\n';
    }
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      if (framework === 'lombok') {
        code += '@Data\n@AllArgsConstructor\n@NoArgsConstructor\n';
      }
      
      code += `public class ${className} {\n`;
      code += '    // 空类，可以根据需要添加字段\n';
      
      if (framework !== 'lombok') {
        code += `    public ${className}() {}\n`;
      }
      
      code += '}';
      return code;
    }
    
    if (framework === 'lombok') {
      code += '@Data\n@AllArgsConstructor\n@NoArgsConstructor\n';
    }
    
    code += `public class ${className} {\n`;
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      // Fields
      for (const [key, value] of Object.entries(data)) {
        const javaType = this.getJavaType(value);
        const annotation = framework === 'jackson' ? `    @JsonProperty("${key}")\n` : '';
        code += `${annotation}    private ${javaType} ${key};\n\n`;
      }
      
      if (framework !== 'lombok') {
        // Constructors
        code += `    public ${className}() {}\n\n`;
        
        const params = Object.entries(data).map(([key, value]) => 
          `${this.getJavaType(value)} ${key}`
        ).join(', ');
        
        code += `    public ${className}(${params}) {\n`;
        for (const key of Object.keys(data)) {
          code += `        this.${key} = ${key};\n`;
        }
        code += '    }\n\n';
        
        // Getters and Setters
        for (const [key, value] of Object.entries(data)) {
          const javaType = this.getJavaType(value);
          const capitalizedKey = this.capitalize(key);
          
          code += `    public ${javaType} get${capitalizedKey}() {\n`;
          code += `        return ${key};\n    }\n\n`;
          
          code += `    public void set${capitalizedKey}(${javaType} ${key}) {\n`;
          code += `        this.${key} = ${key};\n    }\n\n`;
        }
      }
    }
    
    code += '}';
    
    return code;
  }

  private getJavaType(value: any): string {
    if (value === null) return 'Object';
    if (typeof value === 'boolean') return 'Boolean';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'Integer' : 'Double';
    }
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) return 'List<Object>';
    if (typeof value === 'object') return 'Map<String, Object>';
    return 'Object';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export class CSharpGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const className = options.rootName;
    const namespace = options.namespace || 'MyApp';
    const framework = options.framework || 'plain';
    
    let code = `using System;\nusing System.Collections.Generic;\n`;
    
    if (framework === 'newtonsoft') {
      code += 'using Newtonsoft.Json;\n';
    } else if (framework === 'system.text.json') {
      code += 'using System.Text.Json.Serialization;\n';
    }
    
    code += `\nnamespace ${namespace}\n{\n`;
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      if (framework === 'record') {
        code += `    public record ${className}();`;
      } else {
        code += `    public class ${className}\n    {\n`;
        code += '        // 空类，可以根据需要添加属性\n';
        code += '    }';
      }
      code += '\n}';
      return code;
    }
    
    if (framework === 'record') {
      code += `    public record ${className}(\n`;
      
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        const properties = Object.entries(data).map(([key, value]) => {
          const csType = this.getCSharpType(value);
          // Records don't typically use JSON attributes in the constructor
          return `        ${csType} ${this.capitalize(key)}`;
        });
        
        code += properties.join(',\n') + '\n';
      }
      
      code += '    );';
    } else {
      code += `    public class ${className}\n    {\n`;
      
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        for (const [key, value] of Object.entries(data)) {
          const csType = this.getCSharpType(value);
          const propName = this.capitalize(key);
          const jsonAttr = framework === 'newtonsoft' ? `        [JsonProperty("${key}")]\n` : 
                          framework === 'system.text.json' ? `        [JsonPropertyName("${key}")]\n` : '';
          
          code += `${jsonAttr}        public ${csType} ${propName} { get; set; }\n\n`;
        }
      }
      
      code += '    }';
    }
    
    code += '\n}';
    
    return code;
  }

  private getCSharpType(value: any): string {
    if (value === null) return 'object?';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'double';
    }
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) return 'List<object>';
    if (typeof value === 'object') return 'Dictionary<string, object>';
    return 'object';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export class ScalaGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const className = options.rootName;
    const packageName = options.packageName || 'com.example';
    const framework = options.framework || 'plain';
    
    let code = `package ${packageName}\n\n`;
    
    if (framework === 'circe') {
      code += 'import io.circe.generic.semiauto._\nimport io.circe.{Decoder, Encoder}\n\n';
    } else if (framework === 'play') {
      code += 'import play.api.libs.json._\n\n';
    }
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      code += `case class ${className}()`;
      return code;
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      code += `case class ${className}(\n`;
      
      const properties = Object.entries(data).map(([key, value]) => {
        const scalaType = this.getScalaType(value);
        return `  ${key}: ${scalaType}`;
      });
      
      code += properties.join(',\n') + '\n';
      code += ')';
      
      if (framework === 'circe') {
        code += `\n\nobject ${className} {\n`;
        code += `  implicit val decoder: Decoder[${className}] = deriveDecoder\n`;
        code += `  implicit val encoder: Encoder[${className}] = deriveEncoder\n`;
        code += '}';
      } else if (framework === 'play') {
        code += `\n\nobject ${className} {\n`;
        code += `  implicit val format: Format[${className}] = Json.format[${className}]\n`;
        code += '}';
      }
    }
    
    return code;
  }

  private getScalaType(value: any): string {
    if (value === null) return 'Option[Any]';
    if (typeof value === 'boolean') return 'Boolean';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'Int' : 'Double';
    }
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) return 'List[Any]';
    if (typeof value === 'object') return 'Map[String, Any]';
    return 'Any';
  }
}

export class GroovyGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const className = options.rootName;
    const packageName = options.packageName || 'com.example';
    const framework = options.framework || 'plain';
    
    let code = `package ${packageName}\n\n`;
    
    if (framework === 'canonical') {
      code += 'import groovy.transform.Canonical\n\n@Canonical\n';
    }
    
    code += `class ${className} {\n`;
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      code += '    // 空类，可以根据需要添加属性\n';
      code += '}';
      return code;
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        const groovyType = options.framework?.includes('typed') ? this.getGroovyType(value) + ' ' : '';
        code += `    ${groovyType}${key}\n`;
      }
    }
    
    code += '}';
    
    return code;
  }

  private getGroovyType(value: any): string {
    if (value === null) return 'def';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'double';
    }
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) return 'List';
    if (typeof value === 'object') return 'Map';
    return 'def';
  }
}

export class RustGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const structName = options.rootName;
    const framework = options.framework || 'serde';
    
    let code = '';
    
    if (framework === 'serde') {
      code += 'use serde::{Deserialize, Serialize};\n\n';
      code += '#[derive(Debug, Serialize, Deserialize)]\n';
    }
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      code += `pub struct ${structName} {\n`;
      code += '    // 空结构体，可以根据需要添加字段\n';
      code += '}';
      return code;
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      code += `pub struct ${structName} {\n`;
      
      for (const [key, value] of Object.entries(data)) {
        const rustType = this.getRustType(value);
        const fieldName = this.toRustFieldName(key);
        const serdeAttr = framework === 'serde' && key !== fieldName ? 
          `    #[serde(rename = "${key}")]\n` : '';
        
        code += `${serdeAttr}    pub ${fieldName}: ${rustType},\n`;
      }
      
      code += '}';
    }
    
    return code;
  }

  private getRustType(value: any): string {
    if (value === null) return 'Option<serde_json::Value>';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'i32' : 'f64';
    }
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) return 'Vec<serde_json::Value>';
    if (typeof value === 'object') return 'serde_json::Map<String, serde_json::Value>';
    return 'serde_json::Value';
  }

  private toRustFieldName(name: string): string {
    return name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
}

export class RubyGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const className = options.rootName;
    const framework = options.framework || 'plain';
    
    let code = `class ${className}\n`;
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      code += '  # 空类，可以根据需要添加属性\n';
      code += '  def initialize(data = {})\n  end\n';
      code += 'end';
      return code;
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const attributes = Object.keys(data);
      
      if (framework === 'attr_accessor') {
        code += `  attr_accessor ${attributes.map(attr => `:${attr}`).join(', ')}\n\n`;
      }
      
      code += '  def initialize(data = {})\n';
      for (const key of attributes) {
        code += `    @${key} = data[:${key}] || data['${key}']\n`;
      }
      code += '  end\n';
      
      if (framework !== 'attr_accessor') {
        code += '\n';
        for (const key of attributes) {
          code += `  def ${key}\n    @${key}\n  end\n\n`;
          code += `  def ${key}=(value)\n    @${key} = value\n  end\n\n`;
        }
      }
    }
    
    code += 'end';
    
    return code;
  }
}

export class SwiftGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const structName = options.rootName;
    const framework = options.framework || 'codable';
    
    let code = '';
    
    // 处理空数据的情况，参考Python的写法
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      code += `struct ${structName}`;
      if (framework === 'codable') {
        code += ': Codable';
      }
      code += ' {\n';
      code += '    // 空结构体，可以根据需要添加属性\n';
      code += '}';
      return code;
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      code += `struct ${structName}`;
      
      if (framework === 'codable') {
        code += ': Codable';
      }
      
      code += ' {\n';
      
      for (const [key, value] of Object.entries(data)) {
        const swiftType = this.getSwiftType(value);
        code += `    let ${key}: ${swiftType}\n`;
      }
      
      code += '}';
    }
    
    return code;
  }

  private getSwiftType(value: any): string {
    if (value === null) return 'Any?';
    if (typeof value === 'boolean') return 'Bool';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'Int' : 'Double';
    }
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) return '[Any]';
    if (typeof value === 'object') return '[String: Any]';
    return 'Any';
  }
}

export class DartGenerator {
  generate(data: any, options: CodeGenOptions): string {
    const className = options.rootName;
    const framework = options.framework || 'plain';
    
    let code = '';
    
    // 处理空数据的情况
    if (data === null || data === undefined || (typeof data === 'object' && Object.keys(data).length === 0 && !Array.isArray(data))) {
      code += `class ${className} {\n`;
      if (framework === 'json_annotation') {
        code += '  @JsonSerializable()\n';
      }
      code += '  // 空类，可以根据需要添加属性\n';
      code += '}\n';
      return code;
    }
    
    if (framework === 'json_annotation') {
      code += "import 'package:json_annotation/json_annotation.dart';\n\n";
      code += `part '${className.toLowerCase()}.g.dart';\n\n`;
      code += '@JsonSerializable()\n';
    }
    
    code += `class ${className} {\n`;
    
    // 生成属性
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.keys(data).forEach(key => {
        const dartType = this.getDartType(data[key]);
        const fieldName = this.toDartFieldName(key);
        
        if (framework === 'json_annotation') {
          if (key !== fieldName) {
            code += `  @JsonKey(name: '${key}')\n`;
          }
        }
        
        code += `  final ${dartType} ${fieldName};\n`;
      });
    }
    
    code += '\n';
    
    // 生成构造函数
    code += `  ${className}({\n`;
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.keys(data).forEach((key, index) => {
        const fieldName = this.toDartFieldName(key);
        const isRequired = data[key] !== null && data[key] !== undefined;
        
        if (isRequired) {
          code += `    required this.${fieldName}`;
        } else {
          code += `    this.${fieldName}`;
        }
        
        if (index < Object.keys(data).length - 1) {
          code += ',';
        }
        code += '\n';
      });
    }
    code += '  });\n\n';
    
    // 生成 fromJson 和 toJson 方法
    if (framework === 'json_annotation') {
      code += `  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);\n\n`;
      code += `  Map<String, dynamic> toJson() => _$${className}ToJson(this);\n`;
    } else {
      // 手动实现 fromJson
      code += `  factory ${className}.fromJson(Map<String, dynamic> json) {\n`;
      code += `    return ${className}(\n`;
      if (typeof data === 'object' && !Array.isArray(data)) {
        Object.keys(data).forEach((key, index) => {
          const fieldName = this.toDartFieldName(key);
          const dartType = this.getDartType(data[key]);
          
          code += `      ${fieldName}: `;
          
          if (dartType.includes('List')) {
            code += `(json['${key}'] as List?)?.cast<dynamic>() ?? []`;
          } else if (dartType.includes('Map')) {
            code += `json['${key}'] as Map<String, dynamic>? ?? {}`;
          } else {
            code += `json['${key}'] as ${dartType.replace('?', '')}?`;
          }
          
          if (index < Object.keys(data).length - 1) {
            code += ',';
          }
          code += '\n';
        });
      }
      code += '    );\n';
      code += '  }\n\n';
      
      // 手动实现 toJson
      code += '  Map<String, dynamic> toJson() {\n';
      code += '    return {\n';
      if (typeof data === 'object' && !Array.isArray(data)) {
        Object.keys(data).forEach((key, index) => {
          const fieldName = this.toDartFieldName(key);
          code += `      '${key}': ${fieldName}`;
          if (index < Object.keys(data).length - 1) {
            code += ',';
          }
          code += '\n';
        });
      }
      code += '    };\n';
      code += '  }\n';
    }
    
    code += '}\n';
    
    return code;
  }
  
  private getDartType(value: any): string {
    if (value === null || value === undefined) return 'String?';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'double';
    }
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'List<dynamic>';
      const firstElement = value[0];
      const elementType = this.getDartType(firstElement);
      return `List<${elementType.replace('?', '')}>`;
    }
    if (typeof value === 'object') return 'Map<String, dynamic>';
    return 'dynamic';
  }
  
  private toDartFieldName(name: string): string {
    // 转换为 camelCase
    return name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
               .replace(/^[A-Z]/, letter => letter.toLowerCase());
  }
}