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
    passwords: "passwords",
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

// Adds the item's login to `info.passwords`, or updates the password of a saved login with
// the same platform and username.
function saveLogin(info, key, item) {
    const platform = item[PLATFORM_FIELDS[key]];
    const username = item.loginUsername || "";
    const password = item.loginPassword || "";
    if (!platform || (!username && !password)) return;

    const passwords = info.passwords || [];
    const existing = passwords.find((login) => login.platform === platform && login.username === username);
    if (!existing) {
        info.passwords = [...passwords, { id: crypto.randomUUID(), platform, username, password }];
    } else if (password && existing.password !== password) {
        info.passwords = passwords.map((login) => (login === existing ? { ...login, password } : login));
    }
}

// Files created before saved logins existed get a "passwords" key built from their items.
function addPasswordsKey(info) {
    info.passwords = [];
    for (const key of Object.keys(PLATFORM_FIELDS)) {
        for (const item of info[key] || []) saveLogin(info, key, item);
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
    saveLogin(info, key, newItem);
    writeInfo(info);
    return newItem;
}

export function updateItem(category, id, updates) {
    const info = readInfo();
    const key = getCategoryKey(category);
    let updated = null;
    info[key] = (info[key] || []).map((item) => {
        if (item.id !== id) return item;
        updated = { ...updates, id };
        return updated;
    });
    if (updated) saveLogin(info, key, updated);
    writeInfo(info);
    return updated;
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
