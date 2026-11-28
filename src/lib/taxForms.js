import taxes from "@/data/taxes.json";
import { formatCurrency } from "@/lib/formUtils";
import { paidInMonth } from "@/lib/incomeStreams";
import { itemName } from "@/lib/itemNames";
import { isFederalStudentLoan } from "@/lib/loans";

// Predicts which tax forms the user will get or have to file for `taxYear`, from what the app knows. Everything
// about the forms themselves (names, who sends them, thresholds, conditions, the reasons shown) is in
// data/taxes.json; this file only checks each form's conditions against the user's data. Each predicted form is
// { id, key, group, form, title, from, why, conditions, status, href, issuer, sentBy, attachTo, reports, irs }:
// - `key` is its entry in taxes.json's "forms", and `issuer`, `sentBy`, `attachTo`, `reports` and `irs` come
//   straight from there,
// - `group` is the name of one of TAX_GROUPS,
// - `from` who sends this copy ("" for one the user files),
// - `why` one sentence on how the prediction was made: the entry's reason template, filled in,
// - `conditions` the entry's conditions in order, each { id, text, state } with `state` one of CONDITION_STATES,
// - `status` follows from them (statusOf): "not-needed" if any is unmet, "needed" if all are met, otherwise
//   "maybe" (it depends on something the app doesn't know),
// - `href` the page holding the data it was predicted from.

const { forms: FORMS, incomeTypes, investmentTypes } = taxes;

// Each group's name and what to show when it has no forms: { name, empty: { text, href, link } }.
export const TAX_GROUPS = taxes.groups;

// Whether a condition holds, going by what's saved: "met", "unmet", or "unknown" when the app can't tell.
export const CONDITION_STATES = ["met", "unknown", "unmet"];
const MET = "met";
const UNMET = "unmet";
const UNKNOWN = "unknown";
const metIf = (condition) => (condition ? MET : UNMET);

export function statusOf(conditions) {
    if (conditions.some((condition) => condition.state === UNMET)) return "not-needed";
    if (conditions.every((condition) => condition.state === MET)) return "needed";
    return "maybe";
}

// IRS thresholds are whole dollars: "$600", not "$600.00".
const dollars = (amount) => "$" + amount.toLocaleString();

// A form's threshold for `taxYear`. In taxes.json it's null, a number, { amount, ... } for one with more than one
// condition, or { "<year>": amount } for one that changed, where the latest year up to `taxYear` applies.
function thresholdFor(key, taxYear) {
    const threshold = FORMS[key].threshold;
    if (threshold === null || typeof threshold === "number") return threshold;
    if ("amount" in threshold) return threshold.amount;
    const years = Object.keys(threshold).map(Number).sort((a, b) => a - b);
    return threshold[years.filter((year) => year <= taxYear).pop() ?? years[0]];
}

// Replaces each {name} in a template.
function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

// One predicted form from its taxes.json entry.
// - `checks` gives a state for every one of the entry's conditions, by id. A missing one throws, so a condition
//   added to taxes.json can't be skipped by accident.
// - `reason` picks the template from the entry's "reasons" (by default the one named after the status, with
//   "not-needed" as "notNeeded").
// - `values` fills the templates; {threshold}, {sentBy}, {taxYear} and {from} are always available.
function predicted(key, taxYear, { id = key, checks, reason, from = "", group, form, href, values = {} }) {
    const info = FORMS[key];
    const threshold = thresholdFor(key, taxYear);
    const allValues = {
        threshold: threshold === null ? "" : dollars(threshold),
        sentBy: info.sentBy,
        taxYear,
        from,
        ...values,
    };
    const conditions = Object.entries(info.conditions).map(([conditionId, text]) => {
        if (!CONDITION_STATES.includes(checks[conditionId])) {
            throw new Error(`No check for condition "${conditionId}" of tax form "${key}"`);
        }
        return { id: conditionId, text: fill(text, allValues), state: checks[conditionId] };
    });
    const status = statusOf(conditions);
    const reasonKey = reason ?? (status === "not-needed" ? "notNeeded" : status);
    if (!info.reasons[reasonKey]) throw new Error(`Tax form "${key}" has no "${reasonKey}" reason`);

    return {
        id, key, status, from, conditions,
        group: group ?? info.group,
        form: form ?? info.form,
        title: info.title,
        href: href ?? info.href,
        issuer: info.issuer,
        sentBy: info.sentBy,
        attachTo: info.attachTo,
        reports: info.reports,
        irs: info.irs,
        why: fill(info.reasons[reasonKey], allValues),
    };
}

