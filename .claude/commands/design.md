---
allowed-tools: Write, Read, LS
description: Create a design document based on requirements document
---

# Design Document Generation

You are a software architect tasked with creating a comprehensive design document based on approved feature requirements. Your goal is to transform the requirements into a detailed technical design that serves as a blueprint for implementation.

## Requirements Document

First, read the requirements document from `./spec/requirements.md`:

@spec/requirements.md

## Instructions

Create a design document with the following structure and save it to `./spec/design.md`:

### 1. Overview Section
- Provide a clear, concise summary of what the system/feature does
- Explain the core purpose and value proposition
- Identify the target users and use cases
- Mention key technologies and architectural approaches

### 2. Architecture Section
- Create a high-level architecture diagram using Mermaid syntax
- Include all major components, services, and data flows
- Show external dependencies and integrations
- Specify the technology stack with justifications:
  - Frontend technologies (frameworks, build tools, styling)
  - Backend technologies (runtime, frameworks, databases)
  - Development and deployment tools

### 3. Components and Interfaces Section
- Define core services/modules with their responsibilities
- List key methods for each service with TypeScript-style signatures
- Document REST API endpoints (if applicable) with HTTP methods and paths
- Include middleware stack and request/response flow
- Show integration patterns and communication protocols

### 4. Data Models Section
- Design database schema with SQL CREATE statements
- Define TypeScript interfaces for all data entities
- Show relationships between entities
- Include indexes and constraints for performance and data integrity
- Consider data validation and transformation requirements

### 5. Error Handling Section
- Define error response formats and structures
- Categorize different types of errors (4xx, 5xx)
- Specify error handling strategies and patterns
- Include logging and monitoring considerations

### 6. Testing Strategy Section
- Outline unit testing approach and tools
- Define integration testing requirements
- Plan end-to-end testing scenarios
- Specify test structure and organization
- Include performance and security testing considerations

### 7. Security Considerations Section (if applicable)
- Authentication and authorization mechanisms
- Input validation and sanitization
- Security headers and middleware
- File upload security (if relevant)
- Data protection and privacy measures

## Guidelines

- **Base on Requirements**: Ensure the design addresses all feature requirements
- **Be Comprehensive**: Cover all aspects needed for implementation
- **Be Specific**: Include concrete technologies, patterns, and approaches
- **Be Practical**: Focus on implementable solutions, not theoretical concepts
- **Use Code Examples**: Include TypeScript interfaces, SQL schemas, and API definitions
- **Consider Scale**: Design for the expected usage and growth
- **Think Security**: Include security considerations throughout
- **Plan for Testing**: Make the design testable and maintainable
- **Conduct Research**: Research necessary technologies and approaches during the design process
- **Incorporate Findings**: Include research insights directly in the design document

## Kiro Method Process

- **Read Requirements**: Start by thoroughly understanding the approved requirements
- **Research and Context Building**: Identify areas needing research and build up context
- **Create Comprehensive Design**: Develop detailed design addressing all requirements
- **Iterate for Approval**: Ask "Does the design look good? If so, we can move on to the implementation plan."
- **Refine Based on Feedback**: Make modifications if the user requests changes
- **Get Explicit Approval**: Continue feedback-revision cycle until clear approval is received

## Output Format

Structure your response as a markdown document with clear headings and subheadings. Use code blocks for technical specifications, Mermaid diagrams for architecture, and bullet points for lists. Ensure the document is detailed enough that a development team could use it to implement the feature.

First, ensure the `./spec` directory exists, then create the design document at `./spec/design.md`.