"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "@/components/ui/Modal";
import { UploadIcon } from "@/components/ui/icons";

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const MAX_SIZE_MB = 5;

// Asks for a PNG or JPEG, dropped in or picked from the file browser, and hands it to `onSelect`
// as a data URL. It's rendered into <body> so it sits above the form that opened it.
function ImageUploadDialog({ onClose, onSelect }) {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    function readFile(file) {
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Only PNG and JPEG images can be uploaded");
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`Images must be ${MAX_SIZE_MB} MB or smaller`);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => onSelect(reader.result);
        reader.onerror = () => setError("Couldn't read that file");
        reader.readAsDataURL(file);
    }

    // A file dropped anywhere on the overlay counts, so a near miss doesn't open the image in the browser instead.
    function handleDragOver(event) {
        event.preventDefault();
        setDragging(true);
    }

    function handleDragLeave(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        setDragging(false);
        readFile(event.dataTransfer.files[0]);
    }

    return createPortal(
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <Modal title="Upload Image" onClose={onClose}>
                <div className="drop-zone" data-dragging={dragging}>
                    <UploadIcon size={24} />
                    <div className="text-sm font-medium text-[var(--foreground)]">Drag & drop an image here</div>
                    <div className="text-xs">or</div>
                    <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-secondary">
                        Choose File
                    </button>
                    <div className="field-hint mt-1">PNG or JPEG, up to {MAX_SIZE_MB} MB</div>
                </div>
                {error && <p className="field-error mt-2">{error}</p>}
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => {
                        readFile(e.target.files[0]);
                        e.target.value = "";
                    }}
                />
            </Modal>
        </div>,
        document.body
    );
}

export default ImageUploadDialog;
