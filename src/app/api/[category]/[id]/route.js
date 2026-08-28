import { NextResponse } from "next/server";
import { deleteItem, updateItem } from "@/lib/infoStore";

export async function PUT(request, { params }) {
    const { category, id } = await params;
    const body = await request.json();
    const item = updateItem(category, id, body);
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
