"use client";

import { useEffect, useState } from "react";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import SubscriptionInfo from "@/components/info/SubscriptionInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
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
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
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

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        count={loaded ? subscriptions.length : null}
        stats={[]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All subscriptions */}
      {loaded && subscriptions.length === 0 && <EmptyState noun="subscriptions" onAdd={handleAddClick} />}

      <div className="flex flex-col gap-3">
        {subscriptions.map((subscription) => (
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
