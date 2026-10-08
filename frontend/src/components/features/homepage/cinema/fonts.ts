import { DM_Sans, Manrope } from "next/font/google";

// Source design typefaces, self-hosted at build time: DM Sans for UI text
// (source --font stack) and Manrope for display headings. Importing these
// modules emits the @font-face rules that the scoped cinema CSS references
// by family name; the variable classes below keep the import live and are
// applied to the homepage scope only. `weight` is intentionally omitted:
// both families are variable fonts on Google Fonts.
export const cinemaSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinema-sans",
});

export const cinemaDisplay = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinema-display",
});

export const cinemaFontVariables =
  `${cinemaSans.variable} ${cinemaDisplay.variable}`;
