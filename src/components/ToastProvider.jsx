"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(() => {});

export function useToast() {
    return useContext(ToastContext);
}

export function useCopyToClipboard() {
    const showToast = useToast();
    return useCallback(
        async (text, label) => {
            try {
                await navigator.clipboard.writeText(text);
                showToast(`${label} copied`);
            } catch {
                showToast(`Couldn't copy ${label}`);
            }
        },
        [showToast]
    );
}

function ToastProvider({ children }) {
    const [message, setMessage] = useState(null);
    const [toastKey, setToastKey] = useState(0);
    const timerRef = useRef(null);

    const showToast = useCallback((text) => {
        clearTimeout(timerRef.current);
        setMessage(text);
        setToastKey((key) => key + 1);
        timerRef.current = setTimeout(() => setMessage(null), 1800);
    }, []);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {message && (
                <div
                    key={toastKey}
                    role="status"
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg pointer-events-none"
                >
                    {message}
                </div>
            )}
        </ToastContext.Provider>
    );
}

export default ToastProvider;
