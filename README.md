# ContentCraft

**Generate professional content in seconds.**

ContentCraft is an AI-powered content generator built for South African professionals — marketers, entrepreneurs, students, and small business owners who need quality content fast. Pick a content type, fill in a few inputs, and get formatted, ready-to-use copy streamed back token-by-token.

Built as a Week 2 individual project for the **CAPACITI × Clickatell AI Bootcamp 2026**.

---

## ✨ Features

- **5 content types** — LinkedIn Post, Marketing Email, Blog Post Intro, Product Description, Social Media Caption
- **Streaming output** — responses appear token-by-token via SSE
- **Prompt-engineered system prompts** — locked-in role, format, length, and tone for consistent output
- **Generation history** — last 5 generations saved locally, click to restore
- **Copy & Regenerate** — one-click copy to clipboard, regenerate with the same inputs
- **Documentation page** — full prompt library, before/after case study, and design notes
- **Responsive** — desktop sidebar layout, mobile single-column with sticky Generate button
- **Clean fintech-style UI** — deep navy header, blue accents, white content area

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start v1 (React 19 + Vite 7) |
| Styling | Tailwind CSS v4 with semantic OKLCH design tokens |
| UI components | shadcn/ui + Radix |
| AI | Lovable AI Gateway → `google/gemini-2.5-pro` |
| Backend | TanStack Start server route (SSE streaming proxy) |
| Hosting | Lovable Cloud (Cloudflare Workers edge runtime) |

---

## 🧠 AI Model

The brief originally requested Anthropic Claude. Lovable AI Gateway does not currently serve Anthropic models, so ContentCraft uses **`google/gemini-2.5-pro`** — the highest-quality long-form reasoning model available through the gateway and the closest equivalent to Claude Sonnet for nuanced copywriting.

No API key setup is required — Lovable Cloud injects `LOVABLE_API_KEY` at runtime.

---

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev
```

Open the preview URL printed in the terminal.

### Environment

Lovable Cloud auto-provisions `LOVABLE_API_KEY` on the server. No `.env` editing is required.

---

## 📁 Project Structure

```
src/
├── routes/
│   ├── __root.tsx          # Shared layout (header)
│   ├── index.tsx           # Generator app (main page)
│   ├── docs.tsx            # Documentation page
│   └── api/
│       └── generate.ts     # SSE streaming proxy → Lovable AI Gateway
├── components/
│   ├── site-header.tsx     # Navy header with nav
│   └── ui/                 # shadcn components
├── lib/
│   └── content-types.ts    # 5 content types: prompts, fields, prompt-library metadata
└── styles.css              # Design tokens (navy/blue palette, fade-in animation)
```

---

## 🎨 Design System

All colors live as semantic OKLCH tokens in `src/styles.css`:

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | Deep navy `#0D2137` | Header, headings |
| `--accent` | Blue `#1D6FA5` | Buttons, links, highlights |
| `--muted` | Soft grey `#F7FAFE` | Section backgrounds |
| `--background` | White | Content area |

Sans-serif system stack throughout. Smooth fade-in animation on generated output.

---

## 📚 Documentation

Visit the in-app **Documentation** page (`/docs`) for:

1. Project overview & use case
2. Full system prompts (all 5 content types) with design notes
3. Prompt library table (Role / Context / Constraints / Output Format)
4. Before vs After case study showing prompt optimisation
5. Measurable outcomes checklist
6. Reflection on what was learned

---

## 🔁 How It Works

1. User picks a content type and fills in the form
2. Frontend POSTs `{ contentType, fields }` to `/api/generate`
3. Server route attaches the type-specific system prompt and proxies to `https://ai.gateway.lovable.dev/v1/chat/completions` with `stream: true`
4. SSE response is piped straight back to the browser
5. Client parses `data:` lines and appends tokens to the output panel as they arrive
6. Result is saved to `localStorage` (capped at 5 entries)

Errors (rate limit `429`, credits exhausted `402`) surface as friendly toast messages.

---

## 📝 License

Built for educational purposes as part of the CAPACITI × Clickatell AI Bootcamp 2026.
