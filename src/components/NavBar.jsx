import Link from "next/link";

function NavBar() {
    return (
        <div className="flex flex-row justify-center gap-4 bg-gray-200 text-foreground p-4">
            <Link href="/" className="hover:bg-gray-300 p-2 rounded">
                Bank Accounts
            </Link>
            <Link href="/credit-cards" className="hover:bg-gray-300 p-2 rounded">
                Credit Cards
            </Link>
            <Link href="/subscriptions" className="hover:bg-gray-300 p-2 rounded">
                Subscriptions
            </Link>
            <Link href="/loans" className="hover:bg-gray-300 p-2 rounded">
                Loans
            </Link>
        </div>
    )
}

export default NavBar;