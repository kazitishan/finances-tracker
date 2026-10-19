// The user's budgeting info from private/info.json: { "income-streams": [...], "additional-expenses": [...] },
// where each entry is { "<name>": <monthly amount> }.
export async function getUserInfo() {
    const res = await fetch("/api/user-info");
    if (!res.ok) throw new Error(`Couldn't load user info: ${res.status}`);
    return res.json();
}
