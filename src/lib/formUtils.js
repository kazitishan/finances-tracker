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
