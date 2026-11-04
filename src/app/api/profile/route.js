import { NextResponse } from "next/server";
import { getProfile, updateProfile } from "@/lib/infoStore";

export async function GET() {
    return NextResponse.json(getProfile());
}

export async function PUT(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const profile = updateProfile(body);
    if (!profile) {
        return NextResponse.json({ error: "Not a valid profile" }, { status: 400 });
    }
    return NextResponse.json(profile);
}
