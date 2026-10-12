"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRightIcon, ChevronDownIcon, PencilIcon } from "@/components/ui/icons";

// Header layout shared by every card: subtitle for identifying details, tags for categories
// (strings, or { label, tone: "danger" } for warnings), and an optional `stat` ({ label, value, caption }) for the single key figure,
// shown in the header and again on its own line when expanded.
function InfoCard({ image, imageAlt, title, subtitle, tags = [], stat, link, onEdit, children }) {
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
                    <div className="text-sm text-muted truncate">{subtitle || "—"}</div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {tags.map((tag, index) =>
                                typeof tag === "string" ? (
                                    <span key={index} className="chip">{tag}</span>
                                ) : (
                                    <span key={index} className={`chip${tag.tone === "danger" ? " chip-danger" : ""}`}>{tag.label}</span>
                                )
                            )}
                        </div>
                    )}
                </div>
                {stat?.value && (
                    <div className="key-stat">
                        <div className="key-stat-value">{stat.value}</div>
                        {stat.caption && <div className="key-stat-label">{stat.caption}</div>}
                    </div>
                )}
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
                    <div className="mx-4 mb-4 pt-3 border-t border-[var(--border)]">
                        {stat?.value && (
                            <div className="key-stat-row">
                                <span className="text-sm font-medium">{stat.label}</span>
                                <span className="text-lg font-semibold tabular-nums">{stat.value}</span>
                            </div>
                        )}
                        <div className="card-body">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoCard;
