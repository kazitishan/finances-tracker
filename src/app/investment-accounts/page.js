"use client";

import { useEffect, useState } from "react";
import AddInvestmentAccountModal from "@/components/modals/AddInvestmentAccountModal";
import InvestmentAccountInfo from "@/components/info/InvestmentAccountInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function InvestmentAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/investment-accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setLoaded(true);
      });
  }, []);

  function handleSaved(item) {
    setAccounts((prev) => {
      const exists = prev.some((account) => account.id === item.id);
      return exists
        ? prev.map((account) => (account.id === item.id ? item : account))
        : [...prev, item];
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
    await fetch(`/api/investment-accounts/${id}`, { method: "DELETE" });
    setAccounts((prev) => prev.filter((account) => account.id !== id));
  }

  async function handleReorder(orderedIds) {
    const res = await fetch("/api/investment-accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderedIds }),
    });
    setAccounts(await res.json());
  }

  return (
    <div>
      <PageHeader
        title="Investment Accounts"
        count={loaded ? accounts.length : null}
        stats={[]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All accounts */}
      {loaded && accounts.length === 0 && <EmptyState noun="investment accounts" onAdd={handleAddClick} />}

      <div className="flex flex-col gap-3">
        {accounts.map((account) => (
          <InvestmentAccountInfo
            key={account.id}
            account={account}
            onEdit={() => handleEdit(account)}
          />
        ))}
      </div>

      <AddInvestmentAccountModal
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
        getLabel={(account) => account.name || "Unnamed Account"}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </div>
  );
}
