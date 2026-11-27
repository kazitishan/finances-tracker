// The user's budgeting info from the signed-in profile's info.json:
// { "income-streams": [...], "additional-expenses": [...], "credit-scores": [...], "credit-score-reminder": "" },
// where income streams are described in lib/incomeStreams.js, each additional expense is { "<name>": <monthly amount> },
// and credit scores and the reminder are described in lib/creditScores.js. Files from before credit scores existed
// have neither of the last two.
export async function getUserInfo() {
    const res = await fetch("/api/user-info");
    if (!res.ok) throw new Error(`Couldn't load user info: ${res.status}`);
    return res.json();
}
