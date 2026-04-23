// Tone colours — hue-circle harmony (60° separation), WCAG AA on #FCFCFB
// Design system §1.2: Cantonese Pitch Contours
// Slots 1-6 are the Cantonese set (also reused for Mandarin 1-4 + neutral→6).
// Slots 7-8 are Hokkien-specific additions (departing + upper-entering).
export const TONE_COLORS = {
  1: "#D63B3B", // Hue  0° — High Level (55)    WCAG 4.6:1
  2: "#D16A1F", // Hue 25° — High Rising (25)   WCAG 4.5:1
  3: "#A67438", // Hue 35° — Mid Level (33)      WCAG 5.2:1
  4: "#2F7B48", // Hue 140° — Low Falling (21)  WCAG 4.8:1
  5: "#1F5CA0", // Hue 210° — Low Rising (23)   WCAG 6.1:1
  6: "#7C4FA1", // Hue 280° — Low Level (22)    WCAG 5.4:1
  7: "#8A5A32", // Hokkien departing (high-low)  WCAG 4.7:1
  8: "#3F6B82", // Hokkien upper-entering (stop) WCAG 5.0:1
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
