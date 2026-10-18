"use client";

import { useState } from "react";
import Image from "next/image";
import ImageUploadDialog from "@/components/modals/ImageUploadDialog";
import { ImageIcon } from "@/components/ui/icons";

// A square button showing `image` (a path or data URL) that opens a dialog to pick a new one.
function ImageUploadButton({ image, onChange }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="group relative shrink-0">
            <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="upload-tile"
                data-filled={Boolean(image)}
                aria-label="Upload Image"
            >
                {image ? (
                    <Image src={image} alt="" width={38} height={38} className="h-full w-full object-cover" />
                ) : (
                    <ImageIcon />
                )}
            </button>
            <span className="tooltip" aria-hidden="true">Upload Image</span>

            {isDialogOpen && (
                <ImageUploadDialog
                    onClose={() => setIsDialogOpen(false)}
                    onSelect={(dataUrl) => {
                        onChange(dataUrl);
                        setIsDialogOpen(false);
                    }}
                />
            )}
        </div>
    );
}

export default ImageUploadButton;
