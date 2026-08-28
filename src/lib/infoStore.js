import fs from "fs";
import path from "path";

const INFO_PATH = path.join(process.cwd(), "private", "info.json");

const DEFAULT_INFO = {
    "bank accounts": [],
    "credit cards": [],
    subscriptions: [],
    loans: [],
};

const CATEGORY_KEYS = {
    "bank-accounts": "bank accounts",
    "credit-cards": "credit cards",
    subscriptions: "subscriptions",
    loans: "loans",
};

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
    return JSON.parse(fs.readFileSync(INFO_PATH, "utf-8"));
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
