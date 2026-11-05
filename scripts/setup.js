const fs = require("fs");
const path = require("path");

const privateDir = path.join(__dirname, "..", "private");
const routerPath = path.join(privateDir, "router.json");

// router.json lists every profile as { "name", "id", "current" }, and each profile's data lives in
// private/profiles/<id>/ (see src/lib/profiles.js). A new install starts with no profiles; the app asks for one.
if (fs.existsSync(routerPath)) {
  console.log("Setup already completed");
} else if (fs.existsSync(path.join(privateDir, "info.json"))) {
  // Data from before profiles existed is moved by the app itself, the first time it starts.
  console.log("Your existing info will be moved into a profile the next time the app starts");
} else {
  fs.mkdirSync(privateDir, { recursive: true });
  fs.writeFileSync(routerPath, JSON.stringify([], null, 2) + "\n");
  console.log(`Created ${routerPath}`);
}
