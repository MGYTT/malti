// src/app/api/content/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile }        from "fs/promises";
import { revalidatePath }             from "next/cache";
import path                           from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/content.json");
const PASSWORD  = process.env.ADMIN_PASSWORD ?? "zmien-to-haslo";

// ── GET ───────────────────────────────────────────────────
export async function GET() {
  try {
    const raw  = await readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Błąd odczytu" },
      { status: 500 }
    );
  }
}

// ── POST ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Sprawdź hasło ZAWSZE PIERWSZA
    const auth = req.headers.get("x-admin-password");
    if (auth !== PASSWORD) {
      return NextResponse.json(
        { error: "Brak autoryzacji" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 2. Jeśli puste body — to tylko test hasła (logowanie)
    //    Zwróć 200 zamiast 400
    const isEmpty =
      !body.stats && !body.links && !body.status && !body.profile;

    if (isEmpty) {
      return NextResponse.json({ authenticated: true });
    }

    // 3. Walidacja struktury przy prawdziwym zapisie
    if (!body.stats || !body.links || !body.status || !body.profile) {
      return NextResponse.json(
        { error: "Nieprawidłowa struktura danych" },
        { status: 400 }
      );
    }

    // 4. Zapis do pliku
    await writeFile(
      DATA_PATH,
      JSON.stringify(body, null, 2),
      "utf-8"
    );

    // 5. Rewalidacja cache
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[API/content POST]", err);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
