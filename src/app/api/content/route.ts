import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile }       from "fs/promises";
import path                          from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/content.json");
const PASSWORD  = process.env.ADMIN_PASSWORD ?? "zmien-to-haslo";

// ── GET — odczyt danych ───────────────────────────────────
export async function GET() {
  try {
    const raw  = await readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Nie można odczytać danych" },
      { status: 500 }
    );
  }
}

// ── POST — zapis danych ───────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Sprawdź hasło z nagłówka
    const auth = req.headers.get("x-admin-password");
    if (auth !== PASSWORD) {
      return NextResponse.json(
        { error: "Brak autoryzacji" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Walidacja — upewnij się że dane mają właściwą strukturę
    if (!body.stats || !body.links || !body.status || !body.profile) {
      return NextResponse.json(
        { error: "Nieprawidłowa struktura danych" },
        { status: 400 }
      );
    }

    await writeFile(DATA_PATH, JSON.stringify(body, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Błąd zapisu danych" },
      { status: 500 }
    );
  }
}
