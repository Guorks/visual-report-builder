import { z } from "zod";

const ReportType = z.enum([
  "status",
  "postmortem",
  "kickoff",
  "launch",
  "comparison",
  "decision-memo",
  "user-story",
]);

const Audience = z.enum([
  "engineers",
  "stakeholders-non-tech",
  "operators",
  "investors",
  "mixed",
]);

const Language = z.enum(["es", "en"]);

const CardColor = z.enum(["green", "red", "blue", "yellow", "purple", "neutral"]);
const BadgeKind = z.enum(["red", "gold", "green"]);

const Meta = z
  .object({
    title: z.string().min(1),
    language: Language,
    type: ReportType,
    audience: Audience,
    date: z.string().min(1),
    project: z.string().min(1),
    extra: z.string().optional(),
    footer_lines: z.array(z.string().min(1)).min(1).max(3),
  })
  .strict();

const Hero = z
  .object({
    kicker: z.string().min(1),
    h1_pre: z.string(),
    h1_accent: z.string().min(1),
    h1_post: z.string(),
    lede: z.string().min(1),
  })
  .strict();

const StatusPanelNode = z
  .object({
    kind: z.literal("status-panel"),
    tag: z.string().min(1),
    heading: z.string().min(1),
    paragraph: z.string().min(1).describe("raw-html"),
    progress: z
      .object({
        pct: z.number().min(0).max(100),
        labels: z.array(z.string().min(1)).length(4),
        note: z.string().min(1).describe("raw-html"),
      })
      .strict()
      .optional(),
  })
  .strict();

const FigureNode = z
  .object({
    kind: z.literal("figure"),
    src: z.string().min(1),
    src_cdn: z.string().url().optional(),
    alt: z.string().min(1),
    caption: z.string().min(1),
  })
  .strict();

const H2Node = z
  .object({
    kind: z.literal("h2"),
    text: z.string().min(1),
  })
  .strict();

const H3Node = z
  .object({
    kind: z.literal("h3"),
    text: z.string().min(1),
  })
  .strict();

const ParagraphNode = z
  .object({
    kind: z.literal("paragraph"),
    body: z.string().min(1).describe("raw-html"),
  })
  .strict();

const PreNode = z
  .object({
    kind: z.literal("pre"),
    language: z.string().optional(),
    body: z.string().min(1),
  })
  .strict();

const Card = z
  .object({
    color: CardColor,
    title: z.string().optional(),
    body: z.string().min(1).describe("raw-html"),
  })
  .strict();

const CardNode = z
  .object({
    kind: z.literal("card"),
    color: CardColor,
    title: z.string().optional(),
    body: z.string().min(1).describe("raw-html"),
  })
  .strict();

const Cards2Node = z
  .object({
    kind: z.literal("cards-2"),
    cards: z.array(Card).length(2),
  })
  .strict();

const Cards3Node = z
  .object({
    kind: z.literal("cards-3"),
    cards: z.array(Card).length(3),
  })
  .strict();

const DoneListNode = z
  .object({
    kind: z.literal("done-list"),
    items: z.array(z.string().min(1).describe("raw-html")).min(1),
  })
  .strict();

const PendingListNode = z
  .object({
    kind: z.literal("pending-list"),
    items: z.array(z.string().min(1).describe("raw-html")).min(1),
  })
  .strict();

const StepsNode = z
  .object({
    kind: z.literal("steps"),
    items: z
      .array(
        z
          .object({
            title: z.string().min(1),
            body: z.string().min(1).describe("raw-html"),
            small: z.string().optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const CheckTableNode = z
  .object({
    kind: z.literal("check-table"),
    headers: z.array(z.string().min(1)).min(2),
    rows: z
      .array(z.array(z.string().describe("raw-html")).min(2))
      .min(1),
  })
  .strict();

const GotchaNode = z
  .object({
    kind: z.literal("gotcha"),
    title: z.string().min(1),
    body: z.string().min(1).describe("raw-html"),
  })
  .strict();

const HandwriteNode = z
  .object({
    kind: z.literal("handwrite"),
    text: z.string().min(1),
  })
  .strict();

const ScribbleNode = z
  .object({
    kind: z.literal("scribble"),
    text: z.string().min(1),
  })
  .strict();

const TesterPillsNode = z
  .object({
    kind: z.literal("tester-pills"),
    items: z.array(z.string().min(1)).min(1),
  })
  .strict();

const BadgeRowNode = z
  .object({
    kind: z.literal("badge-row"),
    items: z
      .array(
        z
          .object({
            kind: BadgeKind,
            text: z.string().min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

type SectionNodeShape =
  | z.infer<typeof StatusPanelNode>
  | z.infer<typeof FigureNode>
  | z.infer<typeof H2Node>
  | z.infer<typeof H3Node>
  | z.infer<typeof ParagraphNode>
  | z.infer<typeof PreNode>
  | z.infer<typeof CardNode>
  | z.infer<typeof Cards2Node>
  | z.infer<typeof Cards3Node>
  | z.infer<typeof DoneListNode>
  | z.infer<typeof PendingListNode>
  | z.infer<typeof StepsNode>
  | z.infer<typeof CheckTableNode>
  | z.infer<typeof GotchaNode>
  | z.infer<typeof HandwriteNode>
  | z.infer<typeof ScribbleNode>
  | z.infer<typeof TesterPillsNode>
  | z.infer<typeof BadgeRowNode>
  | { kind: "grid-2"; cells: [SectionNodeShape[], SectionNodeShape[]] }
  | { kind: "grid-3"; cells: [SectionNodeShape[], SectionNodeShape[], SectionNodeShape[]] };

const SectionNode: z.ZodType<SectionNodeShape> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    StatusPanelNode,
    FigureNode,
    H2Node,
    H3Node,
    ParagraphNode,
    PreNode,
    CardNode,
    Cards2Node,
    Cards3Node,
    DoneListNode,
    PendingListNode,
    StepsNode,
    CheckTableNode,
    GotchaNode,
    HandwriteNode,
    ScribbleNode,
    TesterPillsNode,
    BadgeRowNode,
    Grid2Node,
    Grid3Node,
  ]),
);

const Grid2Node = z
  .object({
    kind: z.literal("grid-2"),
    cells: z.tuple([z.array(SectionNode).min(1), z.array(SectionNode).min(1)]),
  })
  .strict();

const Grid3Node = z
  .object({
    kind: z.literal("grid-3"),
    cells: z.tuple([
      z.array(SectionNode).min(1),
      z.array(SectionNode).min(1),
      z.array(SectionNode).min(1),
    ]),
  })
  .strict();

export const Report = z
  .object({
    meta: Meta,
    hero: Hero,
    sections: z.array(SectionNode).min(1),
  })
  .strict();

export type Report = z.infer<typeof Report>;
export type SectionNode = z.infer<typeof SectionNode>;
export type ReportType = z.infer<typeof ReportType>;
export type Audience = z.infer<typeof Audience>;
export type Language = z.infer<typeof Language>;

export const NODE_KINDS = [
  "status-panel",
  "figure",
  "h2",
  "h3",
  "paragraph",
  "pre",
  "card",
  "cards-2",
  "cards-3",
  "grid-2",
  "grid-3",
  "done-list",
  "pending-list",
  "steps",
  "check-table",
  "gotcha",
  "handwrite",
  "scribble",
  "tester-pills",
  "badge-row",
] as const;
