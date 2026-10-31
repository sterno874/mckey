import "./globals.css";

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

const base = process.env.PAGES_BASE_PATH || "";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- runtime load avoids CI Google Fonts fetch failures */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title="MCKey Blog" href={`${base}/rss.xml`} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
