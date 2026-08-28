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

export const inputClasses = "w-full border border-gray-300 rounded-lg p-2 bg-white";

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
