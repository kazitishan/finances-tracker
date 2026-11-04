import platforms from "@/data/platforms.json";

// The built-in platforms each category picks from, by storage key. Insurance checks both lists so a policy keeps
// its logo if its type changes after the provider was picked.
const PLATFORM_OPTIONS = {
    "bank accounts": platforms.bank,
    "credit cards": platforms.bank,
    subscriptions: platforms.subscription,
    loans: [...platforms.bank, ...platforms["loan-provider"]],
    "investment accounts": platforms.broker,
    insurance: [...platforms.healthInsurance, ...platforms.insurance],
};

const UTILITY_ICONS = {
    Water: "/utilities/water.svg",
    Energy: "/utilities/energy.svg",
    Gas: "/utilities/gas.svg",
    Internet: "/utilities/wifi.svg",
    Phone: "/utilities/phone.svg",
    "Cable TV": "/utilities/tv.svg",
    Trash: "/utilities/trash.svg",
};

// The built-in logo of the platform `name` in the category stored under `key`, or undefined when it isn't one
// (it was added through "Other").
export function builtInLogo(key, name) {
    return PLATFORM_OPTIONS[key]?.find((option) => option.name === name)?.image;
}

// Utilities are pictured by their type rather than a provider logo; "Other" (or no type) gets a general one.
export function utilityIcon(type) {
    return UTILITY_ICONS[type] || "/utilities/utility.svg";
}

// For a filter option: the image of the first of its items that has one.
export function imageOf(items) {
    return items.find((item) => item.img)?.img;
}
