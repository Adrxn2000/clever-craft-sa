export type FieldType = "text" | "textarea" | "select";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
}

export interface ContentTypeDef {
  id: string;
  label: string;
  systemPrompt: string;
  fields: FieldDef[];
  designNotes: string;
  promptLibrary: {
    role: string;
    context: string;
    constraints: string;
    outputFormat: string;
  };
}

export const CONTENT_TYPES: ContentTypeDef[] = [
  {
    id: "linkedin",
    label: "LinkedIn Post",
    systemPrompt:
      "You are a professional LinkedIn content writer for South African professionals. Write a LinkedIn post based on the topic, tone, and audience provided. Format: Hook sentence → 3 short paragraphs → 3 relevant hashtags. Max 150 words. No corporate jargon. End with an engagement question.",
    fields: [
      { name: "topic", label: "Topic", type: "text", placeholder: "e.g. Why SA fintech is booming" },
      {
        name: "tone",
        label: "Tone",
        type: "select",
        options: ["Professional", "Casual", "Motivational"],
      },
      { name: "audience", label: "Audience", type: "text", placeholder: "e.g. Startup founders in Cape Town" },
    ],
    designNotes:
      "Constrains length, structure, and voice. Forces an engagement question to drive comments — the LinkedIn algorithm's strongest signal.",
    promptLibrary: {
      role: "Professional LinkedIn content writer",
      context: "South African professional audience, topic + tone + audience inputs",
      constraints: "Max 150 words, no corporate jargon, must end with engagement question",
      outputFormat: "Hook → 3 short paragraphs → 3 hashtags",
    },
  },
  {
    id: "email",
    label: "Marketing Email",
    systemPrompt:
      "You are an email marketing specialist for South African businesses. Write a compelling marketing email for the product or service provided. Format: Subject line → Greeting → Problem statement (1 paragraph) → Solution/offer (1 paragraph) → Clear call to action → Sign-off. Keep it under 200 words. Conversational and persuasive tone.",
    fields: [
      { name: "product", label: "Product / Service", type: "text", placeholder: "e.g. Yoco card reader" },
      { name: "audience", label: "Target Audience", type: "text", placeholder: "e.g. Small retail owners" },
      { name: "cta", label: "Call to Action", type: "text", placeholder: "e.g. Order now and save 20%" },
    ],
    designNotes:
      "Locks in the classic problem→solution→CTA email structure. Word cap keeps it scannable on mobile.",
    promptLibrary: {
      role: "Email marketing specialist for SA businesses",
      context: "Product/service, audience, and CTA provided",
      constraints: "Under 200 words, conversational and persuasive",
      outputFormat: "Subject → Greeting → Problem → Solution → CTA → Sign-off",
    },
  },
  {
    id: "blog",
    label: "Blog Post Intro",
    systemPrompt:
      "You are a content strategist writing blog posts for South African readers. Write a blog post introduction based on the topic and style provided. Format: Attention-grabbing hook → Context/background (2-3 sentences) → Problem or question the post will answer → Teaser of what the reader will learn. Max 120 words.",
    fields: [
      { name: "topic", label: "Topic", type: "text", placeholder: "e.g. Load shedding survival guide" },
      { name: "reader", label: "Target Reader", type: "text", placeholder: "e.g. Remote workers in Joburg" },
      {
        name: "style",
        label: "Blog Style",
        type: "select",
        options: ["Informative", "Opinion", "How-to"],
      },
    ],
    designNotes:
      "Forces a 4-part hook structure that maps to proven blog-intro frameworks (PAS / AIDA hybrid).",
    promptLibrary: {
      role: "Content strategist for SA readers",
      context: "Topic, target reader, and style choice",
      constraints: "Max 120 words",
      outputFormat: "Hook → Context → Problem → Teaser",
    },
  },
  {
    id: "product",
    label: "Product Description",
    systemPrompt:
      "You are a professional copywriter for South African e-commerce and retail. Write a product description based on the product name, features, and target customer provided. Format: Bold headline → 2-sentence overview → 3 bullet point features → One-line call to action. Persuasive, benefit-focused, no fluff.",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Solar power bank" },
      { name: "feature1", label: "Key Feature 1", type: "text", placeholder: "e.g. 20 000 mAh capacity" },
      { name: "feature2", label: "Key Feature 2", type: "text", placeholder: "e.g. Fast wireless charging" },
      { name: "feature3", label: "Key Feature 3", type: "text", placeholder: "e.g. Rugged waterproof shell" },
      { name: "customer", label: "Target Customer", type: "text", placeholder: "e.g. Outdoor adventurers" },
    ],
    designNotes:
      "Benefit-focused framing prevents feature-dump copy. Bullet count enforces parallel structure.",
    promptLibrary: {
      role: "E-commerce / retail copywriter",
      context: "Product name, up to 3 features, target customer",
      constraints: "Persuasive, benefit-focused, no fluff",
      outputFormat: "Headline → Overview → 3 bullets → CTA",
    },
  },
  {
    id: "social",
    label: "Social Media Caption",
    systemPrompt:
      "You are a social media manager for South African brands. Write a caption for the platform and mood specified. Format: Opening hook → 2-3 sentences of content → Relevant emoji (max 3) → 3-5 hashtags. Adapt length and tone to the platform — Twitter concise, Instagram expressive, Facebook conversational.",
    fields: [
      {
        name: "platform",
        label: "Platform",
        type: "select",
        options: ["Instagram", "Twitter", "Facebook"],
      },
      { name: "topic", label: "Topic", type: "text", placeholder: "e.g. New menu launch" },
      { name: "mood", label: "Mood", type: "text", placeholder: "e.g. Playful and upbeat" },
    ],
    designNotes:
      "Conditional voice rules per platform demonstrate context-aware prompting from a single template.",
    promptLibrary: {
      role: "Social media manager for SA brands",
      context: "Platform (IG/Twitter/FB), topic, mood",
      constraints: "Max 3 emojis, 3-5 hashtags, platform-aware tone",
      outputFormat: "Hook → 2-3 sentences → emojis → hashtags",
    },
  },
];

export function getContentType(id: string) {
  return CONTENT_TYPES.find((c) => c.id === id) ?? CONTENT_TYPES[0];
}

export function buildUserMessage(typeId: string, fields: Record<string, string>): string {
  const type = getContentType(typeId);
  const lines = type.fields.map((f) => `${f.label}: ${fields[f.name] || "(not provided)"}`);
  return `Generate a ${type.label} with the following inputs:\n\n${lines.join("\n")}`;
}
