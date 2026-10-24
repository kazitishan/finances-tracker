"use client";

import { Suspense, useEffect, useState } from "react";
import AddUtilityModal from "@/components/modals/AddUtilityModal";
import UtilityInfo, { utilityIcon } from "@/components/info/UtilityInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { NoMatches } from "@/components/ui/SearchInput";
import { useUrlFilters } from "@/components/useUrlFilters";
import { typeLabel } from "@/components/dropdowns/TypeDropdown";
import { formatCurrency, matchesSearch } from "@/lib/formUtils";

function Utilities() {
  const [utilities, setUtilities] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUtility, setEditingUtility] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((data) => {
        setUtilities(data);
        setLoaded(true);
      });
  }, []);

  function handleSaved(item) {
    setUtilities((prev) => {
      const exists = prev.some((utility) => utility.id === item.id);
      return exists
        ? prev.map((utility) => (utility.id === item.id ? item : utility))
        : [...prev, item];
    });
  }

  function handleAddClick() {
    setEditingUtility(null);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  function handleEdit(utility) {
    setEditingUtility(utility);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/utilities/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    setUtilities((prev) => prev.filter((utility) => utility.id !== id));
  }

  async function handleReorder(orderedIds) {
    const res = await fetch("/api/utilities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderedIds }),
    });
    setUtilities(await res.json());
  }

  const monthlyTotal = utilities
    .filter((utility) => utility.billingCycle !== "year" && utility.cost)
    .reduce((sum, utility) => sum + Number(utility.cost), 0);

  const yearlyPayments = utilities
    .filter((utility) => utility.billingCycle === "year" && utility.cost)
    .reduce((sum, utility) => sum + Number(utility.cost), 0);
  const yearlyTotal = monthlyTotal * 12 + yearlyPayments;

  const filters = useUrlFilters(utilities, [
    {
      key: "type",
      label: "Type",
      getValue: (utility) => typeLabel(utility.type, utility.otherType),
      getImage: (value, items) => utilityIcon(items[0].type),
    },
    { key: "provider", label: "Provider", getValue: (utility) => utility.provider },
  ]);

  const filteredUtilities = utilities.filter((utility) =>
    filters.matches(utility) &&
    matchesSearch([utility.name, utility.provider, typeLabel(utility.type, utility.otherType)], search)
  );

  return (
    <div>
      <PageHeader
        title="Utilities"
        count={loaded ? utilities.length : null}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        stats={[
          { label: "Monthly Total", value: monthlyTotal > 0 ? formatCurrency(monthlyTotal) : null },
          { label: "Yearly Total", value: yearlyTotal > 0 ? formatCurrency(yearlyTotal) : null },
        ]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All utilities */}
      {loaded && utilities.length === 0 && <EmptyState noun="utilities" onAdd={handleAddClick} />}
      {utilities.length > 0 && filteredUtilities.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {filteredUtilities.map((utility) => (
          <UtilityInfo key={utility.id} utility={utility} onEdit={() => handleEdit(utility)} />
        ))}
      </div>

      <AddUtilityModal
        key={`add-${addModalKey}`}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        itemId={editingUtility?.id}
        initialData={editingUtility}
        onSaved={handleSaved}
        onDelete={handleDelete}
      />

      <RearrangeModal
        key={`rearrange-${rearrangeModalKey}`}
        isOpen={isRearrangeOpen}
        onClose={() => setIsRearrangeOpen(false)}
        items={utilities}
        getLabel={(utility) => utility.name || utility.provider || "Unnamed Utility"}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function UtilitiesPage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <Utilities />
    </Suspense>
  );
}
