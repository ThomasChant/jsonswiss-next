export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  complexity: 'simple' | 'medium' | 'complex';
  useCase: string;
  schema: any;
}

export const schemaTemplates: SchemaTemplate[] = [
  // User Profiles
  {
    id: 'user-profile-basic',
    name: 'Basic User Profile',
    description: 'Simple user profile with essential information',
    category: 'User Management',
    tags: ['user', 'profile', 'basic', 'authentication'],
    complexity: 'simple',
    useCase: 'User registration and authentication systems',
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": "User Profile",
      "description": "Basic user profile information",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique user identifier"
        },
        "username": {
          "type": "string",
          "minLength": 3,
          "maxLength": 30,
          "pattern": "^[a-zA-Z0-9_]+$",
          "description": "Unique username"
        },
        "email": {
          "type": "string",
          "format": "email",
          "description": "User email address"
        },
        "firstName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "description": "User's first name"
        },
        "lastName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "description": "User's last name"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "description": "Account creation timestamp"
        },
        "isActive": {
          "type": "boolean",
          "description": "Whether the account is active"
        }
      },
      "required": ["id", "username", "email", "firstName", "lastName", "createdAt", "isActive"],
      "additionalProperties": false
    }
  },

  {
    id: 'user-profile-complete',
    name: 'Complete User Profile',
    description: 'Comprehensive user profile with personal and contact information',
    category: 'User Management',
    tags: ['user', 'profile', 'complete', 'personal', 'contact'],
    complexity: 'medium',
    useCase: 'Social platforms and detailed user management',
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": "Complete User Profile",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "username": { "type": "string", "minLength": 3, "maxLength": 30 },
        "email": { "type": "string", "format": "email" },
        "personalInfo": {
          "type": "object",
          "properties": {
            "firstName": { "type": "string", "minLength": 1, "maxLength": 50 },
            "lastName": { "type": "string", "minLength": 1, "maxLength": 50 },
            "middleName": { "type": "string", "maxLength": 50 },
            "dateOfBirth": { "type": "string", "format": "date" },
            "gender": { "type": "string", "enum": ["male", "female", "other", "prefer-not-to-say"] },
            "bio": { "type": "string", "maxLength": 500 }
          },
          "required": ["firstName", "lastName"]
        },
        "contactInfo": {
          "type": "object",
          "properties": {
            "phone": { "type": "string", "format": "phone" },
            "address": {
              "type": "object",
              "properties": {
                "street": { "type": "string" },
                "city": { "type": "string" },
                "state": { "type": "string" },
                "zipCode": { "type": "string" },
                "country": { "type": "string" }
              }
            },
            "socialProfiles": {
              "type": "object",
              "properties": {
                "twitter": { "type": "string", "format": "uri" },
                "linkedin": { "type": "string", "format": "uri" },
                "github": { "type": "string", "format": "uri" }
              }
            }
          }
        },
        "preferences": {
          "type": "object",
          "properties": {
            "theme": { "type": "string", "enum": ["light", "dark", "auto"] },
            "language": { "type": "string", "pattern": "^[a-z]{2}$" },
            "timezone": { "type": "string" },
            "notifications": {
              "type": "object",
              "properties": {
                "email": { "type": "boolean" },
                "push": { "type": "boolean" },
                "sms": { "type": "boolean" }
              }
            }
          }
        },
        "metadata": {
          "type": "object",
          "properties": {
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" },
            "lastLoginAt": { "type": "string", "format": "date-time" },
            "isActive": { "type": "boolean" },
            "isVerified": { "type": "boolean" }
          }
        }
      },
      "required": ["id", "username", "email", "personalInfo", "metadata"]
    }
  },

  // E-commerce
  {
    id: 'product-catalog',
    name: 'Product Catalog',
    description: 'E-commerce product with pricing and inventory',
    category: 'E-commerce',
    tags: ['product', 'catalog', 'inventory', 'pricing'],
    complexity: 'medium',
    useCase: 'Online store product listings and inventory management',
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": "Product",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "sku": { "type": "string", "pattern": "^[A-Z0-9-]+$" },
        "name": { "type": "string", "minLength": 1, "maxLength": 200 },
        "description": { "type": "string", "maxLength": 1000 },
        "category": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "name": { "type": "string" },
            "path": { "type": "string" }
          },
          "required": ["id", "name"]
        },
        "pricing": {
          "type": "object",
          "properties": {
            "basePrice": { "type": "number", "minimum": 0 },
            "salePrice": { "type": "number", "minimum": 0 },
            "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
            "discount": {
              "type": "object",
              "properties": {
                "percentage": { "type": "number", "minimum": 0, "maximum": 100 },
                "validFrom": { "type": "string", "format": "date-time" },
                "validUntil": { "type": "string", "format": "date-time" }
              }
            }
          },
          "required": ["basePrice", "currency"]
        },
        "inventory": {
          "type": "object",
          "properties": {
            "inStock": { "type": "boolean" },
            "quantity": { "type": "integer", "minimum": 0 },
            "reserved": { "type": "integer", "minimum": 0 },
            "warehouse": { "type": "string" }
          },
          "required": ["inStock", "quantity"]
        },
        "attributes": {
          "type": "object",
          "properties": {
            "brand": { "type": "string" },
            "model": { "type": "string" },
            "color": { "type": "string" },
            "size": { "type": "string" },
            "weight": { "type": "number", "minimum": 0 },
            "dimensions": {
              "type": "object",
              "properties": {
                "length": { "type": "number", "minimum": 0 },
                "width": { "type": "number", "minimum": 0 },
                "height": { "type": "number", "minimum": 0 }
              }
            }
          }
        },
        "media": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "type": "string", "enum": ["image", "video"] },
              "url": { "type": "string", "format": "uri" },
              "altText": { "type": "string" },
              "isPrimary": { "type": "boolean" }
            },
            "required": ["type", "url"]
          }
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "metadata": {
          "type": "object",
          "properties": {
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" },
            "isActive": { "type": "boolean" },
            "isFeatured": { "type": "boolean" }
          }
        }
      },
      "required": ["id", "sku", "name", "pricing", "inventory", "metadata"]
    }
  },

  {
    id: 'order-details',
    name: 'Order Details',
    description: 'Complete order with items, customer, and payment information',
    category: 'E-commerce',
    tags: ['order', 'checkout', 'payment', 'customer'],
    complexity: 'complex',
    useCase: 'Order processing and fulfillment systems',
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": "Order",
      "properties": {
        "orderId": { "type": "string", "format": "uuid" },
        "orderNumber": { "type": "string", "pattern": "^ORD-[0-9]{6}$" },
        "status": { "type": "string", "enum": ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] },
        "customer": {
          "type": "object",
          "properties": {
            "id": { "type": "string", "format": "uuid" },
            "email": { "type": "string", "format": "email" },
            "name": { "type": "string" },
            "phone": { "type": "string" }
          },
          "required": ["id", "email", "name"]
        },
        "items": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "properties": {
              "productId": { "type": "string", "format": "uuid" },
              "sku": { "type": "string" },
              "name": { "type": "string" },
              "quantity": { "type": "integer", "minimum": 1 },
              "unitPrice": { "type": "number", "minimum": 0 },
              "totalPrice": { "type": "number", "minimum": 0 },
              "discount": { "type": "number", "minimum": 0 }
            },
            "required": ["productId", "sku", "name", "quantity", "unitPrice", "totalPrice"]
          }
        },
        "shipping": {
          "type": "object",
          "properties": {
            "address": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "street": { "type": "string" },
                "city": { "type": "string" },
                "state": { "type": "string" },
                "zipCode": { "type": "string" },
                "country": { "type": "string" }
              },
              "required": ["name", "street", "city", "country"]
            },
            "method": { "type": "string", "enum": ["standard", "expedited", "overnight"] },
            "cost": { "type": "number", "minimum": 0 },
            "estimatedDelivery": { "type": "string", "format": "date" }
          },
          "required": ["address", "method", "cost"]
        },
        "payment": {
          "type": "object",
          "properties": {
            "method": { "type": "string", "enum": ["credit_card", "debit_card", "paypal", "bank_transfer"] },
            "status": { "type": "string", "enum": ["pending", "authorized", "captured", "failed", "refunded"] },
            "transactionId": { "type": "string" },
            "amount": { "type": "number", "minimum": 0 },
            "currency": { "type": "string", "pattern": "^[A-Z]{3}$" }
          },
          "required": ["method", "status", "amount", "currency"]
        },
        "totals": {
          "type": "object",
          "properties": {
            "subtotal": { "type": "number", "minimum": 0 },
            "tax": { "type": "number", "minimum": 0 },
            "shipping": { "type": "number", "minimum": 0 },
            "discount": { "type": "number", "minimum": 0 },
            "total": { "type": "number", "minimum": 0 }
          },
          "required": ["subtotal", "tax", "shipping", "total"]
        },
        "timestamps": {
          "type": "object",
          "properties": {
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" },
            "shippedAt": { "type": "string", "format": "date-time" },
            "deliveredAt": { "type": "string", "format": "date-time" }
          },
          "required": ["createdAt"]
        }
      },
      "required": ["orderId", "orderNumber", "status", "customer", "items", "shipping", "payment", "totals", "timestamps"]
    }
  },

  // API Responses
  {
    id: 'api-response-paginated',
    name: 'Paginated API Response',
    description: 'Standard paginated API response with metadata',
    category: 'API',
    tags: ['api', 'response', 'pagination', 'rest'],
    complexity: 'medium',
    useCase: 'REST API responses for listing endpoints',
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": "Paginated Response",
      "properties": {
        "data": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "pagination": {
          "type": "object",
          "properties": {
            "page": { "type": "integer", "minimum": 1 },
            "limit": { "type": "integer", "minimum": 1, "maximum": 100 },
            "total": { "type": "integer", "minimum": 0 },
            "totalPages": { "type": "integer", "minimum": 0 },
            "hasNext": { "type": "boolean" },
            "hasPrevious": { "type": "boolean" },
            "nextPage": { "type": "integer", "minimum": 1 },
            "previousPage": { "type": "integer", "minimum": 1 }
          },
          "required": ["page", "limit", "total", "totalPages", "hasNext", "hasPrevious"]
        },
        "meta": {
          "type": "object",
          "properties": {
            "timestamp": { "type": "string", "format": "date-time" },
            "version": { "type": "string" },
            "requestId": { "type": "string", "format": "uuid" }
          }
        },
        "links": {
          "type": "object",
          "properties": {
            "self": { "type": "string", "format": "uri" },
            "first": { "type": "string", "format": "uri" },
            "last": { "type": "string", "format": "uri" },
            "next": { "type": "string", "format": "uri" },
            "previous": { "type": "string", "format": "uri" }
          }
        }
      },
      "required": ["data", "pagination"]
    }
  },

  // Configuration
  {
    id: 'app-config',
    name: 'Application Configuration',
    description: 'Complete application configuration with all settings',
    category: 'Configuration',
    tags: ['config', 'settings', 'application', 'environment'],
    complexity: 'complex',
    useCase: 'Application configuration files and environment settings',
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": "Application Configuration",
      "properties": {
        "app": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
            "environment": { "type": "string", "enum": ["development", "staging", "production"] },
            "debug": { "type": "boolean" },
            "port": { "type": "integer", "minimum": 1000, "maximum": 65535 },
            "host": { "type": "string", "format": "hostname" }
          },
          "required": ["name", "version", "environment"]
        },
        "database": {
          "type": "object",
          "properties": {
            "type": { "type": "string", "enum": ["postgresql", "mysql", "sqlite", "mongodb"] },
            "host": { "type": "string" },
            "port": { "type": "integer", "minimum": 1, "maximum": 65535 },
            "name": { "type": "string" },
            "username": { "type": "string" },
            "password": { "type": "string" },
            "ssl": { "type": "boolean" },
            "pool": {
              "type": "object",
              "properties": {
                "min": { "type": "integer", "minimum": 1 },
                "max": { "type": "integer", "minimum": 1 }
              }
            }
          },
          "required": ["type", "host", "name"]
        },
        "cache": {
          "type": "object",
          "properties": {
            "type": { "type": "string", "enum": ["memory", "redis", "memcached"] },
            "host": { "type": "string" },
            "port": { "type": "integer" },
            "ttl": { "type": "integer", "minimum": 60 },
            "maxSize": { "type": "integer", "minimum": 1 }
          },
          "required": ["type"]
        },
        "logging": {
          "type": "object",
          "properties": {
            "level": { "type": "string", "enum": ["error", "warn", "info", "debug"] },
            "format": { "type": "string", "enum": ["json", "text", "structured"] },
            "destinations": {
              "type": "array",
              "items": { "type": "string", "enum": ["console", "file", "syslog", "elasticsearch"] }
            },
            "file": {
              "type": "object",
              "properties": {
                "path": { "type": "string" },
                "maxSize": { "type": "string" },
                "maxFiles": { "type": "integer", "minimum": 1 }
              }
            }
          },
          "required": ["level", "format"]
        },
        "security": {
          "type": "object",
          "properties": {
            "cors": {
              "type": "object",
              "properties": {
                "enabled": { "type": "boolean" },
                "origins": {
                  "type": "array",
                  "items": { "type": "string", "format": "uri" }
                },
                "methods": {
                  "type": "array",
                  "items": { "type": "string", "enum": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"] }
                }
              }
            },
            "rateLimit": {
              "type": "object",
              "properties": {
                "enabled": { "type": "boolean" },
                "requests": { "type": "integer", "minimum": 1 },
                "window": { "type": "string" }
              }
            },
            "jwt": {
              "type": "object",
              "properties": {
                "secret": { "type": "string" },
                "expiresIn": { "type": "string" },
                "algorithm": { "type": "string", "enum": ["HS256", "HS384", "HS512", "RS256"] }
              }
            }
          }
        },
        "features": {
          "type": "object",
          "properties": {
            "authentication": { "type": "boolean" },
            "authorization": { "type": "boolean" },
            "analytics": { "type": "boolean" },
            "monitoring": { "type": "boolean" },
            "websockets": { "type": "boolean" }
          }
        }
      },
      "required": ["app", "database", "logging"]
    }
  },

  // Financial
  {
    id: 'financial-transaction',
    name: 'Financial Transaction',
    description: 'Complete financial transaction record',
    category: 'Financial',
    tags: ['transaction', 'payment', 'financial', 'money'],
    complexity: 'medium',
    useCase: 'Banking and payment processing systems',
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": "Financial Transaction",
      "properties": {
        "transactionId": { "type": "string", "format": "uuid" },
        "type": { "type": "string", "enum": ["debit", "credit", "transfer", "payment", "refund"] },
        "status": { "type": "string", "enum": ["pending", "completed", "failed", "cancelled", "disputed"] },
        "amount": {
          "type": "object",
          "properties": {
            "value": { "type": "number", "minimum": 0 },
            "currency": { "type": "string", "pattern": "^[A-Z]{3}$" }
          },
          "required": ["value", "currency"]
        },
        "accounts": {
          "type": "object",
          "properties": {
            "from": {
              "type": "object",
              "properties": {
                "accountId": { "type": "string" },
                "accountNumber": { "type": "string" },
                "routingNumber": { "type": "string" },
                "accountType": { "type": "string", "enum": ["checking", "savings", "credit", "investment"] }
              },
              "required": ["accountId"]
            },
            "to": {
              "type": "object",
              "properties": {
                "accountId": { "type": "string" },
                "accountNumber": { "type": "string" },
                "routingNumber": { "type": "string" },
                "accountType": { "type": "string", "enum": ["checking", "savings", "credit", "investment"] }
              },
              "required": ["accountId"]
            }
          }
        },
        "description": { "type": "string", "maxLength": 200 },
        "category": { "type": "string" },
        "merchant": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "id": { "type": "string" },
            "category": { "type": "string" },
            "location": {
              "type": "object",
              "properties": {
                "city": { "type": "string" },
                "state": { "type": "string" },
                "country": { "type": "string" }
              }
            }
          }
        },
        "fees": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "type": "string" },
              "amount": { "type": "number", "minimum": 0 },
              "description": { "type": "string" }
            },
            "required": ["type", "amount"]
          }
        },
        "metadata": {
          "type": "object",
          "properties": {
            "processedAt": { "type": "string", "format": "date-time" },
            "settledAt": { "type": "string", "format": "date-time" },
            "createdAt": { "type": "string", "format": "date-time" },
            "reference": { "type": "string" },
            "authorizationCode": { "type": "string" }
          }
        }
      },
      "required": ["transactionId", "type", "status", "amount", "metadata"]
    }
  },

  // Social Media
  {
    id: 'social-media-post',
    name: 'Social Media Post',
    description: 'Social media post with engagement metrics',
    category: 'Social',
    tags: ['social', 'post', 'engagement', 'media'],
    complexity: 'medium',
    useCase: 'Social media platforms and content management',
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": "Social Media Post",
      "properties": {
        "postId": { "type": "string", "format": "uuid" },
        "author": {
          "type": "object",
          "properties": {
            "userId": { "type": "string", "format": "uuid" },
            "username": { "type": "string" },
            "displayName": { "type": "string" },
            "avatarUrl": { "type": "string", "format": "uri" },
            "verified": { "type": "boolean" }
          },
          "required": ["userId", "username", "displayName"]
        },
        "content": {
          "type": "object",
          "properties": {
            "text": { "type": "string", "maxLength": 280 },
            "hashtags": {
              "type": "array",
              "items": { "type": "string", "pattern": "^#[a-zA-Z0-9_]+$" }
            },
            "mentions": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "userId": { "type": "string", "format": "uuid" },
                  "username": { "type": "string" }
                },
                "required": ["userId", "username"]
              }
            }
          }
        },
        "media": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "type": "string", "enum": ["image", "video", "gif"] },
              "url": { "type": "string", "format": "uri" },
              "thumbnailUrl": { "type": "string", "format": "uri" },
              "altText": { "type": "string" },
              "dimensions": {
                "type": "object",
                "properties": {
                  "width": { "type": "integer", "minimum": 1 },
                  "height": { "type": "integer", "minimum": 1 }
                }
              }
            },
            "required": ["type", "url"]
          }
        },
        "engagement": {
          "type": "object",
          "properties": {
            "likes": { "type": "integer", "minimum": 0 },
            "shares": { "type": "integer", "minimum": 0 },
            "comments": { "type": "integer", "minimum": 0 },
            "views": { "type": "integer", "minimum": 0 },
            "impressions": { "type": "integer", "minimum": 0 }
          }
        },
        "visibility": { "type": "string", "enum": ["public", "private", "friends", "followers"] },
        "location": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "coordinates": {
              "type": "object",
              "properties": {
                "latitude": { "type": "number", "minimum": -90, "maximum": 90 },
                "longitude": { "type": "number", "minimum": -180, "maximum": 180 }
              }
            }
          }
        },
        "timestamps": {
          "type": "object",
          "properties": {
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" },
            "scheduledAt": { "type": "string", "format": "date-time" }
          },
          "required": ["createdAt"]
        }
      },
      "required": ["postId", "author", "content", "engagement", "visibility", "timestamps"]
    }
  }
];

// Helper functions for schema management
export function getSchemasByCategory(category: string): SchemaTemplate[] {
  return schemaTemplates.filter(schema => schema.category === category);
}

export function getSchemasByComplexity(complexity: 'simple' | 'medium' | 'complex'): SchemaTemplate[] {
  return schemaTemplates.filter(schema => schema.complexity === complexity);
}

export function searchSchemas(query: string): SchemaTemplate[] {
  const lowerQuery = query.toLowerCase();
  return schemaTemplates.filter(schema => 
    schema.name.toLowerCase().includes(lowerQuery) ||
    schema.description.toLowerCase().includes(lowerQuery) ||
    schema.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    schema.useCase.toLowerCase().includes(lowerQuery)
  );
}

export function getSchemaById(id: string): SchemaTemplate | undefined {
  return schemaTemplates.find(schema => schema.id === id);
}

export function getAllCategories(): string[] {
  const categories = new Set(schemaTemplates.map(schema => schema.category));
  return Array.from(categories).sort();
}

export function getAllTags(): string[] {
  const tags = new Set(schemaTemplates.flatMap(schema => schema.tags));
  return Array.from(tags).sort();
}