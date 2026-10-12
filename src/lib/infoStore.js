import fs from "fs";
import path from "path";

const INFO_PATH = path.join(process.cwd(), "private", "info.json");

const DEFAULT_INFO = {
    "bank accounts": [],
    "credit cards": [],
    subscriptions: [],
    loans: [],
    "investment accounts": [],
    passwords: [],
};

const CATEGORY_KEYS = {
    "bank-accounts": "bank accounts",
    "credit-cards": "credit cards",
    subscriptions: "subscriptions",
    loans: "loans",
    "investment-accounts": "investment accounts",
};

// The field that names each category's platform; saved logins are grouped by it, so a Chase
// login entered on a bank account is offered again on a Chase credit card.
const PLATFORM_FIELDS = {
    "bank accounts": "bank",
    "credit cards": "bank",
    subscriptions: "subscription",
    loans: "provider",
    "investment accounts": "broker",
};

function loginOf(key, item) {
    return {
        platform: item[PLATFORM_FIELDS[key]] || "",
        username: item.loginUsername || "",
        password: item.loginPassword || "",
    };
}

function sameLogin(a, b) {
    return a.platform === b.platform && a.username === b.username && a.password === b.password;
}

// Adds `login` to `info.passwords` unless it's already saved. With `replacing`, the saved
// login it replaces gets the new password instead of a second entry being added.
function saveLogin(info, login, replacing = null) {
    if (!login.platform || (!login.username && !login.password)) return;

    const passwords = info.passwords || [];
    const replaced = replacing && passwords.find((saved) => sameLogin(saved, replacing));
    if (passwords.some((saved) => sameLogin(saved, login))) {
        if (replaced) info.passwords = passwords.filter((saved) => saved !== replaced);
    } else if (replaced) {
        info.passwords = passwords.map((saved) => (saved === replaced ? { ...saved, password: login.password } : saved));
    } else {
        info.passwords = [...passwords, { id: crypto.randomUUID(), ...login }];
    }
}

// Every item, across categories, signed in with `login`, except the one with `excludeId`.
function itemsUsingLogin(info, login, excludeId) {
    return Object.keys(PLATFORM_FIELDS).flatMap((key) =>
        (info[key] || [])
            .filter((item) => item.id !== excludeId && sameLogin(loginOf(key, item), login))
            .map((item) => ({ key, item }))
    );
}

// Files created before saved logins existed get a "passwords" key built from their items.
function addPasswordsKey(info) {
    info.passwords = [];
    for (const key of Object.keys(PLATFORM_FIELDS)) {
        for (const item of info[key] || []) saveLogin(info, loginOf(key, item));
    }
    writeInfo(info);
}

export function getCategoryKey(category) {
    const key = CATEGORY_KEYS[category];
    if (!key) throw new Error(`Unknown category: ${category}`);
    return key;
}

function readInfo() {
    if (!fs.existsSync(INFO_PATH)) {
        fs.mkdirSync(path.dirname(INFO_PATH), { recursive: true });
        fs.writeFileSync(INFO_PATH, JSON.stringify(DEFAULT_INFO, null, 2) + "\n");
        return { ...DEFAULT_INFO };
    }
    const info = JSON.parse(fs.readFileSync(INFO_PATH, "utf-8"));
    if (!info.passwords) addPasswordsKey(info);
    return info;
}

function writeInfo(info) {
    fs.mkdirSync(path.dirname(INFO_PATH), { recursive: true });
    fs.writeFileSync(INFO_PATH, JSON.stringify(info, null, 2) + "\n");
}

export function listItems(category) {
    const info = readInfo();
    return info[getCategoryKey(category)] || [];
}

export function addItem(category, item) {
    const info = readInfo();
    const key = getCategoryKey(category);
    const newItem = { ...item, id: crypto.randomUUID() };
    info[key] = [...(info[key] || []), newItem];
    saveLogin(info, loginOf(key, newItem));
    writeInfo(info);
    return newItem;
}

