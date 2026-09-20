import { PlusIcon } from "@/components/ui/icons";

function EmptyState({ noun, onAdd }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-strong)] py-16 text-center">
            <p className="text-sm text-muted">No {noun} yet.</p>
            <button type="button" onClick={onAdd} className="btn btn-secondary">
                <PlusIcon size={14} />
                Add your first
            </button>
        </div>
    );
}

export default EmptyState;
