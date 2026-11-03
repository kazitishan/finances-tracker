// What each category's items are called on every screen, by API slug: the name given, otherwise the platform
// the item is with, otherwise "Unnamed …".
const names = {
    "bank-accounts": (account) => account.name || account.bank || "Unnamed Account",
    "investment-accounts": (account) => account.name || account.broker || "Unnamed Account",
    "credit-cards": (card) => card.name || card.bank || "Unnamed Card",
    subscriptions: (subscription) => subscription.name || subscription.subscription || "Unnamed Subscription",
    loans: (loan) => loan.name || loan.provider || "Unnamed Loan",
    insurance: (policy) => policy.name || policy.provider || "Unnamed Insurance",
    utilities: (utility) => utility.name || utility.provider || "Unnamed Utility",
    "other-expenses": (expense) => expense.name || "Unnamed Expense",
};

export function itemName(category, item) {
    return names[category](item);
}
