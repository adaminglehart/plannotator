---
title: "Hook Integration"
description: "Wire Plannotator into Claude Code and Codex hooks for human-in-the-loop review gates on spec artifacts, code output, and agent turns."
sidebar:
  order: 27
section: "Guides"
---

Plannotator can run as a hook command inside Claude Code and Codex. The agent writes a file or finishes a turn, the hook fires, and Plannotator opens a review UI in the browser. The reviewer approves, sends annotations, or dismisses. The hook blocks until a decision is made, then returns the result to the agent in the hook protocol's native format.

One flag does everything:

```
plannotator annotate "$CLAUDE_TOOL_INPUT_file_path" --hook
```

`--hook` implies `--gate` (three-button UX) and emits hook-native JSON. Approve and Close produce empty stdout (hook passes). Send Annotations produces `{"decision":"block","reason":"<feedback>"}` (hook blocks with feedback). Works with both Claude Code and Codex hook protocols.

## How hooks see Plannotator

Agent hooks communicate via stdout and exit codes. Plannotator always exits `0`. The decision lives in stdout:

| Decision | Stdout | Hook behavior |
|---|---|---|
| Approve | empty | passes, agent proceeds |
| Close | empty | passes, agent proceeds |
| Send Annotations | `{"decision":"block","reason":"<feedback>"}` | blocks, feedback shown to agent |

The `{"decision":"block","reason":"..."}` format is the native protocol for both [Claude Code hooks](https://code.claude.com/docs/en/hooks) and [Codex hooks](https://developers.openai.com/codex/hooks). No wrapper script needed.

## Environment variables in hooks

When a hook fires, the agent exposes tool inputs as environment variables. The most common one for Plannotator:

- **`$CLAUDE_TOOL_INPUT_file_path`** -- the file path the agent passed to the Write/Edit tool. Use this to tell Plannotator which file to annotate.

Other useful variables: `$CLAUDE_TOOL_INPUT_command` (Bash), `$CLAUDE_PROJECT_DIR` (project root). See your agent's hook documentation for the full list.

## Recipe 1: Review every file the agent writes

A PostToolUse hook on Write triggers Plannotator every time the agent creates or modifies a file. This is the core pattern for spec-driven frameworks (spec-kit, kiro, openspec) where each artifact needs human review before the agent builds from it.

Add to `.claude/hooks.json` (or the equivalent for your agent):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "plannotator annotate \"$CLAUDE_TOOL_INPUT_file_path\" --hook",
            "timeout": 345600
          }
        ]
      }
    ]
  }
}
```

The `timeout` is 4 days in seconds. The hook blocks while the reviewer works in the browser, so set it high.

What happens:

1. Agent writes `spec.md`.
2. PostToolUse hook fires, opens Plannotator in the browser.
3. Reviewer reads the spec, adds inline annotations, clicks **Send Annotations**.
4. Hook emits `{"decision":"block","reason":"<feedback>"}`. Agent sees the feedback and revises.
5. Or reviewer clicks **Approve**. Hook emits nothing. Agent proceeds to the next task.

## Recipe 2: Review every agent turn

A Stop hook pauses the agent after every response for human review. Use `annotate-last` to open the agent's last message in Plannotator.

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "plannotator annotate-last --hook",
            "timeout": 345600
          }
        ]
      }
    ]
  }
}
```

- **Send Annotations** prevents the agent from stopping and re-prompts with feedback.
- **Approve** or **Close** lets the turn end normally.

## Combining both

You can use PostToolUse and Stop hooks together. The PostToolUse hook gates individual file writes. The Stop hook gates the overall turn. The agent gets targeted file feedback during execution and a final review at the end.

## Alternative modes

`--hook` is the recommended approach for hook integrations. Two other modes exist for different use cases:

### `--gate` (plaintext)

Three-button UX without hook-native JSON. Approve emits the line `The user approved.`, Close emits nothing, Send Annotations emits plaintext feedback. Useful for slash command templates where the agent reads stdout directly.

### `--json` (structured decisions)

Emits `{"decision":"approved|annotated|dismissed","feedback":"..."}` for every decision. Useful for wrapper scripts that want to parse the decision type for logging, telemetry, or conditional routing. Pair with `--gate` for all three decisions.

See [Annotate Flags](/docs/commands/annotate/#flags) for the full stdout matrix.

## OpenCode and Pi

The same flags work in OpenCode's `/plannotator-annotate` and Pi's `/plannotator-annotate`:

```
/plannotator-annotate spec.md --gate
```

These harnesses don't use stdout for signaling -- the plugin writes directly to the session. Approve and Close skip injection; Send Annotations injects the feedback. `--hook` and `--json` are accepted silently so recipes stay portable across harnesses.

## Notes

- Exit code is always `0`. Decisions are signaled via stdout.
- Folder annotation with `--hook` applies one decision to the whole session. The reviewer navigates files inside the UI and submits once.
- `--hook` and `--gate` are opt-in. Interactive users running `/plannotator-annotate README.md` still see the default two-button experience.
