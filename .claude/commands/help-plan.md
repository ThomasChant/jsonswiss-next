---
description: Show the complete project planning workflow using custom slash commands
---

# The Kiro Method

The Kiro Method is a systematic approach to transforming feature ideas into production-ready code through spec-driven development. This workflow bridges the gap between creative "vibe coding" and structured software engineering by generating detailed specifications that guide implementation.

## Philosophy

Inspired by [Kiro's vision](https://kiro.dev/blog/introducing-kiro/), this method focuses on:
- **Spec-Driven Development**: Creating detailed artifacts that guide development
- **Systematic Planning**: Breaking down complex features into manageable tasks
- **Production Readiness**: Ensuring code quality from concept to implementation
- **Human-AI Collaboration**: Leveraging AI to enhance structured development processes

## Available Planning Commands

### `/requirements [feature description]`
Creates a requirements document in `./spec/requirements.md` using EARS format based on your feature idea.

**What it creates:**
- Numbered requirements with user stories
- Acceptance criteria using EARS syntax
- Complete functional requirements coverage
- Testable and verifiable specifications

**Example:**
```
/requirements "user authentication system with JWT tokens"
```

### `/design`
Creates a comprehensive design document in `./spec/design.md` based on approved requirements.

**What it creates:**
- Overview and architecture sections
- Component and interface specifications  
- Data models and database schemas
- Error handling and testing strategies
- Security considerations

**Prerequisites:** Must have `./spec/requirements.md` from `/requirements` command

### `/tasks`
Creates an implementation task list in `./spec/tasks.md` from design and requirements documents.

**What it creates:**
- Numbered checkbox tasks for implementation
- Coding-focused, actionable items
- Logical dependency ordering
- Requirements traceability

**Prerequisites:** Must have both `./spec/requirements.md` and `./spec/design.md`

### `/execute-task [task number/description]`
Executes a specific task from the task list and marks it complete.

**What it does:**
- Finds and executes the specified task
- Writes code, creates files, runs tests
- Marks the task as complete in the task list
- Provides implementation summary

**Prerequisites:** Must have `./spec/tasks.md` from `/tasks` command

## The Kiro Method Workflow

### Phase 1: Planning
```bash
# 1. Start with your feature idea
/requirements "real-time chat application with rooms and user presence"

# 2. Generate technical design from requirements
/design

# 3. Create implementation tasks from design and requirements
/tasks
```

### Phase 2: Implementation
```bash
# 4. Execute tasks sequentially
/execute-task 1
/execute-task 2
/execute-task 3
# ... continue until all tasks are complete
```

## Tips for Success

- **Be Specific**: Provide detailed feature descriptions in `/requirements`
- **Review Documents**: Check generated documents before proceeding to next phase
- **Follow Order**: Complete phases in sequence (requirements → design → tasks → implementation)
- **Check Prerequisites**: Ensure previous steps are completed
- **Track Progress**: Use task checkboxes to monitor implementation

## File Structure

After running the workflow, you'll have:
```
./spec/
├── requirements.md  # Formal requirements with EARS format (Phase 1)
├── design.md        # Technical architecture and specifications (Phase 2)
└── tasks.md        # Implementation checklist (Phase 3)
```

## Getting Started

1. Think of a feature you want to implement
2. Run `/requirements "your feature description"`
3. Follow the workflow phases above
4. Execute tasks one by one until complete

The Kiro Method transforms vague ideas into production-ready code through systematic specification and implementation, ensuring both creativity and engineering rigor.