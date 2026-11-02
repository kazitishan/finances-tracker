"use client";

import { Suspense, useEffect, useState } from "react";
import AddOtherExpenseModal from "@/components/modals/AddOtherExpenseModal";
import OtherExpensesTable from "@/components/info/OtherExpensesTable";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { NoMatches } from "@/components/ui/SearchInput";
import { useUrlFilters } from "@/components/useUrlFilters";
import { typeLabel } from "@/components/dropdowns/TypeDropdown";
import { formatCurrency, matchesSearch } from "@/lib/formUtils";

function OtherExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/other-expenses")
      .then((res) => res.json())
      .then((data) => {
        setExpenses(data);
        setLoaded(true);
      });
  }, []);

  function handleSaved(item) {
    setExpenses((prev) => {
      const exists = prev.some((expense) => expense.id === item.id);
      return exists
        ? prev.map((expense) => (expense.id === item.id ? item : expense))
        : [...prev, item];
    });
  }

  function handleAddClick() {
    setEditingExpense(null);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  function handleEdit(expense) {
    setEditingExpense(expense);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/other-expenses/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  }

  async function handleReorder(orderedIds) {
    const res = await fetch("/api/other-expenses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderedIds }),
    });
    setExpenses(await res.json());
  }

  const total = expenses.reduce((sum, expense) => sum + Number(expense.price || 0), 0);

  const filters = useUrlFilters(expenses, [
    { key: "category", label: "Category", getValue: (expense) => typeLabel(expense.category, expense.otherCategory) },
  ]);

  const filteredExpenses = expenses.filter((expense) =>
    filters.matches(expense) && matchesSearch([expense.name, typeLabel(expense.category, expense.otherCategory)], search)
  );

  return (
    <div>
      <PageHeader
        title="Other Expenses"
        count={loaded ? expenses.length : null}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        stats={[{ label: "Total", value: total > 0 ? formatCurrency(total) : null }]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All other expenses */}
      {loaded && expenses.length === 0 && <EmptyState noun="other expenses" onAdd={handleAddClick} />}
      {expenses.length > 0 && filteredExpenses.length === 0 && <NoMatches query={search} />}

      {filteredExpenses.length > 0 && <OtherExpensesTable expenses={filteredExpenses} onEdit={handleEdit} />}

      <AddOtherExpenseModal
        key={`add-${addModalKey}`}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        itemId={editingExpense?.id}
        initialData={editingExpense}
        onSaved={handleSaved}
        onDelete={handleDelete}
      />

      <RearrangeModal
        key={`rearrange-${rearrangeModalKey}`}
        isOpen={isRearrangeOpen}
        onClose={() => setIsRearrangeOpen(false)}
        items={expenses}
        getLabel={(expense) => expense.name}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function OtherExpensesPage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <OtherExpenses />
    </Suspense>
  );
}
