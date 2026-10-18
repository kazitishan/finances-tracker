"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";

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

function SubscriptionDropdown({ value, onChange, customLogo, onCustomLogoChange }) {
    return (
        <LogoDropdown
            options={subscriptions}
            value={value}
            onChange={onChange}
            customLogo={customLogo}
            onCustomLogoChange={onCustomLogoChange}
            placeholder="Select a subscription"
            searchPlaceholder="Search subscriptions..."
            namePlaceholder="Enter subscription name"
        />
    );
}

export default SubscriptionDropdown;
