import fs from "fs";
import path from "path";
import { emptyIncomeStream } from "@/lib/incomeStreams";
import { itemName } from "@/lib/itemNames";
import { builtInLogo, utilityIcon } from "@/lib/logos";
import { currentProfileDir } from "@/lib/profiles";
import { deleteUpload, isPendingUpload, isUpload, moveLegacyUpload, saveUpload } from "@/lib/uploads";

// The signed-in profile's info.json, private/profiles/<id>/info.json (see lib/profiles.js). Throws if no one is
// signed in.
function infoPath() {
    return path.join(currentProfileDir(), "info.json");
}

// Budgeting info. Income streams are described in lib/incomeStreams.js. Each additional expense is a
// one-key object, { "<name>": <monthly amount> }, e.g. { "Rent": 3500 }.
const DEFAULT_USER_INFO = {
    "income-streams": [],
    "additional-expenses": [],
};

const DEFAULT_INFO = {
    "user-info": DEFAULT_USER_INFO,
    "bank accounts": [],
    "credit cards": [],
    subscriptions: [],
    loans: [],
    "investment accounts": [],
    insurance: [],
    utilities: [],
    "other expenses": [],
    passwords: [],
};

const CATEGORY_KEYS = {
    "bank-accounts": "bank accounts",
    "credit-cards": "credit cards",
    subscriptions: "subscriptions",
    loans: "loans",
    "investment-accounts": "investment accounts",
    insurance: "insurance",
    utilities: "utilities",
    "other-expenses": "other expenses",
};
const CATEGORY_SLUGS = Object.fromEntries(Object.entries(CATEGORY_KEYS).map(([slug, key]) => [key, slug]));

// The field that names each category's platform; saved logins are grouped by it, so a Chase
// login entered on a bank account is offered again on a Chase credit card.
// Other expenses have none: they have no login.
const PLATFORM_FIELDS = {
    "bank accounts": "bank",
    "credit cards": "bank",
    subscriptions: "subscription",
    loans: "provider",
    "investment accounts": "broker",
    insurance: "provider",
    utilities: "provider",
};

// Every category with a platform also stores a picture in `img`: the platform's built-in logo, or the image
// uploaded for a platform added through "Other" ("" if none was). Utilities are pictured by their type instead.
// Other expenses have no picture. The server always works it out, so whatever `img` the form sent is only used
// as the upload: a data URL picked in the form, written to the profile's uploads folder, or the item's existing upload.
function imageFor(key, item) {
    if (key === "utilities") return utilityIcon(item.type);
    const platform = item[PLATFORM_FIELDS[key]];
    const builtIn = builtInLogo(key, platform);
    if (builtIn) return builtIn;
    if (isPendingUpload(item.img)) return saveUpload(platform, item.img);
    return isUpload(item.img) ? item.img : "";
}

function withImage(key, item) {
    return key in PLATFORM_FIELDS ? { ...item, img: imageFor(key, item) } : item;
}

// A copy of `object` with `key` added right after `afterKey` (or at the end, if it has no `afterKey`).
function insertAfter(object, afterKey, key, value) {
    if (!(afterKey in object)) return { ...object, [key]: value };
    return Object.fromEntries(Object.entries(object).flatMap((entry) => (entry[0] === afterKey ? [entry, [key, value]] : [entry])));
}

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

// "user-info" always comes first in the file. Files from before budgeting existed get an empty one.
function withUserInfoFirst(info) {
    const { "user-info": userInfo = DEFAULT_USER_INFO, ...rest } = info;
    return { "user-info": userInfo, ...rest };
}

// A one-key { "<name>": <monthly amount> } object with a name and a non-negative amount.
function isAmountEntry(entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
    const entries = Object.entries(entry);
    if (entries.length !== 1) return false;
    const [name, amount] = entries[0];
    return name.trim() !== "" && Number.isFinite(amount) && amount >= 0;
}

// Income streams used to be { "<name>": <monthly amount> } too. Each becomes a stream paid once a month, which
// keeps its amount in the budget; its pay date gets filled in the next time it's edited.
function migrateIncomeStreams(info) {
    const streams = info["user-info"]["income-streams"] ?? [];
    if (!streams.some(isAmountEntry)) return;
    info["user-info"] = {
        ...info["user-info"],
        "income-streams": streams.map((stream) => {
            if (!isAmountEntry(stream)) return stream;
            const [name, amount] = Object.entries(stream)[0];
            return { ...emptyIncomeStream, id: crypto.randomUUID(), name, frequency: "monthly", paycheckAmount: String(amount) };
        }),
    };
    writeInfo(info);
}

