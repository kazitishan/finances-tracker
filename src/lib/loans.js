// Which federal student loan rules apply to a loan. Used by the loan form and card, and by the Taxes page.

export const FEDERAL_STUDENT_AID = "Federal Student Aid";

// The subsidized/unsubsidized field only exists for federal student loans.
export function isFederalStudentLoan(loan) {
    return loan.type === "Student Loans" && loan.provider === FEDERAL_STUDENT_AID;
}

// On a subsidized federal loan the government pays the interest until repayment starts.
export function isSubsidized(loan) {
    return isFederalStudentLoan(loan) && loan.subsidy === "subsidized";
}
