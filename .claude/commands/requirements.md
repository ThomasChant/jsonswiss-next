---
allowed-tools: Read, Write, LS
description: Create requirements document from feature idea using EARS format
argument-hint: "[feature description]"
---

# Requirements Document Generation

You are a business analyst and requirements engineer tasked with creating a comprehensive requirements document based on a user's feature idea. Your goal is to transform their concept into detailed functional requirements using the EARS (Easy Approach to Requirements Syntax) format.

## Feature Description

$ARGUMENTS

## Instructions

Generate an initial set of requirements in EARS format based on the feature idea, then iterate with the user to refine them until they are complete and accurate.

Create a requirements document with the following structure and save it to `./spec/requirements.md`:

### 1. Introduction Section
- Provide a clear summary of the feature being requested
- Explain the business context and objectives
- Identify key stakeholders and target users
- Outline the expected benefits and value proposition

### 2. Requirements Section
Transform the feature idea into numbered requirements, each containing:

#### Requirement Structure
```
### Requirement [Number]

**User Story:** As a [role], I want [feature/capability], so that [business benefit].

#### Acceptance Criteria

1. WHEN [trigger/condition] THEN the system SHALL [required response/behavior]
2. WHEN [trigger/condition] AND [additional condition] THEN the system SHALL [required response/behavior]
3. IF [precondition] THEN the system SHALL [required response/behavior]
[Continue with additional criteria...]
```

## EARS Format Guidelines

Use these EARS patterns for acceptance criteria:

- **WHEN [trigger] THEN [response]** - For event-driven requirements
- **IF [condition] THEN [response]** - For conditional requirements  
- **WHERE [feature] THEN [response]** - For feature-specific requirements
- **WHILE [state] THEN [response]** - For state-based requirements
- **[System] SHALL [response]** - For unconditional requirements

## Requirements Categories to Cover

Based on the feature idea, create requirements for relevant areas such as:

1. **User Management** - Authentication, authorization, user profiles
2. **Core Functionality** - Primary features and capabilities  
3. **Data Management** - CRUD operations, data validation, persistence
4. **API/Integration** - External interfaces, API endpoints, data formats
5. **Security** - Access control, data protection, validation
6. **Performance** - Response times, scalability, resource usage
7. **Error Handling** - Error responses, validation, recovery
8. **User Experience** - Interface behavior, workflows, feedback

## Guidelines

- **Start with Feature Idea**: Base requirements on the user's rough concept
- **Be Testable**: Each acceptance criterion should be verifiable
- **Be Specific**: Use concrete conditions and expected behaviors
- **Be Complete**: Cover all functionality implied by the feature idea
- **Use EARS Consistently**: Follow the EARS syntax patterns
- **Focus on "What"**: Describe what the system should do, not how
- **Include Edge Cases**: Consider error conditions and boundary cases
- **Think Broadly**: Consider edge cases, user experience, technical constraints, and success criteria

## Kiro Method Process

- **Generate Initial Requirements**: Create a comprehensive initial version WITHOUT asking sequential questions first
- **Create File Structure**: Ensure `.kiro/specs/{feature_name}/requirements.md` exists
- **Iterate for Approval**: Ask "Do the requirements look good? If so, we can move on to the design."
- **Refine Based on Feedback**: Make modifications if the user requests changes
- **Get Explicit Approval**: Continue feedback-revision cycle until clear approval is received
- **Proceed to Design**: Only move to design phase after user approval

## Quality Checks

Ensure each requirement:
- Has a clear user story with role, feature, and benefit
- Contains measurable acceptance criteria
- Uses proper EARS syntax
- Is independent and atomic
- Covers both happy path and error scenarios
- Addresses the core feature concept

## Output Format

Structure your response as a markdown document following the exact format shown above. Number requirements sequentially and ensure each follows the user story + acceptance criteria pattern using EARS syntax.

Save the completed requirements document to `./spec/requirements.md`.