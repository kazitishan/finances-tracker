"use client";

import { typeLabel } from "@/components/dropdowns/TypeDropdown";
import { ArrowUpRightIcon, PencilIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/formUtils";

// Links are typed by hand, and "amazon.com" without a scheme would point back into the app.
const linkHref = (link) => (/^https?:\/\//i.test(link) ? link : `https://${link}`);

function HeaderCell({ className = "", children }) {
    return <th scope="col" className={`field-label px-3 py-2.5 sm:px-4 ${className}`}>{children}</th>;
}

// On narrow screens the category moves under the name and the link shrinks to its icon, so every column still fits.
function OtherExpensesTable({ expenses, onEdit }) {
    return (
        <div className="card">
            <table className="w-full table-fixed text-left text-sm">
                <thead>
                    <tr className="border-b border-[var(--border)]">
                        <HeaderCell>Name</HeaderCell>
                        <HeaderCell className="hidden w-[28%] sm:table-cell">Category</HeaderCell>
                        <HeaderCell className="w-28 text-right sm:w-32">Price</HeaderCell>
                        <HeaderCell className="w-16 sm:w-24">Link</HeaderCell>
                        <th scope="col" className="w-10 sm:w-12"><span className="sr-only">Edit</span></th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => {
                        const category = typeLabel(expense.category, expense.otherCategory);
                        return (
                            <tr key={expense.id} className="border-b border-[var(--border)] last:border-b-0">
                                <td className="px-3 py-2.5 sm:px-4">
                                    <div className="truncate font-medium" title={expense.name}>{expense.name}</div>
                                    {category && <div className="truncate text-xs text-muted sm:hidden">{category}</div>}
                                </td>
                                <td className="hidden truncate px-4 py-2.5 text-muted sm:table-cell" title={category}>{category || "—"}</td>
                                <td className="px-3 py-2.5 text-right tabular-nums sm:px-4">{expense.price ? formatCurrency(expense.price) : "—"}</td>
                                <td className="px-3 py-2.5 sm:px-4">
                                    {expense.link ? (
                                        <a href={linkHref(expense.link)} target="_blank" rel="noopener noreferrer" className="link-btn" aria-label={`Open ${expense.name}`}>
                                            <span className="hidden sm:inline">Open</span>
                                            <ArrowUpRightIcon size={12} />
                                        </a>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </td>
                                <td className="py-2.5 pr-1 text-right sm:pr-2">
                                    <button type="button" onClick={() => onEdit(expense)} className="icon-btn" aria-label={`Edit ${expense.name}`}>
                                        <PencilIcon size={15} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default OtherExpensesTable;
