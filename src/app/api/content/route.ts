// src/app/api/content/route.ts
export const runtime = "edge"; // szybszy na Vercelu

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { revalidatePath } from "next/cache";

const redis    = Redis.fromEnv();
const PASSWORD = process.env.ADMIN_PASSWORD ?? "zmien-to-haslo";
const KEY      = "maltixon:content";

// ── Domyślne dane (pierwsza wizyta gdy baza pusta) ────────
const DEFAULT_DATA = {
  stats: {
    subscribers: { value: 592,  display: "592K", suffix: "K"  },
    views:       { value: 65,   display: "65M+", suffix: "M+" },
    followers:   { value: 40,   display: "40K",  suffix: "K"  },
  },
  status: {
    available:  true,
    text:       "Otwarty na współpracę",
    streamInfo: "",
  },
  profile: {
    name:      "MALTIXON",
    tagline:   "Polski Streamer & Twórca",
    preferred: "Discord",
  },
  links: [
    { id: "donate",    label: "Donate",       sub: "Tipply — wesprzyj twórcę",       url: "https://tipply.pl/@Malti",                        emoji: "💛", color: "#fbbf24", visible: true  },
    { id: "crypto",    label: "Donate Krypto",sub: "Bitcoin, Ethereum i więcej",      url: "https://donation.streamiverse.io/maltixon",       emoji: "₿",  color: "#fb923c", visible: true  },
    { id: "discord",   label: "Discord",      sub: "Dołącz do społeczności",         url: "https://discord.gg/FqAB4cB4pB",                   emoji: "💜", color: "#7289da", visible: true  },
    { id: "instagram", label: "Instagram",    sub: "@maltixon • 40K obserwujących",  url: "https://www.instagram.com/maltixon/",              emoji: "📸", color: "#e1306c", visible: true  },
    { id: "tiktok",    label: "TikTok",       sub: "@maltixon — krótkie klipy",      url: "https://www.tiktok.com/@maltixon",                emoji: "🎵", color: "#ffffff", visible: true  },
    { id: "youtube",   label: "YouTube",      sub: "@maltixon • 592K subskrybentów", url: "https://www.youtube.com/@maltixon",               emoji: "🔴", color: "#ff4444", visible: true  },
  ],
};

// ── GET ───────────────────────────────────────────────────
export async function GET() {
  try {
    const data = await redis.get(KEY);
    return NextResponse.json(data ?? DEFAULT_DATA);
  } catch {
    return NextResponse.json(DEFAULT_DATA);
  }
}

// ── POST ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== PASSWORD) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  const body = await req.json();

  // Tylko test hasła (logowanie)
  const isEmpty = !body.stats && !body.links && !body.status && !body.profile;
  if (isEmpty) {
    return NextResponse.json({ authenticated: true });
  }

  if (!body.stats || !body.links || !body.status || !body.profile) {
    return NextResponse.json({ error: "Nieprawidłowa struktura" }, { status: 400 });
  }

  await redis.set(KEY, body);

  revalidatePath("/");
  revalidatePath("/admin");

  return NextResponse.json({ success: true });
}
