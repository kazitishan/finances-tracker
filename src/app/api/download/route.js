import { exportInfo } from "@/lib/infoStore";

export const dynamic = "force-dynamic";

export async function GET() {
    return new Response(exportInfo(), {
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="info.json"',
            "Cache-Control": "no-store",
        },
    });
}
