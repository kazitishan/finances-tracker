import { allRecurringInvestments, investedInMonth, investmentName } from "@/lib/recurringInvestments";

// What a bill costs a month; yearly bills are spread over 12 months.
function monthly(amount, billingCycle) {
    return (Number(amount) || 0) / (billingCycle === "year" ? 12 : 1);
}

// What a subscription or utility costs in `month` ("01"-"12"): monthly ones every month, yearly ones only in
// the month they're billed.
function billedCost(item, month) {
    if (item.billingCycle === "year" && item.billingMonth !== month) return 0;
    return Number(item.cost) || 0;
}

async function getItems(category) {
    const res = await fetch(`/api/${category}`);
    if (!res.ok) throw new Error(`Couldn't load ${category}: ${res.status}`);
    return res.json();
}

// What each subscription, loan, insurance policy, utility and recurring investment costs in the month of `date`
// (this month by default), as { id, name, amount } lists. Items that cost nothing that month, or have no cost
// entered, are left out.
export async function getMonthlyExpenses(date = new Date()) {
    const [subscriptions, loans, insurance, utilities, investmentAccounts] = await Promise.all(
        ["subscriptions", "loans", "insurance", "utilities", "investment-accounts"].map(getItems)
    );
    const withCost = (items) => items.filter((item) => item.amount > 0);
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return {
        subscriptions: withCost(subscriptions.map((subscription) => ({
            id: subscription.id,
            name: subscription.name || subscription.subscription || "Unnamed Subscription",
            amount: billedCost(subscription, month),
        }))),
        loans: withCost(loans.map((loan) => ({
            id: loan.id,
            name: loan.name || loan.provider || "Unnamed Loan",
            amount: Number(loan.monthlyPayment) || 0,
        }))),
        insurance: withCost(insurance.map((policy) => ({
            id: policy.id,
            name: policy.name || policy.provider || "Unnamed Insurance",
            amount: monthly(policy.premium, policy.billingCycle),
        }))),
        utilities: withCost(utilities.map((utility) => ({
            id: utility.id,
            name: utility.name || utility.provider || "Unnamed Utility",
            amount: billedCost(utility, month),
        }))),
        investments: withCost(allRecurringInvestments(investmentAccounts).map(({ investment, account }) => ({
            id: investment.id,
            name: investmentName(investment, account),
            amount: investedInMonth(investment, date),
        }))),
    };
}
