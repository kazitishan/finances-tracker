// Saves the user's budgeting info to private/info.json, replacing what's there.
export async function saveUserInfo(userInfo) {
    const res = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
    });
    if (!res.ok) throw new Error(`Couldn't save user info: ${res.status}`);
    return res.json();
}
