"use client";

import { useEffect, useState } from "react";
import AddLoanModal from "@/components/modals/AddLoanModal";
import LoanInfo from "@/components/info/LoanInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/loans")
      .then((res) => res.json())
      .then(setLoans);
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

  return (
    <div>
      {/* Rearrange + Add buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setRearrangeModalKey((key) => key + 1);
            setIsRearrangeOpen(true);
          }}
          className="bg-gray-200 font-bold text-gray-800 p-2 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
        >
          Rearrange
        </button>
        <button
          onClick={handleAddClick}
          className="bg-green-800 font-bold text-white p-2 rounded-xl hover:bg-green-900 transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>

      {/* All loans */}
      <div className="flex flex-col gap-4 mt-4">
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
