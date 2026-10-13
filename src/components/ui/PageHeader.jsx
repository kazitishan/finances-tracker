import { ArrowUpDownIcon, PlusIcon } from "@/components/ui/icons";
import SearchInput from "@/components/ui/SearchInput";
import FilterMenu from "@/components/ui/FilterMenu";

function PageHeader({ title, count, stats = [], search, onSearchChange, filters, onRearrange, onAdd }) {
    const visibleStats = stats.filter((stat) => stat.value);

    return (
        <div className="mb-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
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
            {onSearchChange && count > 0 && (
                <div className="mt-4 flex gap-2">
                    <SearchInput
                        value={search}
                        onChange={onSearchChange}
                        placeholder={`Search ${title.toLowerCase()}...`}
                        className="flex-1 min-w-0"
                    />
                    {filters && <FilterMenu filters={filters} />}
                </div>
            )}
        </div>
    );
}

export default PageHeader;
