import { NextResponse } from "next/server";
import { getUserInfo, updateUserInfo } from "@/lib/infoStore";

export async function GET() {
    return NextResponse.json(getUserInfo());
}

export async function PUT(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const userInfo = updateUserInfo(body);
    if (!userInfo) {
        return NextResponse.json({ error: "Not valid user info" }, { status: 400 });
    }
    return NextResponse.json(userInfo);
}
