import { NextResponse } from "next/server";
import { listLogins } from "@/lib/infoStore";

export async function GET() {
    return NextResponse.json(listLogins());
}
