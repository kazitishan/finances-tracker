export const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
export const years = [];
for (let year = currentYear; year <= 2099; year++) {
    years.push(year);
}

export const pastYears = [];
for (let year = currentYear; year >= currentYear - 50; year--) {
    pastYears.push(year);
}

export function accountAgeInMonths(month, year) {
    if (!month || !year) return null;
    const now = new Date();
    const openDate = new Date(Number(year), Number(month) - 1, 1);
    return Math.max(
        0,
        (now.getFullYear() - openDate.getFullYear()) * 12 + (now.getMonth() - openDate.getMonth())
    );
}

export function formatMonthsAge(totalMonths) {
    const ageYears = Math.floor(totalMonths / 12);
    const ageMonths = Math.round(totalMonths % 12);
    const parts = [];
    if (ageYears > 0) parts.push(`${ageYears} year${ageYears !== 1 ? "s" : ""}`);
    if (ageMonths > 0 || ageYears === 0) parts.push(`${ageMonths} month${ageMonths !== 1 ? "s" : ""}`);
    return `${parts.join(", ")} old`;
}

export function formatAccountAge(month, year) {
    const totalMonths = accountAgeInMonths(month, year);
    if (totalMonths === null) return "";
    return formatMonthsAge(totalMonths);
}

export function ordinal(day) {
    if (day % 10 === 1 && day % 100 !== 11) return `${day}st`;
    if (day % 10 === 2 && day % 100 !== 12) return `${day}nd`;
    if (day % 10 === 3 && day % 100 !== 13) return `${day}rd`;
    return `${day}th`;
}

export const dueDates = [];
for (let day = 1; day <= 28; day++) {
    dueDates.push({ value: day, label: `${ordinal(day)} of every month` });
}

export const inputClasses = "field";

export function onlyDigits(value) {
    return value.replace(/\D/g, "");
}

export function onlyDecimal(value) {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 2) return cleaned;
    return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function maskLast4(value) {
    if (!value) return "";
    if (value.length <= 4) return value;
    return `•••• ${value.slice(-4)}`;
}

export function maskAll(value) {
    if (!value) return "";
    return "•".repeat(value.length);
}

export function groupFromRight(value) {
    if (!value) return "";
    const firstGroupLen = value.length % 4 || 4;
    const groups = [value.slice(0, firstGroupLen)];
    for (let i = firstGroupLen; i < value.length; i += 4) {
        groups.push(value.slice(i, i + 4));
    }
    return groups.join(" ");
}

export function stripSpacesOnCopy(e) {
    const { selectionStart, selectionEnd, value } = e.target;
    const selected = value.slice(selectionStart, selectionEnd);
    e.clipboardData.setData("text/plain", selected.replace(/\s/g, ""));
    e.preventDefault();
}

function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Next date (today included) that falls on `day`, optionally in a specific month ("01"-"12").
export function nextOccurrence(day, month) {
    const today = startOfToday();
    const dayNumber = Number(day);
    if (!dayNumber) return null;

    if (month) {
        const monthIndex = Number(month) - 1;
        const thisYear = new Date(today.getFullYear(), monthIndex, dayNumber);
        return thisYear >= today ? thisYear : new Date(today.getFullYear() + 1, monthIndex, dayNumber);
    }

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), dayNumber);
    return thisMonth >= today ? thisMonth : new Date(today.getFullYear(), today.getMonth() + 1, dayNumber);
}

export function daysUntil(date) {
    return Math.round((date - startOfToday()) / 86400000);
}

export function formatDaysUntil(days) {
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    return `in ${days} days`;
}

export const interestPaymentOptions = [
    { value: "first", label: "First day of the month" },
    { value: "last", label: "Last day of the month" },
];

// Next first/last day of a month (today included).
export function nextInterestDate(kind) {
    const today = startOfToday();
    if (kind === "first") {
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return thisMonth >= today ? thisMonth : new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }
    if (kind === "last") {
        const thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return thisMonth >= today ? thisMonth : new Date(today.getFullYear(), today.getMonth() + 2, 0);
    }
    return null;
}
