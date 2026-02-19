import type { Metadata, Viewport } from "next";
import "./globals.css";

// ── Metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  // ── Podstawowe ──
  title:       "MALTIXON",
  description: "Polski streamer i twórca treści — YouTube, Twitch, TikTok, Discord",
  keywords:    [
    "MALTIXON",
    "maltixon",
    "streamer",
    "polski streamer",
    "YouTube",
    "Twitch",
    "TikTok",
    "Discord",
    "gaming",
    "Polska",
  ],
  authors:     [{ name: "MALTIXON" }],
  creator:     "MALTIXON",
  publisher:   "MALTIXON",

  // ── Canonical ──
  alternates: {
    canonical: "https://maltixon.pl",
  },

  // ── Open Graph (Facebook, Discord, LinkedIn) ──
  openGraph: {
    type:        "website",
    url:         "https://maltixon.pl",
    title:       "MALTIXON",
    description: "Polski streamer i twórca treści — YouTube, Twitch, TikTok, Discord",
    siteName:    "MALTIXON",
    locale:      "pl_PL",
    images: [
      {
        url:    "https://maltixon.pl/og-image.png",
        width:  1200,
        height: 630,
        alt:    "MALTIXON — Polski Streamer",
      },
    ],
  },

  // ── Twitter / X Card ──
  twitter: {
    card:        "summary_large_image",
    title:       "MALTIXON",
    description: "Polski streamer i twórca treści — YouTube, Twitch, TikTok, Discord",
    images:      ["https://maltixon.pl/og-image.png"],
  },

  // ── Robots ──
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-image-preview":  "large",
      "max-snippet":        -1,
    },
  },

  // ── Icons ──
  icons: {
    icon: [
      { url: "/favicon.ico",   sizes: "any"   },
      { url: "/icon-16.png",   sizes: "16x16",  type: "image/png" },
      { url: "/icon-32.png",   sizes: "32x32",  type: "image/png" },
      { url: "/icon-192.png",  sizes: "192x192",type: "image/png" },
      { url: "/icon-512.png",  sizes: "512x512",type: "image/png" },
    ],
    apple:   [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  // ── PWA manifest ──
  manifest: "/manifest.json",

  // ── Inne ──
  category: "entertainment",
};

// ── Viewport ──────────────────────────────────────────────
export const viewport: Viewport = {
  width:               "device-width",
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#0a0a0f" },
  ],
};

// ── JSON-LD Schema ────────────────────────────────────────
const jsonLd = {
  "@context":   "https://schema.org",
  "@type":      "Person",
  name:         "MALTIXON",
  url:          "https://maltixon.pl",
  description:  "Polski streamer i twórca treści",
  sameAs: [
    "https://www.youtube.com/@maltixon",
    "https://www.twitch.tv/maltixon",
    "https://www.instagram.com/maltixon/",
    "https://www.tiktok.com/@maltixon",
    "https://discord.gg/FqAB4cB4pB",
  ],
  knowsAbout:   ["Gaming", "Streaming", "Content Creation"],
  nationality:  "Polish",
};

// ── Root Layout ───────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className="h-full"
      // Zapobiega flashowi motywu przy pierwszym renderze
      suppressHydrationWarning
    >
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Preconnect do fontów Google */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch dla zewnętrznych domen */}
        <link rel="dns-prefetch" href="https://www.youtube.com"        />
        <link rel="dns-prefetch" href="https://www.instagram.com"      />
        <link rel="dns-prefetch" href="https://discord.gg"             />
        <link rel="dns-prefetch" href="https://www.twitch.tv"          />
        <link rel="dns-prefetch" href="https://www.tiktok.com"         />
        <link rel="dns-prefetch" href="https://tipply.pl"              />
        <link rel="dns-prefetch" href="https://donation.streamiverse.io"/>

        {/* Kolor paska przeglądarki mobile */}
        <meta name="msapplication-TileColor" content="#0a0a0f" />
        <meta name="msapplication-config"    content="/browserconfig.xml" />
      </head>

      <body
        className="h-full antialiased"
        style={{
          background:    "#0a0a0f",
          color:         "#e2e8f0",
          fontFamily:    "'Inter', sans-serif",
          overflowX:     "hidden",
          // Wygładzone renderowanie fontów
          WebkitFontSmoothing:  "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </body>
    </html>
  );
}
