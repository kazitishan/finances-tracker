import { SearchIcon, XIcon } from "@/components/ui/icons";

function SearchInput({ value, onChange, placeholder }) {
    return (
        <div className="relative mt-4">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <SearchIcon size={15} />
            </span>
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onChange("")}
                placeholder={placeholder}
                className="field pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
                aria-label={placeholder}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                    aria-label="Clear search"
                >
                    <XIcon size={14} />
                </button>
            )}
        </div>
    );
}

export function NoMatches({ query }) {
    return <p className="py-10 text-center text-sm text-muted">No matches for &ldquo;{query.trim()}&rdquo;.</p>;
}

export default SearchInput;
