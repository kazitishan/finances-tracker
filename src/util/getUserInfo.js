// The user's budgeting info from the signed-in profile's info.json: { "income-streams": [...], "additional-expenses": [...] },
// where income streams are described in lib/incomeStreams.js and each additional expense is { "<name>": <monthly amount> }.
export async function getUserInfo() {
    const res = await fetch("/api/user-info");
    if (!res.ok) throw new Error(`Couldn't load user info: ${res.status}`);
    return res.json();
}
