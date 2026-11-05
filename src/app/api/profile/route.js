import { NextResponse } from "next/server";
import { currentProfile, renameCurrentProfile } from "@/lib/profiles";

// The signed-in profile, or null if no one is signed in.
export async function GET() {
    return NextResponse.json(currentProfile());
}

export async function PUT(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const profile = renameCurrentProfile(body?.name);
    if (!profile) {
        return NextResponse.json({ error: "Not a valid profile" }, { status: 400 });
    }
    return NextResponse.json(profile);
}
