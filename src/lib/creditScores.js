import { months } from "@/lib/formUtils";

// A FICO score is saved in user-info's "credit-scores" as { id, month, year, score }: `month` is "01"-"12", `year`
// a four-digit string and `score` a whole number from 300 to 850, as a string like every other form value.
// There's at most one score per month, and the list is kept oldest first.
// user-info's "credit-score-reminder" is when to remind the user to enter that month's score on Home: "first" or
// "last" day of the month, or "" for no reminder.

export const MIN_SCORE = 300;
export const MAX_SCORE = 850;

// FICO's own rating bands, lowest first.
export const scoreRatings = [
    { min: 300, label: "Poor" },
    { min: 580, label: "Fair" },
    { min: 670, label: "Good" },
    { min: 740, label: "Very Good" },
    { min: 800, label: "Exceptional" },
];

export const reminderOptions = [
    { value: "", label: "No reminder" },
    { value: "first", label: "First day of the month" },
    { value: "last", label: "Last day of the month" },
];

export function isReminder(value) {
    return reminderOptions.some((option) => option.value === value);
}

// The next reminder date (today included): the first or last day of a month that doesn't have a score yet. Each
// reminder is for entering its own month's score, so entering it early moves the reminder on to the next month.
export function nextScoreReminder(reminder, scores) {
    if (reminder !== "first" && reminder !== "last") return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let offset = 0; offset <= 24; offset++) {
        const date = reminder === "first"
            ? new Date(today.getFullYear(), today.getMonth() + offset, 1)
            : new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
        if (date < today) continue;
        const entered = scores.some((entry) =>
            Number(entry.year) === date.getFullYear() && Number(entry.month) === date.getMonth() + 1);
        if (!entered) return date;
    }
    return null;
}

export function isValidScore(score) {
    const value = Number(score);
    return Number.isInteger(value) && value >= MIN_SCORE && value <= MAX_SCORE;
}

export function isCreditScore(entry) {
    return Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
        && typeof entry.id === "string" && entry.id !== ""
        && months.some((month) => month.value === entry.month)
        && /^\d{4}$/.test(entry.year)
        && isValidScore(entry.score);
}

export function scoreRating(score) {
    return scoreRatings.findLast((rating) => Number(score) >= rating.min)?.label ?? "";
}

// Months since year 0, so scores can be placed on a timeline and compared.
export function monthIndex(entry) {
    return Number(entry.year) * 12 + Number(entry.month) - 1;
}

export function sortScores(scores) {
    return [...scores].sort((a, b) => monthIndex(a) - monthIndex(b));
}

// Adds `entry`, replacing any score already saved for that month. Returns the new list, oldest first.
export function withScore(scores, entry) {
    const others = scores.filter((score) => monthIndex(score) !== monthIndex(entry));
    return sortScores([...others, entry]);
}

// "Oct 2026", or "Oct '26" when `short`.
export function scoreMonthLabel(entry, { short = false } = {}) {
    const name = months[Number(entry.month) - 1]?.label.slice(0, 3) ?? "";
    return short ? `${name} '${entry.year.slice(-2)}` : `${name} ${entry.year}`;
}
