"use client";

import { useEffect, useState } from "react";
import AddCreditCardModal from "@/components/modals/AddCreditCardModal";
import CreditCardInfo from "@/components/info/CreditCardInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import { accountAgeInMonths, formatMonthsAge } from "@/lib/formUtils";

export default function CreditCards() {
  const [cards, setCards] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => {
    fetch("/api/credit-cards")
      .then((res) => res.json())
      .then(setCards);
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
      {/* Stats + Rearrange + Add buttons */}
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex gap-4 text-sm text-gray-600">
          {averageAgeLabel && <span>Average Age: <span className="font-semibold text-gray-800">{averageAgeLabel}</span></span>}
          {totalCreditLine > 0 && (
            <span>Total Credit Line: <span className="font-semibold text-gray-800">${totalCreditLine.toLocaleString()}</span></span>
          )}
        </div>
        <div className="flex gap-2">
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
      </div>

      {/* All credit cards */}
      <div className="flex flex-col gap-4 mt-4">
        {cards.map((card) => (
          <CreditCardInfo key={card.id} card={card} onEdit={() => handleEdit(card)} />
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
