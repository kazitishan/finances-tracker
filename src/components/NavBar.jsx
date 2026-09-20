"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/", label: "Home" },
    { href: "/bank-accounts", label: "Bank Accounts" },
    { href: "/credit-cards", label: "Credit Cards" },
    { href: "/subscriptions", label: "Subscriptions" },
    { href: "/loans", label: "Loans" },
];

function NavBar() {
    const pathname = usePathname();

    return (
        <header
            className="sticky top-0 z-40 border-b border-[var(--border)] backdrop-blur"
            style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)" }}
        >
            <nav className="mx-auto flex max-w-4xl items-center gap-1 overflow-x-auto px-6 py-3 md:px-10">
                {links.map((link) => {
                    const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={active ? "page" : undefined}
                            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
                                active
                                    ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                                    : "text-muted hover:bg-[var(--surface-hover)] hover:text-foreground"
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}

export default NavBar;
