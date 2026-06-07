export const C = {
  // Light theme backgrounds
  bg:            "#F9FAFB",          // Light gray background
  surface:       "#FFFFFF",          // Pure white for panels
  card:          "#FFFFFF",          // White cards
  border:        "#E5E7EB",          // Light gray borders
  borderHover:   "#D1D5DB",          // Slightly darker on hover

  // Status & semantic colors (adjusted for light backgrounds)
  amber:         "#D97706",          // Darker amber for readability
  amberDim:      "#FCD34D40",        // Warm light background
  amberGlow:     "#FCD34D60",        // Warmer glow

  blue:          "#2563EB",          // Darker blue for light bg
  blueDim:       "#DBEAFE40",        // Very light blue background

  green:         "#059669",          // Darker green for light bg
  greenDim:      "#D1FAE540",        // Very light green background

  red:           "#DC2626",          // Darker red for light bg
  redDim:        "#FEE2E240",        // Very light red background

  purple:        "#7C3AED",          // Darker purple for light bg
  purpleDim:     "#EDE9FE40",        // Very light purple background

  // Text colors (dark for light backgrounds)
  text:          "#111827",          // Dark text (almost black)
  textSub:       "#4B5563",          // Medium gray
  textDim:       "#9CA3AF",          // Light gray for muted text
  muted:         "#F3F4F6",          // Very light gray for muted elements
} as const;

export const AGENT_TYPE_COLORS: Record<string, string> = {
  CONVERSATIONAL: C.blue,
  TOOL_USING:     C.green,
  AUTONOMOUS:     C.amber,
  MULTI_AGENT:    C.purple,
  RAG_PIPELINE:   C.purple,
  CUSTOM:         C.textSub,
};

export const STATUS_COLORS: Record<string, string> = {
  HEALTHY:  C.green,
  WARN:     C.amber,
  FAIL:     C.red,
  PENDING:  C.textDim,
  pass:     C.green,
  warn:     C.amber,
  fail:     C.red,
  healthy:  C.green,
};