// Groups items by a name, keeping the order each name first appears in.
function groupBy(items, nameOf) {
    const groups = new Map();
    for (const item of items) groups.set(nameOf(item), [...(groups.get(nameOf(item)) ?? []), item]);
    return [...groups];
}

// What the stream would pay over the whole tax year at its current pay.
export function yearlyIncome(stream, taxYear) {
    let total = 0;
    for (let month = 0; month < 12; month++) total += paidInMonth(stream, new Date(taxYear, month, 1));
    return total;
}

function streamName(stream) {
    return stream.name || "Unnamed income";
}

// Below `threshold` for the year is a sure no; above it, it depends on how the income splits between payers.
function overPayerThreshold(yearly, threshold) {
    return yearly > 0 && yearly < threshold ? UNMET : UNKNOWN;
}

function employmentForms(incomeStreams, taxYear) {
    const forms = [];
    const selfEmployed = [];

    for (const stream of incomeStreams) {
        const yearly = yearlyIncome(stream, taxYear);
        const earned = yearly > 0 ? ` About ${formatCurrency(yearly)} for ${taxYear} at the current pay.` : "";
        const common = { from: streamName(stream), values: { type: stream.type, earned } };

        if (incomeTypes.employee.includes(stream.type)) {
            forms.push(predicted("w2", taxYear, {
                ...common, id: `w2-${stream.id}`, reason: "needed",
                checks: { employee: MET, paid: yearly > 0 ? MET : UNKNOWN },
            }));
        } else if (incomeTypes.selfEmployed.includes(stream.type)) {
            selfEmployed.push({ stream, yearly });
            if (incomeTypes.gig.includes(stream.type)) {
                const necThreshold = thresholdFor("1099-nec", taxYear);
                forms.push(predicted("1099-k", taxYear, {
                    ...common, id: `1099-${stream.id}`, reason: "maybe",
                    form: `${FORMS["1099-k"].form} / ${FORMS["1099-nec"].form}`,
                    checks: { gig: MET, overThreshold: overPayerThreshold(yearly, necThreshold) },
                    values: {
                        ...common.values,
                        transactions: FORMS["1099-k"].threshold.transactions,
                        necThreshold: dollars(necThreshold),
                    },
                }));
            } else {
                forms.push(predicted("1099-nec", taxYear, {
                    ...common, id: `1099-${stream.id}`, reason: "maybe",
                    checks: { contractor: MET, overThreshold: overPayerThreshold(yearly, thresholdFor("1099-nec", taxYear)) },
                }));
            }
        } else {
            // With no type, it's still income: the form is unknown, not unneeded.
            forms.push(predicted("w2-or-1099", taxYear, {
                ...common, id: `unknown-${stream.id}`, checks: { typeSet: UNKNOWN },
            }));
        }
    }

    if (selfEmployed.length > 0) {
        const total = selfEmployed.reduce((sum, { yearly }) => sum + yearly, 0);
        const threshold = thresholdFor("schedule-se", taxYear);
        forms.push(predicted("schedule-c", taxYear, {
            checks: { selfEmployed: MET },
            values: { names: selfEmployed.map(({ stream }) => streamName(stream)).join(", ") },
        }));
        // Expenses aren't tracked, so income over the threshold counts as profit over it.
        forms.push(predicted("schedule-se", taxYear, {
            reason: total > 0 ? "needed" : "maybe",
            checks: { selfEmployed: MET, overThreshold: total === 0 ? UNKNOWN : metIf(total >= threshold) },
            values: { total: formatCurrency(total) },
        }));
    }

    return forms;
}

