# Architecture

This document explains how Finances Tracker works: what runs where, how data is stored and moves through the app, the rules behind every calculation, and the conventions to follow when changing it. For install and run instructions aimed at end users, see [README.md](README.md).

---

## Table of contents

1. [What the app is](#1-what-the-app-is)
2. [Tech stack](#2-tech-stack)
3. [Running it and the process lifecycle](#3-running-it-and-the-process-lifecycle)
4. [Directory map](#4-directory-map)
5. [The big picture](#5-the-big-picture)
6. [Data storage: `private/info.json`](#6-data-storage-privateinfojson)
7. [The server layer](#7-the-server-layer)
8. [API reference](#8-api-reference)
9. [Saved logins (the password system)](#9-saved-logins-the-password-system)
10. [Logos: built-in platforms and "Other" uploads](#10-logos-built-in-platforms-and-other-uploads)
11. [Cross-item references](#11-cross-item-references)
12. [The client shell: layout, nav, settings, theme](#12-the-client-shell-layout-nav-settings-theme)
13. [Anatomy of a category page](#13-anatomy-of-a-category-page)
14. [Page-by-page reference](#14-page-by-page-reference)
15. [Dates, schedules and money math](#15-dates-schedules-and-money-math)
16. [Component catalog](#16-component-catalog)
17. [Styling system](#17-styling-system)
18. [Security and privacy model](#18-security-and-privacy-model)
19. [Quirks, inconsistencies and gotchas](#19-quirks-inconsistencies-and-gotchas)
20. [Recipes: how to extend the app](#20-recipes-how-to-extend-the-app)
21. [Conventions](#21-conventions)

---

## 1. What the app is

A **single-user, local-only** personal finance organizer. You run it on your own machine with `npm run dev` and open it at `http://localhost:3000`. It stores:

- **Accounts:** bank accounts (with debit cards) and investment accounts (with recurring investments).
- **Expenses:** credit cards, subscriptions, loans and insurance policies.
- **Logins:** usernames and passwords for each platform, deduplicated into a password manager.
- **Budget:** income streams and extra monthly expenses.

From that it derives an **upcoming payments** timeline (Home), per-category **totals**, and a monthly **budget breakdown** (Budgeting).

Everything lives in one JSON file, `private/info.json`, which is git-ignored. There is no database, no cloud service, no account and no authentication.

---

## 2. Tech stack

| Piece | Version / detail |
|---|---|
| Framework | **Next.js 16.3.3**, App Router (`src/app`). Note [AGENTS.md](AGENTS.md): this Next version has breaking changes from older ones; check `node_modules/next/dist/docs/` before using framework APIs. |
| UI | **React 19.2.8**. Every page and almost every component is a client component (`"use client"`). |
| Styling | **Tailwind CSS v4** via `@tailwindcss/postcss`. Configured in CSS (`@import "tailwindcss"` plus `@theme inline` in [globals.css](src/app/globals.css)); there is no `tailwind.config.js`. |
| Language | Plain **JavaScript** (`.js` / `.jsx`). No TypeScript. |
| Path alias | `@/*` → `./src/*` ([jsconfig.json](jsconfig.json)). |
| Fonts | Geist and Geist Mono via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`. |
| Linting | ESLint 9 flat config extending `eslint-config-next/core-web-vitals` ([eslint.config.mjs](eslint.config.mjs)). |
| Tests | None. |
| Runtime deps | Only `next`, `react`, `react-dom`. Everything else (dropdowns, modals, charts, icons) is hand-written. |

npm scripts ([package.json](package.json)):

| Script | Runs |
|---|---|
| `npm run dev` | `next dev`, the normal way to use the app |
| `npm run build` / `npm start` | production build / server |
| `npm run lint` | `eslint` |
| `npm run setup` | `node scripts/setup.js`, which creates `private/info.json` |

---

## 3. Running it and the process lifecycle

### First-time setup

[scripts/setup.js](scripts/setup.js) (plain CommonJS, run by Node directly):

- If `private/info.json` **doesn't exist**, it creates `private/` and writes the empty default document (see [§6](#6-data-storage-privateinfojson)).
- If it **exists but has no `"user-info"` key** (a file from before budgeting existed), it adds an empty `"user-info"` at the top and keeps everything else.
- Otherwise it prints `Setup already completed`.

Running setup is optional. The server's `readInfo()` also creates the file with defaults on first access ([§7](#7-the-server-layer)).

### Auto-shutdown when the last tab closes

The README tells users "to stop the app, simply close the tab." That works like this:

1. [KeepAlive.jsx](src/components/KeepAlive.jsx) is mounted once in the root layout. It opens an `EventSource` to `/api/keep-alive` and closes it on unmount.
2. [api/keep-alive/route.js](src/app/api/keep-alive/route.js) keeps a counter on `globalThis.__keepAlive` (so it survives hot-module reloads in dev). Each request increments `connections` and returns a never-ending `text/event-stream` that sends a `: ping` comment every 15 seconds.
3. When a connection aborts (tab closed or navigated away), the counter decrements. When it reaches **0**, a **5-second** timer starts, then `process.exit(0)` runs.
4. Any new connection within those 5 seconds clears the timer. This is why a page refresh doesn't kill the server.

Consequences:
- Closing every tab kills `npm run dev` **and** `npm start`.
- If no tab has ever connected, the server stays up indefinitely, because the timer only starts after a disconnect.
- Multiple tabs are fine; the server exits only when all are gone.

### Legacy URL redirects

[next.config.mjs](next.config.mjs) permanently redirects old flat URLs to the current nested ones:

| Old | New |
|---|---|
| `/bank-accounts` | `/accounts/bank-accounts` |
| `/investing` | `/accounts/investing` |
| `/credit-cards`, `/subscriptions`, `/loans`, `/insurance` | `/expenses/<same>` |

---

## 4. Directory map

```
.
├── AGENTS.md / CLAUDE.md       Agent instructions (CLAUDE.md just includes AGENTS.md)
├── README.md                   End-user setup guide
├── ARCHITECTURE.md             This file
├── next.config.mjs             Legacy URL redirects
├── jsconfig.json               @/* path alias
├── eslint.config.mjs, postcss.config.mjs
├── scripts/setup.js            Creates / migrates private/info.json
├── private/
│   ├── README.md               (tracked)
│   └── info.json               ALL USER DATA (git-ignored)
├── public/                     Logos, served from "/"
│   ├── banks/*.png             + uploads/
│   ├── investment/*.png        + uploads/
│   ├── loans/*.png             + uploads/
│   ├── subscriptions/*.png     + uploads/
│   └── insurance/*.png         + uploads/, health/*.png, health/uploads/
│       (each uploads/ keeps only its README.md in git; uploaded logos are git-ignored)
└── src/
    ├── app/                    Routes (App Router)
    │   ├── layout.js           Root layout: theme script, KeepAlive, ToastProvider, NavBar
    │   ├── globals.css         Design tokens + component classes
    │   ├── page.js             Home: upcoming payments
    │   ├── budgeting/page.js
    │   ├── passwords/page.js   Password Manager
    │   ├── accounts/bank-accounts/page.js
    │   ├── accounts/investing/page.js
    │   ├── expenses/{credit-cards,subscriptions,loans,insurance}/page.js
    │   └── api/
    │       ├── [category]/route.js        GET list, POST add, PUT reorder
    │       ├── [category]/[id]/route.js   PUT update, DELETE
    │       ├── passwords/route.js         GET saved logins
    │       ├── passwords/[id]/route.js    PUT, DELETE a saved login
    │       ├── user-info/route.js         GET/PUT budgeting info
    │       ├── download/route.js          GET info.json as attachment
    │       ├── import/route.js            POST replace info.json
    │       └── keep-alive/route.js        SSE connection counter / auto-exit
    ├── components/
    │   ├── NavBar.jsx, SettingsMenu.jsx, ToastProvider.jsx, KeepAlive.jsx
    │   ├── LoginFields.jsx               Username/password inputs + saved-login picker
    │   ├── RecurringInvestmentFields.jsx Editor for an account's recurring investments
    │   ├── useSaveItem.jsx               Save/delete/close logic shared by all item modals
    │   ├── useUrlFilters.jsx             URL-backed filter state
    │   ├── dropdowns/                    Dropdown (dispatcher), LogoDropdown, TypeDropdown
    │   ├── info/                         Read-only cards for each category + detail rows
    │   ├── modals/                       Add/Edit forms, Rearrange, EditLogin, ImageUpload
    │   └── ui/                           InfoCard, Modal, PageHeader, FilterMenu, icons, ...
    ├── data/platforms.json     Built-in platform names → logo paths
    ├── lib/                    Server store (infoStore, uploads) + pure helpers
    │   ├── infoStore.js        THE data layer (server-only, uses fs)
    │   ├── uploads.js          Logo file writes/deletes (server-only, uses fs)
    │   ├── formUtils.js        Formatting, masking, input sanitizing, date helpers
    │   ├── recurringInvestments.js  Investment schedule math
    │   └── logos.js            logoFor()
    └── util/                   Client-side fetch helpers + pure lookups
        ├── getBankAccounts.js, getPaymentMethods.js, getUserInfo.js, saveUserInfo.js
        ├── getMonthlyExpenses.js   This month's costs per category (for Budgeting)
        └── findPaymentAccount.js   Resolve "credit:<id>" / "debit:<id>"
```

---

## 5. The big picture

```
 Browser (client components only)                       Node (Next.js server)
 ┌────────────────────────────────────┐                ┌──────────────────────────────────┐
 │ layout.js                          │                │ src/app/api/**/route.js          │
 │  ├ <script> theme (pre-paint)      │                │   thin wrappers: parse request,  │
 │  ├ KeepAlive ── EventSource ───────┼── /keep-alive ─┼─▶ count tabs, exit when 0        │
 │  └ ToastProvider                   │                │                                  │
 │     ├ NavBar / SettingsMenu ───────┼── /download ──▶│                                  │
 │     │                      ────────┼── /import ────▶│        ┌────────────────────┐    │
 │     └ <page>                       │                │        │ lib/infoStore.js   │    │
 │        useEffect → fetch ──────────┼── /api/<cat> ─▶│───────▶│  readInfo()        │    │
 │        modals → useSaveItem ───────┼── POST/PUT ───▶│        │  writeInfo()       │──▶ private/info.json
 │        LoginFields ────────────────┼── /passwords ─▶│        │  login dedupe      │    │
 │        Budgeting ──────────────────┼── /user-info ─▶│        └─────────┬──────────┘    │
 └────────────────────────────────────┘                │                  ▼               │
                                                       │        lib/uploads.js ──────────▶ public/**/uploads/*.png|jpg
 next/image ◀──────────── static files ────────────────┤                                  │
                                                       └──────────────────────────────────┘
```

Key properties:

- **No server components do data work.** Pages render empty and fetch JSON from the API in `useEffect`. The root layout is the only server component, and it only renders the shell.
- **The API is a thin shell over [infoStore.js](src/lib/infoStore.js).** All rules (login dedupe, logo saving, migrations, validation) live in the store.
- **Every request reads the whole file, and every write rewrites the whole file**, synchronously (`fs.readFileSync` / `fs.writeFileSync`). There's no cache and no lock (see [§19](#19-quirks-inconsistencies-and-gotchas)).
- **Derived data is computed on the client**: upcoming payments, totals, budget, and payment-method lists.

---

## 6. Data storage: `private/info.json`

### Top-level shape

```json
{
  "user-info": { "income-streams": [], "additional-expenses": [] },
  "bank accounts": [],
  "credit cards": [],
  "subscriptions": [],
  "loans": [],
  "investment accounts": [],
  "insurance": [],
  "passwords": []
}
```

- Written with 2-space indentation and a trailing newline.
- `"user-info"` is **always the first key**. `withUserInfoFirst()` enforces this on every read and write, adding an empty one if it's missing.
- **Storage keys contain spaces** (`"bank accounts"`) while **URL slugs are kebab-case** (`bank-accounts`). `CATEGORY_KEYS` in infoStore maps one to the other:

| URL slug (`/api/<slug>`) | Storage key | Page |
|---|---|---|
| `bank-accounts` | `bank accounts` | `/accounts/bank-accounts` |
| `investment-accounts` | `investment accounts` | `/accounts/investing` |
| `credit-cards` | `credit cards` | `/expenses/credit-cards` |
| `subscriptions` | `subscriptions` | `/expenses/subscriptions` |
| `loans` | `loans` | `/expenses/loans` |
| `insurance` | `insurance` | `/expenses/insurance` |

`passwords` and `user-info` are **not** categories. They have their own routes and aren't reachable through `/api/[category]`.

### Value conventions

- **Almost every field is a string**, including numbers, because form inputs hold strings: `"cost": "15.99"`, `"dueDate": "15"`, `"expYear": "2029"`. Code converts with `Number(...)` at the point of use.
- Empty fields are stored as `""`, not omitted. Each modal's `initialFormState` defines every key.
- Each item gets `id: crypto.randomUUID()` on the server when it's added.
- **Updates replace the whole item.** `PUT` sends the full form, and the server stores `{ ...updates, id }`; it doesn't merge with the old object.
- Exceptions to "strings only": `recurringInvestments` is an array, and `user-info` amounts are real numbers.

### Item schemas

Every category item shares these fields:

| Field | Meaning |
|---|---|
| `id` | UUID, set by the server |
| `name` | User's label for it (optional; UI falls back to platform name or "Unnamed …") |
| *platform field* | `bank` / `broker` / `subscription` / `provider` (see table below) |
| `customLogo` | `""`, a saved upload path like `/banks/uploads/my-bank-1a2b3c4d.png`, or (only in transit) a `data:` URL |
| `link` | URL opened by the card's **Open** button |
| `loginUsername`, `loginPassword` | Login for the platform (feeds the password manager) |
| `notes` | Free text, shown with `whitespace-pre-wrap` |

The **platform field** per category (`PLATFORM_FIELDS` in infoStore):

| Category | Platform field | Dropdown options |
|---|---|---|
| bank accounts | `bank` | `platforms.bank` |
| credit cards | `bank` | `platforms.bank` |
| subscriptions | `subscription` | `platforms.subscription` |
| loans | `provider` | banks + `platforms["loan-provider"]`, sorted |
| investment accounts | `broker` | `platforms.broker` |
| insurance | `provider` | `platforms.healthInsurance` if type is Health, else `platforms.insurance` |

**Bank account** ([AddBankAccountModal.jsx](src/components/modals/AddBankAccountModal.jsx))

| Field | Values |
|---|---|
| `type` | `"Checking"` \| `"Savings"` \| `""` (radio buttons) |
| `routingNumber`, `accountNumber` | digits only |
| `apy` | decimal string, shown as `"<apy>%"` |
| `interestPaymentDate` | `"first"` \| `"last"` \| `""` (first or last day of the month) |
| `cardholder`, `cardNumber` (16 digits), `cvc` (3), `pin` (4), `expMonth` (`"01"`–`"12"`), `expYear` | Debit card fields, **only shown for Checking** |

**Credit card** ([AddCreditCardModal.jsx](src/components/modals/AddCreditCardModal.jsx))

| Field | Values |
|---|---|
| `openMonth`, `openYear` | Open date (year list goes back 50 years); used for card age |
| `cardholder`, `cardNumber` (16), `cvc` (3), `expMonth`, `expYear` | |
| `creditLine` | digits only, whole dollars |
| `paymentMethod` | **bank account `id`** (plain id, *not* `debit:<id>`; see [§11](#11-cross-item-references)) |
| `dueDate` | `"1"`–`"28"`, day of the month |
| `rewards` | multi-line text; **each line becomes a bullet** |
| `usage` | multi-line text; **each line becomes a chip** on the card and is searchable |

**Subscription** ([AddSubscriptionModal.jsx](src/components/modals/AddSubscriptionModal.jsx))

| Field | Values |
|---|---|
| `paymentMethod` | `"credit:<credit card id>"` \| `"debit:<bank account id>"` \| `""` |
| `cost` | decimal string |
| `billingCycle` | `"month"` (default) \| `"year"` |
| `billingMonth` | `"01"`–`"12"`, only used when yearly ("Renewal Month") |
| `billingDay` | `"1"`–`"28"` |

**Loan** ([AddLoanModal.jsx](src/components/modals/AddLoanModal.jsx))

| Field | Values |
|---|---|
| `type` | `Mortgage`, `Student Loans`, `Personal Loans`, `Business Loans`, `Auto Loan`, `Other` |
| `otherType` | free text, used when `type === "Other"` |
| `amountLoaned`, `interestAmount`, `amountPaid`, `monthlyPayment` | decimal strings (dollars) |
| `interestRate` | decimal string (percent) |
| `paymentDay` | `"1"`–`"28"` |

Amount remaining = `amountLoaned + interestAmount − amountPaid` (`amountRemaining()` in [LoanInfo.jsx](src/components/info/LoanInfo.jsx)); it's `null` if `amountLoaned` is empty.

**Investment account** ([AddInvestmentAccountModal.jsx](src/components/modals/AddInvestmentAccountModal.jsx))

| Field | Values |
|---|---|
| `type` | `"Brokerage"` \| `"Roth IRA"` \| `"401K"` (`investmentAccountTypes` in [InvestmentAccountInfo.jsx](src/components/info/InvestmentAccountInfo.jsx)) |
| `recurringInvestments` | array of recurring investments, below |

Recurring investment (documented in [recurringInvestments.js](src/lib/recurringInvestments.js)):

```json
{
  "id": "uuid (created in the browser)",
  "stock": "VOO",
  "amount": "50",
  "frequency": "daily | weekly | biweekly | monthly",
  "dayOfWeek": "1-5 (Mon-Fri), for weekly and biweekly",
  "dayOfMonth": "1-28, for monthly",
  "startDate": "YYYY-MM-DD, for biweekly: anchors which weeks it runs",
  "bankAccount": "bank account id it's paid from"
}
```

**Insurance** ([AddInsuranceModal.jsx](src/components/modals/AddInsuranceModal.jsx))

| Field | Values |
|---|---|
| `type` | `Health`, `Auto`, `Life`, `Home`, `Other` |
| `otherType` | free text, used when `type === "Other"` |
| `paymentMethod` | `"credit:<id>"` \| `"debit:<id>"` \| `""` |
| `premium`, `billingCycle`, `billingMonth`, `billingDay` | same meaning as subscription `cost` / billing fields |
| *type-specific fields* | per `insuranceTypeFields`, below |

`insuranceTypeFields` drives both the form and the info card:

| Type | Fields (`key`: label) |
|---|---|
| Health | `planName`, `memberId`†, `groupNumber`†, `deductible`$, `outOfPocketMax`$, `copay`$ (Primary Care Copay) |
| Auto | `policyNumber`†, `vehicles`, `coverage` (Liability Only / Full Coverage), `deductible`$ |
| Life | `policyNumber`†, `lifePolicyType` (Term / Whole / Universal / Variable), `deathBenefit`$, `termEndYear` (4 digits), `beneficiaries` |
| Home | `policyNumber`†, `homePolicyType` (Homeowners / Renters / Condo), `propertyAddress`, `dwellingCoverage`$, `personalPropertyCoverage`$, `deductible`$ |
| Other | `policyNumber`†, `coverageAmount`$, `deductible`$ |

$ = `money` (decimal input with a `$` prefix, shown as whole dollars). † = `copyable` (click to copy). Fields with `options` render as a `<select>`; `digits` fields are numeric with a max length of 4.

**Every insurance item stores the union of all type fields**, mostly as `""`, because `initialFormState` includes all of them. Only the current type's fields are shown.

### Saved login (`passwords[]`)

```json
{ "id": "uuid", "platform": "Chase", "username": "me", "password": "hunter2" }
```

See [§9](#9-saved-logins-the-password-system).

### Budgeting info (`user-info`)

```json
{
  "income-streams":      [ { "Day job": 5200 } ],
  "additional-expenses": [ { "Rent": 3500 }, { "Groceries": 600 } ]
}
```

Each entry is a **one-key object** `{ "<name>": <monthly amount> }`, with a real number amount that is ≥ 0. Order is preserved. Duplicate names are allowed because each entry is its own object.

### Migrations (automatic, on read)

| Situation | Handled by | Effect |
|---|---|---|
| File doesn't exist | `readInfo()` | Creates it with `DEFAULT_INFO` |
| No `"user-info"` | `withUserInfoFirst()` (and `setup.js`) | Adds an empty one, placed first |
| No `"passwords"` key | `addPasswordsKey()` | Builds `passwords` from every item's login, then writes the file |

---

## 7. The server layer

Only two modules touch the filesystem, and both are imported **only by route handlers**.

### [src/lib/infoStore.js](src/lib/infoStore.js)

Path: `path.join(process.cwd(), "private", "info.json")`, so **the server must be started from the project root**.

Internal tables:

| Constant | Purpose |
|---|---|
| `DEFAULT_USER_INFO`, `DEFAULT_INFO` | Empty document shapes |
| `CATEGORY_KEYS` | URL slug → storage key |
| `PLATFORM_FIELDS` | storage key → the field naming the platform |
| `UPLOAD_FOLDERS` | storage key → `public/` subfolder for uploaded logos (insurance picks `insurance/health` when `type === "Health"`) |

Internal helpers:

| Function | What it does |
|---|---|
| `readInfo()` | Creates the file if missing; parses it; puts user-info first; adds `passwords` if missing |
| `writeInfo(info)` | `mkdir -p private/`, writes JSON with user-info first |
| `withSavedLogo(key, item)` | If `item.customLogo` is a `data:` URL, saves it via `saveUpload` and replaces it with the public path |
| `loginOf(key, item)` | `{ platform: item[platformField], username: item.loginUsername, password: item.loginPassword }` |
| `sameLogin(a, b)` | All three of platform, username and password are equal |
| `saveLogin(info, login, replacing?)` | Adds or replaces a saved login (see [§9](#9-saved-logins-the-password-system)) |
| `itemsUsingLogin(info, login, excludeId?)` | Every item across all categories whose login equals `login` |
| `isAmountList`, `isUserInfo` | Validate the user-info shape |

Exports:

| Export | Used by | Behavior |
|---|---|---|
| `getCategoryKey(slug)` | internal | Throws `Unknown category: <slug>` for anything not in `CATEGORY_KEYS` |
| `listItems(slug)` | `GET /api/[category]` | The array, in stored order |
| `addItem(slug, item)` | `POST /api/[category]` | Assigns an id, saves the logo, appends, saves the login |
| `updateItem(slug, id, updates, loginMode)` | `PUT /api/[category]/[id]` | Full replace, plus the shared-password flow; returns `{ item }`, `{ item: null }` or `{ sharedWith }` |
| `deleteItem(slug, id)` | `DELETE /api/[category]/[id]` | Deletes its uploaded logo file, removes the item. **Doesn't** touch saved logins |
| `reorderItems(slug, ids)` | `PUT /api/[category]` | Rebuilds the array in `ids` order. **Items not listed in `ids` are dropped** |
| `getUserInfo()` / `updateUserInfo(v)` | `/api/user-info` | Update validates the shape, returns `null` if invalid |
| `importInfo(data)` | `POST /api/import` | Validates, then replaces everything (see [§8](#8-api-reference)) |
| `exportInfo()` | `GET /api/download` | Pretty JSON string of the whole file |
| `listLogins()` | `GET /api/passwords` | Saved logins, each with `customLogo` and `usedBy` attached |
| `updateLogin(id, {username, password})` | `PUT /api/passwords/[id]` | Rewrites the login on every item using it; merges duplicates |
| `deleteLogin(id)` | `DELETE /api/passwords/[id]` | Clears the login fields on every item using it, removes the saved login |

### [src/lib/uploads.js](src/lib/uploads.js)

| Export | Behavior |
|---|---|
| `isPendingUpload(v)` | `true` if `v` is a string starting with `data:` |
| `saveUpload(folder, name, dataUrl)` | Accepts only `data:image/(png\|jpeg);base64,…`. Decodes it, rejects anything over **5 MB**, checks the **magic bytes** (PNG signature or JPEG `FF D8 FF`, not just the MIME label), and builds `/<folder>/uploads/<slug(name) or "logo">-<8 hex>.<png\|jpg>`. That path must match the `UPLOAD_PATH` allow-list regex. Writes under `public/` and returns the public path |
| `deleteUpload(path)` | Deletes only paths matching `UPLOAD_PATH`, so built-in logos and empty values are never touched |

`UPLOAD_PATH` = `^/(banks|investment|loans|subscriptions|insurance|insurance/health)/uploads/[a-z0-9-]+\.(png|jpg)$`. Adding an upload folder means updating this regex.

---

## 8. API reference

All routes live under `src/app/api`. Bodies are JSON. In Next 16, `params` is a **Promise** and is awaited in every handler.

| Method & path | Body / query | Success | Errors |
|---|---|---|---|
| `GET /api/:category` | | `200` array of items | unknown category → thrown → **500** |
| `POST /api/:category` | item fields (no id) | `201` saved item (with `id`, saved `customLogo` path) | bad upload → **500** |
| `PUT /api/:category` | `{ "order": [id, …] }` | `200` reordered array | |
| `PUT /api/:category/:id` | full item; optional `?login=update-all\|new` | `200` saved item | `404` not found; **`409 { sharedWith: [names] }`** when a shared password changed and no `login` mode was given |
| `DELETE /api/:category/:id` | | `200 { ok: true }` (even if the id didn't exist) | |
| `GET /api/passwords` | | `200` `[{ id, platform, username, password, customLogo, usedBy: [{ id, name, category }] }]` (`category` is the URL slug) | |
| `PUT /api/passwords/:id` | `{ username, password }` | `200` updated login | `404` |
| `DELETE /api/passwords/:id` | | `200 { ok: true }` | |
| `GET /api/user-info` | | `200` user-info object | |
| `PUT /api/user-info` | full user-info | `200` saved user-info | `400` invalid JSON or shape |
| `GET /api/download` | | `200` file attachment `info.json`, `Cache-Control: no-store` | |
| `POST /api/import` | an entire info.json | `200 { ok: true }` | `400 Invalid JSON` / `400 Not an info.json file` |
| `GET /api/keep-alive` | | `text/event-stream` that never ends | |

Static routes (`passwords`, `user-info`, `download`, `import`, `keep-alive`) take precedence over the dynamic `[category]` segment.

`download`, `import` and `keep-alive` export `dynamic = "force-dynamic"`.

**Import validation** (`importInfo`): the data must be a plain object, contain **at least one category storage key** (e.g. `"bank accounts"`), have an array for every known list key that's present, and have a valid `user-info` if it's present. Missing lists become `[]`. If the file has no `passwords`, they're rebuilt from the items. Individual items are **not** validated.

---

## 9. Saved logins (the password system)

### Identity

A saved login is identified by the **triple (platform, username, password)**. "Platform" is the item's platform-field value, so a Chase login entered on a bank account is offered again on a Chase credit card or a loan from Chase. Two items "share a login" when all three values match.

### When logins are saved

- **On add** (`addItem`): if the item has a platform and at least a username or password, and the triple isn't already saved, a new saved login is appended.
- **On update** (`updateItem`): `saveLogin` runs with the new login, possibly *replacing* the old one (see below).
- **On import without a `passwords` key, or on the first read of an old file:** rebuilt from all items.

### Changing a password on an item

`updateItem` treats it as a **password change** when the old and new logins have the same platform, the same username, and both passwords are non-empty but different. Then:

1. It finds `sharing`: other items, in any category, that use the **old** login.
2. If any exist and the request had no `?login=` mode, **nothing is written**. The API returns `409 { sharedWith: [item names] }`.
3. [useSaveItem](src/components/useSaveItem.jsx) catches the 409 and renders `LoginChangePrompt` in place of the Save button: "*X and Y also use this login. Change the password for them too?*"
   - **Update password everywhere** → re-sends with `?login=update-all`. Every sharing item's `loginPassword` is updated, and the saved login gets the new password in place.
   - **Save as a new login** → `?login=new`. Only this item changes; the new triple is saved as an additional login and the old one stays.
   - **Cancel** → hides the prompt.
4. With no sharing items, the old saved login is updated in place.

After `update-all` succeeds, `useSaveItem` re-fetches the current category and calls `onSaved` for each item, so other cards on the **same page** show the new password. Other categories pick it up the next time their page loads.

### `saveLogin` dedupe rules

| New triple already saved? | `replacing` given and found? | Result |
|---|---|---|
| yes | yes | Remove the replaced one (it merges into the existing identical one) |
| yes | no | Nothing |
| no | yes | Replaced entry gets the new password |
| no | no | Append a new saved login |

### Password Manager page operations

- **Edit** (`updateLogin`): sets username and password on the saved login **and on every item using it**. If that makes it identical to another saved login, the two are merged.
- **Delete** (`deleteLogin`): blanks `loginUsername` and `loginPassword` on every item using it, then removes it. The confirm dialog names the affected items.

### Orphans

Changing an item's **username or platform** (not just the password), or deleting an item, does **not** remove the old saved login. It stays in the manager with "Used by 0 items" / "No items use this login" until it's deleted by hand.

### In forms: [LoginFields.jsx](src/components/LoginFields.jsx)

- Fetches `/api/passwords` once on mount and filters to logins whose `platform` equals the form's current platform value.
- With **one** match: a single "Use your saved *Chase* login · username" button (it changes to "Using …" with a check once applied).
- With **several**: a dropdown listing each username with a masked password, plus an eye toggle to reveal them all.
- Choosing a saved login fills both inputs. The selected login is whichever saved login exactly matches the current username and password.
- The password input has its own show/hide toggle and uses `autoComplete="new-password"` so browsers don't autofill it.

---

## 10. Logos: built-in platforms and "Other" uploads

### Built-in platforms

[src/data/platforms.json](src/data/platforms.json) lists `{ name, image }` for each group:

| Group key | Count | Image folder |
|---|---|---|
| `bank` | 13 (American Express … Wells Fargo) | `/banks/` |
| `broker` | 3 (Fidelity, Robinhood, Vanguard) | `/investment/` |
| `insurance` | 11 (Allstate … USAA) | `/insurance/` |
| `healthInsurance` | 10 (Aetna … UnitedHealthcare) | `/insurance/health/` |
| `loan-provider` | 1 (Federal Student Aid) | `/loans/` |
| `subscription` | 20 (Amazon Prime … YouTube) | `/subscriptions/` |

[Dropdown.jsx](src/components/dropdowns/Dropdown.jsx) re-exports these as named lists. The rest of the app imports them from there:

```js
banks, brokers, subscriptions,
loanProviders            // banks + loan-provider, sorted by name
healthInsuranceProviders, insuranceProviders,
allInsuranceProviders    // health + other
insuranceProvidersFor(type)  // Health → health list, else the other list
```

### Resolving a logo: [logos.js](src/lib/logos.js)

```js
logoFor(options, name, customLogo)
// → the built-in image if `name` is in `options`, else `customLogo`, else undefined
```

A platform's **name is its key**. Items store the name string (e.g. `"Chase"`), not an id. Renaming a platform in `platforms.json` will orphan existing items' logos.

### The "Other" flow

1. [LogoDropdown](src/components/dropdowns/LogoDropdown.jsx) always ends its list with **Other**, unless `allowOther={false}`. If your search found nothing, the search text carries over as the new platform's name, and the dropdown shows *Other · "search text"*.
2. In Other mode it shows an [ImageUploadButton](src/components/ui/ImageUploadButton.jsx) next to a name input.
3. The button opens [ImageUploadDialog](src/components/modals/ImageUploadDialog.jsx), which accepts drag-and-drop anywhere on the overlay or a file picker. It allows PNG/JPEG up to 5 MB, checked on the client, and reads the file into a **data URL**, stored in the form's `customLogo`.
4. On save, the server's `withSavedLogo` validates the data URL and writes it to `public/<folder>/uploads/`. The item stores the path.
5. Picking a listed platform again sets `customLogo` to `""`.
6. On update, if `customLogo` changed, the previous upload file is deleted. On item delete, its upload file is deleted.

Whether a saved item is in Other mode is inferred on open: if `value` is set but isn't one of the options, the dropdown starts in Other mode.

Filter menus and the Password Manager show an uploaded logo by finding **any** item with that platform that has a `customLogo`.

---

## 11. Cross-item references

Items point at each other **by id**, in three different formats:

| From | Field | Format | Points to | Picked with |
|---|---|---|---|---|
| Credit card | `paymentMethod` | `<bank account id>` | the bank account that pays the card | `Dropdown type="bank-account"` |
| Recurring investment | `bankAccount` | `<bank account id>` | the account it's funded from | `Dropdown type="bank-account"` |
| Subscription, Insurance | `paymentMethod` | `credit:<card id>` or `debit:<bank account id>` | the card that's charged | `Dropdown type="payment-method"` |

- **Payment methods** ([getPaymentMethods.js](src/util/getPaymentMethods.js)) are credit cards **that have a `cardNumber`** plus bank accounts **that have a `cardNumber`** (their debit card), each with a "Credit" or "Debit" badge. `findPaymentAccount()` resolves the prefixed value back to the item and adds a `displayName`.
- **No referential integrity:** deleting a bank account or card leaves dangling ids behind. The UI just omits the payment-method box, filter value or "from …" text when the lookup fails.
- The `bank-account` and `payment-method` dropdowns fetch their own data on mount, so each instance makes its own request.

---

## 12. The client shell: layout, nav, settings, theme

### [layout.js](src/app/layout.js) (the only server component)

```
<html data-theme? suppressHydrationWarning>
  <head><script> apply saved theme before first paint </script></head>
  <body>
    <KeepAlive/>
    <ToastProvider>
      <NavBar/>
      <main max-w-4xl, centered, px-6 md:px-10>{page}</main>
    </ToastProvider>
```

Metadata: title "Finances Tracker", description "Track your finances in one place".

### [NavBar.jsx](src/components/NavBar.jsx)

Sticky header with a translucent blurred background. Items:

- **Home** → `/`
- **Accounts ▾** → Bank Accounts, Investing
- **Expenses ▾** → Credit Cards, Subscriptions, Loans, Insurance
- **Budgeting** → `/budgeting`
- **⚙ Settings** (right side)

Menus close on an outside click or Escape. The active item gets the accent style; a menu is active when the path starts with `/accounts/` or `/expenses/`. `/accounts` and `/expenses` themselves have **no page**; they're only menu groupings.

### [SettingsMenu.jsx](src/components/SettingsMenu.jsx)

- **Password Manager** → `/passwords`
- **Download Info** → plain `<a href="/api/download" download>` plus a toast
- **Import Info** → hidden file input. It parses the JSON on the client (an invalid file shows a toast), shows a `confirm()` warning that everything will be replaced, POSTs to `/api/import`, then **reloads the page after 800 ms**, because pages only fetch on mount.
- **Theme**: System / Light / Dark segmented control.

### Theme mechanics

- The choice is stored in `localStorage["theme"]` as `"light"` or `"dark"`; for System the key is removed.
- It's applied as `<html data-theme="light|dark">`; System removes the attribute.
- An inline `<script>` in `<head>` applies it **before first paint**, so there's no flash. `suppressHydrationWarning` on `<html>` covers the attribute mismatch.
- The CSS defines tokens three times: `:root` (light), `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` (system dark), and `:root[data-theme="dark"]` (forced dark). **When you change a dark token, update both dark blocks.**

### [ToastProvider.jsx](src/components/ToastProvider.jsx)

- `useToast()` → `showToast(text)`: shows a single pill at the top center for 1.8 s. A new toast replaces the current one; a `key` bump restarts the animation.
- `useCopyToClipboard()` → `(text, label) => …`: writes to the clipboard and toasts "*label* copied" or "Couldn't copy *label*".

---

## 13. Anatomy of a category page

The six category pages (bank accounts, investing, credit cards, subscriptions, loans, insurance) all follow the same template. Learn one and you know them all.

```js
"use client";
function Things() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  // + any lookup data (bankAccounts, creditCards) for display
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);        // remount counters
  const [rearrangeModalKey, setRearrangeModalKey] = useState(0);

  useEffect(() => { fetch("/api/<slug>") … setLoaded(true) }, []);

  handleSaved(item)      // upsert into local state (also used after update-all)
  handleAddClick()       // editing = null, bump key, open
  handleEdit(item)       // editing = item, bump key, open
  handleDelete(id)       // DELETE, then remove locally; throws on failure
  handleReorder(ids)     // PUT { order }, replace local state with the response

  const filters = useUrlFilters(items, [...definitions]);
  const filtered = items.filter(i => filters.matches(i) && matchesSearch([...fields], search));

  return <>
    <PageHeader title count stats search filters onRearrange onAdd/>
    {loaded && none && <EmptyState/>}
    {some && noneMatch && <NoMatches/>}
    {filtered.map(i => <ThingInfo .../>)}
    <AddThingModal key={`add-${addModalKey}`} itemId={editingItem?.id} initialData={editingItem} .../>
    <RearrangeModal key={`rearrange-${rearrangeModalKey}`} items={items} getLabel .../>
  </>;
}
export default function Page() { return <Suspense><Things/></Suspense>; }  // useSearchParams needs it
```

Patterns worth knowing:

- **Key-bump remounting.** Modals keep their form in `useState(() => initial)`. Bumping the `key` before opening forces a fresh mount, so the form resets to the item being edited, or to blank. Modals call their hooks first and then `return null` when `!isOpen`, which keeps hook order stable.
- **Add and Edit use the same modal**, switched by `itemId`. The title, button label and Delete button depend on it.
- **`initialForm = { ...initialFormState, ...initialData }`**, so items saved before a field existed get that field's default when edited.
- **Dirty check on close.** `useSaveItem().requestClose` compares `JSON.stringify(form)` with `initialForm` and asks "Discard unsaved changes?". It runs on the X button, a backdrop click and Escape.
- **Delete** asks "Delete this item? This cannot be undone." Both the Edit modal and the Rearrange modal offer it.
- **Rearrange modal:** up/down arrows reorder a local copy; **Done** sends the full order. Deleting from inside it happens **immediately**. Closing without Done discards the reorder, with no prompt.
- **The search box and Filter button appear only when count > 0.**

### [useSaveItem](src/components/useSaveItem.jsx)

`useSaveItem({ category, itemId, form, initialForm, onSaved, onDelete, onClose })` returns `{ save, remove, requestClose, submitting, prompt }`.

- `save(loginMode?)`: POSTs to `/api/<category>` for a new item or PUTs to `/api/<category>/<itemId>` for an existing one, appending `?login=<mode>` if a mode is given. A 409 stores `sharedWith`, which makes `prompt` render. On success it calls `onSaved`, then toasts "Added", "Saved" or "Saved everywhere", and closes. On failure it toasts "Couldn't save".
- Modals render `{prompt || <buttons/>}`.

### [useUrlFilters](src/components/useUrlFilters.jsx)

- Filters live in the URL query, e.g. `?bank=Chase&bank=SoFi&type=Checking`, so a filtered view can be bookmarked. It writes with `window.history.replaceState` (no navigation) and reads with `useSearchParams`.
- Each definition is `{ key, label, getValue(item), getImage?(value, itemsWithValue) }`.
- **Options come only from values present in your own items**, with counts, sorted alphabetically.
- Matching is **case-insensitive** (`?bank=chase` works). Selections within a group are OR'd; groups are AND'd.
- It returns `{ groups, toggle, clear, matches, activeCount }`, which [FilterMenu](src/components/ui/FilterMenu.jsx) renders as a checkbox menu with a count badge and a "Clear filters" button.

Search (`matchesSearch` in formUtils) joins the given fields and does a case-insensitive substring match. An empty query matches everything.

---

## 14. Page-by-page reference

### Home: [src/app/page.js](src/app/page.js)

"Bills, investments and interest coming up, soonest first." It fetches six categories in parallel and builds one list:

| Source | Kind label | Date rule | Amount shown |
|---|---|---|---|
| Credit card | Credit card payment | next `dueDate` day | — |
| Subscription | Subscription payment | monthly: next `billingDay`; yearly: next `billingMonth`/`billingDay` | `cost` |
| Bank account | Interest payment | next first or last day of the month (`interestPaymentDate`) | — |
| Loan | Loan payment | next `paymentDay` | `monthlyPayment` |
| Insurance | Insurance payment | same as subscription, using `premium` | `premium` |
| Recurring investment | Recurring investment | `nextInvestmentDate()` | `amount` |

Items with no computable date are dropped. The list is sorted by days until the payment, and each row links to its category page. The pill reads "today", "tomorrow" or "in N days", and is **accent-colored when ≤ 3 days away**. "Today" counts as upcoming.

### Bank Accounts: `/accounts/bank-accounts`

- Filters: Account Type, Bank. Search: name, bank, type.
- Card: subtitle is bank · masked account number; type chip; "Debit card expired" / "Debit card expires soon" danger chip (Checking only). Details: login, routing number (copyable), account number (revealable), APY, interest date, a **Debit Card** section (Checking only, if any field is filled), notes.

### Investing: `/accounts/investing` (API slug `investment-accounts`)

- Also loads bank accounts so it can show "from *Account*".
- Header stat: **Invested This Month** = the sum of `investedInMonth` over every recurring investment, i.e. each amount times the number of days it runs this calendar month (the same figure Budgeting uses).
- Filters: Broker, Type. Search: name, broker, type, **and every recurring investment's stock**.
- Card: type chip; a **Recurring Investments** section listing stock, schedule ("Every Monday", "Every other Friday", "15th of every month", "Every market day"), funding account and amount.
- The form edits recurring investments inline ([RecurringInvestmentFields](src/components/RecurringInvestmentFields.jsx)). Biweekly shows a **Next Investment** picker with the next two dates on the chosen weekday; whichever one you pick becomes `startDate`. Changing the weekday re-anchors `startDate` automatically (`withStartDate`).

### Credit Cards: `/expenses/credit-cards`

- Also loads bank accounts (for the payment method).
- Header stats: **Average Age**, the mean of the cards' ages in months, formatted as "N years, M months old"; and **Total Monthly Credit Line**, the sum of `creditLine`.
- Filters: Bank, Payment Method (bank account name). Search: name, bank, usage.
- Card: an expiry danger chip, then one chip per `usage` line. Details: login, open date with age, cardholder, card number and CVC (revealable), expiration, credit line, "Payments Due: 15th of every month", the Payment Method box, Rewards & Benefits bullets, notes.

### Subscriptions: `/expenses/subscriptions`

- Also loads credit cards and bank accounts.
- Stats: **Monthly Total** = sum of monthly-billed costs; **Yearly Total** = monthly × 12 + sum of yearly-billed costs.
- Filters: Subscription, Payment Method. Search: name, subscription.
- Card: key stat "Monthly/Yearly Cost"; "Renews" row; Payment Method box.

### Loans: `/expenses/loans`

- Stats: **Monthly Total** (sum of `monthlyPayment`), **Yearly Total** (× 12), **Total Debt** (sum of amount remaining).
- Filters: Provider, Type. Search: name, provider, type label.
- Card: key stat "Amount Remaining"; type chip (shows `otherType` for Other).

### Insurance: `/expenses/insurance`

- Stats: same Monthly and Yearly Total rules as subscriptions, using `premium`.
- Filters: Type, Provider. Search: name, provider, type label.
- Form: switching between Health and non-Health **clears a listed provider** that doesn't fit the new type. A provider entered through Other is kept.

### Password Manager: `/passwords`

Reached from Settings, not the nav bar. Lists saved logins sorted by platform, then username. Each card shows the logo, username, "Used by N items", masked username and password, and a **Used By** list linking to each item's page. Edit and Delete work as described in [§9](#9-saved-logins-the-password-system). Filter: Platform. Search: platform, username, names of the items using it.

### Budgeting: [src/app/budgeting/page.js](src/app/budgeting/page.js)

The title is "*<Current month>* Budgeting". It loads `user-info` and `getMonthlyExpenses()` (this month), and renders nothing until both arrive.

- **Income Streams** and **Additional Expenses** cards: add `name + $amount` rows or remove them. Changes save immediately, **optimistically**, and roll back with a "Couldn't save" toast on failure.
- **From Your Accounts**: this month's per-item costs, grouped by Subscriptions, Loans, Insurance and Investments, each with a link to its page.
- **Donut chart** (hand-rolled SVG, `Donut` component) plus legend and stat tiles (Monthly Income, Monthly Spending, Left Over or Over Budget).

Calculation:

```
income    = Σ income streams
spending  = Σ subscriptions + loans + insurance + investments (this month)  +  Σ additional expenses
leftOver  = income − spending
slices    = [Subscriptions, Loans, Insurance, Investments, …additional, Left Over (if > 0)]  (zero slices hidden)
ring size = max(income, spending)          // so over-budget fills the ring with spending
share %   = amount / (income > 0 ? income : spending)
```

Colors: the account categories use the fixed `--series-1..4`. Additional expenses take `--series-5..8` in order. With **more than 4** additional expenses, the first 3 get their own colors and the rest merge into one "Other Expenses (n)" slice in `--series-8`. Left Over is neutral (`--border-strong`). Slices in the same group are separated by a 2-unit gap and different groups by an 8-unit gap. Hovering a slice or legend row highlights it (thicker stroke, others dimmed) and shows it in the center. Otherwise the center shows Left Over, Over Budget (red), or Spending when there's no income.

---

## 15. Dates, schedules and money math

All date math uses **local time at midnight** (`startOfToday()`), so time zones don't shift days.

### [formUtils.js](src/lib/formUtils.js)

| Helper | Behavior |
|---|---|
| `nextOccurrence(day, month?)` | Next date, today included, on `day` this month or next month; with `month`, on that month and day this year or next year |
| `nextInterestDate("first"\|"last")` | Next 1st of the month, or next last day of the month |
| `daysUntil(date)` / `formatDaysUntil(n)` | Whole days from today / "today", "tomorrow", "in N days" |
| `expiryStatus(m, y)` | `"expired"`, `"soon"` (≤ 60 days left) or `null`. A card is valid **through the end of** its expiry month |
| `accountAgeInMonths`, `formatMonthsAge`, `formatAccountAge` | Card age |
| `dueDates` | Days 1–**28** only, so every month has every option |
| `months`, `years` (current year to 2099), `pastYears` (current year back 50) | Select options |
| `formatCurrency(n, {cents})` | `$1,234.56` or `$1,234` |
| `formatNames([...])` | "A", "A and B", "A, B and C", "A, B and N others" |
| `onlyDigits`, `onlyDecimal` | Input sanitizers (one decimal point allowed) |
| `maskLast4` → `•••• 1234`; `maskAll` → `••••••` | Display masks |
| `groupFromRight` | Groups digits in 4s from the right, for card and account numbers. `stripSpacesOnCopy` removes the spaces again when copying |
| `matchesSearch`, `ordinal`, `interestPaymentOptions`, `inputClasses` (= `"field"`) | |

### [recurringInvestments.js](src/lib/recurringInvestments.js)

Only **weekends** are skipped. Market holidays are not accounted for.

| Frequency | Runs on |
|---|---|
| `daily` | Every Monday–Friday |
| `weekly` | Every `dayOfWeek` |
| `biweekly` | `dayOfWeek` days that are a multiple of 14 days from `startDate` |
| `monthly` | `dayOfMonth`; if that's a Saturday it moves +2 days, if a Sunday +1, i.e. to the following Monday |

- `isInvestmentDay(inv, date)` is the core predicate.
- `nextInvestmentDate(inv)` scans the next 40 days; it returns `null` if the schedule is incomplete.
- `investedInMonth(inv, date)` = `amount × (number of run days in that calendar month)`. A weekly $50 investment can cost $200 or $250 depending on the month.
- `describeSchedule`, `allRecurringInvestments(accounts)` (flattens to `{investment, account}`), and `investmentName` ("VOO · My Roth IRA").

### Monthly cost rules (Budgeting, via [getMonthlyExpenses.js](src/util/getMonthlyExpenses.js))

| Category | Counted this month as |
|---|---|
| Subscription, monthly | `cost` |
| Subscription, yearly | full `cost`, **only in its renewal month** (otherwise 0) |
| Loan | `monthlyPayment` |
| Insurance, monthly | `premium` |
| Insurance, yearly | `premium / 12`, **spread across every month** |
| Recurring investment | `investedInMonth` (actual run days this month) |

Items costing 0 this month are left out. Note that yearly subscriptions and yearly insurance are handled differently; see [§19](#19-quirks-inconsistencies-and-gotchas).

---

## 16. Component catalog

### Dropdowns: [src/components/dropdowns/](src/components/dropdowns/)

**`Dropdown`** is the single entry point. Choose its behavior with `type`:

| `type` | Renders | Value stored |
|---|---|---|
| `bank`, `broker`, `subscription`, `loan-provider`, `health-insurance-provider`, `insurance-provider` | `LogoDropdown` of built-in platforms + **Other** (`customLogo`, `onCustomLogoChange`) | platform name |
| `bank-account` | `LogoDropdown` of *your* bank accounts, no Other | bank account id |
| `payment-method` | `LogoDropdown` of your cards (credit + debit), no Other | `credit:<id>` / `debit:<id>` |
| `insurance-type`, `loan-type` | `TypeDropdown`; choosing **Other** shows a text input (`otherValue`, `onOtherChange`) | type string |

Placeholders are generated from the type: "Select a bank", "Search loan providers...", "Enter broker name", "No bank accounts found". An unknown type throws.

**`LogoDropdown`** is a searchable button-plus-panel. Options are `{ name, image?, value?, detail?, keywords? }`; the search matches `name` and `keywords`. It closes on an outside click and autofocuses its search box.

**`TypeDropdown`** is a simple list. It exports `typeLabel(type, otherType)`, which returns `otherType` for Other.

### Info cards: [src/components/info/](src/components/info/)

`BankAccountInfo`, `CreditCardInfo`, `SubscriptionInfo`, `LoanInfo`, `InvestmentAccountInfo` and `InsuranceInfo` each map an item onto `InfoCard`. Shared rows:

| Component | Behavior |
|---|---|
| `DetailRow` | label/value row; **renders nothing if the value is empty**; optional click-to-copy |
| `RevealableDetailRow` | masked value + eye toggle; revealed values are grouped in 4s; click copies the raw value; manual copy strips spaces. Also exports `EyeIcon`/`EyeOffIcon` |
| `LoginDetailRow` | username and password side by side, **both masked**, each revealable and copyable |
| `PaymentMethodCard` | the "Payment Method" box with logo, name and masked number |

### UI primitives: [src/components/ui/](src/components/ui/)

| Component | Notes |
|---|---|
| `InfoCard` | Logo tile, title, subtitle (or "—"), chips (strings, or `{label, tone:"danger"}`), optional key `stat` `{label, value, caption}` shown in the header and again in the expanded body, **Open** link (`target=_blank`, `noopener`), Edit pencil, chevron. Clicking the header toggles it. The collapsed body is `inert`. If no detail rows render, CSS shows "No other details" |
| `Modal` | Backdrop + panel; X, backdrop click and **Escape** close it. A module-level **stack** makes Escape close only the innermost modal. Locks body scroll while open |
| `PageHeader` | Title, "N total", non-empty stats, Rearrange + Add buttons, search + filter row (only when count > 0) |
| `FilterMenu` | Renders `useUrlFilters` groups |
| `SearchInput` / `NoMatches` | Escape or X clears; "No matches for “…”." or "No matches for these filters." |
| `EmptyState` | "No *noun* yet." + "Add your first" |
| `DetailSection` / `NotesSection` | Titled block; notes keep line breaks |
| `ImageUploadButton` | Square tile showing the current logo, with a hover tooltip |
| `icons.jsx` | Inline SVG icons (Lucide-style paths): ChevronDown, Pencil, ArrowUpRight, Plus, X, ArrowUpDown, ArrowUp, ArrowDown, Key, Check, Gear, Download, Search, Filter, Upload, Image, Trash |

### Other modals: [src/components/modals/](src/components/modals/)

| Modal | Notes |
|---|---|
| `Add*Modal` (6) | One per category; see [§6](#6-data-storage-privateinfojson) for fields. Validation is **soft**: card number ≠ 16 digits, CVC ≠ 3 or PIN ≠ 4 shows an error after blur but **doesn't block saving** |
| `RearrangeModal` | See [§13](#13-anatomy-of-a-category-page) |
| `EditLoginModal` | Password Manager edit/delete; "Changes also apply to …" |
| `ImageUploadDialog` | Rendered with `createPortal` into `document.body` so it sits above the form that opened it |

---

## 17. Styling system

Everything is in [globals.css](src/app/globals.css): design tokens, then a `@layer components` block of semantic classes. Components use those classes plus Tailwind utilities, often with arbitrary values such as `bg-[var(--surface-hover)]`.

**Tokens**: `--background`, `--surface`, `--surface-hover`, `--border`, `--border-strong`, `--foreground`, `--muted`, `--accent` (green), `--accent-hover`, `--accent-soft`, `--accent-contrast`, `--danger`, `--danger-soft`, `--ring`, `--overlay`, `--shadow`, `--shadow-lg`, and chart colors `--series-1..8` (fixed order, chosen to be distinguishable with color-vision deficiencies). `@theme inline` exposes some as Tailwind colors (`text-muted`, `bg-surface`, `text-accent`, …) and fonts (`font-sans`, `font-mono`).

**Component classes**:

| Group | Classes |
|---|---|
| Buttons | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.icon-btn`, `.link-btn` |
| Forms | `.field` (inputs, selects, textareas, and dropdown triggers), `.field-label` (small uppercase), `.field-error`, `.field-hint`, `.form-section` (top border, used for groups like "Debit Card Info" and "Notes") |
| Surfaces | `.card` (with a `rise-in` entry animation), `.logo-tile` (40×40), `.upload-tile`, `.drop-zone`, `.chip`, `.chip-danger`, `.tooltip` (shown on `.group:hover`) |
| Overlays | `.modal-backdrop`, `.modal-panel`, `.dropdown-panel`, `.dropdown-item`, `.toast` |
| Cards | `.expand` (grid-rows 0fr→1fr animation via `data-open`), `.detail-row`, `.detail-label`, `.key-stat*`, `.copyable`, `.card-body:empty::before` |

Design rules stated in the CSS comments:
- **Accent color marks data in only one place**: the key stat on a card.
- **Danger chips are only for warnings**, such as a card about to expire.

Animations: `fade-in`, `pop-in`, `toast-in`, `rise-in`.

---

## 18. Security and privacy model

The data model is "it's my own machine." Be aware of what that means:

- **Everything is plaintext** in `private/info.json`, including passwords, full card numbers, CVCs, PINs, account and routing numbers. There's no encryption at rest.
- **No authentication on the API.** Anything that can reach the server's port can read all data (`GET /api/download`), overwrite it (`POST /api/import`), or stop the server.
- **Download Info exports everything**, including passwords, as a plain file.
- **Masking is cosmetic.** Values are masked in the UI, but the full values are in the API responses and in browser memory.
- `private/info.json` and uploaded logos are **git-ignored**. Keep it that way, and never commit a real `info.json`.
- Uploads are restricted: PNG/JPEG only, verified by magic bytes, ≤ 5 MB, and written only to allow-listed folders with server-generated filenames, so there's no path traversal from user input.
- External links open with `rel="noopener noreferrer"`.
- `next/font/google` self-hosts the fonts, so the browser makes no third-party requests at runtime.

---

## 19. Quirks, inconsistencies and gotchas

Things that surprise people, collected in one place. Some are deliberate trade-offs; some are candidates for cleanup.

**Data layer**
- **No locking**: every write is read-modify-write of the whole file. Two writes landing at the same moment could lose one. That's fine for one user clicking, but don't add background writers without addressing it.
- **Unknown categories cause a 500, not a 404**, because `getCategoryKey` throws and route handlers don't catch it. The same goes for a rejected upload (the client shows "Couldn't save").
- **`PUT /api/:category` with an incomplete `order` deletes the missing items.**
- `DELETE` returns `ok` even for ids that don't exist.
- Imported items aren't validated. The upload files themselves aren't part of Download/Import, so an import on another machine can reference logos that don't exist there.
- `process.cwd()` decides where data lives, so the server must start from the project root.

**Hidden stale fields**
- Switching a bank account from Checking to Savings **hides** the debit fields but doesn't clear them. If `cardNumber` stays filled, the account still appears as a **payment method**.
- Switching insurance type keeps the old type's fields (hidden). Switching billing from yearly to monthly keeps `billingMonth`.

**Inconsistent conventions**
- Credit card `paymentMethod` is a **bare bank account id**, while subscription and insurance `paymentMethod` is **`credit:`/`debit:`-prefixed**. They're different dropdown types under the same field name.
- Budgeting counts **yearly subscriptions in full in their renewal month**, but **spreads yearly insurance premiums evenly (÷ 12)**.
- `SubscriptionInfo` passes `paymentAccount.name` to the payment box, while `InsuranceInfo` passes `displayName` (which has the "Unnamed …" fallback).
- The credit card stat is labeled "Total **Monthly** Credit Line", but it's simply the sum of credit lines.
- The Investing page lives at `/accounts/investing`, but its API slug is `investment-accounts`.
- Indentation: 2 spaces in `src/app/*` pages, 4 spaces in components, lib and api routes.

**Validation limits**
- CVC must be **3 digits**, so American Express 4-digit CIDs don't fit (input is sliced to 3). Card numbers are capped at **16** digits (15-digit Amex numbers show a soft error).
- Day-of-month pickers only go to **28**.
- Recurring investments ignore market holidays.

**UI behavior**
- Pages fetch once on mount. After Import, the app reloads the page to pick up the new data.
- After "Update password everywhere", only the **current page's** items refresh in place.
- The `bank-account` and `payment-method` dropdowns fetch independently per instance; a form with several recurring investments makes several requests.
- Saved logins aren't cleaned up when items change username or platform or are deleted.
- The Home empty state only suggests credit cards, subscriptions and bank accounts, though loans, insurance and investments also appear there.

---

## 20. Recipes: how to extend the app

### Add a built-in platform (bank, broker, subscription, …)

1. Add the logo PNG to the right `public/` folder (e.g. `public/subscriptions/notion.png`).
2. Add `{ "name": "Notion", "image": "/subscriptions/notion.png" }` to the matching group in [platforms.json](src/data/platforms.json).

Existing items whose platform name equals the new name start showing the built-in logo automatically, because `logoFor` prefers built-ins over `customLogo`.

### Add a field to an existing category

1. Add it to `initialFormState` in that category's `Add*Modal` (old items pick up the default when edited).
2. Add the input. Use `inputClasses`, `.field-label`, and `onlyDigits` / `onlyDecimal` as needed.
3. Show it in the matching `*Info` component (`DetailRow` hides empty values for free).
4. If it affects totals, dates or the budget, update the page stats, Home's `buildPayments`, or `getMonthlyExpenses`.

### Add an insurance type or type field

Edit `insuranceTypeFields` in [AddInsuranceModal.jsx](src/components/modals/AddInsuranceModal.jsx). The form, the info card and the stored field set all derive from it. For a new **type**, also add it to `typesByType["insurance-type"]` in [Dropdown.jsx](src/components/dropdowns/Dropdown.jsx).

### Add a loan type

Add it to `typesByType["loan-type"]` in Dropdown.jsx.

### Add a whole new category

1. **Store** ([infoStore.js](src/lib/infoStore.js)): add it to `DEFAULT_INFO`, `CATEGORY_KEYS`, `PLATFORM_FIELDS` and `UPLOAD_FOLDERS`.
2. **Uploads**: if it has a new logo folder, create `public/<folder>/` and `public/<folder>/uploads/README.md`, and add the folder to `UPLOAD_PATH` in [uploads.js](src/lib/uploads.js).
3. **Setup**: add it to `defaultInfo` in [scripts/setup.js](scripts/setup.js).
4. **Platforms**: add a group to `platforms.json`, export it from `Dropdown.jsx`, and add an `optionsByType` entry.
5. **UI**: create `AddXModal` (copy one; use `useSaveItem`, `LoginFields`, `Dropdown`), `XInfo` (use `InfoCard`), and `src/app/<group>/<slug>/page.js` (copy one; follow [§13](#13-anatomy-of-a-category-page)).
6. **Nav**: add a link in `menus` in [NavBar.jsx](src/components/NavBar.jsx).
7. **Password Manager**: add it to `categoryLabels`, `categoryPaths` and the `platforms` list in [passwords/page.js](src/app/passwords/page.js).
8. **Home / Budgeting**, if it has dates or costs: extend `buildPayments` in [page.js](src/app/page.js) and `getMonthlyExpenses` plus `CATEGORIES` in budgeting.
9. **Import**: nothing to do. `importInfo` reads list keys from `DEFAULT_INFO` and `CATEGORY_KEYS`.

### Add a new `Dropdown` type

Add it to `optionsByType` for platform lists, to `typesByType` for simple type lists, or as a new branch like `bank-account` for user data. Then add the type to the comment list above `Dropdown`.

---

## 21. Conventions

- **Client components by default.** Pages are `"use client"` and fetch from `/api` in `useEffect`. Server-only code (anything that imports `fs`) stays in `src/lib/infoStore.js` and `src/lib/uploads.js`, and is imported only by route handlers.
- **`src/lib`** holds the store plus pure helpers usable anywhere. **`src/util`** holds small client fetch wrappers and lookups.
- **Platforms are referenced by name; items are referenced by id.**
- **Store strings from forms**; convert with `Number()` where needed.
- **Every form field gets a default** in `initialFormState`.
- **Comments explain *why* or describe a data shape**, in plain sentences, above the function or constant. Match that density; don't narrate obvious code.
- **Use semantic CSS classes** (`.btn`, `.field`, `.card`, …) and tokens (`var(--…)`) rather than raw colors, so dark mode keeps working.
- **User-visible feedback goes through toasts**; destructive actions go through `window.confirm`.
- **Before using a Next.js API, check the bundled docs** in `node_modules/next/dist/docs/` (see [AGENTS.md](AGENTS.md)).