// When only the password changed and other items share the old login, `loginMode` says what
// to do: "update-all" changes their password too, "new" saves the password as a separate
// login. Without it nothing is written and `sharedWith` names those items so the user can choose.
export function updateItem(category, id, updates, loginMode = null) {
    const info = readInfo();
    const key = getCategoryKey(category);
    const previous = (info[key] || []).find((item) => item.id === id);
    if (!previous) return { item: null };

    const updated = { ...updates, id };
    const oldLogin = loginOf(key, previous);
    const newLogin = loginOf(key, updated);
    const passwordChanged = oldLogin.password && newLogin.password && oldLogin.password !== newLogin.password
        && oldLogin.platform === newLogin.platform && oldLogin.username === newLogin.username;
    const sharing = passwordChanged ? itemsUsingLogin(info, oldLogin, id) : [];

    if (sharing.length > 0 && !loginMode) {
        return { sharedWith: sharing.map(({ item }) => item.name || "Unnamed item") };
    }

    info[key] = info[key].map((item) => (item.id === id ? updated : item));

    if (sharing.length > 0 && loginMode === "update-all") {
        for (const { key: sharedKey, item: shared } of sharing) {
            info[sharedKey] = info[sharedKey].map((item) =>
                item.id === shared.id ? { ...item, loginPassword: newLogin.password } : item
            );
        }
    }

    const replacesOldLogin = passwordChanged && (sharing.length === 0 || loginMode === "update-all");
    saveLogin(info, newLogin, replacesOldLogin ? oldLogin : null);
    writeInfo(info);
    return { item: updated };
}

export function deleteItem(category, id) {
    const info = readInfo();
    const key = getCategoryKey(category);
    info[key] = (info[key] || []).filter((item) => item.id !== id);
    writeInfo(info);
}

export function reorderItems(category, orderedIds) {
    const info = readInfo();
    const key = getCategoryKey(category);
    const byId = new Map((info[key] || []).map((item) => [item.id, item]));
    info[key] = orderedIds.map((id) => byId.get(id)).filter(Boolean);
    writeInfo(info);
    return info[key];
}

// Replaces all info with an uploaded info.json. Returns false if `data` doesn't look like one:
// it needs at least one category, and every known key it has must be a list.
export function importInfo(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;
    const keys = Object.keys(DEFAULT_INFO);
    if (!Object.values(CATEGORY_KEYS).some((key) => key in data)) return false;
    if (keys.some((key) => key in data && !Array.isArray(data[key]))) return false;

    const info = Object.fromEntries(keys.map((key) => [key, data[key] || []]));
    if ("passwords" in data) writeInfo(info);
    else addPasswordsKey(info);
    return true;
}

export function exportInfo() {
    return JSON.stringify(readInfo(), null, 2) + "\n";
}

// Saved logins, each with the items (`category` is the URL slug) signed in with it.
export function listLogins() {
    const info = readInfo();
    const slugs = Object.fromEntries(Object.entries(CATEGORY_KEYS).map(([slug, key]) => [key, slug]));
    return (info.passwords || []).map((login) => ({
        ...login,
        usedBy: itemsUsingLogin(info, login).map(({ key, item }) => ({ id: item.id, name: item.name, category: slugs[key] })),
    }));
}

// Changes a saved login and every item signed in with it.
export function updateLogin(id, { username = "", password = "" }) {
    const info = readInfo();
    const login = (info.passwords || []).find((saved) => saved.id === id);
    if (!login) return null;

    const updated = { ...login, username, password };
    for (const { key, item: shared } of itemsUsingLogin(info, login)) {
        info[key] = info[key].map((item) =>
            item.id === shared.id ? { ...item, loginUsername: username, loginPassword: password } : item
        );
    }
    // Merges into an identical saved login rather than keeping two copies.
    info.passwords = info.passwords.some((saved) => saved.id !== id && sameLogin(saved, updated))
        ? info.passwords.filter((saved) => saved.id !== id)
        : info.passwords.map((saved) => (saved.id === id ? updated : saved));
    writeInfo(info);
    return updated;
}

// Removes a saved login and clears it from every item signed in with it.
export function deleteLogin(id) {
    const info = readInfo();
    const login = (info.passwords || []).find((saved) => saved.id === id);
    if (!login) return;

    for (const { key, item: shared } of itemsUsingLogin(info, login)) {
        info[key] = info[key].map((item) =>
            item.id === shared.id ? { ...item, loginUsername: "", loginPassword: "" } : item
        );
    }
    info.passwords = info.passwords.filter((saved) => saved.id !== id);
    writeInfo(info);
}
