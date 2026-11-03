import { ordinal } from "@/lib/formUtils";
import { itemName } from "@/lib/itemNames";

// A recurring investment is saved on its investment account as
// { id, stock, amount, frequency, dayOfWeek, dayOfMonth, startDate, bankAccount }:
// - `dayOfWeek` ("1"-"5", Monday-Friday) is used by "weekly" and "biweekly",
// - `dayOfMonth` ("1"-"28") by "monthly",
// - `startDate` ("YYYY-MM-DD") by "biweekly", to know which weeks it falls on,
// - `bankAccount` is the id of the bank account it's paid from.
// Market holidays aren't accounted for; only weekends are skipped.

export const investmentFrequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Biweekly" },
    { value: "monthly", label: "Monthly" },
];

export const marketWeekdays = [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
];

const DAY_MS = 86400000;

function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function daysBetween(from, to) {
    return Math.round((to - from) / DAY_MS);
}

export function toDateString(date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, "0")).join("-");
}

export function parseDateString(value) {
    const [year, month, day] = (value || "").split("-").map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
}

// The next `count` dates (today included) that fall on `weekday` ("1"-"5").
export function nextWeekdays(weekday, count = 2) {
    const today = startOfToday();
    const first = addDays(today, (Number(weekday) - today.getDay() + 7) % 7);
    return Array.from({ length: count }, (_, index) => addDays(first, index * 7));
}

// Every two weeks needs to know which week it's on. It's saved as `startDate`; this keeps it on the chosen weekday.
export function withStartDate(schedule) {
    if (schedule.frequency !== "biweekly" || !schedule.dayOfWeek) return schedule;
    const start = parseDateString(schedule.startDate);
    if (start && start.getDay() === Number(schedule.dayOfWeek)) return schedule;
    return { ...schedule, startDate: toDateString(nextWeekdays(schedule.dayOfWeek)[0]) };
}

// The next date (today included) that `matches`, looking far enough ahead for any monthly schedule, or null.
export function nextMatchingDate(matches) {
    const today = startOfToday();
    for (let offset = 0; offset < 40; offset++) {
        const date = addDays(today, offset);
        if (matches(date)) return date;
    }
    return null;
}

// How many days in the month of `date` satisfy `matches`.
export function countInMonth(matches, date) {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    let times = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        if (matches(new Date(date.getFullYear(), date.getMonth(), day))) times++;
    }
    return times;
}

// A monthly investment set for a weekend goes through the Monday after.
function monthlyDateIn(dayOfMonth, year, month) {
    const date = new Date(year, month, Number(dayOfMonth));
    if (date.getDay() === 6) return addDays(date, 2);
    if (date.getDay() === 0) return addDays(date, 1);
    return date;
}

// Whether the investment goes through on `date`.
export function isInvestmentDay(investment, date) {
    const weekday = date.getDay();
    switch (investment.frequency) {
        case "daily":
            return weekday >= 1 && weekday <= 5;
        case "weekly":
            return weekday === Number(investment.dayOfWeek);
        case "biweekly": {
            const start = parseDateString(investment.startDate);
            return Boolean(start) && weekday === Number(investment.dayOfWeek) && daysBetween(start, date) % 14 === 0;
        }
        case "monthly":
            return Boolean(Number(investment.dayOfMonth))
                && daysBetween(monthlyDateIn(investment.dayOfMonth, date.getFullYear(), date.getMonth()), date) === 0;
        default:
            return false;
    }
}

// The next date (today included) the investment goes through, or null if its schedule isn't filled in.
export function nextInvestmentDate(investment) {
    return nextMatchingDate((date) => isInvestmentDay(investment, date));
}

// What the investment puts in during the month of `date`: its amount times how many times it goes through that month.
export function investedInMonth(investment, date = new Date()) {
    const amount = Number(investment.amount) || 0;
    return amount * countInMonth((day) => isInvestmentDay(investment, day), date);
}

// "Every market day", "Every Monday", "Every other Friday", "15th of every month", or "" if incomplete.
export function describeSchedule(investment) {
    const weekday = marketWeekdays.find((day) => day.value === String(investment.dayOfWeek))?.label;
    switch (investment.frequency) {
        case "daily":
            return "Every market day";
        case "weekly":
            return weekday ? `Every ${weekday}` : "";
        case "biweekly":
            return weekday ? `Every other ${weekday}` : "";
        case "monthly":
            return investment.dayOfMonth ? `${ordinal(Number(investment.dayOfMonth))} of every month` : "";
        default:
            return "";
    }
}

// Every recurring investment across `accounts`, each with the account it's made into.
export function allRecurringInvestments(accounts) {
    return accounts.flatMap((account) =>
        (account.recurringInvestments || []).map((investment) => ({ investment, account }))
    );
}

export function investmentName(investment, account) {
    return `${investment.stock || "Unnamed Stock"} · ${itemName("investment-accounts", account)}`;
}
