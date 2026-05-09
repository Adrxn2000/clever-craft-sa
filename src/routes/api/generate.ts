import { createFileRoute } from "@tanstack/react-router";
import { CONTENT_TYPES, getContentType, buildUserMessage } from "@/lib/content-types";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { contentType, fields } = (await request.json()) as {
            contentType: string;
            fields: Record<string, string>;
          };

          if (!CONTENT_TYPES.find((c) => c.id === contentType)) {
            return new Response(JSON.stringify({ error: "Invalid content type" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!LOVABLE_API_KEY) {
            return new Response(
              JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          const type = getContentType(contentType);
          const userMessage = buildUserMessage(contentType, fields ?? {});

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-pro",
                max_tokens: 1024,
                stream: true,
                messages: [
                  { role: "system", content: type.systemPrompt },
                  { role: "user", content: userMessage },
                ],
              }),
            },
          );

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({
                  error:
                    "AI credits exhausted. Add funds in Lovable workspace settings to continue.",
                }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            const text = await upstream.text();
            console.error("AI gateway error:", upstream.status, text);
            return new Response(
              JSON.stringify({ error: `AI gateway error (${upstream.status})` }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (err) {
          console.error("generate route error:", err);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
