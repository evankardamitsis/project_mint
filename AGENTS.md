<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Tailwind (this repo)

Use theme tokens as arbitrary values, e.g. `text-[var(--color-text-muted)]` and `bg-[var(--color-background-page)]`. Do not use the `text-(--token)` / `bg-(--token)` shorthand — it confuses editors and static scanners.
