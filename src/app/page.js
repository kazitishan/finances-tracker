"use client";

import { useEffect, useState } from "react";
import AddBankAccountModal from "@/components/AddBankAccountModal";
import BankAccountInfo from "@/components/BankAccountInfo";
import RearrangeModal from "@/components/RearrangeModal";

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/bank-accounts")
      .then((res) => res.json())
      .then(setAccounts);
  }, []);

  function handleSaved(item) {
    setAccounts((prev) => {
      const exists = prev.some((account) => account.id === item.id);
      return exists ? prev.map((account) => (account.id === item.id ? item : account)) : [...prev, item];
    });
  }

  function handleAddClick() {
    setEditingAccount(null);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  function handleEdit(account) {
    setEditingAccount(account);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  async function handleDelete(id) {
    await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
    setAccounts((prev) => prev.filter((account) => account.id !== id));
  }

  async function handleReorder(orderedIds) {
    const res = await fetch("/api/bank-accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderedIds }),
    });
    setAccounts(await res.json());
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

      {/* All bank accounts */}
      <div className="flex flex-col gap-4 mt-4">
        {accounts.map((account) => (
          <BankAccountInfo key={account.id} account={account} onEdit={() => handleEdit(account)} />
        ))}
      </div>

      <AddBankAccountModal
        key={`add-${addModalKey}`}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        itemId={editingAccount?.id}
        initialData={editingAccount}
        onSaved={handleSaved}
      />

      <RearrangeModal
        key={`rearrange-${rearrangeModalKey}`}
        isOpen={isRearrangeOpen}
        onClose={() => setIsRearrangeOpen(false)}
        items={accounts}
        getLabel={(account) => account.name || account.bank || "Unnamed Account"}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </div>
  );
}
