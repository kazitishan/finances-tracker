import { NextResponse } from "next/server";
import { deleteLogin, updateLogin } from "@/lib/infoStore";

export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    const login = updateLogin(id, body);
    if (!login) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(login);
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    deleteLogin(id);
    return NextResponse.json({ ok: true });
}
