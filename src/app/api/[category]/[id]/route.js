import { NextResponse } from "next/server";
import { deleteItem, updateItem } from "@/lib/infoStore";

export async function PUT(request, { params }) {
    const { category, id } = await params;
    const body = await request.json();
    const loginMode = new URL(request.url).searchParams.get("login");
    const { item, sharedWith } = updateItem(category, id, body, loginMode);
    if (sharedWith) {
        return NextResponse.json({ sharedWith }, { status: 409 });
    }
    if (!item) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
}

export async function DELETE(request, { params }) {
    const { category, id } = await params;
    deleteItem(category, id);
    return NextResponse.json({ ok: true });
}
