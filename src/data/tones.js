// Tone colours — vibrant enough to read, accessible on white background
// Updated Sprint 2: Tones 2, 3, 4 adjusted for 4.5:1 contrast
export const TONE_COLORS = {
  1: "#DC2626", // red-600     — High Level (55)
  2: "#C2410C", // Adjusted: Tone 2
  3: "#B45309", // Adjusted: Tone 3
  4: "#15803D", // Adjusted: Tone 4
  5: "#2563EB", // blue-600    — Low Rising (23)
  6: "#9333EA", // purple-600  — Low Level (22)
};

export const TONE_NAMES = {
  1: "High Level (55)",
  2: "High Rising (25)",
  3: "Mid Level (33)",
  4: "Low Falling (21)",
  5: "Low Rising (23)",
  6: "Low Level (22)",
};

// Short contour description shown in tone filter buttons
export const TONE_CONTOURS = {
  1: "⎻",  // flat high
  2: "↗",  // rising
  3: "—",  // flat mid
  4: "↘",  // falling
  5: "↗",  // low rising
  6: "⎽",  // flat low
};
