"use client";

import { useEffect, useState } from "react";
import AddLoanModal from "@/components/modals/AddLoanModal";
import LoanInfo from "@/components/info/LoanInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function Loans() {
  const [loans, setLoans] = useState([]);
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
    await fetch(`/api/loans/${id}`, { method: "DELETE" });
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
  const formatMoney = (amount) =>
    amount > 0
      ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : null;

  return (
    <div>
      <PageHeader
        title="Loans"
        count={loaded ? loans.length : null}
        stats={[
          { label: "Monthly Total", value: formatMoney(monthlyTotal) },
          { label: "Yearly Total", value: formatMoney(yearlyTotal) },
        ]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All loans */}
      {loaded && loans.length === 0 && <EmptyState noun="loans" onAdd={handleAddClick} />}

      <div className="flex flex-col gap-3">
        {loans.map((loan) => (
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
