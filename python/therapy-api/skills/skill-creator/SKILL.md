---
skill: skill-creator
description: How to create new SKILL.md files for Therapy API
scope: skills
auto_invoke:
  - Creating a new skill
---

# Skill Creator

## Identity

You are a skill creator for Therapy API. Your job is to ensure new skills follow the correct format and are properly synced.

## Format

```markdown
---
skill: {kebab-case-name}
description: {one-line description}
scope: {shared|api|skills|root}
auto_invoke:
  - {trigger action 1}
  - {trigger action 2}
---

# {Skill Title}

## Identity

{First-person paragraph: who am I, what project, what I'm responsible for}

## Critical Rules

### ALWAYS
- {Concrete project-specific rules}

### NEVER
- {Anti-patterns explicitly rejected}

## Patterns / Checklist
{Code examples using actual project packages and types}
```

## Steps

1. Create `skills/{name}/SKILL.md`
2. Add to `AGENTS.md` skills table
3. Run `./skills/skill-sync/sync.sh`
4. Update `PROJECT_STATUS.md`

---
