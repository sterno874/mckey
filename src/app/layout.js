import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "MCKey — Paste secrets into the vault, never the agent",
  description:
    "Builders paste API keys into agents because it's fastest — then rotate. MCKey makes the safe path just as fast: vault once, give the agent a handle, inject on the tool call.",
  metadataBase: new URL("https://sterno874.github.io/mckey"),
  openGraph: {
    title: "MCKey — Never paste keys into agents again",
    description:
      "Vault once. Agent gets mckey:// handles. Gateway injects on MCP calls. Paste-intercept as the safety net.",
    siteName: "MCKey",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>{children}</body>
    </html>
  );
}
