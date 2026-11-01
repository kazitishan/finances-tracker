"use client";

import { useSearchParams } from "next/navigation";

// The values of `definition` found in `items`, each with the items that have it.
function optionsFor(definition, items) {
    const itemsByValue = new Map();
    for (const item of items) {
        const value = definition.getValue(item);
        if (value) itemsByValue.set(value, [...(itemsByValue.get(value) || []), item]);
    }
    return [...itemsByValue]
        .map(([value, valueItems]) => ({ value, items: valueItems, count: valueItems.length, image: definition.getImage?.(value, valueItems) }))
        .sort((a, b) => a.value.localeCompare(b.value));
}

function removeValues(params, key, values) {
    const removed = values.map((value) => value.toLowerCase());
    const remaining = params.getAll(key).filter((value) => !removed.includes(value.toLowerCase()));
    params.delete(key);
    remaining.forEach((value) => params.append(key, value));
}

// Filters live in the URL (e.g. /credit-cards?bank=Chase&bank=SoFi), so a filtered view can be bookmarked or shared.
// Each definition is { key, label, getValue(item), getImage?(value, items), sub? }, where `items` are the items with
// that value; the options offered are only the values that appear in the user's own items. URL values match
// case-insensitively, so ?bank=chase works too.
// `sub` ({ key, getValue(item) }) adds narrower options under each option, offered once that option is selected
// (e.g. /?show=Expenses&type=Loans). Each selected option is narrowed separately, and sub-values do nothing without it.
export function useUrlFilters(items, definitions) {
    const searchParams = useSearchParams();
    const selectedFor = (key) => searchParams.getAll(key).map((value) => value.toLowerCase());

    const groups = definitions.map((definition) => {
        const options = optionsFor(definition, items).map((option) => {
            if (!definition.sub) return option;
            const subOptions = optionsFor(definition.sub, option.items);
            const selected = selectedFor(definition.sub.key)
                .filter((value) => subOptions.some((subOption) => subOption.value.toLowerCase() === value));
            return { ...option, sub: { key: definition.sub.key, options: subOptions, selected } };
        });
        return { ...definition, options, selected: selectedFor(definition.key) };
    });

    function writeParams(update) {
        const params = new URLSearchParams(searchParams.toString());
        update(params);
        const query = params.toString();
        window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
    }

    function toggle(key, value) {
        writeParams((params) => {
            const isSelected = params.getAll(key).some((selected) => selected.toLowerCase() === value.toLowerCase());
            removeValues(params, key, [value]);
            if (!isSelected) {
                params.append(key, value);
                return;
            }
            // Unselecting an option also drops what was narrowing it.
            const sub = groups.find((group) => group.key === key)?.options.find((option) => option.value === value)?.sub;
            if (sub) removeValues(params, sub.key, sub.options.map((subOption) => subOption.value));
        });
    }

    function clear() {
        writeParams((params) => definitions.forEach((definition) => {
            params.delete(definition.key);
            if (definition.sub) params.delete(definition.sub.key);
        }));
    }

    function matches(item) {
        return groups.every((group) => {
            if (group.selected.length === 0) return true;
            const value = group.getValue(item);
            if (!value || !group.selected.includes(value.toLowerCase())) return false;
            const sub = group.options.find((option) => option.value === value)?.sub;
            if (!sub || sub.selected.length === 0) return true;
            return sub.selected.includes(group.sub.getValue(item)?.toLowerCase());
        });
    }

    const activeCount = groups.reduce((sum, group) => {
        const subCount = group.options
            .filter((option) => option.sub && group.selected.includes(option.value.toLowerCase()))
            .reduce((total, option) => total + option.sub.selected.length, 0);
        return sum + group.selected.length + subCount;
    }, 0);

    return { groups, toggle, clear, matches, activeCount };
}
