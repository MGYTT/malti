// src/app/page.tsx — Server Component (bez "use client")

import { ContentData } from "@/types/content";
import HomeClient      from "@/components/HomeClient";

const DEFAULT_DATA: ContentData = {
  stats: {
    subscribers: { value: 592, display: "592K", suffix: "K"  },
    views:       { value: 65,  display: "65M+", suffix: "M+" },
    followers:   { value: 40,  display: "40K",  suffix: "K"  },
  },
  status:  { available: true, text: "Otwarty na współpracę", streamInfo: "" },
  profile: { name: "MALTIXON", tagline: "Polski Streamer & Twórca", preferred: "Discord" },
  links: [
    { id: "donate",    label: "Donate",        sub: "Tipply — wesprzyj twórcę",      url: "https://tipply.pl/@Malti",                  emoji: "💛", color: "#fbbf24", visible: true },
    { id: "crypto",    label: "Donate Krypto", sub: "Bitcoin, Ethereum i więcej",     url: "https://donation.streamiverse.io/maltixon", emoji: "₿",  color: "#fb923c", visible: true },
    { id: "discord",   label: "Discord",       sub: "Dołącz do społeczności",         url: "https://discord.gg/FqAB4cB4pB",             emoji: "💜", color: "#7289da", visible: true },
    { id: "instagram", label: "Instagram",     sub: "@maltixon • 40K obserwujących",  url: "https://www.instagram.com/maltixon/",       emoji: "📸", color: "#e1306c", visible: true },
    { id: "tiktok",    label: "TikTok",        sub: "@maltixon — krótkie klipy",      url: "https://www.tiktok.com/@maltixon",          emoji: "🎵", color: "#ffffff", visible: true },
    { id: "youtube",   label: "YouTube",       sub: "@maltixon • 592K subskrybentów", url: "https://www.youtube.com/@maltixon",         emoji: "🔴", color: "#ff4444", visible: true },
  ],

  // ← BRAKUJĄCE POLE
  notifications: [],
};

async function getContent(): Promise<ContentData> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res  = await fetch(`${base}/api/content`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("fetch failed");

    const data: ContentData = await res.json();

    // Wsteczna kompatybilność — gdyby Redis zwrócił stary zapis bez notifications
    if (!Array.isArray(data.notifications)) {
      data.notifications = [];
    }

    return data;
  } catch {
    return DEFAULT_DATA;
  }
}

export default async function Page() {
  const content = await getContent();
  return <HomeClient content={content} />;
}
