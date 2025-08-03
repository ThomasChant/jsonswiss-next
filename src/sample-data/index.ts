/**
 * Sample data for all functional pages in JSON Swiss
 * Provides realistic employee/company datasets demonstrating various data types and structures
 */

// Comprehensive employee dataset for demonstrations
export const SAMPLE_JSON = {
  "company": {
    "name": "Tech Solutions Inc.",
    "founded": 2010,
    "headquarters": {
      "address": {
        "street": "123 Innovation Drive",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94105",
        "country": "USA"
      },
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    },
    "departments": [
      {
        "id": 1,
        "name": "Engineering",
        "budget": 2500000,
        "manager": {
          "employeeId": "EMP001",
          "name": "Sarah Chen",
          "email": "sarah.chen@techsolutions.com"
        }
      },
      {
        "id": 2,
        "name": "Product Management",
        "budget": 1200000,
        "manager": {
          "employeeId": "EMP002",
          "name": "Michael Rodriguez",
          "email": "michael.rodriguez@techsolutions.com"
        }
      },
      {
        "id": 3,
        "name": "Sales",
        "budget": 1800000,
        "manager": {
          "employeeId": "EMP003",
          "name": "Emily Johnson",
          "email": "emily.johnson@techsolutions.com"
        }
      }
    ],
    "employees": [
      {
        "employeeId": "EMP001",
        "personalInfo": {
          "firstName": "Sarah",
          "lastName": "Chen",
          "email": "sarah.chen@techsolutions.com",
          "phone": "+1-415-555-0101",
          "dateOfBirth": "1985-03-15",
          "address": {
            "street": "456 Oak Street",
            "city": "San Francisco",
            "state": "CA",
            "zipCode": "94110"
          }
        },
        "employment": {
          "position": "Senior Software Engineer",
          "department": "Engineering",
          "hireDate": "2018-01-15",
          "salary": 145000,
          "isActive": true,
          "skills": ["JavaScript", "Python", "React", "Node.js", "PostgreSQL"],
          "certifications": [
            {
              "name": "AWS Solutions Architect",
              "issueDate": "2022-06-15",
              "expiryDate": "2025-06-15"
            }
          ]
        },
        "performance": {
          "currentRating": 4.8,
          "lastReviewDate": "2023-12-15",
          "goals": [
            "Lead team migration to microservices",
            "Mentor junior developers",
            "Complete AWS certification"
          ]
        }
      },
      {
        "employeeId": "EMP002",
        "personalInfo": {
          "firstName": "Michael",
          "lastName": "Rodriguez",
          "email": "michael.rodriguez@techsolutions.com",
          "phone": "+1-415-555-0102",
          "dateOfBirth": "1982-07-22",
          "address": {
            "street": "789 Pine Avenue",
            "city": "Oakland",
            "state": "CA",
            "zipCode": "94612"
          }
        },
        "employment": {
          "position": "Product Manager",
          "department": "Product Management",
          "hireDate": "2019-05-01",
          "salary": 135000,
          "isActive": true,
          "skills": ["Product Strategy", "Data Analysis", "Agile", "SQL", "Tableau"],
          "certifications": [
            {
              "name": "Certified Scrum Product Owner",
              "issueDate": "2021-03-10",
              "expiryDate": "2024-03-10"
            }
          ]
        },
        "performance": {
          "currentRating": 4.5,
          "lastReviewDate": "2023-11-20",
          "goals": [
            "Launch new product line",
            "Improve user engagement by 25%",
            "Expand to international markets"
          ]
        }
      },
      {
        "employeeId": "EMP003",
        "personalInfo": {
          "firstName": "Emily",
          "lastName": "Johnson",
          "email": "emily.johnson@techsolutions.com",
          "phone": "+1-415-555-0103",
          "dateOfBirth": "1988-11-08",
          "address": {
            "street": "321 Elm Street",
            "city": "Berkeley",
            "state": "CA",
            "zipCode": "94704"
          }
        },
        "employment": {
          "position": "Sales Director",
          "department": "Sales",
          "hireDate": "2020-02-10",
          "salary": 125000,
          "isActive": true,
          "skills": ["Sales Strategy", "CRM", "Negotiation", "Team Leadership"],
          "certifications": []
        },
        "performance": {
          "currentRating": 4.7,
          "lastReviewDate": "2023-10-30",
          "goals": [
            "Achieve 150% of sales target",
            "Build enterprise client relationships",
            "Expand sales team"
          ]
        }
      },
      {
        "employeeId": "EMP004",
        "personalInfo": {
          "firstName": "David",
          "lastName": "Kim",
          "email": "david.kim@techsolutions.com",
          "phone": "+1-415-555-0104",
          "dateOfBirth": "1990-05-12",
          "address": {
            "street": "654 Maple Drive",
            "city": "San Jose",
            "state": "CA",
            "zipCode": "95113"
          }
        },
        "employment": {
          "position": "Junior Developer",
          "department": "Engineering",
          "hireDate": "2023-06-01",
          "salary": 85000,
          "isActive": true,
          "skills": ["JavaScript", "React", "HTML", "CSS"],
          "certifications": []
        },
        "performance": {
          "currentRating": 4.2,
          "lastReviewDate": "2023-12-01",
          "goals": [
            "Complete React certification",
            "Contribute to 3 major features",
            "Learn backend development"
          ]
        }
      }
    ],
    "projects": [
      {
        "id": "PROJ001",
        "name": "Customer Portal Redesign",
        "status": "In Progress",
        "startDate": "2023-09-01",
        "endDate": "2024-03-31",
        "budget": 500000,
        "teamMembers": ["EMP001", "EMP004"],
        "milestones": [
          {
            "name": "Design Phase",
            "dueDate": "2023-11-30",
            "completed": true
          },
          {
            "name": "Development Phase",
            "dueDate": "2024-02-29",
            "completed": false
          }
        ]
      }
    ],
    "financials": {
      "revenue": {
        "2023": 15000000,
        "2022": 12500000,
        "2021": 10000000
      },
      "expenses": {
        "salaries": 8500000,
        "infrastructure": 2000000,
        "marketing": 1500000,
        "other": 1000000
      }
    }
  }
};

