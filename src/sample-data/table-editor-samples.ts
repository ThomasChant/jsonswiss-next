/**
 * Sample data for JSON Table Editor demonstrating various data structures
 * and their table representations with sidebar navigation integration
 */

export interface TableEditorSample {
  id: string;
  title: string;
  description: string;
  data: any;
  category: 'objects' | 'arrays' | 'nested' | 'mixed';
  complexity: 'simple' | 'medium' | 'complex';
}

// User management data samples
export const userSamples: TableEditorSample[] = [
  {
    id: 'user_profile',
    title: 'User Profile',
    description: 'Simple user profile object with basic information',
    category: 'objects',
    complexity: 'simple',
    data: {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      age: 28,
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      role: 'user',
      avatar: null
    }
  },
  {
    id: 'user_list',
    title: 'User List',
    description: 'Array of user objects for table display',
    category: 'arrays',
    complexity: 'medium',
    data: [
      {
        id: 1,
        username: 'alice_smith',
        email: 'alice@company.com',
        firstName: 'Alice',
        lastName: 'Smith',
        department: 'Engineering',
        salary: 95000,
        isActive: true,
        joinDate: '2023-03-15'
      },
      {
        id: 2,
        username: 'bob_jones',
        email: 'bob@company.com',
        firstName: 'Bob',
        lastName: 'Jones',
        department: 'Marketing',
        salary: 78000,
        isActive: true,
        joinDate: '2023-07-22'
      },
      {
        id: 3,
        username: 'carol_white',
        email: 'carol@company.com',
        firstName: 'Carol',
        lastName: 'White',
        department: 'Design',
        salary: 82000,
        isActive: false,
        joinDate: '2022-11-08'
      }
    ]
  },
  {
    id: 'employee_directory',
    title: 'Employee Directory (50 Records)',
    description: 'Large employee dataset with nested personal and professional information',
    category: 'arrays',
    complexity: 'complex',
    data: [
      ...Array.from({ length: 50 }, (_, i) => {
        const employeeId = i + 1;
        const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Ruby', 'Sam', 'Tina'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
        const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Product', 'Legal', 'Support'];
        const positions = ['Manager', 'Senior', 'Junior', 'Lead', 'Director', 'Specialist', 'Coordinator', 'Analyst', 'Developer', 'Designer'];
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
        const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC'];
        const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'TypeScript', 'MongoDB', 'GraphQL', 'Vue.js', 'Angular', 'Java', 'C++'];
        
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        const department = departments[i % departments.length];
        const position = positions[i % positions.length];
        const city = cities[i % cities.length];
        const state = states[i % states.length];
        
        return {
          id: employeeId,
          employeeCode: `EMP${String(employeeId).padStart(4, '0')}`,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
          department,
          position: `${position} ${department === 'Engineering' ? 'Engineer' : department === 'Marketing' ? 'Marketer' : department === 'Sales' ? 'Representative' : 'Specialist'}`,
          salary: 45000 + (i * 1000) + Math.floor(Math.random() * 20000),
          isActive: Math.random() > 0.1, // 90% active
          joinDate: new Date(2020 + Math.floor(i / 12), i % 12, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          // 嵌套的个人信息
          personalInfo: {
            age: 25 + Math.floor(i / 2),
            phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            emergencyContact: {
              name: `${firstNames[(i + 5) % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`,
              relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][i % 4],
              phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
            }
          },
          // 嵌套的地址信息
          address: {
            street: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Cedar', 'Maple'][i % 6]} ${['St', 'Ave', 'Blvd', 'Dr', 'Ln'][i % 5]}`,
            city,
            state,
            zipCode: String(Math.floor(Math.random() * 90000) + 10000),
            country: 'USA'
          },
          // 嵌套的工作信息
          workInfo: {
            manager: i > 0 ? `${firstNames[(i - 1) % firstNames.length]} ${lastNames[(i - 1) % lastNames.length]}` : null,
            team: `${department} Team ${Math.floor(i / 5) + 1}`,
            skills: skills.slice(i % 3, (i % 3) + 3 + Math.floor(i / 10)),
            performance: {
              rating: 3.0 + Math.random() * 2, // 3.0 to 5.0
              lastReview: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
              goals: Math.floor(Math.random() * 5) + 3 // 3 to 7 goals
            }
          },
          // 嵌套的福利信息
          benefits: {
            healthInsurance: Math.random() > 0.2,
            dentalInsurance: Math.random() > 0.3,
            retirement401k: {
              enrolled: Math.random() > 0.25,
              contribution: Math.random() > 0.25 ? Math.floor(Math.random() * 15) + 5 : 0, // 5-20%
              companyMatch: Math.random() > 0.25 ? Math.floor(Math.random() * 6) + 3 : 0 // 3-8%
            },
            vacationDays: 15 + Math.floor(i / 5), // 15-25 days based on seniority
            sickDays: 10
          }
        };
      })
    ]
  }
];

