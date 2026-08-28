const fs = require("fs");
const path = require("path");

const privateDir = path.join(__dirname, "..", "private");
const infoPath = path.join(privateDir, "info.json");

if (fs.existsSync(infoPath)) {
  console.log("Setup already completed");
} else {
  const defaultInfo = {
    "bank accounts": [],
    "credit cards": [],
    "subscriptions": [],
    "loans": [],
  };

  if (!fs.existsSync(privateDir)) {
    fs.mkdirSync(privateDir, { recursive: true });
  }

  fs.writeFileSync(infoPath, JSON.stringify(defaultInfo, null, 2) + "\n");

  console.log(`Created ${infoPath}`);
}
