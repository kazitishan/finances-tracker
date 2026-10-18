// The credit card or bank account a `credit:<id>` / `debit:<id>` payment method points to, with a display name.
export function findPaymentAccount(paymentMethod, { creditCards = [], bankAccounts = [] }) {
    const [methodType, methodId] = (paymentMethod || "").split(":");
    if (methodType === "credit") {
        const card = creditCards.find((card) => card.id === methodId);
        return card ? { ...card, displayName: card.name || "Unnamed Card" } : null;
    }
    if (methodType === "debit") {
        const account = bankAccounts.find((account) => account.id === methodId);
        return account ? { ...account, displayName: account.name || "Unnamed Account" } : null;
    }
    return null;
}
