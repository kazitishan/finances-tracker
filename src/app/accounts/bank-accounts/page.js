"use client";

import { Suspense, useEffect, useState } from "react";
import AddBankAccountModal from "@/components/modals/AddBankAccountModal";
import BankAccountInfo from "@/components/info/BankAccountInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { NoMatches } from "@/components/ui/SearchInput";
import { useUrlFilters } from "@/components/useUrlFilters";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { matchesSearch } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";

const bankLogo = (name, accounts) => logoFor(banks, name, accounts.find((account) => account.customLogo)?.customLogo);

function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/bank-accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setLoaded(true);
      });
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
    const res = await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
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

  const filters = useUrlFilters(accounts, [
    { key: "type", label: "Account Type", getValue: (account) => account.type },
    { key: "bank", label: "Bank", getValue: (account) => account.bank, getImage: bankLogo },
  ]);

  const filteredAccounts = accounts.filter((account) =>
    filters.matches(account) && matchesSearch([account.name, account.bank, account.type], search)
  );

  return (
    <div>
      <PageHeader
        title="Bank Accounts"
        count={loaded ? accounts.length : null}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        stats={[]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All bank accounts */}
      {loaded && accounts.length === 0 && <EmptyState noun="bank accounts" onAdd={handleAddClick} />}
      {accounts.length > 0 && filteredAccounts.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {filteredAccounts.map((account) => (
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
        onDelete={handleDelete}
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

export default function BankAccountsPage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <BankAccounts />
    </Suspense>
  );
}
