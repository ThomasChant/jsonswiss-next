---
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Glob, Grep, LS, TodoWrite, NotebookRead, NotebookEdit
description: Execute a specific task from the task list and mark it as complete
argument-hint: "[task number or description]"
---

## Input Documents

First, read the design and requirements documents from `./spec/`:

**Design Document:**
@spec/design.md

**Requirements Document:**
@spec/requirements.md

# Task Execution

You are a coding agent tasked with executing a specific task from the implementation plan and marking it as complete when finished.

## Task to Execute

Task: $ARGUMENTS

## Current Task List

First, read the current task list from `./spec/tasks.md`:

@spec/tasks.md

## Instructions

1. **Identify the Task**: Find the specific task number or description that matches the user's request
2. **Execute the Task**: Implement the task according to its specifications, including:
   - Creating or modifying the specified files
   - Writing necessary code
   - Adding tests if required
   - Following the implementation details provided
3. **Mark as Complete**: Update the task list by changing the `[ ]` to `[x]` for the completed task
4. **Verify Implementation**: Ensure the task is fully implemented and working

## Task Execution Guidelines

- **Follow the Task Details**: Implement exactly what's specified in the task
- **Write Quality Code**: Follow best practices and coding standards
- **Include Tests**: Write tests if the task specifies testing requirements
- **Handle Dependencies**: Ensure prerequisite tasks are completed first
- **Reference Requirements**: Keep the linked requirements in mind during implementation
- **Be Thorough**: Don't leave the task partially implemented

## Completion Criteria

A task is considered complete when:
- All code specified in the task is written and functional
- Required tests are implemented and passing
- The implementation meets the acceptance criteria from related requirements
- No errors or warnings are present
- The task checkbox is marked as complete in the task list

## Output Format

1. Confirm which task you're executing
2. Implement the task step by step
3. Update the task list to mark the task as complete
4. Provide a brief summary of what was accomplished

## Error Handling

If you encounter issues:
- Clearly state what went wrong
- Provide suggestions for resolution
- Do not mark the task as complete if it's not fully functional
- Update the task list with any necessary modifications or additional context