function studentLoanForms(loans, taxInfo, taxYear) {
    const studentLoans = loans.filter((loan) => loan.type === "Student Loans");
    if (studentLoans.length === 0) return [];

    // One 1098-E per servicer, covering all of its loans. Federal loans all count under Federal Student Aid,
    // though the form comes from the servicer that manages them.
    const forms = groupBy(studentLoans, (loan) => loan.provider || itemName("loans", loan)).map(([provider, providerLoans]) => {
        const paid = providerLoans.some((loan) => Number(loan.amountPaid) > 0);
        return predicted("1098-e", taxYear, {
            id: `1098e-${provider}`,
            from: providerLoans.some(isFederalStudentLoan) ? fill(FORMS["1098-e"].federalFrom, { provider }) : provider,
            checks: { hasLoans: MET, madePayments: metIf(paid), overThreshold: paid ? UNKNOWN : UNMET },
            values: { provider },
        });
    });

    // An unanswered tax info question is unknown, not a no.
    const anyPaid = studentLoans.some((loan) => Number(loan.amountPaid) > 0);
    const deduction = FORMS["student-loan-deduction"];
    const answered = (value, isMet) => (value === "" ? UNKNOWN : metIf(isMet));
    const checks = {
        paidInterest: anyPaid ? UNKNOWN : UNMET,
        notDependent: answered(taxInfo.claimedAsDependent, taxInfo.claimedAsDependent === "no"),
        notMarriedSeparate: answered(taxInfo.filingStatus, taxInfo.filingStatus !== "married-separate"),
        underIncomeLimit: UNKNOWN,
    };
    const notAllowedFor = checks.notDependent === UNMET
        ? deduction.notAllowedFor.dependent
        : checks.notMarriedSeparate === UNMET ? deduction.notAllowedFor["married-separate"] : null;
    forms.push(predicted("student-loan-deduction", taxYear, {
        checks,
        reason: notAllowedFor ? "notAllowed" : anyPaid ? "maybe" : "notNeeded",
        values: { notAllowedFor, limit: dollars(deduction.limit), formThreshold: dollars(thresholdFor("1098-e", taxYear)) },
    }));

    return forms;
}

function bankInterestForms(bankAccounts, taxYear) {
    // Accounts with no APY earn nothing to report, so they're left out entirely. One 1099-INT per bank, covering
    // all of its accounts that earn interest.
    const earning = bankAccounts.filter((account) => Number(account.apy) > 0);
    return groupBy(earning, (account) => account.bank || itemName("bank-accounts", account)).map(([bank, accounts]) =>
        predicted("1099-int", taxYear, {
            id: `1099int-${bank}`, from: bank,
            checks: { earnsInterest: MET, overThreshold: UNKNOWN },
            values: {
                accounts: accounts.map((account) => `${itemName("bank-accounts", account)} (${account.apy}% APY)`).join(", "),
                verb: accounts.length === 1 ? "earns" : "earn",
            },
        }));
}

function investmentForms(investmentAccounts, taxYear) {
    // Only taxable accounts. Sales and dividends inside a Roth IRA or 401K aren't reported until money comes out.
    const taxable = investmentAccounts.filter((account) => investmentTypes.taxable.includes(account.type));
    if (taxable.length === 0) return [];

    // Selling and dividends can't be known from the app, so every one of these is a maybe.
    const forms = [];
    for (const [broker, accounts] of groupBy(taxable, (account) => account.broker || itemName("investment-accounts", account))) {
        const names = accounts.map((account) => itemName("investment-accounts", account)).join(", ");
        const stocks = [...new Set(accounts.flatMap((account) =>
            (account.recurringInvestments ?? []).map((investment) => investment.stock).filter(Boolean)))];
        forms.push(predicted("1099-b", taxYear, {
            id: `1099b-${broker}`, from: broker,
            checks: { taxableAccount: MET, sold: UNKNOWN },
            values: { accounts: names },
        }));
        forms.push(predicted("1099-div", taxYear, {
            id: `1099div-${broker}`, from: broker,
            checks: { taxableAccount: MET, overThreshold: UNKNOWN },
            values: {
                accounts: names,
                holdings: stocks.length > 0 ? fill(FORMS["1099-div"].holdings, { stocks: stocks.join(", ") }) : "",
            },
        }));
    }
    forms.push(predicted("form-8949", taxYear, { checks: { taxableAccount: MET, sold: UNKNOWN } }));
    forms.push(predicted("schedule-d", taxYear, { checks: { taxableAccount: MET, soldOrDistributions: UNKNOWN } }));
    return forms;
}

// Schedule B covers interest and dividends alike. It sits with bank interest when there is some, and with
// investments otherwise.
function scheduleB(interest, investments, taxYear) {
    if (interest.length === 0 && investments.length === 0) return [];
    const withInterest = interest.length > 0;
    return [predicted("schedule-b", taxYear, {
        checks: { hasIncome: MET, overThreshold: UNKNOWN },
        group: withInterest ? FORMS["schedule-b"].group : FORMS["schedule-b"].fallbackGroup,
        href: withInterest ? FORMS["schedule-b"].href : FORMS["1099-div"].href,
    })];
}

export function predictTaxForms({ taxYear, taxInfo, incomeStreams, bankAccounts, loans, investmentAccounts }) {
    const interest = bankInterestForms(bankAccounts, taxYear);
    const investments = investmentForms(investmentAccounts, taxYear);
    return [
        ...employmentForms(incomeStreams, taxYear),
        ...studentLoanForms(loans, taxInfo, taxYear),
        ...interest,
        ...investments,
        ...scheduleB(interest, investments, taxYear),
    ];
}
