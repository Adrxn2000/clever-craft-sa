import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { CONTENT_TYPES } from "@/lib/content-types";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — ContentCraft" },
      {
        name: "description",
        content:
          "Project overview, prompt library, and case study for the ContentCraft AI content generator built for South African professionals.",
      },
      { property: "og:title", content: "ContentCraft Documentation" },
      {
        property: "og:description",
        content: "Prompt engineering case study and prompt library for ContentCraft.",
      },
    ],
  }),
  component: DocsPage,
});

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card shadow-sm p-6 sm:p-8">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Section {number}
        </span>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="prose prose-slate max-w-none text-sm sm:text-base text-foreground/90 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-primary text-primary-foreground rounded-md p-4 text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap">
      <code>{children}</code>
    </pre>
  );
}

function DocsPage() {
  const exampleOutput = `Most South African founders treat networking as a chore. It shouldn't be.

In the last six months I've watched three early-stage teams in Cape Town raise their first round purely off warm intros from LinkedIn conversations.

The trick wasn't a polished pitch — it was showing up consistently and asking better questions.

If you're building something, the network is already there. You just have to participate.

What's stopping you from posting one comment a day?

#SAStartups #Founders #LinkedInTips`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader showNewGeneration={false} />

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to app
            </Button>
          </Link>
        </div>

        <div className="rounded-xl bg-primary text-primary-foreground p-6 sm:p-10 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-semibold">ContentCraft Documentation</h1>
          <p className="mt-2 text-primary-foreground/80 text-sm sm:text-base">
            Project overview, prompt library, and prompt-engineering case study.
          </p>
        </div>

        <Section number={1} title="Project Overview">
          <p>
            ContentCraft is a prompt-engineered AI content generator built for South African
            professionals. It uses Lovable AI Gateway to generate LinkedIn posts, marketing
            emails, blog intros, product descriptions, and social media captions from simple
            user inputs.
          </p>
          <p>
            Built as a Week 2 individual project for the CAPACITI × Clickatell AI Bootcamp 2026.
          </p>
        </Section>

        <Section number={2} title="Use Case">
          <p>
            <strong>Target users:</strong> marketers, entrepreneurs, students, and professionals
            who need to produce quality content quickly without a copywriter.
          </p>
          <p>
            The tool accepts structured inputs and returns formatted, ready-to-use content in
            seconds — streamed token-by-token for instant feedback.
          </p>
        </Section>

        <Section number={3} title="System Prompts">
          <p>
            Each content type uses a dedicated system prompt that locks in role, format, and
            constraints. The full prompts:
          </p>
          {CONTENT_TYPES.map((t) => (
            <div key={t.id} className="space-y-2">
              <h3 className="font-semibold text-foreground mt-4">{t.label}</h3>
              <CodeBlock>{t.systemPrompt}</CodeBlock>
              <p className="text-sm text-muted-foreground italic">
                Design decision: {t.designNotes}
              </p>
            </div>
          ))}
        </Section>

        <Section number={4} title="Prompt Library">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="border px-3 py-2 font-semibold">Prompt</th>
                  <th className="border px-3 py-2 font-semibold">Role</th>
                  <th className="border px-3 py-2 font-semibold">Context</th>
                  <th className="border px-3 py-2 font-semibold">Constraints</th>
                  <th className="border px-3 py-2 font-semibold">Output Format</th>
                </tr>
              </thead>
              <tbody>
                {CONTENT_TYPES.map((t) => (
                  <tr key={t.id} className="align-top">
                    <td className="border px-3 py-2 font-medium">{t.label}</td>
                    <td className="border px-3 py-2">{t.promptLibrary.role}</td>
                    <td className="border px-3 py-2">{t.promptLibrary.context}</td>
                    <td className="border px-3 py-2">{t.promptLibrary.constraints}</td>
                    <td className="border px-3 py-2">{t.promptLibrary.outputFormat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section number={5} title="Before vs After">
          <h3 className="font-semibold text-foreground">Weak prompt</h3>
          <CodeBlock>{`Write me a LinkedIn post about AI.`}</CodeBlock>
          <p>
            <strong>Problems:</strong> no format, no audience, no length, inconsistent output —
            you'll get generic copy that varies wildly between runs.
          </p>

          <h3 className="font-semibold text-foreground mt-6">Strong prompt</h3>
          <CodeBlock>{CONTENT_TYPES[0].systemPrompt}</CodeBlock>

          <h3 className="font-semibold text-foreground mt-6">Improved output (sample)</h3>
          <div className="rounded-md border bg-secondary/40 p-4 whitespace-pre-wrap text-sm">
            {exampleOutput}
          </div>

          <p className="mt-4 p-4 rounded-md bg-accent/10 border-l-4 border-accent">
            <strong>Key lesson:</strong> specificity in constraints = consistency in output.
            Naming the role, audience, format, and length collapses the model's distribution
            of possible answers into the one you actually want.
          </p>
        </Section>

        <Section number={6} title="Measurable Outcomes">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-secondary text-left">
                <th className="border px-3 py-2 font-semibold">Deliverable</th>
                <th className="border px-3 py-2 font-semibold w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Functional content generation tool",
                "Demonstrated prompt optimisation",
                "Individual project published",
                "Prompt library documented",
                "Case study complete",
              ].map((d) => (
                <tr key={d}>
                  <td className="border px-3 py-2">{d}</td>
                  <td className="border px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-accent font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Done
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section number={7} title="Reflection">
          <p>
            <strong>What was built:</strong> a streaming, multi-template content generator with
            history, copy/regenerate flows, and a documentation page — all on a TanStack Start
            stack with a server route proxying the Lovable AI Gateway.
          </p>
          <p>
            <strong>What was learned:</strong> prompt iteration is mostly about removing
            ambiguity. Each constraint added (word cap, ending question, hashtag count) cut
            output variance noticeably. Format scaffolding in the system prompt is more
            reliable than asking for it in the user message.
          </p>
          <p>
            <strong>What would be improved next:</strong> per-user accounts so history syncs
            across devices, A/B comparison of two prompt variants side-by-side, and
            user-editable prompt templates so power users can tune the voice further.
          </p>
        </Section>

        <div className="text-center pt-4">
          <Link to="/">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to ContentCraft
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
