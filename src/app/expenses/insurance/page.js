"use client";

import { Suspense, useEffect, useState } from "react";
import AddInsuranceModal from "@/components/modals/AddInsuranceModal";
import InsuranceInfo from "@/components/info/InsuranceInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { NoMatches } from "@/components/ui/SearchInput";
import { useUrlFilters } from "@/components/useUrlFilters";
import { insuranceTypeLabel } from "@/components/dropdowns/InsuranceTypeDropdown";
import { allInsuranceProviders } from "@/components/dropdowns/InsuranceProviderDropdown";
import { formatCurrency, matchesSearch } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";

const providerLogo = (name, policies) => logoFor(allInsuranceProviders, name, policies.find((policy) => policy.customLogo)?.customLogo);

function Insurance() {
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [creditCards, setCreditCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/insurance")
      .then((res) => res.json())
      .then((data) => {
        setPolicies(data);
        setLoaded(true);
      });
    fetch("/api/credit-cards")
      .then((res) => res.json())
      .then(setCreditCards);
    fetch("/api/bank-accounts")
      .then((res) => res.json())
      .then(setBankAccounts);
  }, []);

  function handleSaved(item) {
    setPolicies((prev) => {
      const exists = prev.some((policy) => policy.id === item.id);
      return exists ? prev.map((policy) => (policy.id === item.id ? item : policy)) : [...prev, item];
    });
  }

  function handleAddClick() {
    setEditingPolicy(null);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  function handleEdit(policy) {
    setEditingPolicy(policy);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/insurance/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    setPolicies((prev) => prev.filter((policy) => policy.id !== id));
  }

  async function handleReorder(orderedIds) {
    const res = await fetch("/api/insurance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderedIds }),
    });
    setPolicies(await res.json());
  }

  const monthlyTotal = policies
    .filter((policy) => policy.billingCycle !== "year" && policy.premium)
    .reduce((sum, policy) => sum + Number(policy.premium), 0);

  const yearlyPayments = policies
    .filter((policy) => policy.billingCycle === "year" && policy.premium)
    .reduce((sum, policy) => sum + Number(policy.premium), 0);
  const yearlyTotal = monthlyTotal * 12 + yearlyPayments;

  const filters = useUrlFilters(policies, [
    { key: "type", label: "Type", getValue: (policy) => insuranceTypeLabel(policy.type, policy.otherType) },
    { key: "provider", label: "Provider", getValue: (policy) => policy.provider, getImage: providerLogo },
  ]);

  const filteredPolicies = policies.filter((policy) =>
    filters.matches(policy) &&
    matchesSearch([policy.name, policy.provider, insuranceTypeLabel(policy.type, policy.otherType)], search)
  );

  return (
    <div>
      <PageHeader
        title="Insurance"
        count={loaded ? policies.length : null}
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

      {/* All insurance policies */}
      {loaded && policies.length === 0 && <EmptyState noun="insurance policies" onAdd={handleAddClick} />}
      {policies.length > 0 && filteredPolicies.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {filteredPolicies.map((policy) => (
          <InsuranceInfo
            key={policy.id}
            insurance={policy}
            creditCards={creditCards}
            bankAccounts={bankAccounts}
            onEdit={() => handleEdit(policy)}
          />
        ))}
      </div>

      <AddInsuranceModal
        key={`add-${addModalKey}`}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        itemId={editingPolicy?.id}
        initialData={editingPolicy}
        onSaved={handleSaved}
        onDelete={handleDelete}
      />

      <RearrangeModal
        key={`rearrange-${rearrangeModalKey}`}
        isOpen={isRearrangeOpen}
        onClose={() => setIsRearrangeOpen(false)}
        items={policies}
        getLabel={(policy) => policy.name || policy.provider || "Unnamed Insurance"}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function InsurancePage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <Insurance />
    </Suspense>
  );
}
