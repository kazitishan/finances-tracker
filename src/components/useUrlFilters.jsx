"use client";

import { useSearchParams } from "next/navigation";

// Filters live in the URL (e.g. /credit-cards?bank=Chase&bank=SoFi), so a filtered view can be bookmarked or shared.
// Each definition is { key, label, getValue(item), getImage?(value) }; the options offered are only the values
// that appear in the user's own items. URL values match case-insensitively, so ?bank=chase works too.
export function useUrlFilters(items, definitions) {
    const searchParams = useSearchParams();

    const groups = definitions.map((definition) => {
        const counts = new Map();
        for (const item of items) {
            const value = definition.getValue(item);
            if (value) counts.set(value, (counts.get(value) || 0) + 1);
        }
        const options = [...counts]
            .map(([value, count]) => ({ value, count, image: definition.getImage?.(value) }))
            .sort((a, b) => a.value.localeCompare(b.value));
        const selected = searchParams.getAll(definition.key).map((value) => value.toLowerCase());
        return { ...definition, options, selected };
    });

    function writeParams(update) {
        const params = new URLSearchParams(searchParams.toString());
        update(params);
        const query = params.toString();
        window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
    }

    function toggle(key, value) {
        writeParams((params) => {
            const current = params.getAll(key);
            const isSelected = current.some((selected) => selected.toLowerCase() === value.toLowerCase());
            params.delete(key);
            const next = isSelected
                ? current.filter((selected) => selected.toLowerCase() !== value.toLowerCase())
                : [...current, value];
            next.forEach((selected) => params.append(key, selected));
        });
    }

    function clear() {
        writeParams((params) => definitions.forEach((definition) => params.delete(definition.key)));
    }

    function matches(item) {
        return groups.every((group) => {
            if (group.selected.length === 0) return true;
            const value = group.getValue(item);
            return Boolean(value) && group.selected.includes(value.toLowerCase());
        });
    }

    const activeCount = groups.reduce((sum, group) => sum + group.selected.length, 0);

    return { groups, toggle, clear, matches, activeCount };
}
