import { ArrowUpDownIcon, PlusIcon } from "@/components/ui/icons";

function PageHeader({ title, count, stats = [], onRearrange, onAdd }) {
    const visibleStats = stats.filter((stat) => stat.value);

    return (
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1 text-sm text-muted">
                    {count !== null && count !== undefined && <span>{count} total</span>}
                    {visibleStats.map((stat) => (
                        <span key={stat.label}>
                            {stat.label}: <span className="font-medium text-foreground">{stat.value}</span>
                        </span>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={onRearrange} className="btn btn-secondary">
                    <ArrowUpDownIcon size={14} />
                    Rearrange
                </button>
                <button type="button" onClick={onAdd} className="btn btn-primary">
                    <PlusIcon size={14} />
                    Add
                </button>
            </div>
        </div>
    );
}

export default PageHeader;
