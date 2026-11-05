"use client";

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NamePromptModal from "@/components/modals/NamePromptModal";
import ProfilePicker from "@/components/ProfilePicker";
import { useToast } from "@/components/ToastProvider";

const ProfileContext = createContext({
    profile: undefined,
    saveProfile: async () => {},
    createProfile: async () => {},
    signIn: async () => {},
    signOut: async () => {},
    deleteProfile: async () => {},
});

async function fetchProfile() {
    const res = await fetch("/api/profile");
    if (!res.ok) throw new Error(`Couldn't load profile: ${res.status}`);
    return res.json();
}

async function sendProfileRequest(url, method, body) {
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body && JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Couldn't ${method} ${url}: ${res.status}`);
    return res.json();
}

// `profile` is the signed-in { name, id, current }: undefined until it loads, null when no one is signed in.
// `saveProfile({ name })` renames it, `createProfile(name)` adds a profile and signs in to it, `signIn(id)` switches
// to another, `signOut()` signs out and `deleteProfile(name)` deletes the signed-in profile (`name` must match its
// name) and signs out. Each returns the new profile (or nothing, for signOut and deleteProfile), or throws.
export function useProfile() {
    return useContext(ProfileContext);
}

// Shows the page once the profile has loaded, keyed by the profile's id so switching profiles remounts it and it
// fetches the new profile's info. With no one signed in, it shows the ProfilePicker instead.
export function ProfileGate({ children }) {
    const { profile } = useProfile();
    if (profile === null) return <ProfilePicker />;
    return profile ? <Fragment key={profile.id}>{children}</Fragment> : null;
}

// Loads the signed-in profile for every page. With no one signed in, every URL goes to "/", where ProfileGate shows
// the ProfilePicker. While the profile has no name, a popup that can't be dismissed asks for one.
function ProfileProvider({ children }) {
    const [profile, setProfile] = useState(undefined);
    const pathname = usePathname();
    const router = useRouter();
    const showToast = useToast();

    useEffect(() => {
        fetchProfile()
            .then(setProfile)
            .catch(() => showToast("Couldn't load your profile"));
        // Signing in or out in another tab changes the profile for this one too, so check again on focus.
        function handleFocus() {
            fetchProfile().then(setProfile).catch(() => {});
        }
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [showToast]);

    useEffect(() => {
        if (profile === null && pathname !== "/") router.replace("/");
    }, [profile, pathname, router]);

    const saveProfile = useCallback(async (updates) => {
        const saved = await sendProfileRequest("/api/profile", "PUT", updates);
        setProfile(saved);
        return saved;
    }, []);

    const createProfile = useCallback(async (name) => {
        const created = await sendProfileRequest("/api/profiles", "POST", { name });
        setProfile(created);
        return created;
    }, []);

    const signIn = useCallback(async (id) => {
        const signedIn = await sendProfileRequest("/api/profiles/current", "PUT", { id });
        setProfile(signedIn);
        return signedIn;
    }, []);

    const signOut = useCallback(async () => {
        await sendProfileRequest("/api/profiles/current", "DELETE");
        setProfile(null);
    }, []);

    const deleteProfile = useCallback(async (name) => {
        await sendProfileRequest("/api/profile", "DELETE", { name });
        setProfile(null);
    }, []);

    const value = useMemo(
        () => ({ profile, saveProfile, createProfile, signIn, signOut, deleteProfile }),
        [profile, saveProfile, createProfile, signIn, signOut, deleteProfile]
    );

    return (
        <ProfileContext.Provider value={value}>
            {children}
            {profile && !profile.name && <NamePromptModal onSave={saveProfile} />}
        </ProfileContext.Provider>
    );
}

export default ProfileProvider;
