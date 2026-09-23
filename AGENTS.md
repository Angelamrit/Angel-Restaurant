<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Speed and software quality

Speed is the highest design priority. Follow [SQA.md](./SQA.md) for budgets and verification. Prefer native HTML, CSS and browser APIs; keep client components small and dependencies justified by measured benefit. Decorative motion must never delay content, require continuous idle JavaScript, or trigger unsolicited video downloads. Preserve accessibility, security, data correctness and responsive behavior while optimizing. Do not claim performance targets are met without production measurements.
