import { PlusIcon } from "@/components/ui/icons";

// Shown when a page has nothing yet: "No <noun> yet." with an Add button, or `children` as the message instead.
function EmptyState({ noun, onAdd, children }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-strong)] px-6 py-16 text-center">
            <p className="text-sm text-muted">{children || `No ${noun} yet.`}</p>
            {onAdd && (
                <button type="button" onClick={onAdd} className="btn btn-secondary">
                    <PlusIcon size={14} />
                    Add your first
                </button>
            )}
        </div>
    );
}

export default EmptyState;
