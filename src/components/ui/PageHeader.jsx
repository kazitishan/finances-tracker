import { ArrowUpDownIcon, PlusIcon } from "@/components/ui/icons";
import SearchInput from "@/components/ui/SearchInput";
import FilterMenu from "@/components/ui/FilterMenu";

// The top of every page. Rearrange and Add show only when their handlers are passed; the search and filter row
// shows once there's something to search.
function PageHeader({
    title,
    count,
    stats = [],
    description,
    search,
    onSearchChange,
    searchPlaceholder = `Search ${title.toLowerCase()}...`,
    filters,
    onRearrange,
    onAdd,
}) {
    const visibleStats = stats.filter((stat) => stat.value);
    const hasCount = count !== null && count !== undefined;

    return (
        <div className="mb-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {(hasCount || visibleStats.length > 0 || description) && (
                        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1 text-sm text-muted">
                            {hasCount && <span>{count} total</span>}
                            {visibleStats.map((stat) => (
                                <span key={stat.label}>
                                    {stat.label}: <span className="font-medium text-foreground">{stat.value}</span>
                                </span>
                            ))}
                            {description && <span>{description}</span>}
                        </div>
                    )}
                </div>
                {(onRearrange || onAdd) && (
                    <div className="flex gap-2">
                        {onRearrange && (
                            <button type="button" onClick={onRearrange} className="btn btn-secondary">
                                <ArrowUpDownIcon size={14} />
                                Rearrange
                            </button>
                        )}
                        {onAdd && (
                            <button type="button" onClick={onAdd} className="btn btn-primary">
                                <PlusIcon size={14} />
                                Add
                            </button>
                        )}
                    </div>
                )}
            </div>
            {onSearchChange && count > 0 && (
                <div className="mt-4 flex gap-2">
                    <SearchInput
                        value={search}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                        className="flex-1 min-w-0"
                    />
                    {filters && <FilterMenu filters={filters} />}
                </div>
            )}
        </div>
    );
}

export default PageHeader;
