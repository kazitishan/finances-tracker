"use client";

import { useEffect, useState } from "react";
import AddCreditCardModal from "@/components/modals/AddCreditCardModal";
import CreditCardInfo from "@/components/info/CreditCardInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { accountAgeInMonths, formatMonthsAge } from "@/lib/formUtils";

export default function CreditCards() {
  const [cards, setCards] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/credit-cards")
      .then((res) => res.json())
      .then((data) => {
        setCards(data);
        setLoaded(true);
      });
    fetch("/api/bank-accounts")
      .then((res) => res.json())
      .then(setBankAccounts);
  }, []);

  function handleSaved(item) {
    setCards((prev) => {
      const exists = prev.some((card) => card.id === item.id);
      return exists ? prev.map((card) => (card.id === item.id ? item : card)) : [...prev, item];
    });
  }

  function handleAddClick() {
    setEditingCard(null);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  function handleEdit(card) {
    setEditingCard(card);
    setAddModalKey((key) => key + 1);
    setIsAddOpen(true);
  }

  async function handleDelete(id) {
    await fetch(`/api/credit-cards/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((card) => card.id !== id));
  }

  async function handleReorder(orderedIds) {
    const res = await fetch("/api/credit-cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderedIds }),
    });
    setCards(await res.json());
  }

  const ages = cards
    .map((card) => accountAgeInMonths(card.openMonth, card.openYear))
    .filter((months) => months !== null);
  const averageAgeLabel = ages.length > 0
    ? formatMonthsAge(ages.reduce((sum, months) => sum + months, 0) / ages.length)
    : null;

  const totalCreditLine = cards
    .filter((card) => card.creditLine)
    .reduce((sum, card) => sum + Number(card.creditLine), 0);

  return (
    <div>
      <PageHeader
        title="Credit Cards"
        count={loaded ? cards.length : null}
        stats={[
          { label: "Average Age", value: averageAgeLabel },
          { label: "Total Monthly Credit Line", value: totalCreditLine > 0 ? `$${totalCreditLine.toLocaleString()}` : null },
        ]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All credit cards */}
      {loaded && cards.length === 0 && <EmptyState noun="credit cards" onAdd={handleAddClick} />}

      <div className="flex flex-col gap-3">
        {cards.map((card) => (
          <CreditCardInfo key={card.id} card={card} bankAccounts={bankAccounts} onEdit={() => handleEdit(card)} />
        ))}
      </div>

      <AddCreditCardModal
        key={`add-${addModalKey}`}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        itemId={editingCard?.id}
        initialData={editingCard}
        onSaved={handleSaved}
      />

      <RearrangeModal
        key={`rearrange-${rearrangeModalKey}`}
        isOpen={isRearrangeOpen}
        onClose={() => setIsRearrangeOpen(false)}
        items={cards}
        getLabel={(card) => card.name || card.bank || "Unnamed Card"}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </div>
  );
}