// E-commerce data samples
export const ecommerceSamples: TableEditorSample[] = [
  {
    id: 'product_catalog',
    title: 'Product Catalog',
    description: 'Product catalog with nested categories and variants',
    category: 'nested',
    complexity: 'complex',
    data: {
      categories: [
        {
          id: 'electronics',
          name: 'Electronics',
          products: [
            {
              id: 'laptop-001',
              name: 'MacBook Pro 16"',
              price: 2499.99,
              inStock: true,
              specifications: {
                processor: 'M3 Pro',
                memory: '32GB',
                storage: '1TB SSD',
                display: '16.2-inch Liquid Retina XDR'
              },
              variants: [
                { color: 'Silver', sku: 'MBP-16-SIL' },
                { color: 'Space Gray', sku: 'MBP-16-SG' }
              ],
              reviews: {
                average: 4.8,
                count: 127,
                breakdown: {
                  5: 89,
                  4: 32,
                  3: 4,
                  2: 1,
                  1: 1
                }
              }
            }
          ]
        }
      ],
      metadata: {
        totalProducts: 1,
        lastUpdated: '2024-01-15T14:22:00Z',
        currency: 'USD'
      }
    }
  },
  {
    id: 'order_history',
    title: 'Order History',
    description: 'Customer order history with items and shipping details',
    category: 'arrays',
    complexity: 'complex',
    data: [
      {
        orderId: 'ORD-2024-001',
        customerId: 'CUST-12345',
        orderDate: '2024-01-10T09:15:00Z',
        status: 'delivered',
        total: 159.97,
        items: [
          {
            productId: 'PROD-001',
            name: 'Wireless Headphones',
            quantity: 1,
            price: 79.99,
            category: 'Electronics'
          },
          {
            productId: 'PROD-002',
            name: 'Phone Case',
            quantity: 2,
            price: 24.99,
            category: 'Accessories'
          }
        ],
        shipping: {
          method: 'standard',
          cost: 9.99,
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345',
            country: 'USA'
          },
          tracking: 'TRK123456789'
        },
        payment: {
          method: 'credit_card',
          last4: '4321',
          brand: 'visa'
        }
      }
    ]
  }
];

// API response samples
export const apiSamples: TableEditorSample[] = [
  {
    id: 'api_response',
    title: 'API Response',
    description: 'Typical REST API response with pagination and metadata',
    category: 'nested',
    complexity: 'medium',
    data: {
      success: true,
      data: [
        {
          id: 1,
          title: 'Getting Started with React',
          author: 'Jane Developer',
          publishedAt: '2024-01-01T00:00:00Z',
          tags: ['react', 'javascript', 'frontend'],
          views: 1250,
          likes: 89
        },
        {
          id: 2,
          title: 'Advanced TypeScript Patterns',
          author: 'Alex Coder',
          publishedAt: '2024-01-05T00:00:00Z',
          tags: ['typescript', 'patterns', 'advanced'],
          views: 987,
          likes: 76
        }
      ],
      pagination: {
        page: 1,
        perPage: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false
      },
      meta: {
        requestId: 'req_123456',
        timestamp: '2024-01-15T10:30:00Z',
        version: 'v1.2.0'
      }
    }
  }
];

