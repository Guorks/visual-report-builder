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

const HREF_SCHEMES = /^(https?:\/\/|mailto:|#)/;

export const Figure = z
  .object({
    src: z.string().min(1),
    src_cdn: z.string().url().optional(),
    alt: z.string().min(1),
    caption: z.string().min(1).optional(),
    width: z.enum(["full", "wide", "medium", "small"]).optional(),
    aspect: z.enum(["16:9", "1:1", "4:3", "3:4", "9:16"]).optional(),
    frame: z.boolean().optional(),
    align: z.enum(["center", "left", "right"]).optional(),
  })
  .strict();

const FigureNode = Figure.extend({ kind: z.literal("figure") }).strict();

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
    lede: z.string().min(1).describe("raw-html"),
    badges: z
      .array(z.object({ kind: BadgeKind, text: z.string().min(1) }).strict())
      .min(1).max(3).optional(),
    figure: Figure.optional(),
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
        labels: z.array(z.string().min(1)).min(2).max(6),
        note: z.string().min(1).describe("raw-html"),
      })
      .strict()
      .optional(),
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

const CardNode = Card.extend({ kind: z.literal("card") }).strict();

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

const CalloutNode = z
  .object({
    kind: z.literal("callout"),
    color: CardColor,
    icon: z.string().min(1).max(4).optional(),
    title: z.string().min(1).optional(),
    body: z.string().min(1).describe("raw-html"),
  })
  .strict();

const StatRowNode = z
  .object({
    kind: z.literal("stat-row"),
    items: z
      .array(
        z.object({
          value: z.string().min(1),
          label: z.string().min(1),
          color: CardColor.optional(),
          note: z.string().min(1).optional(),
        }).strict(),
      )
      .min(2).max(4),
  })
  .strict();

const TimelineNode = z
  .object({
    kind: z.literal("timeline"),
    items: z
      .array(
        z.object({
          time: z.string().min(1),
          title: z.string().min(1).optional(),
          body: z.string().min(1).describe("raw-html"),
          color: CardColor.optional(),
        }).strict(),
      )
      .min(2),
  })
  .strict();

const CtaCardNode = z
  .object({
    kind: z.literal("cta-card"),
    title: z.string().min(1),
    body: z.string().min(1).describe("raw-html"),
    action: z
      .object({
        label: z.string().min(1),
        href: z.string().regex(HREF_SCHEMES, "href must start with https://, http://, mailto: or #").optional(),
      })
      .strict(),
    color: CardColor.optional(),
  })
  .strict();

const ActionListNode = z
  .object({
    kind: z.literal("action-list"),
    items: z
      .array(
        z.object({
          text: z.string().min(1).describe("raw-html"),
          owner: z.string().min(1).optional(),
          due: z.string().min(1).optional(),
          done: z.boolean().optional(),
        }).strict(),
      )
      .min(1),
  })
  .strict();

const QuoteNode = z
  .object({
    kind: z.literal("quote"),
    text: z.string().min(1),
    attribution: z.string().min(1).optional(),
  })
  .strict();

const FigureRowNode = z
  .object({
    kind: z.literal("figure-row"),
    figures: z.array(Figure).min(2).max(3),
  })
  .strict();

const DividerNode = z
  .object({
    kind: z.literal("divider"),
    style: z.enum(["dashed", "scribble"]).optional(),
  })
  .strict();

const ChartDatum = z
  .object({
    label: z.string().min(1),
    value: z.number().finite().nonnegative(),
    color: CardColor.optional(),
  })
  .strict();

const ChartBarNode = z
  .object({
    kind: z.literal("chart-bar"),
    title: z.string().min(1).optional(),
    data: z.array(ChartDatum).min(2).max(8),
    unit: z.string().optional(),
    caption: z.string().min(1).optional(),
  })
  .strict();

const ChartDonutNode = z
  .object({
    kind: z.literal("chart-donut"),
    title: z.string().min(1).optional(),
    data: z.array(ChartDatum).min(2).max(6),
    center_label: z.string().min(1).optional(),
    caption: z.string().min(1).optional(),
  })
  .strict();

const ChartLineNode = z
  .object({
    kind: z.literal("chart-line"),
    title: z.string().min(1).optional(),
    series: z
      .array(
        z.object({
          name: z.string().min(1),
          color: CardColor.optional(),
          points: z
            .array(z.object({ x: z.string().min(1), y: z.number().finite() }).strict())
            .min(2),
        }).strict(),
      )
      .min(1).max(3),
    unit: z.string().optional(),
    caption: z.string().min(1).optional(),
  })
  .strict();

const CustomNode = z
  .object({
    kind: z.literal("custom"),
    html: z.string().min(1),
    css: z.string().min(1).optional(),
    note: z.string().min(10),
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
  | z.infer<typeof CalloutNode>
  | z.infer<typeof StatRowNode>
  | z.infer<typeof TimelineNode>
  | z.infer<typeof CtaCardNode>
  | z.infer<typeof ActionListNode>
  | z.infer<typeof QuoteNode>
  | z.infer<typeof FigureRowNode>
  | z.infer<typeof DividerNode>
  | z.infer<typeof ChartBarNode>
  | z.infer<typeof ChartDonutNode>
  | z.infer<typeof ChartLineNode>
  | z.infer<typeof CustomNode>
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
    CalloutNode,
    StatRowNode,
    TimelineNode,
    CtaCardNode,
    ActionListNode,
    QuoteNode,
    FigureRowNode,
    DividerNode,
    ChartBarNode,
    ChartDonutNode,
    ChartLineNode,
    CustomNode,
    Grid2Node,
    Grid3Node,
  ]).superRefine((node, ctx) => {
    if (node.kind === "check-table") {
      node.rows.forEach((row, i) => {
        if (row.length !== node.headers.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rows", i],
            message: `row has ${row.length} cells but headers has ${node.headers.length}`,
          });
        }
      });
    }
    if (node.kind === "chart-line") {
      const ref = node.series[0]!.points;
      node.series.forEach((s, i) => {
        if (i === 0) return;
        const mismatched =
          s.points.length !== ref.length ||
          s.points.some((p, j) => p.x !== ref[j]!.x);
        if (mismatched) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["series", i, "points"],
            message: "all series must share the same x categories (same count and x values in order)",
          });
        }
      });
    }
  }),
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
  "callout",
  "stat-row",
  "timeline",
  "cta-card",
  "action-list",
  "quote",
  "figure-row",
  "divider",
  "chart-bar",
  "chart-donut",
  "chart-line",
  "custom",
] as const;
