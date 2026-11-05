const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const privateDir = path.join(__dirname, "..", "private");
const routerPath = path.join(privateDir, "router.json");
const profilesDir = path.join(privateDir, "profiles");

// Before profiles existed, the one user's data was private/info.json and their uploads were in private/uploads.
const legacyInfoPath = path.join(privateDir, "info.json");
const legacyUploadsDir = path.join(privateDir, "uploads");

// Budgeting info. Income streams are described in src/lib/incomeStreams.js. Each additional expense is
// { "<name>": <monthly amount> }.
const defaultUserInfo = {
  "income-streams": [],
  "additional-expenses": [],
};

// Matches DEFAULT_INFO in src/lib/infoStore.js.
const defaultInfo = {
  "user-info": defaultUserInfo,
  "bank accounts": [],
  "credit cards": [],
  "subscriptions": [],
  "loans": [],
  "investment accounts": [],
  "insurance": [],
  "utilities": [],
  "other expenses": [],
  "passwords": [],
};

// Matches PROFILE_ID in src/lib/profiles.js: an id is a folder name, so it can't leave private/profiles.
const profileId = /^[A-Za-z0-9_-]+$/;

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

// Moves the legacy info.json and uploads into a new signed-in profile, the same way migrateLegacyInfo() in
// src/lib/profiles.js does when the app starts first.
function migrateLegacyInfo() {
  const id = crypto.randomUUID();
  const uploadsDir = path.join(profilesDir, id, "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const { profile, ...info } = JSON.parse(fs.readFileSync(legacyInfoPath, "utf-8"));
  writeJson(path.join(profilesDir, id, "info.json"), info);
  if (fs.existsSync(legacyUploadsDir)) {
    for (const file of fs.readdirSync(legacyUploadsDir)) {
      if (file !== "README.md") fs.renameSync(path.join(legacyUploadsDir, file), path.join(uploadsDir, file));
    }
    fs.rmSync(legacyUploadsDir, { recursive: true, force: true });
  }
  fs.rmSync(legacyInfoPath);
  console.log(`Moved ${legacyInfoPath} into profile ${id}`);
  return [{ name: profile?.name?.trim() ?? "", id, current: true }];
}

fs.mkdirSync(profilesDir, { recursive: true });

if (!fs.existsSync(routerPath)) {
  writeJson(routerPath, fs.existsSync(legacyInfoPath) ? migrateLegacyInfo() : []);
  console.log(`Created ${routerPath}`);
}

// Every profile in router.json gets its folder, an uploads folder and an info.json. An info.json from before
// budgeting existed gets an empty "user-info" at the top.
for (const { id } of JSON.parse(fs.readFileSync(routerPath, "utf-8"))) {
  if (!profileId.test(String(id))) {
    console.log(`Skipped profile ${JSON.stringify(id)}: its id can't be a folder name`);
    continue;
  }
  const profileDir = path.join(profilesDir, String(id));
  const infoPath = path.join(profileDir, "info.json");
  fs.mkdirSync(path.join(profileDir, "uploads"), { recursive: true });

  if (!fs.existsSync(infoPath)) {
    writeJson(infoPath, defaultInfo);
    console.log(`Created ${infoPath}`);
  } else {
    const info = JSON.parse(fs.readFileSync(infoPath, "utf-8"));
    if (!("user-info" in info)) {
      writeJson(infoPath, { "user-info": defaultUserInfo, ...info });
      console.log(`Added "user-info" to ${infoPath}`);
    }
  }
}

console.log("Setup complete");
