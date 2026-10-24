"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { banks, brokers, loanProviders, subscriptions, allInsuranceProviders } from "@/components/dropdowns/Dropdown";
import InfoCard from "@/components/ui/InfoCard";
import DetailSection from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import EditLoginModal from "@/components/modals/EditLoginModal";
import SearchInput, { NoMatches } from "@/components/ui/SearchInput";
import FilterMenu from "@/components/ui/FilterMenu";
import { useUrlFilters } from "@/components/useUrlFilters";
import { matchesSearch } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";

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

const platforms = [...banks, ...brokers, ...loanProviders, ...subscriptions, ...allInsuranceProviders];
const platformLogo = (name, logins) => logoFor(platforms, name, logins.find((login) => login.customLogo)?.customLogo);

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
    { key: "platform", label: "Platform", getValue: (login) => login.platform, getImage: platformLogo },
  ]);

  const sortedLogins = logins
    .filter((login) => filters.matches(login) && matchesSearch([login.platform, login.username, ...login.usedBy.map((item) => item.name)], search))
    .sort((a, b) => a.platform.localeCompare(b.platform) || a.username.localeCompare(b.username));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Password Manager</h1>
        <div className="mt-1 text-sm text-muted">
          {loaded && <span>{logins.length} total · </span>}
          Editing a login updates every item that uses it.
        </div>
        {logins.length > 0 && (
          <div className="mt-4 flex gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search logins..." className="flex-1 min-w-0" />
            <FilterMenu filters={filters} />
          </div>
        )}
      </div>

      {loaded && logins.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] py-16 text-center text-sm text-muted">
          No saved logins yet. They&apos;re saved when you add a user name or password to an item.
        </div>
      )}

      {logins.length > 0 && sortedLogins.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {sortedLogins.map((login) => {
          return (
            <InfoCard
              key={login.id}
              image={logoFor(platforms, login.platform, login.customLogo)}
              imageAlt={login.platform}
              title={login.platform}
              subtitle={[
                login.username || "No user name",
                `Used by ${login.usedBy.length} ${login.usedBy.length === 1 ? "item" : "items"}`,
              ].join(" · ")}
              onEdit={() => handleEdit(login)}
            >
              <LoginDetailRow username={login.username} password={login.password} />
              <DetailSection title="Used By">
                {login.usedBy.length > 0 ? (
                  login.usedBy.map((item) => (
                    <Link key={item.id} href={categoryPaths[item.category]} className="detail-row rounded-md px-2 -mx-2 hover:bg-[var(--surface-hover)]">
                      <span className="font-medium truncate">{item.name || "Unnamed item"}</span>
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
