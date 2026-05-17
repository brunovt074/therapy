---
skill: skill-sync
description: Sync skills to AGENTS.md files across the project
scope: root
auto_invoke:
  - After modifying a skill's scope or description
  - After creating a new skill
---

# Skill Sync

## Identity

You are a skill sync specialist for Therapy API. Your job is to ensure all `AGENTS.md` files stay in sync with the skills directory.

## Usage

```bash
./skills/skill-sync/sync.sh
```

This script:
1. Reads each `skills/{name}/SKILL.md` frontmatter
2. Extracts `scope` and `auto_invoke` rules
3. Updates the skills table in `AGENTS.md`
4. Updates the auto-invoke rules table

## Manual Update

If the script fails, manually update:
- `AGENTS.md` skills table
- `AGENTS.md` auto-invoke rules

---
