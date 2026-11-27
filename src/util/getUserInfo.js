// The user's budgeting info from the signed-in profile's info.json:
// { "income-streams": [...], "additional-expenses": [...], "credit-scores": [...], "credit-score-reminder": "",
//   "tax-info": {...} }, where income streams are described in lib/incomeStreams.js, each additional expense is
// { "<name>": <monthly amount> }, credit scores and the reminder are described in lib/creditScores.js, and tax info
// in lib/taxInfo.js. Files from before credit scores existed have neither of those two, and files from before tax
// info existed have no "tax-info".
export async function getUserInfo() {
    const res = await fetch("/api/user-info");
    if (!res.ok) throw new Error(`Couldn't load user info: ${res.status}`);
    return res.json();
}
