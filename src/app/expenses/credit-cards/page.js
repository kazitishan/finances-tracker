"use client";

import { Suspense, useEffect, useState } from "react";
import AddCreditCardModal from "@/components/modals/AddCreditCardModal";
import CreditCardInfo from "@/components/info/CreditCardInfo";
import RearrangeModal from "@/components/modals/RearrangeModal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { NoMatches } from "@/components/ui/SearchInput";
import { useUrlFilters } from "@/components/useUrlFilters";
import { accountAgeInMonths, formatCurrency, formatMonthsAge, matchesSearch } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";
import { banks } from "@/components/dropdowns/Dropdown";

const bankLogo = (name, cards) => logoFor(banks, name, cards.find((card) => card.customLogo)?.customLogo);

function CreditCards() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
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
    const res = await fetch(`/api/credit-cards/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
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

  function paymentMethodName(card) {
    const account = bankAccounts.find((account) => account.id === card.paymentMethod);
    return account ? account.name || "Unnamed Account" : null;
  }

  const filters = useUrlFilters(cards, [
    { key: "bank", label: "Bank", getValue: (card) => card.bank, getImage: bankLogo },
    { key: "paymentMethod", label: "Payment Method", getValue: paymentMethodName },
  ]);

  const filteredCards = cards.filter((card) =>
    filters.matches(card) && matchesSearch([card.name, card.bank, card.usage], search)
  );

  return (
    <div>
      <PageHeader
        title="Credit Cards"
        count={loaded ? cards.length : null}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        stats={[
          { label: "Average Age", value: averageAgeLabel },
          { label: "Total Monthly Credit Line", value: totalCreditLine > 0 ? formatCurrency(totalCreditLine, { cents: false }) : null },
        ]}
        onRearrange={() => {
          setRearrangeModalKey((key) => key + 1);
          setIsRearrangeOpen(true);
        }}
        onAdd={handleAddClick}
      />

      {/* All credit cards */}
      {loaded && cards.length === 0 && <EmptyState noun="credit cards" onAdd={handleAddClick} />}
      {cards.length > 0 && filteredCards.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {filteredCards.map((card) => (
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
        onDelete={handleDelete}
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

export default function CreditCardsPage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <CreditCards />
    </Suspense>
  );
}
