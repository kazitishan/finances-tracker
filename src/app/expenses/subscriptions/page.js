"use client";

import { Suspense, useEffect, useState } from "react";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import SubscriptionInfo from "@/components/info/SubscriptionInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { NoMatches } from "@/components/ui/SearchInput";
import { useUrlFilters } from "@/components/useUrlFilters";
import { findPaymentAccount } from "@/components/dropdowns/PaymentMethodDropdown";
import { subscriptions as subscriptionServices } from "@/components/dropdowns/SubscriptionDropdown";
import { formatCurrency, matchesSearch } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";

const subscriptionLogo = (name, subscriptions) =>
  logoFor(subscriptionServices, name, subscriptions.find((subscription) => subscription.customLogo)?.customLogo);

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [creditCards, setCreditCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(data);
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
    setSubscriptions((prev) => {
      const exists = prev.some((subscription) => subscription.id === item.id);
      return exists
        ? prev.map((subscription) => (subscription.id === item.id ? item : subscription))
        : [...prev, item];
    });
  }

  function handleAddClick() {
    setEditingSubscription(null);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  function handleEdit(subscription) {
    setEditingSubscription(subscription);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== id));
  }

  async function handleReorder(orderedIds) {
    const res = await fetch("/api/subscriptions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderedIds }),
    });
    setSubscriptions(await res.json());
  }

  const monthlyTotal = subscriptions
    .filter((subscription) => subscription.billingCycle !== "year" && subscription.cost)
    .reduce((sum, subscription) => sum + Number(subscription.cost), 0);

  const yearlyPayments = subscriptions
    .filter((subscription) => subscription.billingCycle === "year" && subscription.cost)
    .reduce((sum, subscription) => sum + Number(subscription.cost), 0);
  const yearlyTotal = monthlyTotal * 12 + yearlyPayments;

  const filters = useUrlFilters(subscriptions, [
    {
      key: "subscription",
      label: "Subscription",
      getValue: (subscription) => subscription.subscription,
      getImage: subscriptionLogo,
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      getValue: (subscription) =>
        findPaymentAccount(subscription.paymentMethod, { creditCards, bankAccounts })?.displayName,
    },
  ]);

  const filteredSubscriptions = subscriptions.filter((subscription) =>
    filters.matches(subscription) && matchesSearch([subscription.name, subscription.subscription], search)
  );

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        count={loaded ? subscriptions.length : null}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        stats={[
          {
            label: "Monthly Total",
            value: monthlyTotal > 0 ? formatCurrency(monthlyTotal) : null,
          },
          {
            label: "Yearly Total",
            value: yearlyTotal > 0 ? formatCurrency(yearlyTotal) : null,
          },
        ]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All subscriptions */}
      {loaded && subscriptions.length === 0 && <EmptyState noun="subscriptions" onAdd={handleAddClick} />}
      {subscriptions.length > 0 && filteredSubscriptions.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {filteredSubscriptions.map((subscription) => (
          <SubscriptionInfo
            key={subscription.id}
            subscription={subscription}
            creditCards={creditCards}
            bankAccounts={bankAccounts}
            onEdit={() => handleEdit(subscription)}
          />
        ))}
      </div>

      <AddSubscriptionModal
        key={`add-${addModalKey}`}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        itemId={editingSubscription?.id}
        initialData={editingSubscription}
        onSaved={handleSaved}
        onDelete={handleDelete}
      />

      <RearrangeModal
        key={`rearrange-${rearrangeModalKey}`}
        isOpen={isRearrangeOpen}
        onClose={() => setIsRearrangeOpen(false)}
        items={subscriptions}
        getLabel={(subscription) => subscription.name || subscription.subscription || "Unnamed Subscription"}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function SubscriptionsPage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <Subscriptions />
    </Suspense>
  );
}
