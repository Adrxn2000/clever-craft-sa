import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  RotateCcw,
  Sparkles,
  Wand2,
  History as HistoryIcon,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTENT_TYPES, getContentType } from "@/lib/content-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ContentCraft — AI Content Generator" },
      {
        name: "description",
        content:
          "Generate LinkedIn posts, marketing emails, blog intros, product descriptions, and social captions for South African audiences.",
      },
    ],
  }),
  component: ContentCraftApp,
});

interface HistoryItem {
  id: string;
  contentTypeId: string;
  contentTypeLabel: string;
  fields: Record<string, string>;
  output: string;
  timestamp: number;
}

const HISTORY_KEY = "contentcraft.history.v1";

function emptyFieldsFor(typeId: string): Record<string, string> {
  const t = getContentType(typeId);
  return Object.fromEntries(t.fields.map((f) => [f.name, ""]));
}

function ContentCraftApp() {
  const [selectedType, setSelectedType] = useState<string>("linkedin");
  const [fields, setFields] = useState<Record<string, string>>(() => emptyFieldsFor("linkedin"));
  const [output, setOutput] = useState<string>("");
  const [outputType, setOutputType] = useState<string>("");
  const [outputTimestamp, setOutputTimestamp] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastInputs = useRef<{ typeId: string; fields: Record<string, string> } | null>(null);

  const currentType = useMemo(() => getContentType(selectedType), [selectedType]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const persistHistory = (items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  };

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    setFields(emptyFieldsFor(id));
    setSidebarOpen(false);
  };

  const updateField = (name: string, value: string) =>
    setFields((prev) => ({ ...prev, [name]: value }));

  const clearField = (name: string) =>
    setFields((prev) => ({ ...prev, [name]: "" }));

  const handleNewGeneration = () => {
    abortRef.current?.abort();
    setSelectedType("linkedin");
    setFields(emptyFieldsFor("linkedin"));
    setOutput("");
    setOutputType("");
    setOutputTimestamp(null);
    setIsGenerating(false);
  };

  const runGeneration = async (typeId: string, inputs: Record<string, string>) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    lastInputs.current = { typeId, fields: inputs };

    setIsGenerating(true);
    setOutput("");
    setOutputType(getContentType(typeId).label);
    setOutputTimestamp(Date.now());

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: typeId, fields: inputs }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        let msg = `Request failed (${resp.status})`;
        try {
          const j = await resp.json();
          msg = j.error || msg;
        } catch {
          /* ignore */
        }
        toast.error(msg);
        setIsGenerating(false);
        return;
      }

      if (!resp.body) {
        toast.error("No response stream");
        setIsGenerating(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assembled = "";
      let done = false;

      while (!done) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assembled += delta;
              setOutput(assembled);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save to history (cap 5)
      if (assembled.trim()) {
        const newItem: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          contentTypeId: typeId,
          contentTypeLabel: getContentType(typeId).label,
          fields: inputs,
          output: assembled,
          timestamp: Date.now(),
        };
        persistHistory([newItem, ...history].slice(0, 5));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(err);
        toast.error("Something went wrong while generating content.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    const missing = currentType.fields.find((f) => !fields[f.name]?.trim());
    if (missing) {
      toast.error(`Please fill in ${missing.label}`);
      return;
    }
    runGeneration(selectedType, { ...fields });
  };

  const handleRegenerate = () => {
    if (!lastInputs.current) return;
    runGeneration(lastInputs.current.typeId, { ...lastInputs.current.fields });
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied!", { duration: 2000 });
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const restoreHistory = (item: HistoryItem) => {
    setSelectedType(item.contentTypeId);
    setFields({ ...emptyFieldsFor(item.contentTypeId), ...item.fields });
    setOutput(item.output);
    setOutputType(item.contentTypeLabel);
    setOutputTimestamp(item.timestamp);
    lastInputs.current = { typeId: item.contentTypeId, fields: item.fields };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader onNewGeneration={handleNewGeneration} />

      <div className="flex-1 w-full">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row">
          {/* Mobile sidebar toggle */}
          <div className="md:hidden border-b bg-secondary px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Content type</div>
              <div className="text-sm font-semibold text-foreground">{currentType.label}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? "Close" : "Edit inputs"}
            </Button>
          </div>

          {/* Sidebar */}
          <aside
            className={`${sidebarOpen ? "block" : "hidden"} md:block w-full md:w-[260px] md:shrink-0 border-b md:border-b-0 md:border-r bg-secondary md:min-h-[calc(100vh-4rem)]`}
          >
            <div className="p-4 space-y-5">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Content Type
                </h2>
                <div className="space-y-1">
                  {CONTENT_TYPES.map((t) => {
                    const active = t.id === selectedType;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectType(t.id)}
                        className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                          active
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-foreground hover:bg-background"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Inputs
                </h2>
                <div className="space-y-3">
                  {currentType.fields.map((f) => (
                    <div key={f.name} className="space-y-1.5">
                      <Label htmlFor={f.name} className="text-xs font-medium">
                        {f.label}
                      </Label>
                      {f.type === "select" && f.options ? (
                        <Select
                          value={fields[f.name] || ""}
                          onValueChange={(v) => updateField(f.name, v)}
                        >
                          <SelectTrigger id={f.name} className="bg-background">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                          <SelectContent>
                            {f.options.map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : f.type === "textarea" ? (
                        <Textarea
                          id={f.name}
                          value={fields[f.name] || ""}
                          onChange={(e) => updateField(f.name, e.target.value)}
                          placeholder={f.placeholder}
                          className="bg-background"
                          rows={3}
                        />
                      ) : (
                        <div className="relative">
                          <Input
                            id={f.name}
                            value={fields[f.name] || ""}
                            onChange={(e) => updateField(f.name, e.target.value)}
                            placeholder={f.placeholder}
                            className="bg-background pr-8"
                          />
                          {fields[f.name] && (
                            <button
                              type="button"
                              onClick={() => clearField(f.name)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={`Clear ${f.label}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 hidden md:inline-flex"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 space-y-4">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 bg-secondary/50">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Output
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">
                    {outputType || currentType.label}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {outputTimestamp && (
                    <span className="hidden sm:inline text-xs text-muted-foreground">
                      {new Date(outputTimestamp).toLocaleTimeString()}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    disabled={!output}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={isGenerating || !lastInputs.current}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="p-4 sm:p-6 min-h-[320px]">
                {!output && !isGenerating && (
                  <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Sparkles className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-sm max-w-xs">
                      Fill in the form and click Generate to create your content.
                    </p>
                  </div>
                )}

                {output && (
                  <div className="cc-fade-in">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                      {output}
                    </pre>
                  </div>
                )}

                {isGenerating && (
                  <div className="mt-3 inline-flex items-center text-accent">
                    <span className="cc-typing-dot" />
                    <span className="cc-typing-dot" />
                    <span className="cc-typing-dot" />
                  </div>
                )}
              </div>

              {output && (
                <div className="border-t px-4 sm:px-6 py-2 text-xs text-muted-foreground bg-secondary/30">
                  {output.length.toLocaleString()} characters
                </div>
              )}
            </div>

            {/* History */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <HistoryIcon className="h-4 w-4 text-accent" />
                  History
                  <span className="text-xs font-normal text-muted-foreground">
                    ({history.length}/5)
                  </span>
                </div>
                {historyOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {historyOpen && (
                <div className="divide-y">
                  {history.length === 0 && (
                    <div className="px-4 sm:px-6 py-6 text-sm text-muted-foreground text-center">
                      No generations yet.
                    </div>
                  )}
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => restoreHistory(item)}
                      className="w-full text-left px-4 sm:px-6 py-3 hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-xs font-semibold text-accent">
                          {item.contentTypeLabel}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground truncate">
                        {item.output.slice(0, 60)}
                        {item.output.length > 60 ? "…" : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile docs link */}
            <div className="md:hidden text-center">
              <a
                href="/docs"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <FileText className="h-4 w-4" /> Documentation
              </a>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sticky generate button */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background p-3 shadow-lg">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
