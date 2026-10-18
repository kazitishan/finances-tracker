// The user's bank accounts, as saved in private/info.json. The file is only read on the server,
// so this asks the API for them.
export async function getBankAccounts() {
    const res = await fetch("/api/bank-accounts");
    if (!res.ok) throw new Error(`Couldn't load bank accounts: ${res.status}`);
    return res.json();
}
