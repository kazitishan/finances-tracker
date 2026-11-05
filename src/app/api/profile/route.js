import { NextResponse } from "next/server";
import { currentProfile, deleteCurrentProfile, renameCurrentProfile } from "@/lib/profiles";

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

// Deletes the signed-in profile and all of its data. The body's `name` must match the profile's name.
export async function DELETE(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!deleteCurrentProfile(body?.name)) {
        return NextResponse.json({ error: "The name doesn't match the signed-in profile" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
}
