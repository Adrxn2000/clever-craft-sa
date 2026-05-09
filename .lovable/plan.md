## ContentCraft — AI Content Generator

A South African–focused AI content generator with 5 content types, streaming output, history, and a documentation page.

### AI Model
Lovable AI Gateway (no API key needed) using `google/gemini-2.5-pro` — strongest quality option, closest equivalent to Claude Sonnet for nuanced copywriting. Streamed via SSE through a TanStack Start server function. Lovable Cloud will be enabled to provide the gateway key.

### Design System
Tokens added to `src/styles.css` (oklch equivalents):
- `--background` white, `--muted` #F7FAFE, `--primary` deep navy #0D2137, `--accent` blue #1D6FA5
- Sans-serif system stack, generous spacing, subtle shadows, rounded-lg
- Smooth fade-in keyframe for generated output

### Routes
```
src/routes/
  __root.tsx        # shared header (navy bar, app name, tagline, New Generation, Documentation link)
  index.tsx         # generator app
  docs.tsx          # documentation page
```

### Layout (index)
- Fixed navy header (app name "ContentCraft", tagline, New Generation button, Docs link)
- Desktop: 260px left sidebar (content type list + dynamic input form) + main output area
- Mobile (<768px): sidebar collapses into a top accordion panel; sticky Generate button at bottom
- Output panel: empty state icon + prompt; on generation shows content type, timestamp, streamed text with fade-in, character count, Copy + Regenerate buttons
- Collapsible history panel below output: last 5 generations (type, 60-char preview, timestamp); click restores

### Content Types & Forms
Config-driven array of 5 types, each with its own field schema and system prompt (the exact prompts from the brief):
1. LinkedIn Post — topic, tone (select), audience
2. Marketing Email — product/service, audience, CTA
3. Blog Post Intro — topic, target reader, style (select)
4. Product Description — product name, 3 feature inputs, target customer
5. Social Media Caption — platform (select), topic, mood

Each input has placeholder example text and a clear/reset button. Default selection: LinkedIn Post.

### Server Function (streaming)
`src/lib/generate.functions.ts` — `createServerFn` POST that accepts `{ contentType, fields }`, builds the user message from fields, attaches the type-specific system prompt, and calls `https://ai.gateway.lovable.dev/v1/chat/completions` with `model: google/gemini-2.5-pro`, `max_tokens: 1024`, `stream: true`. Returns the SSE stream directly. Handles 429 / 402 with friendly messages.

Frontend parses SSE line-by-line and appends tokens to the output state for true token-by-token rendering.

### History
Stored in `localStorage` (key `contentcraft.history`), capped at 5. Restored on mount.

### /docs page
Same header. Sections:
1. Project Overview
2. Use Case
3. System Prompts — all 5 in styled `<pre>` code blocks with design notes
4. Prompt Library — table (Prompt | Role | Context | Constraints | Output Format) × 5 rows
5. Before vs After case study (weak prompt, problems, strong prompt, improved output sample, key lesson)
6. Measurable Outcomes — checklist table of Week 2 deliverables
7. Reflection
Back-to-app button.

### Technical Notes
- Enable Lovable Cloud (provides `LOVABLE_API_KEY` env var on the server)
- Server function reads `process.env.LOVABLE_API_KEY` inside `.handler()`
- Streaming uses `fetch` with `ReadableStream` parsing on client; AbortController for Regenerate / New Generation
- Toast (sonner) for "Copied!" confirmation and API errors
- All colors via semantic tokens — no hardcoded hex in components
