"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export const subscriptions = [
    {
        name: 'Amazon Prime',
        image: '/subscriptions/amazon.png',
    },
    {
        name: 'Apple Music',
        image: '/subscriptions/apple-music.png',
    },
    {
        name: 'Apple TV',
        image: '/subscriptions/apple-tv.png',
    },
    {
        name: 'Apple',
        image: '/subscriptions/apple.png',
    },
    {
        name: 'Amazon Web Services (AWS)',
        image: '/subscriptions/aws.png',
    },
    {
        name: 'Claude',
        image: '/subscriptions/claude.png',
    },
    {
        name: 'Crunchyroll',
        image: '/subscriptions/crunchyroll.png',
    },
    {
        name: 'Cursor',
        image: '/subscriptions/cursor.png',
    },
    {
        name: 'Disney+',
        image: '/subscriptions/disney.png',
    },
    {
        name: 'Google',
        image: '/subscriptions/google.png',
    },
    {
        name: 'HBO Max',
        image: '/subscriptions/hbo.png',
    },
    {
        name: 'Hulu',
        image: '/subscriptions/hulu.png',
    },
    {
        name: 'iCloud',
        image: '/subscriptions/icloud.png',
    },
    {
        name: 'Netflix',
        image: '/subscriptions/netflix.png',
    },
    {
        name: 'OpenAI',
        image: '/subscriptions/openai.png',
    },
    {
        name: 'Paramount+',
        image: '/subscriptions/paramount.png',
    },
    {
        name: 'Peacock',
        image: '/subscriptions/peacock.png',
    },
    {
        name: 'Spotify',
        image: '/subscriptions/spotify.png',
    },
    {
        name: 'Vercel',
        image: '/subscriptions/vercel.png',
    },
    {
        name: 'YouTube',
        image: '/subscriptions/youtube.png',
    },
];

function SubscriptionDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    function closeDropdown() {
        setOpen(false);
        setSearch("");
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                closeDropdown();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) {
            searchInputRef.current?.focus();
        }
    }, [open]);

    const selectedSubscription = subscriptions.find((subscription) => subscription.name === value);
    const filteredSubscriptions = subscriptions.filter((subscription) =>
        subscription.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => (open ? closeDropdown() : setOpen(true))}
                className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg p-2 bg-white cursor-pointer"
            >
                <span className="flex items-center gap-2">
                    {selectedSubscription && (
                        <Image
                            src={selectedSubscription.image}
                            alt={selectedSubscription.name}
                            width={20}
                            height={20}
                            className="object-contain"
                        />
                    )}
                    <span className={selectedSubscription ? "" : "text-gray-400"}>
                        {selectedSubscription ? selectedSubscription.name : "Select a subscription"}
                    </span>
                </span>
                <span className="text-gray-400">▾</span>
            </button>

            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-200">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search subscriptions..."
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto">
                        {filteredSubscriptions.length > 0 ? (
                            filteredSubscriptions.map((subscription) => (
                                <li key={subscription.name}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(subscription.name);
                                            closeDropdown();
                                        }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-left"
                                    >
                                        <Image
                                            src={subscription.image}
                                            alt={subscription.name}
                                            width={20}
                                            height={20}
                                            className="object-contain"
                                        />
                                        {subscription.name}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-sm text-gray-400">No subscriptions found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default SubscriptionDropdown;
