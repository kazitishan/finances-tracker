// Facts about the user that decide which U.S. tax forms they'll need, saved in user-info's "tax-info". Every value
// is a string, "" when not answered. Edited on the Profile page (TaxInfoCard).
//   filingStatus       one of filingStatusOptions: which 1040 status, and whether a spouse's info is needed
//   birthDate          "YYYY-MM-DD": 65+ raises the standard deduction; under 24 matters for dependency and education credits
//   residency          one of residencyOptions: a nonresident alien files 1040-NR instead of 1040
//   state              two-letter code from stateOptions: which state return, if any
//   claimedAsDependent "yes" | "no": whether someone else can claim the user, which limits their standard deduction
//                      and education credits, and means they can't claim dependents of their own
//   studentStatus      one of studentStatusOptions: education credits (Form 8863) and 1098-T
//   childrenUnder17    whole number: Child Tax Credit (Schedule 8812)
//   otherDependents    whole number: Credit for Other Dependents
// Whether the user is self-employed isn't asked here: it comes from their income streams' types.

export const emptyTaxInfo = {
    filingStatus: "",
    birthDate: "",
    residency: "",
    state: "",
    claimedAsDependent: "",
    studentStatus: "",
    childrenUnder17: "",
    otherDependents: "",
};

export const filingStatusOptions = [
    { value: "single", label: "Single" },
    { value: "married-joint", label: "Married Filing Jointly" },
    { value: "married-separate", label: "Married Filing Separately" },
    { value: "head-of-household", label: "Head of Household" },
    { value: "surviving-spouse", label: "Qualifying Surviving Spouse" },
];

export const residencyOptions = [
    { value: "citizen", label: "U.S. Citizen" },
    { value: "resident-alien", label: "Resident Alien (green card or substantial presence)" },
    { value: "nonresident-alien", label: "Nonresident Alien" },
];

export const dependentOptions = [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
];

export const studentStatusOptions = [
    { value: "none", label: "Not a student" },
    { value: "less-than-half-time", label: "Less than half-time" },
    { value: "half-time", label: "At least half-time" },
    { value: "full-time", label: "Full-time" },
];

export const stateOptions = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
    ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"],
    ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
    ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
    ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"],
    ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"],
    ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
    ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
    ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"],
    ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
].map(([value, label]) => ({ value, label }));

// States with no income tax on wages, so there's usually no state return for a W-2 job.
export const noWageTaxStates = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];

const choiceFields = {
    filingStatus: filingStatusOptions,
    residency: residencyOptions,
    state: stateOptions,
    claimedAsDependent: dependentOptions,
    studentStatus: studentStatusOptions,
};

// Someone who can be claimed as a dependent can't claim dependents of their own.
export function canClaimDependents(taxInfo) {
    return taxInfo.claimedAsDependent !== "yes";
}

// Missing (files from before tax info existed) is fine and reads as emptyTaxInfo.
export function isTaxInfo(value) {
    if (value === undefined) return true;
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const answer = (key) => value[key] ?? "";
    return Object.entries(choiceFields).every(([key, options]) =>
            answer(key) === "" || options.some((option) => option.value === answer(key)))
        && (answer("birthDate") === "" || /^\d{4}-\d{2}-\d{2}$/.test(answer("birthDate")))
        && ["childrenUnder17", "otherDependents"].every((key) => /^\d*$/.test(answer(key)));
}

// Just the known keys, each filled in, so a file only ever holds the fields above.
export function normalizeTaxInfo(value) {
    return Object.fromEntries(Object.keys(emptyTaxInfo).map((key) => [key, value?.[key] ?? ""]));
}

// Tax Day: April 15, or the next weekday when that falls on a weekend. Returns the next one, today included.
export function taxDay(year) {
    const date = new Date(year, 3, 15);
    while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
    return date;
}

export function nextTaxDay() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisYear = taxDay(today.getFullYear());
    return thisYear >= today ? thisYear : taxDay(today.getFullYear() + 1);
}
