// src/app/api/content/route.ts
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { Redis }                     from "@upstash/redis";
import { revalidatePath }            from "next/cache";
import type { ContentData }          from "@/types/content";

// ── Redis + hasło ─────────────────────────────────────────
const redis    = Redis.fromEnv();
const PASSWORD = process.env.ADMIN_PASSWORD ?? "zmien-to-haslo";
const KEY      = "maltixon:content";

// ── Dane domyślne (gdy baza pusta — pierwszy deploy) ──────
const DEFAULT_DATA: ContentData = {
  stats: {
    subscribers: { value: 592, display: "592K", suffix: "K"  },
    views:       { value: 65,  display: "65M+", suffix: "M+" },
    followers:   { value: 40,  display: "40K",  suffix: "K"  },
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
    {
      id:      "donate",
      label:   "Donate",
      sub:     "Tipply — wesprzyj twórcę",
      url:     "https://tipply.pl/@Malti",
      emoji:   "💛",
      color:   "#fbbf24",
      visible: true,
    },
    {
      id:      "crypto",
      label:   "Donate Krypto",
      sub:     "Bitcoin, Ethereum i więcej",
      url:     "https://donation.streamiverse.io/maltixon",
      emoji:   "₿",
      color:   "#fb923c",
      visible: true,
    },
    {
      id:      "discord",
      label:   "Discord",
      sub:     "Dołącz do społeczności",
      url:     "https://discord.gg/FqAB4cB4pB",
      emoji:   "💜",
      color:   "#7289da",
      visible: true,
    },
    {
      id:      "instagram",
      label:   "Instagram",
      sub:     "@maltixon • 40K obserwujących",
      url:     "https://www.instagram.com/maltixon/",
      emoji:   "📸",
      color:   "#e1306c",
      visible: true,
    },
    {
      id:      "tiktok",
      label:   "TikTok",
      sub:     "@maltixon — krótkie klipy",
      url:     "https://www.tiktok.com/@maltixon",
      emoji:   "🎵",
      color:   "#ffffff",
      visible: true,
    },
    {
      id:      "youtube",
      label:   "YouTube",
      sub:     "@maltixon • 592K subskrybentów",
      url:     "https://www.youtube.com/@maltixon",
      emoji:   "🔴",
      color:   "#ff4444",
      visible: true,
    },
  ],
};

// ── Walidacja struktury danych ────────────────────────────
function isValidContent(body: unknown): body is ContentData {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.stats   === "object" && b.stats   !== null &&
    typeof b.status  === "object" && b.status  !== null &&
    typeof b.profile === "object" && b.profile !== null &&
    Array.isArray(b.links)
  );
}

// ── GET — pobierz dane ────────────────────────────────────
export async function GET() {
  try {
    const data = await redis.get<ContentData>(KEY);
    return NextResponse.json(data ?? DEFAULT_DATA);
  } catch (err) {
    console.error("[API/content GET]", err);
    // Fallback na dane domyślne gdy Redis niedostępny
    return NextResponse.json(DEFAULT_DATA);
  }
}

// ── POST — zapisz dane ────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Autoryzacja — zawsze pierwsza
  const auth = req.headers.get("x-admin-password");
  if (!auth || auth !== PASSWORD) {
    return NextResponse.json(
      { error: "Brak autoryzacji" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowy JSON" },
      { status: 400 }
    );
  }

  // 2. Puste body = test hasła (logowanie z panelu admina)
  const isEmpty =
    body !== null &&
    typeof body === "object" &&
    Object.keys(body as object).length === 0;

  if (isEmpty) {
    return NextResponse.json({ authenticated: true });
  }

  // 3. Walidacja struktury przy prawdziwym zapisie
  if (!isValidContent(body)) {
    return NextResponse.json(
      { error: "Nieprawidłowa struktura danych" },
      { status: 400 }
    );
  }

  // 4. Zapis do Redis
  try {
    await redis.set(KEY, body);
  } catch (err) {
    console.error("[API/content POST] Redis write error:", err);
    return NextResponse.json(
      { error: "Błąd zapisu do bazy" },
      { status: 500 }
    );
  }

  // 5. Rewalidacja cache Next.js — strona odświeży się od razu
  try {
    revalidatePath("/");
    revalidatePath("/admin");
  } catch {
    // revalidatePath może nie działać w edge runtime na starszych wersjach
    // nie przerywamy — zapis już się udał
  }

  return NextResponse.json({ success: true });
}