// CSV representation of employee data
export const SAMPLE_CSV = `employeeId,firstName,lastName,email,position,department,salary,hireDate,isActive,rating
EMP001,Sarah,Chen,sarah.chen@techsolutions.com,Senior Software Engineer,Engineering,145000,2018-01-15,true,4.8
EMP002,Michael,Rodriguez,michael.rodriguez@techsolutions.com,Product Manager,Product Management,135000,2019-05-01,true,4.5
EMP003,Emily,Johnson,emily.johnson@techsolutions.com,Sales Director,Sales,125000,2020-02-10,true,4.7
EMP004,David,Kim,david.kim@techsolutions.com,Junior Developer,Engineering,85000,2023-06-01,true,4.2`;

// XML representation
export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<company name="Tech Solutions Inc." founded="2010">
  <headquarters>
    <address street="123 Innovation Drive" city="San Francisco" state="CA" zipCode="94105" country="USA" />
    <coordinates latitude="37.7749" longitude="-122.4194" />
  </headquarters>
  <departments>
    <department id="1" name="Engineering" budget="2500000">
      <manager employeeId="EMP001" name="Sarah Chen" email="sarah.chen@techsolutions.com" />
    </department>
    <department id="2" name="Product Management" budget="1200000">
      <manager employeeId="EMP002" name="Michael Rodriguez" email="michael.rodriguez@techsolutions.com" />
    </department>
  </departments>
  <employees>
    <employee employeeId="EMP001">
      <personalInfo firstName="Sarah" lastName="Chen" email="sarah.chen@techsolutions.com" phone="+1-415-555-0101" />
      <employment position="Senior Software Engineer" department="Engineering" salary="145000" isActive="true" />
      <skills>
        <skill>JavaScript</skill>
        <skill>Python</skill>
        <skill>React</skill>
      </skills>
    </employee>
    <employee employeeId="EMP002">
      <personalInfo firstName="Michael" lastName="Rodriguez" email="michael.rodriguez@techsolutions.com" phone="+1-415-555-0102" />
      <employment position="Product Manager" department="Product Management" salary="135000" isActive="true" />
      <skills>
        <skill>Product Strategy</skill>
        <skill>Data Analysis</skill>
        <skill>Agile</skill>
      </skills>
    </employee>
  </employees>
