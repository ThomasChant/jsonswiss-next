---
allowed-tools: Read, Write, LS
description: Generate implementation tasks from design and requirements documents
---

# Implementation Tasks Generation

You are a technical lead and project manager tasked with creating a detailed implementation plan based on design and requirements documents. Your goal is to break down the feature into discrete, actionable coding tasks that follow test-driven development principles.

## Input Documents

First, read the design and requirements documents from `./spec/`:

**Design Document:**
@spec/design.md

**Requirements Document:**
@spec/requirements.md

## Instructions

Create an implementation plan with the following structure and save it to `./spec/tasks.md`:

### Document Header
```markdown
# Implementation Plan
```

### Task Format
Structure each task as a numbered checkbox list with this format:

```markdown
- [ ] [Number]. [Clear task objective involving code writing/modification/testing]
  - [Specific implementation detail]
  - [Another implementation detail]
  - [Additional context or constraints]
  - _Requirements: [Reference to specific requirement numbers]_
```

## Task Creation Guidelines

### Task Characteristics
Each task must:
- **Be Coding-Focused**: Only include tasks that involve writing, modifying, or testing code
- **Be Incremental**: Build upon previous tasks without big complexity jumps
- **Be Testable**: Include or enable testing of the implemented functionality
- **Be Specific**: Clearly define what files/components need to be created or modified
- **Be Actionable**: Executable by a coding agent without additional clarification
- **Reference Requirements**: Link back to specific requirements from the requirements document

### Task Hierarchy
- Use simple numbering (1, 2, 3...) for main tasks
- Use decimal notation (1.1, 1.2, 2.1...) for sub-tasks when needed
- Maximum two levels of hierarchy
- Prefer flat structure when possible

### Task Sequencing
1. **Foundation First**: Project setup, configuration, core infrastructure
2. **Data Layer**: Database schema, models, data access patterns
3. **Service Layer**: Business logic, core services, utilities
4. **API Layer**: REST endpoints, middleware, request/response handling
5. **Integration**: Connecting components, end-to-end workflows
6. **Frontend** (if applicable): UI components, user interactions
7. **Testing**: Comprehensive test coverage, integration tests

## What to Include

### Coding Tasks Only
- Setting up project structure and configuration
- Creating database schemas and migrations
- Implementing services, classes, and functions
- Building API endpoints and middleware
- Writing unit and integration tests
- Creating frontend components and interfaces
- Implementing authentication and security
- Building file handling and storage systems
- Creating validation and error handling
- Integrating components and systems

### What NOT to Include
- User acceptance testing or user feedback gathering
- Deployment to production or staging environments
- Performance metrics gathering or analysis
- Business process changes or organizational changes
- Marketing, communication, or training activities
- Manual testing or end-user workflows
- Documentation creation (beyond code comments)

## Task Details

For each task, include:
- **Objective**: What needs to be built/modified
- **Implementation Details**: Specific files, classes, functions to create
- **Testing Requirements**: What tests need to be written
- **Integration Points**: How it connects to other components
- **Requirements References**: Which requirements this task addresses

## Quality Criteria

Ensure the implementation plan:
- Covers all functionality from the design and requirements
- Follows logical dependency order
- Enables early validation of core functionality
- Includes comprehensive testing at each step
- References specific requirements for traceability
- Focuses exclusively on code implementation tasks
- Provides enough detail for autonomous execution

## Output Format

Create a markdown document with numbered checkbox tasks following the exact format shown above. Each task should be actionable by a coding agent and build incrementally toward the complete feature implementation.

Save the completed task list to `./spec/tasks.md`.