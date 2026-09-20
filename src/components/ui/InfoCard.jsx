"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRightIcon, ChevronDownIcon, PencilIcon } from "@/components/ui/icons";

function InfoCard({ image, imageAlt, title, subtitle, badges, link, onEdit, children }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="card">
            <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setExpanded((prev) => !prev)}
            >
                <div className="logo-tile">
                    {image && (
                        <Image src={image} alt={imageAlt || ""} width={40} height={40} className="h-full w-full object-cover" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{title}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted truncate">{subtitle || "—"}</span>
                        {badges}
                    </div>
                </div>
                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="link-btn"
                    >
                        Open
                        <ArrowUpRightIcon size={12} />
                    </a>
                )}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="icon-btn shrink-0"
                    aria-label="Edit"
                >
                    <PencilIcon size={15} />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((prev) => !prev);
                    }}
                    className="icon-btn shrink-0"
                    aria-label="Toggle details"
                    aria-expanded={expanded}
                >
                    <span
                        className="block transition-transform duration-200"
                        style={{ transform: expanded ? "rotate(180deg)" : "none" }}
                    >
                        <ChevronDownIcon />
                    </span>
                </button>
            </div>

            <div className="expand" data-open={expanded}>
                <div inert={!expanded}>
                    <div className="mx-4 mb-4 pt-3 border-t border-[var(--border)]">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default InfoCard;
