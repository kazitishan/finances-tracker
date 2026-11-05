import { NextResponse } from "next/server";
import { createProfile, listProfiles } from "@/lib/profiles";

export async function GET() {
    return NextResponse.json(listProfiles());
}

// Creates a profile and signs in to it.
export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const profile = createProfile(body?.name);
    if (!profile) {
        return NextResponse.json({ error: "A name is required" }, { status: 400 });
    }
    return NextResponse.json(profile, { status: 201 });
}
