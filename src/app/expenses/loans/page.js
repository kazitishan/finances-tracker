"use client";

import { Suspense, useEffect, useState } from "react";
import AddLoanModal from "@/components/modals/AddLoanModal";
import LoanInfo, { amountRemaining } from "@/components/info/LoanInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import { loanTypeLabel } from "@/components/dropdowns/LoanTypeDropdown";
import { loanProviders } from "@/components/dropdowns/LoanProviderDropdown";
import { useUrlFilters } from "@/components/useUrlFilters";
import EmptyState from "@/components/ui/EmptyState";
import { NoMatches } from "@/components/ui/SearchInput";
import { formatCurrency, matchesSearch } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";

const providerLogo = (name, loans) => logoFor(loanProviders, name, loans.find((loan) => loan.customLogo)?.customLogo);

function Loans() {
  const [loans, setLoans] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/loans")
      .then((res) => res.json())
      .then((data) => {
        setLoans(data);
        setLoaded(true);
      });
  }, []);

  function handleSaved(item) {
    setLoans((prev) => {
      const exists = prev.some((loan) => loan.id === item.id);
      return exists
        ? prev.map((loan) => (loan.id === item.id ? item : loan))
        : [...prev, item];
    });
  }

  function handleAddClick() {
    setEditingLoan(null);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  function handleEdit(loan) {
    setEditingLoan(loan);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/loans/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    setLoans((prev) => prev.filter((loan) => loan.id !== id));
  }

  async function handleReorder(orderedIds) {
    const res = await fetch("/api/loans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderedIds }),
    });
    setLoans(await res.json());
  }

  const monthlyTotal = loans
    .filter((loan) => loan.monthlyPayment)
    .reduce((sum, loan) => sum + Number(loan.monthlyPayment), 0);
  const yearlyTotal = monthlyTotal * 12;
  const totalDebt = loans.reduce((sum, loan) => sum + (amountRemaining(loan) ?? 0), 0);
  const formatMoney = (amount) => (amount > 0 ? formatCurrency(amount) : null);

  const filters = useUrlFilters(loans, [
    { key: "provider", label: "Provider", getValue: (loan) => loan.provider, getImage: providerLogo },
    { key: "type", label: "Type", getValue: (loan) => loanTypeLabel(loan.type, loan.otherType) },
  ]);

  const filteredLoans = loans.filter((loan) =>
    filters.matches(loan) && matchesSearch([loan.name, loan.provider, loanTypeLabel(loan.type, loan.otherType)], search)
  );

  return (
    <div>
      <PageHeader
        title="Loans"
        count={loaded ? loans.length : null}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        stats={[
          { label: "Monthly Total", value: formatMoney(monthlyTotal) },
          { label: "Yearly Total", value: formatMoney(yearlyTotal) },
          { label: "Total Debt", value: formatMoney(totalDebt) },
        ]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All loans */}
      {loaded && loans.length === 0 && <EmptyState noun="loans" onAdd={handleAddClick} />}
      {loans.length > 0 && filteredLoans.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {filteredLoans.map((loan) => (
          <LoanInfo
            key={loan.id}
            loan={loan}
            onEdit={() => handleEdit(loan)}
          />
        ))}
      </div>

      <AddLoanModal
        key={`add-${addModalKey}`}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        itemId={editingLoan?.id}
        initialData={editingLoan}
        onSaved={handleSaved}
        onDelete={handleDelete}
      />

      <RearrangeModal
        key={`rearrange-${rearrangeModalKey}`}
        isOpen={isRearrangeOpen}
        onClose={() => setIsRearrangeOpen(false)}
        items={loans}
        getLabel={(loan) => loan.name || "Unnamed Loan"}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function LoansPage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <Loans />
    </Suspense>
  );
}
