import { NextResponse } from "next/server";
import { importInfo } from "@/lib/infoStore";

export const dynamic = "force-dynamic";

export async function POST(request) {
    let data;
    try {
        data = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!importInfo(data)) {
        return NextResponse.json({ error: "Not an info.json file" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
}
