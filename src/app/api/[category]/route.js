import { NextResponse } from "next/server";
import { addItem, listItems, reorderItems } from "@/lib/infoStore";

export async function GET(request, { params }) {
    const { category } = await params;
    return NextResponse.json(listItems(category));
}

export async function POST(request, { params }) {
    const { category } = await params;
    const body = await request.json();
    const item = addItem(category, body);
    return NextResponse.json(item, { status: 201 });
}

export async function PUT(request, { params }) {
    const { category } = await params;
    const { order } = await request.json();
    const items = reorderItems(category, order);
    return NextResponse.json(items);
}
