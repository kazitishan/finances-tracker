import { getBankAccounts } from "@/util/getBankAccounts";
import { itemName } from "@/lib/itemNames";

// Every card the user can pay with: their credit cards and the debit cards on their bank accounts.
// A payment method's `value` is `credit:<card id>` or `debit:<bank account id>`.
export function buildPaymentMethods({ creditCards = [], bankAccounts = [] }) {
    const creditMethods = creditCards
        .filter((card) => card.cardNumber)
        .map((card) => ({
            value: `credit:${card.id}`,
            name: itemName("credit-cards", card),
            bank: card.bank,
            img: card.img,
            last4: card.cardNumber,
            badge: "Credit",
        }));

    const debitMethods = bankAccounts
        .filter((account) => account.cardNumber)
        .map((account) => ({
            value: `debit:${account.id}`,
            name: itemName("bank-accounts", account),
            bank: account.bank,
            img: account.img,
            last4: account.cardNumber,
            badge: "Debit",
        }));

    return [...creditMethods, ...debitMethods];
}

async function getCreditCards() {
    const res = await fetch("/api/credit-cards");
    if (!res.ok) throw new Error(`Couldn't load credit cards: ${res.status}`);
    return res.json();
}

// The user's payment methods, built from the credit cards and bank accounts saved in the signed-in profile's info.json.
export async function getPaymentMethods() {
    const [creditCards, bankAccounts] = await Promise.all([getCreditCards(), getBankAccounts()]);
    return buildPaymentMethods({ creditCards, bankAccounts });
}