// Mixed data type samples
export const mixedSamples: TableEditorSample[] = [
  {
    id: 'dashboard_data',
    title: 'Dashboard Data',
    description: 'Mixed data types including metrics, charts, and configurations',
    category: 'mixed',
    complexity: 'complex',
    data: {
      metrics: {
        totalUsers: 15420,
        activeUsers: 8934,
        revenue: 45678.90,
        conversionRate: 0.0234,
        isGrowing: true,
        lastUpdated: null
      },
      chartData: [
        { month: 'Jan', users: 1200, revenue: 15000 },
        { month: 'Feb', users: 1350, revenue: 18500 },
        { month: 'Mar', users: 1100, revenue: 14200 },
        { month: 'Apr', users: 1520, revenue: 22100 }
      ],
      config: {
        theme: 'dark',
        autoRefresh: true,
        refreshInterval: 30000,
        notifications: {
          email: true,
          push: false,
          sms: null
        },
        features: ['analytics', 'reporting', 'alerts'],
        beta: {
          enabled: false,
          features: []
        }
      }
    }
  },
  {
    id: 'system_config',
    title: 'System Configuration',
    description: 'System configuration with various data types and nested structures',
    category: 'nested',
    complexity: 'medium',
    data: {
      server: {
        host: 'localhost',
        port: 3000,
        ssl: false,
        timeout: 30000
      },
      database: {
        type: 'postgresql',
        host: 'db.example.com',
        port: 5432,
        name: 'production_db',
        poolSize: 10,
        ssl: true,
        credentials: null
      },
      cache: {
        provider: 'redis',
        ttl: 3600,
        enabled: true
      },
      logging: {
        level: 'info',
        formats: ['json', 'text'],
        destinations: ['console', 'file'],
        rotation: {
          enabled: true,
          maxSize: '100MB',
          maxFiles: 7
        }
      }
    }
  }
];

// Simple primitive samples for testing
export const primitiveSamples: TableEditorSample[] = [
  {
    id: 'simple_string',
    title: 'Simple String',
    description: 'Basic string value for primitive display testing',
    category: 'objects',
    complexity: 'simple',
    data: 'Hello, World! This is a simple string value that can be displayed and edited.'
  },
  {
    id: 'simple_number',
    title: 'Simple Number',
    description: 'Numeric value for primitive display testing',
    category: 'objects',
    complexity: 'simple',
    data: 42.12345
  },
  {
    id: 'simple_boolean',
    title: 'Simple Boolean',
    description: 'Boolean value for primitive display testing',
    category: 'objects',
    complexity: 'simple',
    data: true
  },
  {
    id: 'simple_null',
    title: 'Null Value',
    description: 'Null value for primitive display testing',
    category: 'objects',
    complexity: 'simple',
    data: null
  }
];

// All samples combined
export const tableEditorSamples: TableEditorSample[] = [
  ...userSamples,
  ...ecommerceSamples,
  ...apiSamples,
  ...mixedSamples,
  ...primitiveSamples
];

// Helper functions for sample data
export const getSamplesByCategory = (category: TableEditorSample['category']) => {
  return tableEditorSamples.filter(sample => sample.category === category);
};

export const getSamplesByComplexity = (complexity: TableEditorSample['complexity']) => {
  return tableEditorSamples.filter(sample => sample.complexity === complexity);
};

export const getSampleById = (id: string) => {
  return tableEditorSamples.find(sample => sample.id === id);
};

export default tableEditorSamples;