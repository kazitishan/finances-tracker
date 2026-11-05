import fs from "fs";
import path from "path";

const PRIVATE_DIR = path.join(process.cwd(), "private");
const ROUTER_PATH = path.join(PRIVATE_DIR, "router.json");
const PROFILES_DIR = path.join(PRIVATE_DIR, "profiles");

// Before profiles existed, the one user's data was private/info.json and their uploads were in private/uploads.
const LEGACY_INFO_PATH = path.join(PRIVATE_DIR, "info.json");
const LEGACY_UPLOADS_DIR = path.join(PRIVATE_DIR, "uploads");

// An id is a folder name under private/profiles, so it can't hold anything that leaves that folder.
const PROFILE_ID = /^[A-Za-z0-9_-]+$/;

// router.json lists every profile as { name, id, current }. At most one is `current`: the signed-in profile,
// whose private/profiles/<id>/ (an info.json and an uploads folder) every other request reads and writes.
// When none is, no one is signed in and the app asks which profile to use.
function writeRouter(profiles) {
    fs.mkdirSync(PRIVATE_DIR, { recursive: true });
    fs.writeFileSync(ROUTER_PATH, JSON.stringify(profiles, null, 2) + "\n");
}

// Moves the legacy info.json and uploads into a new signed-in profile, named after the info's old "profile" name,
// which only router.json keeps now.
function migrateLegacyInfo() {
    const id = crypto.randomUUID();
    const uploadsDir = path.join(PROFILES_DIR, id, "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const { profile, ...info } = JSON.parse(fs.readFileSync(LEGACY_INFO_PATH, "utf-8"));
    fs.writeFileSync(path.join(PROFILES_DIR, id, "info.json"), JSON.stringify(info, null, 2) + "\n");
    if (fs.existsSync(LEGACY_UPLOADS_DIR)) {
        for (const file of fs.readdirSync(LEGACY_UPLOADS_DIR)) {
            if (file !== "README.md") fs.renameSync(path.join(LEGACY_UPLOADS_DIR, file), path.join(uploadsDir, file));
        }
        fs.rmSync(LEGACY_UPLOADS_DIR, { recursive: true, force: true });
    }
    fs.rmSync(LEGACY_INFO_PATH);
    return [{ name: profile?.name?.trim() ?? "", id, current: true }];
}

// Creates router.json if it's missing. Ids are kept as strings, entries whose id isn't a safe folder name are
// skipped, and if more than one profile is `current` only the first one counts.
function readRouter() {
    if (!fs.existsSync(ROUTER_PATH)) writeRouter(fs.existsSync(LEGACY_INFO_PATH) ? migrateLegacyInfo() : []);
    const profiles = JSON.parse(fs.readFileSync(ROUTER_PATH, "utf-8"))
        .map((profile) => ({ ...profile, id: String(profile.id) }))
        .filter((profile) => PROFILE_ID.test(profile.id));
    const currentId = profiles.find((profile) => profile.current === true)?.id;
    return profiles.map((profile) => ({
        name: typeof profile.name === "string" ? profile.name : "",
        id: profile.id,
        current: profile.id === currentId,
    }));
}

export function listProfiles() {
    return readRouter();
}

// The signed-in profile, or null if no one is.
export function currentProfile() {
    return readRouter().find((profile) => profile.current) ?? null;
}

// The signed-in profile's folder. Throws if no one is signed in, so nothing is read or written for no one.
export function currentProfileDir() {
    const profile = currentProfile();
    if (!profile) throw new Error("No profile is signed in");
    return path.join(PROFILES_DIR, profile.id);
}

function isName(name) {
    return typeof name === "string" && name.trim() !== "";
}

// Adds a profile and signs in to it. Returns null, writing nothing, if the name is blank. Its info.json is
// written the first time it's read.
export function createProfile(name) {
    if (!isName(name)) return null;
    const profile = { name: name.trim(), id: crypto.randomUUID(), current: true };
    fs.mkdirSync(path.join(PROFILES_DIR, profile.id, "uploads"), { recursive: true });
    writeRouter([...readRouter().map((saved) => ({ ...saved, current: false })), profile]);
    return profile;
}

// Makes the profile with `id` the only current one. Returns it, or null if there's no such profile.
export function signIn(id) {
    const profiles = readRouter();
    if (!profiles.some((profile) => profile.id === id)) return null;
    const updated = profiles.map((profile) => ({ ...profile, current: profile.id === id }));
    writeRouter(updated);
    return updated.find((profile) => profile.current);
}

export function signOut() {
    writeRouter(readRouter().map((profile) => ({ ...profile, current: false })));
}

// Renames the signed-in profile. Returns it, or null, writing nothing, if no one is signed in or the name is
// blank: once set, a name can be changed but not cleared.
export function renameCurrentProfile(name) {
    const profiles = readRouter();
    if (!isName(name) || !profiles.some((profile) => profile.current)) return null;
    const updated = profiles.map((profile) => (profile.current ? { ...profile, name: name.trim() } : profile));
    writeRouter(updated);
    return updated.find((profile) => profile.current);
}
