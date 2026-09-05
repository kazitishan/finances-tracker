"use client";

import { useEffect, useState } from "react";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import SubscriptionInfo from "@/components/info/SubscriptionInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then(setSubscriptions);
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

      {/* All subscriptions */}
      <div className="flex flex-col gap-4 mt-4">
        {subscriptions.map((subscription) => (
          <SubscriptionInfo
            key={subscription.id}
            subscription={subscription}
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
