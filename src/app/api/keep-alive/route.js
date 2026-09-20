// Each open browser tab holds a connection to this route. When the last one
// closes, the server exits after a short grace period (so a page refresh
// doesn't shut it down).
const SHUTDOWN_DELAY_MS = 5000;

const state = (globalThis.__keepAlive ??= { connections: 0, timer: null });

export const dynamic = "force-dynamic";

export async function GET(request) {
    clearTimeout(state.timer);
    state.connections++;

    const encoder = new TextEncoder();
    let heartbeat;

    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(": connected\n\n"));
            heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": ping\n\n"));
                } catch {
                    clearInterval(heartbeat);
                }
            }, 15000);
        },
    });

    request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        state.connections = Math.max(0, state.connections - 1);
        if (state.connections === 0) {
            state.timer = setTimeout(() => process.exit(0), SHUTDOWN_DELAY_MS);
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}
