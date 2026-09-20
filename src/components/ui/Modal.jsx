"use client";

import { useEffect } from "react";
import { XIcon } from "@/components/ui/icons";

function Modal({ title, onClose, children }) {
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

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
