"use client";

import { useEffect } from "react";

// Holds a connection open to the server so it can shut itself down once every tab is closed.
export default function KeepAlive() {
    useEffect(() => {
        const source = new EventSource("/api/keep-alive");
        return () => source.close();
    }, []);

    return null;
}
