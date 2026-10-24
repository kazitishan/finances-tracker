const fs = require("fs");
const path = require("path");

const privateDir = path.join(__dirname, "..", "private");
const infoPath = path.join(privateDir, "info.json");

// Budgeting info. Each income stream and additional expense is { "<name>": <monthly amount> }.
const defaultUserInfo = {
  "income-streams": [],
  "additional-expenses": [],
};

if (fs.existsSync(infoPath)) {
  const info = JSON.parse(fs.readFileSync(infoPath, "utf-8"));
  if ("user-info" in info) {
    console.log("Setup already completed");
  } else {
    // Files created before budgeting existed get an empty "user-info" at the top.
    fs.writeFileSync(infoPath, JSON.stringify({ "user-info": defaultUserInfo, ...info }, null, 2) + "\n");
    console.log(`Added "user-info" to ${infoPath}`);
  }
} else {
  const defaultInfo = {
    "user-info": defaultUserInfo,
    "bank accounts": [],
    "credit cards": [],
    "subscriptions": [],
    "loans": [],
    "investment accounts": [],
    "insurance": [],
    "utilities": [],
    "passwords": [],
  };

  if (!fs.existsSync(privateDir)) {
    fs.mkdirSync(privateDir, { recursive: true });
  }

  fs.writeFileSync(infoPath, JSON.stringify(defaultInfo, null, 2) + "\n");

  console.log(`Created ${infoPath}`);
}
