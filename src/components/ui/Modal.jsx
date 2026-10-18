"use client";

import { useEffect, useRef } from "react";
import { XIcon } from "@/components/ui/icons";

// Open modals, innermost last. Escape closes only the innermost, so closing a dialog opened
// from a form doesn't close the form too.
const openModals = [];

function Modal({ title, onClose, children }) {
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        const modal = {};
        openModals.push(modal);
        function handleKeyDown(event) {
            if (event.key === "Escape" && openModals.at(-1) === modal) onCloseRef.current();
        }
        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            openModals.splice(openModals.indexOf(modal), 1);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-panel"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                    <button type="button" onClick={onClose} className="icon-btn -mr-1.5" aria-label="Close">
                        <XIcon />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default Modal;