// Items saved before `img` existed get one, right after the field it comes from. A platform added through "Other"
// had its upload's path in `customLogo`, under public/<folder>/uploads; that file moves to the profile's uploads folder.
function migrateImages(info) {
    let changed = false;
    for (const key of Object.keys(PLATFORM_FIELDS)) {
        if (!info[key]?.some((item) => !("img" in item))) continue;
        changed = true;
        info[key] = info[key].map((item) => {
            if ("img" in item) return item;
            const { customLogo, ...rest } = item;
            if (key === "utilities") return insertAfter(rest, "type", "img", utilityIcon(item.type));
            const field = PLATFORM_FIELDS[key];
            return insertAfter(rest, field, "img", builtInLogo(key, item[field]) || moveLegacyUpload(customLogo));
        });
    }
    if (changed) writeInfo(info);
}

function readInfo() {
    const file = infoPath();
    if (!fs.existsSync(file)) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(DEFAULT_INFO, null, 2) + "\n");
        return structuredClone(DEFAULT_INFO);
    }
    const info = withUserInfoFirst(JSON.parse(fs.readFileSync(file, "utf-8")));
    if (!info.passwords) addPasswordsKey(info);
    migrateIncomeStreams(info);
    migrateImages(info);
    return info;
}

function writeInfo(info) {
    const file = infoPath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(withUserInfoFirst(info), null, 2) + "\n");
}

function isIncomeStream(entry) {
    return Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
        && typeof entry.id === "string" && entry.id !== ""
        && typeof entry.name === "string" && entry.name.trim() !== ""
        && Number(entry.paycheckAmount) >= 0 && Number(entry.monthlyEstimate ?? 0) >= 0;
}

// Old-style entries are allowed so an older download can be imported; readInfo() migrates them.
function isUserInfo(value) {
    const incomeStreams = value?.["income-streams"] ?? [];
    const additionalExpenses = value?.["additional-expenses"] ?? [];
    return Boolean(value) && typeof value === "object" && !Array.isArray(value)
        && Array.isArray(incomeStreams) && incomeStreams.every((entry) => isIncomeStream(entry) || isAmountEntry(entry))
        && Array.isArray(additionalExpenses) && additionalExpenses.every(isAmountEntry);
}

export function getUserInfo() {
    return readInfo()["user-info"];
}

// Replaces the budgeting info. Returns null, writing nothing, if `userInfo` isn't shaped like DEFAULT_USER_INFO.
export function updateUserInfo(userInfo) {
    if (!isUserInfo(userInfo)) return null;
    const info = readInfo();
    info["user-info"] = {
        "income-streams": userInfo["income-streams"] ?? [],
        "additional-expenses": userInfo["additional-expenses"] ?? [],
    };
    writeInfo(info);
    return info["user-info"];
}

export function listItems(category) {
    const info = readInfo();
    return info[getCategoryKey(category)] || [];
}

export function addItem(category, item) {
    const info = readInfo();
    const key = getCategoryKey(category);
    const newItem = withImage(key, { ...item, id: crypto.randomUUID() });
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
        return { sharedWith: sharing.map(({ key, item }) => itemName(CATEGORY_SLUGS[key], item)) };
    }

    const saved = withImage(key, updated);
    if (saved.img !== previous.img) deleteUpload(previous.img);
    info[key] = info[key].map((item) => (item.id === id ? saved : item));

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
    return { item: saved };
}

export function deleteItem(category, id) {
    const info = readInfo();
    const key = getCategoryKey(category);
    deleteUpload((info[key] || []).find((item) => item.id === id)?.img);
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

// Replaces all of the signed-in profile's info with an uploaded info.json. Returns false if `data` doesn't look
// like one: it needs at least one category, every known list key it has must be a list, and its budgeting info
// (optional, for files from before it existed) must be well-formed. The profile's name lives in router.json, so a
// "profile" key, which downloads from before profiles had, is ignored.
export function importInfo(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;
    const listKeys = Object.keys(DEFAULT_INFO).filter((key) => key !== "user-info");
    if (!Object.values(CATEGORY_KEYS).some((key) => key in data)) return false;
    if (listKeys.some((key) => key in data && !Array.isArray(data[key]))) return false;
    if ("user-info" in data && !isUserInfo(data["user-info"])) return false;

    const info = {
        "user-info": { ...DEFAULT_USER_INFO, ...data["user-info"] },
        ...Object.fromEntries(listKeys.map((key) => [key, data[key] || []])),
    };
    if ("passwords" in data) writeInfo(info);
    else addPasswordsKey(info);
    return true;
}

export function exportInfo() {
    return JSON.stringify(readInfo(), null, 2) + "\n";
}

// Saved logins, each with the items (`category` is the URL slug) signed in with it, and the `img` of the
// first of those items that has one.
export function listLogins() {
    const info = readInfo();
    return (info.passwords || []).map((login) => {
        const usedBy = itemsUsingLogin(info, login);
        return {
            ...login,
            img: usedBy.find(({ item }) => item.img)?.item.img || "",
            usedBy: usedBy.map(({ key, item }) => ({ id: item.id, name: itemName(CATEGORY_SLUGS[key], item), category: CATEGORY_SLUGS[key] })),
        };
    });
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
