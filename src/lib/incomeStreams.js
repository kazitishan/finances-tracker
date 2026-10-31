import { countInMonth, isInvestmentDay, nextMatchingDate } from "@/lib/recurringInvestments";

// An income stream is saved in user-info as
// { id, name, type, otherType, frequency, dayOfWeek, startDate, dayOfMonth, secondDayOfMonth, amountType,
//   paycheckAmount, monthlyEstimate, paymentType, otherPaymentType, bankAccount }:
// - `frequency` is one of incomeFrequencies, and like the payday fields below it's optional, for income like gig
//   work that's paid out whenever; "weekly" and "biweekly" use `dayOfWeek` and `startDate` the same way recurring
//   investments do, which is why they share those field names and schedule helpers,
// - `dayOfMonth` ("1"-"28" or "last") is used by "monthly" and "twice-monthly",
// - `secondDayOfMonth` by "twice-monthly",
// - `amountType` is "paycheck" for a fixed `paycheckAmount`, or "estimate" for income that varies, where
//   `monthlyEstimate` is what the user expects to make in a month,
// - `bankAccount` is the id of the bank account a direct deposit goes to.
// Paydays aren't moved for weekends or holidays; the stream is paid on the day it says.

export const incomeFrequencies = [
    { value: "", label: "No set schedule" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Biweekly" },
    { value: "twice-monthly", label: "Semi-monthly" },
    { value: "monthly", label: "Monthly" },
];

export const emptyIncomeStream = {
    name: "",
    type: "",
    otherType: "",
    frequency: "",
    dayOfWeek: "",
    startDate: "",
    dayOfMonth: "",
    secondDayOfMonth: "",
    amountType: "paycheck",
    paycheckAmount: "",
    monthlyEstimate: "",
    paymentType: "",
    otherPaymentType: "",
    bankAccount: "",
};

// Roughly how many paychecks a month each frequency means, for streams with no payday filled in. A paycheck
// with no frequency at all counts once.
const TYPICAL_PAYCHECKS = { weekly: 4, biweekly: 2, "twice-monthly": 2, monthly: 1 };

export function isEstimated(stream) {
    return stream.amountType === "estimate";
}

function isDayOfMonth(day, date) {
    if (day === "last") return date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return Number(day) === date.getDate();
}

// Whether the stream pays out on `date`.
export function isPayday(stream, date) {
    switch (stream.frequency) {
        case "weekly":
        case "biweekly":
            return isInvestmentDay(stream, date);
        case "twice-monthly":
            return isDayOfMonth(stream.dayOfMonth, date) || isDayOfMonth(stream.secondDayOfMonth, date);
        case "monthly":
            return isDayOfMonth(stream.dayOfMonth, date);
        default:
            return false;
    }
}

// Whether the fields `frequency` needs to work out paydays are filled in.
function hasPaySchedule(stream) {
    switch (stream.frequency) {
        case "weekly":
            return Boolean(stream.dayOfWeek);
        case "biweekly":
            return Boolean(stream.dayOfWeek && stream.startDate);
        case "twice-monthly":
            return Boolean(stream.dayOfMonth && stream.secondDayOfMonth) && stream.dayOfMonth !== stream.secondDayOfMonth;
        case "monthly":
            return Boolean(stream.dayOfMonth);
        default:
            return false;
    }
}

// The next date (today included) the stream pays out, or null if its schedule isn't filled in.
export function nextPayday(stream) {
    if (!hasPaySchedule(stream)) return null;
    return nextMatchingDate((date) => isPayday(stream, date));
}

// What the stream pays during the month of `date`: its monthly estimate, or its paycheck times how many paydays that
// month has. Without paydays to count it uses a typical month, so the stream still counts toward the budget.
export function paidInMonth(stream, date = new Date()) {
    if (isEstimated(stream)) return Number(stream.monthlyEstimate) || 0;
    const amount = Number(stream.paycheckAmount) || 0;
    if (!hasPaySchedule(stream)) return amount * (TYPICAL_PAYCHECKS[stream.frequency] ?? 1);
    return amount * countInMonth((day) => isPayday(stream, day), date);
}
