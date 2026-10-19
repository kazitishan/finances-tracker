"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsMenu from "@/components/SettingsMenu";
import { ChevronDownIcon } from "@/components/ui/icons";

const menus = [
    {
        href: "/accounts",
        label: "Accounts",
        links: [
            { href: "/accounts/bank-accounts", label: "Bank Accounts" },
            { href: "/accounts/investing", label: "Investing" },
        ],
    },
    {
        href: "/expenses",
        label: "Expenses",
        links: [
            { href: "/expenses/credit-cards", label: "Credit Cards" },
            { href: "/expenses/subscriptions", label: "Subscriptions" },
            { href: "/expenses/loans", label: "Loans" },
            { href: "/expenses/insurance", label: "Insurance" },
        ],
    },
];

const navItemClass = (active) =>
    `flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150 ${
        active
            ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
            : "text-muted hover:bg-[var(--surface-hover)] hover:text-foreground"
    }`;

function NavBar() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState(null);
    const navRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
        }
        function handleKeyDown(event) {
            if (event.key === "Escape") setOpenMenu(null);
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <header
            className="sticky top-0 z-40 border-b border-[var(--border)] backdrop-blur"
            style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)" }}
        >
            <div className="mx-auto flex max-w-4xl items-center gap-2 px-6 py-3 md:px-10">
                <nav ref={navRef} className="flex min-w-0 flex-1 items-center gap-1">
                    <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={navItemClass(pathname === "/")}>
                        Home
                    </Link>
                    {menus.map((menu) => {
                        const open = openMenu === menu.href;
                        return (
                            <div key={menu.href} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpenMenu(open ? null : menu.href)}
                                    className={navItemClass(pathname.startsWith(`${menu.href}/`))}
                                    aria-haspopup="menu"
                                    aria-expanded={open}
                                >
                                    {menu.label}
                                    <ChevronDownIcon size={14} />
                                </button>
                                {open && (
                                    <div className="dropdown-panel left-0 w-48" role="menu">
                                        {menu.links.map((link) => {
                                            const active = pathname.startsWith(link.href);
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    role="menuitem"
                                                    aria-current={active ? "page" : undefined}
                                                    onClick={() => setOpenMenu(null)}
                                                    className={`dropdown-item ${active ? "font-medium text-[var(--accent)]" : ""}`}
                                                >
                                                    {link.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <Link
                        href="/budgeting"
                        aria-current={pathname === "/budgeting" ? "page" : undefined}
                        className={navItemClass(pathname === "/budgeting")}
                    >
                        Budgeting
                    </Link>
                </nav>
                <SettingsMenu />
            </div>
        </header>
    );
}

export default NavBar;
