"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import InfoCard from "@/components/ui/InfoCard";
import DetailSection from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import EditLoginModal from "@/components/modals/EditLoginModal";
import { NoMatches } from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useUrlFilters } from "@/components/useUrlFilters";
import { matchesSearch } from "@/lib/formUtils";
import { imageOf } from "@/lib/logos";

const categoryLabels = {
  "bank-accounts": "Bank Account",
  "credit-cards": "Credit Card",
  subscriptions: "Subscription",
  loans: "Loan",
  "investment-accounts": "Investment Account",
  insurance: "Insurance",
  utilities: "Utility",
};

const categoryPaths = {
  "bank-accounts": "/accounts/bank-accounts",
  "credit-cards": "/expenses/credit-cards",
  subscriptions: "/expenses/subscriptions",
  loans: "/expenses/loans",
  "investment-accounts": "/accounts/investing",
  insurance: "/expenses/insurance",
  utilities: "/expenses/utilities",
};

function Passwords() {
  const [logins, setLogins] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [editingLogin, setEditingLogin] = useState(null);
  const [editModalKey, setEditModalKey] = useState(0);

  function loadLogins() {
    return fetch("/api/passwords")
      .then((res) => res.json())
      .then((data) => {
        setLogins(data);
        setLoaded(true);
      });
  }

  useEffect(() => {
    fetch("/api/passwords")
      .then((res) => res.json())
      .then((data) => {
        setLogins(data);
        setLoaded(true);
      });
  }, []);

  function handleEdit(login) {
    setEditingLogin(login);
    setEditModalKey((key) => key + 1);
  }

  const filters = useUrlFilters(logins, [
    { key: "platform", label: "Platform", getValue: (login) => login.platform, getImage: (name, items) => imageOf(items) },
  ]);

  const sortedLogins = logins
    .filter((login) => filters.matches(login) && matchesSearch([login.platform, login.username, ...login.usedBy.map((item) => item.name)], search))
    .sort((a, b) => a.platform.localeCompare(b.platform) || a.username.localeCompare(b.username));

  return (
    <div>
      <PageHeader
        title="Password Manager"
        count={loaded ? logins.length : null}
        description="Editing a login updates every item that uses it."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search logins..."
        filters={filters}
      />

      {loaded && logins.length === 0 && (
        <EmptyState>No saved logins yet. They&apos;re saved when you add a username or password to an item.</EmptyState>
      )}

      {logins.length > 0 && sortedLogins.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {sortedLogins.map((login) => {
          return (
            <InfoCard
              key={login.id}
              image={login.img}
              imageAlt={login.platform}
              title={login.platform}
              subtitle={[
                login.username || "No username",
                `Used by ${login.usedBy.length} ${login.usedBy.length === 1 ? "item" : "items"}`,
              ].join(" · ")}
              onEdit={() => handleEdit(login)}
            >
              <LoginDetailRow username={login.username} password={login.password} />
              <DetailSection title="Used By">
                {login.usedBy.length > 0 ? (
                  login.usedBy.map((item) => (
                    <Link key={item.id} href={categoryPaths[item.category]} className="detail-row rounded-md px-2 -mx-2 hover:bg-[var(--surface-hover)]">
                      <span className="font-medium truncate">{item.name}</span>
                      <span className="detail-label shrink-0">{categoryLabels[item.category]}</span>
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-muted">No items use this login.</div>
                )}
              </DetailSection>
            </InfoCard>
          );
        })}
      </div>

      <EditLoginModal
        key={`edit-${editModalKey}`}
        isOpen={editingLogin !== null}
        onClose={() => setEditingLogin(null)}
        login={editingLogin}
        onChanged={loadLogins}
      />
    </div>
  );
}

export default function PasswordsPage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <Passwords />
    </Suspense>
  );
}
