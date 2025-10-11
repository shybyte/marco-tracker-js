# Project Agents.md Guide for OpenAI Codex

This Agents.md file provides comprehensive guidance for OpenAI Codex and other AI agents working with this codebase.

## Project Structure for OpenAI Codex Navigation

- `/src`: Source code that OpenAI Codex should analyze

## Coding Conventions for OpenAI Codex

- Prefer named functions over assigning an arrow function directly to a const variable

## Typechecking and Linting for OpenAI Codex

OpenAI Codex should verify whether the code compiles via:

```bash
bun run typecheck
```

OpenAI Codex should verify whether the code is linted correctly via:

```bash
bun run lint
```
