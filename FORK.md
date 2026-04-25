# Plannotator Pi Extension Fork

This is a fork of the [plannotator](https://github.com/backnotprop/plannotator) project with modifications to allow the Pi agent to programmatically enter planning mode.

## Key Changes

### 1. New `enter_plan_mode` Tool

Added a new tool that allows the agent to enter planning mode without requiring the user to manually run `/plannotator`.

**Tool signature:**
```typescript
enter_plan_mode({
  planFilePath: string,      // Path to the plan file (e.g., "plans/feature.md")
  createIfMissing?: boolean  // Create skeleton plan if doesn't exist (default: true)
})
```

**Features:**
- Transitions the extension to planning phase
- Creates parent directories if needed
- Generates a skeleton plan file with helpful sections (Context, Approach, Files to Modify, Reuse, Steps, Verification)
- Populates checklist items from existing plan content
- Persists state for session resumption

### 2. Files Modified

- `apps/pi-extension/index.ts` - Added `enter_plan_mode` tool registration and imported necessary functions
- `apps/pi-extension/tool-scope.ts` - Added `ENTER_PLAN_MODE_TOOL` constant and updated tool filtering
- `apps/pi-extension/README.md` - Documented the new programmatic plan mode feature

### 3. Usage

The agent can now initiate planning mode itself:

```
// Agent detects a complex task and enters planning mode
enter_plan_mode({ planFilePath: "plans/auth-refactor.md" })

// Agent explores codebase and writes plan...

// Agent submits plan for review
plannotator_submit_plan({ filePath: "plans/auth-refactor.md" })
```

## Original Project

- **Repository:** https://github.com/backnotprop/plannotator
- **Author:** backnotprop
- **License:** MIT OR Apache-2.0

## Installation

### From this fork:

```bash
# Clone the fork
git clone <fork-url> plannotator-fork
cd plannotator-fork

# Build the HTML assets
bun install
bun run build:pi

# Install in Pi
pi install ./apps/pi-extension
```

## Why This Fork?

The original plannotator requires users to manually run `/plannotator` to enter planning mode. This fork enables agents to be more autonomous by allowing them to:

1. Detect when a task requires planning
2. Enter planning mode programmatically
3. Create and manage plan files without user intervention
4. Maintain the same review/approval flow once planning is complete

This is particularly useful for:
- Complex multi-file changes
- Refactoring tasks
- Feature implementations that need architectural decisions
- Any task where the agent determines planning would be beneficial
