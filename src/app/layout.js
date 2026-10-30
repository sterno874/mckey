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
  title: "MCKey — Keys for MCP agents, not raw secrets",
  description:
    "MCKey is the simple vault that issues short-lived, scoped keys to AI agents. Your master credentials never leave the vault.",
  metadataBase: new URL("https://mckey.vercel.app"),
  openGraph: {
    title: "MCKey — Keys for MCP agents",
    description:
      "Stop pasting API keys into agents. Issue scoped, expiring MCKeys for every MCP tool call.",
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
