import { NextResponse } from "next/server";
import { signIn, signOut } from "@/lib/profiles";

// Signs in to the profile with the body's `id`.
export async function PUT(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const profile = signIn(String(body?.id));
    if (!profile) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
}

export async function DELETE() {
    signOut();
    return NextResponse.json({ ok: true });
}