</company>`;

// YAML representation
export const SAMPLE_YAML = `company:
  name: "Tech Solutions Inc."
  founded: 2010
  headquarters:
    address:
      street: "123 Innovation Drive"
      city: "San Francisco"
      state: "CA"
      zipCode: "94105"
      country: "USA"
    coordinates:
      latitude: 37.7749
      longitude: -122.4194
  
  departments:
    - id: 1
      name: "Engineering"
      budget: 2500000
      manager:
        employeeId: "EMP001"
        name: "Sarah Chen"
        email: "sarah.chen@techsolutions.com"
    
    - id: 2
      name: "Product Management"
      budget: 1200000
      manager:
        employeeId: "EMP002"
        name: "Michael Rodriguez"
        email: "michael.rodriguez@techsolutions.com"
  
  employees:
    - employeeId: "EMP001"
      personalInfo:
        firstName: "Sarah"
        lastName: "Chen"
        email: "sarah.chen@techsolutions.com"
        phone: "+1-415-555-0101"
      employment:
        position: "Senior Software Engineer"
        department: "Engineering"
        salary: 145000
        isActive: true
        skills:
          - "JavaScript"
          - "Python"
          - "React"
          - "Node.js"
    
    - employeeId: "EMP002"
      personalInfo:
        firstName: "Michael"
        lastName: "Rodriguez"
        email: "michael.rodriguez@techsolutions.com"
        phone: "+1-415-555-0102"
      employment:
        position: "Product Manager"
        department: "Product Management"
        salary: 135000
        isActive: true
        skills:
          - "Product Strategy"
          - "Data Analysis"
          - "Agile"
          - "SQL"`;

// TOML representation
export const SAMPLE_TOML = `[company]
name = "Tech Solutions Inc."
founded = 2010

[company.headquarters]
[company.headquarters.address]
street = "123 Innovation Drive"
city = "San Francisco"
state = "CA"
zipCode = "94105"
country = "USA"

[company.headquarters.coordinates]
latitude = 37.7749
longitude = -122.4194

[[company.departments]]
id = 1
name = "Engineering"
budget = 2500000

[company.departments.manager]
employeeId = "EMP001"
name = "Sarah Chen"
email = "sarah.chen@techsolutions.com"

[[company.departments]]
id = 2
name = "Product Management"
budget = 1200000

[company.departments.manager]
employeeId = "EMP002"
name = "Michael Rodriguez"
email = "michael.rodriguez@techsolutions.com"

[[company.employees]]
employeeId = "EMP001"

[company.employees.personalInfo]
firstName = "Sarah"
lastName = "Chen"
email = "sarah.chen@techsolutions.com"
phone = "+1-415-555-0101"

[company.employees.employment]
position = "Senior Software Engineer"
department = "Engineering"
salary = 145000
isActive = true
skills = ["JavaScript", "Python", "React", "Node.js"]`;

// INI representation
export const SAMPLE_INI = `[Company]
name=Tech Solutions Inc.
founded=2010

[Headquarters]
street=123 Innovation Drive
city=San Francisco
state=CA
zipCode=94105
country=USA

[Department_Engineering]
id=1
name=Engineering
budget=2500000
manager_name=Sarah Chen
manager_email=sarah.chen@techsolutions.com

[Department_ProductManagement]
id=2
name=Product Management
budget=1200000
manager_name=Michael Rodriguez
manager_email=michael.rodriguez@techsolutions.com

[Employee_EMP001]
firstName=Sarah
lastName=Chen
email=sarah.chen@techsolutions.com
position=Senior Software Engineer
department=Engineering
salary=145000
isActive=true

[Employee_EMP002]
firstName=Michael
lastName=Rodriguez
email=michael.rodriguez@techsolutions.com
position=Product Manager
department=Product Management
salary=135000
isActive=true`;

// SQL representation
export const SAMPLE_SQL = `-- Company database schema
CREATE TABLE companies (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    founded INTEGER,
    headquarters_street VARCHAR(255),
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(50),
    headquarters_zipcode VARCHAR(20)
);

CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    budget DECIMAL(12,2),
    company_id INTEGER,
    manager_employee_id VARCHAR(50)
);

CREATE TABLE employees (
    employee_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(255),
    department VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATE,
    is_active BOOLEAN,
    current_rating DECIMAL(3,1)
);

-- Sample data
INSERT INTO companies VALUES (1, 'Tech Solutions Inc.', 2010, '123 Innovation Drive', 'San Francisco', 'CA', '94105');

INSERT INTO departments VALUES 
(1, 'Engineering', 2500000.00, 1, 'EMP001'),
(2, 'Product Management', 1200000.00, 1, 'EMP002'),
(3, 'Sales', 1800000.00, 1, 'EMP003');

INSERT INTO employees VALUES 
('EMP001', 'Sarah', 'Chen', 'sarah.chen@techsolutions.com', '+1-415-555-0101', 'Senior Software Engineer', 'Engineering', 145000.00, '2018-01-15', true, 4.8),
('EMP002', 'Michael', 'Rodriguez', 'michael.rodriguez@techsolutions.com', '+1-415-555-0102', 'Product Manager', 'Product Management', 135000.00, '2019-05-01', true, 4.5),
('EMP003', 'Emily', 'Johnson', 'emily.johnson@techsolutions.com', '+1-415-555-0103', 'Sales Director', 'Sales', 125000.00, '2020-02-10', true, 4.7),
('EMP004', 'David', 'Kim', 'david.kim@techsolutions.com', '+1-415-555-0104', 'Junior Developer', 'Engineering', 85000.00, '2023-06-01', true, 4.2);`;

// Dictionary/Map representation (Python-style)
export const SAMPLE_DICT = `{
    'company': {
        'name': 'Tech Solutions Inc.',
        'founded': 2010,
        'departments': [
            {
                'id': 1,
                'name': 'Engineering',
                'budget': 2500000,
                'manager': {
                    'employeeId': 'EMP001',
                    'name': 'Sarah Chen',
                    'email': 'sarah.chen@techsolutions.com'
                }
            },
            {
                'id': 2,
                'name': 'Product Management',
                'budget': 1200000,
                'manager': {
                    'employeeId': 'EMP002',
                    'name': 'Michael Rodriguez',
                    'email': 'michael.rodriguez@techsolutions.com'
                }
            }
        ],
        'employees': [
            {
                'employeeId': 'EMP001',
                'personalInfo': {
                    'firstName': 'Sarah',
                    'lastName': 'Chen',
                    'email': 'sarah.chen@techsolutions.com',
                    'phone': '+1-415-555-0101'
                },
                'employment': {
                    'position': 'Senior Software Engineer',
                    'department': 'Engineering',
                    'salary': 145000,
                    'isActive': True,
                    'skills': ['JavaScript', 'Python', 'React', 'Node.js']
                }
            },
            {
                'employeeId': 'EMP002',
                'personalInfo': {
                    'firstName': 'Michael',
                    'lastName': 'Rodriguez',
                    'email': 'michael.rodriguez@techsolutions.com',
                    'phone': '+1-415-555-0102'
                },
                'employment': {
                    'position': 'Product Manager',
                    'department': 'Product Management',
                    'salary': 135000,
                    'isActive': True,
                    'skills': ['Product Strategy', 'Data Analysis', 'Agile']
                }
            }
        ]
    }
}`;

// Broken JSON for repair tool
export const SAMPLE_BROKEN_JSON = `{
  "company": {
    "name": "Tech Solutions Inc.",
    "founded": 2010,
    "employees": [
      {
        "employeeId": "EMP001",
        "personalInfo": {
          "firstName": "Sarah",
          "lastName": "Chen",
          "email": "sarah.chen@techsolutions.com"
          "phone": "+1-415-555-0101",
        },
        "employment": {
          "position": "Senior Software Engineer",
          "department": "Engineering",
          "salary": 145000,
          "isActive": true,
          "skills": ["JavaScript", "Python", "React",]
        }
      },
      {
        "employeeId": "EMP002",
        "personalInfo": {
          "firstName": "Michael",
          "lastName": "Rodriguez",
          "email": "michael.rodriguez@techsolutions.com",
          "phone": "+1-415-555-0102"
        },
        "employment": {
          "position": "Product Manager",
          "department": "Product Management",
          "salary": 135000,
          "isActive": true,
        }
      }
    ]
  }
}`;

// Minified JSON for formatter
export const SAMPLE_MINIFIED_JSON = `{"company":{"name":"Tech Solutions Inc.","founded":2010,"employees":[{"employeeId":"EMP001","personalInfo":{"firstName":"Sarah","lastName":"Chen","email":"sarah.chen@techsolutions.com"},"employment":{"position":"Senior Software Engineer","department":"Engineering","salary":145000,"isActive":true,"skills":["JavaScript","Python","React"]}},{"employeeId":"EMP002","personalInfo":{"firstName":"Michael","lastName":"Rodriguez","email":"michael.rodriguez@techsolutions.com"},"employment":{"position":"Product Manager","department":"Product Management","salary":135000,"isActive":true,"skills":["Product Strategy","Data Analysis"]}}]}}`;

// JSON Schema example
export const SAMPLE_JSON_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "company": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Company name"
        },
        "founded": {
          "type": "integer",
          "minimum": 1800,
          "maximum": 2024
        },
        "employees": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "employeeId": {
                "type": "string",
                "pattern": "^EMP[0-9]{3}$"
              },
              "personalInfo": {
                "type": "object",
                "properties": {
                  "firstName": { "type": "string" },
                  "lastName": { "type": "string" },
                  "email": {
                    "type": "string",
                    "format": "email"
                  }
                },
                "required": ["firstName", "lastName", "email"]
              },
              "employment": {
                "type": "object",
                "properties": {
                  "salary": {
                    "type": "number",
                    "minimum": 0
                  },
                  "isActive": {
                    "type": "boolean"
                  }
                }
              }
            },
            "required": ["employeeId", "personalInfo", "employment"]
          }
        }
      },
      "required": ["name", "founded", "employees"]
    }
  },
  "required": ["company"]
};

// Sample data mapping for different tools
export const SAMPLE_DATA_MAP = {
  // Converters
  csvToJson: SAMPLE_CSV,
  jsonToCsv: SAMPLE_JSON,
  excelToJson: 'excel', // Special marker for binary data
  jsonToExcel: SAMPLE_JSON,
  xmlToJson: SAMPLE_XML,
  jsonToXml: SAMPLE_JSON,
  yamlToJson: SAMPLE_YAML,
  jsonToYaml: SAMPLE_JSON,
  tomlToJson: SAMPLE_TOML,
  jsonToToml: SAMPLE_JSON,
  iniToJson: SAMPLE_INI,
  jsonToIni: SAMPLE_JSON,
  sqlToJson: SAMPLE_SQL,
  jsonToSql: SAMPLE_JSON,
  dictToJson: SAMPLE_DICT,
  jsonToDict: SAMPLE_JSON,
  
  // Utilities
  formatter: SAMPLE_MINIFIED_JSON,
  validator: SAMPLE_JSON,
  repair: SAMPLE_BROKEN_JSON,
  schema: SAMPLE_JSON,
  
  // Code generators
  javascript: SAMPLE_JSON,
  typescript: SAMPLE_JSON,
  python: SAMPLE_JSON,
  java: SAMPLE_JSON,
  csharp: SAMPLE_JSON,
  go: SAMPLE_JSON,
  rust: SAMPLE_JSON,
  php: SAMPLE_JSON,
  ruby: SAMPLE_JSON,
  swift: SAMPLE_JSON,
  scala: SAMPLE_JSON,
  groovy: SAMPLE_JSON,
  sqlGenerator: SAMPLE_JSON,
  
  // Schema tools
  mockGenerator: SAMPLE_JSON_SCHEMA,
  schemaLibrary: SAMPLE_JSON_SCHEMA
};

// Helper function to get sample data by tool type
export function getSampleData(toolType: string): string | object {
  return SAMPLE_DATA_MAP[toolType as keyof typeof SAMPLE_DATA_MAP] || SAMPLE_JSON;
}

// Helper function to get JSON schema sample
export function getSampleSchema(): object {
  return SAMPLE_JSON_SCHEMA;
}

// Comparison sample pairs for JSON Compare tool
export const compareSamples = {
  userProfileUpdate: {
    name: "User Profile Update",
    description: "Before and after user profile changes",
    category: "User Data",
    jsonA: JSON.stringify({
      "userId": "U12345",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0123",
        "address": {
          "street": "123 Main St",
          "city": "Boston",
          "state": "MA",
          "zipCode": "02101"
        },
        "preferences": {
          "theme": "light",
          "notifications": true,
          "language": "en"
        },
        "subscription": {
          "plan": "basic",
          "status": "active",
          "expiryDate": "2024-12-31"
        }
      }
    }, null, 2),
    jsonB: JSON.stringify({
      "userId": "U12345",
      "profile": {
        "firstName": "John",
        "lastName": "Smith",
        "email": "john.smith@newcompany.com",
        "phone": "+1-555-0456",
        "address": {
          "street": "456 Oak Avenue",
          "city": "Boston",
          "state": "MA",
          "zipCode": "02102",
          "country": "USA"
        },
        "preferences": {
          "theme": "dark",
          "notifications": false,
          "language": "en",
          "timezone": "EST"
        },
        "subscription": {
          "plan": "premium",
          "status": "active",
          "expiryDate": "2025-12-31",
          "features": ["analytics", "priority_support"]
        }
      }
    }, null, 2)
  },

  apiResponseVersions: {
    name: "API Response v1 vs v2",
    description: "Comparison between API response versions",
    category: "API Evolution",
    jsonA: JSON.stringify({
      "version": "1.0",
      "data": {
        "users": [
          {
            "id": 1,
            "name": "Alice Johnson",
            "email": "alice@example.com",
            "role": "admin"
          },
          {
            "id": 2,
            "name": "Bob Wilson",
            "email": "bob@example.com",
            "role": "user"
          }
        ],
        "total": 2,
        "page": 1
      },
      "status": "success"
    }, null, 2),
    jsonB: JSON.stringify({
      "version": "2.0",
      "data": {
        "users": [
          {
            "id": 1,
            "firstName": "Alice",
            "lastName": "Johnson",
            "email": "alice@example.com",
            "role": "admin",
            "permissions": ["read", "write", "delete"],
            "lastLogin": "2024-01-15T10:30:00Z"
          },
          {
            "id": 2,
            "firstName": "Bob",
            "lastName": "Wilson",
            "email": "bob@example.com",
            "role": "user",
            "permissions": ["read"],
            "lastLogin": "2024-01-14T15:45:00Z"
          },
          {
            "id": 3,
            "firstName": "Carol",
            "lastName": "Davis",
            "email": "carol@example.com",
            "role": "moderator",
            "permissions": ["read", "write"],
            "lastLogin": "2024-01-13T09:15:00Z"
          }
        ],
        "pagination": {
          "total": 3,
          "page": 1,
          "limit": 10,
          "hasNext": false
        }
      },
      "status": "success",
      "timestamp": "2024-01-15T12:00:00Z"
    }, null, 2)
  },

  configurationChanges: {
    name: "Configuration Changes",
    description: "Before and after application configuration",
    category: "Configuration",
    jsonA: JSON.stringify({
      "application": {
        "name": "MyApp",
        "version": "1.2.3",
        "environment": "production",
        "database": {
          "host": "localhost",
          "port": 5432,
          "name": "myapp_db",
          "ssl": false
        },
        "cache": {
          "type": "memory",
          "ttl": 3600
        },
        "logging": {
          "level": "info",
          "format": "json"
        },
        "features": {
          "authentication": true,
          "analytics": false
        }
      }
    }, null, 2),
    jsonB: JSON.stringify({
      "application": {
        "name": "MyApp",
        "version": "2.0.0",
        "environment": "production",
        "database": {
          "host": "db.example.com",
          "port": 5432,
          "name": "myapp_production",
          "ssl": true,
          "pool": {
            "min": 5,
            "max": 20
          }
        },
        "cache": {
          "type": "redis",
          "host": "redis.example.com",
          "port": 6379,
          "ttl": 7200
        },
        "logging": {
          "level": "warn",
          "format": "structured",
          "destinations": ["file", "elasticsearch"]
        },
        "features": {
          "authentication": true,
          "analytics": true,
          "monitoring": true
        },
        "security": {
          "cors": {
            "enabled": true,
            "origins": ["https://app.example.com"]
          },
          "rateLimit": {
            "requests": 1000,
            "window": "15m"
          }
        }
      }
    }, null, 2)
  },

  dataMigration: {
    name: "Data Migration Example",
    description: "Old vs new data structure after migration",
    category: "Data Migration",
    jsonA: JSON.stringify({
      "products": [
        {
          "id": "P001",
          "name": "Laptop Computer",
          "price": 999.99,
          "category": "Electronics",
          "inStock": true,
          "tags": "computer,laptop,portable"
        },
        {
          "id": "P002",
          "name": "Office Chair",
          "price": 249.99,
          "category": "Furniture",
          "inStock": false,
          "tags": "chair,office,ergonomic"
        }
      ]
    }, null, 2),
    jsonB: JSON.stringify({
      "products": [
        {
          "id": "P001",
          "name": "Laptop Computer",
          "pricing": {
            "amount": 999.99,
            "currency": "USD",
            "discount": null
          },
          "category": {
            "id": "CAT001",
            "name": "Electronics",
            "parent": "Technology"
          },
          "inventory": {
            "inStock": true,
            "quantity": 15,
            "warehouse": "WH-001"
          },
          "metadata": {
            "tags": ["computer", "laptop", "portable"],
            "weight": 2.5,
            "dimensions": {
              "length": 35.6,
              "width": 23.4,
              "height": 1.8
            }
          },
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-15T10:30:00Z"
        },
        {
          "id": "P002",
          "name": "Office Chair",
          "pricing": {
            "amount": 249.99,
            "currency": "USD",
            "discount": {
              "percentage": 10,
              "validUntil": "2024-02-01"
            }
          },
          "category": {
            "id": "CAT002",
            "name": "Furniture",
            "parent": "Office"
          },
          "inventory": {
            "inStock": false,
            "quantity": 0,
            "warehouse": "WH-002",
            "expectedRestock": "2024-02-15"
          },
          "metadata": {
            "tags": ["chair", "office", "ergonomic"],
            "weight": 18.2,
            "dimensions": {
              "length": 66,
              "width": 66,
              "height": 132
            }
          },
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-14T16:45:00Z"
        }
      ]
    }, null, 2)
  },

  minimalChanges: {
    name: "Minimal Changes",
    description: "Small differences for testing precision",
    category: "Testing",
    jsonA: JSON.stringify({
      "settings": {
        "debug": false,
        "timeout": 5000,
        "retries": 3,
        "endpoints": [
          "https://api.example.com/v1",
          "https://backup.example.com/v1"
        ]
      }
    }, null, 2),
    jsonB: JSON.stringify({
      "settings": {
        "debug": true,
        "timeout": 5000,
        "retries": 5,
        "endpoints": [
          "https://api.example.com/v1",
          "https://backup.example.com/v1",
          "https://fallback.example.com/v1"
        ]
      }
    }, null, 2)
  },

  identicalData: {
    name: "Identical Data",
    description: "Two identical JSON objects for testing",
    category: "Testing",
    jsonA: JSON.stringify({
      "message": "Hello, World!",
      "timestamp": "2024-01-15T12:00:00Z",
      "status": "success",
      "data": {
        "count": 42,
        "items": ["apple", "banana", "cherry"]
      }
    }, null, 2),
    jsonB: JSON.stringify({
      "message": "Hello, World!",
      "timestamp": "2024-01-15T12:00:00Z",
      "status": "success",
      "data": {
        "count": 42,
        "items": ["apple", "banana", "cherry"]
      }
    }, null, 2)
  }
};

export interface ComparisonSamplePair {
  name: string;
  description: string;
  category: string;
  jsonA: string;
  jsonB: string;
}

// Re-export table editor samples
export { 
  tableEditorSamples, 
  getSamplesByCategory, 
  getSamplesByComplexity, 
  getSampleById,
  userSamples,
  ecommerceSamples,
  apiSamples,
  mixedSamples,
  primitiveSamples
} from './table-editor-samples';
export type { TableEditorSample } from './table-editor-samples';