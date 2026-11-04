import { readUpload } from "@/lib/uploads";

// Serves an image uploaded through "Other" from private/uploads. File names are never reused, so it can be cached for good.
export async function GET(request, { params }) {
    const { file } = await params;
    const upload = readUpload(file);
    if (!upload) return new Response("Not found", { status: 404 });
    return new Response(upload.bytes, {
        headers: {
            "Content-Type": upload.contentType,
            "Cache-Control": "private, max-age=31536000, immutable",
        },
    });
}
